import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Business, CustomerPass, TableConfig, TableTentSettings } from '../types';
import { StampIcon } from './StampIcon';
import { sound } from '../utils/audio';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Wifi,
  Radio,
  Layers,
  UtensilsCrossed,
  Eye,
  RotateCw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Palette,
  CheckCircle2,
  Flame,
  Gift,
  ArrowRight,
  X,
  FileText,
  Maximize2
} from 'lucide-react';

interface TableQrTentGeneratorProps {
  business: Business;
  businesses: Business[];
  onSelectBusiness: (bizId: string) => void;
  onSimulateCustomerJoin?: (tableId: string | number, bizId: string) => void;
}

const DEFAULT_TABLES: Record<string, TableConfig[]> = {
  biz_ignite_01: [
    { id: 'tbl_1', tableNumber: '1', label: 'Table 1', area: 'Main Lounge', activeScansCount: 48, lastScannedAt: '12m ago' },
    { id: 'tbl_2', tableNumber: '2', label: 'Table 2', area: 'Main Lounge', activeScansCount: 35, lastScannedAt: '1h ago' },
    { id: 'tbl_3', tableNumber: '3', label: 'Table 3', area: 'Window Corner', activeScansCount: 62, lastScannedAt: '5m ago' },
    { id: 'tbl_4', tableNumber: '4', label: 'Table 4', area: 'Window Corner', activeScansCount: 29, lastScannedAt: '3h ago' },
    { id: 'tbl_5', tableNumber: '5', label: 'Table 5', area: 'Outdoor Terrace', activeScansCount: 54, lastScannedAt: '25m ago' },
    { id: 'tbl_6', tableNumber: '6', label: 'Table 6', area: 'Outdoor Terrace', activeScansCount: 41, lastScannedAt: '45m ago' },
    { id: 'tbl_bar_1', tableNumber: 'Bar 1', label: 'Nitro Bar 1', area: 'Brewing Bar', activeScansCount: 78, lastScannedAt: '2m ago' },
    { id: 'tbl_bar_2', tableNumber: 'Bar 2', label: 'Nitro Bar 2', area: 'Brewing Bar', activeScansCount: 89, lastScannedAt: 'Just now' },
  ],
  biz_pizza_02: [
    { id: 'tbl_p1', tableNumber: '1', label: 'Table 1', area: 'Oven Front', activeScansCount: 52, lastScannedAt: '15m ago' },
    { id: 'tbl_p2', tableNumber: '2', label: 'Table 2', area: 'Main Dining', activeScansCount: 44, lastScannedAt: '30m ago' },
    { id: 'tbl_p3', tableNumber: '3', label: 'Table 3', area: 'Main Dining', activeScansCount: 39, lastScannedAt: '2h ago' },
    { id: 'tbl_booth_1', tableNumber: 'Booth A', label: 'VIP Booth A', area: 'Family Section', activeScansCount: 68, lastScannedAt: '10m ago' },
    { id: 'tbl_booth_2', tableNumber: 'Booth B', label: 'VIP Booth B', area: 'Family Section', activeScansCount: 71, lastScannedAt: '4m ago' },
  ],
  biz_bakery_03: [
    { id: 'tbl_b1', tableNumber: '1', label: 'Table 1', area: 'Patisserie Window', activeScansCount: 33, lastScannedAt: '18m ago' },
    { id: 'tbl_b2', tableNumber: '2', label: 'Table 2', area: 'Courtyard Garden', activeScansCount: 49, lastScannedAt: '7m ago' },
    { id: 'tbl_b3', tableNumber: '3', label: 'Table 3', area: 'Courtyard Garden', activeScansCount: 58, lastScannedAt: '1h ago' },
  ]
};

