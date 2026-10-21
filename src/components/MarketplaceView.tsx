import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Send, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Star, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Coins,
  Cpu,
  Gamepad2,
  Briefcase,
  Globe,
  Layers,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { PlatformType, Listing } from '../types';

interface MarketplaceViewProps {
  initialPlatform?: PlatformType | 'all';
  filterHotDealsOnly?: boolean;
  onSelectListing: (listingId: string) => void;
  onNavigate: (view: string) => void;
  onOpenCheckout?: (listing: Listing, packageId: string) => void;
}

const CATEGORY_ITEMS = [
  { id: 'Crypto', label: 'Crypto', icon: Coins },
  { id: 'NFT & Web3', label: 'NFT & Web3', icon: Sparkles },
  { id: 'Trading', label: 'Trading', icon: TrendingUp },
  { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'Business', label: 'Business', icon: Briefcase },
  { id: 'Technology', label: 'Technology', icon: Cpu },
  { id: 'News', label: 'News', icon: Globe },
  { id: 'Others', label: 'Others', icon: Layers },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  initialPlatform = 'all',
  filterHotDealsOnly = false,
  onSelectListing,
  onNavigate,
  onOpenCheckout,
}) => {
  const { state } = useAppStore();

  const [platformTab, setPlatformTab] = useState<PlatformType | 'all'>(initialPlatform);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getLowestPrice = (item: Listing): number => {
    if (item.activeHotDeal && item.activeHotDeal.status === 'active') {
      return item.activeHotDeal.discountedPriceUsd;
    }
    if (!item.packages || item.packages.length === 0) return 2.40;
    return Math.min(...item.packages.map((p) => p.priceUsd));
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return state.listings
      .filter((l) => {
        if (l.status !== 'approved') return false;

        // Platform Tab
        if (platformTab === 'telegram_channel' || platformTab === 'telegram_group') {
          if (l.platform !== 'telegram_channel' && l.platform !== 'telegram_group') return false;
        } else if (platformTab === 'x_account') {
          if (l.platform !== 'x_account') return false;
        }

        // Category
        if (selectedCategory !== 'all') {
          const matchCat = l.category.toLowerCase().includes(selectedCategory.toLowerCase());
          if (!matchCat) return false;
        }

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = l.name.toLowerCase().includes(q) ||
            l.username.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return getLowestPrice(a) - getLowestPrice(b);
        if (sortBy === 'price_high') return getLowestPrice(b) - getLowestPrice(a);
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default most popular
        return b.audienceCount - a.audienceCount;
      });
  }, [state.listings, platformTab, selectedCategory, sortBy, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ads Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover and buy ads from verified Telegram and Twitter channels.
          </p>
        </div>

        {/* Global Search Bar on Page */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels, keywords..."
            className="w-full bg-[#0b0f19] border border-[#1a2234] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Row: Segmented Platform Pill, Category Dropdown, Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-3 shadow-md">
        {/* Segmented Platform Pills: [All] [Telegram] [Twitter (X)] */}
        <div className="flex items-center gap-1 bg-[#060810] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setPlatformTab('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              platformTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPlatformTab('telegram_channel')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              platformTab === 'telegram_channel' || platformTab === 'telegram_group'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Telegram</span>
          </button>
          <button
            onClick={() => setPlatformTab('x_account')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              platformTab === 'x_account'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="font-extrabold text-[11px]">𝕏</span>
            <span>Twitter (X)</span>
          </button>
        </div>

        {/* Dropdowns on Right */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#060810] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">All Categories</option>
              {CATEGORY_ITEMS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#060810] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="popular">Most Popular</option>
              <option value="price_low">Lowest Price</option>
              <option value="price_high">Highest Price</option>
              <option value="rating">Best Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid + Right Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area: Channel Cards Grid (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-[#0b0f19] border border-dashed border-[#1a2234] rounded-2xl space-y-3">
              <p className="text-xs">No channels found matching the selected filters.</p>
              <button
                onClick={() => {
                  setPlatformTab('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredListings.map((channel) => {
                const lowestPrice = getLowestPrice(channel);
                const isFav = favorites[channel.id];
                const isTelegram = channel.platform !== 'x_account';

                return (
                  <div
                    key={channel.id}
                    onClick={() => onSelectListing(channel.id)}
                    className="bg-[#0b0f19] border border-[#1a2234] hover:border-blue-600/60 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg flex flex-col justify-between space-y-4 relative"
                  >
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {channel.badges && channel.badges.length > 0 ? (
                          channel.badges.map((b, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#141b2d] text-cyan-300 border border-cyan-800/50 truncate"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#141b2d] text-blue-300 border border-blue-900/40">
                            Fast Delivery
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(channel.id, e)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Channel Identity */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
                        <img
                          src={channel.avatarUrl}
                          alt={channel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                          {channel.name}
                        </h3>

                        {/* Platform Badge */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                            {isTelegram ? (
                              <>
                                <Send className="w-2.5 h-2.5" />
                                <span>Telegram</span>
                              </>
                            ) : (
                              <>
                                <span className="font-extrabold text-[10px]">𝕏</span>
                                <span>Twitter</span>
                              </>
                            )}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                            ✓
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Boxes (Views & Subscribers) */}
                    <div className="grid grid-cols-2 gap-2 bg-[#060810] p-2.5 rounded-xl border border-[#161c2c] text-center">
                      <div>
                        <div className="text-xs font-black text-white tabular-nums">
                          {channel.viewsPerPost >= 1000000
                            ? `${(channel.viewsPerPost / 1000000).toFixed(1)}M`
                            : channel.viewsPerPost >= 1000
                            ? `${(channel.viewsPerPost / 1000).toFixed(0)}K`
                            : channel.viewsPerPost}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">views</div>
                      </div>

                      <div className="border-l border-slate-800">
                        <div className="text-xs font-black text-white tabular-nums">
                          {channel.audienceCount >= 1000000
                            ? `${(channel.audienceCount / 1000000).toFixed(1)}M`
                            : channel.audienceCount >= 1000
                            ? `${(channel.audienceCount / 1000).toFixed(0)}K`
                            : channel.audienceCount}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">subscribers</div>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <div className="text-base font-black text-white tabular-nums">
                          ${lowestPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Starting price</div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenCheckout && channel.packages[0]) {
                            onOpenCheckout(channel, channel.packages[0].id);
                          } else {
                            onSelectListing(channel.id);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card 1: Turn Your Audience Into Income */}
          <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Send className="w-4 h-4 -translate-x-0.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Turn Your Audience</h3>
              <h4 className="font-extrabold text-sm text-blue-400">Into Income</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                List your Telegram or Twitter channel and start earning from ads.
              </p>
            </div>
            <button
              onClick={() => onNavigate('publisher_dashboard')}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 text-center block"
            >
              Become a Publisher
            </button>
          </div>

          {/* Card 2: Top Categories */}
          <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-xl space-y-3.5">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              Top Categories
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_ITEMS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                        : 'bg-[#060810] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Total Ad Spend */}
          <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-400">Total Ad Spend</div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +12%
              </span>
            </div>

            <div className="text-2xl font-black text-white tabular-nums tracking-tight">
              $248,960
            </div>

            {/* Mini Trendline Sparkline */}
            <div className="h-9 w-full bg-[#060810] rounded-lg p-1.5 flex items-end justify-between gap-1 overflow-hidden">
              {[25, 40, 30, 55, 45, 60, 75, 70, 85, 95].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>

            <div className="text-[10px] text-slate-500">
              Verified platform settlement volume
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
