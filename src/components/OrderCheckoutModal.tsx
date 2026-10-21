import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Wallet as WalletIcon,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Listing, PromotionPackage } from '../types';

interface OrderCheckoutModalProps {
  listing: Listing;
  selectedPackage: PromotionPackage;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  onOpenDeposit: () => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({
  listing,
  selectedPackage,
  onClose,
  onOrderSuccess,
  onOpenDeposit,
}) => {
  const { currentUser, userWallet, createOrder } = useAppStore();

  const isDealActive = listing.activeHotDeal && 
    listing.activeHotDeal.packageId === selectedPackage.id && 
    listing.activeHotDeal.status === 'active';

  const orderPrice = isDealActive 
    ? listing.activeHotDeal!.discountedPriceUsd 
    : selectedPackage.priceUsd;

  const [adText, setAdText] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [creativeUrl, setCreativeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deliveryHours, setDeliveryHours] = useState<number>(48);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSufficientBalance = userWallet.availableBalanceUsd >= orderPrice;
  const shortfall = Math.max(0, orderPrice - userWallet.availableBalanceUsd);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adText.trim()) {
      setError('Advertising copy / text is required.');
      return;
    }

    if (!targetUrl.trim() || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('https://t.me/'))) {
      setError('Please provide a valid destination URL (starting with https:// or http://).');
      return;
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient available balance. Please deposit at least $${shortfall.toFixed(2)} to continue.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const order = createOrder(listing.id, selectedPackage.id, {
        adText,
        targetUrl,
        creativeUrl: creativeUrl.trim() || undefined,
        instructions: instructions.trim() || undefined,
        deliveryWindowHours: deliveryHours,
      });

      onOrderSuccess(order.id);
    } catch (err: any) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 bg-blue-950/70 border border-blue-900/60 px-2 py-0.5 rounded">
                Escrow Order Checkout
              </span>
              <span className="text-xs text-slate-400">{listing.platform.replace('_', ' ')}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Book Placement on {listing.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Package Summary Pill */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 my-5 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white text-sm">{selectedPackage.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Placement Duration: {selectedPackage.durationHours >= 8760 ? 'Permanent' : `${selectedPackage.durationHours} Hours`}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold text-white tabular-nums">
              ${orderPrice.toFixed(2)}
            </div>
            {isDealActive && (
              <div className="text-xs text-amber-400 line-through tabular-nums">
                ${selectedPackage.priceUsd.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Promotional Text / Copy <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              placeholder="Paste your promotional post copy here, including emojis, hashtags, or formatting..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Supports Telegram/X native markdown</span>
              <span>{adText.length} characters</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Destination URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://yourwebsite.com or https://t.me/yourbot"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Image / Banner Creative URL (Optional)
            </label>
            <input
              type="url"
              value={creativeUrl}
              onChange={(e) => setCreativeUrl(e.target.value)}
              placeholder="https://... (Direct link to banner image, PNG/JPG)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maximum Delivery Window
              </label>
              <select
                value={deliveryHours}
                onChange={(e) => setDeliveryHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value={24}>24 Hours from Acceptance</option>
                <option value={48}>48 Hours from Acceptance</option>
                <option value={72}>72 Hours from Acceptance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Publisher Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Post at 15:00 UTC, pin for 1h"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Escrow Balance & Security Invariant Strip */}
          <div className="bg-[#0e1424] border border-blue-950 rounded-xl p-4 space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Your Available Balance:</span>
              <span className="font-semibold text-white tabular-nums">
                ${userWallet.availableBalanceUsd.toFixed(2)} USD
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Order Amount:</span>
              <span className="font-bold text-blue-400 tabular-nums">
                ${orderPrice.toFixed(2)} USD
              </span>
            </div>

            {!hasSufficientBalance && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-rose-400 font-medium">
                  Shortfall: ${shortfall.toFixed(2)} USD
                </span>
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Deposit Crypto
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientBalance}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Reserving Escrow...' : 'Reserve Funds & Place Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
