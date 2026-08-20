import { Business, CustomerPass, PushCampaign, StampTransaction, ReferralRecord } from '../types';

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz_ignite_01',
    name: 'Ignite Roast & Brew • Automations Lab',
    category: 'coffee',
    tagline: 'Automated small-batch craft roast & nitro cold brew bar',
    address: '101 Innovation Way, Tech District',
    phone: '(555) 728-4400',
    website: 'automationsignite.com',
    themeColor: '#ea580c',
    cardGradient: {
      from: '#090a0e',
      to: '#231007',
      accent: '#ff6a00',
      text: '#fff7ed'
    },
    stampIcon: 'ignite',
    requiredStamps: 9,
    rewardTitle: 'Free Signature Flame Roast & Gourmet Croissant',
    rewardDescription: 'Enjoy any signature handcrafted espresso, flaming nitro cold brew, or artisanal pastry on the house upon your 10th stamp milestone!',
    rewardValueUsd: 9.50,
    averageItemPriceUsd: 6.25,
    logoEmoji: '🔥',
    securityKeyId: 'SEC_IGNITE_2026',
    settings: {
      enableDoubleStampsTuesday: true,
      enableBirthdayBonus: true,
      enablePushAlerts: true,
      enableSmsAlerts: true,
      enableEmailSummaries: true,
      requireCashierPin: true,
      cashierPin: '1234',
      autoTriggerWinbackDays: 14
    }
  },
  {
    id: 'biz_pizza_02',
    name: 'Ignite Wood-Fired Forno & Pizzeria',
    category: 'pizza',
    tagline: 'Authentic 900° wood-fired sourdough pizzas & craft slices',
    address: '742 Little Italy Way, Suite B',
    phone: '(555) 894-2201',
    website: 'automationsignite.com/pizza',
    themeColor: '#dc2626',
    cardGradient: {
      from: '#120707',
      to: '#3b0d0d',
      accent: '#f87171',
      text: '#fee2e2'
    },
    stampIcon: 'flame',
    requiredStamps: 9,
    rewardTitle: 'Free 12" Wood-Fired Margherita Pizza',
    rewardDescription: 'San Marzano D.O.P. tomatoes, fresh fior di latte mozzarella, fragrant basil, and cold-pressed extra virgin olive oil.',
    rewardValueUsd: 18.00,
    averageItemPriceUsd: 16.50,
    logoEmoji: '🍕',
    securityKeyId: 'SEC_PIZZA_2026',
    settings: {
      enableDoubleStampsTuesday: false,
      enableBirthdayBonus: true,
      enablePushAlerts: true,
      enableSmsAlerts: false,
      enableEmailSummaries: true,
      requireCashierPin: true,
      cashierPin: '2026',
      autoTriggerWinbackDays: 21
    }
  },
  {
    id: 'biz_bakery_03',
    name: 'La Petite Patisserie • Ignite Artisan',
    category: 'bakery',
    tagline: 'Parisian viennoiserie, artisan tarts & sourdough',
    address: '112 Saint-Germain Blvd',
    phone: '(555) 472-1088',
    website: 'automationsignite.com/bakery',
    themeColor: '#059669',
    cardGradient: {
      from: '#051811',
      to: '#0f392b',
      accent: '#34d399',
      text: '#ecfdf5'
    },
    stampIcon: 'croissant',
    requiredStamps: 9,
    rewardTitle: 'Free Box of 4 Parisian Pastries',
    rewardDescription: 'Choice of almond croissant, pain au chocolat, pistachio tart, or cardamome brioche knot.',
    rewardValueUsd: 14.50,
    averageItemPriceUsd: 4.80,
    logoEmoji: '🥐',
    securityKeyId: 'SEC_BAKERY_2026',
    settings: {
      enableDoubleStampsTuesday: true,
      enableBirthdayBonus: true,
      enablePushAlerts: true,
      enableSmsAlerts: true,
      enableEmailSummaries: true,
      requireCashierPin: true,
      cashierPin: '9999',
      autoTriggerWinbackDays: 10
    }
  },
  {
    id: 'biz_burger_04',
    name: 'Ignite Grill & Craft Burgers',
    category: 'burger',
    tagline: 'Lacy edge smash patties, smoked bacon & cold local brews',
    address: '89 Warehouse Blvd, Midtown',
    phone: '(555) 601-3390',
    website: 'automationsignite.com/grill',
    themeColor: '#c2410c',
    cardGradient: {
      from: '#100b09',
      to: '#2f1207',
      accent: '#fb923c',
      text: '#ffedd5'
    },
    stampIcon: 'flame',
    requiredStamps: 9,
    rewardTitle: 'Free Double Wagyu Truffle Smash Combo',
    rewardDescription: 'Double grass-fed smash patties, aged gouda, black truffle aioli, rosemary garlic fries and house shake.',
    rewardValueUsd: 19.50,
    averageItemPriceUsd: 14.00,
    logoEmoji: '🍔',
    securityKeyId: 'SEC_BURGER_2026',
    settings: {
      enableDoubleStampsTuesday: true,
      enableBirthdayBonus: true,
      enablePushAlerts: true,
      enableSmsAlerts: true,
      enableEmailSummaries: true,
      requireCashierPin: false,
      cashierPin: '0000',
      autoTriggerWinbackDays: 18
    }
  }
];

