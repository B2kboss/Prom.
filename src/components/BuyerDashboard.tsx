import React, { useState } from 'react';
import { 
  Lock, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  AlertTriangle, 
  Star, 
  ArrowDownLeft, 
  Wallet as WalletIcon,
  ShieldAlert,
  X,
  Send
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Order } from '../types';
import { BuyerRatingModal } from './BuyerRatingModal';

interface BuyerDashboardProps {
  onOpenDeposit: () => void;
  onNavigateToMarketplace: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  onOpenDeposit,
  onNavigateToMarketplace,
}) => {
  const { 
    currentUser, 
    userWallet, 
    state, 
    confirmOrderDelivery, 
    openDispute, 
    getReviewForOrder 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wallet' | 'deposits' | 'disputes'>('orders');

  // Filter orders where currentUser is buyer
  const myOrders = state.orders.filter((o) => o.buyerId === currentUser.id || currentUser.role === 'admin');
  const myLedger = state.ledger.filter((l) => l.userId === currentUser.id);
  const myDeposits = state.depositRequests.filter((d) => d.userId === currentUser.id);
  const myDisputes = state.disputes.filter((d) => d.initiatorId === currentUser.id || currentUser.role === 'admin');

  // Dispute Modal State
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');

  // Rating Modal State
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrderId || !disputeReason.trim() || !disputeEvidence.trim()) return;

    openDispute(disputeOrderId, disputeReason.trim(), disputeEvidence.trim());
    setDisputeOrderId(null);
    setDisputeReason('');
    setDisputeEvidence('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Wallet Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Advertiser Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Campaigns & Escrow Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active placements on Telegram & X channels, inspect published links, and manage your crypto escrow balance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit Crypto (Add Funds)</span>
          </button>

          <button
            onClick={onNavigateToMarketplace}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            Explore Channels
          </button>
        </div>
      </div>

      {/* Financial Health Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Available for Orders</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${userWallet.availableBalanceUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-blue-400 mt-1">
            Ready to book placements
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Funds Locked in Escrow</div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums mt-1">
            ${userWallet.reservedBalanceUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Released only upon confirmed delivery
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Campaigns Placed</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            {myOrders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {myOrders.filter((o) => o.status === 'completed').length} completed
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Deposited</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${userWallet.totalDepositedUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            100% verified on-chain
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>My Orders ({myOrders.length})</span>
          {myOrders.filter((o) => o.status === 'published').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'wallet'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Escrow Ledger & Transactions
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'deposits'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Crypto Deposit History ({myDeposits.length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Disputes & Claims ({myDisputes.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY ORDERS */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <p className="text-white font-semibold">You have no active promotion orders.</p>
              <button
                onClick={onNavigateToMarketplace}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Browse Marketplace Inventory
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => {
                const isPublished = ord.status === 'published';
                const isCompleted = ord.status === 'completed';

                return (
                  <div
                    key={ord.id}
                    className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{ord.orderNumber}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-xs text-blue-400 font-semibold">{ord.listingName}</span>
                          <span className="text-[11px] text-slate-400">(@{ord.listingUsername})</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Format: {ord.packageName} · Delivery Window: {ord.deliveryWindowHours}h
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-white tabular-nums">
                          ${ord.priceUsd.toFixed(2)} USD
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isCompleted ? 'Escrow Released' : 'Held in Escrow'}
                        </div>
                      </div>
                    </div>

                    {/* Published Post Verification Notice */}
                    {isPublished && ord.publicationUrl && (
                      <div className="p-4 bg-cyan-950/30 border border-cyan-800/60 rounded-xl space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                              <span>Owner Published Your Promotion — Verification Required</span>
                            </div>
                            <p className="text-xs text-slate-300">
                              Please inspect the live post URL to verify text accuracy, target link, and placement timing.
                            </p>
                          </div>

                          <a
                            href={ord.publicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shrink-0 transition-colors"
                          >
                            <span>Inspect Post</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="pt-2 border-t border-cyan-900/40 flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setDisputeOrderId(ord.id);
                              setDisputeReason('');
                              setDisputeEvidence('');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg"
                          >
                            Report Issue / Open Dispute
                          </button>

                          <button
                            onClick={() => confirmOrderDelivery(ord.id)}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
                          >
                            Confirm Delivery & Release Escrow
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Order Ad Copy Preview */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="text-slate-400 font-semibold">Your Ad Copy:</div>
                      <p className="text-slate-200 font-mono text-[11px] whitespace-pre-wrap bg-slate-950 p-2.5 rounded border border-slate-800/80">
                        {ord.adText}
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1">
                        Target Link: <a href={ord.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{ord.targetUrl}</a>
                      </div>
                    </div>

                    {/* Footer Status and Reviews */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Order Status:</span>
                        <span className="font-semibold text-white capitalize bg-slate-800 px-2 py-0.5 rounded">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                        {ord.status === 'pending_owner_acceptance' && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting owner acceptance (48h max)
                          </span>
                        )}
                      </div>

                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const existingReview = getReviewForOrder(ord.id);
                            if (existingReview) {
                              return (
                                <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-lg text-xs">
                                  <div className="flex items-center gap-0.5 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-semibold text-white">
                                    {existingReview.rating} — {existingReview.satisfactionLabel}
                                  </span>
                                  <span className="text-slate-400 text-[10px]">(Rated)</span>
                                </div>
                              );
                            }
                            return (
                              <button
                                onClick={() => setRatingOrder(ord)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/20"
                              >
                                <Star className="w-3.5 h-3.5 fill-slate-900" />
                                <span>Rate Channel Owner (1–5 Stars)</span>
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WALLET & LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Immutable Append-Only Wallet Ledger</h3>
            <span className="text-xs text-slate-400">Strict Cryptographic Accounting</span>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Entry Type</th>
                  <th className="p-3.5">Amount (USD)</th>
                  <th className="p-3.5">Balance After</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Idempotency Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {myLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No ledger transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  myLedger.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium whitespace-nowrap">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono">
                          {item.entryType}
                        </span>
                      </td>
                      <td className={`p-3.5 font-bold tabular-nums ${item.amountUsd >= 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {item.amountUsd >= 0 ? '+' : ''}${item.amountUsd.toFixed(2)}
                      </td>
                      <td className="p-3.5 font-semibold text-white tabular-nums">
                        ${item.balanceAfterUsd.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-[250px] truncate">
                        {item.description}
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-400 max-w-[120px] truncate">
                        {item.idempotencyKey}
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
      {/* TAB 3: DEPOSITS */}
      {/* ======================================================== */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Crypto Add Funds Requests</h3>
            <button
              onClick={onOpenDeposit}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
            >
              Deposit Crypto
            </button>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Asset / Network</th>
                  <th className="p-3.5">Crypto Amount</th>
                  <th className="p-3.5">USD Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">TX Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {myDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No crypto deposits recorded yet.
                    </td>
                  </tr>
                ) : (
                  myDeposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(dep.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {dep.asset} ({dep.network})
                      </td>
                      <td className="p-3.5 font-mono text-slate-300 tabular-nums">
                        {dep.amountCrypto} {dep.asset}
                      </td>
                      <td className="p-3.5 font-bold text-white tabular-nums">
                        ${dep.amountUsd.toFixed(2)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          dep.status === 'approved' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : dep.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {dep.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {dep.txHash.slice(0, 10)}...
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
      {/* TAB 4: DISPUTES */}
      {/* ======================================================== */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Dispute & Escrow Arbitrations</h3>
          {myDisputes.length === 0 ? (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              No disputes active or on file. Placements proceed smoothly under standard terms.
            </div>
          ) : (
            <div className="space-y-3">
              {myDisputes.map((disp) => (
                <div key={disp.id} className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Order {disp.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold border border-amber-800 text-[10px]">
                      {disp.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-300"><strong>Claim:</strong> {disp.reason}</p>
                  <p className="text-slate-400"><strong>Evidence:</strong> {disp.evidenceText}</p>
                  {disp.adminNotes && (
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-cyan-300">
                      <strong>Administrator Ruling:</strong> {disp.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: OPEN DISPUTE */}
      {/* ======================================================== */}
      {disputeOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Open Promotion Dispute</span>
              </h3>
              <button onClick={() => setDisputeOrderId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason for Dispute <span className="text-rose-400">*</span>
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="Post not published on agreed channel">Post not published on agreed channel</option>
                  <option value="Promotional copy altered or mutilated">Promotional copy altered or mutilated</option>
                  <option value="Incorrect destination link used">Incorrect destination link used</option>
                  <option value="Deleted before agreed placement duration ended">Deleted before agreed placement duration ended</option>
                  <option value="Other non-compliance with terms">Other non-compliance with terms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Evidence & Observations <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Explain exactly what was violated with links or timestamps..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeOrderId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
                >
                  Submit Dispute to Administration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BUYER RATING & SATISFACTION MODAL */}
      {/* ======================================================== */}
      {ratingOrder && (
        <BuyerRatingModal
          order={ratingOrder}
          onClose={() => setRatingOrder(null)}
          onSuccess={() => setRatingOrder(null)}
        />
      )}
    </div>
  );
};
