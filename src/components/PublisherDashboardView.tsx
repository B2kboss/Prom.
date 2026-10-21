import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  ArrowUpRight, 
  Sparkles, 
  ExternalLink, 
  Edit3, 
  BarChart2, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../lib/store';

interface PublisherDashboardViewProps {
  onOpenWithdrawal: () => void;
  onNavigateToListing: (listingId: string) => void;
  onNavigateToMarketplace: () => void;
}

export const PublisherDashboardView: React.FC<PublisherDashboardViewProps> = ({
  onOpenWithdrawal,
  onNavigateToListing,
  onNavigateToMarketplace,
}) => {
  const { state, currentUser } = useAppStore();
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('30D');

  // PAG COIN listing as the primary flagship channel
  const pagListing = state.listings.find((l) => l.id === 'list-tg-pag-coin') || state.listings[0];

  // Recent ads completed
  const recentAds = [
    { id: '1', campaign: 'Crypto News Info', amount: '$2.40', status: 'Completed', date: 'Feb 25, 2025' },
    { id: '2', campaign: 'BK Network', amount: '$0.90', status: 'Completed', date: 'Feb 24, 2025' },
    { id: '3', campaign: 'ATBUY', amount: '$5.20', status: 'Completed', date: 'Feb 23, 2025' },
    { id: '4', campaign: 'Bitget careerist', amount: '$4.00', status: 'Completed', date: 'Feb 22, 2025' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Publisher Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your verified channel, track real-time reach, and monitor automated escrow earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWithdrawal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw Earnings</span>
          </button>
        </div>
      </div>

      {/* Channel Profile Banner */}
      <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar with glowing ring */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 shrink-0">
              <img
                src={pagListing.avatarUrl}
                alt={pagListing.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">{pagListing.name}</h2>
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                  ✓
                </div>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                <span>Telegram Channel</span>
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-slate-200 font-semibold">120K subscribers</span>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-0.5">
                {pagListing.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToListing(pagListing.id)}
                className="px-3 py-1.5 bg-[#121826] hover:bg-[#1a2234] border border-slate-700 text-xs font-semibold text-white rounded-xl transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onNavigateToListing(pagListing.id)}
                className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 text-xs font-semibold text-blue-300 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>View Analytics</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Channel Status indicator */}
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Channel Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Ready to receive ad campaigns</span>
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +18%
            </span>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Total Earnings</div>
            <div className="text-2xl font-black text-white tabular-nums tracking-tight mt-0.5">
              $1,245.60
            </div>
          </div>
        </div>

        {/* Total Ads */}
        <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +12%
            </span>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Total Ads</div>
            <div className="text-2xl font-black text-white tabular-nums tracking-tight mt-0.5">
              48
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +22%
            </span>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Total Views</div>
            <div className="text-2xl font-black text-white tabular-nums tracking-tight mt-0.5">
              3.4M
            </div>
          </div>
        </div>

        {/* Subscribers */}
        <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +5%
            </span>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Subscribers</div>
            <div className="text-2xl font-black text-white tabular-nums tracking-tight mt-0.5">
              120K
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Bottom Grid: Recent Ads & Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Ads Table (6 cols) */}
        <div className="lg:col-span-6 bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a2234]">
            <h3 className="font-bold text-sm text-white">Recent Ads</h3>
            <button
              onClick={onNavigateToMarketplace}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              View all →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-2.5 font-semibold">Campaign</th>
                  <th className="pb-2.5 font-semibold">Amount</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{ad.campaign}</span>
                    </td>
                    <td className="py-3 font-bold text-slate-200 tabular-nums">{ad.amount}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">{ad.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Your Channel Performance Widget (6 cols) */}
        <div className="lg:col-span-6 bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a2234]">
            <h3 className="font-bold text-sm text-white">Your Channel Performance</h3>
            
            {/* Timeframe Toggles */}
            <div className="flex items-center gap-1 bg-[#121826] p-1 rounded-xl border border-slate-800 text-[11px]">
              {(['7D', '30D', '90D'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    timeframe === t 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Glowing SVG Curve Graph */}
          <div className="relative h-44 w-full bg-[#070a12] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
              <span className="text-white font-semibold">Reach Trajectory</span>
              <span className="text-emerald-400 font-bold">+18.4% vs prev period</span>
            </div>

            {/* SVG line */}
            <svg className="w-full h-28 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 90 Q 70 80 130 55 T 260 40 T 380 20 T 500 10 L 500 120 L 0 120 Z"
                fill="url(#neonGradient)"
              />
              <path
                d="M 0 90 Q 70 80 130 55 T 260 40 T 380 20 T 500 10"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Highlight Dot */}
              <circle cx="500" cy="10" r="5" fill="#60a5fa" stroke="#ffffff" strokeWidth="2" />
            </svg>

            <div className="flex items-center justify-between text-[10px] text-slate-500 z-10 pt-1">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>

          {/* Performance Sub-Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-[#0e1424] border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-400">Views</div>
              <div className="text-sm font-extrabold text-white tabular-nums">482K</div>
              <div className="text-[10px] font-bold text-emerald-400">+12%</div>
            </div>

            <div className="p-3 bg-[#0e1424] border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-400">Subscribers</div>
              <div className="text-sm font-extrabold text-white tabular-nums">2.4K</div>
              <div className="text-[10px] font-bold text-emerald-400">+8%</div>
            </div>

            <div className="p-3 bg-[#0e1424] border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-400">CTR</div>
              <div className="text-sm font-extrabold text-white tabular-nums">4.8%</div>
              <div className="text-[10px] font-bold text-emerald-400">+2%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
