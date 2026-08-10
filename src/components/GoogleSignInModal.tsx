import React, { useState } from 'react';
import { LogIn, X, CheckCircle2, User, Phone, MapPin, MessageSquare, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onSignInSuccess: (user: UserType) => void;
  onSignOut: () => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInSuccess,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const [customForm, setCustomForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    whatsapp: currentUser?.whatsapp || '',
    address: currentUser?.address || '',
  });

  const handleGoogleAuthSimulated = () => {
    const user: UserType = {
      id: `usr-google-${Date.now().toString().slice(-4)}`,
      name: 'Sofía Valenzuela (Google)',
      email: 'sofia.valenzuela@gmail.com',
      phone: '+56 9 8877 6655',
      whatsapp: '+56988776655',
      address: 'Av. Providencia 1450, Dpto 904, Santiago',
      role: 'client',
      authProvider: 'google',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    onSignInSuccess(user);
    onClose();
  };

  const handleAppleAuthSimulated = () => {
    const user: UserType = {
      id: `usr-apple-${Date.now().toString().slice(-4)}`,
      name: 'Carlos Andrés (Apple ID)',
      email: 'carlos.andres@icloud.com',
      phone: '+56 9 7766 5544',
      whatsapp: '+56977665544',
      address: 'Calle Las Condes 8500, Dpto 1401, Las Condes',
      role: 'client',
      authProvider: 'apple',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };
    onSignInSuccess(user);
    onClose();
  };

  const handleSaveCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name) return;

    const user: UserType = {
      id: currentUser?.id || `usr-${Date.now()}`,
      name: customForm.name,
      email: customForm.email || `${customForm.name.toLowerCase().replace(/\s+/g, '.')}@ejemplo.com`,
      phone: customForm.phone,
      whatsapp: customForm.whatsapp || customForm.phone,
      address: customForm.address,
      role: 'client',
      authProvider: currentUser?.authProvider || 'email',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    onSignInSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-xl relative space-y-6 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-md bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <LogIn className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Registro / Ingreso de Clientes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Acceso rápido y seguro a través de tu cuenta de Google o Apple.
          </p>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center space-x-3">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20" />
              <div>
                <p className="font-bold text-slate-900 text-xs">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[9px] uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {currentUser.authProvider || 'Google'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2.5 rounded-md border border-red-200 uppercase tracking-wider transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleAuthSimulated}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-md flex items-center justify-center space-x-2.5 border border-slate-300 shadow-sm transition-all uppercase tracking-wider"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Apple Sign In Button */}
            <button
              onClick={handleAppleAuthSimulated}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-4 rounded-md flex items-center justify-center space-x-2.5 shadow-sm transition-all uppercase tracking-wider"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.62-1.92-14.42-6.15-3.21-2.73-7.07-7.39-11.58-13.98-6.1-8.91-11.01-18.96-14.73-30.15-3.72-11.19-5.58-22.15-5.58-32.88 0-14.96 3.82-27.14 11.45-36.54 7.63-9.4 17.15-14.19 28.56-14.37 4.82 0 10.02 1.25 15.6 3.75 5.58 2.5 9.4 3.8 11.46 3.9 1.83 0 5.8-1.34 11.91-4.02 6.11-2.68 11.45-3.95 16.02-3.82 11.69.54 21.09 4.77 28.2 12.69-10.27 6.22-15.3 14.82-15.1 25.8 0 8.78 3.29 16.32 9.87 22.62 6.58 6.3 14.54 9.8 23.88 10.5-2.58 7.55-6.1 15.64-10.56 24.27z" />
              </svg>
              <span>Continuar con Apple ID</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">O ingresar datos manualmente</span>
              </div>
            </div>

            {/* Custom Guest Form */}
            <form onSubmit={handleSaveCustomProfile} className="space-y-2.5">
              <input
                type="text"
                placeholder="Nombre *"
                value={customForm.name}
                onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp *"
                value={customForm.phone}
                onChange={(e) => setCustomForm(prev => ({ ...prev, phone: e.target.value, whatsapp: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Dirección del departamento"
                value={customForm.address}
                onChange={(e) => setCustomForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-md uppercase tracking-wider transition-all shadow-sm"
              >
                Guardar Mi Perfil
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
