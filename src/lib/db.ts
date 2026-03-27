// Client-side database abstraction layer
// Provides typed functions that call the API routes

export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  specialty: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  activityLevel: string;
  goal: string;
  healthConditions: string[];
  dietaryRestrictions: string[];
  createdAt: string;
}

export interface DbFoodLog {
  id: string;
  date: string;
  mealType: string;
  foodName: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  userId: string;
}

export interface DbExerciseLog {
  id: string;
  date: string;
  exerciseName: string;
  duration: number;
  caloriesBurned: number;
  userId: string;
}

export interface DbChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  userId: string;
}

export interface DbSettings {
  darkMode: boolean;
  notifications: boolean;
}

// ── Auth ──

export async function dbLogin(email: string, password: string): Promise<DbUser> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.user;
}

export async function dbRegister(email: string, password: string, name: string, role: string = 'patient', specialty: string = ''): Promise<DbUser> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', email, password, name, role, specialty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.user;
}

// ── User ──

export async function dbGetUser(id: string): Promise<DbUser> {
  const res = await fetch(`/api/user?id=${id}`);
  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.user;
}

export async function dbUpdateUser(id: string, fields: Partial<Omit<DbUser, 'id' | 'createdAt'>>): Promise<DbUser> {
  const res = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...fields }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.user;
}

export async function dbDeleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/user?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete user');
  }
}

// ── Food Log ──

export async function dbGetFoodLogs(userId: string, date?: string): Promise<DbFoodLog[]> {
  const params = new URLSearchParams({ userId });
  if (date) params.set('date', date);
  const res = await fetch(`/api/food-log?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch food logs');
  return data.entries || [];
}

export async function dbCreateFoodLog(entry: Omit<DbFoodLog, 'id'>): Promise<DbFoodLog> {
  const res = await fetch('/api/food-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create food log');
  return data.entry;
}

export async function dbUpdateFoodLog(id: string, fields: Partial<DbFoodLog>): Promise<DbFoodLog> {
  const res = await fetch('/api/food-log', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...fields }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update food log');
  return data.entry;
}

export async function dbDeleteFoodLog(id: string): Promise<void> {
  const res = await fetch(`/api/food-log?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete food log');
  }
}

// ── Exercise Log ──

export async function dbGetExerciseLogs(userId: string, date?: string): Promise<DbExerciseLog[]> {
  const params = new URLSearchParams({ userId });
  if (date) params.set('date', date);
  const res = await fetch(`/api/exercise-log?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch exercise logs');
  return data.entries || [];
}

export async function dbCreateExerciseLog(entry: Omit<DbExerciseLog, 'id'>): Promise<DbExerciseLog> {
  const res = await fetch('/api/exercise-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create exercise log');
  return data.entry;
}

export async function dbDeleteExerciseLog(id: string): Promise<void> {
  const res = await fetch(`/api/exercise-log?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete exercise log');
  }
}

// ── Chat Messages ──

export async function dbGetChatMessages(userId: string): Promise<DbChatMessage[]> {
  const res = await fetch(`/api/chat-messages?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch messages');
  return data.messages || [];
}

export async function dbCreateChatMessage(msg: Omit<DbChatMessage, 'id'>): Promise<DbChatMessage> {
  const res = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create message');
  return data.message;
}

export async function dbClearChatMessages(userId: string): Promise<void> {
  const res = await fetch(`/api/chat-messages?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to clear messages');
  }
}

// ── Settings ──

export async function dbGetSettings(userId: string): Promise<DbSettings> {
  const res = await fetch(`/api/settings?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data.settings;
}

export async function dbUpdateSettings(userId: string, settings: Partial<DbSettings>): Promise<DbSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...settings }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data.settings;
}

// ── Session helpers ──
// We still use localStorage for the session (userId + logged_in flag) since
// this is a client-side session, not a cookie-based one. The actual data
// is now in SQLite.

export function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dhc_user_id');
}

export function setSession(userId: string): void {
  localStorage.setItem('dhc_user_id', userId);
  localStorage.setItem('dhc_logged_in', 'true');
}

export function clearSession(): void {
  localStorage.removeItem('dhc_user_id');
  localStorage.removeItem('dhc_logged_in');
  localStorage.removeItem('dhc_user_role');
  // Clear the httpOnly session cookie via the logout API
  fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }).catch(() => { /* best-effort */ });
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('dhc_logged_in') === 'true' && !!localStorage.getItem('dhc_user_id');
}
