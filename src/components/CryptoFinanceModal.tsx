import React, { useState } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Info,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { CRYPTO_NETWORKS } from '../lib/mockData';
import { CryptoAsset } from '../types';

interface CryptoFinanceModalProps {
  initialTab?: 'deposit' | 'withdraw';
  onClose: () => void;
}

export const CryptoFinanceModal: React.FC<CryptoFinanceModalProps> = ({
  initialTab = 'deposit',
  onClose,
}) => {
  const { currentUser, userWallet, submitDepositRequest, requestWithdrawal, state } = useAppStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);

  // Deposit Form State
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('USDT');
  const availableNetworks = CRYPTO_NETWORKS.find((c) => c.asset === selectedAsset)?.networks || [];
  const [selectedNetworkIndex, setSelectedNetworkIndex] = useState(0);
  const activeNetworkConfig = availableNetworks[selectedNetworkIndex] || availableNetworks[0];

  const [depositAmountCrypto, setDepositAmountCrypto] = useState<string>('100');
  const [depositAmountUsd, setDepositAmountUsd] = useState<string>('100');
  const [depositTxHash, setDepositTxHash] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Withdrawal Form State
  const [withdrawAsset, setWithdrawAsset] = useState<CryptoAsset>('USDT');
  const withdrawNetworks = CRYPTO_NETWORKS.find((c) => c.asset === withdrawAsset)?.networks || [];
  const [withdrawNetworkIndex, setWithdrawNetworkIndex] = useState(0);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmountUsd, setWithdrawAmountUsd] = useState<string>('100');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountCryptoNum = parseFloat(depositAmountCrypto);
    const amountUsdNum = parseFloat(depositAmountUsd);

    if (isNaN(amountCryptoNum) || amountCryptoNum <= 0 || isNaN(amountUsdNum) || amountUsdNum <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }

    if (!depositTxHash.trim() || depositTxHash.trim().length < 10) {
      setError('Please provide the full blockchain transaction hash / TX ID.');
      return;
    }

    try {
      submitDepositRequest(
        selectedAsset,
        activeNetworkConfig.network,
        amountCryptoNum,
        amountUsdNum,
        depositTxHash.trim(),
        activeNetworkConfig.depositAddress
      );
      setDepositSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit deposit.');
    }
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(withdrawAmountUsd);
    if (isNaN(amountNum) || amountNum < state.settings.minimumWithdrawalUsd) {
      setError(`Minimum withdrawal amount is $${state.settings.minimumWithdrawalUsd}.00 USD.`);
      return;
    }

    if (amountNum > userWallet.availableBalanceUsd) {
      setError(`Requested amount exceeds available balance ($${userWallet.availableBalanceUsd.toFixed(2)} USD).`);
      return;
    }

    if (!withdrawAddress.trim() || withdrawAddress.trim().length < 15) {
      setError('Please enter a valid destination wallet address.');
      return;
    }

    try {
      requestWithdrawal(
        withdrawAsset,
        withdrawNetworks[withdrawNetworkIndex]?.network || 'Default',
        withdrawAddress.trim(),
        amountNum
      );
      setWithdrawSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('deposit'); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit Crypto (Add Funds)</span>
            </button>

            <button
              onClick={() => { setActiveTab('withdraw'); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'withdraw'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Request Withdrawal</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-xl my-4 text-xs">
          <span className="text-slate-400">Your Available Balance:</span>
          <span className="font-bold text-white text-sm tabular-nums">
            ${userWallet.availableBalanceUsd.toFixed(2)} USD
          </span>
        </div>

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: CRYPTO DEPOSITS */}
        {/* ======================================================== */}
        {activeTab === 'deposit' && (
          depositSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Deposit Request Submitted</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your blockchain deposit has been registered. Our automated prober and administration team will verify the transaction hash and credit your account within 10–30 minutes.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Asset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Crypto Asset
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['USDT', 'USDC', 'TON', 'SOL', 'BTC', 'ETH'] as CryptoAsset[]).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setSelectedNetworkIndex(0);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                        selectedAsset === asset
                          ? 'bg-blue-950/80 border-blue-500 text-blue-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Blockchain Network
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableNetworks.map((net, idx) => (
                    <button
                      key={net.network}
                      type="button"
                      onClick={() => setSelectedNetworkIndex(idx)}
                      className={`text-left p-2.5 rounded-lg text-xs border transition-colors ${
                        selectedNetworkIndex === idx
                          ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-white">{net.network}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Min: ${net.minimumDepositUsd} · {net.confirmationCount} block confirmations
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Address Box */}
              {activeNetworkConfig && (
                <div className="bg-[#0e1424] border border-blue-950/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Send {selectedAsset} to Official Receiving Address:</span>
                    <span className="text-blue-400 font-semibold">{activeNetworkConfig.network}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-lg">
                    <span className="font-mono text-xs text-white break-all select-all">
                      {activeNetworkConfig.depositAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(activeNetworkConfig.depositAddress)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 shrink-0"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {activeNetworkConfig.memoRequired && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-900/50">
                      ⚠️ MEMO required for TON. Make sure to include your PROM.IO User ID in the transfer comment!
                    </div>
                  )}
                </div>
              )}

              {/* Amount and TX Hash Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount ({selectedAsset})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={depositAmountCrypto}
                    onChange={(e) => {
                      setDepositAmountCrypto(e.target.value);
                      setDepositAmountUsd(e.target.value); // 1:1 for stables, approximate
                    }}
                    placeholder="100.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Credited Amount in USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={depositAmountUsd}
                    onChange={(e) => setDepositAmountUsd(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Blockchain Transaction Hash (TX ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={depositTxHash}
                  onChange={(e) => setDepositTxHash(e.target.value)}
                  placeholder="e.g. 0x8a9b... or TRC20 tx hash"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Obtain this from your exchange (Binance, Bybit) or personal wallet (MetaMask, Tonkeeper).
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Submit Deposit for Verification
                </button>
              </div>
            </form>
          )
        )}

        {/* ======================================================== */}
        {/* TAB 2: CRYPTO WITHDRAWALS */}
        {/* ======================================================== */}
        {activeTab === 'withdraw' && (
          withdrawSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Withdrawal Request Queued</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your withdrawal request of ${withdrawAmountUsd} USD has been registered. Funds are atomically reserved in escrow while administrator security review is completed.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payout Crypto Asset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['USDT', 'USDC', 'TON'] as CryptoAsset[]).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => {
                        setWithdrawAsset(asset);
                        setWithdrawNetworkIndex(0);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                        withdrawAsset === asset
                          ? 'bg-blue-950/80 border-blue-500 text-blue-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destination Network
                </label>
                <select
                  value={withdrawNetworkIndex}
                  onChange={(e) => setWithdrawNetworkIndex(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {withdrawNetworks.map((net, i) => (
                    <option key={net.network} value={i}>
                      {net.network}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination Wallet Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="Paste your personal wallet address..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Withdrawal Amount (USD) <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmountUsd(userWallet.availableBalanceUsd.toString())}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    Max: ${userWallet.availableBalanceUsd.toFixed(2)}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min={state.settings.minimumWithdrawalUsd}
                  max={userWallet.availableBalanceUsd}
                  value={withdrawAmountUsd}
                  onChange={(e) => setWithdrawAmountUsd(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Fee Breakdown */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Network Gas / Processing Fee:</span>
                  <span className="text-white tabular-nums">${state.settings.withdrawalFeeUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span>Net Payout to Your Wallet:</span>
                  <span className="text-emerald-400 tabular-nums">
                    ${Math.max(0, (parseFloat(withdrawAmountUsd) || 0) - state.settings.withdrawalFeeUsd).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userWallet.availableBalanceUsd < state.settings.minimumWithdrawalUsd}
                  className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Confirm Payout Request
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};
