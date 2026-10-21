import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#05070a] border-t border-slate-800/80 text-slate-400 text-xs py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                P
              </div>
              <span className="text-base font-extrabold text-white">
                PROM<span className="text-blue-500">.IO</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium Telegram and X advertising marketplace. Guaranteed placement delivery, atomic escrow protection, and 24-hour verified statistics.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Supabase PostgreSQL & RLS Protected</span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Inventory</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('telegram_channels')} className="hover:text-white transition-colors">
                  Telegram Channels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('telegram_groups')} className="hover:text-white transition-colors">
                  Telegram Communities & Groups
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('x_accounts')} className="hover:text-white transition-colors">
                  X (Twitter) Creator Accounts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hot_deals')} className="hover:text-amber-400 text-amber-400/90 transition-colors">
                  Hot Deals (7-Day Limited)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Escrow & Security */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Escrow & Trust</h4>
            <ul className="space-y-2 text-slate-400">
              <li>USDT, USDC, TON, SOL, BTC, ETH</li>
              <li>Mandatory Channel Moderation</li>
              <li>Immutable Append-Only Ledger</li>
              <li>Exclusive Diamond Verification</li>
              <li>Dispute Arbitration Protocol</li>
            </ul>
          </div>

          {/* Col 4: Help & Governance */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-white transition-colors">
                  How PROM.IO Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin_dashboard')} className="hover:text-white transition-colors">
                  Admin Governance Console
                </button>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: All orders are held in 100% escrow until verified publication.'); }} className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: User wallet transactions and orders are stored strictly according to Supabase RLS policies.'); }} className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} PROM.IO Marketplace. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Server Time: <strong className="text-slate-400 tabular-nums">2026-10-18 UTC</strong></span>
            <span>·</span>
            <span>Automated 24h Statistical Sync Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
