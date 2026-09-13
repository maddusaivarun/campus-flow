import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { SystemNotification, UserProfile } from '../types';

interface NotificationsDropdownProps {
  isOpen?: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllRead: () => void;
  onMarkRead?: (notificationId: string) => void;
  onSelectEventId?: (eventId: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen = true,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
  onSelectEventId
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-12 animate-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
              Department Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllRead();
              }}
              disabled={unreadCount === 0}
              className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                unreadCount === 0
                  ? 'text-slate-400 dark:text-slate-500 cursor-default'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (onMarkRead) {
                    onMarkRead(n.id);
                  }
                  if (n.eventId && onSelectEventId) {
                    onSelectEventId(n.eventId);
                  }
                }}
                className={`p-4 transition-colors cursor-pointer ${
                  !n.read
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'action_required' ? (
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : n.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {n.title}
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {n.message}
                    </p>
                    {n.eventId && (
                      <div className="pt-1 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                        <span className="font-mono text-[10px] bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          {n.eventId}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-[10px]">View Event Dossier</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          Statutory notification stream • Department of CSBS & IoT Network
        </div>
      </div>
    </div>
  );
};
