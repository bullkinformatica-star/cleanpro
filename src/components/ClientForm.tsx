import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, Clock, MapPin, Phone, MessageSquare, User, FileText, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';
import { createCleaningRequest } from '../services/api';

interface ClientFormProps {
  currentUser: UserType | null;
  onOpenAuthModal: () => void;
  onRequestSubmitted: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  currentUser,
  onOpenAuthModal,
  onRequestSubmitted,
}) => {
  const [formData, setFormData] = useState({
    clientName: currentUser?.name || '',
    clientEmail: currentUser?.email || '',
    clientPhone: currentUser?.phone || '',
    clientAddress: currentUser?.address || '',
    whatsapp: currentUser?.whatsapp || currentUser?.phone || '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '10:00',
    durationHours: 3,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync user profile if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        clientName: currentUser.name || prev.clientName,
        clientEmail: currentUser.email || prev.clientEmail,
        clientPhone: currentUser.phone || prev.clientPhone,
        clientAddress: currentUser.address || prev.clientAddress,
        whatsapp: currentUser.whatsapp || currentUser.phone || prev.whatsapp,
      }));
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.clientName.trim()) {
      setErrorMessage('Por favor ingrese el nombre del solicitante.');
      return;
    }
    if (!formData.clientPhone.trim()) {
      setErrorMessage('Por favor ingrese un número de teléfono válido.');
      return;
    }
    if (!formData.clientAddress.trim()) {
      setErrorMessage('Por favor especifique la dirección completa y número de departamento.');
      return;
    }
    if (!formData.date || !formData.time) {
      setErrorMessage('Por favor seleccione la fecha y la hora requerida.');
      return;
    }

    setIsSubmitting(true);

    const result = await createCleaningRequest({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail || `${formData.clientName.toLowerCase().replace(/\s+/g, '.')}@ejemplo.com`,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      whatsapp: formData.whatsapp || formData.clientPhone,
      date: formData.date,
      time: formData.time,
      durationHours: Number(formData.durationHours) || 3,
      notes: formData.notes,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('¡Solicitud registrada con éxito! Tu servicio quedará previa confirmación del administrador. Recibirás una notificación automática.');
      setFormData(prev => ({ ...prev, notes: '' }));
      setTimeout(() => {
        onRequestSubmitted();
      }, 1800);
    } else {
      setErrorMessage(result.message || 'Error al enviar la solicitud.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Intro Banner */}
      <div className="bg-[#0F172A] rounded-xl p-6 text-white shadow-sm border border-slate-800 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Servicio para Dueños de Departamentos</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Solicitar Servicio de Limpieza
            </h1>
            <p className="mt-1 text-slate-300 text-xs max-w-xl leading-relaxed">
              Reserva de manera fácil y rápida. Tu cita quedará agendada previa confirmación del administrador con notificaciones automáticas a tu WhatsApp y correo.
            </p>
          </div>

          {!currentUser && (
            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 flex flex-col items-center sm:items-end text-center sm:text-right shrink-0">
              <p className="text-[11px] text-slate-300 mb-2 font-medium">¿Iniciaste sesión con Google o Apple?</p>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-2 rounded-md shadow-sm transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingreso Rápido</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">¡Solicitud Registrada!</h3>
            <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-bold text-xs text-red-900 uppercase tracking-wider">Atención</h3>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Datos del Solicitante y Departamento</span>
        </h2>

        {/* Row 1: Nombre & Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              Nombre Completo del Solicitante *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Ej: Sofía Valenzuela"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              Teléfono de Contacto *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 2: WhatsApp & Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Número de WhatsApp (Notificaciones) *</span>
              <span className="text-[9px] text-emerald-600 font-bold">Mensajes Directos</span>
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Row 3: Dirección Completa */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
            Dirección del Departamento y Número de Unidad *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-2.5" />
            <input
              type="text"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleChange}
              placeholder="Ej: Av. Providencia 1450, Dpto 904, Providencia"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Section 2: Programación Cita */}
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pt-3 pb-3">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>Día y Hora Requerida</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              Día Solicitado *
            </label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                name="date"
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              Hora Solicitada *
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              Duración Estimada (Horas)
            </label>
            <select
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value={2}>2 Horas (Aseo Express)</option>
              <option value={3}>3 Horas (Estándar 2 dorm)</option>
              <option value={4}>4 Horas (Profundo / 3+ dorm)</option>
              <option value={6}>6 Horas (Post-Mudanza)</option>
            </select>
          </div>
        </div>

        {/* Notes / Special Instructions */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
            Instrucciones Específicas / Observaciones (Opcional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Ej: Dejar llaves en conserjería, insistir en terraza, presencia de mascotas..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
          ></textarea>
        </div>

        {/* Note on Pending Confirmation */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-3">
          <Clock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Nota Importante:</strong> Tu solicitud quedará en estado <span className="underline font-semibold">Pendiente de Confirmación</span>. Una vez que el administrador acepte la cita, recibirás una notificación automática a tu WhatsApp con el personal asignado.
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-md shadow-sm shadow-blue-200 uppercase tracking-wider flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Procesando Solicitud...</span>
            ) : (
              <>
                <span>Enviar Solicitud de Limpieza</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
