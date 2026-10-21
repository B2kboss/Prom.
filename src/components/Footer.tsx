import React from 'react';
import { ShieldCheck, Lock, Send, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#05070a] border-t border-[#1a2234] text-slate-400 text-xs py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-600/30">
                <Send className="w-3.5 h-3.5 -translate-x-0.2" />
              </div>
              <span className="text-base font-black text-white">
                Telega<span className="text-blue-500">.io</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The ultimate ads marketplace for Telegram channels and Twitter (X) accounts. Verified audience metrics, instant campaign creation, and guaranteed crypto escrow delivery.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>100% Escrow & Verified Delivery</span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-white transition-colors">
                  All Channels & Creators
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('telegram_ads')} className="hover:text-white transition-colors">
                  Telegram Channels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('twitter_ads')} className="hover:text-white transition-colors">
                  Twitter (X) Ads
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('create_campaign')} className="hover:text-blue-400 text-blue-400/90 font-semibold transition-colors">
                  Create Ad Campaign
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Publishers */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Publishers</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('publisher_dashboard')} className="hover:text-white transition-colors">
                  Publisher Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('publisher_dashboard')} className="hover:text-white transition-colors">
                  Monetize Telegram Channel
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-white transition-colors">
                  Verification Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-white transition-colors">
                  Crypto Payout Options
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Security */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Security & Trust</h4>
            <div className="p-3 bg-[#0a0d16] border border-[#1a2234] rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Non-Custodial Escrow</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Funds are reserved at checkout and only released upon cryptographic proof of published link.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1a2234] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Telega.io — The Ultimate Ads Marketplace for Telegram & Twitter. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('how_it_works')} className="hover:text-slate-300">
              Terms & Escrow Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('how_it_works')} className="hover:text-slate-300">
              API Documentation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
