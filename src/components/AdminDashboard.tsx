import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Users, 
  FileText, 
  Sparkles, 
  Activity, 
  Settings, 
  ExternalLink, 
  RefreshCw,
  Search,
  Check,
  X,
  Play,
  Star,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Listing, DepositRequest, WithdrawalRequest, Dispute, DiamondVerification } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    state, 
    adminModerateListing, 
    adminModerateDiamondBadge, 
    adminReviewDeposit, 
    adminReviewWithdrawal, 
    adminResolveDispute, 
    runScheduledStatisticsSync,
    adminModerateReview
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'diamond' | 'finance' | 'orders' | 'reviews' | 'cron' | 'settings'>('overview');

  // Moderation Reject Modal State
  const [rejectListingId, setRejectListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Review Moderation State
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reported' | 'hidden' | 'low'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [moderatingReviewId, setModeratingReviewId] = useState<string | null>(null);
  const [moderatingAction, setModeratingAction] = useState<'hide' | 'unhide' | 'approve' | 'delete'>('hide');
  const [moderationReasonInput, setModerationReasonInput] = useState('');

  // Financial review states
  const [reviewWithdrawalId, setReviewWithdrawalId] = useState<string | null>(null);
  const [payoutTxHash, setPayoutTxHash] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Compute platform KPIs
  const totalVolume = state.orders.reduce((sum, o) => sum + o.priceUsd, 0);
  const platformRevenue = state.orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.platformFeeUsd, 0);
  const totalInEscrow = Object.values(state.wallets).reduce((sum, w) => sum + w.reservedBalanceUsd, 0);
  const pendingModerations = state.listings.filter((l) => l.status === 'submitted' || l.status === 'under_review');
  const pendingDiamond = state.diamondVerifications.filter((d) => d.status === 'pending_verification' || d.status === 'under_review');
  const pendingDeposits = state.depositRequests.filter((d) => d.status === 'submitted' || d.status === 'pending_verification');
  const pendingWithdrawals = state.withdrawalRequests.filter((w) => w.status === 'requested' || w.status === 'pending_admin_review');
  const openDisputes = state.disputes.filter((d) => d.status === 'open' || d.status === 'under_review');

  const handleManualSync = () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const run = runScheduledStatisticsSync();
      setSyncMessage(`Automated statistics synchronization completed successfully for ${run.recordsProcessed} channels!`);
    } catch (e: any) {
      setSyncMessage(`Sync failed: ${e.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-400 bg-rose-950/80 border border-rose-900/60 px-2 py-0.5 rounded">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-400">Restricted Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            PROM.IO Governance & Moderation
          </h1>
        </div>

        <button
          onClick={handleManualSync}
          disabled={syncLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
          <span>Trigger 24h Statistics Sync</span>
        </button>
      </div>

      {syncMessage && (
        <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total GMV</div>
          <div className="text-lg font-bold text-white tabular-nums mt-0.5">${totalVolume.toFixed(2)}</div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Fee Revenue (10%)</div>
          <div className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">${platformRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Escrow In Custody</div>
          <div className="text-lg font-bold text-blue-400 tabular-nums mt-0.5">${totalInEscrow.toFixed(2)}</div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Listings</div>
          <div className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">{pendingModerations.length}</div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Deposits</div>
          <div className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">{pendingDeposits.length}</div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Payouts</div>
          <div className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">{pendingWithdrawals.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 rounded-lg transition-colors ${
            activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'moderation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Listing Moderation</span>
          {pendingModerations.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('diamond')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'diamond' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Diamond Badges</span>
          {pendingDiamond.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'finance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Crypto Deposits & Payouts</span>
          {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Orders & Disputes ({openDisputes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cron')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'cron' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Scheduled Jobs (24h Sync)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action Items Box */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Critical Queue Items</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-300">Channel Submissions Awaiting Review:</span>
                  <button 
                    onClick={() => setActiveTab('moderation')}
                    className="font-bold text-amber-400 hover:underline"
                  >
                    {pendingModerations.length} pending →
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-300">Unconfirmed Crypto Deposits:</span>
                  <button 
                    onClick={() => setActiveTab('finance')}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    {pendingDeposits.length} pending →
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-300">Pending Withdrawal Payouts:</span>
                  <button 
                    onClick={() => setActiveTab('finance')}
                    className="font-bold text-amber-400 hover:underline"
                  >
                    {pendingWithdrawals.length} pending →
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-300">Open Buyer/Owner Disputes:</span>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="font-bold text-rose-400 hover:underline"
                  >
                    {openDisputes.length} open →
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Security & Invariants Box */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Marketplace Security Invariants</h3>
              
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Self-Approval:</strong> Channel owners cannot bypass moderation; unapproved listings are blocked from marketplace queries.</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Atomic Escrow:</strong> Orders lock funds at creation. Payout releases to owner balance only upon confirmed delivery.</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hot Deal 7-Day Limit:</strong> Cooldown enforced on the server. Multiple tabs or duplicate API calls cannot bypass limit.</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Append-Only Ledger:</strong> Every deposit, lock, payout, and fee is written to an immutable cryptographic ledger.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LISTING MODERATION */}
      {/* ======================================================== */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Listing Submissions Queue</h3>
            <span className="text-xs text-slate-400">{state.listings.length} total listings</span>
          </div>

          <div className="space-y-4">
            {state.listings.map((l) => (
              <div
                key={l.id}
                className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={l.avatarUrl}
                      alt={l.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{l.name}</h4>
                        <span className="text-xs text-slate-400 font-mono">@{l.username}</span>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Owner: {l.ownerName} · Platform: {l.platform.replace('_', ' ')} · Category: {l.category}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      l.status === 'approved' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : l.status === 'rejected'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      Status: {l.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Evidence & Verification Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Claimed Audience:</span>
                    <strong className="text-white text-sm tabular-nums">{l.audienceCount.toLocaleString()}</strong>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Average Views per Post:</span>
                    <strong className="text-white text-sm tabular-nums">{l.viewsPerPost.toLocaleString()}</strong>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Verification Method:</span>
                    <strong className="text-blue-400 text-sm">{l.verificationMethod}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="text-slate-400 font-semibold">Verification Proof / Audit Notes:</div>
                  <p className="text-slate-200">{l.verificationEvidence || 'Awaiting bot validation.'}</p>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {l.status !== 'approved' && (
                    <button
                      onClick={() => adminModerateListing(l.id, 'approved')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Listing</span>
                    </button>
                  )}

                  {l.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        setRejectListingId(l.id);
                        setRejectReason('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-400 hover:text-white bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject with Reason</span>
                    </button>
                  )}

                  {l.status === 'approved' && (
                    <button
                      onClick={() => adminModerateListing(l.id, 'suspended', 'Suspended for quality review')}
                      className="px-4 py-2 text-xs font-semibold text-amber-400 hover:text-white bg-amber-950/50 border border-amber-800 rounded-lg"
                    >
                      Suspend Listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DIAMOND BADGES */}
      {/* ======================================================== */}
      {activeTab === 'diamond' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Exclusive Diamond Verification Requests</h3>
              <p className="text-xs text-slate-400">Verify that the owner has placed the PROM.IO listing URL in their channel description/bio.</p>
            </div>
          </div>

          <div className="space-y-3">
            {state.diamondVerifications.map((d) => (
              <div key={d.id} className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">{d.listingName}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                    d.status === 'verified'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {d.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg space-y-1">
                  <div>Submitted URL: <span className="font-mono text-cyan-300">{d.submittedUrl}</span></div>
                  <div>Evidence: <span className="text-slate-300">{d.evidenceText}</span></div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {d.status !== 'verified' ? (
                    <button
                      onClick={() => adminModerateDiamondBadge(d.id, 'verified')}
                      className="px-4 py-1.5 font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg"
                    >
                      Verify & Award Diamond Badge
                    </button>
                  ) : (
                    <button
                      onClick={() => adminModerateDiamondBadge(d.id, 'revoked', 'Link removed from public bio')}
                      className="px-4 py-1.5 font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 rounded-lg"
                    >
                      Revoke Diamond Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CRYPTO DEPOSITS & PAYOUTS */}
      {/* ======================================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-8">
          {/* Section A: Crypto Deposits to verify */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Crypto Add Funds Submissions ({state.depositRequests.length})</span>
            </h3>

            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Asset / Network</th>
                    <th className="p-3.5">USD Amount</th>
                    <th className="p-3.5">Blockchain TX Hash</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {state.depositRequests.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 text-white font-medium">{dep.userEmail}</td>
                      <td className="p-3.5 text-slate-300">{dep.asset} ({dep.network})</td>
                      <td className="p-3.5 font-bold text-white tabular-nums">${dep.amountUsd.toFixed(2)}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-[200px] truncate">
                        {dep.txHash}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          dep.status === 'approved' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : dep.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {dep.status !== 'approved' && dep.status !== 'rejected' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => adminReviewDeposit(dep.id, 'approved')}
                              className="px-3 py-1 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded text-[11px]"
                            >
                              Approve & Credit
                            </button>
                            <button
                              onClick={() => adminReviewDeposit(dep.id, 'rejected', 'Transaction hash could not be confirmed')}
                              className="px-3 py-1 font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 rounded text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Crypto Withdrawals to process */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span>Withdrawal Payout Requests ({state.withdrawalRequests.length})</span>
            </h3>

            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Owner Email</th>
                    <th className="p-3.5">Asset / Network</th>
                    <th className="p-3.5">Net Payout</th>
                    <th className="p-3.5">Destination Address</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {state.withdrawalRequests.map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 text-white font-medium">{wth.userEmail}</td>
                      <td className="p-3.5 text-slate-300">{wth.asset} ({wth.network})</td>
                      <td className="p-3.5 font-bold text-emerald-400 tabular-nums">${wth.netPayoutUsd.toFixed(2)}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-[200px] truncate">{wth.destinationAddress}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          wth.status === 'paid' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : wth.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {wth.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {wth.status !== 'paid' && wth.status !== 'rejected' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setReviewWithdrawalId(wth.id);
                                setPayoutTxHash('');
                              }}
                              className="px-3 py-1 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded text-[11px]"
                            >
                              Process Payout
                            </button>
                            <button
                              onClick={() => adminReviewWithdrawal(wth.id, 'rejected', undefined, 'Security verification failed')}
                              className="px-3 py-1 font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 rounded text-[11px]"
                            >
                              Reject & Release
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ORDERS & DISPUTES */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Dispute Arbitrations ({state.disputes.length})</h3>
            {state.disputes.length === 0 ? (
              <div className="p-6 bg-[#0b0f19] border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                No active disputes.
              </div>
            ) : (
              <div className="space-y-3">
                {state.disputes.map((disp) => (
                  <div key={disp.id} className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Dispute on Order {disp.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                        {disp.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg space-y-1">
                      <div>Reason: <strong className="text-white">{disp.reason}</strong></div>
                      <div>Evidence: <p className="text-slate-300">{disp.evidenceText}</p></div>
                    </div>

                    {disp.status === 'open' && (
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => adminResolveDispute(disp.id, 'refund_buyer', 'Violation verified: Full refund granted to buyer.')}
                          className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
                        >
                          Rule in Buyer Favor (Refund 100%)
                        </button>

                        <button
                          onClick={() => adminResolveDispute(disp.id, 'release_to_owner', 'Post confirmed compliant: Escrow released to channel owner.')}
                          className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                        >
                          Rule in Owner Favor (Release Escrow)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SCHEDULED JOBS */}
      {/* ======================================================== */}
      {activeTab === 'cron' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Automated Scheduled 24h Statistics Synchronization</h3>
              <p className="text-xs text-slate-400">Runs approximately every 24 hours to sync subscriber and engagement statistics from Telegram & X.</p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Sync Now</span>
            </button>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Job Name</th>
                  <th className="p-3.5">Started At</th>
                  <th className="p-3.5">Completed At</th>
                  <th className="p-3.5">Records Updated</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.jobRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-mono text-white">{run.jobName}</td>
                    <td className="p-3.5 text-slate-400">{new Date(run.startedAt).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-400">{run.completedAt ? new Date(run.completedAt).toLocaleString() : 'In progress'}</td>
                    <td className="p-3.5 font-bold text-white tabular-nums">{run.recordsProcessed} channels</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REJECT LISTING WITH REASON */}
      {/* ======================================================== */}
      {rejectListingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Reject Listing Submission</h3>
            <p className="text-xs text-slate-400">Please provide a constructive reason for the channel owner.</p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Channel does not meet minimum quality threshold or bot was not given admin permissions."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectListingId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  adminModerateListing(rejectListingId, 'rejected', rejectReason || 'Did not meet editorial criteria.');
                  setRejectListingId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RECORD PAYOUT TX HASH */}
      {/* ======================================================== */}
      {reviewWithdrawalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Complete Withdrawal Payout</h3>
            <p className="text-xs text-slate-400">Enter the blockchain transaction hash after transferring funds to the owner.</p>

            <input
              type="text"
              value={payoutTxHash}
              onChange={(e) => setPayoutTxHash(e.target.value)}
              placeholder="0x... or TRC20 tx hash"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewWithdrawalId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!payoutTxHash.trim()) {
                    alert('TX hash is required');
                    return;
                  }
                  adminReviewWithdrawal(reviewWithdrawalId, 'paid', payoutTxHash.trim());
                  setReviewWithdrawalId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
              >
                Mark as Paid & Debit Reserved Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
