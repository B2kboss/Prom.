import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet as WalletIcon, 
  Bell, 
  User, 
  ChevronDown, 
  Check, 
  Menu, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, listingId?: string) => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAuth,
}) => {
  const { currentUser, userWallet, unreadNotificationsCount, switchUser, state } = useAppStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'buyer': return 'Advertiser';
      case 'telegram_owner': return 'TG Owner';
      case 'x_owner': return 'X Creator';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* ZONE 1: BRAND WORDMARK */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('marketplace')}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:opacity-90 transition-opacity">
                P
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                PROM<span className="text-blue-500">.IO</span>
              </span>
            </button>
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              TG & X Marketplace
            </span>
          </div>

          {/* ZONE 2: 4-5 SINGLE-LINE NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => onNavigate('marketplace')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentView === 'marketplace' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Marketplace
            </button>
            <button
              onClick={() => onNavigate('telegram_channels')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentView === 'telegram_channels' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Telegram Channels
            </button>
            <button
              onClick={() => onNavigate('telegram_groups')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentView === 'telegram_groups' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Telegram Groups
            </button>
            <button
              onClick={() => onNavigate('x_accounts')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentView === 'x_accounts' ? 'text-blue-400 font-semibold' : ''}`}
            >
              X Accounts
            </button>
            <button
              onClick={() => onNavigate('hot_deals')}
              className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap text-amber-400/90 ${currentView === 'hot_deals' ? 'text-amber-400 font-semibold' : ''}`}
            >
              <span>Hot Deals</span>
            </button>
            <button
              onClick={() => onNavigate('how_it_works')}
              className={`hover:text-white transition-colors whitespace-nowrap ${currentView === 'how_it_works' ? 'text-blue-400 font-semibold' : ''}`}
            >
              How It Works
            </button>
          </nav>

          {/* ZONE 3: ACTIONS & ROLE MANAGEMENT */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Wallet Balance Widget */}
            <button
              onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin_dashboard' : currentUser.role.includes('owner') ? 'owner_dashboard' : 'buyer_dashboard')}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs px-3 py-1.5 rounded-lg transition-colors"
              title="Click to view wallet"
            >
              <WalletIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-white tabular-nums">
                ${userWallet.availableBalanceUsd.toFixed(2)}
              </span>
              {userWallet.reservedBalanceUsd > 0 && (
                <span className="text-[10px] text-slate-400 hidden sm:inline tabular-nums">
                  (${userWallet.reservedBalanceUsd.toFixed(2)} in escrow)
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#07090e]" />
              )}
            </button>

            {/* Quick Dashboard Action */}
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => onNavigate('admin_dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            ) : currentUser.role.includes('owner') ? (
              <button
                onClick={() => onNavigate('owner_dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
              >
                Owner Portal
              </button>
            ) : (
              <button
                onClick={() => onNavigate('buyer_dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
              >
                My Campaigns
              </button>
            )}

            {/* Active User / Role Switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition-colors focus:outline-none"
              >
                <div className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300 font-bold">
                  {currentUser.fullName[0]}
                </div>
                <span className="hidden md:inline font-medium max-w-[100px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-900/40">
                  {getRoleLabel(currentUser.role)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0d121f] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2.5 py-2 border-b border-slate-800/80 mb-1">
                    <p className="font-semibold text-white truncate">{currentUser.fullName}</p>
                    <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                  </div>

                  <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Switch Test Account
                  </p>
                  
                  {state.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-slate-800/60 transition-colors ${
                        u.id === currentUser.id ? 'bg-blue-950/40 text-blue-400 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{u.fullName}</div>
                        <div className="text-[10px] text-slate-500">{u.email} ({getRoleLabel(u.role)})</div>
                      </div>
                      {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </button>
                  ))}

                  <div className="border-t border-slate-800/80 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      Sign In / Register with Google
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => { onNavigate('marketplace'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg"
            >
              Marketplace
            </button>
            <button
              onClick={() => { onNavigate('telegram_channels'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg"
            >
              Telegram Channels
            </button>
            <button
              onClick={() => { onNavigate('telegram_groups'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg"
            >
              Telegram Groups
            </button>
            <button
              onClick={() => { onNavigate('x_accounts'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg"
            >
              X Accounts
            </button>
            <button
              onClick={() => { onNavigate('hot_deals'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-slate-800/40 rounded-lg"
            >
              Hot Deals (7-Day Limited)
            </button>
            <button
              onClick={() => { onNavigate('how_it_works'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg"
            >
              How It Works
            </button>
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => { onNavigate('buyer_dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg"
              >
                Buyer Dashboard
              </button>
              <button
                onClick={() => { onNavigate('owner_dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg"
              >
                Owner Portal
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => { onNavigate('admin_dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Admin Panel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
