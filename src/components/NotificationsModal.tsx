import React from 'react';
import { Bell, Check, CheckCheck, Clock, X, MessageSquare, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { AppNotification } from '../types';
import { markNotificationRead, markAllNotificationsRead } from '../services/api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    onRefresh();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-lg relative space-y-4 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notificaciones Automáticas</h2>
              <p className="text-xs text-slate-500">Historial de alertas de citas, confirmaciones y avisos de WhatsApp</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action controls */}
        {notifications.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas como leídas</span>
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tienes notificaciones pendientes.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-50 border-slate-100 text-slate-500 opacity-80'
                    : 'bg-blue-50/50 border-blue-200 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                    <span>{n.title}</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
