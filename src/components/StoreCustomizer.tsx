import React, { useState } from 'react';
import { Business, StampIconType } from '../types';
import { StampIcon } from './StampIcon';
import {
  Palette,
  Sliders,
  ShieldCheck,
  Bell,
  Check,
  Sparkles,
  Save,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { sound } from '../utils/audio';

interface StoreCustomizerProps {
  business: Business;
  onUpdateBusiness: (updated: Business) => void;
  onResetDefaults: () => void;
  onNavigateToTables?: () => void;
}

export const StoreCustomizer: React.FC<StoreCustomizerProps> = ({
  business,
  onUpdateBusiness,
  onResetDefaults,
  onNavigateToTables
}) => {
  const [formData, setFormData] = useState<Business>({ ...business });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const stampIconOptions: { id: StampIconType; label: string }[] = [
    { id: 'ignite', label: '🔥 Automations Ignite Brand' },
    { id: 'gear', label: '⚙️ Smart Gear Automation' },
    { id: 'circuit', label: '⚡ Circuit Tech' },
    { id: 'coffee', label: '☕ Coffee Cup' },
    { id: 'pizza', label: '🍕 Pizza Slice' },
    { id: 'croissant', label: '🥐 Bakery Croissant' },
    { id: 'utensils', label: '🍴 Restaurant Dining' },
    { id: 'flame', label: '🔥 Grill / Flame' },
    { id: 'cup-soda', label: '🥤 Boba / Drink' },
    { id: 'star', label: '⭐ VIP Star' },
    { id: 'sparkles', label: '✨ Sparkle Perk' },
    { id: 'heart', label: '❤️ Love / Loyalty' },
    { id: 'beer', label: '🍺 Craft Brew' }
  ];

  const presetThemes = [
    {
      name: '🔥 Automations Ignite (Official Brand)',
      from: '#090a0e',
      to: '#231007',
      accent: '#ff6a00',
      text: '#fff7ed'
    },
    {
      name: 'Roasted Espresso',
      from: '#1e1b18',
      to: '#3c2415',
      accent: '#d97706',
      text: '#fef3c7'
    },
    {
      name: 'Rustic Terracotta & Pizza',
      from: '#200c0a',
      to: '#581c1c',
      accent: '#ef4444',
      text: '#fee2e2'
    },
    {
      name: 'Sage & Pistachio Patisserie',
      from: '#0c221a',
      to: '#1b4332',
      accent: '#10b981',
      text: '#ecfdf5'
    },
    {
      name: 'Midnight Charcoal & Flame',
      from: '#18181b',
      to: '#3f3f46',
      accent: '#f97316',
      text: '#fafafa'
    },
    {
      name: 'Royal Velvet & Gold VIP',
      from: '#1e1035',
      to: '#441d6b',
      accent: '#fbbf24',
      text: '#fdf4ff'
    },
    {
      name: 'Ocean Cobalt Blue',
      from: '#0b192c',
      to: '#1e3e62',
      accent: '#38bdf8',
      text: '#f0f9ff'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusiness(formData);
    sound.playRewardFanfare();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="store-customizer-container">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Business & Stamp Card Studio</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              Card Customizer
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Customize your store branding, 9+1 reward offer, card aesthetics, and security settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToTables && (
            <button
              type="button"
              onClick={() => {
                onNavigateToTables();
                sound.playScanBeep();
              }}
              className="px-3.5 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              id="btn-goto-table-qr"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Generate Table QR Stands</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            id="btn-reset-defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Store Basics */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Store Identity & Category</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Business Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="input-business-name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Business['category'] })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="select-business-category"
                  >
                    <option value="coffee">Coffee Shop / Café ☕</option>
                    <option value="pizza">Pizzeria & Italian 🍕</option>
                    <option value="bakery">Artisan Bakery & Patisserie 🥐</option>
                    <option value="burger">Gourmet Burger & Grill 🍔</option>
                    <option value="restaurant">Bistro & Restaurant 🍽️</option>
                    <option value="boba">Boba & Tea House 🧋</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Tagline / Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  id="input-business-tagline"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Support Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Stamp Card & 10th Free Reward Rule */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Gamified Stamp Card & 10th Free Perk</span>
              </h3>

              {/* Stamp Icon Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Stamp Icon Style</label>
                <div className="grid grid-cols-5 gap-2">
                  {stampIconOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, stampIcon: opt.id })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        formData.stampIcon === opt.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                      id={`btn-stamp-icon-${opt.id}`}
                    >
                      <StampIcon type={opt.id} className="w-5 h-5" />
                      <span className="text-[9px] font-semibold truncate max-w-[50px]">{opt.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Title & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">10th Visit Reward Name</label>
                  <input
                    type="text"
                    value={formData.rewardTitle}
                    onChange={e => setFormData({ ...formData, rewardTitle: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="input-reward-title"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Estimated Value ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.rewardValueUsd}
                    onChange={e => setFormData({ ...formData, rewardValueUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    id="input-reward-value"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Reward Description</label>
                <textarea
                  rows={2}
                  value={formData.rewardDescription}
                  onChange={e => setFormData({ ...formData, rewardDescription: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Account Settings & Communication Preferences */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Account & Communication Preferences</span>
              </h3>

              <div className="space-y-3 divide-y divide-neutral-800/80 text-xs">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-semibold text-white block">Automated Push Alerts for 1-Stamp Milestones</span>
                    <span className="text-[11px] text-neutral-400">Notify cardholders on lock screen when reaching 8/9 stamps</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.enablePushAlerts}
                    onChange={e => setFormData({
                      ...formData,
                      settings: { ...formData.settings, enablePushAlerts: e.target.checked }
                    })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    id="toggle-push-alerts"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-semibold text-white block">Double Stamp Tuesdays (2X Boost)</span>
                    <span className="text-[11px] text-neutral-400">Automatically grant 2 stamps on Tuesdays to drive traffic</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.enableDoubleStampsTuesday}
                    onChange={e => setFormData({
                      ...formData,
                      settings: { ...formData.settings, enableDoubleStampsTuesday: e.target.checked }
                    })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    id="toggle-double-tuesday"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-semibold text-white block">Require Cashier Authorization PIN</span>
                    <span className="text-[11px] text-neutral-400">Prevent unauthorized stamp issuance at registers</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.requireCashierPin}
                    onChange={e => setFormData({
                      ...formData,
                      settings: { ...formData.settings, requireCashierPin: e.target.checked }
                    })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    id="toggle-cashier-pin"
                  />
                </div>

                {formData.settings.requireCashierPin && (
                  <div className="flex items-center justify-between pt-3 pl-4">
                    <span className="text-neutral-300">Set Cashier Security PIN:</span>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.settings.cashierPin}
                      onChange={e => setFormData({
                        ...formData,
                        settings: { ...formData.settings, cashierPin: e.target.value }
                      })}
                      className="w-24 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs"
                      id="input-set-pin"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Theme Palettes & Live Card Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Color Palette Selector */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Card Theme & Color Palette</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {presetThemes.map(theme => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      cardGradient: {
                        from: theme.from,
                        to: theme.to,
                        accent: theme.accent,
                        text: theme.text
                      }
                    })}
                    className="p-3 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-all text-left space-y-2"
                    style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                      <span className="text-[10px] text-white/70 font-mono">Preset</span>
                    </div>
                    <span className="text-xs font-bold text-white block truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Card Preview Box */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Live Card Mockup</h4>
                <span className="text-[10px] text-emerald-400 font-mono">Syncs to Apple/Google Wallet</span>
              </div>

              <div
                className="rounded-2xl p-5 shadow-xl relative overflow-hidden border border-white/15 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${formData.cardGradient.from} 0%, ${formData.cardGradient.to} 100%)`,
                  color: formData.cardGradient.text
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                      VIP PASS
                    </span>
                    <h4 className="text-base font-black tracking-tight mt-1">{formData.name || 'Store Name'}</h4>
                    <p className="text-[11px] opacity-80">{formData.tagline || 'Tagline here'}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <StampIcon type={formData.stampIcon} className="w-5 h-5" />
                  </div>
                </div>

                {/* 10 stamps preview */}
                <div className="grid grid-cols-5 gap-1.5 my-3.5 bg-black/30 p-2.5 rounded-xl border border-white/10">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        idx < 4 ? 'bg-amber-500 text-neutral-950' : 'bg-black/40 border border-dashed border-white/20 text-white/40'
                      }`}
                    >
                      {idx < 4 ? <StampIcon type={formData.stampIcon} className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                  ))}
                  <div className="aspect-square rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-200 text-neutral-950 font-black text-[8px] flex items-center justify-center uppercase">
                    FREE
                  </div>
                </div>

                <div className="text-[10px] opacity-85 truncate">
                  Reward: <strong>{formData.rewardTitle}</strong>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                id="btn-save-store-settings"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes & Sync Cards</span>
              </button>

              {savedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Branding and Stamp rules successfully updated!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
