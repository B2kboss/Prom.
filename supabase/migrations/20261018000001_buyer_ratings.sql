-- PROM.IO Buyer Satisfaction & Rating System Migration
-- Migration: 20261018000001_buyer_ratings.sql

-- 1. Create or alter reviews table with comprehensive satisfaction fields
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  satisfaction_label TEXT NOT NULL CHECK (satisfaction_label IN (
    'Very dissatisfied',
    'Dissatisfied',
    'Average',
    'Satisfied',
    'Very satisfied'
  )),
  review_text TEXT,
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  report_reason TEXT,
  reported_at TIMESTAMPTZ,
  is_moderated BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  moderated_by UUID REFERENCES public.profiles(id),
  moderated_at TIMESTAMPTZ,
  moderation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure indexes for querying reviews
CREATE INDEX IF NOT EXISTS idx_reviews_listing_visible ON public.reviews(listing_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON public.reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reported ON public.reviews(is_reported) WHERE is_reported = true;

-- 2. Review Audit Logs Table for administrative actions
CREATE TABLE IF NOT EXISTS public.review_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'hide', 'unhide', 'delete')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_audit_review ON public.review_audit_logs(review_id);

-- 3. Stored Procedure & Trigger to Automatically Recalculate Listing Rating
CREATE OR REPLACE FUNCTION public.recalculate_listing_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_listing_id UUID;
  new_avg NUMERIC(3,2);
  new_count INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_listing_id := OLD.listing_id;
  ELSE
    target_listing_id := NEW.listing_id;
  END IF;

  -- Only count visible and moderated reviews
  SELECT 
    COALESCE(ROUND(AVG(rating), 1), 0.0),
    COUNT(*)
  INTO new_avg, new_count
  FROM public.reviews
  WHERE listing_id = target_listing_id AND is_visible = TRUE;

  UPDATE public.listings
  SET 
    rating = new_avg,
    review_count = new_count,
    updated_at = NOW()
  WHERE id = target_listing_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS trg_recalculate_listing_rating ON public.reviews;
CREATE TRIGGER trg_recalculate_listing_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_listing_rating();

-- 4. Server-Side Validation: Ensure Order is Completed & Reviewer is the Actual Buyer
CREATE OR REPLACE FUNCTION public.validate_review_submission()
RETURNS TRIGGER AS $$
DECLARE
  order_rec RECORD;
  listing_owner_id UUID;
BEGIN
  -- Fetch the order record
  SELECT buyer_id, listing_id, status INTO order_rec
  FROM public.orders
  WHERE id = NEW.order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated order does not exist.';
  END IF;

  -- Ensure order is actually completed
  IF order_rec.status != 'completed' THEN
    RAISE EXCEPTION 'Ratings can only be submitted after the promotion order is verified and completed.';
  END IF;

  -- Ensure reviewer is the buyer who paid for the order
  IF order_rec.buyer_id != NEW.buyer_id THEN
    RAISE EXCEPTION 'Only the actual buyer of this completed order can submit a rating.';
  END IF;

  -- Ensure channel owner cannot rate their own listing
  SELECT owner_id INTO listing_owner_id
  FROM public.listings
  WHERE id = NEW.listing_id;

  IF listing_owner_id = NEW.buyer_id THEN
    RAISE EXCEPTION 'Channel owners cannot submit ratings for their own listings.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_review_submission ON public.reviews;
CREATE TRIGGER trg_validate_review_submission
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review_submission();

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can view visible reviews; Admins & Authors can view all their reviews
CREATE POLICY "Public read visible reviews" ON public.reviews FOR SELECT
  USING (is_visible = TRUE OR buyer_id = auth.uid() OR public.is_admin());

-- Only authorized buyers can insert a review (enforced by trigger & RLS)
CREATE POLICY "Buyers insert own order review" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Admins can update reviews (for moderation / hide / restore)
CREATE POLICY "Admins moderate reviews" ON public.reviews FOR UPDATE
  USING (public.is_admin());

-- Review Audit Logs: Admins only
CREATE POLICY "Admins view review audit logs" ON public.review_audit_logs FOR SELECT
  USING (public.is_admin());
CREATE POLICY "Admins create review audit logs" ON public.review_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());
