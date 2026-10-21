import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Eye, 
  Users, 
  ShieldCheck, 
  ExternalLink, 
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Lock,
  Star
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { PlatformType, Listing } from '../types';

interface MarketplaceViewProps {
  initialPlatform?: PlatformType | 'all';
  filterHotDealsOnly?: boolean;
  onSelectListing: (listingId: string) => void;
  onNavigate: (view: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  initialPlatform = 'all',
  filterHotDealsOnly = false,
  onSelectListing,
  onNavigate,
}) => {
  const { state } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformType | 'all'>(initialPlatform);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hotDealsOnly, setHotDealsOnly] = useState<boolean>(filterHotDealsOnly);
  const [diamondOnly, setDiamondOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'audience_desc' | 'price_asc' | 'price_desc' | 'engagement_desc' | 'rating_desc'>('audience_desc');

  // Available unique categories from approved listings
  const categories = useMemo(() => {
    const set = new Set<string>();
    state.listings.forEach((l) => {
      if (l.status === 'approved') set.add(l.category);
    });
    return Array.from(set);
  }, [state.listings]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return state.listings
      .filter((l) => {
        // Only approved listings are publicly purchasable
        if (l.status !== 'approved') return false;

        // Platform filter
        if (platformFilter !== 'all' && l.platform !== platformFilter) return false;

        // Category filter
        if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;

        // Hot Deals filter
        if (hotDealsOnly && (!l.activeHotDeal || l.activeHotDeal.status !== 'active')) return false;

        // Diamond badge filter
        if (diamondOnly && !l.hasDiamondBadge) return false;

        // Rating filter
        if (minRating > 0 && l.rating < minRating) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = l.name.toLowerCase().includes(q);
          const matchUser = l.username.toLowerCase().includes(q);
          const matchDesc = l.description.toLowerCase().includes(q);
          const matchCat = l.category.toLowerCase().includes(q);
          if (!matchName && !matchUser && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getLowestPrice = (item: Listing) => {
          if (item.activeHotDeal && item.activeHotDeal.status === 'active') {
            return item.activeHotDeal.discountedPriceUsd;
          }
          if (!item.packages || item.packages.length === 0) return 999999;
          return Math.min(...item.packages.map((p) => p.priceUsd));
        };

        if (sortBy === 'rating_desc') {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        }
        if (sortBy === 'audience_desc') return b.audienceCount - a.audienceCount;
        if (sortBy === 'price_asc') return getLowestPrice(a) - getLowestPrice(b);
        if (sortBy === 'price_desc') return getLowestPrice(b) - getLowestPrice(a);
        if (sortBy === 'engagement_desc') return b.engagementRate - a.engagementRate;
        return 0;
      });
  }, [state.listings, platformFilter, selectedCategory, hotDealsOnly, diamondOnly, minRating, searchQuery, sortBy]);

  const getPlatformLabel = (p: PlatformType) => {
    switch (p) {
      case 'telegram_channel': return 'Telegram Channel';
      case 'telegram_group': return 'Telegram Group';
      case 'x_account': return 'X Account';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#0e172a] to-[#0a1120] border border-slate-800/90 p-6 sm:p-10 overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-900/40 px-3 py-1 rounded-md">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Escrow Protection · Guaranteed Ad Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance leading-tight">
            Direct Advertising on Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Telegram & X</span> Channels
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Discover vetted high-signal channels, compare live audience analytics refreshed every 24 hours, and deploy promotions with atomic crypto escrow.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Mandatory Admin Moderation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>USDT, USDC, BTC, ETH, TON, SOL Escrow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Automated 24h Statistical Verification</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#0b0f19] border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Row 1: Search and Platform segmented controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, topic, or keyword (e.g. crypto, ai, venture)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Platform Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0 overflow-x-auto">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                platformFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => setPlatformFilter('telegram_channel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                platformFilter === 'telegram_channel' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TG Channels
            </button>
            <button
              onClick={() => setPlatformFilter('telegram_group')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                platformFilter === 'telegram_group' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TG Groups
            </button>
            <button
              onClick={() => setPlatformFilter('x_account')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                platformFilter === 'x_account' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              X Accounts
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filters & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Categories and Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Hot Deals Toggle button */}
            <button
              onClick={() => setHotDealsOnly(!hotDealsOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hotDealsOnly 
                  ? 'bg-amber-950/60 border-amber-600/50 text-amber-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Hot Deals Only</span>
            </button>

            {/* Diamond Badge Toggle button */}
            <button
              onClick={() => setDiamondOnly(!diamondOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                diamondOnly 
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exclusive Diamond Only</span>
            </button>

            {/* Rating Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-slate-900">All Ratings</option>
                <option value={4.8} className="bg-slate-900">4.8+ Stars (Top Rated)</option>
                <option value={4.5} className="bg-slate-900">4.5+ Stars (High Satisfaction)</option>
                <option value={4.0} className="bg-slate-900">4.0+ Stars</option>
                <option value={3.0} className="bg-slate-900">3.0+ Stars</option>
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="audience_desc">Audience Size (High to Low)</option>
              <option value="rating_desc">Highest Rated ⭐</option>
              <option value="price_asc">Price: Lowest First</option>
              <option value="price_desc">Price: Highest First</option>
              <option value="engagement_desc">Highest Engagement Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-white tabular-nums">{filteredListings.length}</span> verified inventory listings
        </div>
        <div className="text-slate-500">
          Last synchronization: <span className="text-slate-400">Today at 00:00 UTC</span>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-white">No approved listings match your current filters</p>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search query, selecting "All Platforms", or clearing rating and category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('all');
              setSelectedCategory('all');
              setHotDealsOnly(false);
              setDiamondOnly(false);
              setMinRating(0);
            }}
            className="px-4 py-2 text-xs font-semibold text-blue-400 bg-blue-950/50 border border-blue-900/60 rounded-lg hover:bg-blue-900/50 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const lowestPrice = listing.packages.length > 0 
              ? Math.min(...listing.packages.map((p) => p.priceUsd))
              : 0;

            const hasActiveDeal = listing.activeHotDeal && listing.activeHotDeal.status === 'active';

            return (
              <div
                key={listing.id}
                className="group relative bg-[#0b0f19] hover:bg-[#0e1424] border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 transition-all flex flex-col justify-between shadow-sm"
              >
                {/* Top Card Section: Avatar & Identity */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.avatarUrl}
                        alt={listing.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 shrink-0 bg-slate-800"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
                            {listing.name}
                          </h3>
                        </div>

                        {/* Username & Platform */}
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-300">@{listing.username}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500">{getPlatformLabel(listing.platform)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Diamond Badge Status */}
                    {listing.hasDiamondBadge && (
                      <div 
                        className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-700/50 px-2 py-0.5 rounded"
                        title="PROM.IO Exclusive Diamond Partner — Verified listing URL in bio"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Diamond</span>
                      </div>
                    )}
                  </div>

                  {/* Clean unboxed metadata with dot separators (Zero-Pill Rule) */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-slate-300">{listing.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{listing.language}</span>
                    {listing.country && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{listing.country}</span>
                      </>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>

                  {/* Quantitative Stats Row */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-900/80 border border-slate-800/80 rounded-lg text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {listing.platform === 'x_account' ? 'Followers' : 'Subscribers'}
                      </div>
                      <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                        {listing.audienceCount >= 1000 
                          ? `${(listing.audienceCount / 1000).toFixed(1)}k` 
                          : listing.audienceCount}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg. Views</div>
                      <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                        {listing.viewsPerPost >= 1000 
                          ? `${(listing.viewsPerPost / 1000).toFixed(1)}k` 
                          : listing.viewsPerPost}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Engagement</div>
                      <div className="text-sm font-bold text-emerald-400 tabular-nums mt-0.5">
                        {listing.engagementRate}%
                      </div>
                    </div>
                  </div>

                  {/* Buyer Satisfaction Rating Strip */}
                  <div className="flex items-center justify-between text-xs py-1 px-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-white tabular-nums">
                          {listing.rating > 0 ? listing.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        ({listing.reviewCount} {listing.reviewCount === 1 ? 'verified review' : 'verified reviews'})
                      </span>
                    </div>

                    {listing.rating >= 4.8 && listing.reviewCount >= 1 ? (
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-1.5 py-0.2 rounded">
                        Top Rated
                      </span>
                    ) : listing.rating >= 4.0 && listing.reviewCount >= 1 ? (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                        High Satisfaction
                      </span>
                    ) : null}
                  </div>

                  {/* Hot Deal Banner if active */}
                  {hasActiveDeal && listing.activeHotDeal && (
                    <div className="flex items-center justify-between bg-amber-950/40 border border-amber-800/50 px-3 py-2 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hot Deal: {listing.activeHotDeal.discountPercentage}% OFF</span>
                      </div>
                      <span className="text-[11px] text-amber-200/80 tabular-nums">
                        Expires {new Date(listing.activeHotDeal.endTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer: Price & Action */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Placement From</div>
                    <div className="flex items-baseline gap-1.5">
                      {hasActiveDeal && listing.activeHotDeal ? (
                        <>
                          <span className="text-lg font-bold text-white tabular-nums">
                            ${listing.activeHotDeal.discountedPriceUsd}
                          </span>
                          <span className="text-xs text-slate-500 line-through tabular-nums">
                            ${listing.activeHotDeal.originalPriceUsd}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-white tabular-nums">
                          ${lowestPrice}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">USD</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectListing(listing.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
                  >
                    View Packages
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
