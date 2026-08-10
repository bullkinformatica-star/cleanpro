import React from 'react';
import { Sparkles, Calendar, ShieldCheck, UserCheck, Bell, LogIn, CheckCircle2, User, Home, Wand2 } from 'lucide-react';
import { UserRole, User as UserType } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'client_form' | 'client_requests' | 'calendar' | 'admin' | 'cleaner';
  onTabChange: (tab: 'client_form' | 'client_requests' | 'calendar' | 'admin' | 'cleaner') => void;
  currentUser: UserType | null;
  onOpenAuthModal: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  currentUser,
  onOpenAuthModal,
  unreadCount,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('client_form')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base text-white tracking-tight">
                  CleanDash PRO
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Gestión de Limpieza de Departamentos
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                onRoleChange('client');
                onTabChange('client_form');
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'client_form' || activeTab === 'client_requests'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Portal Clientes</span>
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>Calendario Real</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('admin');
                onTabChange('admin');
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Administrador</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('cleaner');
                onTabChange('cleaner');
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'cleaner'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Limpiadores</span>
            </button>
          </nav>

          {/* Right Action Controls: User Auth & Notifications */}
          <div className="flex items-center space-x-3">
            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/60"
              title="Notificaciones automáticas"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Auth Button / Profile Badge */}
            {currentUser ? (
              <div
                onClick={onOpenAuthModal}
                className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-slate-700 transition-all"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-blue-400" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-white max-w-[110px] truncate">{currentUser.name}</p>
                  <p className="text-[9px] text-blue-400 capitalize">{currentUser.authProvider || 'Google/Apple'}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-2 rounded-md shadow-sm shadow-blue-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Ingresar / Registro</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto text-xs font-medium space-x-1">
          <button
            onClick={() => {
              onRoleChange('client');
              onTabChange('client_form');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap ${
              activeTab === 'client_form' || activeTab === 'client_requests' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Clientes</span>
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap ${
              activeTab === 'calendar' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendario</span>
          </button>
          <button
            onClick={() => {
              onRoleChange('admin');
              onTabChange('admin');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => {
              onRoleChange('cleaner');
              onTabChange('cleaner');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap ${
              activeTab === 'cleaner' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Personal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
