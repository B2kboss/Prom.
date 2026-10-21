import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Flag, 
  AlertCircle, 
  X, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Order, SatisfactionLevel } from '../types';

interface ListingReviewSystemProps {
  listingId: string;
}

const SATISFACTION_METRICS: { rating: number; label: SatisfactionLevel; desc: string }[] = [
  { rating: 1, label: 'Very dissatisfied', desc: 'Did not deliver as promised or poor reach.' },
  { rating: 2, label: 'Dissatisfied', desc: 'Subpar placement timing or low engagement.' },
  { rating: 3, label: 'Average', desc: 'Standard delivery as described, average reach.' },
  { rating: 4, label: 'Satisfied', desc: 'Good timing, attentive owner, solid audience conversion.' },
  { rating: 5, label: 'Very satisfied', desc: 'Exceptional reach, instant delivery, outstanding conversion.' },
];

export const ListingReviewSystem: React.FC<ListingReviewSystemProps> = ({ listingId }) => {
  const { 
    currentUser, 
    getListingReviewBreakdown, 
    getCompletedOrdersForListing, 
    getEligibleOrdersToRate, 
    simulateCompleteOrder, 
    submitReview, 
    reportReview 
  } = useAppStore();

  const breakdown = getListingReviewBreakdown(listingId);
  const completedOrders = getCompletedOrdersForListing(listingId);
  const eligibleOrders = getEligibleOrdersToRate(listingId);

  // Review Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    eligibleOrders[0]?.id || completedOrders[0]?.id || ''
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Review Reporting State
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Filters
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const activeMetric = SATISFACTION_METRICS.find((m) => m.rating === activeRating) || SATISFACTION_METRICS[4];

  // Filter reviews
  let filteredReviews = breakdown.reviews.filter((r) => {
    if (starFilter === 'all') return true;
    return r.rating === starFilter;
  });

  // Sort reviews
  filteredReviews.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const orderToRate = selectedOrderId || eligibleOrders[0]?.id;
    if (!orderToRate) {
      setSubmitError('Please select a completed order to rate.');
      return;
    }

    setIsSubmitting(true);
    try {
      submitReview(orderToRate, rating, reviewText);
      setSubmitSuccess('Your verified rating and feedback have been published!');
      setReviewText('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestCompleteOrder = () => {
    try {
      const newOrder = simulateCompleteOrder(listingId);
      setSelectedOrderId(newOrder.id);
      setSubmitSuccess(`Simulated Order #${newOrder.orderNumber} created with 'completed' status! You can now rate it below.`);
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-7 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Verified Buyer Ratings & Reviews</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Escrow Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authentic feedback from advertisers after their promotions reached 'completed' status.
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
              {breakdown.avg > 0 ? breakdown.avg.toFixed(1) : '5.0'}
            </div>
            <div className="text-[11px] text-slate-400">
              {breakdown.total} verified {breakdown.total === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#0e1424] p-5 rounded-xl border border-slate-800/90">
        <div className="md:col-span-4 text-center md:text-left md:border-r md:border-slate-800 md:pr-6 space-y-2">
          <div className="text-4xl font-extrabold text-white tabular-nums">
            {breakdown.avg > 0 ? breakdown.avg.toFixed(1) : '5.0'}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(breakdown.avg || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
              />
            ))}
          </div>
          <div className="text-xs font-semibold text-slate-300">
            {breakdown.avg >= 4.5 ? 'Very satisfied overall' : breakdown.avg >= 4.0 ? 'Satisfied overall' : 'Solid performance'}
          </div>
          <div className="text-[11px] text-slate-500">
            100% verified advertisers with confirmed delivery
          </div>
        </div>

        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = breakdown.counts[stars] || 0;
            const pct = breakdown.percentages[stars] || 0;
            return (
              <div 
                key={stars} 
                onClick={() => setStarFilter(starFilter === stars ? 'all' : stars)}
                className="flex items-center gap-3 text-xs cursor-pointer group"
              >
                <div className="w-14 text-[11px] text-slate-400 group-hover:text-amber-300 flex items-center gap-1 shrink-0 tabular-nums">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-[11px] text-slate-400 group-hover:text-white text-right shrink-0 tabular-nums">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPLETED ORDER RATING SUBMISSION SECTION */}
      <div className="bg-gradient-to-br from-[#10172a] to-[#0c1120] border border-blue-900/40 rounded-xl p-5 sm:p-6 space-y-4 shadow-lg">
        {eligibleOrders.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold pb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>You completed a promotion on this channel! Leave your verified feedback.</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Your rating directly helps other advertisers make informed placement decisions.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Order Selection if multiple */}
              {eligibleOrders.length > 1 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Select Completed Promotion Order
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-[#0a0d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {eligibleOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.orderNumber} — {ord.packageName} (${ord.priceUsd})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Interactive Star Rating */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-2">
                  Overall Advertiser Satisfaction
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 p-2 bg-[#080b12] border border-slate-800 rounded-xl">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= activeRating;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(starVal)}
                          className="p-1 hover:scale-125 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-700 hover:text-slate-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs">
                    <span className="font-bold text-white mr-1.5">{activeRating}.0</span>
                    <span className="font-semibold text-blue-300">{activeMetric.label}</span>
                    <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                      — {activeMetric.desc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Written Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Describe your promotion results (reach, conversions, owner communication, timeliness)..."
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {submitError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Reviews are permanently linked to your verified escrow transaction.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Submit Verified Review'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Buyer Protection Guarantee</span>
              </div>
              <p className="text-xs text-slate-400">
                Only advertisers with confirmed, completed escrow orders can submit ratings on PROM.IO.
              </p>
            </div>

            {/* Simulation test action for user convenience */}
            <button
              onClick={handleTestCompleteOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/80 transition-colors shrink-0"
              title="Instantly generate a completed demo order to test rating this channel"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulate Completed Order to Rate</span>
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS LIST CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Star filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStarFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              starFilter === 'all' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({breakdown.total})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                starFilter === s 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{s}</span>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] text-slate-400">({breakdown.counts[s] || 0})</span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {reportSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <span>{reportSuccess}</span>
          <button onClick={() => setReportSuccess(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* REVIEWS CARDS LIST */}
      {filteredReviews.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 space-y-2">
          <MessageSquare className="w-6 h-6 mx-auto text-slate-600" />
          <p>No reviews matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredReviews.map((rev) => {
            const isUserReview = rev.buyerId === currentUser.id;
            return (
              <div 
                key={rev.id} 
                className={`p-4 sm:p-5 rounded-xl border transition-all space-y-2.5 ${
                  isUserReview 
                    ? 'bg-blue-950/20 border-blue-800/60 shadow-sm' 
                    : 'bg-[#0d121f] border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {rev.buyerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{rev.buyerName}</span>
                        {isUserReview && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-600 text-white">
                            You
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
                          {rev.rating}.0 — {rev.satisfactionLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-400">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {rev.reviewText && (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                    "{rev.reviewText}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Escrow Order {rev.orderNumber || ''}</span>
                  </div>

                  <button
                    onClick={() => {
                      setReportingReviewId(rev.id);
                      setReportReason('');
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px]"
                    title="Report review to moderation"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPORT MODAL */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Report Review to Administration</span>
              </h4>
              <button onClick={() => setReportingReviewId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Please specify why this review should be inspected (e.g. abusive language, spam, or extortion).
            </p>

            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Explain the issue with this review..."
              className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReportingReviewId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reportReason.trim()) return;
                  reportReview(reportingReviewId, reportReason.trim());
                  setReportingReviewId(null);
                  setReportSuccess('Thank you. This review has been flagged and submitted to administrator moderation.');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
