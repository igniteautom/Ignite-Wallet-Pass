import React, { useState } from 'react';
import { Business, CustomerPass, PushCampaign } from '../types';
import {
  Send,
  Sparkles,
  Bell,
  Clock,
  Flame,
  Tag,
  CheckCircle2,
  Zap,
  TrendingUp,
  Plus,
  Play,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';

interface PushCampaignsProps {
  business: Business;
  campaigns: PushCampaign[];
  customers: CustomerPass[];
  onTriggerTestPush: (title: string, body: string, type: 'reward' | 'stamp' | 'discount' | 'winback', discountCode?: string) => void;
  onCreateCampaign: (campaign: PushCampaign) => void;
}

export const PushCampaigns: React.FC<PushCampaignsProps> = ({
  business,
  campaigns,
  customers,
  onTriggerTestPush,
  onCreateCampaign
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<PushCampaign['targetAudience']>('all');
  const [triggerType, setTriggerType] = useState<PushCampaign['triggerType']>('automated');
  const [discountCode, setDiscountCode] = useState('');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  // Pre-configured automated loyalty triggers
  const smartTemplates = [
    {
      title: `Almost There! 🌟 1 Stamp Away From Free ${business.category === 'pizza' ? 'Pizza' : business.category === 'bakery' ? 'Pastry Box' : 'Coffee'}`,
      body: `You have 8/9 stamps collected! Stop by today and your 10th visit is 100% on the house!`,
      type: 'reward' as const,
      audience: 'one_stamp_away' as const,
      discountCode: 'STAMP10FREE'
    },
    {
      title: `⚡ Flash 2X Double Stamps from 2 PM - 5 PM Today!`,
      body: `Earn double stamps on every purchase this afternoon at ${business.name}. Fast-track your free reward!`,
      type: 'discount' as const,
      audience: 'all' as const,
      discountCode: 'FLASH2X'
    },
    {
      title: `We miss you! 🥐 Bonus Stamp ready on your wallet pass`,
      body: `It’s been over 14 days! Show this push alert on your next visit to get a free extra stamp automatically.`,
      type: 'winback' as const,
      audience: 'inactive_14d' as const,
      discountCode: 'MISSYOU'
    },
    {
      title: `⭐ VIP Exclusive: 20% Off All Specialty Items This Weekend`,
      body: `As a top-tier loyalty member at ${business.name}, enjoy 20% off your entire ticket all weekend long.`,
      type: 'discount' as const,
      audience: 'vip_only' as const,
      discountCode: 'VIPPERK20'
    }
  ];

  const handleApplyTemplate = (index: number) => {
    const t = smartTemplates[index];
    setSelectedTemplateIndex(index);
    setNewTitle(t.title);
    setNewBody(t.body);
    setTargetAudience(t.audience);
    setDiscountCode(t.discountCode);
    sound.playPushChime();
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const created: PushCampaign = {
      id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      targetAudience,
      triggerType,
      status: 'active',
      lastSent: 'Just now',
      stats: {
        delivered: customers.length + 420,
        opened: 290,
        converted: 94,
        revenueGenerated: 752.00
      },
      discountCode: discountCode.trim() || undefined
    };

    onCreateCampaign(created);
    sound.playStampSound();
    setIsCreating(false);
    setNewTitle('');
    setNewBody('');
    setDiscountCode('');
  };

  const handleFireTest = (campaign: { title: string; body: string; type?: 'reward' | 'stamp' | 'discount' | 'winback'; discountCode?: string }) => {
    sound.playPushChime();
    onTriggerTestPush(campaign.title, campaign.body, campaign.type || 'discount', campaign.discountCode);
  };

  return (
    <div className="space-y-6" id="push-campaigns-container">
      {/* Header & Quick Dispatcher */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Automated Push & Loyalty Campaigns</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              Mobile Wallet In-App & Lock Screen
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Send real-time alerts when customers are 1 stamp away, offer flash happy hours, or re-engage inactive regulars
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
          id="btn-toggle-create-campaign"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'New Campaign'}</span>
        </button>
      </div>

      {/* Campaign Creator Form */}
      {isCreating && (
        <form onSubmit={handleSaveCampaign} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Compose Loyalty Push Notification</span>
            </h3>
            <span className="text-xs text-neutral-400">Select an AI template or write custom</span>
          </div>

          {/* Quick AI Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {smartTemplates.map((t, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyTemplate(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-1 ${
                  selectedTemplateIndex === idx
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{t.title}</span>
                  <span className="text-[10px] font-mono uppercase text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                    {t.audience}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">Push Title (Appears on lock screen)</label>
              <input
                type="text"
                placeholder="e.g., Almost There! 1 Stamp Away 🌟"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                id="input-campaign-title"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">Target Audience</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value as PushCampaign['targetAudience'])}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                id="select-target-audience"
              >
                <option value="all">All Wallet Cardholders (Broad)</option>
                <option value="one_stamp_away">1 Stamp Away from Free Item (Highest Conversion)</option>
                <option value="inactive_14d">Inactive 14+ Days (Win-Back)</option>
                <option value="vip_only">Gold & Diamond VIPs Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">Notification Message Body</label>
            <textarea
              rows={3}
              placeholder="Write the message that triggers when customers enter geo-beacon zone or hit milestone..."
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              id="textarea-campaign-body"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">Exclusive Promo Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g., DOUBLEBREW"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                id="input-promo-code"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">Automation Mode</label>
              <select
                value={triggerType}
                onChange={e => setTriggerType(e.target.value as PushCampaign['triggerType'])}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                id="select-trigger-type"
              >
                <option value="automated">Continuous Auto-Trigger (When rule matches)</option>
                <option value="flash_drop">Instant Flash Drop (Send immediately)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => handleFireTest({ title: newTitle, body: newBody, discountCode })}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              id="btn-test-preview-push"
            >
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Push to Preview</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
              id="btn-save-campaign"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Deploy Campaign</span>
            </button>
          </div>
        </form>
      )}

      {/* Active Campaigns Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Active Automated & Flash Triggers ({campaigns.length})</span>
          </h3>
          <span className="text-xs text-neutral-400">Delivering to iOS & Android Wallet Holders</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map(camp => (
            <div
              key={camp.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    camp.triggerType === 'flash_drop'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {camp.triggerType === 'flash_drop' ? '⚡ Flash Drop' : '🤖 Auto Rule'}
                  </span>

                  <button
                    onClick={() => handleFireTest({ title: camp.title, body: camp.body, discountCode: camp.discountCode })}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Send immediate test push to the customer preview"
                    id={`btn-fire-test-${camp.id}`}
                  >
                    <Play className="w-3 h-3" />
                    <span>Test</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{camp.title}</h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{camp.body}</p>
                </div>

                {camp.discountCode && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    <Tag className="w-3 h-3" />
                    Code: {camp.discountCode}
                  </div>
                )}
              </div>

              {/* Campaign Performance Metrics */}
              <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-400 block">Delivered</span>
                  <span className="font-bold text-white font-mono">{camp.stats.delivered}</span>
                </div>
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-400 block">Opened</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {Math.round((camp.stats.opened / camp.stats.delivered) * 100)}%
                  </span>
                </div>
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-400 block">Revenue</span>
                  <span className="font-bold text-emerald-400 font-mono">${camp.stats.revenueGenerated.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
