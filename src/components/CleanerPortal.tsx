import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle2, MapPin, Phone, MessageSquare, RefreshCw, Calendar as CalendarIcon, Sparkles, Navigation } from 'lucide-react';
import { CleaningRequest, Cleaner } from '../types';
import { fetchRequests, fetchCleaners, updateRequestStatus, generateWhatsAppLink } from '../services/api';

export const CleanerPortal: React.FC = () => {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>('');
  const [assignedRequests, setAssignedRequests] = useState<CleaningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState<{ [key: string]: string }>({});

  const loadData = async () => {
    setLoading(true);
    const [reqs, clns] = await Promise.all([fetchRequests(), fetchCleaners()]);
    setCleaners(clns);

    if (!selectedCleanerId && clns.length > 0) {
      setSelectedCleanerId(clns[0].id);
    }

    const currentCleanerId = selectedCleanerId || clns[0]?.id;
    if (currentCleanerId) {
      setAssignedRequests(reqs.filter(r => r.cleanerId === currentCleanerId));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCleanerId]);

  const handleStartCleaning = async (requestId: string) => {
    await updateRequestStatus(requestId, { status: 'in_progress' });
    loadData();
  };

  const handleCompleteCleaning = async (requestId: string) => {
    const notes = completionNotes[requestId] || 'Servicio de aseo finalizado sin inconvenientes.';
    await updateRequestStatus(requestId, { status: 'completed', completionNotes: notes });
    loadData();
  };

  const activeCleaner = cleaners.find(c => c.id === selectedCleanerId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header & Staff Switcher */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Portal de Empleados de Limpieza</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Turnos y Trabajos Asignados</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Revisa la dirección de los departamentos, inicia el servicio y marca cuando hayas finalizado el aseo.
          </p>
        </div>

        {/* Staff Selector */}
        <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 w-full md:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Seleccionar Empleado:
          </label>
          <select
            value={selectedCleanerId}
            onChange={(e) => setSelectedCleanerId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {cleaners.map(c => (
              <option key={c.id} value={c.id}>{c.name} - ({c.specialty || 'Personal'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Card */}
      {activeCleaner && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3.5">
            <img src={activeCleaner.avatar} alt={activeCleaner.name} className="w-14 h-14 rounded-lg object-cover ring-2 ring-emerald-500/20" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeCleaner.name}</h2>
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">{activeCleaner.specialty || 'Especialista en Aseo'}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                ⭐ {activeCleaner.rating} / 5.0 — {activeCleaner.completedTasks} trabajos completados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Tasks List */}
      <div className="space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>Mis Tareas Asignadas ({assignedRequests.length})</span>
        </h2>

        {assignedRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No tienes tareas asignadas por el momento</h3>
            <p className="text-xs text-slate-500 mt-1">El administrador te notificará a tu WhatsApp cuando te asigne una nueva cita.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assignedRequests.map(req => (
              <div
                key={req.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-all relative space-y-3.5 ${
                  req.status === 'in_progress'
                    ? 'border-blue-500 ring-1 ring-blue-500/30'
                    : req.status === 'completed'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  {req.status === 'confirmed' && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
                      Asignada / Programada
                    </span>
                  )}
                  {req.status === 'in_progress' && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider animate-pulse">
                      En Proceso Ahora
                    </span>
                  )}
                  {req.status === 'completed' && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      ✓ Completada
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400">{req.date} ({req.time} hs)</span>
                </div>

                {/* Client & Address Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">{req.clientAddress}</h3>
                  <p className="text-xs text-slate-600 font-semibold">Cliente: {req.clientName}</p>
                </div>

                {/* Direct Google Maps button */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.clientAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[11px] text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md transition-all font-bold uppercase tracking-wider"
                >
                  <Navigation className="w-3.5 h-3.5 text-red-600" />
                  <span>Navegar en Google Maps</span>
                </a>

                {/* Notes */}
                {req.notes && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-bold text-slate-900">Notas del cliente:</span>
                    <p className="italic mt-0.5 text-slate-500 text-[11px]">"{req.notes}"</p>
                  </div>
                )}

                {/* Cleaner Status Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {req.status === 'confirmed' && (
                    <button
                      onClick={() => handleStartCleaning(req.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-md shadow-sm uppercase tracking-wider transition-all"
                    >
                      ▶ Iniciar Servicio de Aseo
                    </button>
                  )}

                  {req.status === 'in_progress' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Notas finales de entrega (ej: Llaves entregadas en conserjería)..."
                        value={completionNotes[req.id] || ''}
                        onChange={(e) => setCompletionNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleCompleteCleaning(req.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-md shadow-sm uppercase tracking-wider transition-all"
                      >
                        ✓ Marcar Aseo Como Completado
                      </button>
                    </div>
                  )}

                  {/* WhatsApp contact client */}
                  <a
                    href={generateWhatsAppLink(req.whatsapp, `Hola ${req.clientName}, soy ${activeCleaner?.name} de AseoPlanner respecto al servicio de limpieza.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 rounded-md flex items-center justify-center space-x-1.5 border border-emerald-200 uppercase tracking-wider transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contactar Cliente WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
