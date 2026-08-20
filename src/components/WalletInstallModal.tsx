import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, CustomerPass } from '../types';
import { StampIcon } from './StampIcon';
import { X, Check, ShieldCheck, Smartphone, Bell, QrCode, Radio } from 'lucide-react';
import { sound } from '../utils/audio';

interface WalletInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  pass: CustomerPass;
  onInstallSuccess: (platform: 'apple' | 'google') => void;
}

export const WalletInstallModal: React.FC<WalletInstallModalProps> = ({
  isOpen,
  onClose,
  business,
  pass,
  onInstallSuccess
}) => {
  const [platform, setPlatform] = useState<'apple' | 'google'>('apple');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  if (!isOpen) return null;

  const handleInstall = (targetPlatform: 'apple' | 'google') => {
    setIsInstalling(true);
    sound.playPushChime();

    setTimeout(() => {
      setIsInstalling(false);
      setInstalled(true);
      onInstallSuccess(targetPlatform);
      sound.playStampSound();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-neutral-100"
          id="modal-wallet-install"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-base">
                {business.logoEmoji}
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Add to Mobile Wallet</h3>
                <p className="text-xs text-neutral-400">One-tap access & automated lock-screen perks</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              id="btn-close-wallet-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => { setPlatform('apple'); setInstalled(false); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  platform === 'apple'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                id="tab-apple-wallet"
              >
                <span className="text-sm"></span>
                <span>Apple Wallet</span>
              </button>
              <button
                onClick={() => { setPlatform('google'); setInstalled(false); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  platform === 'google'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                id="tab-google-wallet"
              >
                <span className="text-sm">G</span>
                <span>Google Wallet</span>
              </button>
            </div>

            {/* Pass Preview Card */}
            <div
              className="rounded-2xl p-5 shadow-xl border border-white/10 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${business.cardGradient.from} 0%, ${business.cardGradient.to} 100%)`,
                color: business.cardGradient.text
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] tracking-wider uppercase opacity-75 font-semibold">
                    {platform === 'apple' ? ' Apple Wallet Pass' : 'Google Pay Loyalty'}
                  </span>
                  <h4 className="text-base font-bold tracking-tight">{business.name}</h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <StampIcon type={business.stampIcon} className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-3">
                <div>
                  <span className="text-[10px] opacity-70 block">MEMBER</span>
                  <span className="text-xs font-semibold truncate block">{pass.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">STAMPS</span>
                  <span className="text-xs font-bold text-amber-300 block">{pass.currentStamps} / 9</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 block">TIER</span>
                  <span className="text-xs font-semibold text-emerald-300 block">{pass.tier.split(' ')[0]}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] opacity-80 pt-1">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>NFC Tap & Auto-Pass Ready</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>#{pass.passId}</span>
                </div>
              </div>
            </div>

            {/* Wallet Key Benefits */}
            <div className="space-y-2.5 text-xs text-neutral-300 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Bell className="w-3 h-3" />
                </div>
                <span>Lock-screen notification when nearby or 1 stamp away</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3 h-3" />
                </div>
                <span>NFC contactless tap at register to stamp automatically</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>End-to-end encrypted anti-counterfeit QR protection</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {installed ? (
                <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Successfully Added to {platform === 'apple' ? 'Apple Wallet' : 'Google Pay'}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleInstall(platform)}
                  disabled={isInstalling}
                  className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  id="btn-confirm-add-wallet"
                >
                  {isInstalling ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{platform === 'apple' ? ' Add to Apple Wallet' : 'G Add to Google Wallet'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