export const TableQrTentGenerator: React.FC<TableQrTentGeneratorProps> = ({
  business,
  businesses,
  onSelectBusiness,
  onSimulateCustomerJoin
}) => {
  // Tables state per business
  const [tablesMap, setTablesMap] = useState<Record<string, TableConfig[]>>(DEFAULT_TABLES);
  const currentTables = tablesMap[business.id] || [
    { id: 'tbl_1', tableNumber: '1', label: 'Table 1', area: 'Dining Area', activeScansCount: 12, lastScannedAt: 'Just now' },
    { id: 'tbl_2', tableNumber: '2', label: 'Table 2', area: 'Dining Area', activeScansCount: 8, lastScannedAt: '1h ago' },
    { id: 'tbl_3', tableNumber: '3', label: 'Table 3', area: 'Window Side', activeScansCount: 15, lastScannedAt: '10m ago' }
  ];

  const [selectedTableId, setSelectedTableId] = useState<string>(currentTables[0]?.id || 'tbl_1');

  // Customization Settings
  const [settings, setSettings] = useState<TableTentSettings>({
    headline: 'Scan to Join & Get VIP Perks',
    subheadline: 'Point your phone camera at the QR code to add your digital loyalty pass to Apple or Google Wallet in 1 tap.',
    welcomeOfferText: '🎁 1st Stamp FREE & 10% Off Today’s Table Order',
    welcomePointsBonus: 25,
    welcomeStampsBonus: 1,
    tableDiscountPercent: 10,
    wifiName: `${business.name.split(' ')[0]}Guest-5G`,
    wifiPassword: `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}2026`,
    showWifi: true,
    showNfcContactlessBadge: true,
    showSocialHandle: true,
    socialHandle: `@${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    format: 'tent_fold',
    cardThemeStyle: 'brand'
  });

  // Simulator Modal State
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableArea, setNewTableArea] = useState('Main Floor');
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [simulatedInstallSuccess, setSimulatedInstallSuccess] = useState(false);

  const selectedTable = currentTables.find(t => t.id === selectedTableId) || currentTables[0] || {
    id: 'tbl_1',
    tableNumber: '1',
    label: 'Table 1',
    area: 'Dining Area'
  };

  // Generate Table QR Payload URL
  const tableQrUrl = `https://ignite-pass.app/join?biz=${encodeURIComponent(business.id)}&table=${encodeURIComponent(selectedTable.tableNumber)}&perk=WELCOME_STAMP&t=${Date.now()}`;

  // Handle Copy Direct URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableQrUrl);
    setCopiedLink(true);
    sound.playScanBeep();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Add Table
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    const newId = `tbl_${Date.now()}`;
    const newEntry: TableConfig = {
      id: newId,
      tableNumber: newTableNumber.trim(),
      label: `Table ${newTableNumber.trim()}`,
      area: newTableArea.trim() || 'Main Dining',
      activeScansCount: 0,
      lastScannedAt: 'Never'
    };

    setTablesMap(prev => ({
      ...prev,
      [business.id]: [...(prev[business.id] || []), newEntry]
    }));

    setSelectedTableId(newId);
    setNewTableNumber('');
    setIsAddingTable(false);
    sound.playStampSound();
  };

  // Handle Batch Generate Tables 1..N
  const handleBatchGenerate = (count: number) => {
    const generated: TableConfig[] = Array.from({ length: count }, (_, idx) => {
      const num = idx + 1;
      return {
        id: `tbl_batch_${num}`,
        tableNumber: `${num}`,
        label: `Table ${num}`,
        area: num <= 6 ? 'Main Dining' : num <= 12 ? 'Window Terrace' : 'Patio Lounge',
        activeScansCount: Math.floor(Math.random() * 40),
        lastScannedAt: `${Math.floor(Math.random() * 50) + 2}m ago`
      };
    });

    setTablesMap(prev => ({
      ...prev,
      [business.id]: generated
    }));

    setSelectedTableId(generated[0].id);
    sound.playRewardFanfare();
  };

  // Handle Remove Table
  const handleRemoveTable = (tableId: string) => {
    setTablesMap(prev => {
      const filtered = (prev[business.id] || []).filter(t => t.id !== tableId);
      return {
        ...prev,
        [business.id]: filtered
      };
    });
    if (selectedTableId === tableId) {
      const remaining = (tablesMap[business.id] || []).filter(t => t.id !== tableId);
      if (remaining.length > 0) {
        setSelectedTableId(remaining[0].id);
      }
    }
    sound.playScanBeep();
  };

  // Trigger Native Print Dialog with specialized print styling
  const handlePrint = () => {
    sound.playScanBeep();
    window.print();
  };

  // Simulate Customer Scan
  const handleTestScan = () => {
    setIsSimulatingScan(true);
    setSimulatedInstallSuccess(false);
    sound.playScanBeep();

    // Increment scan counter for this table
    setTablesMap(prev => {
      const list = prev[business.id] || [];
      return {
        ...prev,
        [business.id]: list.map(t =>
          t.id === selectedTable.id
            ? { ...t, activeScansCount: (t.activeScansCount || 0) + 1, lastScannedAt: 'Just now' }
            : t
        )
      };
    });
  };

  const handleSimulatePassInstall = (platform: 'apple' | 'google') => {
    sound.playRewardFanfare();
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f59e0b', '#10b981', '#ffffff']
    });
    setSimulatedInstallSuccess(true);

    if (onSimulateCustomerJoin) {
      onSimulateCustomerJoin(selectedTable.tableNumber, business.id);
    }
  };

  // Theme styling resolver for table stand cards
  const getThemeStyles = () => {
    switch (settings.cardThemeStyle) {
      case 'dark_luxury':
        return {
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          border: 'border-amber-500/50',
          textPrimary: 'text-amber-100',
          textSecondary: 'text-neutral-400',
          accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          qrFrame: 'bg-white border-4 border-amber-500/40',
          tablePill: 'bg-amber-500 text-neutral-950 font-black'
        };
      case 'clean_white':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
          border: 'border-neutral-300',
          textPrimary: 'text-neutral-900',
          textSecondary: 'text-neutral-600',
          accentBadge: 'bg-orange-100 text-orange-800 border-orange-300',
          qrFrame: 'bg-white border-4 border-neutral-900',
          tablePill: 'bg-neutral-900 text-white font-black'
        };
      case 'kraft_vintage':
        return {
          background: 'linear-gradient(135deg, #2b1d14 0%, #3e271a 100%)',
          border: 'border-amber-700/50',
          textPrimary: 'text-amber-50',
          textSecondary: 'text-amber-200/70',
          accentBadge: 'bg-amber-900/60 text-amber-200 border-amber-700/60',
          qrFrame: 'bg-white border-4 border-amber-700',
          tablePill: 'bg-amber-600 text-neutral-950 font-black'
        };
      case 'brand':
      default:
        return {
          background: `linear-gradient(135deg, ${business.cardGradient.from} 0%, ${business.cardGradient.to} 100%)`,
          border: 'border-orange-500/60',
          textPrimary: 'text-white',
          textSecondary: 'text-neutral-300',
          accentBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          qrFrame: 'bg-white border-4 border-orange-500/60',
          tablePill: 'bg-gradient-to-r from-orange-600 to-amber-500 text-neutral-950 font-black'
        };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <div className="space-y-6" id="table-qr-tent-generator-module">
      
      {/* MODULE HEADER & BUSINESS QUICK-SELECT */}
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Custom Table QR Tent & Stand Generator</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Print & NFC Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Generate customized table tents & QR stands for each individual table in your venue
              </p>
            </div>
          </div>
        </div>

        {/* Business Selector Pill Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2">
            Business:
          </span>
          <select
            value={business.id}
            onChange={(e) => {
              onSelectBusiness(e.target.value);
              sound.playScanBeep();
            }}
            className="bg-neutral-900 border border-neutral-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            id="select-table-business"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.logoEmoji} {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT CONTROLS, RIGHT LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (COL-5): TABLE SELECTOR & CUSTOMIZATION SETTINGS */}
        <div className="lg:col-span-5 space-y-5">

          {/* TABLE SELECTOR & BATCH CONTROLS */}
          <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Select Table / Seat
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAddingTable(!isAddingTable)}
                  className="px-2.5 py-1 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  id="btn-add-table-toggle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Table</span>
                </button>
              </div>
            </div>

            {/* Quick Add Table Form */}
            <AnimatePresence>
              {isAddingTable && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTable}
                  className="p-3 bg-neutral-900/90 border border-orange-500/40 rounded-2xl space-y-2.5 overflow-hidden"
                >
                  <div className="text-xs font-bold text-orange-400">Add New Table Location</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">
                        Table # / Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7 or Patio A"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">
                        Area / Section
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Terrace"
                        value={newTableArea}
                        onChange={(e) => setNewTableArea(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingTable(false)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-orange-600 text-neutral-950 text-xs font-bold shadow"
                    >
                      Save Table
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Scrollable Table Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {currentTables.map((t) => {
                const isSelected = t.id === selectedTable.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTableId(t.id);
                      sound.playScanBeep();
                    }}
                    className={`relative p-2.5 rounded-2xl border text-left cursor-pointer transition-all group ${
                      isSelected
                        ? 'bg-orange-950/40 border-orange-500 shadow-[0_0_14px_rgba(234,88,12,0.3)] ring-1 ring-orange-500'
                        : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          isSelected
                            ? 'bg-orange-500 text-neutral-950 font-black'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {t.tableNumber}
                      </span>

                      {currentTables.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTable(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity"
                          title="Delete Table"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5">
                      <div className="text-xs font-bold text-white truncate">{t.label}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{t.area}</div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-neutral-800/80 flex items-center justify-between text-[9px] text-neutral-400">
                      <span>{t.activeScansCount || 0} scans</span>
                      <span className="text-emerald-400 font-medium">{t.lastScannedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Batch Generator Helper */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400 text-[11px]">Quick Batch:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleBatchGenerate(8)}
                  className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold"
                >
                  Generate 8 Tables
                </button>
                <button
                  onClick={() => handleBatchGenerate(16)}
                  className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold"
                >
                  16 Tables
                </button>
                <button
                  onClick={() => handleBatchGenerate(24)}
                  className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold"
                >
                  24 Tables
                </button>
              </div>
            </div>
          </div>

          {/* TABLE TENT FORMAT & CARD STYLING SETTINGS */}
          <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Table Stand Customization
              </h3>
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Display Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tent_fold', label: '⛺ Foldable Table Tent (A6)', desc: '2-Sided Standup' },
                  { id: 'acrylic_disc', label: '🔲 Acrylic Stand / Disc', desc: 'Compact Bar/Table' },
                  { id: 'insert_card', label: '📋 Menu Card Insert', desc: 'Vertical Clip' },
                  { id: 'batch_grid', label: '🖨️ Multi-Table Sheet', desc: 'Print 4 Per Page' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      setSettings(s => ({ ...s, format: fmt.id as any }));
                      sound.playScanBeep();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.format === fmt.id
                        ? 'bg-orange-950/40 border-orange-500 text-white ring-1 ring-orange-500'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{fmt.label}</div>
                    <div className="text-[10px] text-neutral-400">{fmt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Style Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Visual Theme Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'brand', label: '🔥 Business Brand Theme' },
                  { id: 'dark_luxury', label: '✨ Obsidian & Gold Foil' },
                  { id: 'clean_white', label: '📄 Gallery Clean White' },
                  { id: 'kraft_vintage', label: '☕ Roasted Kraft Brown' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setSettings(s => ({ ...s, cardThemeStyle: th.id as any }));
                      sound.playScanBeep();
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      settings.cardThemeStyle === th.id
                        ? 'bg-orange-950/40 border-orange-500 text-orange-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Messaging Fields */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div>
                <label className="text-[11px] text-neutral-400 font-semibold block mb-1">
                  Card Headline
                </label>
                <input
                  type="text"
                  value={settings.headline}
                  onChange={(e) => setSettings(s => ({ ...s, headline: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 font-semibold block mb-1">
                  Welcome Perk Incentive Banner
                </label>
                <input
                  type="text"
                  value={settings.welcomeOfferText}
                  onChange={(e) => setSettings(s => ({ ...s, welcomeOfferText: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-semibold text-orange-400"
                />
              </div>

              {/* Guest Wi-Fi & NFC Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-orange-400" />
                      <span>Guest Wi-Fi</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showWifi}
                      onChange={(e) => setSettings(s => ({ ...s, showWifi: e.target.checked }))}
                      className="accent-orange-500 rounded cursor-pointer"
                    />
                  </div>
                  {settings.showWifi && (
                    <div className="space-y-1 pt-1">
                      <input
                        type="text"
                        placeholder="Network"
                        value={settings.wifiName}
                        onChange={(e) => setSettings(s => ({ ...s, wifiName: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-[10px] text-white"
                      />
                      <input
                        type="text"
                        placeholder="Password"
                        value={settings.wifiPassword}
                        onChange={(e) => setSettings(s => ({ ...s, wifiPassword: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-[10px] text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-orange-400" />
                      <span>NFC Contactless</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showNfcContactlessBadge}
                      onChange={(e) => setSettings(s => ({ ...s, showNfcContactlessBadge: e.target.checked }))}
                      className="accent-orange-500 rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-[9.5px] text-neutral-400 pt-1">
                    Shows instant NFC tap prompt for table NFC tags
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (COL-7): LIVE TABLE TENT PREVIEW & PRINT ACTIONS */}
        <div className="lg:col-span-7 space-y-5">

          {/* PREVIEW TOOLBAR */}
          <div className="bg-[#10121a] border border-neutral-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-300">
                Viewing: <strong className="text-orange-400">{selectedTable.label} ({selectedTable.area})</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors"
                id="btn-copy-table-url"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy NFC Link'}</span>
              </button>

              <button
                onClick={handleTestScan}
                className="py-1.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                id="btn-test-scan-simulator"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulate Client Scan</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                id="btn-print-table-tent"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Table Stand</span>
              </button>
            </div>
          </div>

          {/* MAIN RENDERED TABLE TENT CANVAS (PRINTABLE AREA) */}
          <div className="bg-[#0b0c10] border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden" id="printable-table-tent-area">
            
            {/* Perspective Standup Stand / Fold Preview Container */}
            <div className="w-full max-w-md space-y-6">

              {/* FOLDABLE TABLE TENT VIEW */}
              {settings.format === 'tent_fold' && (
                <div className="space-y-4">
                  {/* FRONT SIDE CARD */}
                  <div
                    className={`rounded-3xl p-6 sm:p-7 border-2 ${currentTheme.border} shadow-2xl relative overflow-hidden text-center transition-all`}
                    style={{ background: currentTheme.background }}
                  >
                    {/* Top Branding & Table Pill */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 text-left">
                        <span className="text-2xl p-1.5 rounded-xl bg-white/10 backdrop-blur-md">
                          {business.logoEmoji}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-white leading-tight">{business.name}</h4>
                          <p className="text-[10px] text-neutral-300">{business.tagline}</p>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-xl text-xs font-black shadow-md ${currentTheme.tablePill}`}>
                        TABLE {selectedTable.tableNumber}
                      </div>
                    </div>

                    {/* Headline */}
                    <div className="my-4 space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                        {settings.headline}
                      </h3>
                      <p className="text-[11px] text-neutral-300 max-w-xs mx-auto leading-relaxed">
                        {settings.subheadline}
                      </p>
                    </div>

                    {/* High Resolution Dynamic QR Code */}
                    <div className="my-4 inline-block">
                      <div className={`p-4 rounded-2xl mx-auto shadow-2xl relative ${currentTheme.qrFrame}`}>
                        <QRCodeSVG
                          value={tableQrUrl}
                          size={180}
                          level="H"
                          includeMargin={false}
                          imageSettings={{
                            src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=80&auto=format&fit=crop&q=80',
                            height: 32,
                            width: 32,
                            excavate: true
                          }}
                        />
                        {/* Table Indicator Watermark Badge */}
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-neutral-900 text-orange-400 border border-orange-500/80 font-mono font-bold text-[9px] shadow">
                          SCAN FOR TABLE #{selectedTable.tableNumber}
                        </div>
                      </div>
                    </div>

                    {/* Welcome Perk Pill Banner */}
                    <div className={`mt-3 py-2 px-3 rounded-2xl border text-xs font-bold text-center ${currentTheme.accentBadge}`}>
                      {settings.welcomeOfferText}
                    </div>

                    {/* Apple & Google Wallet Badges + NFC */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-300">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span> Apple Wallet</span>
                        <span>•</span>
                        <span>Google Pay</span>
                      </div>

                      {settings.showNfcContactlessBadge && (
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>or Tap Phone Here</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FOLD LINE DIVIDER (FOR PRINT CUT & FOLD) */}
                  <div className="flex items-center gap-2 justify-center text-[10px] text-neutral-500 font-mono">
                    <span className="border-b border-dashed border-neutral-700 w-24" />
                    <span>✂️ FOLD HERE FOR TABLE STAND</span>
                    <span className="border-b border-dashed border-neutral-700 w-24" />
                  </div>

                  {/* BACK SIDE CARD (LOYALTY RULES & WI-FI) */}
                  <div
                    className={`rounded-3xl p-5 border ${currentTheme.border} relative overflow-hidden text-left space-y-3 opacity-95`}
                    style={{ background: currentTheme.background }}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>How Automations Ignite Loyalty Works</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">TABLE #{selectedTable.tableNumber}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1">
                        <span className="text-sm">📸</span>
                        <div className="font-bold text-white text-[10px]">1. Scan QR</div>
                        <p className="text-[9px] text-neutral-300">Add pass to Apple or Google Wallet</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1">
                        <span className="text-sm">☕</span>
                        <div className="font-bold text-white text-[10px]">2. Earn Stamps</div>
                        <p className="text-[9px] text-neutral-300">9 Stamps = 10th Signature Item FREE</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1">
                        <span className="text-sm">🎁</span>
                        <div className="font-bold text-white text-[10px]">3. Auto Perks</div>
                        <p className="text-[9px] text-neutral-300">Lock-screen alerts & double stamp drops</p>
                      </div>
                    </div>

                    {/* Guest Wi-Fi Footer */}
                    {settings.showWifi && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-orange-400" />
                          <div>
                            <div className="text-[10px] text-neutral-400 font-semibold">Guest Wi-Fi</div>
                            <div className="text-xs font-bold text-white">{settings.wifiName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400 font-semibold">Password</div>
                          <div className="text-xs font-mono font-bold text-orange-300">{settings.wifiPassword}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACRYLIC TOP DISC / COMPACT STAND FORMAT */}
              {settings.format === 'acrylic_disc' && (
                <div
                  className={`w-72 h-72 mx-auto rounded-full p-6 border-4 ${currentTheme.border} shadow-2xl relative flex flex-col items-center justify-center text-center space-y-2.5`}
                  style={{ background: currentTheme.background }}
                >
                  <div className="flex items-center gap-1 text-xs font-black text-white">
                    <span>{business.logoEmoji}</span>
                    <span className="truncate max-w-[140px]">{business.name}</span>
                  </div>

                  {/* QR Canvas */}
                  <div className={`p-2.5 rounded-xl shadow-lg ${currentTheme.qrFrame}`}>
                    <QRCodeSVG value={tableQrUrl} size={110} level="H" includeMargin={false} />
                  </div>

                  <div className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${currentTheme.tablePill}`}>
                    TABLE #{selectedTable.tableNumber}
                  </div>

                  <p className="text-[9px] text-neutral-300 max-w-[180px] leading-tight">
                    Scan with camera to add Mobile Wallet pass
                  </p>
                </div>
              )}

              {/* MENU CARD INSERT FORMAT */}
              {settings.format === 'insert_card' && (
                <div
                  className={`w-full rounded-2xl p-4 border-2 ${currentTheme.border} shadow-xl flex items-center justify-between gap-4`}
                  style={{ background: currentTheme.background }}
                >
                  <div className="space-y-1 text-left">
                    <div className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black mb-1 ${currentTheme.tablePill}`}>
                      TABLE {selectedTable.tableNumber}
                    </div>
                    <h4 className="text-sm font-bold text-white">{business.name}</h4>
                    <p className="text-xs text-orange-400 font-semibold">{settings.welcomeOfferText}</p>
                    <p className="text-[10px] text-neutral-300">Scan QR to install pass on Apple / Google Wallet</p>
                  </div>

                  <div className={`p-2 rounded-xl shrink-0 ${currentTheme.qrFrame}`}>
                    <QRCodeSVG value={tableQrUrl} size={90} level="H" includeMargin={false} />
                  </div>
                </div>
              )}

              {/* MULTI-TABLE BATCH PRINT SHEET FORMAT */}
              {settings.format === 'batch_grid' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-neutral-300 text-center">
                    Multi-Table Print Grid (Showing 4 Tables Per Sheet)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {currentTables.slice(0, 4).map((tb) => {
                      const tbUrl = `https://ignite-pass.app/join?biz=${encodeURIComponent(business.id)}&table=${encodeURIComponent(tb.tableNumber)}`;
                      return (
                        <div
                          key={tb.id}
                          className={`rounded-2xl p-3 border ${currentTheme.border} text-center space-y-2`}
                          style={{ background: currentTheme.background }}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-white">{business.name.split(' ')[0]}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${currentTheme.tablePill}`}>
                              #{tb.tableNumber}
                            </span>
                          </div>

                          <div className="bg-white p-2 rounded-xl inline-block">
                            <QRCodeSVG value={tbUrl} size={90} level="M" />
                          </div>

                          <div className="text-[9px] text-neutral-300 font-semibold truncate">
                            {settings.welcomeOfferText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* SIMULATED CLIENT PHONE CAMERA SCAN MODAL */}
      <AnimatePresence>
        {isSimulatingScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-[#0e1017] border border-orange-500/60 rounded-3xl w-full max-w-sm overflow-hidden text-white shadow-2xl relative"
              id="modal-simulated-table-scan"
            >
              {/* Phone Camera Header Banner */}
              <div className="bg-neutral-900 p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>Client's iPhone / Android Camera</span>
                </div>
                <button
                  onClick={() => setIsSimulatingScan(false)}
                  className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Camera Scanner Simulation Notification Popup */}
              <div className="p-5 space-y-4 text-center">
                <div className="p-3 bg-gradient-to-r from-orange-950/80 to-amber-950/80 border border-orange-500/60 rounded-2xl text-left space-y-1 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{business.logoEmoji}</span>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-orange-400">
                        Camera Detected Table #{selectedTable.tableNumber}
                      </div>
                      <h4 className="text-xs font-bold text-white">{business.name}</h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-300 pt-0.5">
                    Tap below to open in Mobile Wallet and collect your table welcome gift.
                  </p>
                </div>

                {/* Instant Table Welcome Pass Card */}
                <div
                  className="rounded-2xl p-5 border border-white/10 text-left space-y-3 relative overflow-hidden shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${business.cardGradient.from} 0%, ${business.cardGradient.to} 100%)`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                        TABLE #{selectedTable.tableNumber} VIP PASS
                      </span>
                      <h3 className="text-base font-bold text-white">{business.name}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <StampIcon type={business.stampIcon} className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-amber-300 font-bold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{settings.welcomeOfferText}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-300 pt-1">
                    <span>Loyalty Progress:</span>
                    <span className="font-bold text-white">1/9 Stamps (+1 Free Bonus)</span>
                  </div>
                </div>

                {/* One-Tap Install Buttons */}
                {!simulatedInstallSuccess ? (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleSimulatePassInstall('apple')}
                      className="w-full py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all shadow-md"
                      id="btn-sim-apple-wallet"
                    >
                      <span className="text-base"></span>
                      <span>Add to Apple Wallet (1-Tap)</span>
                    </button>

                    <button
                      onClick={() => handleSimulatePassInstall('google')}
                      className="w-full py-2.5 rounded-xl bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-700 transition-all border border-neutral-700"
                      id="btn-sim-google-wallet"
                    >
                      <span className="text-sm font-bold text-emerald-400">G</span>
                      <span>Save to Google Wallet</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Pass Installed on Client Device!</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/90">
                      Table #{selectedTable.tableNumber} credited +1 free stamp & welcome voucher.
                    </p>
                    <button
                      onClick={() => setIsSimulatingScan(false)}
                      className="mt-2 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
