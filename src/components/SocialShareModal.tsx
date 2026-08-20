import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, CustomerPass, ReferralRecord } from '../types';
import { StampIcon } from './StampIcon';
import {
  Share2,
  X,
  Copy,
  Check,
  Gift,
  QrCode,
  Users,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  pass: CustomerPass;
  referrals: ReferralRecord[];
  onAddReferral: (friendName: string) => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  business,
  pass,
  referrals,
  onAddReferral
}) => {
  const [copied, setCopied] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [activeTab, setActiveTab] = useState<'share' | 'tracker'>('share');

  if (!isOpen) return null;

  const referralUrl = `https://${business.website || 'perkstamp.io'}/join?ref=${pass.referralCode}`;
  const shareText = `Hey! I'm using the digital stamp card at ${business.name}. Use my link to get a FREE 1st Stamp on your visit! ☕🍕 Link: ${referralUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    sound.playPushChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateFriendJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendNameInput.trim()) return;

    onAddReferral(friendNameInput.trim());
    sound.playRewardFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setFriendNameInput('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white"
          id="modal-social-share"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Social Referral & Viral Rewards</h3>
                <p className="text-xs text-neutral-400">Give a friend 1 Free Stamp • Get 1 Bonus Stamp</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              id="btn-close-share-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="grid grid-cols-2 gap-1 p-2 bg-neutral-950/60 border-b border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('share')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'share' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              id="tab-share-card"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Pass & QR</span>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'tracker' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              id="tab-referral-tracker"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Referred Friends ({referrals.length})</span>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {activeTab === 'share' ? (
              <>
                {/* Social Share Story Preview Card */}
                <div
                  className="rounded-2xl p-5 shadow-2xl relative overflow-hidden text-center space-y-3 border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${business.cardGradient.from} 0%, ${business.cardGradient.to} 100%)`,
                    color: business.cardGradient.text
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-inner">
                    <StampIcon type={business.stampIcon} className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                      VIP Local Invitation
                    </span>
                    <h4 className="text-base font-black tracking-tight">{business.name}</h4>
                    <p className="text-xs opacity-85 mt-1 max-w-xs mx-auto">
                      "{pass.customerName} invited you to claim a free first stamp on your digital loyalty card!"
                    </p>
                  </div>

                  {/* QR & Code */}
                  <div className="bg-white p-3 rounded-xl max-w-[180px] mx-auto text-neutral-900 shadow">
                    <div className="w-24 h-24 border-2 border-black mx-auto p-1 bg-neutral-50 flex items-center justify-center font-mono text-[9px] font-bold">
                      <QrCode className="w-16 h-16 text-black" />
                    </div>
                    <div className="mt-1.5 text-[10px] font-mono font-bold tracking-wider">
                      CODE: {pass.referralCode}
                    </div>
                  </div>
                </div>

                {/* Referral Link & Quick Copy */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300">Your Personal Referral Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralUrl}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow"
                      id="btn-copy-referral-link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Social Quick Share Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
                    id="btn-share-messages"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp / SMS</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
                    id="btn-share-instagram"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                    <span>Instagram Story</span>
                  </button>
                </div>
              </>
            ) : (
              /* Referral Tracker & Simulator */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Referral Performance</h4>
                  <span className="text-xs text-amber-300 font-semibold font-mono">
                    +{referrals.filter(r => r.bonusAwarded).length} Bonus Stamps Earned
                  </span>
                </div>

                {/* Referral List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {referrals.map(ref => (
                    <div
                      key={ref.id}
                      className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-neutral-300">
                          {ref.referredName[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{ref.referredName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Joined {ref.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {ref.bonusAwarded ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            ✓ +1 Stamp Awarded
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-medium">
                            Pending 1st Visit
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulate New Friend Join */}
                <form onSubmit={handleSimulateFriendJoin} className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
                  <span className="text-xs font-semibold text-neutral-300 block">Simulate Friend Joining via Your Link:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Friend's Name (e.g. Jordan Lee)..."
                      value={friendNameInput}
                      onChange={e => setFriendNameInput(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      id="input-sim-friend-name"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl shadow transition-colors"
                      id="btn-submit-sim-friend"
                    >
                      Join & Stamp
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
