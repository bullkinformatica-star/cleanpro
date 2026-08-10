import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, ExternalLink, PlusCircle, UserCheck } from 'lucide-react';
import { CleaningRequest, User as UserType } from '../types';
import { fetchRequests, generateWhatsAppLink, syncGoogleCalendarEvent } from '../services/api';

interface ClientPortalProps {
  currentUser: UserType | null;
  onOpenNewRequest: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ currentUser, onOpenNewRequest }) => {
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const loadClientRequests = async () => {
    setLoading(true);
    const data = await fetchRequests(currentUser?.email ? { clientEmail: currentUser.email } : undefined);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClientRequests();
  }, [currentUser]);

  const handleSyncGoogleCalendar = async (req: CleaningRequest) => {
    setSyncingId(req.id);
    const res = await syncGoogleCalendarEvent(req.id);
    setSyncingId(null);

    if (res.googleCalendarWebUrl) {
      window.open(res.googleCalendarWebUrl, '_blank');
    }
  };

  const getStatusBadge = (status: CleaningRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            <span>Pendiente de Confirmación</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmada por Administrador</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>En Proceso de Limpieza</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completada</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-[#0F172A] border border-slate-800 p-6 rounded-xl shadow-sm text-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Mis Solicitudes de Limpieza</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitorea el estado de tus citas, sincroniza con Google Calendar y comunícate directamente por WhatsApp.
          </p>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-md shadow-sm shadow-blue-200 uppercase tracking-wider transition-all shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 max-w-lg mx-auto shadow-sm">
          <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No tienes solicitudes registradas</h3>
          <p className="text-xs text-slate-500 mb-5">
            Pide un servicio de aseo para tu departamento en un par de clics.
          </p>
          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-md uppercase tracking-wider transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Crear Solicitud de Limpieza</span>
          </button>
        </div>
      ) : (
        /* Request Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  {getStatusBadge(req.status)}
                  <span className="text-[10px] text-slate-400 font-mono">ID: #{req.id.slice(-5)}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-2">{req.clientAddress}</h3>

                <div className="space-y-1.5 text-xs text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-900">{req.date}</span>
                    <span className="text-slate-300">|</span>
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{req.time} hs ({req.durationHours || 3}h estimadas)</span>
                  </div>

                  {req.notes && (
                    <p className="text-slate-500 italic pt-1 border-t border-slate-200 text-[11px]">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                {/* Cleaner Info if assigned */}
                {req.cleanerName && (
                  <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider">Personal Asignado</p>
                        <p className="text-xs font-semibold text-slate-900">{req.cleanerName}</p>
                      </div>
                    </div>

                    <a
                      href={generateWhatsAppLink(
                        req.whatsapp,
                        `Hola, consulta respecto al servicio de aseo para ${req.clientAddress} del día ${req.date} (${req.time}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all shadow-sm"
                      title="Contactar vía WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* WhatsApp button */}
                <a
                  href={generateWhatsAppLink(
                    req.whatsapp,
                    `Hola, les escribo por mi servicio de limpieza #${req.id} en ${req.clientAddress} programado para el ${req.date} a las ${req.time}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp Soporte</span>
                </a>

                {/* Google Calendar Sync */}
                <button
                  onClick={() => handleSyncGoogleCalendar(req)}
                  disabled={syncingId === req.id}
                  className="inline-flex items-center space-x-1.5 text-blue-700 hover:bg-blue-100 text-[10px] font-bold uppercase tracking-wider bg-blue-50 px-2.5 py-1.5 rounded border border-blue-200 transition-all"
                  title="Sincronizar recordatorio en Google Calendar"
                >
                  <CalendarIcon className="w-3 h-3" />
                  <span>{syncingId === req.id ? 'Sincronizando...' : 'Google Calendar'}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
