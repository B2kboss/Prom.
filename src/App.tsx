import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MarketplaceView } from './components/MarketplaceView';
import { ListingDetailView } from './components/ListingDetailView';
import { OrderCheckoutModal } from './components/OrderCheckoutModal';
import { CryptoFinanceModal } from './components/CryptoFinanceModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HowItWorksView } from './components/HowItWorksView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AuthModal } from './components/AuthModal';
import { useAppStore } from './lib/store';
import { PromotionPackage } from './types';

export default function App() {
  const { state, currentUser } = useAppStore();

  const [currentView, setCurrentView] = useState<string>('marketplace');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // Modal triggers
  const [showOrderCheckout, setShowOrderCheckout] = useState(false);
  const [bookingPackageId, setBookingPackageId] = useState<string | null>(null);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeInitialTab, setFinanceInitialTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavigate = (view: string, listingId?: string) => {
    setCurrentView(view);
    if (listingId) {
      setSelectedListingId(listingId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectListing = (listingId: string) => {
    setSelectedListingId(listingId);
    setCurrentView('listing_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookPackage = (packageId: string) => {
    setBookingPackageId(packageId);
    setShowOrderCheckout(true);
  };

  const activeListing = state.listings.find((l) => l.id === selectedListingId);
  const activePackage = activeListing?.packages.find((p) => p.id === bookingPackageId);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'marketplace' && (
          <MarketplaceView
            initialPlatform="all"
            filterHotDealsOnly={false}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'telegram_channels' && (
          <MarketplaceView
            key="tg_channels"
            initialPlatform="telegram_channel"
            filterHotDealsOnly={false}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'telegram_groups' && (
          <MarketplaceView
            key="tg_groups"
            initialPlatform="telegram_group"
            filterHotDealsOnly={false}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'x_accounts' && (
          <MarketplaceView
            key="x_accounts"
            initialPlatform="x_account"
            filterHotDealsOnly={false}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'hot_deals' && (
          <MarketplaceView
            key="hot_deals"
            initialPlatform="all"
            filterHotDealsOnly={true}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'listing_detail' && selectedListingId && (
          <ListingDetailView
            listingId={selectedListingId}
            onBack={() => handleNavigate('marketplace')}
            onBookPackage={handleBookPackage}
          />
        )}

        {currentView === 'owner_dashboard' && (
          <OwnerDashboard
            onOpenWithdrawal={() => {
              setFinanceInitialTab('withdraw');
              setShowFinanceModal(true);
            }}
            onNavigateToListing={handleSelectListing}
          />
        )}

        {currentView === 'buyer_dashboard' && (
          <BuyerDashboard
            onOpenDeposit={() => {
              setFinanceInitialTab('deposit');
              setShowFinanceModal(true);
            }}
            onNavigateToMarketplace={() => handleNavigate('marketplace')}
          />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboard />
        )}

        {currentView === 'how_it_works' && (
          <HowItWorksView
            onNavigateToMarketplace={() => handleNavigate('marketplace')}
            onNavigateToOwner={() => handleNavigate('owner_dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Order Checkout Modal */}
      {showOrderCheckout && activeListing && activePackage && (
        <OrderCheckoutModal
          listing={activeListing}
          selectedPackage={activePackage}
          onClose={() => {
            setShowOrderCheckout(false);
            setBookingPackageId(null);
          }}
          onOrderSuccess={(orderId) => {
            setShowOrderCheckout(false);
            setBookingPackageId(null);
            handleNavigate('buyer_dashboard');
          }}
          onOpenDeposit={() => {
            setShowOrderCheckout(false);
            setFinanceInitialTab('deposit');
            setShowFinanceModal(true);
          }}
        />
      )}

      {/* Crypto Finance (Deposit / Withdraw) Modal */}
      {showFinanceModal && (
        <CryptoFinanceModal
          initialTab={financeInitialTab}
          onClose={() => setShowFinanceModal(false)}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigateTo={(url) => {
          if (url.includes('orders') || url.includes('wallet')) {
            handleNavigate('buyer_dashboard');
          } else if (url.includes('owner') || url.includes('earnings')) {
            handleNavigate('owner_dashboard');
          } else if (url.includes('admin') || url.includes('finance') || url.includes('moderation') || url.includes('diamond')) {
            handleNavigate('admin_dashboard');
          } else if (url.includes('listing')) {
            const parts = url.split('/');
            const lId = parts[parts.length - 1];
            handleSelectListing(lId);
          }
        }}
      />

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
