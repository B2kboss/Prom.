import React from 'react';
import { 
  Send, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Headphones, 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Platform Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-300 text-xs font-semibold shadow-inner">
              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
                <Send className="w-2.5 h-2.5" />
              </div>
              <span className="font-extrabold text-xs">𝕏</span>
              <span>Telegram & Twitter</span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Ads Marketplace
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Buy & Sell Telegram & Twitter Ads
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Find real audiences. Grow your brand. Reach millions with verified channels and top-performing accounts.
            </p>

            {/* 4 Feature Check Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-2xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Verified Channels</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 text-xs font-semibold">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300 text-xs font-semibold">
                <Headphones className="w-4 h-4 text-purple-400 shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:scale-[1.02]"
              >
                <span>Browse Ads</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('publisher_dashboard')}
                className="px-6 py-3 text-sm font-bold text-slate-200 hover:text-white bg-[#0e1424] hover:bg-[#151e34] border border-slate-800 rounded-xl transition-colors"
              >
                Become a Publisher
              </button>
            </div>
          </div>

          {/* Right Column: 3D Visual Cards with Neon Glow */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Visual container */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-[#0e1424] via-[#090d16] to-[#060910] border border-[#1e273e] p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[1px] pointer-events-none" />

              {/* Top Row: Floating Icons */}
              <div className="flex items-center justify-between z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Send className="w-7 h-7 text-blue-400 -translate-x-0.5" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-lg text-white font-black text-xl">
                  𝕏
                </div>
              </div>

              {/* Floating Widget: Grow Your Brand With Targeted Ads */}
              <div className="z-10 bg-[#12192c]/90 border border-[#232f4c] rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      Grow Your Brand
                    </h4>
                    <p className="text-[11px] text-blue-400 font-medium">With Targeted Ads</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +48% Reach
                  </span>
                </div>

                {/* Neon Mini Bar Graph */}
                <div className="flex items-end justify-between gap-2 h-20 pt-2 border-b border-slate-800/80 pb-2">
                  {[35, 55, 42, 68, 50, 85, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm transition-all shadow-sm shadow-blue-500/40"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Targeted CTR: <strong className="text-white">4.8%</strong></span>
                  <span>Active Reach: <strong className="text-emerald-400">1.2M</strong></span>
                </div>
              </div>

              {/* Ambient bottom glow */}
              <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-time delivery verification</span>
                </div>
                <span className="text-[10px] text-slate-500">Live Escrow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS COUNTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-6 sm:p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
              500M+
            </div>
            <div className="text-xs font-semibold text-slate-400">Total Reach</div>
          </div>

          <div className="space-y-1 border-l-0 md:border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
              8,153+
            </div>
            <div className="text-xs font-semibold text-slate-400">Verified Channels</div>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
              1,896+
            </div>
            <div className="text-xs font-semibold text-slate-400">Active Advertisers</div>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
              347,152+
            </div>
            <div className="text-xs font-semibold text-slate-400">Total Users</div>
          </div>
        </div>
      </section>

      {/* 4 FEATURE PILLARS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('telegram_ads')}
            className="p-5 rounded-2xl bg-[#0c1120] border border-[#1a2338] hover:border-blue-600/50 transition-all cursor-pointer group space-y-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
              Telegram Ads
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reach millions of Telegram users across active crypto, tech, and trading channels.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('twitter_ads')}
            className="p-5 rounded-2xl bg-[#0c1120] border border-[#1a2338] hover:border-slate-500/50 transition-all cursor-pointer group space-y-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-extrabold text-base group-hover:scale-110 transition-transform">
              𝕏
            </div>
            <h4 className="font-bold text-white text-sm group-hover:text-slate-200 transition-colors">
              Twitter Ads
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target real & active audiences through verified high-authority X creators and threads.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('how_it_works')}
            className="p-5 rounded-2xl bg-[#0c1120] border border-[#1a2338] hover:border-emerald-500/50 transition-all cursor-pointer group space-y-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
              Secure & Trusted
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated crypto escrow protection guarantees fund release only after verified proof.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('create_campaign')}
            className="p-5 rounded-2xl bg-[#0c1120] border border-[#1a2338] hover:border-amber-500/50 transition-all cursor-pointer group space-y-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
              Fast & Easy
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start in minutes. Create targeted campaigns with instant channel selection and live previews.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/50 to-blue-900/30 border border-blue-800/50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-extrabold text-white">
              The Ultimate Ads Marketplace for Telegram & Twitter
            </h3>
            <p className="text-xs text-slate-300">
              Join thousands of brands and publishers growing their reach securely on Telega.io.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              Explore Channels
            </button>
            <button
              onClick={() => onNavigate('publisher_dashboard')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              List Channel
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
