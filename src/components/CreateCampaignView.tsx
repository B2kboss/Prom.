import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  ThumbsUp, 
  Heart, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Users,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Listing } from '../types';

interface CreateCampaignViewProps {
  onSelectListing: (listingId: string) => void;
  onNavigate: (view: string) => void;
  onOpenCheckout: (listing: Listing, packageId: string) => void;
}

export const CreateCampaignView: React.FC<CreateCampaignViewProps> = ({
  onSelectListing,
  onNavigate,
  onOpenCheckout,
}) => {
  const { state, createOrder } = useAppStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [adTitle, setAdTitle] = useState<string>('Boost Your Crypto Project 🚀');
  const [adDescription, setAdDescription] = useState<string>(
    'Join our community and be part of the next big thing. Secure, fast and growing on BNB Chain.'
  );
  const [targetAudience, setTargetAudience] = useState<string>('Crypto/Web3');
  const [budget, setBudget] = useState<number>(50);
  const [duration, setDuration] = useState<string>('3 Days');
  const [targetUrl, setTargetUrl] = useState<string>('https://pagcoin.example.io');

  // Selected channel for preview & targeting
  const [selectedChannelId, setSelectedChannelId] = useState<string>('list-tg-crypto-news');

  const selectedChannel = state.listings.find((l) => l.id === selectedChannelId) || state.listings[0];

  const popularChannels = state.listings.slice(0, 4);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleProceedToPayment = () => {
    if (selectedChannel && selectedChannel.packages.length > 0) {
      onOpenCheckout(selectedChannel, selectedChannel.packages[0].id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Create New Ad Campaign
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Reach your target audience with Telegram or Twitter ads.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-4 shadow-md">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm shadow-blue-500/40">
              1
            </div>
            <span className="hidden sm:inline">Campaign Details</span>
          </div>

          <div className={`flex items-center gap-2 font-medium ${currentStep >= 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </div>
            <span className="hidden sm:inline">Select Channel</span>
          </div>

          <div className={`flex items-center gap-2 font-medium ${currentStep >= 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <span className="hidden sm:inline">Payment</span>
          </div>

          <div className={`flex items-center gap-2 font-medium ${currentStep >= 4 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
              currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              4
            </div>
            <span className="hidden sm:inline">Launch</span>
          </div>
        </div>
      </div>

      {/* 3-Column Layout: Form | Real-Time Preview | Target Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Campaign Details (4 cols) */}
        <div className="lg:col-span-4 bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-[#1a2234]">
            <h3 className="font-bold text-sm text-white">Campaign Details</h3>
            <p className="text-[11px] text-slate-400">Configure your ad creative and constraints</p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Ad Title
              </label>
              <input
                type="text"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                placeholder="Boost Your Crypto Project 🚀"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={adDescription}
                onChange={(e) => setAdDescription(e.target.value)}
                placeholder="Join our community and be part of the next big thing..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Crypto/Web3">Crypto/Web3</option>
                <option value="Trading">Trading & Signals</option>
                <option value="NFT & Gaming">NFT & Gaming</option>
                <option value="Technology">Technology & AI</option>
                <option value="Business">Business & Finance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-6 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="24 Hours">24 Hours</option>
                  <option value="3 Days">3 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="Permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Target URL
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourproject.io"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 pt-2"
            >
              <span>Next: Select Channel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Live Real-Time Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Preview</span>
            </h3>
            <span className="text-[10px] text-slate-500">Live Ad Card</span>
          </div>

          {/* Interactive Mobile Post Card */}
          <div className="bg-[#0e1424] border border-[#20293f] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl">
            {/* Post Header with Channel Avatar */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 shrink-0">
                <img
                  src={selectedChannel.avatarUrl}
                  alt={selectedChannel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">{selectedChannel.name}</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="text-blue-400 font-semibold">Sponsored</span>
                  <span>•</span>
                  <span>Just now</span>
                </div>
              </div>
            </div>

            {/* Ad Content */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white leading-snug">
                {adTitle || 'Boost Your Crypto Project 🚀'}
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {adDescription || 'Join our community and be part of the next big thing. Secure, fast and growing on BNB Chain.'}
              </p>
            </div>

            {/* Visual Graphic Banner */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold text-white backdrop-blur-sm">
                  <span>🪙</span>
                  <span>PAG COIN</span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-100 bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                  BEP-20 | BNB CHAIN
                </span>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-sm font-black text-white drop-shadow-md">
                  PAG COIN ECOSYSTEM
                </div>
                <div className="text-[10px] text-amber-100 drop-shadow">
                  High yield liquidity & community rewards
                </div>
              </div>

              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-white text-slate-900 rounded-lg text-[10px] font-black shadow-md hover:bg-slate-100">
                  Join Now
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold text-center block transition-colors shadow-sm"
            >
              Join Now
            </a>

            {/* Reactions bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-1 text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                <span>1.2K</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-blue-400">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>110</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3.5 h-3.5" />
                  <span>58</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Target Channels (4 cols) */}
        <div className="lg:col-span-4 bg-[#0b0f19] border border-[#1a2234] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a2234]">
            <div>
              <h3 className="font-bold text-sm text-white">Target Channels</h3>
              <p className="text-[11px] text-slate-400">Popular channels</p>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              View all
            </button>
          </div>

          {/* Popular Channels List with Select buttons */}
          <div className="space-y-3">
            {popularChannels.map((chan) => {
              const isSelected = chan.id === selectedChannelId;
              const minPrice = chan.packages[0]?.priceUsd || 2.40;

              return (
                <div
                  key={chan.id}
                  onClick={() => handleSelectChannel(chan.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-[#0a0d16] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={chan.avatarUrl}
                      alt={chan.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{chan.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {chan.viewsPerPost >= 1000000 
                          ? `${(chan.viewsPerPost / 1000000).toFixed(1)}M` 
                          : `${chan.viewsPerPost}`} views • ${minPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChannel(chan.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('marketplace')}
              className="w-full py-2 px-3 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/20 border border-blue-900/40 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View all channels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
