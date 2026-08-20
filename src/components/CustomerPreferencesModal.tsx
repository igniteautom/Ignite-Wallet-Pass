import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerPass } from '../types';
import {
  SlidersHorizontal,
  X,
  Bell,
  MessageSquare,
  Sparkles,
  MapPin,
  Check,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CustomerPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pass: CustomerPass;
  onUpdatePreferences: (updatedPrefs: CustomerPass['preferences'], name: string, phone: string, email: string) => void;
}

export const CustomerPreferencesModal: React.FC<CustomerPreferencesModalProps> = ({
  isOpen,
  onClose,
  pass,
  onUpdatePreferences
}) => {
  const [name, setName] = useState(pass.customerName);
  const [phone, setPhone] = useState(pass.customerPhone);
  const [email, setEmail] = useState(pass.customerEmail);
  const [prefs, setPrefs] = useState({ ...pass.preferences });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences(prefs, name, phone, email);
    sound.playPushChime();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white"
          id="modal-customer-preferences"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Account & Communication</h3>
                <p className="text-xs text-neutral-400">Manage your profile and push notification alerts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              id="btn-close-preferences"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cardholder Information</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-neutral-300">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="input-cardholder-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neutral-300">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-300">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Toggles */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Alert Preferences</h4>

              <div className="space-y-3 text-xs divide-y divide-neutral-800/60">
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-start gap-2.5">
                    <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Automated Push Notifications</span>
                      <span className="text-[11px] text-neutral-400">Lock-screen notifications when you are 1 stamp away</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.pushNotificationAllowed}
                    onChange={e => setPrefs({ ...prefs, pushNotificationAllowed: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Exclusive Flash Drops & Freebies</span>
                      <span className="text-[11px] text-neutral-400">Receive Double Stamp days and VIP secret discounts</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.exclusiveDealsAllowed}
                    onChange={e => setPrefs({ ...prefs, exclusiveDealsAllowed: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Location Beacon Auto-Pass</span>
                      <span className="text-[11px] text-neutral-400">Surface stamp card on lock-screen when walking into the store</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.locationBeaconAlerts}
                    onChange={e => setPrefs({ ...prefs, locationBeaconAlerts: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pass Protected with End-to-End Encrypted Token #{pass.passId}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
                id="btn-save-preferences"
              >
                {saved ? <Check className="w-4 h-4" /> : null}
                <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
