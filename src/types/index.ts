export type BusinessCategory = 'coffee' | 'pizza' | 'bakery' | 'restaurant' | 'boba' | 'burger' | 'custom';

export type StampIconType = 'ignite' | 'gear' | 'circuit' | 'flame' | 'coffee' | 'pizza' | 'croissant' | 'utensils' | 'cup-soda' | 'star' | 'sparkles' | 'heart' | 'beer';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  tagline: string;
  address: string;
  phone: string;
  website: string;
  themeColor: string; // hex or tailwind class
  cardGradient: {
    from: string;
    to: string;
    accent: string;
    text: string;
  };
  stampIcon: StampIconType;
  requiredStamps: number; // 9 by default, 10th is free
  rewardTitle: string;
  rewardDescription: string;
  rewardValueUsd: number;
  averageItemPriceUsd: number;
  logoEmoji: string;
  securityKeyId: string;
  settings: {
    enableDoubleStampsTuesday: boolean;
    enableBirthdayBonus: boolean;
    enablePushAlerts: boolean;
    enableSmsAlerts: boolean;
    enableEmailSummaries: boolean;
    requireCashierPin: boolean;
    cashierPin: string;
    autoTriggerWinbackDays: number;
  };
}

export type LoyaltyTier = 'Bronze Regular' | 'Silver Connoisseur' | 'Gold VIP' | 'Diamond Legend';

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  expiresAt: string;
  status: 'available' | 'redeemed';
  redeemedAt?: string;
  redemptionCode: string;
  qrPayload: string;
}

export interface CustomerPass {
  passId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessId: string;
  currentStamps: number; // 0 to 9 (10th triggers reward and resets to 0)
  pointsBalance?: number; // Loyalty points balance (e.g. 250 pts)
  totalLifetimeStamps: number;
  totalRewardsClaimed: number;
  tier: LoyaltyTier;
  streakVisits: number;
  lastVisitDate: string;
  memberSince: string;
  rewards: RewardItem[];
  walletInstalled: {
    appleWallet: boolean;
    googleWallet: boolean;
  };
  securityToken: {
    hash: string;
    timestamp: number;
    nonce: string;
  };
  referralCode: string;
  referredBy?: string;
  preferences: {
    pushNotificationAllowed: boolean;
    smsPromosAllowed: boolean;
    exclusiveDealsAllowed: boolean;
    locationBeaconAlerts: boolean;
  };
}

export interface StampTransaction {
  id: string;
  passId: string;
  customerName: string;
  businessId: string;
  type: 'stamp_earned' | 'reward_redeemed' | 'bonus_stamp' | 'referral_bonus' | 'manual_adjustment';
  stampsCount: number;
  timestamp: string;
  amountSpendUsd?: number;
  cashierName: string;
  notes: string;
  encryptedSignature: string;
  verified: boolean;
}

export interface PushNotificationMessage {
  id: string;
  title: string;
  body: string;
  type: 'reward' | 'stamp' | 'discount' | 'winback' | 'referral';
  timestamp: string;
  read: boolean;
  businessName: string;
  businessEmoji: string;
  actionText?: string;
  discountCode?: string;
}

export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  targetAudience: 'all' | 'one_stamp_away' | 'inactive_14d' | 'vip_only' | 'new_members';
  triggerType: 'automated' | 'scheduled' | 'flash_drop';
  status: 'active' | 'sent' | 'draft';
  scheduledTime?: string;
  lastSent?: string;
  stats: {
    delivered: number;
    opened: number;
    converted: number;
    revenueGenerated: number;
  };
  discountCode?: string;
}

export interface ReferralRecord {
  id: string;
  referrerPassId: string;
  referredName: string;
  date: string;
  status: 'registered' | 'first_stamp_earned' | 'reward_granted';
  bonusAwarded: boolean;
}
