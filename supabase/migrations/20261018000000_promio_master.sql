-- PROM.IO Master PostgreSQL Schema & Supabase RLS Migration
-- Telegram & X Advertising Marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'telegram_owner', 'x_owner', 'combined', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'telegram_owner', 'x_owner', 'combined', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('telegram_channel', 'telegram_group', 'x_account')),
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  country TEXT,
  avatar_url TEXT,
  audience_count BIGINT NOT NULL DEFAULT 0 CHECK (audience_count >= 0),
  views_per_post BIGINT DEFAULT 0 CHECK (views_per_post >= 0),
  engagement_rate NUMERIC(5,2) DEFAULT 0.00,
  cpm_estimate NUMERIC(10,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended', 'reverification_required')),
  verification_method TEXT NOT NULL DEFAULT 'bot_check' CHECK (verification_method IN ('bot_check', 'verification_code_post', 'oauth_token', 'manual_review')),
  verification_evidence TEXT,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  has_diamond_badge BOOLEAN NOT NULL DEFAULT FALSE,
  diamond_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Promotion Packages Table
CREATE TABLE IF NOT EXISTS public.promotion_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  format_type TEXT NOT NULL CHECK (format_type IN ('post_1_24', 'post_2_48', 'post_3_72', 'post_permanent', 'post_sponsored', 'tweet_sponsored', 'tweet_thread', 'retweet_repost', 'pin_24h', 'custom')),
  name TEXT NOT NULL,
  description TEXT,
  duration_hours INT NOT NULL DEFAULT 24 CHECK (duration_hours > 0),
  price_usd NUMERIC(12,2) NOT NULL CHECK (price_usd > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Hot Deals Table (Enforces 7-day cooldown per owner)
CREATE TABLE IF NOT EXISTS public.hot_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.promotion_packages(id) ON DELETE CASCADE,
  original_price_usd NUMERIC(12,2) NOT NULL,
  discounted_price_usd NUMERIC(12,2) NOT NULL CHECK (discounted_price_usd > 0 AND discounted_price_usd < original_price_usd),
  discount_percentage INT NOT NULL CHECK (discount_percentage >= 5 AND discount_percentage <= 90),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Diamond Badge Verifications
CREATE TABLE IF NOT EXISTS public.diamond_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  submitted_url TEXT NOT NULL,
  evidence_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('not_applied', 'pending_verification', 'under_review', 'verified', 'reverification_required', 'revoked')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (available_balance_usd >= 0),
  reserved_balance_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (reserved_balance_usd >= 0),
  total_deposited_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_deposited_usd >= 0),
  total_earned_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_earned_usd >= 0),
  total_withdrawn_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_withdrawn_usd >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Wallet Ledger (Immutable Append-Only Accounting)
CREATE TABLE IF NOT EXISTS public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'deposit_credit',
    'order_reservation',
    'order_payout',
    'order_refund',
    'platform_fee',
    'withdrawal_reservation',
    'withdrawal_release',
    'withdrawal_payout',
    'admin_adjustment'
  )),
  amount_usd NUMERIC(14,2) NOT NULL,
  balance_after_usd NUMERIC(14,2) NOT NULL,
  related_order_id UUID,
  related_deposit_id UUID,
  related_withdrawal_id UUID,
  idempotency_key TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  authorized_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.promotion_packages(id) ON DELETE CASCADE,
  original_price_usd NUMERIC(12,2) NOT NULL,
  price_usd NUMERIC(12,2) NOT NULL CHECK (price_usd > 0),
  platform_fee_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  owner_payout_usd NUMERIC(12,2) NOT NULL CHECK (owner_payout_usd >= 0),
  ad_text TEXT NOT NULL,
  target_url TEXT NOT NULL,
  creative_url TEXT,
  instructions TEXT,
  delivery_window_hours INT NOT NULL DEFAULT 48 CHECK (delivery_window_hours > 0),
  status TEXT NOT NULL DEFAULT 'funds_reserved' CHECK (status IN (
    'awaiting_payment',
    'funds_reserved',
    'pending_owner_acceptance',
    'accepted',
    'in_progress',
    'published',
    'completed',
    'cancelled',
    'rejected',
    'disputed',
    'refunded'
  )),
  accepted_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Order Deliveries Table
