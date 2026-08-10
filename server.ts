import express from "express";
import path from "path";

interface CleaningRequest {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientAddress: string;
  whatsapp: string;
  date: string;
  time: string;
  durationHours?: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  cleanerId?: string;
  cleanerName?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  googleCalendarEventId?: string;
  adminNotes?: string;
  completionNotes?: string;
}

interface Cleaner {
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

interface AppNotification {
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

// In-memory persistent state during server runtime
let adminPasswordHash = "admin123"; // Editable by admin in UI
let isPasswordModified = false;

let cleaners: Cleaner[] = [
  {
    id: "cleaner-1",
    name: "Lucía Fernández",
    phone: "+56 9 8765 4321",
    whatsapp: "+56987654321",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "active",
    rating: 4.9,
    completedTasks: 42,
    specialty: "Limpieza Profunda y Ventanales"
  },
  {
    id: "cleaner-2",
    name: "Carlos Mendoza",
    phone: "+56 9 7654 3210",
    whatsapp: "+56976543210",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    status: "active",
    rating: 4.8,
    completedTasks: 38,
    specialty: "Desinfección y Departamentos Turísticos"
  },
  {
    id: "cleaner-3",
    name: "Ana María Silva",
    phone: "+56 9 6543 2109",
    whatsapp: "+56965432109",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    status: "active",
    rating: 5.0,
    completedTasks: 55,
    specialty: "Limpieza Express y Mantenimiento"
  },
  {
    id: "cleaner-4",
    name: "Valentina Rojas",
    phone: "+56 9 5432 1098",
    whatsapp: "+56954321098",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "active",
    rating: 4.7,
    completedTasks: 29,
    specialty: "Aseo Post-Mudanza"
  }
];

// Helper to get relative dates for sample data
const getTodayFormatted = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

let requests: CleaningRequest[] = [
  {
    id: "req-101",
    clientName: "Roberto Gómez",
    clientEmail: "roberto.gomez@gmail.com",
    clientPhone: "+56 9 1122 3344",
    clientAddress: "Av. Providencia 1240, Apt 802, Santiago",
    whatsapp: "+56911223344",
    date: getTodayFormatted(0),
    time: "10:00",
    durationHours: 3,
    notes: "Aseo completo 2 dormitorios, 2 baños. Favor insistir en terraza y ventanales.",
    status: "confirmed",
    cleanerId: "cleaner-1",
    cleanerName: "Lucía Fernández",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    confirmedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    adminNotes: "Cliente habitual, solicitar confirmación por WhatsApp al llegar."
  },
  {
    id: "req-102",
    clientName: "Camila Torres",
    clientEmail: "camila.torres@apple.com",
    clientPhone: "+56 9 9988 7766",
    clientAddress: "Calle Las Condes 8500, Dpto 1401, Las Condes",
    whatsapp: "+56999887766",
    date: getTodayFormatted(0),
    time: "14:30",
    durationHours: 2,
    notes: "Departamento estudio. Dejar llaves en conserjería.",
    status: "in_progress",
    cleanerId: "cleaner-2",
    cleanerName: "Carlos Mendoza",
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    confirmedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "req-103",
    clientName: "Ignacio Morales",
    clientEmail: "ignacio.morales@hotmail.com",
    clientPhone: "+56 9 4455 6677",
    clientAddress: "Manuel Montt 450, Dpto 305, Ñuñoa",
    whatsapp: "+56944556677",
    date: getTodayFormatted(1),
    time: "09:00",
    durationHours: 4,
    notes: "Requiere desinfección profunda por entrega de departamento.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "req-104",
    clientName: "Sofía Valenzuela",
    clientEmail: "sofia.valenzuela@gmail.com",
    clientPhone: "+56 9 3344 5566",
    clientAddress: "Av. Italia 1580, Dpto 502, Providencia",
    whatsapp: "+56933445566",
    date: getTodayFormatted(2),
    time: "11:00",
    durationHours: 3,
    notes: "Tengo dos mascotas (gatos amigables). Productos sin cloro de preferencia.",
    status: "confirmed",
    cleanerId: "cleaner-3",
    cleanerName: "Ana María Silva",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    confirmedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "req-105",
    clientName: "Marcelo Silva",
    clientEmail: "marcelo.silva@gmail.com",
    clientPhone: "+56 9 2233 4455",
    clientAddress: "San Martín 640, Dpto 1104, Santiago Centro",
    whatsapp: "+56922334455",
    date: getTodayFormatted(-1),
    time: "15:00",
    durationHours: 3,
    notes: "Aseo rutinario mensual.",
    status: "completed",
    cleanerId: "cleaner-1",
    cleanerName: "Lucía Fernández",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    confirmedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    completionNotes: "Servicio finalizado con éxito. El cliente firmó conforme."
  }
];

let notifications: AppNotification[] = [
  {
    id: "notif-1",
    targetRole: "admin",
    title: "Nueva Solicitud de Limpieza",
    message: "Ignacio Morales ha solicitado un servicio para el " + getTodayFormatted(1) + " a las 09:00.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    requestId: "req-103",
    type: "request_created"
  },
  {
    id: "notif-2",
    targetRole: "client",
    targetEmail: "roberto.gomez@gmail.com",
    title: "Cita Confirmada ✨",
    message: "Tu servicio de aseo para hoy a las 10:00 ha sido asignado a Lucía Fernández.",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    read: true,
    requestId: "req-101",
    type: "request_confirmed"
  },
  {
    id: "notif-3",
    targetRole: "cleaner",
    title: "Nuevo Trabajo Asignado",
    message: "Lucía Fernández, fuiste asignada al departamento de Roberto Gómez (Av. Providencia 1240).",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    read: false,
    requestId: "req-101",
    type: "cleaner_assigned"
  }
];

export const app = express();

// Custom body parser middleware compatible with Vercel serverless functions
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Enable CORS for Vercel deployments and client requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const apiRouter = express.Router();

// Health endpoints
apiRouter.get("/", (req, res) => {
  res.json({ status: "ok", appName: "AseoPlanner API" });
});

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", appName: "AseoPlanner API" });
});

