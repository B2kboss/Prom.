import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  DollarSign, 
  Eye, 
  Layers 
} from 'lucide-react';

interface HowItWorksViewProps {
  onNavigateToMarketplace: () => void;
  onNavigateToOwner: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  onNavigateToMarketplace,
  onNavigateToOwner,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-900/40 px-3 py-1 rounded-md">
          Platform Architecture & Guidelines
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How PROM.IO Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          The two-sided advertising exchange combining automated 24-hour channel audience analytics with cryptographic crypto escrow.
        </p>
      </div>

      {/* For Advertisers */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
            A
          </div>
          <h2 className="text-xl font-bold text-white">For Advertisers & Growth Teams</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold text-blue-400 font-mono">01. Discovery & Analytics</div>
            <h3 className="font-semibold text-white text-sm">Verified Reach Statistics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse approved Telegram channels, groups, and X creators. Inspect historical 7-day, 30-day, and 90-day audience snapshots refreshed automatically every 24 hours.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold text-blue-400 font-mono">02. Escrow Protection</div>
            <h3 className="font-semibold text-white text-sm">Funds Locked in Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When booking a package, the exact order amount is reserved in escrow from your deposit balance. The publisher does not receive payment until you verify delivery.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold text-blue-400 font-mono">03. Review & Release</div>
            <h3 className="font-semibold text-white text-sm">Inspect Live Post</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The owner posts your copy and submits the live URL. Inspect the post link, confirm delivery, or open a dispute for immediate administrator arbitration.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onNavigateToMarketplace}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            <span>Explore Verified Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* For Channel Owners */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
            C
          </div>
          <h2 className="text-xl font-bold text-white">For Telegram & X Channel Owners</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold text-cyan-400 font-mono">01. Listing Moderation</div>
            <h3 className="font-semibold text-white text-sm">Channel Ownership Check</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your Telegram channel or X account with proof of ownership (via @PromioVerificationBot or bio challenge). Our moderation team verifies every channel before public listing.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold text-cyan-400 font-mono">02. Owner-Controlled Pricing</div>
            <h3 className="font-semibold text-white text-sm">Flexible Packages & Hot Deals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure 1/24h, 2/48h, permanent, or sponsored formats at your own rates. Launch a 7-day limited Hot Deal every week to boost advertiser inbound orders.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold text-cyan-400 font-mono">03. Fast Crypto Payouts</div>
            <h3 className="font-semibold text-white text-sm">Guaranteed Earnings Release</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publish orders, submit the live link, and receive your earnings immediately upon buyer confirmation or deadline expiry. Withdraw to USDT, TON, SOL, or BTC.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onNavigateToOwner}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
          >
            <span>List Your Channel Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Spotlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-900/40 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Flame className="w-5 h-5" />
            <span>Hot Deals 7-Day Limit Mechanism</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To prevent artificial price distortion and continuous fake sales, channel owners are restricted to 1 Hot Deal every 7 rolling days. Deals automatically expire after 7 days, maintaining a high-converting, honest marketplace.
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/20 to-slate-900 border border-cyan-900/40 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>Exclusive Diamond Badges</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Channels that link to PROM.IO directly in their Telegram or X bio receive the prestigious Diamond badge and priority ranking. Link presence is verified via automated crawling and administrator review.
          </p>
        </div>
      </div>
    </div>
  );
};
