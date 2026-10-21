import { useState, useEffect } from 'react';
import { 
  Listing, 
  PromotionPackage, 
  HotDeal, 
  DiamondVerification, 
  Order, 
  Wallet, 
  WalletLedgerEntry, 
  DepositRequest, 
  WithdrawalRequest, 
  StatisticsSnapshot, 
  AppNotification, 
  MarketplaceSettings, 
  Review, 
  UserProfile,
  Dispute,
  ScheduledJobRun,
  ReviewAuditLog,
  SatisfactionLevel
} from '../types';
import { 
  SEED_USERS, 
  INITIAL_LISTINGS, 
  INITIAL_ORDERS, 
  INITIAL_WALLETS, 
  INITIAL_LEDGER, 
  INITIAL_DEPOSIT_REQUESTS, 
  INITIAL_WITHDRAWAL_REQUESTS, 
  INITIAL_DIAMOND_VERIFICATIONS, 
  INITIAL_REVIEWS, 
  INITIAL_SETTINGS, 
  INITIAL_NOTIFICATIONS, 
  generateSnapshotsForListing 
} from './mockData';

const STORAGE_KEY = 'promio_marketplace_state_v1';

interface AppState {
  users: UserProfile[];
  currentUserId: string;
  listings: Listing[];
  orders: Order[];
  disputes: Dispute[];
  wallets: Record<string, Wallet>;
  ledger: WalletLedgerEntry[];
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  diamondVerifications: DiamondVerification[];
  reviews: Review[];
  reviewAuditLogs: ReviewAuditLog[];
  settings: MarketplaceSettings;
  notifications: AppNotification[];
  snapshots: Record<string, StatisticsSnapshot[]>;
  jobRuns: ScheduledJobRun[];
}

const getInitialState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.reviewAuditLogs) parsed.reviewAuditLogs = [];
      return parsed;
    } catch (e) {
      console.warn('Failed to parse saved state, resetting to seed data.', e);
    }
  }

  // Pre-seed 30-day snapshots for existing approved listings
  const initialSnapshots: Record<string, StatisticsSnapshot[]> = {};
  INITIAL_LISTINGS.forEach((l) => {
    initialSnapshots[l.id] = generateSnapshotsForListing(l.id, l.audienceCount, 30);
  });

  return {
    users: SEED_USERS,
    currentUserId: SEED_USERS[0].id, // default to Alex Vance (buyer)
    listings: INITIAL_LISTINGS,
    orders: INITIAL_ORDERS,
    disputes: [],
    wallets: INITIAL_WALLETS,
    ledger: INITIAL_LEDGER,
    depositRequests: INITIAL_DEPOSIT_REQUESTS,
    withdrawalRequests: INITIAL_WITHDRAWAL_REQUESTS,
    diamondVerifications: INITIAL_DIAMOND_VERIFICATIONS,
    reviews: INITIAL_REVIEWS,
    reviewAuditLogs: [
      {
        id: 'rev-audit-init-1',
        reviewId: 'rev-001',
        adminId: 'usr-admin-004',
        adminName: 'System Administrator',
        action: 'approve',
        reason: 'Automated policy compliance check passed.',
        createdAt: '2026-10-16T18:05:00Z',
      },
    ],
    settings: INITIAL_SETTINGS,
    notifications: INITIAL_NOTIFICATIONS,
    snapshots: initialSnapshots,
    jobRuns: [
      {
        id: 'job-init-01',
        jobName: 'daily_statistics_sync',
        status: 'success',
        recordsProcessed: 5,
        startedAt: '2026-10-18T00:00:00Z',
        completedAt: '2026-10-18T00:02:14Z',
      },
    ],
  };
};

let globalState: AppState = getInitialState();
const listeners = new Set<() => void>();

const notify = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  listeners.forEach((listener) => listener());
};

