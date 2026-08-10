import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, ExternalLink, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { CleaningRequest, Cleaner } from '../types';
import { fetchRequests, fetchCleaners, syncGoogleCalendarEvent, generateWhatsAppLink, updateRequestStatus } from '../services/api';

interface InteractiveCalendarProps {
  onOpenNewRequest: () => void;
  isAdmin: boolean;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({ onOpenNewRequest, isAdmin }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CleaningRequest | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterCleaner, setFilterCleaner] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    const [reqs, clns] = await Promise.all([fetchRequests(), fetchCleaners()]);
    setRequests(reqs);
    setCleaners(clns);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (filterCleaner !== 'all' && r.cleanerId !== filterCleaner) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const getRequestsForDay = (dayNum: number) => {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return filteredRequests.filter(r => r.date === formattedDay);
  };

  const handleSyncGoogleCalendar = async (req: CleaningRequest) => {
    const res = await syncGoogleCalendarEvent(req.id);
    if (res.googleCalendarWebUrl) {
      window.open(res.googleCalendarWebUrl, '_blank');
    }
  };

  const handleAssignCleaner = async (reqId: string, cleanerId: string) => {
    if (!cleanerId) return;
    const res = await updateRequestStatus(reqId, { status: 'confirmed', cleanerId });
    if (res.success && res.request) {
      setSelectedRequest(res.request);
      loadData();
    }
  };

  const handleStatusChange = async (reqId: string, status: CleaningRequest['status']) => {
    const res = await updateRequestStatus(reqId, { status });
    if (res.success && res.request) {
      setSelectedRequest(res.request);
      loadData();
    }
  };

  const getStatusBadgeClass = (status: CleaningRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusLabel = (status: CleaningRequest['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'in_progress': return 'En Proceso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title & Controls Header */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-sm mb-6 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendario de Aseos Sincronizado</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Calendario Real de Limpieza
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Monitorea los turnos asignados a empleados, filtra por estado y sincroniza eventos directamente en Google Calendar.
            </p>
          </div>

          {/* Month Navigation & Today Button */}
          <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={today}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-all shadow-sm"
            >
              Hoy
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtrar:</span>
            </div>

            {/* Cleaner Filter */}
            <select
              value={filterCleaner}
              onChange={(e) => setFilterCleaner(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos los empleados</option>
              {cleaners.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="in_progress">En Proceso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {/* Quick Legend */}
          <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Pendiente</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Confirmada</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>En Proceso</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Completada</span>
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-100 text-center py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-t-lg">
          {daysOfWeek.map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 text-[11px]">
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="border-r border-b border-slate-100 h-24 sm:h-32 p-2 opacity-30 bg-slate-50"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayReqs = getRequestsForDay(dayNum);
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day-${dayNum}`}
                className={`border-r border-b border-slate-100 h-24 sm:h-32 p-1.5 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
                      isToday ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayReqs.length > 0 && (
                    <span className="text-[9px] font-bold px-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {dayReqs.length}
                    </span>
                  )}
                </div>

                {/* Day events scroll */}
                <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
                  {dayReqs.map(req => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`w-full text-left p-1 rounded border text-[9px] font-semibold leading-tight block truncate transition-all ${getStatusBadgeClass(
                        req.status
                      )}`}
                    >
                      <div className="flex items-center justify-between truncate">
                        <span className="truncate">{req.time} - {req.clientName.split(' ')[0]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-lg relative space-y-5 text-slate-800">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-md bg-slate-100"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(selectedRequest.status)}`}>
                  {getStatusLabel(selectedRequest.status)}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: #{selectedRequest.id.slice(-5)}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{selectedRequest.clientAddress}</h2>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-900">Solicitante:</span>
                <span>{selectedRequest.clientName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-900">Fecha y Hora:</span>
                <span>{selectedRequest.date} a las {selectedRequest.time} hs</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-semibold text-slate-900">Dirección:</span>
                <span>{selectedRequest.clientAddress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-900">Personal Asignado:</span>
                <span className="text-emerald-700 font-semibold">{selectedRequest.cleanerName || 'Pendiente de asignación'}</span>
              </div>
              {selectedRequest.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Observaciones:</span>
                  <p className="mt-0.5 text-slate-600 italic">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            {/* Admin Assignment option */}
            {isAdmin && selectedRequest.status === 'pending' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <p className="text-xs font-bold text-amber-900">Asignar Personal para Confirmar Cita:</p>
                <div className="flex gap-2">
                  <select
                    value={selectedCleanerId}
                    onChange={(e) => setSelectedCleanerId(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="">Seleccionar Limpiador(a)</option>
                    {cleaners.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignCleaner(selectedRequest.id, selectedCleanerId)}
                    disabled={!selectedCleanerId}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}

            {/* Status updates for admin/staff */}
            {isAdmin && selectedRequest.status !== 'pending' && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedRequest.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'in_progress')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm"
                  >
                    Iniciar Aseo (En Proceso)
                  </button>
                )}
                {selectedRequest.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'completed')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm"
                  >
                    Marcar Completada
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={generateWhatsAppLink(
                  selectedRequest.whatsapp,
                  `Hola ${selectedRequest.clientName}, consulta sobre el servicio de limpieza #${selectedRequest.id} en ${selectedRequest.clientAddress}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => handleSyncGoogleCalendar(selectedRequest)}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