export const INITIAL_CUSTOMER_PASSES: CustomerPass[] = [
  {
    passId: 'PASS-8924',
    customerName: 'Alex Rivera',
    customerPhone: '+1 (555) 234-8910',
    customerEmail: 'alex.rivera@example.com',
    businessId: 'biz_ignite_01',
    currentStamps: 8, // 1 away from 10th free!
    pointsBalance: 250,
    totalLifetimeStamps: 28,
    totalRewardsClaimed: 2,
    tier: 'Gold VIP',
    streakVisits: 5,
    lastVisitDate: 'Yesterday at 8:42 AM',
    memberSince: 'Oct 2025',
    rewards: [
      {
        id: 'REW-101',
        title: 'Free Signature Flame Roast & Gourmet Croissant',
        description: 'Earned on 10th stamp milestone! Valid at all registers.',
        unlockedAt: '2026-07-28',
        expiresAt: '2026-09-30',
        status: 'available',
        redemptionCode: 'IGNITE-992-FREE',
        qrPayload: 'REWARD:REW-101:biz_ignite_01:PASS-8924'
      }
    ],
    walletInstalled: {
      appleWallet: true,
      googleWallet: false
    },
    securityToken: {
      hash: '0x8FA21C49B90D',
      timestamp: Date.now(),
      nonce: 'N84F2'
    },
    referralCode: 'ALEX-IGNITE-VIP',
    preferences: {
      pushNotificationAllowed: true,
      smsPromosAllowed: true,
      exclusiveDealsAllowed: true,
      locationBeaconAlerts: true
    }
  },
  {
    passId: 'PASS-4412',
    customerName: 'Maya Chen',
    customerPhone: '+1 (555) 782-4419',
    customerEmail: 'maya.chen@example.com',
    businessId: 'biz_ignite_01',
    currentStamps: 4,
    pointsBalance: 120,
    totalLifetimeStamps: 14,
    totalRewardsClaimed: 1,
    tier: 'Silver Connoisseur',
    streakVisits: 2,
    lastVisitDate: '3 days ago',
    memberSince: 'Dec 2025',
    rewards: [],
    walletInstalled: {
      appleWallet: true,
      googleWallet: true
    },
    securityToken: {
      hash: '0x3E91BC0241A7',
      timestamp: Date.now(),
      nonce: 'M92Y7'
    },
    referralCode: 'MAYA-IGNITE-99',
    preferences: {
      pushNotificationAllowed: true,
      smsPromosAllowed: false,
      exclusiveDealsAllowed: true,
      locationBeaconAlerts: true
    }
  },
  {
    passId: 'PASS-1098',
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 901-7723',
    customerEmail: 'm.vance@example.com',
    businessId: 'biz_ignite_01',
    currentStamps: 1,
    pointsBalance: 480,
    totalLifetimeStamps: 21,
    totalRewardsClaimed: 2,
    tier: 'Diamond Legend',
    streakVisits: 0,
    lastVisitDate: '16 days ago',
    memberSince: 'Aug 2025',
    rewards: [],
    walletInstalled: {
      appleWallet: false,
      googleWallet: true
    },
    securityToken: {
      hash: '0xCC09A8F53102',
      timestamp: Date.now(),
      nonce: 'V41X8'
    },
    referralCode: 'MARCUS-LEGEND',
    preferences: {
      pushNotificationAllowed: true,
      smsPromosAllowed: true,
      exclusiveDealsAllowed: true,
      locationBeaconAlerts: false
    }
  }
];

