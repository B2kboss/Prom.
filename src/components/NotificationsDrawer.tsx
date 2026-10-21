import React from 'react';
import { X, Bell, Check, ExternalLink } from 'lucide-react';
import { useAppStore } from '../lib/store';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (url: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  const { userNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#0b0f19] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Notifications</h3>
            <span className="text-xs text-slate-400">({userNotifications.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.linkUrl) {
                    onNavigateTo(notif.linkUrl);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  notif.isRead 
                    ? 'bg-slate-900/50 border-slate-800/80 text-slate-400' 
                    : 'bg-[#0e162a] border-blue-900/50 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-white text-xs">{notif.title}</span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                  )}
                </div>
                <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">{notif.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {notif.linkUrl && <span className="text-blue-400 flex items-center gap-0.5">Open details →</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
