import React, { useState } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Flame, 
  Sparkles, 
  DollarSign, 
  ArrowUpRight, 
  Send,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { PlatformType, Listing, PromotionPackage, PackageFormat } from '../types';

interface OwnerDashboardProps {
  onOpenWithdrawal: () => void;
  onNavigateToListing: (listingId: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onOpenWithdrawal,
  onNavigateToListing,
}) => {
  const { 
    currentUser, 
    userWallet, 
    state, 
    submitListing, 
    addPackageToListing, 
    createHotDeal, 
    applyForDiamondBadge, 
    acceptOrder, 
    submitPublication 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'hot_deals' | 'diamond' | 'earnings'>('listings');

  // Filter listings and orders belonging to this owner
  const myListings = state.listings.filter((l) => l.ownerId === currentUser.id || currentUser.role === 'admin');
  const myOrders = state.orders.filter((o) => o.ownerId === currentUser.id || currentUser.role === 'admin');
  const myWithdrawals = state.withdrawalRequests.filter((w) => w.userId === currentUser.id || currentUser.role === 'admin');

  // Modal States
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [publishingOrderId, setPublishingOrderId] = useState<string | null>(null);
  const [publicationUrl, setPublicationUrl] = useState('');
  const [publicationProofUrl, setPublicationProofUrl] = useState('');
  const [hotDealError, setHotDealError] = useState<string | null>(null);
  const [hotDealSuccess, setHotDealSuccess] = useState<string | null>(null);

  // Add Listing Form State
  const [newPlatform, setNewPlatform] = useState<PlatformType>('telegram_channel');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Crypto & Web3');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newCountry, setNewCountry] = useState('Global');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [newAudienceCount, setNewAudienceCount] = useState('25000');
  const [newViewsPerPost, setNewViewsPerPost] = useState('8000');
  const [newVerificationMethod, setNewVerificationMethod] = useState<'bot_check' | 'verification_code_post' | 'oauth_token'>('bot_check');
  const [newVerificationEvidence, setNewVerificationEvidence] = useState('');
  const [initialPackagePrice, setInitialPackagePrice] = useState('150');

  // Hot Deal Form State
  const [selectedListingForDeal, setSelectedListingForDeal] = useState<string>(myListings[0]?.id || '');
  const [selectedPackageForDeal, setSelectedPackageForDeal] = useState<string>('');
  const [dealDiscountPct, setDealDiscountPct] = useState<number>(20);

  // Diamond Badge Form State
  const [diamondListingId, setDiamondListingId] = useState<string>(myListings[0]?.id || '');
  const [diamondSubmittedUrl, setDiamondSubmittedUrl] = useState<string>('https://prom.io/c/');
  const [diamondEvidence, setDiamondEvidence] = useState<string>('');
  const [diamondSuccess, setDiamondSuccess] = useState<string | null>(null);

  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const audience = parseInt(newAudienceCount) || 1000;
    const views = parseInt(newViewsPerPost) || 300;
    const price = parseFloat(initialPackagePrice) || 100;

    const created = submitListing(
      {
        platform: newPlatform,
        name: newName,
        username: newUsername.replace('@', ''),
        url: newUrl,
        description: newDescription,
        category: newCategory,
        language: newLanguage,
        country: newCountry,
        avatarUrl: newAvatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&h=240&q=80',
        audienceCount: audience,
        viewsPerPost: views,
        engagementRate: +(views / audience * 100).toFixed(1),
        cpmEstimate: +((price / (views / 1000))).toFixed(2),
        verificationMethod: newVerificationMethod,
        verificationEvidence: newVerificationEvidence || 'Bot added as administrator with post management permissions.',
      },
      [
        {
          formatType: 'post_1_24',
          name: '1 hour top / 24 hours feed',
          description: '1 hour pinned at top of channel, stays 24 hours in main feed before deletion.',
          durationHours: 24,
          priceUsd: price,
        },
      ]
    );

    setShowAddListingModal(false);
    // Reset form
    setNewName('');
    setNewUsername('');
    setNewUrl('');
    setNewDescription('');
  };

  const handleCreateHotDeal = (e: React.FormEvent) => {
    e.preventDefault();
    setHotDealError(null);
    setHotDealSuccess(null);

    try {
      const listing = myListings.find((l) => l.id === selectedListingForDeal);
      if (!listing) throw new Error('Listing not found');
      const pkgId = selectedPackageForDeal || listing.packages[0]?.id;
      if (!pkgId) throw new Error('No packages available for this listing');

      createHotDeal(listing.id, pkgId, dealDiscountPct);
      setHotDealSuccess(`Hot Deal activated! 20% discount will run for the next 7 days.`);
    } catch (err: any) {
      setHotDealError(err.message || 'Failed to create Hot Deal');
    }
  };

  const handleApplyDiamond = (e: React.FormEvent) => {
    e.preventDefault();
    setDiamondSuccess(null);
    try {
      applyForDiamondBadge(diamondListingId, diamondSubmittedUrl, diamondEvidence);
      setDiamondSuccess('Diamond Badge application submitted! Administrators will verify the bio link within 24 hours.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingOrderId || !publicationUrl.trim()) return;

    submitPublication(publishingOrderId, publicationUrl.trim(), publicationProofUrl.trim() || undefined);
    setPublishingOrderId(null);
    setPublicationUrl('');
    setPublicationProofUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & KPI Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Creator & Channel Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Owner Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your Telegram channels, groups, and X accounts, configure promotion pricing, and track advertising orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddListingModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Telegram or X Listing</span>
          </button>

          <button
            onClick={onOpenWithdrawal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Available Earnings</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${userWallet.availableBalanceUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>Ready for instant crypto payout</span>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Escrow & Orders</div>
          <div className="text-2xl font-bold text-blue-400 tabular-nums mt-1">
            {myOrders.filter((o) => ['accepted', 'in_progress', 'published'].includes(o.status)).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Promotions currently in delivery
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Approved Listings</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            {myListings.filter((l) => l.status === 'approved').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {myListings.filter((l) => l.status === 'submitted' || l.status === 'under_review').length} under review
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Lifetime Earnings</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${userWallet.totalEarnedUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ${userWallet.totalWithdrawnUsd.toFixed(2)} withdrawn
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'listings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          My Listings ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>Incoming & Active Orders</span>
          {myOrders.filter((o) => o.status === 'pending_owner_acceptance').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('hot_deals')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'hot_deals'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Hot Deals (7-Day Cooldown)</span>
        </button>

        <button
          onClick={() => setActiveTab('diamond')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'diamond'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Exclusive Diamond Badge</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'earnings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Payouts & Ledger
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY LISTINGS */}
      {/* ======================================================== */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <p className="text-white font-semibold">You have not added any channels or accounts yet.</p>
              <button
                onClick={() => setShowAddListingModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Add Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.avatarUrl}
                        alt={listing.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-white text-base">{listing.name}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-300">@{listing.username}</span>
                          <span aria-hidden="true">·</span>
                          <span>{listing.platform.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Moderation Status Pill */}
                    <div className="shrink-0">
                      {listing.status === 'approved' && (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                          Approved & Live
                        </span>
                      )}
                      {(listing.status === 'submitted' || listing.status === 'under_review') && (
                        <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
                          Under Moderation
                        </span>
                      )}
                      {listing.status === 'rejected' && (
                        <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 rounded">
                          Rejected
                        </span>
                      )}
                      {listing.status === 'suspended' && (
                        <span className="text-[11px] font-semibold text-red-500 bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded">
                          Suspended
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantitative Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Audience</div>
                      <div className="font-bold text-white tabular-nums mt-0.5">{listing.audienceCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Avg Views</div>
                      <div className="font-bold text-white tabular-nums mt-0.5">{listing.viewsPerPost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Packages</div>
                      <div className="font-bold text-blue-400 tabular-nums mt-0.5">{listing.packages.length} active</div>
                    </div>
                  </div>

                  {listing.status === 'rejected' && listing.rejectionReason && (
                    <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-xs text-rose-300">
                      <strong>Rejection reason:</strong> {listing.rejectionReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">
                      Verification: <strong className="text-slate-300">{listing.verificationMethod}</strong>
                    </span>

                    <button
                      onClick={() => onNavigateToListing(listing.id)}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      View Public Marketplace Page →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INCOMING & ACTIVE ORDERS */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              No promotion orders received yet. Once advertisers book your channel packages, orders appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-white">{ord.orderNumber}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-blue-400 font-semibold">{ord.listingName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Buyer: {ord.buyerName} · Booked format: {ord.packageName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-white tabular-nums">
                        ${ord.ownerPayoutUsd.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Net Payout (Order: ${ord.priceUsd})
                      </div>
                    </div>
                  </div>

                  {/* Order Ad Copy & Instructions */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs">
                    <div className="font-semibold text-slate-300">Advertising Text to Post:</div>
                    <p className="text-white whitespace-pre-wrap font-mono text-[11px] bg-slate-950 p-3 rounded border border-slate-800/80">
                      {ord.adText}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                      <div>Target Link: <a href={ord.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{ord.targetUrl}</a></div>
                      {ord.instructions && <div>Instructions: <span className="text-slate-300">{ord.instructions}</span></div>}
                    </div>
                  </div>

                  {/* Order Status & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-semibold text-white capitalize bg-slate-800 px-2 py-0.5 rounded">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                      {ord.deadlineAt && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Deadline: {new Date(ord.deadlineAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.status === 'pending_owner_acceptance' && (
                        <button
                          onClick={() => acceptOrder(ord.id)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                        >
                          Accept Order & Start Delivery Window
                        </button>
                      )}

                      {(ord.status === 'accepted' || ord.status === 'in_progress') && (
                        <button
                          onClick={() => {
                            setPublishingOrderId(ord.id);
                            setPublicationUrl('');
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                        >
                          Submit Publication Link
                        </button>
                      )}

                      {ord.status === 'published' && ord.publicationUrl && (
                        <a
                          href={ord.publicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                        >
                          <span>View Submitted Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {ord.status === 'completed' && (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved by Buyer · Funds Credited</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HOT DEALS (7-DAY COOLDOWN ENFORCED) */}
      {/* ======================================================== */}
      {activeTab === 'hot_deals' && (
        <div className="max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Limited Hot Deal</h3>
              <p className="text-xs text-slate-400">
                Discount an advertising package to gain top visibility on PROM.IO's Hot Deals section.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1 leading-relaxed">
            <div className="font-semibold text-amber-400">Strict Marketplace Rule: 7-Day Rolling Cooldown</div>
            <p className="text-slate-400">
              Each channel owner may create at most 1 Hot Deal every 7 rolling days. The discount runs for up to 7 consecutive days and expires automatically.
            </p>
          </div>

          {hotDealError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{hotDealError}</div>
            </div>
          )}

          {hotDealSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{hotDealSuccess}</div>
            </div>
          )}

          <form onSubmit={handleCreateHotDeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Channel / Account
              </label>
              <select
                value={selectedListingForDeal}
                onChange={(e) => setSelectedListingForDeal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {myListings.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} (@{l.username})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discount Percentage
              </label>
              <div className="flex items-center gap-2">
                {[15, 20, 25, 30, 40].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDealDiscountPct(pct)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      dealDiscountPct === pct
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pct}% OFF
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors shadow-lg shadow-amber-600/20"
            >
              Activate 7-Day Hot Deal
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EXCLUSIVE DIAMOND BADGE */}
      {/* ======================================================== */}
      {activeTab === 'diamond' && (
        <div className="max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">PROM.IO Exclusive Diamond Badge</h3>
              <p className="text-xs text-slate-400">
                Unlock top placement and higher advertiser conversions with the Exclusive Diamond badge.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300 leading-relaxed">
            <div className="font-semibold text-cyan-300">Mandatory Diamond Requirements:</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Listing must be verified and approved by PROM.IO moderation.</li>
              <li>Add your official PROM.IO link (e.g. <span className="font-mono text-cyan-300">prom.io/c/your_channel</span>) to your Telegram channel description or X account bio.</li>
              <li>Submit this application; our crawler and administrators will verify link presence.</li>
              <li>Re-verified periodically; removing the link revokes Diamond status.</li>
            </ol>
          </div>

          {diamondSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{diamondSuccess}</div>
            </div>
          )}

          <form onSubmit={handleApplyDiamond} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Channel / Account
              </label>
              <select
                value={diamondListingId}
                onChange={(e) => setDiamondListingId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {myListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.hasDiamondBadge ? '(Already Diamond)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official PROM.IO Link Placed in Bio
              </label>
              <input
                type="url"
                value={diamondSubmittedUrl}
                onChange={(e) => setDiamondSubmittedUrl(e.target.value)}
                placeholder="https://prom.io/c/your_channel"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verification Notes / Proof
              </label>
              <textarea
                rows={3}
                value={diamondEvidence}
                onChange={(e) => setDiamondEvidence(e.target.value)}
                placeholder="Added link in channel description on line 3. Bio text: 'Direct sponsorship booking via prom.io/c/...'"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg shadow-cyan-600/20"
            >
              Submit Diamond Verification Application
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PAYOUTS & WALLET LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Payout Requests & Ledger History</h3>
            <button
              onClick={onOpenWithdrawal}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Request Crypto Withdrawal
            </button>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Asset / Network</th>
                  <th className="p-3.5">Amount (USD)</th>
                  <th className="p-3.5">Destination Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">TX Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {myWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No withdrawal requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  myWithdrawals.map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(wth.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-medium text-white whitespace-nowrap">
                        {wth.asset} ({wth.network})
                      </td>
                      <td className="p-3.5 font-bold text-white tabular-nums">
                        ${wth.amountUsd.toFixed(2)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px] truncate max-w-[150px]">
                        {wth.destinationAddress}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          wth.status === 'paid' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : wth.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {wth.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {wth.txHash ? `${wth.txHash.slice(0, 8)}...` : 'Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUBMIT PUBLICATION PROOF */}
      {/* ======================================================== */}
      {publishingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Submit Publication Verification</h3>
              <button onClick={() => setPublishingOrderId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Live Public Post URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={publicationUrl}
                  onChange={(e) => setPublicationUrl(e.target.value)}
                  placeholder="https://t.me/channel_name/123 or https://x.com/username/status/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The buyer and PROM.IO admin will inspect this link to verify that the ad was published according to terms.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Screenshot Proof URL (Optional)
                </label>
                <input
                  type="url"
                  value={publicationProofUrl}
                  onChange={(e) => setPublicationProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPublishingOrderId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  Confirm & Notify Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW LISTING */}
      {/* ======================================================== */}
      {showAddListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-lg">Add New Channel or Account</h3>
                <p className="text-xs text-slate-400">All submissions undergo mandatory administrator moderation before going live.</p>
              </div>
              <button onClick={() => setShowAddListingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['telegram_channel', 'telegram_group', 'x_account'] as PlatformType[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPlatform(p)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                        newPlatform === p
                          ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p === 'telegram_channel' ? 'Telegram Channel' : p === 'telegram_group' ? 'Telegram Group' : 'X Account'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Crypto Alpha Signals"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username / Handle <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="crypto_alpha_signals"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Public URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://t.me/crypto_alpha_signals or https://x.com/handle"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Channel Description & Content Focus <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed breakdown of your audience demographics, post frequency, and accepted advertising niches..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Crypto & Web3">Crypto & Web3</option>
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Business & Finance">Business & Finance</option>
                    <option value="Gaming & Esports">Gaming & Esports</option>
                    <option value="Lifestyle & Culture">Lifestyle & Culture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Audience Size</label>
                  <input
                    type="number"
                    value={newAudienceCount}
                    onChange={(e) => setNewAudienceCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Starting Price (USD)</label>
                  <input
                    type="number"
                    value={initialPackagePrice}
                    onChange={(e) => setInitialPackagePrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Ownership Verification Instruction Box */}
              <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-xl space-y-1.5 text-xs text-blue-200">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Mandatory Ownership Verification Step:</span>
                </div>
                <p className="text-[11px] text-blue-300/80 leading-relaxed">
                  {newPlatform.includes('telegram')
                    ? 'Add @PromioVerificationBot to your Telegram channel as an administrator with "Post Messages" permission, OR paste a temporary verification post containing "PROM-VERIFY-2026" in your channel.'
                    : 'Add "prom.io/verify" to your X profile bio temporarily until moderation approval.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddListingModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  Submit Listing for Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
