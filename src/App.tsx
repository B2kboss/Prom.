import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { MarketplaceView } from './components/MarketplaceView';
import { CreateCampaignView } from './components/CreateCampaignView';
import { PublisherDashboardView } from './components/PublisherDashboardView';
import { ListingDetailView } from './components/ListingDetailView';
import { OrderCheckoutModal } from './components/OrderCheckoutModal';
import { CryptoFinanceModal } from './components/CryptoFinanceModal';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HowItWorksView } from './components/HowItWorksView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { useAppStore } from './lib/store';
import { Listing, PromotionPackage } from './types';

export default function App() {
  const { state, currentUser } = useAppStore();

  const [currentView, setCurrentView] = useState<string>('marketplace');
  const [selectedListingId, setSelectedListingId] = useState<string | null>('list-tg-pag-coin');

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

  const handleOpenCheckoutWithListing = (listing: Listing, packageId: string) => {
    setSelectedListingId(listing.id);
    setBookingPackageId(packageId);
    setShowOrderCheckout(true);
  };

  const activeListing = state.listings.find((l) => l.id === selectedListingId) || state.listings[0];
  const activePackage = activeListing?.packages.find((p) => p.id === bookingPackageId) || activeListing?.packages[0];

  const isAppShellView = currentView !== 'home';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenWallet={() => {
          setFinanceInitialTab('deposit');
          setShowFinanceModal(true);
        }}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col">
        {currentView === 'home' ? (
          <main className="flex-1">
            <HomeView onNavigate={handleNavigate} />
          </main>
        ) : (
          <div className="flex-1 flex w-full">
            {/* Left Persistent Sidebar (hidden on mobile, visible on md+) */}
            <div className="hidden md:block">
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                onOpenWallet={() => {
                  setFinanceInitialTab('deposit');
                  setShowFinanceModal(true);
                }}
              />
            </div>

            {/* Main Content Pane */}
            <main className="flex-1 min-w-0 bg-[#07090e]">
              {currentView === 'marketplace' && (
                <MarketplaceView
                  initialPlatform="all"
                  filterHotDealsOnly={false}
                  onSelectListing={handleSelectListing}
                  onNavigate={handleNavigate}
                  onOpenCheckout={handleOpenCheckoutWithListing}
                />
              )}

              {currentView === 'telegram_ads' && (
                <MarketplaceView
                  key="telegram_ads"
                  initialPlatform="telegram_channel"
                  filterHotDealsOnly={false}
                  onSelectListing={handleSelectListing}
                  onNavigate={handleNavigate}
                  onOpenCheckout={handleOpenCheckoutWithListing}
                />
              )}

              {currentView === 'twitter_ads' && (
                <MarketplaceView
                  key="twitter_ads"
                  initialPlatform="x_account"
                  filterHotDealsOnly={false}
                  onSelectListing={handleSelectListing}
                  onNavigate={handleNavigate}
                  onOpenCheckout={handleOpenCheckoutWithListing}
                />
              )}

              {currentView === 'create_campaign' && (
                <CreateCampaignView
                  onSelectListing={handleSelectListing}
                  onNavigate={handleNavigate}
                  onOpenCheckout={handleOpenCheckoutWithListing}
                />
              )}

              {currentView === 'publisher_dashboard' && (
                <PublisherDashboardView
                  onOpenWithdrawal={() => {
                    setFinanceInitialTab('withdraw');
                    setShowFinanceModal(true);
                  }}
                  onNavigateToListing={handleSelectListing}
                  onNavigateToMarketplace={() => handleNavigate('marketplace')}
                />
              )}

              {currentView === 'listing_detail' && selectedListingId && (
                <ListingDetailView
                  listingId={selectedListingId}
                  onBack={() => handleNavigate('marketplace')}
                  onBookPackage={handleBookPackage}
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
                  onNavigateToOwner={() => handleNavigate('publisher_dashboard')}
                />
              )}
            </main>
          </div>
        )}
      </div>

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
          } else if (url.includes('owner') || url.includes('earnings') || url.includes('publisher')) {
            handleNavigate('publisher_dashboard');
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
