import React, { useState, useEffect } from 'react';
import {
  Business,
  CustomerPass,
  PushCampaign,
  PushNotificationMessage,
  ReferralRecord,
  RewardItem,
  StampTransaction
} from './types';
import {
  INITIAL_BUSINESSES,
  INITIAL_CUSTOMER_PASSES,
  INITIAL_PUSH_CAMPAIGNS,
  INITIAL_REFERRALS,
  INITIAL_TRANSACTIONS
} from './data/mockData';
import { CustomerWalletView } from './components/CustomerWalletView';
import { CustomerDealsView } from './components/CustomerDealsView';
import { CustomerSettingsView } from './components/CustomerSettingsView';
import { MerchantTerminal } from './components/MerchantTerminal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PushCampaigns } from './components/PushCampaigns';
import { StoreCustomizer } from './components/StoreCustomizer';
import { WalletInstallModal } from './components/WalletInstallModal';
import { SocialShareModal } from './components/SocialShareModal';
import { CustomerPreferencesModal } from './components/CustomerPreferencesModal';
import { NotificationBanner } from './components/NotificationBanner';
import { AutomationsIgniteLogo } from './components/AutomationsIgniteLogo';
import { generateCryptographicHash, signTransactionReceipt } from './utils/crypto';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  ScanLine,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Flame,
  Zap,
  Store,
  Tag,
  User,
  ArrowRight,
  Gift
} from 'lucide-react';