export const useAppStore = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const currentUser = globalState.users.find((u) => u.id === globalState.currentUserId) || globalState.users[0];
  const userWallet = globalState.wallets[currentUser.id] || {
    userId: currentUser.id,
    availableBalanceUsd: 0,
    reservedBalanceUsd: 0,
    totalDepositedUsd: 0,
    totalEarnedUsd: 0,
    totalWithdrawnUsd: 0,
  };

  const userNotifications = globalState.notifications.filter((n) => n.userId === currentUser.id);
  const unreadNotificationsCount = userNotifications.filter((n) => !n.isRead).length;

  // ==========================================
  // AUTH & USER SWITCHING
  // ==========================================
  const switchUser = (userId: string) => {
    if (globalState.users.some((u) => u.id === userId)) {
      globalState.currentUserId = userId;
      notify();
    }
  };

  const updateProfile = (fullName: string) => {
    globalState.users = globalState.users.map((u) => 
      u.id === currentUser.id ? { ...u, fullName } : u
    );
    notify();
  };

  // ==========================================
  // LISTING MANAGEMENT & MODERATION
  // ==========================================
  const submitListing = (listingData: Omit<Listing, 'id' | 'ownerId' | 'ownerName' | 'status' | 'createdAt' | 'updatedAt' | 'packages' | 'hasDiamondBadge' | 'responseRatePercent' | 'completedOrdersCount' | 'rating' | 'reviewCount'>, initialPackages: Omit<PromotionPackage, 'id' | 'listingId' | 'isActive'>[]) => {
    const newId = `list-${Date.now()}`;
    const packages: PromotionPackage[] = initialPackages.map((p, idx) => ({
      ...p,
      id: `pkg-${newId}-${idx + 1}`,
      listingId: newId,
      isActive: true,
    }));

    const newListing: Listing = {
      ...listingData,
      id: newId,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      status: 'submitted', // Mandatory Admin Moderation!
      hasDiamondBadge: false,
      responseRatePercent: 100,
      completedOrdersCount: 0,
      rating: 0,
      reviewCount: 0,
      packages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalState.listings = [newListing, ...globalState.listings];
    globalState.snapshots[newId] = generateSnapshotsForListing(newId, listingData.audienceCount, 7);

    // Notify Admins
    addNotification({
      userId: 'usr-admin-004',
      type: 'moderation',
      title: 'New Listing Submitted',
      message: `${currentUser.fullName} submitted "${newListing.name}" (${newListing.platform}) for moderation.`,
      linkUrl: '/admin/moderation',
    });

    notify();
    return newListing;
  };

  const adminModerateListing = (listingId: string, decision: 'approved' | 'rejected' | 'suspended' | 'reverification_required', reason?: string) => {
    globalState.listings = globalState.listings.map((l) => {
      if (l.id !== listingId) return l;
      return {
        ...l,
        status: decision,
        rejectionReason: reason,
        verifiedAt: decision === 'approved' ? new Date().toISOString() : l.verifiedAt,
        updatedAt: new Date().toISOString(),
      };
    });

    const targetListing = globalState.listings.find((l) => l.id === listingId);
    if (targetListing) {
      addNotification({
        userId: targetListing.ownerId,
        type: 'moderation',
        title: `Listing ${decision.toUpperCase()}: ${targetListing.name}`,
        message: decision === 'approved' 
          ? `Your listing "${targetListing.name}" has been approved and is now live in the PROM.IO marketplace!`
          : `Your listing "${targetListing.name}" was marked as ${decision}. Reason: ${reason || 'Editorial review criteria.'}`,
        linkUrl: `/listing/${listingId}`,
      });
    }

    notify();
  };

  // ==========================================
  // PACKAGE & HOT DEALS MANAGEMENT (7-DAY LIMIT)
  // ==========================================
  const addPackageToListing = (listingId: string, pkg: Omit<PromotionPackage, 'id' | 'listingId' | 'isActive'>) => {
    const newPkg: PromotionPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      listingId,
      isActive: true,
    };
    globalState.listings = globalState.listings.map((l) => {
      if (l.id !== listingId) return l;
      return { ...l, packages: [...l.packages, newPkg] };
    });
    notify();
  };

  const createHotDeal = (listingId: string, packageId: string, discountPercentage: number, durationDays = 7) => {
    const listing = globalState.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    // ENFORCE 7-DAY COOLDOWN RULE ON BACKEND!
    // Check if this owner has created any hot deal in the last 7 days
    const ownerListings = globalState.listings.filter((l) => l.ownerId === currentUser.id);
    const existingActiveDeals = ownerListings.flatMap((l) => l.activeHotDeal ? [l.activeHotDeal] : []);
    
    const now = new Date();
    for (const deal of existingActiveDeals) {
      const dealStart = new Date(deal.startTime);
      const daysSince = (now.getTime() - dealStart.getTime()) / (1000 * 3600 * 24);
      if (daysSince < globalState.settings.hotDealCooldownDays) {
        const remainingHours = Math.ceil((globalState.settings.hotDealCooldownDays - daysSince) * 24);
        throw new Error(`Hot Deal cooldown active! You can create 1 Hot Deal every ${globalState.settings.hotDealCooldownDays} days. Please wait ${remainingHours} more hours.`);
      }
    }

    const targetPkg = listing.packages.find((p) => p.id === packageId);
    if (!targetPkg) throw new Error('Package not found');

    const discountedPrice = +(targetPkg.priceUsd * (1 - discountPercentage / 100)).toFixed(2);
    const endTime = new Date(now.getTime() + durationDays * 24 * 3600 * 1000).toISOString();

    const newDeal: HotDeal = {
      id: `deal-${Date.now()}`,
      listingId,
      packageId,
      originalPriceUsd: targetPkg.priceUsd,
      discountedPriceUsd: discountedPrice,
      discountPercentage,
      startTime: now.toISOString(),
      endTime,
      status: 'active',
    };

    globalState.listings = globalState.listings.map((l) => 
      l.id === listingId ? { ...l, activeHotDeal: newDeal } : l
    );

    addNotification({
      userId: currentUser.id,
      type: 'hot_deal',
      title: 'Hot Deal Activated!',
      message: `25% off deal is now active for ${listing.name} until ${new Date(endTime).toLocaleDateString()}.`,
      linkUrl: `/listing/${listingId}`,
    });

    notify();
    return newDeal;
  };

  // ==========================================
  // EXCLUSIVE DIAMOND BADGE VERIFICATION
  // ==========================================
  const applyForDiamondBadge = (listingId: string, submittedUrl: string, evidenceText: string) => {
    const listing = globalState.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    const newVerification: DiamondVerification = {
      id: `dia-${Date.now()}`,
      listingId,
      listingName: listing.name,
      submittedUrl,
      evidenceText,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };

    globalState.diamondVerifications = [newVerification, ...globalState.diamondVerifications];

    addNotification({
      userId: 'usr-admin-004',
      type: 'diamond',
      title: 'Diamond Badge Application',
      message: `${currentUser.fullName} applied for Diamond Badge on "${listing.name}". Verified bio link: ${submittedUrl}`,
      linkUrl: '/admin/diamond',
    });

    notify();
  };

  const adminModerateDiamondBadge = (verificationId: string, decision: 'verified' | 'revoked', notes?: string) => {
    const verification = globalState.diamondVerifications.find((v) => v.id === verificationId);
    if (!verification) return;

    globalState.diamondVerifications = globalState.diamondVerifications.map((v) => 
      v.id === verificationId ? {
        ...v,
        status: decision,
        reviewedBy: currentUser.id,
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        notes,
      } : v
    );

    // Update listing
    globalState.listings = globalState.listings.map((l) => 
      l.id === verification.listingId ? {
        ...l,
        hasDiamondBadge: decision === 'verified',
        diamondVerifiedAt: decision === 'verified' ? new Date().toISOString() : undefined,
      } : l
    );

    const targetListing = globalState.listings.find((l) => l.id === verification.listingId);
    if (targetListing) {
      addNotification({
        userId: targetListing.ownerId,
        type: 'diamond',
        title: decision === 'verified' ? '💎 Exclusive Diamond Badge Awarded!' : 'Diamond Badge Revoked',
        message: decision === 'verified'
          ? `Congratulations! PROM.IO Exclusive Diamond Badge is now active on "${targetListing.name}".`
          : `Diamond Badge status was revoked for "${targetListing.name}". Notes: ${notes || 'Link no longer detected in bio.'}`,
        linkUrl: `/listing/${targetListing.id}`,
      });
    }

    notify();
  };

  // ==========================================
  // ORDER CREATION & ATOMIC ESCROW
  // ==========================================
  const createOrder = (listingId: string, packageId: string, orderDetails: {
    adText: string;
    targetUrl: string;
    creativeUrl?: string;
    instructions?: string;
    deliveryWindowHours?: number;
  }) => {
    const listing = globalState.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'approved') throw new Error('Cannot place orders on unapproved listings');

    const pkg = listing.packages.find((p) => p.id === packageId);
    if (!pkg) throw new Error('Package not found');

    // Calculate final price checking active hot deal
    let finalPrice = pkg.priceUsd;
    if (listing.activeHotDeal && listing.activeHotDeal.packageId === pkg.id && listing.activeHotDeal.status === 'active') {
      finalPrice = listing.activeHotDeal.discountedPriceUsd;
    }

    // Check Buyer Wallet Balance
    const buyerWallet = globalState.wallets[currentUser.id] || {
      userId: currentUser.id,
      availableBalanceUsd: 0,
      reservedBalanceUsd: 0,
      totalDepositedUsd: 0,
      totalEarnedUsd: 0,
      totalWithdrawnUsd: 0,
    };

    if (buyerWallet.availableBalanceUsd < finalPrice) {
      throw new Error(`Insufficient funds. Your available balance is $${buyerWallet.availableBalanceUsd.toFixed(2)}, but order cost is $${finalPrice.toFixed(2)}. Please add funds.`);
    }

    const platformFee = +(finalPrice * (globalState.settings.marketplaceFeePercent / 100)).toFixed(2);
    const ownerPayout = +(finalPrice - platformFee).toFixed(2);
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `PRM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. ATOMIC WALLET ESCROW LOCK
    buyerWallet.availableBalanceUsd -= finalPrice;
    buyerWallet.reservedBalanceUsd += finalPrice;
    globalState.wallets[currentUser.id] = { ...buyerWallet };

    // 2. RECORD IN LEDGER
    const ledgerEntry: WalletLedgerEntry = {
      id: `led-${Date.now()}`,
      userId: currentUser.id,
      entryType: 'order_reservation',
      amountUsd: -finalPrice,
      balanceAfterUsd: buyerWallet.availableBalanceUsd,
      relatedOrderId: orderId,
      idempotencyKey: `idemp-ord-res-${orderId}`,
      description: `Escrow lock for Order ${orderNumber} (${listing.name})`,
      createdAt: new Date().toISOString(),
    };
    globalState.ledger = [ledgerEntry, ...globalState.ledger];

    // 3. CREATE ORDER WITH IMMUTABLE PRICE SNAPSHOT
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      listingId: listing.id,
      listingName: listing.name,
      listingUsername: listing.username,
      listingPlatform: listing.platform,
      ownerId: listing.ownerId,
      packageId: pkg.id,
      packageName: pkg.name,
      formatType: pkg.formatType,
      originalPriceUsd: pkg.priceUsd,
      priceUsd: finalPrice,
      platformFeeUsd: platformFee,
      ownerPayoutUsd: ownerPayout,
      adText: orderDetails.adText,
      targetUrl: orderDetails.targetUrl,
      creativeUrl: orderDetails.creativeUrl,
      instructions: orderDetails.instructions,
      deliveryWindowHours: orderDetails.deliveryWindowHours || 48,
      status: 'pending_owner_acceptance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalState.orders = [newOrder, ...globalState.orders];

    // 4. NOTIFY OWNER
    addNotification({
      userId: listing.ownerId,
      type: 'order',
      title: 'New Promotion Order Received',
      message: `${currentUser.fullName} ordered "${pkg.name}" for $${finalPrice.toFixed(2)}. Please accept within 48h.`,
      linkUrl: `/owner/orders`,
    });

    notify();
    return newOrder;
  };

  const acceptOrder = (orderId: string) => {
    const order = globalState.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.ownerId !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + order.deliveryWindowHours * 3600 * 1000).toISOString();

    globalState.orders = globalState.orders.map((o) => 
      o.id === orderId ? {
        ...o,
        status: 'in_progress',
        acceptedAt: now.toISOString(),
        deadlineAt: deadline,
        updatedAt: now.toISOString(),
      } : o
    );

    addNotification({
      userId: order.buyerId,
      type: 'order',
      title: 'Order Accepted & In Progress',
      message: `The channel owner accepted your promotion order ${order.orderNumber}. Scheduled delivery by ${new Date(deadline).toLocaleString()}.`,
      linkUrl: `/orders/${order.id}`,
    });

    notify();
  };

  const submitPublication = (orderId: string, postUrl: string, proofImageUrl?: string) => {
    const order = globalState.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.ownerId !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const now = new Date().toISOString();

    globalState.orders = globalState.orders.map((o) => 
      o.id === orderId ? {
        ...o,
        status: 'published',
        publishedAt: now,
        publicationUrl: postUrl,
        publicationProofUrl: proofImageUrl,
        updatedAt: now,
      } : o
    );

    addNotification({
      userId: order.buyerId,
      type: 'order',
      title: 'Ad Published — Please Verify',
      message: `Your promotional post has been published by the channel owner. Inspect link and confirm delivery to complete the order.`,
      linkUrl: `/orders/${order.id}`,
    });

    notify();
  };

  const confirmOrderDelivery = (orderId: string) => {
    const order = globalState.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.buyerId !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const now = new Date().toISOString();

    // 1. UPDATE BUYER RESERVED BALANCE
    const buyerWallet = globalState.wallets[order.buyerId];
    if (buyerWallet) {
      buyerWallet.reservedBalanceUsd = Math.max(0, buyerWallet.reservedBalanceUsd - order.priceUsd);
    }

    // 2. CREDIT OWNER AVAILABLE EARNINGS
    let ownerWallet = globalState.wallets[order.ownerId];
    if (!ownerWallet) {
      ownerWallet = {
        userId: order.ownerId,
        availableBalanceUsd: 0,
        reservedBalanceUsd: 0,
        totalDepositedUsd: 0,
        totalEarnedUsd: 0,
        totalWithdrawnUsd: 0,
      };
      globalState.wallets[order.ownerId] = ownerWallet;
    }
    ownerWallet.availableBalanceUsd += order.ownerPayoutUsd;
    ownerWallet.totalEarnedUsd += order.ownerPayoutUsd;

    // 3. RECORD IMMUTABLE LEDGER ENTRIES
    const payoutLedger: WalletLedgerEntry = {
      id: `led-payout-${Date.now()}`,
      userId: order.ownerId,
      entryType: 'order_payout',
      amountUsd: order.ownerPayoutUsd,
      balanceAfterUsd: ownerWallet.availableBalanceUsd,
      relatedOrderId: order.id,
      idempotencyKey: `idemp-payout-${order.id}`,
      description: `Completed order payout for ${order.orderNumber} (Net $${order.ownerPayoutUsd.toFixed(2)})`,
      createdAt: now,
    };

    const feeLedger: WalletLedgerEntry = {
      id: `led-fee-${Date.now()}`,
      userId: 'usr-admin-004',
      entryType: 'platform_fee',
      amountUsd: order.platformFeeUsd,
      balanceAfterUsd: 0,
      relatedOrderId: order.id,
      idempotencyKey: `idemp-fee-${order.id}`,
      description: `Marketplace fee earned from Order ${order.orderNumber} ($${order.platformFeeUsd.toFixed(2)})`,
      createdAt: now,
    };

    globalState.ledger = [payoutLedger, feeLedger, ...globalState.ledger];

    // 4. UPDATE ORDER STATE
    globalState.orders = globalState.orders.map((o) => 
      o.id === orderId ? {
        ...o,
        status: 'completed',
        completedAt: now,
        updatedAt: now,
      } : o
    );

    // 5. UPDATE LISTING COMPLETED ORDERS COUNT
    globalState.listings = globalState.listings.map((l) => 
      l.id === order.listingId ? {
        ...l,
        completedOrdersCount: l.completedOrdersCount + 1,
      } : l
    );

    // 6. NOTIFY OWNER
    addNotification({
      userId: order.ownerId,
      type: 'financial',
      title: 'Order Completed & Payout Released',
      message: `Buyer approved Order ${order.orderNumber}. $${order.ownerPayoutUsd.toFixed(2)} has been credited to your available balance!`,
      linkUrl: `/owner/earnings`,
    });

    notify();
  };

  const openDispute = (orderId: string, reason: string, evidenceText: string) => {
    const order = globalState.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const disputeId = `disp-${Date.now()}`;
    const newDispute: Dispute = {
      id: disputeId,
      orderId,
      orderNumber: order.orderNumber,
      initiatorId: currentUser.id,
      initiatorRole: currentUser.id === order.buyerId ? 'buyer' : 'owner',
      reason,
      evidenceText,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    globalState.disputes = [newDispute, ...globalState.disputes];
    globalState.orders = globalState.orders.map((o) => 
      o.id === orderId ? {
        ...o,
        status: 'disputed',
        disputedAt: new Date().toISOString(),
        disputeReason: reason,
        updatedAt: new Date().toISOString(),
      } : o
    );

    addNotification({
      userId: 'usr-admin-004',
      type: 'order',
      title: 'New Dispute Escalated',
      message: `Dispute opened on Order ${order.orderNumber}. Reason: ${reason}`,
      linkUrl: '/admin/orders',
    });

    notify();
  };

  const adminResolveDispute = (disputeId: string, resolution: 'refund_buyer' | 'release_to_owner', adminNotes: string) => {
    const dispute = globalState.disputes.find((d) => d.id === disputeId);
    if (!dispute) return;
    const order = globalState.orders.find((o) => o.id === dispute.orderId);
    if (!order) return;

    const now = new Date().toISOString();

    if (resolution === 'refund_buyer') {
      // Refund reserved funds back to buyer available
      const buyerWallet = globalState.wallets[order.buyerId];
      if (buyerWallet) {
        buyerWallet.reservedBalanceUsd = Math.max(0, buyerWallet.reservedBalanceUsd - order.priceUsd);
        buyerWallet.availableBalanceUsd += order.priceUsd;
      }

      globalState.ledger = [{
        id: `led-ref-${Date.now()}`,
        userId: order.buyerId,
        entryType: 'order_refund',
        amountUsd: order.priceUsd,
        balanceAfterUsd: buyerWallet ? buyerWallet.availableBalanceUsd : 0,
        relatedOrderId: order.id,
        idempotencyKey: `idemp-ref-${order.id}`,
        description: `Dispute resolved in buyer favor: Refund for Order ${order.orderNumber}`,
        authorizedBy: currentUser.id,
        createdAt: now,
      }, ...globalState.ledger];

      globalState.orders = globalState.orders.map((o) => 
        o.id === order.id ? { ...o, status: 'refunded', refundReason: adminNotes, updatedAt: now } : o
      );
    } else {
      // Release to owner
      confirmOrderDelivery(order.id);
    }

    globalState.disputes = globalState.disputes.map((d) => 
      d.id === disputeId ? {
        ...d,
        status: resolution === 'refund_buyer' ? 'resolved_refunded' : 'resolved_released',
        adminNotes,
        resolvedAt: now,
        resolvedBy: currentUser.id,
      } : d
    );

    notify();
  };

  // ==========================================
  // CRYPTO DEPOSITS (ADD FUNDS) & WITHDRAWALS
  // ==========================================
  const submitDepositRequest = (asset: any, network: string, amountCrypto: number, amountUsd: number, txHash: string, receivingAddress: string) => {
    const newReq: DepositRequest = {
      id: `dep-${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      asset,
      network,
      amountCrypto,
      amountUsd,
      txHash,
      receivingAddress,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };

    globalState.depositRequests = [newReq, ...globalState.depositRequests];

    addNotification({
      userId: 'usr-admin-004',
      type: 'financial',
      title: 'New Crypto Deposit Submitted',
      message: `${currentUser.email} submitted a deposit of $${amountUsd.toFixed(2)} (${asset} on ${network}). Verify TX: ${txHash.slice(0, 10)}...`,
      linkUrl: '/admin/finance',
    });

    notify();
    return newReq;
  };

  const adminReviewDeposit = (depositId: string, decision: 'approved' | 'rejected', reason?: string) => {
    const req = globalState.depositRequests.find((d) => d.id === depositId);
    if (!req) return;
    if (req.status === 'approved') throw new Error('Deposit already credited');

    const now = new Date().toISOString();

    if (decision === 'approved') {
      // Credit wallet
      let wallet = globalState.wallets[req.userId];
      if (!wallet) {
        wallet = {
          userId: req.userId,
          availableBalanceUsd: 0,
          reservedBalanceUsd: 0,
          totalDepositedUsd: 0,
          totalEarnedUsd: 0,
          totalWithdrawnUsd: 0,
        };
        globalState.wallets[req.userId] = wallet;
      }
      wallet.availableBalanceUsd += req.amountUsd;
      wallet.totalDepositedUsd += req.amountUsd;

      // Immutable Ledger Record
      const ledgerEntry: WalletLedgerEntry = {
        id: `led-dep-${Date.now()}`,
        userId: req.userId,
        entryType: 'deposit_credit',
        amountUsd: req.amountUsd,
        balanceAfterUsd: wallet.availableBalanceUsd,
        relatedDepositId: req.id,
        idempotencyKey: `idemp-dep-${req.id}-${req.txHash}`,
        description: `Verified Crypto Deposit: ${req.amountCrypto} ${req.asset} (${req.network})`,
        authorizedBy: currentUser.id,
        createdAt: now,
      };
      globalState.ledger = [ledgerEntry, ...globalState.ledger];
    }

    globalState.depositRequests = globalState.depositRequests.map((d) => 
      d.id === depositId ? {
        ...d,
        status: decision,
        rejectionReason: reason,
        reviewedBy: currentUser.id,
        reviewedAt: now,
      } : d
    );

    addNotification({
      userId: req.userId,
      type: 'financial',
      title: decision === 'approved' ? 'Crypto Deposit Credited' : 'Crypto Deposit Rejected',
      message: decision === 'approved' 
        ? `$${req.amountUsd.toFixed(2)} has been credited to your available balance.`
        : `Your deposit request for $${req.amountUsd.toFixed(2)} was rejected. Reason: ${reason || 'Transaction could not be confirmed on-chain.'}`,
      linkUrl: '/buyer/wallet',
    });

    notify();
  };

  const requestWithdrawal = (asset: any, network: string, destinationAddress: string, amountUsd: number) => {
    const wallet = globalState.wallets[currentUser.id];
    if (!wallet || wallet.availableBalanceUsd < amountUsd) {
      throw new Error(`Insufficient available earnings. Available: $${wallet?.availableBalanceUsd.toFixed(2) || '0.00'}`);
    }
    if (amountUsd < globalState.settings.minimumWithdrawalUsd) {
      throw new Error(`Minimum withdrawal is $${globalState.settings.minimumWithdrawalUsd}`);
    }

    const fee = globalState.settings.withdrawalFeeUsd;
    const netPayout = +(amountUsd - fee).toFixed(2);
    const reqId = `wth-${Date.now()}`;

    // 1. ATOMICALLY RESERVE FUNDS
    wallet.availableBalanceUsd -= amountUsd;
    wallet.reservedBalanceUsd += amountUsd;

    // 2. RECORD LEDGER RESERVATION
    const ledgerEntry: WalletLedgerEntry = {
      id: `led-wth-res-${Date.now()}`,
      userId: currentUser.id,
      entryType: 'withdrawal_reservation',
      amountUsd: -amountUsd,
      balanceAfterUsd: wallet.availableBalanceUsd,
      relatedWithdrawalId: reqId,
      idempotencyKey: `idemp-wth-res-${reqId}`,
      description: `Withdrawal request submitted: $${amountUsd.toFixed(2)} via ${asset} (${network})`,
      createdAt: new Date().toISOString(),
    };
    globalState.ledger = [ledgerEntry, ...globalState.ledger];

    // 3. CREATE WITHDRAWAL RECORD
    const newReq: WithdrawalRequest = {
      id: reqId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      asset,
      network,
      destinationAddress,
      amountUsd,
      feeUsd: fee,
      netPayoutUsd: netPayout,
      status: 'pending_admin_review',
      createdAt: new Date().toISOString(),
    };

    globalState.withdrawalRequests = [newReq, ...globalState.withdrawalRequests];

    addNotification({
      userId: 'usr-admin-004',
      type: 'financial',
      title: 'Withdrawal Payout Requested',
      message: `${currentUser.email} requested $${amountUsd.toFixed(2)} payout via ${asset} (${network}).`,
      linkUrl: '/admin/finance',
    });

    notify();
    return newReq;
  };

  const adminReviewWithdrawal = (withdrawalId: string, decision: 'paid' | 'rejected', txHash?: string, reason?: string) => {
    const req = globalState.withdrawalRequests.find((w) => w.id === withdrawalId);
    if (!req) return;
    if (req.status === 'paid') throw new Error('Withdrawal already marked paid');

    const wallet = globalState.wallets[req.userId];
    const now = new Date().toISOString();

    if (decision === 'paid') {
      if (!txHash) throw new Error('Transaction hash is required when marking withdrawal as Paid');
      // Deduct from reserved balance and mark total withdrawn
      if (wallet) {
        wallet.reservedBalanceUsd = Math.max(0, wallet.reservedBalanceUsd - req.amountUsd);
        wallet.totalWithdrawnUsd += req.amountUsd;
      }

      globalState.ledger = [{
        id: `led-wth-payout-${Date.now()}`,
        userId: req.userId,
        entryType: 'withdrawal_payout',
        amountUsd: req.netPayoutUsd,
        balanceAfterUsd: wallet?.availableBalanceUsd || 0,
        relatedWithdrawalId: req.id,
        idempotencyKey: `idemp-wth-paid-${req.id}-${txHash}`,
        description: `Withdrawal paid out: $${req.netPayoutUsd.toFixed(2)} via ${req.asset} (TX: ${txHash.slice(0, 10)}...)`,
        authorizedBy: currentUser.id,
        createdAt: now,
      }, ...globalState.ledger];
    } else {
      // RELEASE RESERVED FUNDS BACK TO OWNER AVAILABLE BALANCE!
      if (wallet) {
        wallet.reservedBalanceUsd = Math.max(0, wallet.reservedBalanceUsd - req.amountUsd);
        wallet.availableBalanceUsd += req.amountUsd;
      }

      globalState.ledger = [{
        id: `led-wth-rel-${Date.now()}`,
        userId: req.userId,
        entryType: 'withdrawal_release',
        amountUsd: req.amountUsd,
        balanceAfterUsd: wallet?.availableBalanceUsd || 0,
        relatedWithdrawalId: req.id,
        idempotencyKey: `idemp-wth-rel-${req.id}`,
        description: `Withdrawal rejected: Reserved funds released back to balance`,
        authorizedBy: currentUser.id,
        createdAt: now,
      }, ...globalState.ledger];
    }

    globalState.withdrawalRequests = globalState.withdrawalRequests.map((w) => 
      w.id === withdrawalId ? {
        ...w,
        status: decision,
        txHash,
        rejectionReason: reason,
        reviewedBy: currentUser.id,
        reviewedAt: now,
      } : w
    );

    addNotification({
      userId: req.userId,
      type: 'financial',
      title: decision === 'paid' ? 'Withdrawal Payout Sent!' : 'Withdrawal Request Rejected',
      message: decision === 'paid'
        ? `Your payout of $${req.netPayoutUsd.toFixed(2)} has been sent! TX: ${txHash}`
        : `Your withdrawal request for $${req.amountUsd.toFixed(2)} was rejected. Reserved funds were restored to your balance. Reason: ${reason || 'Invalid address or security review.'}`,
      linkUrl: '/owner/earnings',
    });

    notify();
  };

  // ==========================================
  // AUTOMATED 24-HOUR STATISTICS SYNC
  // ==========================================
  const runScheduledStatisticsSync = () => {
    const started = new Date().toISOString();
    let count = 0;

    globalState.listings.forEach((listing) => {
      if (listing.status !== 'approved') return;

      const randomDelta = Math.floor((Math.random() * 0.005 - 0.001) * listing.audienceCount);
      const newAudience = Math.max(100, listing.audienceCount + randomDelta);
      const newViews = Math.floor(newAudience * (0.3 + Math.random() * 0.05));

      listing.audienceCount = newAudience;
      listing.viewsPerPost = newViews;
      listing.updatedAt = new Date().toISOString();

      const todayStr = new Date().toISOString().split('T')[0];
      const todaySnap: StatisticsSnapshot = {
        id: `snap-${listing.id}-${todayStr}`,
        listingId: listing.id,
        snapshotDate: todayStr,
        audienceCount: newAudience,
        viewsPerPost: newViews,
        engagementRate: listing.engagementRate,
        absoluteChange24h: randomDelta,
        percentChange24h: +((randomDelta / (newAudience - randomDelta)) * 100).toFixed(2),
        dataSource: 'api_sync',
        isVerified: true,
      };

      const existing = globalState.snapshots[listing.id] || [];
      globalState.snapshots[listing.id] = [todaySnap, ...existing.filter((s) => s.snapshotDate !== todayStr)];
      count++;
    });

    const jobRun: ScheduledJobRun = {
      id: `job-${Date.now()}`,
      jobName: 'daily_statistics_sync',
      status: 'success',
      recordsProcessed: count,
      startedAt: started,
      completedAt: new Date().toISOString(),
    };

    globalState.jobRuns = [jobRun, ...globalState.jobRuns];
    notify();
    return jobRun;
  };

  // ==========================================
  // BUYER SATISFACTION & RATING SYSTEM
  // ==========================================
  const SATISFACTION_LABELS: Record<number, SatisfactionLevel> = {
    1: 'Very dissatisfied',
    2: 'Dissatisfied',
    3: 'Average',
    4: 'Satisfied',
    5: 'Very satisfied',
  };

  const canRateOrder = (orderId: string): { canRate: boolean; reason?: string } => {
    const order = globalState.orders.find((o) => o.id === orderId);
    if (!order) return { canRate: false, reason: 'Order not found' };
    if (order.buyerId !== currentUser.id && currentUser.role !== 'admin') {
      return { canRate: false, reason: 'Only the actual buyer who placed this order can rate the channel owner.' };
    }
    if (order.status !== 'completed') {
      return { canRate: false, reason: 'Ratings can only be submitted after the promotion order has been verified and completed.' };
    }
    if (order.ownerId === currentUser.id) {
      return { canRate: false, reason: 'Channel owners are strictly prohibited from rating their own listings.' };
    }
    const alreadyReviewed = globalState.reviews.some((r) => r.orderId === orderId);
    if (alreadyReviewed) {
      return { canRate: false, reason: 'You have already submitted a rating for this order. Only one rating per order is permitted.' };
    }
    return { canRate: true };
  };

  const getReviewForOrder = (orderId: string): Review | undefined => {
    return globalState.reviews.find((r) => r.orderId === orderId);
  };

  const getListingReviewBreakdown = (listingId: string) => {
    const visibleReviews = globalState.reviews.filter((r) => r.listingId === listingId && r.isVisible);
    const total = visibleReviews.length;
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    visibleReviews.forEach((r) => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });

    const percentages: Record<number, number> = {
      1: total > 0 ? Math.round((counts[1] / total) * 100) : 0,
      2: total > 0 ? Math.round((counts[2] / total) * 100) : 0,
      3: total > 0 ? Math.round((counts[3] / total) * 100) : 0,
      4: total > 0 ? Math.round((counts[4] / total) * 100) : 0,
      5: total > 0 ? Math.round((counts[5] / total) * 100) : 0,
    };

    const avg = total > 0 ? +(visibleReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;

    return { total, counts, percentages, avg, reviews: visibleReviews };
  };

  const submitReview = (orderId: string, rating: number, reviewText?: string) => {
    const order = globalState.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    // Rule 4: Allow only the actual buyer of a completed order
    if (order.buyerId !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Only the actual buyer who placed this order can rate the channel owner.');
    }

    // Rule 1: Only after order is completed and buyer verified published URL
    if (order.status !== 'completed') {
      throw new Error('Ratings can only be submitted after the promotion order has been verified and completed.');
    }

    // Rule 10: Do not allow owners to rate themselves
    if (order.ownerId === currentUser.id) {
      throw new Error('Channel owners are strictly prohibited from rating their own listings.');
    }

    // Rule 5: Only one rating per order (prevent duplicate ratings)
    const alreadyReviewed = globalState.reviews.some((r) => r.orderId === orderId);
    if (alreadyReviewed) {
      throw new Error('You have already submitted a rating for this order. Only one rating per order is permitted.');
    }

    // Rule 2: 1 to 5 stars
    const roundedRating = Math.round(rating);
    if (roundedRating < 1 || roundedRating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }

    const satisfactionLabel = SATISFACTION_LABELS[roundedRating] || 'Satisfied';
    const now = new Date().toISOString();

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      orderId,
      orderNumber: order.orderNumber,
      listingId: order.listingId,
      listingName: order.listingName,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      rating: roundedRating,
      satisfactionLabel,
      reviewText: reviewText?.trim() || undefined,
      isModerated: true,
      isVisible: true,
      createdAt: now,
    };

    globalState.reviews = [newRev, ...globalState.reviews];

    // Rule 7: Automatically recalculate average rating whenever a valid review is added
    recalculateListingStats(order.listingId);

    // Notify channel owner of verified buyer feedback
    addNotification({
      userId: order.ownerId,
      type: 'order',
      title: `New ${roundedRating}-Star Rating Received (${satisfactionLabel})`,
      message: `${currentUser.fullName} rated your promotion delivery on "${order.listingName}" as "${satisfactionLabel}" (${roundedRating}/5 stars).`,
      linkUrl: `/listing/${order.listingId}`,
    });

    notify();
    return newRev;
  };

  const reportReview = (reviewId: string, reason: string) => {
    const rev = globalState.reviews.find((r) => r.id === reviewId);
    if (!rev) throw new Error('Review not found');

    const now = new Date().toISOString();
    globalState.reviews = globalState.reviews.map((r) => 
      r.id === reviewId ? {
        ...r,
        isReported: true,
        reportReason: reason,
        reportedAt: now,
      } : r
    );

    // Alert administrators
    addNotification({
      userId: 'usr-admin-004',
      type: 'moderation',
      title: 'Review Reported for Moderation',
      message: `A review for "${rev.listingName || 'listing'}" was flagged as abusive: "${reason}". Review in admin panel.`,
      linkUrl: '/admin/moderation',
    });

    notify();
  };

  const adminModerateReview = (
    reviewId: string, 
    action: 'approve' | 'hide' | 'unhide' | 'delete', 
    reason: string
  ) => {
    const rev = globalState.reviews.find((r) => r.id === reviewId);
    if (!rev) throw new Error('Review not found');

    const now = new Date().toISOString();

    // Log to review audit log
    const auditEntry: ReviewAuditLog = {
      id: `rev-audit-${Date.now()}`,
      reviewId,
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action,
      reason,
      createdAt: now,
    };
    globalState.reviewAuditLogs = [auditEntry, ...globalState.reviewAuditLogs];

    if (action === 'delete') {
      globalState.reviews = globalState.reviews.filter((r) => r.id !== reviewId);
    } else {
      globalState.reviews = globalState.reviews.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          isVisible: action === 'hide' ? false : true,
          isReported: action === 'approve' || action === 'unhide' ? false : r.isReported,
          isModerated: true,
          moderatedBy: currentUser.id,
          moderatedAt: now,
          moderationReason: reason,
        };
      });
    }

    // Automatically recalculate listing rating reflecting only visible reviews
    recalculateListingStats(rev.listingId);

    notify();
  };

  // Helper to recompute average rating & review count from only visible reviews
  const recalculateListingStats = (listingId: string) => {
    const visibleReviews = globalState.reviews.filter((r) => r.listingId === listingId && r.isVisible);
    const count = visibleReviews.length;
    const avg = count > 0 
      ? +(visibleReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) 
      : 0;

    globalState.listings = globalState.listings.map((l) => 
      l.id === listingId ? {
        ...l,
        rating: avg,
        reviewCount: count,
        updatedAt: new Date().toISOString(),
      } : l
    );
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    globalState.notifications = [newNotif, ...globalState.notifications];
  };

  const markNotificationAsRead = (id: string) => {
    globalState.notifications = globalState.notifications.map((n) => 
      n.id === id ? { ...n, isRead: true } : n
    );
    notify();
  };

  const markAllNotificationsAsRead = () => {
    globalState.notifications = globalState.notifications.map((n) => 
      n.userId === currentUser.id ? { ...n, isRead: true } : n
    );
    notify();
  };

  return {
    state: globalState,
    currentUser,
    userWallet,
    userNotifications,
    unreadNotificationsCount,
    switchUser,
    updateProfile,
    submitListing,
    adminModerateListing,
    addPackageToListing,
    createHotDeal,
    applyForDiamondBadge,
    adminModerateDiamondBadge,
    createOrder,
    acceptOrder,
    submitPublication,
    confirmOrderDelivery,
    openDispute,
    adminResolveDispute,
    submitDepositRequest,
    adminReviewDeposit,
    requestWithdrawal,
    adminReviewWithdrawal,
    runScheduledStatisticsSync,
    canRateOrder,
    getReviewForOrder,
    getListingReviewBreakdown,
    submitReview,
    reportReview,
    adminModerateReview,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