// Admin auth & password routes
apiRouter.get("/admin/password-status", (req, res) => {
  res.json({ isModified: isPasswordModified });
});

apiRouter.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === adminPasswordHash) {
    res.json({ success: true, token: "admin-session-token-2026" });
  } else {
    res.status(401).json({ success: false, message: "Contraseña incorrecta." });
  }
});

apiRouter.post("/admin/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword !== adminPasswordHash) {
    return res.status(400).json({ success: false, message: "La contraseña actual es incorrecta." });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: "La nueva contraseña debe tener al menos 4 caracteres." });
  }
  adminPasswordHash = newPassword;
  isPasswordModified = true;

  // Create admin notification log
  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetRole: 'admin',
    title: 'Seguridad Actualizada 🔒',
    message: 'La contraseña de administrador ha sido cambiada exitosamente.',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'reminder'
  });

  res.json({ success: true, message: "Contraseña cambiada exitosamente." });
});

apiRouter.post("/admin/reset-password", (req, res) => {
  adminPasswordHash = "admin123";
  isPasswordModified = false;

  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetRole: 'admin',
    title: 'Contraseña Restablecida 🔒',
    message: 'La contraseña de administrador ha sido restablecida a la contraseña por defecto (admin123).',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'reminder'
  });

  res.json({ success: true, message: "La contraseña ha sido restablecida exitosamente a: admin123" });
});

// Requests Endpoints
apiRouter.get("/requests", (req, res) => {
  const { clientEmail, cleanerId, status } = req.query;
  let filtered = [...requests];

  if (clientEmail) {
    filtered = filtered.filter(r => r.clientEmail?.toLowerCase() === (clientEmail as string).toLowerCase());
  }
  if (cleanerId) {
    filtered = filtered.filter(r => r.cleanerId === cleanerId);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(r => r.status === status);
  }

  // Sort by date and time descending
  filtered.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  res.json(filtered);
});