export const INITIAL_TRANSACTIONS: StampTransaction[] = [
  {
    id: 'TXN-77312',
    passId: 'PASS-8924',
    customerName: 'Alex Rivera',
    businessId: 'biz_ignite_01',
    type: 'stamp_earned',
    stampsCount: 1,
    timestamp: 'Today, 8:15 AM',
    amountSpendUsd: 7.25,
    cashierName: 'Emma T. (Register 1)',
    notes: 'Single Origin Flame Roast + Cardamom Knot',
    encryptedSignature: '0x992FE8A30B1C',
    verified: true
  },
  {
    id: 'TXN-77309',
    passId: 'PASS-8924',
    customerName: 'Alex Rivera',
    businessId: 'biz_ignite_01',
    type: 'bonus_stamp',
    stampsCount: 1,
    timestamp: 'Yesterday, 9:20 AM',
    amountSpendUsd: 11.50,
    cashierName: 'Jordan K. (Register 2)',
    notes: 'Double Stamp Tuesday automated promotion boost',
    encryptedSignature: '0x882AC7F1099E',
    verified: true
  },
  {
    id: 'TXN-77298',
    passId: 'PASS-4412',
    customerName: 'Maya Chen',
    businessId: 'biz_ignite_01',
    type: 'stamp_earned',
    stampsCount: 1,
    timestamp: '3 days ago',
    amountSpendUsd: 6.50,
    cashierName: 'Emma T. (Register 1)',
    notes: 'Iced Vanilla Cold Foam Nitro Brew',
    encryptedSignature: '0x711BC90288EA',
    verified: true
  },
  {
    id: 'TXN-77250',
    passId: 'PASS-8924',
    customerName: 'Alex Rivera',
    businessId: 'biz_ignite_01',
    type: 'reward_redeemed',
    stampsCount: 0,
    timestamp: 'Jul 28, 2026',
    amountSpendUsd: 0.00,
    cashierName: 'Manager Sarah',
    notes: 'Redeemed 10th Stamp Free Specialty Drink & Pastry',
    encryptedSignature: '0x550BB910CC21',
    verified: true
  }
];

export const INITIAL_PUSH_CAMPAIGNS: PushCampaign[] = [
  {
    id: 'CAMP-01',
    title: 'Almost There! 🌟 1 Stamp Away From Free Item',
    body: 'You are at 8/9 stamps! Stop by today and your 10th drink & pastry is 100% on the house.',
    targetAudience: 'one_stamp_away',
    triggerType: 'automated',
    status: 'active',
    lastSent: '2 hours ago',
    stats: {
      delivered: 142,
      opened: 118,
      converted: 64,
      revenueGenerated: 486.50
    },
    discountCode: 'STAMP10FREE'
  },
  {
    id: 'CAMP-02',
    title: '☕ Flash Happy Hour: Double Stamps 2PM - 5PM',
    body: 'Need an afternoon recharge? Earn 2X stamps on all cold brews and specialty pour-overs this afternoon!',
    targetAudience: 'all',
    triggerType: 'flash_drop',
    status: 'active',
    lastSent: 'Yesterday',
    stats: {
      delivered: 680,
      opened: 490,
      converted: 182,
      revenueGenerated: 1290.00
    },
    discountCode: 'DOUBLEBREW'
  },
  {
    id: 'CAMP-03',
    title: 'We miss your face! 🥐 Bonus Stamp on your next visit',
    body: 'It’s been a while since your last visit. We’ve loaded an instant bonus stamp to your wallet pass!',
    targetAudience: 'inactive_14d',
    triggerType: 'automated',
    status: 'active',
    lastSent: '3 days ago',
    stats: {
      delivered: 88,
      opened: 59,
      converted: 31,
      revenueGenerated: 248.00
    },
    discountCode: 'WELCOMEBACK'
  }
];

export const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: 'REF-01',
    referrerPassId: 'PASS-8924',
    referredName: 'Liam Patterson',
    date: 'Aug 14, 2026',
    status: 'reward_granted',
    bonusAwarded: true
  },
  {
    id: 'REF-02',
    referrerPassId: 'PASS-8924',
    referredName: 'Chloe Bennett',
    date: 'Aug 17, 2026',
    status: 'first_stamp_earned',
    bonusAwarded: true
  },
  {
    id: 'REF-03',
    referrerPassId: 'PASS-4412',
    referredName: 'Samira Khan',
    date: 'Aug 18, 2026',
    status: 'registered',
    bonusAwarded: false
  }
];
