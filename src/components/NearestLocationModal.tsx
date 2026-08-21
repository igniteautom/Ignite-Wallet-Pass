import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RotateCw,
  Sliders,
  Footprints,
  Compass,
  X,
  Flame,
  ShieldCheck,
  Zap,
  Timer
} from 'lucide-react';
import { Business, CustomerPass } from '../types';
import {
  calculateDistanceMeters,
  metersToFeet,
  formatDistance,
  formatSecondsToTime,
  getSortedBusinessesByDistance,
  GEOFENCE_INSIDE_THRESHOLD_FEET,
  VISIT_DURATION_REQUIRED_SECONDS,
  VISIT_REWARD_POINTS,
  VISIT_REWARD_STAMPS
} from '../utils/geolocation';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface NearestLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  activeBusiness: Business;
  pass: CustomerPass;
  onAwardVisitReward: (points: number, stamps: number, businessName: string) => void;
  // Shared state props if lifted
  simulatedDistance: number;
  setSimulatedDistance: React.Dispatch<React.SetStateAction<number>>;
  timeSpentSeconds: number;
  setTimeSpentSeconds: React.Dispatch<React.SetStateAction<number>>;
  isQualified: boolean;
  setIsQualified: React.Dispatch<React.SetStateAction<boolean>>;
  hasAwardedThisSession: boolean;
  setHasAwardedThisSession: React.Dispatch<React.SetStateAction<boolean>>;
  useRealGps: boolean;
  setUseRealGps: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NearestLocationModal: React.FC<NearestLocationModalProps> = ({
  isOpen,
  onClose,
  businesses,
  activeBusiness,
  pass,
  onAwardVisitReward,
  simulatedDistance,
  setSimulatedDistance,
  timeSpentSeconds,
  setTimeSpentSeconds,
  isQualified,
  setIsQualified,
  hasAwardedThisSession,
  setHasAwardedThisSession,
  useRealGps,
  setUseRealGps
}) => {
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const prevDistanceRef = useRef<number>(simulatedDistance);

  // Watch / request browser geolocation
  const requestBrowserGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setGpsLoading(false);
        setUseRealGps(true);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(err.message || 'Location permission denied. Switched to Simulation Mode.');
        setUseRealGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen && useRealGps && !userCoords) {
      requestBrowserGps();
    }
  }, [isOpen, useRealGps]);

  // Compute nearest business using real coordinates or fallback to activeBusiness coords
  const referenceCoords = userCoords || {
    latitude: (activeBusiness.coordinates?.latitude || 37.774929) + 0.00004,
    longitude: (activeBusiness.coordinates?.longitude || -122.419416) + 0.00004
  };

  const sortedBusinesses = getSortedBusinessesByDistance(
    businesses,
    referenceCoords.latitude,
    referenceCoords.longitude
  );

  const nearest = sortedBusinesses[0] || {
    business: activeBusiness,
    distanceFeet: simulatedDistance,
    distanceMeters: simulatedDistance / 3.28084,
    isInside: simulatedDistance <= GEOFENCE_INSIDE_THRESHOLD_FEET
  };

  // Determine current effective distance (either simulated or real GPS)
  const currentDistance = useRealGps ? nearest.distanceFeet : simulatedDistance;
  const isInside = currentDistance <= GEOFENCE_INSIDE_THRESHOLD_FEET;

  // Dwell Timer interval: when inside the establishment, increment time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isInside && !hasAwardedThisSession) {
      interval = setInterval(() => {
        setTimeSpentSeconds((prev) => {
          const next = prev + 1;
          if (next >= VISIT_DURATION_REQUIRED_SECONDS && !isQualified) {
            setIsQualified(true);
            sound.playRewardFanfare();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInside, hasAwardedThisSession, isQualified, setTimeSpentSeconds, setIsQualified]);

  // Proximity Exit Detection: If user qualified (stayed >= 20 mins) and then moves outside (> 30 ft), award reward!
  useEffect(() => {
    const prevDist = prevDistanceRef.current;
    prevDistanceRef.current = currentDistance;

    if (isQualified && !hasAwardedThisSession && currentDistance > GEOFENCE_INSIDE_THRESHOLD_FEET) {
      // Customer has left the establishment after 20 minutes!
      setHasAwardedThisSession(true);
      sound.playRewardFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ea580c', '#f59e0b', '#10b981', '#ffffff']
      });

      onAwardVisitReward(
        VISIT_REWARD_POINTS,
        VISIT_REWARD_STAMPS,
        nearest.business.name || activeBusiness.name
      );
    }
  }, [currentDistance, isQualified, hasAwardedThisSession, nearest.business.name, activeBusiness.name, onAwardVisitReward, setHasAwardedThisSession]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, (timeSpentSeconds / VISIT_DURATION_REQUIRED_SECONDS) * 100);

  // Fast forward helper for demo
  const handleFastForward20Min = () => {
    setTimeSpentSeconds(VISIT_DURATION_REQUIRED_SECONDS);
    setIsQualified(true);
    sound.playScanBeep();
  };

  const handleSimulateEnter = () => {
    setUseRealGps(false);
    setSimulatedDistance(15); // 15 ft (Inside ≤30ft)
    sound.playStampSound();
  };

  const handleSimulateExit = () => {
    setUseRealGps(false);
    setSimulatedDistance(65); // 65 ft (Outside >30ft)
    sound.playScanBeep();
  };

  const handleResetVisit = () => {
    setTimeSpentSeconds(0);
    setIsQualified(false);
    setHasAwardedThisSession(false);
    setSimulatedDistance(150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-[#0f1118] border border-neutral-800 rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto text-white p-5 space-y-4 shadow-2xl relative"
        id="nearest-location-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Nearest Store & Visit Points</h2>
              <p className="text-[11px] text-neutral-400">Auto-rewards via proximity geofence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            id="btn-close-nearest-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Status & Mode Toggle */}
        <div className="bg-[#151824] border border-neutral-800/90 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                useRealGps ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div>
              <span className="font-semibold text-white">
                {useRealGps ? 'Live Device GPS Active' : 'Simulation Mode Active'}
              </span>
              <p className="text-[10px] text-neutral-400">
                {useRealGps
                  ? 'Tracking your physical coordinates'
                  : 'Interactive fast-forward tester enabled'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!useRealGps) {
                requestBrowserGps();
              } else {
                setUseRealGps(false);
              }
            }}
            disabled={gpsLoading}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-700 hover:border-orange-500 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            {gpsLoading ? 'Locating...' : useRealGps ? 'Use Simulator' : 'Use Live GPS'}
          </button>
        </div>

        {gpsError && (
          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* PRIMARY NEAREST LOCATION HERO CARD */}
        <div
          className={`relative rounded-2xl p-4 border transition-all ${
            isInside
              ? 'bg-gradient-to-b from-[#1c120a] to-[#120b06] border-orange-500/80 shadow-[0_0_20px_rgba(234,88,12,0.25)]'
              : 'bg-[#13151f] border-neutral-800'
          }`}
          id="nearest-location-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl p-2 rounded-xl bg-neutral-900 border border-neutral-800 shrink-0">
                {nearest.business.logoEmoji || '☕'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    NEAREST LOCATION
                  </span>
                  {isInside && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                      IN STORE (≤30 FT)
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">{nearest.business.name}</h3>
                <p className="text-xs text-neutral-300 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{nearest.business.address}</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                  <span>{nearest.business.hours || '6:30 AM – 8:00 PM Daily'}</span>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-black text-orange-400 font-mono">
                {formatDistance(currentDistance)}
              </div>
              <span className="text-[10px] text-neutral-400">away</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${nearest.business.name} ${nearest.business.address}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <span className="text-[11px] text-neutral-400">
              {isInside ? '🟢 Inside Geofence (≤30 ft)' : '🔴 Outside Geofence (>30 ft)'}
            </span>
          </div>
        </div>

        {/* 20-MINUTE VISIT DWELL & EXIT REWARD RULE ENGINE */}
        <div className="bg-[#12141f] border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Visit Points Rule (20 Min + Exit)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 font-bold text-[10px]">
              +{VISIT_REWARD_POINTS} Pts & +{VISIT_REWARD_STAMPS} Stamp
            </span>
          </div>

          <p className="text-[11.5px] text-neutral-300 leading-relaxed">
            Stay in the store for <strong>20 minutes</strong> (proximity ≤ 30 ft). When you leave the
            store <strong>(&gt;30 ft away)</strong>, points and stamps are automatically awarded!
          </p>

          {/* Dwell Timer Visual Progress */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                {isInside ? '⏱️ In-Store Dwell Time:' : '📍 Status:'}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {formatSecondsToTime(timeSpentSeconds)} / 20:00
              </span>
            </div>

            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Dynamic Status Message */}
            <div className="pt-1 text-xs">
              {hasAwardedThisSession ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>🎉 Visit reward (+{VISIT_REWARD_POINTS} pts & +{VISIT_REWARD_STAMPS} stamp) earned!</span>
                </div>
              ) : isQualified ? (
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>20-Minute Milestone Qualified!</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/90">
                    Now walk out of the store (distance &gt; 30 ft) to automatically trigger and gain your points!
                  </p>
                </div>
              ) : isInside ? (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Active Visit In Progress ({20 - Math.floor(timeSpentSeconds / 60)} mins remaining)...</span>
                </div>
              ) : (
                <div className="text-neutral-400 text-[11px]">
                  Step inside the business (≤ 30 ft) to start the visit timer.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAST-FORWARD / INTERACTIVE SIMULATOR CONTROLS */}
        <div className="bg-[#11131c] border border-orange-950/60 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Geofence & Dwell Simulator</span>
            </div>
            <button
              onClick={handleResetVisit}
              className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
              title="Reset timer and reward status"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <p className="text-[10.5px] text-neutral-400">
            Easily test the 20-minute dwell and &gt;30 ft exit trigger without having to wait in real time:
          </p>

          {/* Quick Action Step Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={handleSimulateEnter}
              className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                isInside
                  ? 'bg-orange-600 text-neutral-950 border-orange-400'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500'
              }`}
              id="btn-sim-enter"
            >
              1. Enter (15 ft)
            </button>

            <button
              onClick={handleFastForward20Min}
              disabled={timeSpentSeconds >= VISIT_DURATION_REQUIRED_SECONDS}
              className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                isQualified
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-emerald-500'
              }`}
              id="btn-sim-fast-forward"
            >
              2. Fast-Fwd 20m
            </button>

            <button
              onClick={handleSimulateExit}
              className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                !isInside && isQualified && hasAwardedThisSession
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-300 font-black'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-orange-500'
              }`}
              id="btn-sim-exit"
            >
              3. Exit (&gt;30 ft)
            </button>
          </div>

          {/* Distance Slider */}
          <div className="pt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">Simulate Distance Slider:</span>
              <span className="font-mono font-bold text-orange-400">{simulatedDistance} ft</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={simulatedDistance}
              onChange={(e) => {
                setUseRealGps(false);
                setSimulatedDistance(Number(e.target.value));
              }}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>0 ft (Inside Store)</span>
              <span className="text-orange-400">30 ft (Geofence Threshold)</span>
              <span>200 ft (Away)</span>
            </div>
          </div>
        </div>

        {/* ALL PARTICIPATING BUSINESS LOCATIONS */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            All Participating Branches
          </h4>

          <div className="space-y-2">
            {sortedBusinesses.map((item, idx) => (
              <div
                key={item.business.id}
                className="bg-[#12141d] border border-neutral-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{item.business.logoEmoji || '🏢'}</span>
                  <div className="min-w-0">
                    <h5 className="font-bold text-white truncate">{item.business.name}</h5>
                    <p className="text-[10px] text-neutral-400 truncate">{item.business.address}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="font-mono text-orange-400 font-bold text-[11px]">
                    {formatDistance(item.distanceFeet)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