export default function App() {
  // Mode switcher: Customer Mobile App vs Merchant Operations Portal
  const [portalRole, setPortalRole] = useState<'customer' | 'merchant'>('customer');

  // Customer sub-tab: 'wallet' | 'deals' | 'settings'
  const [customerTab, setCustomerTab] = useState<'wallet' | 'deals' | 'settings'>('wallet');

  // Merchant sub-tab: 'pos' | 'analytics' | 'campaigns' | 'studio'
  const [merchantTab, setMerchantTab] = useState<'pos' | 'analytics' | 'campaigns' | 'studio'>('pos');

  // Business state
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('automationsignite_businesses');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });
  const [activeBusinessId, setActiveBusinessId] = useState<string>(INITIAL_BUSINESSES[0].id);

  // Customer passes
  const [customerPasses, setCustomerPasses] = useState<CustomerPass[]>(() => {
    const saved = localStorage.getItem('automationsignite_passes');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_PASSES;
  });
  const [activePassId, setActivePassId] = useState<string>(INITIAL_CUSTOMER_PASSES[0].passId);

  // Transactions
  const [transactions, setTransactions] = useState<StampTransaction[]>(() => {
    const saved = localStorage.getItem('automationsignite_txns');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Push campaigns
  const [campaigns, setCampaigns] = useState<PushCampaign[]>(() => {
    const saved = localStorage.getItem('automationsignite_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_PUSH_CAMPAIGNS;
  });

  // Referrals
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    const saved = localStorage.getItem('automationsignite_referrals');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  // Active push notifications queue
  const [notifications, setNotifications] = useState<PushNotificationMessage[]>([
    {
      id: 'NOTIF-INIT-1',
      title: 'Almost There! 🔥 1 Stamp Away',
      body: 'You have 8/9 stamps! Stop by today to ignite your 10th FREE signature reward on the house.',
      type: 'reward',
      timestamp: '10m ago',
      read: false,
      businessName: 'Ignite Roast & Brew',
      businessEmoji: '🔥',
      discountCode: 'IGNITE-10FREE',
      actionText: 'View Pass'
    },
    {
      id: 'NOTIF-INIT-2',
      title: '⚡ Flash 2X Double Stamps from 2 PM - 5 PM Today!',
      body: 'Earn double stamps on every purchase this afternoon at Ignite Roast & Brew. Fast-track your free reward!',
      type: 'discount',
      timestamp: '2h ago',
      read: false,
      businessName: 'Ignite Roast & Brew',
      businessEmoji: '🔥',
      discountCode: 'FLASH-2X-DOUBLE',
      actionText: 'View Deal'
    }
  ]);

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('automationsignite_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('automationsignite_passes', JSON.stringify(customerPasses));
  }, [customerPasses]);

  useEffect(() => {
    localStorage.setItem('automationsignite_txns', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('automationsignite_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('automationsignite_referrals', JSON.stringify(referrals));
  }, [referrals]);

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || businesses[0];
  const activePass = customerPasses.find(p => p.passId === activePassId) || customerPasses[0];

  // Helper to trigger push notification
  const triggerPushNotification = (
    title: string,
    body: string,
    type: 'reward' | 'stamp' | 'discount' | 'winback' = 'discount',
    discountCode?: string,
    actionText?: string
  ) => {
    const newNotif: PushNotificationMessage = {
      id: `NOTIF-${Date.now()}`,
      title,
      body,
      type,
      timestamp: 'Just now',
      read: false,
      businessName: activeBusiness.name,
      businessEmoji: activeBusiness.logoEmoji,
      discountCode,
      actionText
    };
    sound.playPushChime();
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Add stamps to pass
  const handleAddStamp = (
    passId: string = activePass.passId,
    count: number = 1,
    cashier: string = 'Demo User',
    amountUsd: number = activeBusiness.averageItemPriceUsd,
    notes: string = 'In-Store Purchase'
  ) => {
    setCustomerPasses(prev =>
      prev.map(p => {
        if (p.passId !== passId) return p;

        const updatedStamps = p.currentStamps + count;
        let newRewards = [...p.rewards];
        let resetStamps = updatedStamps;
        let lifetimeBonus = p.totalLifetimeStamps + count;
        let claimedCount = p.totalRewardsClaimed;

        // Check if 10th milestone reached
        if (updatedStamps >= activeBusiness.requiredStamps) {
          resetStamps = updatedStamps % activeBusiness.requiredStamps;
          claimedCount += 1;

          const newReward: RewardItem = {
            id: `REW-${Date.now()}`,
            title: activeBusiness.rewardTitle,
            description: `Unlocked upon collecting ${activeBusiness.requiredStamps} stamps! Free on your 10th visit.`,
            unlockedAt: new Date().toISOString().split('T')[0],
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'available',
            redemptionCode: `IGNITE-${Math.floor(100 + Math.random() * 900)}-FREE`,
            qrPayload: `REWARD:REW-${Date.now()}:${activeBusiness.id}:${passId}`
          };

          newRewards = [newReward, ...newRewards];

          // Trigger celebratory banner
          setTimeout(() => {
            triggerPushNotification(
              `🔥 10TH REWARD IGNITED! FREE PERK UNLOCKED!`,
              `Congratulations ${p.customerName}! You earned a ${activeBusiness.rewardTitle}. Tap to show your barcode!`,
              'reward',
              newReward.redemptionCode,
              'View Reward'
            );
          }, 300);
        } else if (resetStamps === activeBusiness.requiredStamps - 1) {
          // 1 stamp away automated trigger!
          setTimeout(() => {
            triggerPushNotification(
              `Almost There! 🔥 1 Stamp Away`,
              `You are at ${resetStamps}/${activeBusiness.requiredStamps} stamps! 1 more visit to ignite your free ${activeBusiness.rewardTitle}!`,
              'stamp'
            );
          }, 800);
        }

        // Generate updated cryptographically signed token
        const newHash = generateCryptographicHash(
          `${passId}:${activeBusiness.id}:${resetStamps}:${activeBusiness.securityKeyId}`
        );

        const currentBalance = p.pointsBalance ?? 250;
        const newPointsBalance = currentBalance + (count * 15);

        return {
          ...p,
          pointsBalance: newPointsBalance,
          currentStamps: resetStamps,
          totalLifetimeStamps: lifetimeBonus,
          totalRewardsClaimed: claimedCount,
          lastVisitDate: 'Today, Just now',
          streakVisits: p.streakVisits + 1,
          rewards: newRewards,
          securityToken: {
            hash: newHash,
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(2, 7).toUpperCase()
          }
        };
      })
    );

    // Record stamp transaction
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: StampTransaction = {
      id: txnId,
      passId,
      customerName: customerPasses.find(p => p.passId === passId)?.customerName || 'Loyal Customer',
      businessId: activeBusiness.id,
      type: count > 1 ? 'bonus_stamp' : 'stamp_earned',
      stampsCount: count,
      timestamp: 'Just now',
      amountSpendUsd: amountUsd,
      cashierName: cashier,
      notes,
      encryptedSignature: signTransactionReceipt(txnId, passId, count, cashier),
      verified: true
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Redeem with points handler
  const handleRedeemWithPoints = (passId: string, pointsCost: number, newReward: RewardItem) => {
    setCustomerPasses(prev =>
      prev.map(p => {
        if (p.passId !== passId) return p;
        const currentPts = p.pointsBalance ?? 250;
        const newBalance = Math.max(0, currentPts - pointsCost);
        return {
          ...p,
          pointsBalance: newBalance,
          rewards: [newReward, ...p.rewards]
        };
      })
    );

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: StampTransaction = {
      id: txnId,
      passId,
      customerName: customerPasses.find(p => p.passId === passId)?.customerName || 'Loyal Customer',
      businessId: activeBusiness.id,
      type: 'reward_redeemed',
      stampsCount: 0,
      timestamp: 'Just now',
      amountSpendUsd: 0,
      cashierName: 'Rewards Store App',
      notes: `Points Redemption: ${newReward.title} (-${pointsCost} pts)`,
      encryptedSignature: signTransactionReceipt(txnId, passId, 0, 'POINTS_REDEEM'),
      verified: true
    };

    setTransactions(prev => [newTx, ...prev]);

    triggerPushNotification(
      `🎉 ${newReward.title} Redeemed!`,
      `Deducted ${pointsCost} points. Current Balance: ${Math.max(0, (activePass.pointsBalance ?? 250) - pointsCost)} pts.`,
      'reward',
      newReward.redemptionCode
    );
  };

  // Redeem reward
  const handleRedeemReward = (passId: string, rewardId: string) => {
    setCustomerPasses(prev =>
      prev.map(p => {
        if (p.passId !== passId) return p;
        return {
          ...p,
          rewards: p.rewards.map(r =>
            r.id === rewardId ? { ...r, status: 'redeemed', redeemedAt: new Date().toISOString() } : r
          )
        };
      })
    );

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: StampTransaction = {
      id: txnId,
      passId,
      customerName: customerPasses.find(p => p.passId === passId)?.customerName || 'Loyal Customer',
      businessId: activeBusiness.id,
      type: 'reward_redeemed',
      stampsCount: 0,
      timestamp: 'Just now',
      amountSpendUsd: 0,
      cashierName: 'POS Barcode Scanner',
      notes: `Redeemed ${activeBusiness.rewardTitle} ($${activeBusiness.rewardValueUsd.toFixed(2)} value)`,
      encryptedSignature: signTransactionReceipt(txnId, passId, 0, 'REWARD_REDEEM'),
      verified: true
    };

    setTransactions(prev => [newTx, ...prev]);

    triggerPushNotification(
      `🎉 Reward Redeemed!`,
      `Your free ${activeBusiness.rewardTitle} has been claimed. Thank you for your loyalty!`,
      'reward'
    );
  };

  // Update customer pass details from Settings
  const handleUpdateCustomerPass = (updated: Partial<CustomerPass>) => {
    setCustomerPasses(prev =>
      prev.map(p => (p.passId === activePass.passId ? { ...p, ...updated } : p))
    );
  };

  // Add Referral
  const handleAddReferral = (friendName: string) => {
    const newRef: ReferralRecord = {
      id: `REF-${Date.now()}`,
      referrerPassId: activePass.passId,
      referredName: friendName,
      date: 'Just now',
      status: 'reward_granted',
      bonusAwarded: true
    };

    setReferrals(prev => [newRef, ...prev]);

    // Give 1 bonus stamp to active pass
    handleAddStamp(activePass.passId, 1, 'Automations Ignite Referral', 0, `Referral Bonus for inviting ${friendName}`);

    triggerPushNotification(
      `🔥 Referral Bonus Stamp Ignited!`,
      `${friendName} joined your stamp card! +1 Bonus Stamp has been added to your wallet pass.`,
      'reward'
    );
  };

  // Reset to initial mock dataset
  const handleResetDefaults = () => {
    localStorage.clear();
    setBusinesses(INITIAL_BUSINESSES);
    setCustomerPasses(INITIAL_CUSTOMER_PASSES);
    setTransactions(INITIAL_TRANSACTIONS);
    setCampaigns(INITIAL_PUSH_CAMPAIGNS);
    setReferrals(INITIAL_REFERRALS);
    setActiveBusinessId(INITIAL_BUSINESSES[0].id);
    setActivePassId(INITIAL_CUSTOMER_PASSES[0].passId);
    sound.playPushChime();
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black bg-grid-circuit relative">
      {/* Top Ambient Fiery Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-radial-ignite pointer-events-none" />

      {/* Real-time floating Push Notification Banner */}
      <NotificationBanner
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        onActionClick={() => {
          setPortalRole('customer');
          setCustomerTab('deals');
        }}
      />

      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0e14]/95 backdrop-blur-xl border-b border-neutral-800/80 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Automations Ignite Brand Lockup */}
            <div className="flex items-center gap-3 shrink-0">
              <AutomationsIgniteLogo size={36} variant="full" />
            </div>

            {/* Role Switcher Pill: Customer Mobile App vs Merchant Operations */}
            <div className="flex items-center p-1 rounded-2xl bg-[#141620] border border-neutral-700/80 shadow-inner">
              <button
                onClick={() => {
                  setPortalRole('customer');
                  sound.playScanBeep();
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  portalRole === 'customer'
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 shadow-md shadow-orange-500/25'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                }`}
                id="btn-role-customer-app"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Customer Mobile App</span>
              </button>

              <button
                onClick={() => {
                  setPortalRole('merchant');
                  sound.playScanBeep();
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  portalRole === 'merchant'
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 shadow-md shadow-orange-500/25'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                }`}
                id="btn-role-merchant-portal"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Merchant & Admin Portal</span>
                <span className="sm:hidden">Merchant</span>
              </button>
            </div>

            {/* Quick Demo Business Preset Switcher & Security Badge */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <select
                  value={activeBusinessId}
                  onChange={e => {
                    setActiveBusinessId(e.target.value);
                    sound.playScanBeep();
                  }}
                  className="bg-[#14161f] border border-neutral-700/80 hover:border-orange-500 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-orange-500 pr-8 appearance-none cursor-pointer transition-colors shadow-inner hidden md:block"
                  id="select-business-preset"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.logoEmoji} {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none hidden md:block" />
              </div>

              <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>E2EE Active</span>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs based on Active Role */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-neutral-800/60 text-xs font-semibold">
            {portalRole === 'customer' ? (
              <>
                <button
                  onClick={() => {
                    setCustomerTab('wallet');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    customerTab === 'wallet'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-customer-wallet-tab"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Wallet Pass</span>
                </button>

                <button
                  onClick={() => {
                    setCustomerTab('deals');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    customerTab === 'deals'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-customer-deals-tab"
                >
                  <Bell className="w-4 h-4" />
                  <span>Automated Push & Deals</span>
                  {notifications.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setCustomerTab('settings');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    customerTab === 'settings'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-customer-settings-tab"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMerchantTab('pos');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    merchantTab === 'pos'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-merchant-pos-tab"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Merchant POS & Stamp Scanner</span>
                </button>

                <button
                  onClick={() => {
                    setMerchantTab('analytics');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    merchantTab === 'analytics'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-merchant-analytics-tab"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Retention Analytics Hub</span>
                </button>

                <button
                  onClick={() => {
                    setMerchantTab('campaigns');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    merchantTab === 'campaigns'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-merchant-campaigns-tab"
                >
                  <Bell className="w-4 h-4" />
                  <span>Automated Push Campaign Dispatcher</span>
                </button>

                <button
                  onClick={() => {
                    setMerchantTab('studio');
                    sound.playScanBeep();
                  }}
                  className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                    merchantTab === 'studio'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-neutral-950 font-bold shadow-md shadow-orange-500/30'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  id="nav-merchant-studio-tab"
                >
                  <Settings className="w-4 h-4" />
                  <span>Card Studio & Settings</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* CUSTOMER PORTAL VIEWS */}
        {portalRole === 'customer' && (
          <div className="space-y-6">
            {customerTab === 'wallet' && (
              <div className="space-y-6">
                {/* Top Profile & Quick Switch Banner */}
                <div className="max-w-md mx-auto bg-[#10121a]/90 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-300 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{activeBusiness.logoEmoji}</span>
                    <span>
                      Cardholder: <strong>{activePass.customerName}</strong> ({activePass.currentStamps}/{activeBusiness.requiredStamps} stamps)
                    </span>
                  </div>
                  <button
                    onClick={() => setCustomerTab('settings')}
                    className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                    id="btn-quick-settings-link"
                  >
                    <span>Settings</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <CustomerWalletView
                  business={activeBusiness}
                  pass={activePass}
                  onAddStamp={() => handleAddStamp(activePass.passId, 1, 'Self Tap / NFC Demo')}
                  onRedeemReward={(rewardId) => handleRedeemReward(activePass.passId, rewardId)}
                  onRedeemWithPoints={handleRedeemWithPoints}
                  onOpenSocialShare={() => setIsSocialShareOpen(true)}
                  onOpenPreferences={() => setCustomerTab('settings')}
                  onOpenWalletModal={() => setIsWalletModalOpen(true)}
                  onTriggerPushNotification={triggerPushNotification}
                />
              </div>
            )}

            {customerTab === 'deals' && (
              <CustomerDealsView
                business={activeBusiness}
                pass={activePass}
                notifications={notifications}
                campaigns={campaigns}
                onTriggerPushNotification={triggerPushNotification}
                onGoToWalletPass={() => setCustomerTab('wallet')}
              />
            )}

            {customerTab === 'settings' && (
              <CustomerSettingsView
                business={activeBusiness}
                pass={activePass}
                onUpdatePass={handleUpdateCustomerPass}
                onOpenWalletModal={() => setIsWalletModalOpen(true)}
                onTriggerPushNotification={triggerPushNotification}
              />
            )}
          </div>
        )}

        {/* MERCHANT PORTAL VIEWS */}
        {portalRole === 'merchant' && (
          <div className="space-y-6">
            {merchantTab === 'pos' && (
              <MerchantTerminal
                business={activeBusiness}
                customers={customerPasses}
                transactions={transactions}
                onIssueStamps={handleAddStamp}
                onRedeemReward={handleRedeemReward}
              />
            )}

            {merchantTab === 'analytics' && (
              <AnalyticsDashboard
                business={activeBusiness}
                customers={customerPasses}
                transactions={transactions}
                onUpdateCustomerStamps={(passId, delta) => {
                  if (delta > 0) {
                    handleAddStamp(passId, delta, 'Merchant Manual Care Credit', 0, 'Customer Care Credit');
                  } else {
                    setCustomerPasses(prev =>
                      prev.map(p =>
                        p.passId === passId
                          ? { ...p, currentStamps: Math.max(0, p.currentStamps + delta) }
                          : p
                      )
                    );
                  }
                }}
              />
            )}

            {merchantTab === 'campaigns' && (
              <PushCampaigns
                business={activeBusiness}
                campaigns={campaigns}
                customers={customerPasses}
                onTriggerTestPush={triggerPushNotification}
                onCreateCampaign={(camp) => setCampaigns(prev => [camp, ...prev])}
              />
            )}

            {merchantTab === 'studio' && (
              <StoreCustomizer
                business={activeBusiness}
                onUpdateBusiness={(updated) => {
                  setBusinesses(prev => prev.map(b => (b.id === updated.id ? updated : b)));
                }}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#0a0b10] py-6 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <AutomationsIgniteLogo size={20} variant="icon" withGlow={false} />
            <span className="font-bold text-neutral-300">Automations Ignite</span>
            <span>•</span>
            <a
              href="https://automationsignite.com"
              target="_blank"
              rel="noreferrer"
              className="text-orange-400 hover:text-orange-300 underline font-medium"
            >
              automationsignite.com
            </a>
          </div>
          <p>
            Automations Ignite Smart Loyalty Engine • 9 Stamps + 10th Free Milestone • Apple Wallet & Google Pay Pass Sync
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Cryptographic Anti-Tamper
            </span>
            <span>•</span>
            <a
              href="mailto:igniteautom@gmail.com"
              className="text-neutral-400 hover:text-neutral-200"
            >
              igniteautom@gmail.com
            </a>
            <span>•</span>
            <button
              onClick={handleResetDefaults}
              className="text-neutral-400 hover:text-neutral-200 underline"
              id="btn-footer-reset"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletInstallModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        business={activeBusiness}
        pass={activePass}
        onInstallSuccess={(plat) => {
          setCustomerPasses(prev =>
            prev.map(p =>
              p.passId === activePass.passId
                ? {
                    ...p,
                    walletInstalled: {
                      ...p.walletInstalled,
                      [plat === 'apple' ? 'appleWallet' : 'googleWallet']: true
                    }
                  }
                : p
            )
          );
          triggerPushNotification(
            `Pass Added to ${plat === 'apple' ? 'Apple Wallet' : 'Google Pay'}!`,
            `Your digital stamp card is ready. Lock-screen notifications and NFC tap are now active.`,
            'stamp'
          );
        }}
      />

      <SocialShareModal
        isOpen={isSocialShareOpen}
        onClose={() => setIsSocialShareOpen(false)}
        business={activeBusiness}
        pass={activePass}
        referrals={referrals}
        onAddReferral={handleAddReferral}
      />

      <CustomerPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        pass={activePass}
        onUpdatePreferences={(updatedPrefs, name, phone, email) => {
          setCustomerPasses(prev =>
            prev.map(p =>
              p.passId === activePass.passId
                ? {
                    ...p,
                    customerName: name,
                    customerPhone: phone,
                    customerEmail: email,
                    preferences: updatedPrefs
                  }
                : p
            )
          );
          triggerPushNotification('Preferences Updated', 'Your notification and contact settings have been saved.', 'discount');
        }}
      />
    </div>
  );
}
