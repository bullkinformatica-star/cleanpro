import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, UserCheck, Clock, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, Plus, Trash2, Edit3, Save, Search, Sparkles, Filter, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { CleaningRequest, Cleaner } from '../types';
import { fetchRequests, fetchCleaners, updateRequestStatus, deleteRequest, addCleaner, adminLogin, changeAdminPassword, checkAdminPasswordStatus, generateWhatsAppLink, syncGoogleCalendarEvent } from '../services/api';

export const AdminDashboard: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'requests' | 'cleaners' | 'security'>('requests');

  // Requests & Cleaners data
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Cleaner state
  const [isAddingCleaner, setIsAddingCleaner] = useState(false);
  const [newCleanerData, setNewCleanerData] = useState({ name: '', phone: '', whatsapp: '', specialty: '' });

  // Load data
  const loadDashboardData = async () => {
    setLoading(true);
    const [reqs, clns] = await Promise.all([fetchRequests(), fetchCleaners()]);
    setRequests(reqs);
    setCleaners(clns);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = await adminLogin(passwordInput);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      setAuthError(result.message || 'Contraseña incorrecta.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    const res = await changeAdminPassword(currentPassword, newPassword);
    if (res.success) {
      setPwdMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdMessage({ type: 'error', text: res.message || 'Error al cambiar contraseña.' });
    }
  };

  const handleAssignCleaner = async (requestId: string, cleanerId: string) => {
    await updateRequestStatus(requestId, { cleanerId, status: 'confirmed' });
    loadDashboardData();
  };

  const handleUpdateStatus = async (requestId: string, status: CleaningRequest['status']) => {
    await updateRequestStatus(requestId, { status });
    loadDashboardData();
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('¿Confirma que desea eliminar esta solicitud de limpieza?')) {
      await deleteRequest(requestId);
      loadDashboardData();
    }
  };

  const handleAddCleanerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCleanerData.name || !newCleanerData.phone) return;

    await addCleaner(newCleanerData);
    setIsAddingCleaner(false);
    setNewCleanerData({ name: '', phone: '', whatsapp: '', specialty: '' });
    loadDashboardData();
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.clientName.toLowerCase().includes(term) ||
        r.clientAddress.toLowerCase().includes(term) ||
        r.clientPhone.includes(term) ||
        (r.cleanerName && r.cleanerName.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // KPI Metrics
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const confirmedCount = requests.filter(r => r.status === 'confirmed').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full shadow-sm relative overflow-hidden text-slate-800">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 text-center">Acceso Administrador</h2>
          <p className="text-xs text-slate-500 text-center mt-1 mb-6">
            Ingrese la contraseña del panel de administración para gestionar solicitudes y empleados.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ingrese contraseña..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Contraseña por defecto: <code className="text-blue-600 font-bold">admin123</code> (editable en ajustes)</p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-md uppercase tracking-wider shadow-sm transition-all"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-[#0F172A] border border-slate-800 p-6 rounded-xl shadow-sm text-white">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel de Control Administrador</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Administración de Servicios y Personal</h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'requests' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Solicitudes ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('cleaners')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'cleaners' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Personal ({cleaners.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'security' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Seguridad
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-[11px] text-slate-500 font-medium">Pendientes</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-green-50 text-green-600 border border-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{confirmedCount}</p>
            <p className="text-[11px] text-slate-500 font-medium">Confirmadas</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{inProgressCount}</p>
            <p className="text-[11px] text-slate-500 font-medium">En Proceso</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{completedCount}</p>
            <p className="text-[11px] text-slate-500 font-medium">Completadas</p>
          </div>
        </div>
      </div>

      {/* Tab 1: Requests Management Table */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, dirección o teléfono..."
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
              <span className="text-slate-400 font-medium mr-1">Estado:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  statusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  statusFilter === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                En Proceso
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Solicitante</th>
                  <th className="p-3">Dirección Dpto</th>
                  <th className="p-3">Día y Hora</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Personal Asignado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{req.clientName}</p>
                      <p className="text-[11px] text-slate-500">{req.clientPhone}</p>
                      <a
                        href={generateWhatsAppLink(req.whatsapp, `Hola ${req.clientName}, de AseoPlanner sobre tu cita.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 font-semibold hover:underline flex items-center space-x-1 mt-0.5 text-[10px]"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </td>

                    <td className="p-3 max-w-[200px] truncate" title={req.clientAddress}>
                      <p className="font-medium text-slate-800 truncate">{req.clientAddress}</p>
                      {req.notes && <p className="text-[10px] text-slate-500 italic truncate">"{req.notes}"</p>}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{req.date}</p>
                      <p className="text-[11px] text-slate-500">{req.time} hs ({req.durationHours || 3}h)</p>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateStatus(req.id, e.target.value as CleaningRequest['status'])}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="in_progress">En Proceso</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </td>

                    <td className="p-3 min-w-[160px]">
                      <select
                        value={req.cleanerId || ''}
                        onChange={(e) => handleAssignCleaner(req.id, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                      >
                        <option value="">Seleccionar Personal...</option>
                        {cleaners.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={async () => {
                          const res = await syncGoogleCalendarEvent(req.id);
                          if (res.googleCalendarWebUrl) window.open(res.googleCalendarWebUrl, '_blank');
                        }}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-all"
                        title="Sincronizar evento en Google Calendar"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-all"
                        title="Eliminar solicitud"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Cleaners / Staff Management */}
      {activeTab === 'cleaners' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Equipo de Personal de Limpieza</h2>
            <button
              onClick={() => setIsAddingCleaner(true)}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-md uppercase tracking-wider shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Personal</span>
            </button>
          </div>

          {/* Add cleaner form modal / inline */}
          {isAddingCleaner && (
            <form onSubmit={handleAddCleanerSubmit} className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Nuevo Empleado de Limpieza</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={newCleanerData.name}
                  onChange={(e) => setNewCleanerData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800"
                />
                <input
                  type="tel"
                  placeholder="Teléfono *"
                  value={newCleanerData.phone}
                  onChange={(e) => setNewCleanerData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp *"
                  value={newCleanerData.whatsapp}
                  onChange={(e) => setNewCleanerData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Especialidad (ej: Limpieza Profunda)"
                  value={newCleanerData.specialty}
                  onChange={(e) => setNewCleanerData(prev => ({ ...prev, specialty: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCleaner(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-md uppercase tracking-wider shadow-sm"
                >
                  Guardar Personal
                </button>
              </div>
            </form>
          )}

          {/* Cleaners Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cleaners.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{c.name}</h3>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{c.specialty || 'Aseo General'}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Teléfono:</span>
                      <span className="font-semibold text-slate-900">{c.phone}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Tareas hechas:</span>
                      <span className="font-semibold text-emerald-600">{c.completedTasks}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={generateWhatsAppLink(c.whatsapp, `Hola ${c.name}, desde la administración de AseoPlanner.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-md flex items-center justify-center space-x-1.5 transition-all shadow-sm uppercase tracking-wider"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Notificar WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security / Change Admin Password */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl mx-auto shadow-sm space-y-5 text-slate-800">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Modificar Contraseña del Administrador</h2>
              <p className="text-xs text-slate-500">Cambia la clave de acceso para proteger el panel de administración.</p>
            </div>
          </div>

          {pwdMessage && (
            <div
              className={`p-3 rounded-md text-xs font-bold ${
                pwdMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {pwdMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña Actual *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingrese contraseña actual..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nueva Contraseña *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingrese nueva contraseña..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita nueva contraseña..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-md uppercase tracking-wider shadow-sm transition-all"
            >
              Guardar Nueva Contraseña
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
