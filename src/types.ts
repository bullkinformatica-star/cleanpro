export type RequestStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type UserRole = 'client' | 'admin' | 'cleaner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  role: UserRole;
  authProvider?: 'google' | 'apple' | 'email' | 'demo';
  avatar?: string;
}

export interface Cleaner {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  status: 'active' | 'busy' | 'offline';
  rating: number;
  completedTasks: number;
  specialty?: string;
}

export interface CleaningRequest {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientAddress: string;
  whatsapp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationHours?: number;
  notes?: string;
  status: RequestStatus;
  cleanerId?: string;
  cleanerName?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  googleCalendarEventId?: string;
  adminNotes?: string;
  completionNotes?: string;
}

export interface AppNotification {
  id: string;
  targetRole: 'client' | 'cleaner' | 'admin' | 'all';
  targetEmail?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
  type: 'request_created' | 'request_confirmed' | 'status_changed' | 'cleaner_assigned' | 'reminder';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: RequestStatus;
  requestId: string;
  cleanerName?: string;
  clientName: string;
  address: string;
}