apiRouter.post("/requests", (req, res) => {
  const { clientName, clientEmail, clientPhone, clientAddress, whatsapp, date, time, durationHours, notes } = req.body;

  if (!clientName || !clientPhone || !clientAddress || !date || !time) {
    return res.status(400).json({ success: false, message: "Por favor complete todos los campos requeridos." });
  }

  const newReq: CleaningRequest = {
    id: `req-${Date.now().toString().slice(-6)}`,
    clientName,
    clientEmail: clientEmail || "cliente@ejemplo.com",
    clientPhone,
    clientAddress,
    whatsapp: whatsapp || clientPhone,
    date,
    time,
    durationHours: durationHours || 3,
    notes: notes || "",
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  requests.unshift(newReq);

  // Create notifications for Admin and Client
  notifications.unshift({
    id: `notif-${Date.now()}-1`,
    targetRole: 'admin',
    title: '🔔 Nueva Solicitud de Limpieza',
    message: `${clientName} ha solicitado aseo para el ${date} a las ${time} en ${clientAddress}.`,
    timestamp: new Date().toISOString(),
    read: false,
    requestId: newReq.id,
    type: 'request_created'
  });

  if (clientEmail) {
    notifications.unshift({
      id: `notif-${Date.now()}-2`,
      targetRole: 'client',
      targetEmail: clientEmail,
      title: 'Solicitud Recibida 🧹',
      message: `Hola ${clientName}, tu solicitud para el ${date} a las ${time} fue registrada. Te avisaremos apenas el administrador la confirme.`,
      timestamp: new Date().toISOString(),
      read: false,
      requestId: newReq.id,
      type: 'request_created'
    });
  }

  res.status(201).json({ success: true, request: newReq });
});

apiRouter.patch("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { status, cleanerId, adminNotes, completionNotes, time, date } = req.body;

  const reqIndex = requests.findIndex(r => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ success: false, message: "Solicitud no encontrada." });
  }

  const item = requests[reqIndex];
  const prevStatus = item.status;

  if (status) item.status = status;
  if (date) item.date = date;
  if (time) item.time = time;
  if (adminNotes !== undefined) item.adminNotes = adminNotes;
  if (completionNotes !== undefined) item.completionNotes = completionNotes;

  if (cleanerId) {
    const cleaner = cleaners.find(c => c.id === cleanerId);
    if (cleaner) {
      item.cleanerId = cleaner.id;
      item.cleanerName = cleaner.name;

      // Create cleaner notification
      notifications.unshift({
        id: `notif-${Date.now()}-cleaner`,
        targetRole: 'cleaner',
        title: '🧹 Nuevo Trabajo Asignado',
        message: `${cleaner.name}, fuiste asignado(a) al servicio de ${item.clientName} en ${item.clientAddress} para el ${item.date} a las ${item.time}.`,
        timestamp: new Date().toISOString(),
        read: false,
        requestId: item.id,
        type: 'cleaner_assigned'
      });
    }
  }

  if (status === 'confirmed' && prevStatus !== 'confirmed') {
    item.confirmedAt = new Date().toISOString();

    // Client Notification for confirmation
    notifications.unshift({
      id: `notif-${Date.now()}-confirmed`,
      targetRole: 'client',
      targetEmail: item.clientEmail,
      title: '¡Cita Confirmada! ✅',
      message: `Tu servicio de limpieza para el ${item.date} a las ${item.time} en ${item.clientAddress} ha sido CONFIRMADO. Personal asignado: ${item.cleanerName || 'Staff AseoPlanner'}.`,
      timestamp: new Date().toISOString(),
      read: false,
      requestId: item.id,
      type: 'request_confirmed'
    });
  } else if (status && status !== prevStatus) {
    const statusLabels: Record<string, string> = {
      in_progress: "en proceso",
      completed: "completada con éxito",
      cancelled: "cancelada"
    };
    notifications.unshift({
      id: `notif-${Date.now()}-status`,
      targetRole: 'client',
      targetEmail: item.clientEmail,
      title: `Actualización de Servicio 📌`,
      message: `Tu solicitud de aseo ahora se encuentra ${statusLabels[status] || status}.`,
      timestamp: new Date().toISOString(),
      read: false,
      requestId: item.id,
      type: 'status_changed'
    });
  }

  item.updatedAt = new Date().toISOString();
  requests[reqIndex] = item;

  res.json({ success: true, request: item });
});

