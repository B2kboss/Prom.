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
import { ListingReviewSystem } from './ListingReviewSystem';

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
          <ListingReviewSystem listingId={listingId} />
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
