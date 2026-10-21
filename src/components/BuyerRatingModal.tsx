import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Order, SatisfactionLevel } from '../types';

interface BuyerRatingModalProps {
  order: Order;
  onClose: () => void;
  onSuccess?: () => void;
}

const SATISFACTION_METRICS: { rating: number; label: SatisfactionLevel; desc: string }[] = [
  { rating: 1, label: 'Very dissatisfied', desc: 'Did not deliver as promised, poor reach, or severe issues.' },
  { rating: 2, label: 'Dissatisfied', desc: 'Subpar placement timing, altered copy, or minimal engagement.' },
  { rating: 3, label: 'Average', desc: 'Standard delivery as described, average conversion and reach.' },
  { rating: 4, label: 'Satisfied', desc: 'Good timing, attentive owner, solid audience engagement.' },
  { rating: 5, label: 'Very satisfied', desc: 'Exceptional reach, prompt publication, outstanding conversion.' },
];

export const BuyerRatingModal: React.FC<BuyerRatingModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  const { currentUser, submitReview, canRateOrder } = useAppStore();

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validation = canRateOrder(order.id);
  const activeRating = hoveredRating !== null ? hoveredRating : selectedRating;
  const activeMetric = SATISFACTION_METRICS.find((m) => m.rating === activeRating) || SATISFACTION_METRICS[4];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please click on a star to select a rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    try {
      submitReview(order.id, selectedRating, reviewText);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 bg-amber-950/70 border border-amber-900/60 px-2 py-0.5 rounded">
                Verified Buyer Rating
              </span>
              <span className="text-xs text-slate-400">{order.listingPlatform.replace('_', ' ')}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Rate Your Experience with {order.listingName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Verification Context Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 my-4 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Order {order.orderNumber}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Delivery</span>
            </span>
          </div>
          <div className="text-slate-400 flex flex-wrap items-center gap-2">
            <span>Package: <strong className="text-slate-300">{order.packageName}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Amount: <strong className="text-white tabular-nums">${order.priceUsd.toFixed(2)} USD</strong></span>
          </div>
          {order.publicationUrl && (
            <div className="pt-1 text-[11px]">
              <a
                href={order.publicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Inspect verified publication link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Success Confirmation Screen */}
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Satisfaction Rating Submitted!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you for providing honest feedback. Your verified rating has been published and the channel's average score has been recalculated.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Rating Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {!validation.canRate && (
              <div className="bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{validation.reason}</div>
              </div>
            )}

            {/* Clickable 5 Stars with Interactive Preview */}
            <div className="bg-[#0e1424] border border-blue-950/80 rounded-xl p-5 text-center space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Your Satisfaction Rating
              </label>

              {/* Star buttons */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isHighlighted = starVal <= activeRating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setSelectedRating(starVal)}
                      onMouseEnter={() => setHoveredRating(starVal)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 rounded-lg focus:outline-none hover:scale-110 active:scale-95 transition-all"
                      aria-label={`Rate ${starVal} of 5 stars`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          isHighlighted
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                            : 'text-slate-700 fill-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Satisfaction Tier Label & Description */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <span className="text-amber-400">
                    {'⭐'.repeat(activeMetric.rating)}
                  </span>
                  <span>
                    {activeMetric.rating} — {activeMetric.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {activeMetric.desc}
                </p>
              </div>
            </div>

            {/* Optional Written Review */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Written Review / Audience Feedback</span>
                </label>
                <span className="text-[11px] text-slate-500">Optional</span>
              </div>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share helpful details for other advertisers: impressions generated, click-through, owner responsiveness, placement duration..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                maxLength={800}
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Fairness Policy: Real advertisers only, moderated for spam</span>
                <span>{reviewText.length}/800</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !validation.canRate}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-amber-600/20"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{isSubmitting ? 'Recording Rating...' : 'Submit Satisfaction Rating'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
