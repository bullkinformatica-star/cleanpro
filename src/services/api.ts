import { CleaningRequest, Cleaner, AppNotification, RequestStatus } from '../types';

export async function fetchRequests(params?: { clientEmail?: string; cleanerId?: string; status?: string }): Promise<CleaningRequest[]> {
  try {
    const query = new URLSearchParams();
    if (params?.clientEmail) query.append('clientEmail', params.clientEmail);
    if (params?.cleanerId) query.append('cleanerId', params.cleanerId);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`/api/requests?${query.toString()}`);
    if (!res.ok) throw new Error('Error al cargar solicitudes');
    return await res.json();
  } catch (err) {
    console.error('fetchRequests error:', err);
    return [];
  }
}

export async function createCleaningRequest(data: Omit<CleaningRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; request?: CleaningRequest; message?: string }> {
  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('createCleaningRequest HTTP error:', res.status, errText);
      try {
        const parsed = JSON.parse(errText);
        return { success: false, message: parsed.message || `Error del servidor (${res.status}).` };
      } catch (e) {
        return { success: false, message: `Error de servidor (${res.status}).` };
      }
    }
    return await res.json();
  } catch (err) {
    console.error('createCleaningRequest error:', err);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
}

export async function updateRequestStatus(
  id: string,
  updates: { status?: RequestStatus; cleanerId?: string; adminNotes?: string; completionNotes?: string; time?: string; date?: string }
): Promise<{ success: boolean; request?: CleaningRequest; message?: string }> {
  try {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    return { success: false, message: 'Error al actualizar la solicitud.' };
  }
}

export async function deleteRequest(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error('deleteRequest error:', err);
    return { success: false, message: 'Error al eliminar la solicitud.' };
  }
}

export async function fetchCleaners(): Promise<Cleaner[]> {
  try {
    const res = await fetch('/api/cleaners');
    if (!res.ok) throw new Error('Error al cargar personal de limpieza');
    return await res.json();
  } catch (err) {
    console.error('fetchCleaners error:', err);
    return [];
  }
}

export async function addCleaner(data: { name: string; phone: string; whatsapp?: string; specialty?: string; avatar?: string }): Promise<{ success: boolean; cleaner?: Cleaner; message?: string }> {
  try {
    const res = await fetch('/api/cleaners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error('addCleaner error:', err);
    return { success: false, message: 'Error al agregar personal.' };
  }
}

export async function fetchNotifications(role?: string, email?: string): Promise<AppNotification[]> {
  try {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (email) query.append('email', email);

    const res = await fetch(`/api/notifications?${query.toString()}`);
    if (!res.ok) throw new Error('Error al obtener notificaciones');
    return await res.json();
  } catch (err) {
    console.error('fetchNotifications error:', err);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  } catch (err) {
    console.error('markNotificationRead error:', err);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
  }
}

export async function adminLogin(password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Error al conectar con el servidor.' };
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Error al cambiar contraseña.' };
  }
}

export async function checkAdminPasswordStatus(): Promise<{ isModified: boolean }> {
  try {
    const res = await fetch('/api/admin/password-status');
    return await res.json();
  } catch (err) {
    return { isModified: false };
  }
}

export async function resetAdminPassword(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Error al restablecer la contraseña.' };
  }
}

export async function syncGoogleCalendarEvent(requestId: string): Promise<{ success: boolean; googleCalendarWebUrl?: string; message?: string }> {
  try {
    const res = await fetch('/api/calendar/sync-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Error al sincronizar con Google Calendar.' };
  }
}

export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
