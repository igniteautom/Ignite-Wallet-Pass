import React, { useState } from 'react';
import { Business, CustomerPass, PushNotificationMessage, PushCampaign } from '../types';
import {
  Bell,
  Sparkles,
  Zap,
  Tag,
  Copy,
  Check,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Gift,
  TrendingUp,
  Percent,
  CheckCircle2,
  Share2,
  Calendar,
  Smartphone
} from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CustomerDealsViewProps {
  business: Business;
  pass: CustomerPass;
  notifications: PushNotificationMessage[];
  campaigns: PushCampaign[];
  onTriggerPushNotification: (
    title: string,
    body: string,
    type?: 'reward' | 'stamp' | 'discount' | 'winback',
    discountCode?: string,
    actionText?: string
  ) => void;
  onGoToWalletPass: () => void;
  onApplyDealCode?: (code: string) => void;
}

export const CustomerDealsView: React.FC<CustomerDealsViewProps> = ({
  business,
  pass,
  notifications,
  campaigns,
  onTriggerPushNotification,
  onGoToWalletPass,
  onApplyDealCode
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activatedDeals, setActivatedDeals] = useState<string[]>(['DEAL-IGNITE-2X']);
  const [filterCategory, setFilterCategory] = useState<'all' | 'flash' | 'vip' | 'rewards'>('all');

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    sound.playScanBeep();
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleActivateDeal = (dealId: string, title: string, discountCode: string) => {
    if (!activatedDeals.includes(dealId)) {
      setActivatedDeals(prev => [...prev, dealId]);
    }
    sound.playStampSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ff6a00', '#ea580c', '#f59e0b', '#ffffff']
    });

    onTriggerPushNotification(
      `⚡ Deal Activated: ${title}`,
      `Your exclusive perk code ${discountCode} is now loaded to your wallet pass! Present at checkout.`,
      'discount',
      discountCode,
      'View in Wallet'
    );
  };

  // Curated customer deals dynamic to current business and stamp count
  const curatedDeals = [
    {
      id: 'DEAL-IGNITE-1AWAY',
      category: 'rewards',
      badge: '🎯 1-Stamp Milestone',
      title: `${activeRewardContext(pass.currentStamps, business.requiredStamps)} Free ${business.category === 'pizza' ? 'Pizza' : business.category === 'bakery' ? 'Pastry Box' : 'Coffee'} Milestone!`,
      description: `You have ${pass.currentStamps}/${business.requiredStamps} stamps collected. Visit today to ignite your 10th FREE reward voucher worth $${business.rewardValueUsd.toFixed(2)}!`,
      discountCode: 'IGNITE-10FREE',
      expiresIn: 'Expires in 48h',
      highlight: true,
      tag: 'Automated Milestone',
      accentColor: 'from-orange-500/20 via-amber-500/10 to-transparent',
      borderColor: 'border-orange-500/40'
    },
    {
      id: 'DEAL-IGNITE-2X',
      category: 'flash',
      badge: '⚡ Today 2:00 PM - 5:00 PM',
      title: 'Automated 2X Double Stamp Flash Hour',
      description: 'Order any signature beverage or item during the afternoon rush and receive 2 stamps on your digital pass instead of 1.',
      discountCode: 'FLASH-2X-DOUBLE',
      expiresIn: 'Today only (2-5 PM)',
      highlight: false,
      tag: 'Double Stamp Trigger',
      accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/30'
    },
    {
      id: 'DEAL-IGNITE-VIP20',
      category: 'vip',
      badge: `⭐ ${pass.tier} Exclusive`,
      title: '20% Off Specialty Crafted Menu Items',
      description: `Exclusive loyalty member perk for ${pass.customerName}. Enjoy 20% off all artisan cold brews, roasts, and bakery items this week.`,
      discountCode: 'VIP-IGNITE-20',
      expiresIn: 'Ends Sunday',
      highlight: false,
      tag: 'Tier Exclusive',
      accentColor: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'DEAL-IGNITE-FRIEND',
      category: 'rewards',
      badge: '🎁 Share & Earn',
      title: 'Invite a Friend • You Both Get +1 Stamp',
      description: `Share your referral code (${pass.referralCode}). When a friend registers and scans for their first visit, you automatically get 1 bonus stamp!`,
      discountCode: pass.referralCode,
      expiresIn: 'No Expiration',
      highlight: false,
      tag: 'Referral Engine',
      accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30'
    }
  ];

  const filteredDeals = curatedDeals.filter(deal => {
    if (filterCategory === 'all') return true;
    return deal.category === filterCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="customer-deals-container">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141620] via-[#0f1118] to-[#0a0b10] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>Automations Ignite • Push & Deals Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Exclusive Member Deals & Automated Alerts
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Lock-screen push notifications, flash double-stamp hours, and milestone rewards tailored for{' '}
              <span className="text-orange-300 font-semibold">{pass.customerName}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onGoToWalletPass}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              id="btn-deals-view-pass"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open My Stamp Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Milestone Progress Capsule */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#12141d]/80 rounded-2xl p-3 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
              {pass.currentStamps}/{business.requiredStamps}
            </div>
            <div>
              <div className="text-neutral-400 text-[11px]">Current Progress</div>
              <div className="font-bold text-white">
                {business.requiredStamps - pass.currentStamps === 1
                  ? '🔥 1 Stamp Away From Free Perk!'
                  : `${business.requiredStamps - pass.currentStamps} stamps until 10th free`}
              </div>
            </div>
          </div>

          <div className="bg-[#12141d]/80 rounded-2xl p-3 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              ⭐
            </div>
            <div>
              <div className="text-neutral-400 text-[11px]">Member Tier</div>
              <div className="font-bold text-white">{pass.tier}</div>
            </div>
          </div>

          <div className="bg-[#12141d]/80 rounded-2xl p-3 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-neutral-400 text-[11px]">Pass Sync Status</div>
              <div className="font-bold text-emerald-400">Apple & Google Wallet Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Push Notification Lock-Screen Feed */}
      <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Live Push Notification Inbox</h2>
              <p className="text-[11px] text-neutral-400">
                Automated lock-screen broadcasts delivered directly to your device
              </p>
            </div>
          </div>

          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-400 border border-orange-500/30">
            {notifications.length} Recent Alerts
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-[#0b0c10] rounded-2xl p-6 text-center border border-dashed border-neutral-800">
            <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-neutral-400 font-medium">All caught up! No unread push notifications.</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              You will automatically receive alerts when you are 1 stamp away from your free reward or during flash double-stamp hours.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="bg-[#151822] hover:bg-[#1a1e2b] border border-neutral-800/80 hover:border-orange-500/40 rounded-2xl p-4 transition-all duration-200 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-neutral-950 font-black flex items-center justify-center text-base shrink-0 shadow-md shadow-orange-500/20">
                      {notif.businessEmoji || '🔥'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{notif.title}</span>
                        <span className="text-[10px] text-neutral-400 font-medium">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{notif.body}</p>
                      
                      {notif.discountCode && (
                        <div className="pt-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-neutral-950 border border-orange-500/40 text-orange-300 px-2 py-0.5 rounded-md">
                            {notif.discountCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(notif.discountCode!)}
                            className="text-[10px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                          >
                            {copiedCode === notif.discountCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0 capitalize">
                    {notif.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Deals & Perks Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Active Exclusive Deals & Boosters</h2>
            <p className="text-xs text-neutral-400">
              Tap any deal to activate and automatically link it with your digital stamp pass
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#10121a] p-1 rounded-xl border border-neutral-800 self-start">
            {(['all', 'flash', 'rewards', 'vip'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => { setFilterCategory(cat); sound.playScanBeep(); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-orange-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Deals' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeals.map(deal => {
            const isActivated = activatedDeals.includes(deal.id);
            return (
              <div
                key={deal.id}
                className={`relative overflow-hidden bg-gradient-to-b ${deal.accentColor} bg-[#12141e] border ${
                  deal.borderColor
                } rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xl flex flex-col justify-between`}
              >
                {deal.highlight && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                    Featured
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                      {deal.badge}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {deal.expiresIn}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                      {deal.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                        Promo Code:
                      </span>
                      <span className="font-mono font-bold text-xs bg-[#090a0e] border border-neutral-700 text-amber-300 px-2 py-0.5 rounded">
                        {deal.discountCode}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(deal.discountCode)}
                      className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-medium"
                      title="Copy promo code"
                    >
                      {copiedCode === deal.discountCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCode === deal.discountCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleActivateDeal(deal.id, deal.title, deal.discountCode)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isActivated
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 shadow-md shadow-orange-500/20'
                    }`}
                  >
                    {isActivated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Activated on Stamp Pass</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Activate & Load to Pass</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function activeRewardContext(current: number, required: number) {
  if (current >= required) return '🎉 Ready to Redeem:';
  if (current === required - 1) return '🔥 1 Stamp Away:';
  return '🌟 Progress Milestone:';
}
