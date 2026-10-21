export type UserRole = 'buyer' | 'telegram_owner' | 'x_owner' | 'combined' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export type PlatformType = 'telegram_channel' | 'telegram_group' | 'x_account';

export type ListingStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'suspended' 
  | 'reverification_required';

export type VerificationMethod = 'bot_check' | 'verification_code_post' | 'oauth_token' | 'manual_review';

export interface Listing {
  id: string;
  ownerId: string;
  ownerName: string;
  platform: PlatformType;
  name: string;
  username: string;
  url: string;
  description: string;
  category: string;
  language: string;
  country?: string;
  avatarUrl: string;
  audienceCount: number;
  viewsPerPost: number;
  engagementRate: number; // percentage, e.g. 14.5
  cpmEstimate: number; // USD per 1k views
  status: ListingStatus;
  verificationMethod: VerificationMethod;
  verificationEvidence?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  hasDiamondBadge: boolean;
  diamondVerifiedAt?: string;
  responseRatePercent: number;
  completedOrdersCount: number;
  rating: number; // 0.0 - 5.0
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  badges?: string[];
  packages: PromotionPackage[];
  activeHotDeal?: HotDeal;
}

export type PackageFormat = 
  | 'post_1_24' 
  | 'post_2_48' 
  | 'post_3_72' 
  | 'post_permanent' 
  | 'post_sponsored' 
  | 'tweet_sponsored' 
  | 'tweet_thread' 
  | 'retweet_repost' 
  | 'pin_24h' 
  | 'custom';

export interface PromotionPackage {
  id: string;
  listingId: string;
  formatType: PackageFormat;
  name: string;
  description: string;
  durationHours: number;
  priceUsd: number;
  isActive: boolean;
}

export interface HotDeal {
  id: string;
  listingId: string;
  packageId: string;
  originalPriceUsd: number;
  discountedPriceUsd: number;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'suspended';
}

export type DiamondStatus = 
  | 'not_applied' 
  | 'pending_verification' 
  | 'under_review' 
  | 'verified' 
  | 'reverification_required' 
  | 'revoked';

export interface DiamondVerification {
  id: string;
  listingId: string;
  listingName: string;
  submittedUrl: string;
  evidenceText?: string;
  status: DiamondStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  lastCheckedAt?: string;
  notes?: string;
  createdAt: string;
}

export type OrderStatus = 
  | 'awaiting_payment' 
  | 'funds_reserved' 
  | 'pending_owner_acceptance' 
  | 'accepted' 
  | 'in_progress' 
  | 'published' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected' 
  | 'disputed' 
  | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  listingId: string;
  listingName: string;
  listingUsername: string;
  listingPlatform: PlatformType;
  ownerId: string;
  packageId: string;
  packageName: string;
  formatType: PackageFormat;
  originalPriceUsd: number;
  priceUsd: number;
  platformFeeUsd: number;
  ownerPayoutUsd: number;
  adText: string;
  targetUrl: string;
  creativeUrl?: string;
  instructions?: string;
  deliveryWindowHours: number;
  status: OrderStatus;
  acceptedAt?: string;
  deadlineAt?: string;
  publishedAt?: string;
  publicationUrl?: string;
  publicationProofUrl?: string;
  completedAt?: string;
  disputedAt?: string;
  disputeReason?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  actorId: string;
  actorRole: string;
  eventType: string;
  notes: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  initiatorId: string;
  initiatorRole: 'buyer' | 'owner';
  reason: string;
  evidenceText: string;
  evidenceUrl?: string;
  status: 'open' | 'under_review' | 'resolved_refunded' | 'resolved_released' | 'dismissed';
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export type SatisfactionLevel = 
  | 'Very dissatisfied' 
  | 'Dissatisfied' 
  | 'Average' 
  | 'Satisfied' 
  | 'Very satisfied';

export interface Review {
  id: string;
  orderId: string;
  orderNumber?: string;
  listingId: string;
  listingName?: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1-5
  satisfactionLabel: SatisfactionLevel;
  reviewText?: string;
  isModerated: boolean;
  isVisible: boolean;
  isReported?: boolean;
  reportReason?: string;
  reportedAt?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationReason?: string;
  createdAt: string;
}

export interface ReviewAuditLog {
  id: string;
  reviewId: string;
  adminId: string;
  adminName: string;
  action: 'approve' | 'hide' | 'unhide' | 'delete';
  reason: string;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  availableBalanceUsd: number;
  reservedBalanceUsd: number;
  totalDepositedUsd: number;
  totalEarnedUsd: number;
  totalWithdrawnUsd: number;
}

export type LedgerEntryType = 
  | 'deposit_credit' 
  | 'order_reservation' 
  | 'order_payout' 
  | 'order_refund' 
  | 'platform_fee' 
  | 'withdrawal_reservation' 
  | 'withdrawal_release' 
  | 'withdrawal_payout' 
  | 'admin_adjustment';

export interface WalletLedgerEntry {
  id: string;
  userId: string;
  entryType: LedgerEntryType;
  amountUsd: number;
  balanceAfterUsd: number;
  relatedOrderId?: string;
  relatedDepositId?: string;
  relatedWithdrawalId?: string;
  idempotencyKey: string;
  description: string;
  authorizedBy?: string;
  createdAt: string;
}

export type CryptoAsset = 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'TON' | 'SOL';

export interface CryptoNetworkConfig {
  asset: CryptoAsset;
  networks: {
    network: string;
    depositAddress: string;
    memoRequired?: boolean;
    minimumDepositUsd: number;
    confirmationCount: number;
  }[];
}

export type DepositStatus = 'submitted' | 'pending_verification' | 'under_review' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  asset: CryptoAsset;
  network: string;
  amountCrypto: number;
  amountUsd: number;
  txHash: string;
  receivingAddress: string;
  proofImageUrl?: string;
  status: DepositStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type WithdrawalStatus = 
  | 'requested' 
  | 'pending_admin_review' 
  | 'approved_for_processing' 
  | 'processing' 
  | 'paid' 
  | 'rejected' 
  | 'cancelled';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  asset: CryptoAsset;
  network: string;
  destinationAddress: string;
  amountUsd: number;
  feeUsd: number;
  netPayoutUsd: number;
  status: WithdrawalStatus;
  txHash?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface StatisticsSnapshot {
  id: string;
  listingId: string;
  snapshotDate: string;
  audienceCount: number;
  viewsPerPost: number;
  engagementRate: number;
  absoluteChange24h: number;
  percentChange24h: number;
  dataSource: string;
  isVerified: boolean;
  syncError?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'order' | 'moderation' | 'financial' | 'diamond' | 'hot_deal' | 'system';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MarketplaceSettings {
  marketplaceFeePercent: number; // default 10%
  minimumPackagePriceUsd: number; // $5
  maximumPackagePriceUsd: number; // $50,000
  hotDealCooldownDays: number; // default 7 days
  orderAcceptanceDeadlineHours: number; // default 48h
  publicationWindowHours: number; // default 24h
  buyerReviewPeriodHours: number; // default 48h
  minimumWithdrawalUsd: number; // $10
  withdrawalFeeUsd: number; // $2
}

export interface ScheduledJobRun {
  id: string;
  jobName: string;
  status: 'running' | 'success' | 'failed';
  recordsProcessed: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}