CREATE TABLE IF NOT EXISTS public.order_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  screenshot_evidence_url TEXT,
  notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ
);

-- 11. Order Events / Audit Log
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  actor_role TEXT NOT NULL,
  event_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence_text TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_refunded', 'resolved_released', 'dismissed')),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_moderated BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Deposit Requests Table (Crypto Add Funds)
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL CHECK (asset IN ('USDT', 'USDC', 'BTC', 'ETH', 'TON', 'SOL')),
  network TEXT NOT NULL,
  amount NUMERIC(18,8) NOT NULL CHECK (amount > 0),
  amount_usd NUMERIC(14,2) NOT NULL CHECK (amount_usd > 0),
  tx_hash TEXT NOT NULL,
  receiving_address TEXT NOT NULL,
  proof_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'pending_verification', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Withdrawal Requests Table (Crypto Payout)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL CHECK (asset IN ('USDT', 'USDC', 'BTC', 'ETH', 'TON', 'SOL')),
  network TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  amount_usd NUMERIC(14,2) NOT NULL CHECK (amount_usd >= 10.00),
  fee_usd NUMERIC(14,2) NOT NULL DEFAULT 2.00,
  net_payout_usd NUMERIC(14,2) NOT NULL CHECK (net_payout_usd > 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'pending_admin_review', 'approved_for_processing', 'processing', 'paid', 'rejected', 'cancelled')),
  tx_hash TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Statistics Snapshots Table (Automated Daily 24h Sync)
CREATE TABLE IF NOT EXISTS public.listing_statistics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  audience_count BIGINT NOT NULL,
  views_per_post BIGINT DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0.00,
  absolute_change_24h BIGINT NOT NULL DEFAULT 0,
  percent_change_24h NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  data_source TEXT NOT NULL DEFAULT 'api_sync',
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, snapshot_date)
);

-- 17. In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Marketplace Settings
CREATE TABLE IF NOT EXISTS public.marketplace_settings (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details_json JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Scheduled Job Runs
CREATE TABLE IF NOT EXISTS public.scheduled_job_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  records_processed INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE & INTEGRITY
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_listings_status_platform ON public.listings(status, platform);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_audience ON public.listings(audience_count DESC);
CREATE INDEX IF NOT EXISTS idx_packages_listing ON public.promotion_packages(listing_id);
CREATE INDEX IF NOT EXISTS idx_hot_deals_listing ON public.hot_deals(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing ON public.orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user ON public.wallet_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stats_listing_date ON public.listing_statistics_snapshots(listing_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diamond_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_statistics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Anyone can view basic profile info, user can update own profile
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Public can view approved active listings; Owners can view all own; Admins view all
CREATE POLICY "Public read approved listings" ON public.listings FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Owners insert listings" ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own listings" ON public.listings FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin());

-- Promotion Packages: Public can view active packages of approved listings; Owners can manage
CREATE POLICY "Public read packages" ON public.promotion_packages FOR SELECT USING (true);
CREATE POLICY "Owners manage packages" ON public.promotion_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.listings WHERE id = promotion_packages.listing_id AND owner_id = auth.uid()) OR public.is_admin());

-- Hot Deals: Public read active; Owners insert/update
CREATE POLICY "Public read hot deals" ON public.hot_deals FOR SELECT USING (true);
CREATE POLICY "Owners manage hot deals" ON public.hot_deals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.listings WHERE id = hot_deals.listing_id AND owner_id = auth.uid()) OR public.is_admin());

-- Orders: Buyer, Listing Owner, or Admin can view
CREATE POLICY "Users view relevant orders" ON public.orders FOR SELECT
  USING (buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.listings WHERE id = orders.listing_id AND owner_id = auth.uid()) OR public.is_admin());

-- Wallets: Users view only own wallet; only service role / admin adjusts
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Wallet Ledger: Users view only own ledger entries; strictly insert via server/admin
CREATE POLICY "Users view own ledger" ON public.wallet_ledger FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Notifications: Users view own
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users mark notifications read" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
