import React, { useState } from 'react';
import { Business, CustomerPass } from '../types';
import {
  User,
  Bell,
  Smartphone,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Download,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CustomerSettingsViewProps {
  business: Business;
  pass: CustomerPass;
  onUpdatePass: (updated: Partial<CustomerPass>) => void;
  onOpenWalletModal: () => void;
  onTriggerPushNotification: (
    title: string,
    body: string,
    type?: 'reward' | 'stamp' | 'discount' | 'winback'
  ) => void;
}

export const CustomerSettingsView: React.FC<CustomerSettingsViewProps> = ({
  business,
  pass,
  onUpdatePass,
  onOpenWalletModal,
  onTriggerPushNotification
}) => {
  const [customerName, setCustomerName] = useState(pass.customerName);
  const [customerPhone, setCustomerPhone] = useState(pass.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(pass.customerEmail);

  // Preference Toggles
  const [pushAllowed, setPushAllowed] = useState(pass.preferences.pushNotificationAllowed);
  const [smsAllowed, setSmsAllowed] = useState(pass.preferences.smsPromosAllowed);
  const [exclusiveDealsAllowed, setExclusiveDealsAllowed] = useState(pass.preferences.exclusiveDealsAllowed);
  const [locationBeaconAlerts, setLocationBeaconAlerts] = useState(pass.preferences.locationBeaconAlerts);

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePass({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      preferences: {
        pushNotificationAllowed: pushAllowed,
        smsPromosAllowed: smsAllowed,
        exclusiveDealsAllowed,
        locationBeaconAlerts
      }
    });

    sound.playStampSound();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    onTriggerPushNotification(
      '⚙️ Pass Settings Saved',
      'Your cardholder profile and alert preferences have been synced with Apple & Google Wallet.',
      'stamp'
    );
  };

  const handleTestBeaconAlert = () => {
    sound.playPushChime();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 }
    });
    onTriggerPushNotification(
      `📍 Store Nearby (${business.name})`,
      `Welcome back ${customerName}! You have ${pass.currentStamps}/9 stamps on your digital card. Show your pass at register for a quick stamp.`,
      'discount'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="customer-settings-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#141620] via-[#0f1118] to-[#0a0b10] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold mb-2">
              <Smartphone className="w-3.5 h-3.5 text-orange-400" />
              <span>Customer Mobile App Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cardholder Profile & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Manage your digital loyalty pass credentials, push notification triggers, and wallet sync preferences.
            </p>
          </div>

          <button
            onClick={onOpenWalletModal}
            className="px-4 py-2.5 rounded-xl bg-[#181b26] hover:bg-[#202434] border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center justify-center gap-2 self-start sm:self-auto transition-all shadow-md"
            id="btn-wallet-sync-status"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Wallet Pass Sync</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-[#10121a] border border-neutral-800 rounded-3xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Cardholder Information</h2>
                  <p className="text-[11px] text-neutral-400">Your details appear on your digital loyalty card</p>
                </div>
              </div>

              {isSaved && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Changes Saved!</span>
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-300">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-[#151822] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    placeholder="Alex Rivera"
                    id="input-customer-name"
                  />
                  <User className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Mobile Phone</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#151822] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    placeholder="+1 (555) 000-0000"
                    id="input-customer-phone"
                  />
                  <Phone className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#151822] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    placeholder="name@example.com"
                    id="input-customer-email"
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Notification & Trigger Preferences */}
            <div className="pt-4 border-t border-neutral-800 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Push & Alert Triggers
                </h3>
              </div>

              <div className="space-y-3">
                {/* Push notification toggle */}
                <label className="flex items-center justify-between p-3.5 bg-[#151822] hover:bg-[#191d2a] border border-neutral-800 rounded-2xl cursor-pointer transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Lock-Screen Push Notifications</span>
                      <span className="text-[10px] bg-orange-950/60 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 rounded font-semibold">Recommended</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Receive immediate alerts when you are 1 stamp away from your free item and when rewards unlock.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAllowed}
                    onChange={e => setPushAllowed(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                    id="toggle-push-notif"
                  />
                </label>

                {/* Exclusive Deals & Flash drops toggle */}
                <label className="flex items-center justify-between p-3.5 bg-[#151822] hover:bg-[#191d2a] border border-neutral-800 rounded-2xl cursor-pointer transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-bold text-white">⚡ Flash Double-Stamp & Happy Hour Alerts</div>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Get notified of 2X stamp multipliers and exclusive weekly discounts before they expire.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={exclusiveDealsAllowed}
                    onChange={e => setExclusiveDealsAllowed(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                    id="toggle-exclusive-deals"
                  />
                </label>

                {/* Location Beacons toggle */}
                <label className="flex items-center justify-between p-3.5 bg-[#151822] hover:bg-[#191d2a] border border-neutral-800 rounded-2xl cursor-pointer transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>📍 Store Proximity Geofencing (50m Beacon)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Wakes up your pass on your Apple/Google Wallet lock screen as you walk near the store for rapid 1-tap scanning.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={locationBeaconAlerts}
                    onChange={e => setLocationBeaconAlerts(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                    id="toggle-location-beacon"
                  />
                </label>

                {/* SMS Promos toggle */}
                <label className="flex items-center justify-between p-3.5 bg-[#151822] hover:bg-[#191d2a] border border-neutral-800 rounded-2xl cursor-pointer transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-bold text-white">SMS Monthly Summary & VIP Codes</div>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Receive monthly stamp statements and secret VIP perk drops via text message.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAllowed}
                    onChange={e => setSmsAllowed(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                    id="toggle-sms-alerts"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2"
                id="btn-save-customer-settings"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save All Preferences</span>
              </button>
            </div>
          </form>

          {/* Beacon Test Sandbox */}
          <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Simulate Store Proximity Arrival</h4>
                <p className="text-[11px] text-neutral-400">
                  Trigger what happens when your device approaches within 50 meters of {business.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestBeaconAlert}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
              id="btn-test-beacon"
            >
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span>Simulate Geofence Trigger</span>
            </button>
          </div>
        </div>

        {/* Sidebar Info & Pass Security (Right Column) */}
        <div className="space-y-6">
          {/* Cryptographic Pass ID Card */}
          <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cryptographic Pass Security
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-[#151822] p-3 rounded-2xl border border-neutral-800/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Pass Serial ID</div>
                <div className="font-mono font-bold text-orange-400 text-xs">{pass.passId}</div>
              </div>

              <div className="bg-[#151822] p-3 rounded-2xl border border-neutral-800/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Security Signature</div>
                <div className="font-mono text-[10px] text-neutral-300 truncate">
                  {pass.securityToken.hash}
                </div>
              </div>

              <div className="bg-[#151822] p-3 rounded-2xl border border-neutral-800/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Member Status & Tier</div>
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{pass.tier}</span>
                  <span className="text-[10px] text-amber-400 font-mono">Since {pass.memberSince}</span>
                </div>
              </div>

              <div className="bg-[#151822] p-3 rounded-2xl border border-neutral-800/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Anti-Screenshot Token</div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Dynamic Nonce [{pass.securityToken.nonce}]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ info */}
          <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-neutral-300 text-xs font-bold">
              <Info className="w-4 h-4 text-orange-400" />
              <span>How your pass works</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Your digital card is directly registered to {business.name}. No app download is required—simply add to Apple Wallet or Google Pay to enjoy 1-tap scanning, automated push alerts, and automatic 9+1 free reward unlocks!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
