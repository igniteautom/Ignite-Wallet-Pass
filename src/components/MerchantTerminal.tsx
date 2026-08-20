import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, CustomerPass, StampTransaction } from '../types';
import { StampIcon } from './StampIcon';
import { generateCryptographicHash, signTransactionReceipt, verifyDynamicQRToken } from '../utils/crypto';
import { sound } from '../utils/audio';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Plus,
  Gift,
  Search,
  Sparkles,
  Receipt,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MerchantTerminalProps {
  business: Business;
  customers: CustomerPass[];
  transactions: StampTransaction[];
  onIssueStamps: (passId: string, count: number, cashier: string, amountUsd?: number, notes?: string) => void;
  onRedeemReward: (passId: string, rewardId: string, cashier: string) => void;
}

export const MerchantTerminal: React.FC<MerchantTerminalProps> = ({
  business,
  customers,
  transactions,
  onIssueStamps,
  onRedeemReward
}) => {
  const [selectedPassId, setSelectedPassId] = useState<string>(customers[0]?.passId || '');
  const [cashierName, setCashierName] = useState('Emma T. (Register 1)');
  const [customStampCount, setCustomStampCount] = useState<number>(1);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('8.50');
  const [cashierPinInput, setCashierPinInput] = useState<string>('');
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(!business.settings.requireCashierPin);
  const [pinError, setPinError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualQRInput, setManualQRInput] = useState('');
  const [qrVerifyStatus, setQrVerifyStatus] = useState<{ verified: boolean; message: string } | null>(null);
  const [receiptTxn, setReceiptTxn] = useState<StampTransaction | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const selectedCustomer = customers.find(c => c.passId === selectedPassId) || customers[0];

  const handleVerifyPin = () => {
    if (cashierPinInput === business.settings.cashierPin) {
      setIsPinUnlocked(true);
      setPinError('');
      sound.playScanBeep();
    } else {
      setPinError('Incorrect cashier security PIN');
    }
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    sound.playScanBeep();

    setTimeout(() => {
      setIsScanning(false);
      if (selectedCustomer) {
        setQrVerifyStatus({
          verified: true,
          message: `E2EE Verified: ${selectedCustomer.customerName} (${selectedCustomer.passId})`
        });
        sound.playStampSound();
      }
    }, 900);
  };

  const handleManualQRVerify = () => {
    if (!manualQRInput.trim()) return;
    const result = verifyDynamicQRToken(manualQRInput.trim(), business.id, business.securityKeyId);
    if (result.isValid && result.passId) {
      setSelectedPassId(result.passId);
      setQrVerifyStatus({
        verified: true,
        message: `Cryptographic Signature Validated (${result.payload?.signature})`
      });
      sound.playScanBeep();
    } else {
      setQrVerifyStatus({
        verified: false,
        message: result.reason || 'Invalid QR token'
      });
    }
  };

  const handleIssueStamps = (count: number, reason: string = 'In-Store Purchase') => {
    if (!selectedCustomer) return;

    sound.playStampSound();
    const amount = parseFloat(purchaseAmount) || business.averageItemPriceUsd;

    // Check if will trigger 10th reward celebration
    if (selectedCustomer.currentStamps + count >= business.requiredStamps) {
      setTimeout(() => {
        sound.playRewardFanfare();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      }, 300);
    }

    onIssueStamps(selectedCustomer.passId, count, cashierName, amount, reason);

    // Create a local receipt preview
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const sig = signTransactionReceipt(txnId, selectedCustomer.passId, count, cashierName);
    const newTxn: StampTransaction = {
      id: txnId,
      passId: selectedCustomer.passId,
      customerName: selectedCustomer.customerName,
      businessId: business.id,
      type: 'stamp_earned',
      stampsCount: count,
      timestamp: 'Just now',
      amountSpendUsd: amount,
      cashierName,
      notes: reason,
      encryptedSignature: sig,
      verified: true
    };
    setReceiptTxn(newTxn);
  };

  const handleClaimFreeReward = (rewardId: string) => {
    if (!selectedCustomer) return;
    sound.playRewardFanfare();
    onRedeemReward(selectedCustomer.passId, rewardId, cashierName);

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const sig = signTransactionReceipt(txnId, selectedCustomer.passId, 0, cashierName);
    setReceiptTxn({
      id: txnId,
      passId: selectedCustomer.passId,
      customerName: selectedCustomer.customerName,
      businessId: business.id,
      type: 'reward_redeemed',
      stampsCount: 0,
      timestamp: 'Just now',
      amountSpendUsd: 0,
      cashierName,
      notes: `Claimed 10th Stamp Free Reward: ${business.rewardTitle}`,
      encryptedSignature: sig,
      verified: true
    });
  };

  const filteredCustomers = customers.filter(c =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.passId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customerPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-6" id="merchant-terminal-container">
      {/* Top Banner / Cashier Station Status */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-2xl shrink-0">
            {business.logoEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{business.name} POS Terminal</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> E2EE Connected
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Scan customer digital passes, issue purchase stamps & verify 10th free rewards
            </p>
          </div>
        </div>

        {/* Cashier & Register Select */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-right">
            <span className="text-neutral-400 block text-[10px]">CURRENT REGISTER</span>
            <input
              type="text"
              value={cashierName}
              onChange={e => setCashierName(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
              id="input-cashier-name"
            />
          </div>

          {business.settings.requireCashierPin && (
            <button
              onClick={() => setIsPinUnlocked(false)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPinUnlocked
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  : 'bg-red-500/20 border-red-500/40 text-red-300'
              }`}
              id="btn-lock-terminal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isPinUnlocked ? 'Lock' : 'Locked'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: POS Scanner & Stamp Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* PIN Lock Guard */}
          {business.settings.requireCashierPin && !isPinUnlocked ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-white space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold">Cashier Authorization Required</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Enter merchant PIN to unlock stamp stamping & reward redemptions (Default demo PIN: {business.settings.cashierPin})
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <input
                  type="password"
                  placeholder="Enter 4-digit PIN..."
                  maxLength={6}
                  value={cashierPinInput}
                  onChange={e => setCashierPinInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-2.5 px-4 text-center text-lg font-mono tracking-widest text-white focus:border-amber-500 focus:outline-none"
                  id="input-cashier-pin"
                />
                {pinError && <p className="text-xs text-red-400 font-medium">{pinError}</p>}
                <button
                  onClick={handleVerifyPin}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-colors"
                  id="btn-unlock-pin"
                >
                  Unlock POS Scanner
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scan / Target Customer Selector */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Customer Digital Pass Scanner</span>
                  </div>
                  <button
                    onClick={handleScanSimulation}
                    disabled={isScanning}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                    id="btn-simulate-camera-scan"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isScanning ? 'Scanning...' : 'Simulate Camera Scan'}</span>
                  </button>
                </div>

                {/* Active Customer Summary Banner */}
                {selectedCustomer && (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-300 font-bold text-sm">
                        <StampIcon type={business.stampIcon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{selectedCustomer.customerName}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                            #{selectedCustomer.passId}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">{selectedCustomer.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Current Stamps</span>
                        <div className="text-base font-black text-amber-300">
                          {selectedCustomer.currentStamps} / {business.requiredStamps}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Rewards Ready</span>
                        <div className="text-base font-black text-emerald-400">
                          {selectedCustomer.rewards.filter(r => r.status === 'available').length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanner verification feedback */}
                {qrVerifyStatus && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    qrVerifyStatus.verified
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/60 border border-red-500/40 text-red-300'
                  }`}>
                    {qrVerifyStatus.verified ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{qrVerifyStatus.message}</span>
                  </div>
                )}

                {/* Manual QR / Token input */}
                <div className="pt-2 border-t border-neutral-800/80 flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste Base64 QR token or customer pass ID..."
                    value={manualQRInput}
                    onChange={e => setManualQRInput(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500"
                    id="input-manual-qr"
                  />
                  <button
                    onClick={handleManualQRVerify}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200"
                    id="btn-verify-manual-token"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* Stamp Issuance Actions */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Issue Stamps to Customer</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <span>Order Total: $</span>
                    <input
                      type="number"
                      step="0.25"
                      value={purchaseAmount}
                      onChange={e => setPurchaseAmount(e.target.value)}
                      className="w-16 bg-neutral-950 border border-neutral-800 rounded-md px-1.5 py-0.5 text-xs text-white font-mono text-center focus:border-amber-500 focus:outline-none"
                      id="input-purchase-amount"
                    />
                  </div>
                </div>

                {/* Quick Action Stamping Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Standard 1 Stamp */}
                  <button
                    onClick={() => handleIssueStamps(1, 'In-Store Purchase (+1 Stamp)')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-left space-y-1"
                    id="btn-issue-1-stamp"
                  >
                    <div className="flex items-center justify-between">
                      <Plus className="w-5 h-5" />
                      <span className="text-xl font-black">+1</span>
                    </div>
                    <div className="text-xs font-bold leading-tight">Standard Stamp</div>
                    <div className="text-[10px] opacity-85">1 purchase visit</div>
                  </button>

                  {/* 2X Double Stamp Promo */}
                  <button
                    onClick={() => handleIssueStamps(2, 'Double Stamp Tuesday Boost (+2 Stamps)')}
                    className="p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-750 border border-amber-500/30 text-white font-bold hover:border-amber-500 active:scale-95 transition-all text-left space-y-1"
                    id="btn-issue-2-stamps"
                  >
                    <div className="flex items-center justify-between text-amber-400">
                      <Zap className="w-5 h-5" />
                      <span className="text-xl font-black">+2</span>
                    </div>
                    <div className="text-xs font-bold leading-tight">2X Double Stamp</div>
                    <div className="text-[10px] text-neutral-400">Promo / Happy hour boost</div>
                  </button>

                  {/* Custom stamps */}
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Custom Quantity</span>
                    <div className="flex items-center gap-1 my-1">
                      <input
                        type="number"
                        min={1}
                        max={9}
                        value={customStampCount}
                        onChange={e => setCustomStampCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded-lg p-1 text-center font-bold text-sm text-white"
                        id="input-custom-stamps"
                      />
                      <button
                        onClick={() => handleIssueStamps(customStampCount, `Custom Order (${customStampCount} Stamps)`)}
                        className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs rounded-lg transition-colors"
                        id="btn-issue-custom-stamps"
                      >
                        Stamp
                      </button>
                    </div>
                    <span className="text-[9px] text-neutral-500">For large catering / orders</span>
                  </div>
                </div>

                {/* Redeemable 10th Stamp Rewards Section */}
                {selectedCustomer && selectedCustomer.rewards.some(r => r.status === 'available') && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                        <Gift className="w-4 h-4" />
                        <span>Ready For Immediate Redemption!</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">10th VISIT FREE REWARD</span>
                    </div>

                    <div className="space-y-2">
                      {selectedCustomer.rewards
                        .filter(r => r.status === 'available')
                        .map(reward => (
                          <div
                            key={reward.id}
                            className="p-3 bg-neutral-900/90 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-2"
                          >
                            <div>
                              <h5 className="text-xs font-bold text-white">{reward.title}</h5>
                              <p className="text-[10px] text-neutral-300">Code: <span className="font-mono text-amber-300">{reward.redemptionCode}</span></p>
                            </div>
                            <button
                              onClick={() => handleClaimFreeReward(reward.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95"
                              id={`btn-cashier-redeem-${reward.id}`}
                            >
                              Redeem Free Item
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer Queue & Transaction Audit Log (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer CRM Queue Quick Selector */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Active Customer Directory</h3>
              <span className="text-xs text-neutral-400">{filteredCustomers.length} Members</span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name, phone, or pass ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                id="input-search-customers"
              />
            </div>

            {/* Member List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredCustomers.map(cust => {
                const isSelected = cust.passId === selectedPassId;
                return (
                  <div
                    key={cust.passId}
                    onClick={() => {
                      setSelectedPassId(cust.passId);
                      setQrVerifyStatus(null);
                      sound.playScanBeep();
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {cust.currentStamps}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-white leading-tight">{cust.customerName}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">#{cust.passId} • {cust.tier.split(' ')[0]}</div>
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      <span className="font-bold text-amber-300">{cust.currentStamps}/9</span>
                      {cust.currentStamps === 8 && (
                        <span className="block text-[9px] text-emerald-400 font-bold">1 AWAY!</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent POS Transactions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Live Transaction Ledger</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Encrypted HMAC Audit</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {transactions.slice(0, 5).map(txn => (
                <div
                  key={txn.id}
                  onClick={() => setReceiptTxn(txn)}
                  className="p-2.5 bg-neutral-950 border border-neutral-800/80 rounded-xl hover:border-neutral-700 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{txn.customerName}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{txn.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="truncate max-w-[180px]">{txn.notes}</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {txn.type === 'reward_redeemed' ? 'FREE 10th' : `+${txn.stampsCount} Stamp`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 pt-1 border-t border-neutral-900">
                    <span>{txn.id}</span>
                    <span className="text-emerald-500 font-semibold">✓ {txn.encryptedSignature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <AnimatePresence>
        {receiptTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm p-6 text-white space-y-4 shadow-2xl"
              id="modal-transaction-receipt"
            >
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base">{business.name}</h3>
                <p className="text-[11px] text-neutral-400">Official Encrypted Digital Stamp Receipt</p>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs divide-y divide-neutral-800">
                <div className="flex justify-between pb-1.5">
                  <span className="text-neutral-400">Transaction ID:</span>
                  <span className="font-mono text-white font-semibold">{receiptTxn.id}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Customer:</span>
                  <span className="font-semibold text-white">{receiptTxn.customerName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Action:</span>
                  <span className="font-semibold text-amber-300">{receiptTxn.notes}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Cashier:</span>
                  <span className="text-neutral-300">{receiptTxn.cashierName}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-neutral-400">Anti-Tamper Hash:</span>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">{receiptTxn.encryptedSignature}</span>
                </div>
              </div>

              <button
                onClick={() => setReceiptTxn(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
                id="btn-close-receipt"
              >
                Close Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
