import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClientForm } from './components/ClientForm';
import { ClientPortal } from './components/ClientPortal';
import { InteractiveCalendar } from './components/InteractiveCalendar';
import { AdminDashboard } from './components/AdminDashboard';
import { CleanerPortal } from './components/CleanerPortal';
import { NotificationsModal } from './components/NotificationsModal';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { UserRole, User, AppNotification } from './types';
import { fetchNotifications } from './services/api';
import { Sparkles, Heart, ShieldCheck, Calendar as CalendarIcon, PhoneCall } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [activeTab, setActiveTab] = useState<'client_form' | 'client_requests' | 'calendar' | 'admin' | 'cleaner'>('client_form');

  // Active User session
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-google-1001',
    name: 'Sofía Valenzuela',
    email: 'sofia.valenzuela@gmail.com',
    phone: '+56 9 3344 5566',
    whatsapp: '+56933445566',
    address: 'Av. Providencia 1450, Dpto 904, Providencia',
    role: 'client',
    authProvider: 'google',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadNotifications = async () => {
    const list = await fetchNotifications(currentRole, currentUser?.email);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000); // Poll notifications
    return () => clearInterval(interval);
  }, [currentRole, currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'client_form' && (
          <ClientForm
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onRequestSubmitted={() => {
              loadNotifications();
              setActiveTab('client_requests');
            }}
          />
        )}

        {activeTab === 'client_requests' && (
          <ClientPortal
            currentUser={currentUser}
            onOpenNewRequest={() => setActiveTab('client_form')}
          />
        )}

        {activeTab === 'calendar' && (
          <InteractiveCalendar
            onOpenNewRequest={() => {
              setActiveTab('client_form');
            }}
            isAdmin={currentRole === 'admin'}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'cleaner' && (
          <CleanerPortal />
        )}
      </main>

      {/* Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={loadNotifications}
      />

      <GoogleSignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignInSuccess={(user) => {
          setCurrentUser(user);
          loadNotifications();
        }}
        onSignOut={() => setCurrentUser(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">AseoPlanner Pro</span>
            <span className="text-slate-600">|</span>
            <span>Gestión de Limpieza de Departamentos</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Sincronización con Google Calendar & WhatsApp</span>
            <span>•</span>
            <span>Soporte 24/7</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
