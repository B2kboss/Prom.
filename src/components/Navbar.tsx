import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  Wallet as WalletIcon, 
  Bell, 
  ChevronDown, 
  User, 
  ShieldCheck, 
  Check, 
  Menu, 
  X,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, listingId?: string) => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenAuth,
  onOpenWallet,
}) => {
  const { currentUser, userWallet, unreadNotificationsCount, switchUser, state } = useAppStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'buyer': return 'Advertiser';
      case 'telegram_owner': return 'Publisher (TG)';
      case 'x_owner': return 'X Creator';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('marketplace');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-[#1a2234]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* LEFT: Logo & Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4 -translate-x-0.2" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Telega<span className="text-blue-500">.io</span>
              </span>
            </button>

            {/* Quick nav links for Desktop */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
              <button
                onClick={() => onNavigate('home')}
                className={`hover:text-white transition-colors ${currentView === 'home' ? 'text-blue-400 font-bold' : ''}`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('marketplace')}
                className={`hover:text-white transition-colors ${currentView === 'marketplace' ? 'text-blue-400 font-bold' : ''}`}
              >
                Marketplace
              </button>
              <button
                onClick={() => onNavigate('publisher_dashboard')}
                className={`hover:text-white transition-colors ${currentView === 'publisher_dashboard' ? 'text-blue-400 font-bold' : ''}`}
              >
                Publishers
              </button>
              <button
                onClick={() => onNavigate('create_campaign')}
                className={`hover:text-white transition-colors ${currentView === 'create_campaign' ? 'text-blue-400 font-bold' : ''}`}
              >
                Advertisers
              </button>
              <button
                onClick={() => onNavigate('how_it_works')}
                className={`hover:text-white transition-colors ${currentView === 'how_it_works' ? 'text-blue-400 font-bold' : ''}`}
              >
                About
              </button>
            </nav>
          </div>

          {/* CENTER: Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search channels, keywords..."
                className="w-full bg-[#0e1424] border border-[#1a2338] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded">
                /
              </span>
            </div>
          </form>

          {/* RIGHT: Balance, Notifications, User Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Wallet Balance Pill */}
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1424] hover:bg-[#151e34] border border-[#1e273e] text-xs font-bold text-white transition-colors shadow-sm"
              title="Click to Deposit or Withdraw"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                $
              </div>
              <span className="tabular-nums">${userWallet.availableBalanceUsd.toFixed(2)}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors focus:outline-none border border-slate-800"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs leading-none">
                  <div className="font-bold text-white max-w-[100px] truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-blue-400 font-medium">
                    {getRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0e1424] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>

                  <div className="px-2 py-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">
                      Switch Role (Demo Mode)
                    </div>
                    {state.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          u.id === currentUser.id 
                            ? 'bg-blue-600 text-white font-bold' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="text-left">
                          <div className="truncate font-semibold">{u.fullName}</div>
                          <div className={`text-[10px] ${u.id === currentUser.id ? 'text-blue-100' : 'text-slate-400'}`}>
                            {getRoleLabel(u.role)}
                          </div>
                        </div>
                        {u.id === currentUser.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-1.5 px-2">
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
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
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="space-y-1">
              <button
                onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate('marketplace'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg"
              >
                Ads Marketplace
              </button>
              <button
                onClick={() => { onNavigate('create_campaign'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg"
              >
                Create Ad Campaign
              </button>
              <button
                onClick={() => { onNavigate('publisher_dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg"
              >
                Publisher Dashboard
              </button>
              <button
                onClick={() => { onNavigate('buyer_dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg"
              >
                My Orders & Campaigns
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
