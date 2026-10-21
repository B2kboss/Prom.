import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  Star, 
  Clock, 
  TrendingUp, 
  Eye, 
  Users, 
  Info,
  DollarSign,
  Flag,
  X
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { PromotionPackage } from '../types';
import { AudienceChart } from './AudienceChart';

interface ListingDetailViewProps {
  listingId: string;
  onBack: () => void;
  onBookPackage: (packageId: string) => void;
}

export const ListingDetailView: React.FC<ListingDetailViewProps> = ({
  listingId,
  onBack,
  onBookPackage,
}) => {
  const { state, getListingReviewBreakdown, reportReview } = useAppStore();
  const listing = state.listings.find((l) => l.id === listingId);
  const snapshots = state.snapshots[listingId] || [];
  const reviewBreakdown = getListingReviewBreakdown(listingId);
  const reviews = reviewBreakdown.reviews;

  const [activeChartMetric, setActiveChartMetric] = useState<'subscribers' | 'views'>('subscribers');
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReasonInput, setReportReasonInput] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-400">Listing not found or moderation pending.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const hasActiveDeal = listing.activeHotDeal && listing.activeHotDeal.status === 'active';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
        >
          <span>Open Public Channel</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Hero Header Box */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={listing.avatarUrl}
              alt={listing.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-700 bg-slate-800 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {listing.name}
                </h1>
                {listing.hasDiamondBadge && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PROM.IO Diamond</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-slate-300">@{listing.username}</span>
                <span aria-hidden="true">·</span>
                <span>{listing.category}</span>
                <span aria-hidden="true">·</span>
                <span>{listing.language}</span>
                {listing.country && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{listing.country}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Ownership ({listing.verificationMethod.replace('_', ' ')})</span>
                </div>
                {listing.rating > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-white">{listing.rating}</span>
                      <span className="text-slate-500">({listing.reviewCount} reviews)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
            <div className="px-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                {listing.platform === 'x_account' ? 'Followers' : 'Subscribers'}
              </div>
              <div className="text-lg font-bold text-white tabular-nums mt-0.5">
                {listing.audienceCount.toLocaleString()}
              </div>
            </div>

            <div className="px-3 border-l border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg. Views</div>
              <div className="text-lg font-bold text-white tabular-nums mt-0.5">
                {listing.viewsPerPost.toLocaleString()}
              </div>
            </div>

            <div className="px-3 border-l border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Engagement</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                {listing.engagementRate}%
              </div>
            </div>

            <div className="px-3 border-l border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Est. CPM</div>
              <div className="text-lg font-bold text-white tabular-nums mt-0.5">
                ${listing.cpmEstimate}
              </div>
            </div>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
          {listing.description}
        </p>

        {/* Exclusive Diamond Badge Info Box if active */}
        {listing.hasDiamondBadge && (
          <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-xl p-4 flex items-start gap-3 text-xs text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Exclusive Diamond Verification:</span> The channel owner has placed PROM.IO's official booking link in their public channel description/bio. All advertising placements are covered under PROM.IO's priority delivery guarantee.
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Split: Audience Chart & Available Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Statistics Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Audience Growth & Stability</h2>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveChartMetric('subscribers')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeChartMetric === 'subscribers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Audience Size
                </button>
                <button
                  onClick={() => setActiveChartMetric('views')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeChartMetric === 'views' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Post Views
                </button>
              </div>
            </div>

            <AudienceChart
              snapshots={snapshots}
              title={listing.name}
              metricType={activeChartMetric}
            />
          </div>

          {/* Verification Evidence Card */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Listing Moderation & Integrity</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {listing.verificationEvidence || 'Verified by PROM.IO administration through automated channel bot handshake and proof of ownership.'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
              <span>Owner Response Rate: <strong className="text-white">{listing.responseRatePercent}%</strong></span>
              <span aria-hidden="true">·</span>
              <span>Delivered Promotions: <strong className="text-white">{listing.completedOrdersCount}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Daily API Sync: <strong className="text-emerald-400">Active</strong></span>
            </div>
          </div>

          {/* Verified Buyer Satisfaction & Reviews Section */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Buyer Satisfaction & Ratings</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real feedback from verified advertisers who completed escrow promotions.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-white tabular-nums">
                  {listing.rating > 0 ? listing.rating.toFixed(1) : 'New'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {reviewBreakdown.total} verified {reviewBreakdown.total === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            {/* Rating Breakdown Bar Chart */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="sm:col-span-4 text-center sm:text-left sm:border-r sm:border-slate-800 sm:pr-4">
                <div className="text-3xl font-black text-white tabular-nums">
                  {listing.rating > 0 ? listing.rating.toFixed(1) : '—'}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(listing.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-300">
                  {listing.rating >= 4.5 ? 'Very satisfied overall' : listing.rating >= 4.0 ? 'Satisfied overall' : 'No ratings yet'}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const pct = reviewBreakdown.percentages[stars] || 0;
                  const count = reviewBreakdown.counts[stars] || 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12 text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {stars} stars
                      </span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-[11px] text-slate-400 text-right shrink-0 tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {reportSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center justify-between">
                <span>{reportSuccess}</span>
                <button onClick={() => setReportSuccess(null)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Individual Reviews List */}
            {reviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No reviews yet for this channel. Verified ratings are unlocked once an advertiser verifies delivery.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{rev.buyerName}</span>
                        <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
                          {rev.rating} — {rev.satisfactionLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
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
                          setReportReasonInput('');
                        }}
                        className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px]"
                        title="Report review to moderation"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal to Report Review */}
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
                  Please provide a specific reason if this review violates PROM.IO terms, contains abusive language, or represents fake feedback.
                </p>

                <textarea
                  rows={3}
                  value={reportReasonInput}
                  onChange={(e) => setReportReasonInput(e.target.value)}
                  placeholder="Explain why this review should be moderated..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
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
                      if (!reportReasonInput.trim()) {
                        alert('Please enter a reason for reporting.');
                        return;
                      }
                      reportReview(reportingReviewId, reportReasonInput.trim());
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

        {/* Right Column (5 cols): Available Packages & Purchase module */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Select Promotion Format</h2>
            <span className="text-xs text-slate-400">100% Escrow Protected</span>
          </div>

          {/* Hot Deal Callout */}
          {hasActiveDeal && listing.activeHotDeal && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div>Hot Deal Active: {listing.activeHotDeal.discountPercentage}% Discount</div>
                  <div className="text-[11px] text-amber-200/70 font-normal">
                    Expires {new Date(listing.activeHotDeal.endTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-900/60 px-2 py-1 rounded">
                Save ${listing.activeHotDeal.originalPriceUsd - listing.activeHotDeal.discountedPriceUsd}
              </span>
            </div>
          )}

          {/* Package Cards List */}
          <div className="space-y-3">
            {listing.packages.map((pkg) => {
              const isDealPackage = hasActiveDeal && listing.activeHotDeal?.packageId === pkg.id;
              const effectivePrice = isDealPackage 
                ? listing.activeHotDeal!.discountedPriceUsd 
                : pkg.priceUsd;

              return (
                <div
                  key={pkg.id}
                  className={`bg-[#0b0f19] border rounded-xl p-4 transition-all space-y-3 ${
                    isDealPackage 
                      ? 'border-amber-600/60 shadow-sm shadow-amber-950/30' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                        {isDealPackage && (
                          <span className="text-[10px] font-semibold text-amber-300 bg-amber-950 border border-amber-800 px-1.5 py-0.2 rounded">
                            HOT DEAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {isDealPackage ? (
                        <>
                          <div className="text-lg font-extrabold text-white tabular-nums">
                            ${effectivePrice}
                          </div>
                          <div className="text-xs text-slate-500 line-through tabular-nums">
                            ${pkg.priceUsd}
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-extrabold text-white tabular-nums">
                          ${pkg.priceUsd}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500">USD</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{pkg.durationHours >= 8760 ? 'Permanent' : `${pkg.durationHours}h placement`}</span>
                    </div>

                    <button
                      onClick={() => onBookPackage(pkg.id)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                    >
                      Book Promotion
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