apiRouter.delete("/requests/:id", (req, res) => {
  const { id } = req.params;
  const initialLen = requests.length;
  requests = requests.filter(r => r.id !== id);

  if (requests.length === initialLen) {
    return res.status(404).json({ success: false, message: "Solicitud no encontrada." });
  }

  res.json({ success: true, message: "Solicitud eliminada exitosamente." });
});

// Cleaners Endpoints
apiRouter.get("/cleaners", (req, res) => {
  // Add active task counts
  const enriched = cleaners.map(c => {
    const activeCount = requests.filter(r => r.cleanerId === c.id && (r.status === 'confirmed' || r.status === 'in_progress')).length;
    return {
      ...c,
      activeTasks: activeCount
    };
  });
  res.json(enriched);
});

apiRouter.post("/cleaners", (req, res) => {
  const { name, phone, whatsapp, specialty, avatar } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Nombre y teléfono son obligatorios." });
  }

  const newCleaner: Cleaner = {
    id: `cleaner-${Date.now()}`,
    name,
    phone,
    whatsapp: whatsapp || phone,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    status: 'active',
    rating: 5.0,
    completedTasks: 0,
    specialty: specialty || "Aseo General"
  };

  cleaners.push(newCleaner);
  res.status(201).json({ success: true, cleaner: newCleaner });
});

// Notifications Endpoints
apiRouter.get("/notifications", (req, res) => {
  const { role, email } = req.query;
  let list = [...notifications];

  if (role) {
    list = list.filter(n => n.targetRole === 'all' || n.targetRole === role || (email && n.targetEmail === email));
  }

  res.json(list.slice(0, 30));
});

apiRouter.patch("/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

apiRouter.post("/notifications/mark-all-read", (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json({ success: true });
});

// Google Calendar Integration API endpoint
apiRouter.post("/calendar/sync-event", (req, res) => {
  const { requestId } = req.body;
  const reqItem = requests.find(r => r.id === requestId);

  if (!reqItem) {
    return res.status(404).json({ success: false, message: "Solicitud no encontrada." });
  }

  // Generate standard Google Calendar Event Object
  const startDateTime = new Date(`${reqItem.date}T${reqItem.time}:00`).toISOString();
  const endDateTime = new Date(new Date(`${reqItem.date}T${reqItem.time}:00`).getTime() + (reqItem.durationHours || 3) * 3600000).toISOString();

  const calendarEventPayload = {
    summary: `🧹 Aseo Departamento: ${reqItem.clientName}`,
    location: reqItem.clientAddress,
    description: `Servicio de Aseo de Departamento AseoPlanner.\nCliente: ${reqItem.clientName}\nTeléfono / WhatsApp: ${reqItem.whatsapp}\nPersonal asignado: ${reqItem.cleanerName || 'Sin asignar'}\nNotas: ${reqItem.notes || 'N/A'}\nEstado: ${reqItem.status.toUpperCase()}`,
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago'
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ]
    }
  };

  // Quick direct web URL for opening in Google Calendar as fallback / instant client add
  const googleCalendarWebUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(calendarEventPayload.summary)}` +
    `&dates=${startDateTime.replace(/-|:|\.\d\d\d/g, "")}/${endDateTime.replace(/-|:|\.\d\d\d/g, "")}` +
    `&details=${encodeURIComponent(calendarEventPayload.description)}` +
    `&location=${encodeURIComponent(reqItem.clientAddress)}`;

  res.json({
    success: true,
    eventPayload: calendarEventPayload,
    googleCalendarWebUrl,
    message: "Evento de calendario generado correctamente con recordatorios sincronizados."
  });
});

// Mount router under both /api and / so all Vercel route rewrites resolve cleanly
app.use("/api", apiRouter);
app.use("/", apiRouter);

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
