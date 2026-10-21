import React from 'react';
import { 
  Home, 
  Store, 
  Send, 
  FolderGit2, 
  Users, 
  Megaphone, 
  Wallet as WalletIcon, 
  Headphones, 
  PlusCircle, 
  BarChart3,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAppStore } from '../lib/store';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenWallet: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenWallet,
}) => {
  const { currentUser, userWallet, state } = useAppStore();

  const isPublisher = currentUser.role === 'telegram_owner' || currentUser.role === 'x_owner';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'telegram_ads', label: 'Telegram Ads', icon: Send },
    { id: 'twitter_ads', label: 'Twitter Ads', icon: () => (
      <span className="font-extrabold text-xs tracking-tighter">𝕏</span>
    )},
    { id: 'publisher_dashboard', label: 'Publishers', icon: Users },
    { id: 'create_campaign', label: 'Advertisers', icon: Megaphone },
    { id: 'buyer_dashboard', label: 'My Orders', icon: FolderGit2 },
  ];

  return (
    <aside className="w-60 bg-[#0a0d16] border-r border-[#1a2234] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <div className="p-3.5 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === 'marketplace' && currentView === 'listing_detail') ||
            (item.id === 'telegram_ads' && currentView === 'telegram_channels') ||
            (item.id === 'twitter_ads' && currentView === 'x_accounts');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-[#121826]'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Create Campaign Action */}
        <div className="pt-2 pb-1">
          <button
            onClick={() => onNavigate('create_campaign')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'create_campaign'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 border border-blue-900/40'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Secondary Links: Wallet & Support */}
        <div className="pt-3 border-t border-[#1a2234] space-y-1">
          <button
            onClick={onOpenWallet}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#121826] transition-colors`}
          >
            <div className="flex items-center gap-3">
              <WalletIcon className="w-4 h-4 text-emerald-400" />
              <span>Wallet</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 tabular-nums">
              ${userWallet.availableBalanceUsd.toFixed(2)}
            </span>
          </button>

          <button
            onClick={() => onNavigate('how_it_works')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'how_it_works' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-[#121826]'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Support & Help</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin_dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentView === 'admin_dashboard' ? 'bg-blue-600 text-white' : 'text-purple-400 hover:text-purple-300 hover:bg-[#121826]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* Publisher Mini CTA Card at bottom of sidebar */}
      <div className="p-3 m-3 bg-[#111726] border border-[#1e273c] rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-[10px]">
            ⚡
          </div>
          <span>Own a Channel?</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Monetize your audience with verified escrow campaigns.
        </p>
        <button
          onClick={() => onNavigate('publisher_dashboard')}
          className="w-full py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-[11px] font-bold transition-all text-center block"
        >
          Publisher Portal
        </button>
      </div>
    </aside>
  );
};
