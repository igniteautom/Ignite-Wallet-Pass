import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PushNotificationMessage } from '../types';
import { Bell, X, Sparkles, Tag, Gift, ChevronRight } from 'lucide-react';

interface NotificationBannerProps {
  notifications: PushNotificationMessage[];
  onDismiss: (id: string) => void;
  onActionClick?: (notification: PushNotificationMessage) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notifications,
  onDismiss,
  onActionClick
}) => {
  const activeNotif = notifications[0];

  useEffect(() => {
    if (activeNotif) {
      const timer = setTimeout(() => {
        onDismiss(activeNotif.id);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeNotif, onDismiss]);

  if (!activeNotif) return null;

  const getIcon = () => {
    switch (activeNotif.type) {
      case 'reward':
        return <Gift className="w-5 h-5 text-amber-300" />;
      case 'discount':
        return <Tag className="w-5 h-5 text-emerald-300" />;
      case 'winback':
        return <Sparkles className="w-5 h-5 text-indigo-300" />;
      default:
        return <Bell className="w-5 h-5 text-blue-300" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeNotif.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 shadow-2xl rounded-2xl p-4 text-white overflow-hidden"
          id={`push-banner-${activeNotif.id}`}
        >
          {/* Top header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base">{activeNotif.businessEmoji}</span>
              <span className="text-xs font-semibold text-neutral-300 tracking-wide">
                {activeNotif.businessName}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">NOW</span>
            </div>
            <button
              onClick={() => onDismiss(activeNotif.id)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded-full hover:bg-neutral-800"
              aria-label="Dismiss notification"
              id="btn-dismiss-notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-tight mb-1">
                {activeNotif.title}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeNotif.body}
              </p>
              {activeNotif.discountCode && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium">
                  <Tag className="w-3 h-3" />
                  Code: {activeNotif.discountCode}
                </div>
              )}
            </div>
          </div>

          {/* Action button if present */}
          {activeNotif.actionText && (
            <div className="mt-3 pt-2.5 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => {
                  if (onActionClick) onActionClick(activeNotif);
                  onDismiss(activeNotif.id);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                id="btn-notification-action"
              >
                <span>{activeNotif.actionText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
