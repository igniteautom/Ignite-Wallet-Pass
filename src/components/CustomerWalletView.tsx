import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Business, CustomerPass, RewardItem } from '../types';
import { generateDynamicQRToken } from '../utils/crypto';
import { sound } from '../utils/audio';
import {
  ChevronLeft,
  ChevronRight,
  User,
  QrCode,
  Gift,
  Smartphone,
  Flame,
  ArrowRight,
  X,
  Sparkles,
  ShieldCheck,
  RotateCw,
  Copy,
  Check,
  MapPin,
  Navigation,
  Timer,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { NearestLocationModal } from './NearestLocationModal';
import {
  formatDistance,
  formatSecondsToTime,
  getSortedBusinessesByDistance,
  GEOFENCE_INSIDE_THRESHOLD_FEET,
  VISIT_DURATION_REQUIRED_SECONDS,
  VISIT_REWARD_POINTS,
  VISIT_REWARD_STAMPS
} from '../utils/geolocation';

interface CustomerWalletViewProps {
  business: Business;
  businesses?: Business[];
  pass: CustomerPass;
  onAddStamp: () => void;
  onRedeemReward: (rewardId: string) => void;
  onRedeemWithPoints: (passId: string, pointsCost: number, newReward: RewardItem) => void;
  onAwardVisitReward?: (points: number, stamps: number, businessName: string) => void;
  onOpenSocialShare: () => void;
  onOpenPreferences: () => void;
  onOpenWalletModal: () => void;
  onTriggerPushNotification: (title: string, body: string, type: 'reward' | 'stamp' | 'discount') => void;
}

export interface StoreRewardItem {
  id: string;
  name: string;
  category: 'coffee' | 'pastries' | 'merchandise';
  points: number;
  image: string;
  description: string;
  featured?: boolean;
}

const STORE_CATALOG: StoreRewardItem[] = [
  {
    id: 'rew_nitro',
    name: 'Nitro Cold Brew',
    category: 'coffee',
    points: 75,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    description: 'Silky micro-foam nitrogen-infused small-batch cold brew on tap.',
    featured: true
  },
  {
    id: 'rew_latte',
    name: 'Signature Latte',
    category: 'coffee',
    points: 60,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
    description: 'Double shot of house espresso with velvety steamed whole or oat milk.',
    featured: true
  },
  {
    id: 'rew_croissant',
    name: 'Gourmet Croissant',
    category: 'pastries',
    points: 40,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    description: 'Flaky, golden Parisian butter croissant baked fresh daily.',
    featured: true
  },
  {
    id: 'rew_regular_coffee',
    name: 'Free Regular Coffee',
    category: 'coffee',
    points: 50,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: 'Any hot or iced coffee up to 16oz.',
    featured: false
  },
  {
    id: 'rew_caramel_macchiato',
    name: 'Caramel Macchiato',
    category: 'coffee',
    points: 70,
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80',
    description: 'Freshly steamed milk with vanilla syrup, espresso, and caramel drizzle.',
    featured: false
  },
  {
    id: 'rew_pain_chocolat',
    name: 'Artisan Pain au Chocolat',
    category: 'pastries',
    points: 45,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    description: 'Buttery viennoiserie folded around two batons of Belgian dark chocolate.',
    featured: false
  },
  {
    id: 'rew_pistachio_tart',
    name: 'Pistachio Raspberry Tart',
    category: 'pastries',
    points: 55,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp shortcrust tart with roasted pistachio frangipane and fresh raspberries.',
    featured: false
  },
  {
    id: 'rew_ignite_mug',
    name: 'Ignite Ceramic Ember Mug',
    category: 'merchandise',
    points: 110,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: '14oz matte black stoneware mug with engraved Automations Ignite flame seal.',
    featured: false
  },
  {
    id: 'rew_beans_bag',
    name: 'Single Origin Whole Beans (12oz)',
    category: 'merchandise',
    points: 125,
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80',
    description: 'Direct-trade Ethiopian Yirgacheffe with notes of bergamot and candied lemon.',
    featured: false
  },
  {
    id: 'rew_tumbler',
    name: 'Ignite Thermal Vacuum Tumbler',
    category: 'merchandise',
    points: 150,
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80',
    description: '20oz double-wall insulated tumbler that keeps beverages piping hot.',
    featured: false
  }
];

export const CustomerWalletView: React.FC<CustomerWalletViewProps> = ({
  business,
  businesses = [],
  pass,
  onAddStamp,
  onRedeemReward,
  onRedeemWithPoints,
  onAwardVisitReward,
  onOpenSocialShare,
  onOpenPreferences,
  onOpenWalletModal,
  onTriggerPushNotification
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'coffee' | 'pastries' | 'merchandise'>('coffee');
  const [selectedFeaturedId, setSelectedFeaturedId] = useState<string>('rew_nitro');
  const [showQRView, setShowQRView] = useState(false);
  const [showFullQRModal, setShowFullQRModal] = useState(false);
  const [showNearestModal, setShowNearestModal] = useState(false);
  const [redeemingItem, setRedeemingItem] = useState<StoreRewardItem | null>(null);
  const [claimingReward, setClaimingReward] = useState<RewardItem | null>(null);
  const [isNfcTapping, setIsNfcTapping] = useState(false);
  const [qrToken, setQrToken] = useState(() => generateDynamicQRToken(pass.passId, business.id, business.securityKeyId));
  const [countdown, setCountdown] = useState(30);

  // Proximity & Geofencing Visit State
  const [simulatedDistance, setSimulatedDistance] = useState<number>(18); // default to 18 ft (in-store demo)
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isQualified, setIsQualified] = useState<boolean>(false);
  const [hasAwardedThisSession, setHasAwardedThisSession] = useState<boolean>(false);
  const [useRealGps, setUseRealGps] = useState<boolean>(false);
  const prevDistanceRef = useRef<number>(simulatedDistance);

  // Dynamic points from pass state
  const customerPoints = pass.pointsBalance ?? 250;

  // Refresh dynamic QR every 30s with live second counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(generateDynamicQRToken(pass.passId, business.id, business.securityKeyId));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pass.passId, business.id, business.securityKeyId]);

  // Geofence visit timer ticker
  const isInsideGeofence = simulatedDistance <= GEOFENCE_INSIDE_THRESHOLD_FEET;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isInsideGeofence && !hasAwardedThisSession) {
      interval = setInterval(() => {
        setTimeSpentSeconds((prev) => {
          const next = prev + 1;
          if (next >= VISIT_DURATION_REQUIRED_SECONDS && !isQualified) {
            setIsQualified(true);
            sound.playRewardFanfare();
            onTriggerPushNotification(
              '🌟 20-Min Visit Milestone Qualified!',
              `You've stayed 20 minutes at ${business.name}. Step outside the store (>30 ft) to automatically claim your +25 points and +1 stamp!`,
              'stamp'
            );
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInsideGeofence, hasAwardedThisSession, isQualified, business.name, onTriggerPushNotification]);

  // Geofence exit reward trigger (>30 ft) after 20 mins completed
  useEffect(() => {
    const prevDist = prevDistanceRef.current;
    prevDistanceRef.current = simulatedDistance;

    if (isQualified && !hasAwardedThisSession && simulatedDistance > GEOFENCE_INSIDE_THRESHOLD_FEET) {
      setHasAwardedThisSession(true);
      sound.playRewardFanfare();
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#ea580c', '#f59e0b', '#10b981', '#ffffff']
      });

      if (onAwardVisitReward) {
        onAwardVisitReward(VISIT_REWARD_POINTS, VISIT_REWARD_STAMPS, business.name);
      }
    }
  }, [simulatedDistance, isQualified, hasAwardedThisSession, business.name, onAwardVisitReward]);

  // Handle Contactless NFC Tap
  const handleNfcTap = () => {
    setIsNfcTapping(true);
    sound.playStampSound();

    setTimeout(() => {
      onAddStamp();
      setIsNfcTapping(false);

      if (pass.currentStamps === 8) {
        sound.playRewardFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6a00', '#f59e0b', '#fbbf24', '#ffffff']
        });
      }
    }, 500);
  };

  // Handle Redeem Item Click
  const handleRedeemClick = (item: StoreRewardItem) => {
    sound.playScanBeep();
    setRedeemingItem(item);
  };

  // Confirm redemption: deducts points immediately and shows voucher with Close button only
  const handleConfirmRedemption = () => {
    if (!redeemingItem) return;

    if (customerPoints < redeemingItem.points) {
      onTriggerPushNotification(
        'Insufficient Points',
        `You need ${redeemingItem.points} pts for ${redeemingItem.name}. Current: ${customerPoints} pts.`,
        'discount'
      );
      setRedeemingItem(null);
      return;
    }

    sound.playRewardFanfare();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f59e0b', '#10b981', '#ffffff']
    });

    const newRewardId = `REW-${Date.now()}`;
    const generatedVoucher: RewardItem = {
      id: newRewardId,
      title: redeemingItem.name,
      description: redeemingItem.description,
      unlockedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'available',
      redemptionCode: `IGNITE-${Math.floor(100 + Math.random() * 900)}-${redeemingItem.points}PTS`,
      qrPayload: `STORE_REW:${redeemingItem.id}:${pass.passId}:${Date.now()}`
    };

    // Deduct points from balance
    onRedeemWithPoints(pass.passId, redeemingItem.points, generatedVoucher);

    setClaimingReward(generatedVoucher);
    setRedeemingItem(null);
  };

  const featuredItems = STORE_CATALOG.filter(item => item.featured);
  const categoryItems = STORE_CATALOG.filter(item => item.category === selectedCategory);

  const targetPoints = 300;
  const progressRatio = Math.min(100, Math.max(15, (customerPoints / targetPoints) * 100));
  const pointsAway = Math.max(0, targetPoints - customerPoints);

  const dwellProgressRatio = Math.min(100, (timeSpentSeconds / VISIT_DURATION_REQUIRED_SECONDS) * 100);

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto" id="customer-store-wallet-container">
      {/* Main Device Container */}
      <div className="bg-[#0b0c10] border border-neutral-800/80 rounded-[36px] shadow-2xl overflow-hidden text-neutral-100 p-4 sm:p-5 space-y-4">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <button
            onClick={onOpenPreferences}
            className="w-8 h-8 rounded-full flex items-center justify-center text-orange-400 hover:text-orange-300 hover:bg-neutral-800/60 transition-colors"
            id="btn-customer-nav-back"
            title="Go to pass settings"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-1.5 text-center">
            <h1 className="text-[13.5px] sm:text-[14.5px] font-bold text-white tracking-tight">
              Ignite Roast & Brew <span className="text-neutral-500">•</span> Rewards Store
            </h1>
          </div>

          <button
            onClick={onOpenPreferences}
            className="w-8 h-8 rounded-full border border-orange-500/50 flex items-center justify-center text-orange-400 hover:border-orange-400 hover:text-orange-300 hover:bg-neutral-800/60 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.2)]"
            id="btn-customer-user-profile"
            title="Cardholder profile & settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* HERO POINTS CARD */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative bg-gradient-to-b from-[#1b0d06] via-[#120804] to-[#0c0603] border-2 border-orange-500/90 rounded-[24px] p-5 text-center shadow-[0_0_28px_rgba(234,88,12,0.3)] overflow-hidden"
          id="hero-points-card"
        >
          <div className="absolute inset-0 bg-radial-gradient from-orange-500/15 via-transparent to-transparent pointer-events-none" />

          <span className="block text-[11px] sm:text-xs uppercase tracking-widest text-neutral-300 font-bold mb-1">
            YOUR POINTS:
          </span>

          <div className="text-4xl sm:text-[46px] font-black text-white tracking-tight leading-none my-1.5 font-sans drop-shadow-md">
            {customerPoints} pts
          </div>

          <div className="text-xs sm:text-sm font-semibold text-amber-400/95 tracking-wide mt-1 flex items-center justify-center gap-1.5">
            <span>{pass.tier || 'Gold VIP'}</span>
            <span className="text-neutral-500">•</span>
            <span className="font-mono text-neutral-300">#{pass.passId}</span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-orange-950/60 flex items-center justify-between text-[11px] text-neutral-300">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>{pass.currentStamps}/9 Stamps to Next Perk</span>
            </span>
            <button
              onClick={onOpenWalletModal}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 underline underline-offset-2"
            >
              <span>Wallet Pass</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* NEAREST LOCATION & AUTO-VISIT REWARDS CARD */}
        <div
          onClick={() => {
            setShowNearestModal(true);
            sound.playScanBeep();
          }}
          className="bg-gradient-to-r from-[#141824] via-[#10131e] to-[#151019] border border-orange-500/50 hover:border-orange-400 rounded-[22px] p-3 sm:p-3.5 cursor-pointer shadow-lg transition-all group relative overflow-hidden"
          id="banner-nearest-location-trigger"
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
                <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400">
                    Nearest Location
                  </span>
                  {isInsideGeofence ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[8.5px] font-bold">
                      IN STORE (≤30 FT)
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-md bg-neutral-900 text-neutral-400 text-[8.5px]">
                      NEARBY
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-white truncate group-hover:text-orange-200 transition-colors">
                  {business.name}
                </div>
                <div className="text-[10.5px] text-neutral-400 truncate">
                  {business.address}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs sm:text-sm font-black text-orange-400 font-mono">
                {formatDistance(simulatedDistance)}
              </div>
              <span className="text-[9.5px] text-neutral-400 font-medium flex items-center justify-end gap-0.5">
                <span>Details</span>
                <ChevronRight className="w-3 h-3 text-orange-400" />
              </span>
            </div>
          </div>

          {/* Dwell Mini-Bar */}
          <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10.5px]">
            <div className="flex items-center gap-1 text-neutral-300">
              <Timer className="w-3 h-3 text-orange-400 shrink-0" />
              {hasAwardedThisSession ? (
                <span className="text-emerald-400 font-semibold">🎉 +25 pts visit reward collected!</span>
              ) : isQualified ? (
                <span className="text-emerald-400 font-bold">🌟 20m Done! Leave store (&gt;30ft) to collect</span>
              ) : isInsideGeofence ? (
                <span>
                  Visit Time: <strong className="text-white font-mono">{formatSecondsToTime(timeSpentSeconds)}</strong>/20:00
                </span>
              ) : (
                <span>Stay 20m in-store for +25 pts on exit</span>
              )}
            </div>

            <span className="text-[10px] text-orange-400 font-bold underline underline-offset-2">
              Simulator
            </span>
          </div>
        </div>

        {/* FEATURED REWARDS SECTION */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">
              FEATURED REWARDS
            </h2>
            <button
              onClick={() => setSelectedCategory('coffee')}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {featuredItems.map((item) => {
              const isSelected = selectedFeaturedId === item.id;
              const hasEnough = customerPoints >= item.points;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeaturedId(item.id)}
                  className={`flex flex-col justify-between rounded-[20px] p-2 sm:p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1f1008] to-[#120904] border-2 border-orange-500/90 shadow-[0_0_18px_rgba(234,88,12,0.35)]'
                      : 'bg-[#101217] border border-neutral-800/90 hover:border-neutral-700'
                  }`}
                  id={`card-featured-${item.id}`}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </div>

                  <div className="text-center space-y-0.5 mb-2">
                    <h3 className="text-[11px] sm:text-xs font-bold text-white leading-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="text-[10px] sm:text-[11px] font-bold text-orange-400">
                      {item.points} pts
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRedeemClick(item);
                    }}
                    className={`w-full py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all ${
                      hasEnough
                        ? 'border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                        : 'border border-neutral-800 text-neutral-500 hover:border-neutral-700'
                    }`}
                    id={`btn-redeem-${item.id}`}
                  >
                    REDEEM
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-2 pt-1">
          {(['coffee', 'pastries', 'merchandise'] as const).map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  sound.playScanBeep();
                }}
                className={`py-2 px-3.5 sm:px-4 rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#291307] text-white border border-orange-500/60 shadow-[0_0_12px_rgba(234,88,12,0.25)]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
                id={`btn-category-${cat}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* REWARD MENU LIST ITEM */}
        <div className="space-y-2">
          {categoryItems.slice(0, 2).map((item) => {
            const hasEnough = customerPoints >= item.points;
            return (
              <div
                key={item.id}
                onClick={() => handleRedeemClick(item)}
                className="bg-[#12141c] border border-neutral-800/90 hover:border-orange-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md transition-all cursor-pointer group"
                id={`item-menu-${item.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRedeemClick(item);
                  }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl border font-bold text-xs shadow-[0_0_12px_rgba(249,115,22,0.2)] transition-all whitespace-nowrap ${
                    hasEnough
                      ? 'border-orange-500/80 text-orange-400 hover:bg-orange-500 hover:text-neutral-950'
                      : 'border-neutral-800 text-neutral-500'
                  }`}
                  id={`btn-badge-${item.id}`}
                >
                  {item.points} pts
                </button>
              </div>
            );
          })}
        </div>

        {/* PROGRESS BAR SECTION */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span>
              Next Reward: <strong className="text-white">Free Pastry</strong> ({pointsAway} pts away)
            </span>
          </div>

          <div className="w-full h-3 bg-neutral-900/90 rounded-full border border-neutral-800 p-0.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.7)]"
            />
          </div>
        </div>

        {/* BOTTOM CONTACTLESS STAMPING / NFC CARD */}
        <div
          onClick={handleNfcTap}
          className={`bg-[#0d0e14] border border-neutral-800/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl transition-all cursor-pointer ${
            isNfcTapping ? 'ring-2 ring-orange-500 bg-orange-950/20' : 'hover:border-neutral-700'
          }`}
          id="card-contactless-stamping"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.3)]">
              <span className="text-lg font-black tracking-tighter flex items-center justify-center">
                <span className="text-xs opacity-60 mr-0.5">((</span>
                <span className="text-base text-orange-400 font-bold">N</span>
                <span className="text-xs opacity-60 ml-0.5">))</span>
              </span>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Contactless Stamping</span>
                {isNfcTapping && (
                  <span className="text-[10px] text-orange-400 font-normal animate-pulse">
                    (Tapped!)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Hold phone near reader at checkout
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullQRModal(true);
              sound.playScanBeep();
            }}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-2 shrink-0 pr-1"
            id="btn-toggle-show-qr"
          >
            Show QR
          </button>
        </div>

        {/* INLINE QR CODE EXPANDER */}
        <AnimatePresence>
          {showQRView && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#12141d] border border-neutral-800 rounded-2xl p-4 text-center space-y-3 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-white">Dynamic Anti-Screenshot QR</span>
                  <span className="text-orange-400 font-mono text-[10px]">
                    Refreshes in {countdown}s
                  </span>
                </div>

                {/* Crystal Clear SVG QR Code */}
                <div
                  onClick={() => setShowFullQRModal(true)}
                  className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-lg relative cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                >
                  <QRCodeSVG
                    value={`IGNITE_PASS:${pass.passId}:${business.id}:${qrToken}`}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={onOpenWalletModal}
                    className="py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                    id="btn-qr-add-wallet"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Add to Apple / Google Wallet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* NEAREST LOCATION & 20-MIN VISIT REWARD MODAL */}
      <NearestLocationModal
        isOpen={showNearestModal}
        onClose={() => setShowNearestModal(false)}
        businesses={businesses.length > 0 ? businesses : [business]}
        activeBusiness={business}
        pass={pass}
        onAwardVisitReward={onAwardVisitReward || (() => {})}
        simulatedDistance={simulatedDistance}
        setSimulatedDistance={setSimulatedDistance}
        timeSpentSeconds={timeSpentSeconds}
        setTimeSpentSeconds={setTimeSpentSeconds}
        isQualified={isQualified}
        setIsQualified={setIsQualified}
        hasAwardedThisSession={hasAwardedThisSession}
        setHasAwardedThisSession={setHasAwardedThisSession}
        useRealGps={useRealGps}
        setUseRealGps={setUseRealGps}
      />

      {/* FULL-SCREEN DEDICATED QR SCAN MODAL */}
      <AnimatePresence>
        {showFullQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-[#10121a] border border-orange-500/60 rounded-3xl w-full max-w-sm p-6 text-center text-white space-y-4 shadow-2xl"
              id="modal-full-qr-scanner"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-lg">{business.logoEmoji}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white">{business.name}</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">#{pass.passId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullQRModal(false)}
                  className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                  id="btn-close-full-qr-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  Scan at POS Checkout
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">Cardholder: {pass.customerName}</h4>
              </div>

              {/* High Contrast White QR Canvas */}
              <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto flex flex-col items-center justify-center shadow-xl border-4 border-neutral-900 relative">
                <QRCodeSVG
                  value={`IGNITE_PASS:${pass.passId}:${business.id}:${qrToken}`}
                  size={190}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dynamic Token (Auto-refreshes in {countdown}s)</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Anti-screenshot protection active • One-time scan token
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowFullQRModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-orange-500/25"
                  id="btn-done-full-qr"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM REDEMPTION MODAL */}
      <AnimatePresence>
        {redeemingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-[#12141c] border border-neutral-800 rounded-3xl w-full max-w-sm p-5 text-white space-y-4 shadow-2xl"
              id="modal-confirm-redemption"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Redeem with Points
                </span>
                <button
                  onClick={() => setRedeemingItem(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 items-center">
                <img
                  src={redeemingItem.image}
                  alt={redeemingItem.name}
                  className="w-16 h-16 rounded-xl object-cover bg-neutral-900 border border-neutral-800"
                />
                <div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {redeemingItem.name}
                  </h3>
                  <p className="text-xs text-orange-400 font-bold mt-0.5">
                    {redeemingItem.points} Points Required
                  </p>
                </div>
              </div>

              <p className="text-xs text-neutral-300 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                {redeemingItem.description}
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-neutral-400">Your Current Balance:</span>
                <span className="font-bold text-white">{customerPoints} pts</span>
              </div>

              {customerPoints < redeemingItem.points && (
                <p className="text-xs text-rose-400 font-medium">
                  ⚠️ You need {redeemingItem.points - customerPoints} more points to redeem this reward.
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setRedeemingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
                  id="btn-cancel-redemption"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRedemption}
                  disabled={customerPoints < redeemingItem.points}
                  className={`flex-1 py-2.5 rounded-xl text-neutral-950 font-bold text-xs shadow-lg ${
                    customerPoints >= redeemingItem.points
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-orange-500/25'
                      : 'bg-neutral-700 text-neutral-400 cursor-not-allowed opacity-60'
                  }`}
                  id="btn-proceed-redemption"
                >
                  Redeem Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE VOUCHER BARCODE MODAL (AFTER REDEEM NOW) - ONLY CLOSE BUTTON */}
      <AnimatePresence>
        {claimingReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-[#10121a] border border-orange-500/50 rounded-3xl w-full max-w-sm p-6 text-center text-white space-y-4 shadow-2xl"
              id="modal-reward-voucher"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Gift className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  Ready To Claim In-Store
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{claimingReward.title}</h3>
                <p className="text-xs text-neutral-300 mt-1">{claimingReward.description}</p>
              </div>

              {/* Barcode Display */}
              <div className="bg-white p-4 rounded-2xl text-neutral-950 space-y-2">
                <div className="text-xs font-bold tracking-widest uppercase text-neutral-600">
                  Cashier Scan Code
                </div>
                <div className="font-mono text-xl font-black tracking-widest bg-neutral-100 py-2 rounded-lg border border-neutral-300">
                  {claimingReward.redemptionCode}
                </div>
                {/* Barcode lines */}
                <div className="h-10 flex items-center justify-center gap-1 px-4 opacity-85">
                  {[2, 4, 1, 3, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 5, 2].map((w, i) => (
                    <div key={i} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
                  ))}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  PASS: #{pass.passId} • VOUCHER: #{claimingReward.id}
                </div>
              </div>

              {/* Single Close Option */}
              <div className="pt-1">
                <button
                  onClick={() => setClaimingReward(null)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-xs font-bold text-neutral-950 shadow-lg shadow-orange-500/25"
                  id="btn-close-voucher-modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
