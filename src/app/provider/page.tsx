'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck, ArrowLeft, KeyRound, User, Activity,
  UtensilsCrossed, Dumbbell, AlertTriangle, Download, MessageCircle, Send,
  UserPlus, Users, ChevronRight, Trash2, Search, ImagePlus, X
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { getCalorieInfo, calculateBMI, getBMICategory } from '@/lib/calculations';
import { generateHistoricalData, checkAlerts, getDailySummary } from '@/lib/biomarkers';
import { isLoggedIn, getSessionUserId, dbGetUser, type DbUser } from '@/lib/db';
import BottomNav from '@/components/BottomNav';

interface PatientData {
  id: string;
  name: string;
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

interface FoodLogEntry {
  date: string; mealType: string; foodName: string; amount: number; calories: number; protein: number; carbs: number; fat: number;
}

interface ExerciseLogEntry {
  date: string; exerciseName: string; duration: number; caloriesBurned: number;
}

interface SavedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: string;
  addedAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

type View = 'home' | 'code-entry' | 'patient-data' | 'chat';

export default function ProviderPage() {
  const { t, locale } = useLanguage();
  const [view, setViewRaw] = useState<View>('home');
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DbUser | null>(null);

  // Code entry
  const [code, setCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Patient data
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'biomarkers' | 'nutrition' | 'exercise'>('overview');

  // Saved patients
  const [savedPatients, setSavedPatients] = useState<SavedPatient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Search patients
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string; age: number; gender: string; weight: number; height: number; goal: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chat
  const [chatPatient, setChatPatient] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unread message counts per patient
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const loadUnreadCounts = useCallback(async (uid: string) => {
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-unread-counts', userId: uid }),
      });
      const data = await res.json();
      if (res.ok) setUnreadCounts(data.unreadCounts || {});
    } catch { /* */ }
  }, []);

  // Navigate views with browser history support
  const navigateTo = useCallback((newView: View) => {
    if (newView !== 'home') {
      window.history.pushState({ view: newView }, '', undefined);
    }
    setViewRaw(newView);
  }, []);

  const goHome = useCallback(() => {
    setViewRaw('home');
    setImagePreview(null);
    setCode('');
    setCodeError('');
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    if (doctorId) loadUnreadCounts(doctorId);
  }, [doctorId, loadUnreadCounts]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setViewRaw('home');
      setImagePreview(null);
      if (chatPollRef.current) clearInterval(chatPollRef.current);
      if (doctorId) loadUnreadCounts(doctorId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [doctorId, loadUnreadCounts]);

  // Load doctor ID, profile, and saved patients
  useEffect(() => {
    if (isLoggedIn()) {
      const id = getSessionUserId();
      setDoctorId(id);
      if (id) {
        loadSavedPatients(id);
        loadUnreadCounts(id);
        dbGetUser(id).then(setDoctorProfile).catch(() => {});
      }
    }
  }, [loadUnreadCounts]);

  const loadSavedPatients = async (docId: string) => {
    setPatientsLoading(true);
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-patients', doctorId: docId }),
      });
      const data = await res.json();
      if (res.ok) setSavedPatients(data.patients || []);
    } catch { /* */ } finally { setPatientsLoading(false); }
  };

  const handleCodeAccess = async () => {
    if (!code.trim()) return;
    setCodeLoading(true);
    setCodeError('');
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCodeError(data.error || t.somethingWentWrong); return; }
      setPatient(data.patient);
      setFoodLogs(data.foodLogs || []);
      setExerciseLogs(data.exerciseLogs || []);
      navigateTo('patient-data');
    } catch { setCodeError(t.somethingWentWrong); } finally { setCodeLoading(false); }
  };

  const handleSavePatient = async () => {
    if (!doctorId || !patient?.id) return;
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-patient', doctorId, patientId: patient.id }),
      });
      if (res.ok) loadSavedPatients(doctorId);
    } catch { /* */ }
  };

  const handleRemovePatient = async (patientId: string) => {
    if (!doctorId) return;
    try {
      await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-patient', doctorId, patientId }),
      });
      setSavedPatients(prev => prev.filter(p => p.id !== patientId));
    } catch { /* */ }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch('/api/provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'search-patients', query: query.trim(), doctorId }),
        });
        const data = await res.json();
        if (res.ok) setSearchResults(data.patients || []);
      } catch { /* */ } finally { setSearchLoading(false); }
    }, 300);
  };

  const handleAddFromSearch = async (p: { id: string; name: string }) => {
    if (!doctorId) return;
    try {
      await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-patient', doctorId, patientId: p.id }),
      });
      loadSavedPatients(doctorId);
      setSearchQuery('');
      setSearchResults([]);
    } catch { /* */ }
  };

  const handleViewSavedPatient = async (p: SavedPatient) => {
    if (!doctorId) return;
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-patient-data', doctorId, patientId: p.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
        setFoodLogs(data.foodLogs || []);
        setExerciseLogs(data.exerciseLogs || []);
        navigateTo('patient-data');
      }
    } catch { /* */ }
  };

  // Chat functions
  const loadMessages = useCallback(async (patientId: string) => {
    if (!doctorId) return;
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-messages', userId: doctorId, otherUserId: patientId }),
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch { /* */ }
  }, [doctorId]);

  const markRead = useCallback(async (senderId: string) => {
    if (!doctorId) return;
    try {
      await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', userId: doctorId, senderId }),
      });
    } catch { /* */ }
  }, [doctorId]);

  const openChat = (p: { id: string; name: string }) => {
    setChatPatient(p);
    navigateTo('chat');
    loadMessages(p.id);
    markRead(p.id);
    // Clear unread count locally
    setUnreadCounts(prev => { const next = { ...prev }; delete next[p.id]; return next; });
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(() => {
      loadMessages(p.id);
      markRead(p.id);
    }, 5000);
  };

  useEffect(() => {
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, []);

  // Poll unread counts while on home view
  useEffect(() => {
    if (view !== 'home' || !doctorId) return;
    const interval = setInterval(() => loadUnreadCounts(doctorId), 15000);
    return () => clearInterval(interval);
  }, [view, doctorId, loadUnreadCounts]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1200;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendMessage = async () => {
    if (!doctorId || !chatPatient || (!msgInput.trim() && !imagePreview)) return;
    setMsgSending(true);
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          senderId: doctorId,
          receiverId: chatPatient.id,
          content: msgInput.trim(),
          imageUrl: imagePreview || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setMsgInput('');
        setImagePreview(null);
      }
    } catch { /* */ } finally { setMsgSending(false); }
  };

  const isPatientSaved = patient ? savedPatients.some(p => p.id === patient.id) : false;

  // ═══════════════════════════════════════════
  // HOME VIEW — Saved patients list + code entry
  // ═══════════════════════════════════════════
  if (view === 'home') {
    return (
      <div className="min-h-screen m3-surface pb-20 desktop-offset">
        <div className="m3-gradient-header text-white px-6 pt-6 pb-5 rounded-b-[24px] lg:rounded-b-none">
          <div className="max-w-2xl mx-auto">
            {doctorProfile ? (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                  {doctorProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="m3-title-large font-bold">Dr. {doctorProfile.name}</h1>
                  {doctorProfile.specialty && (
                    <p className="m3-label-medium opacity-80">
                      {({ general: t.generalPractitioner, cardiology: t.cardiology, endocrinology: t.endocrinology, nutrition: t.nutritionist, internal: t.internalMedicine, sports: t.sportsMedicine, psychiatry: t.psychiatry, pediatrics: t.pediatrics, other: t.otherSpecialty } as Record<string, string>)[doctorProfile.specialty] || doctorProfile.specialty}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <h1 className="m3-headline-small font-bold">{t.providerDashboard || 'Provider Dashboard'}</h1>
            )}
            <p className="m3-body-medium opacity-80 mt-1">{t.providerPortalDesc || 'Manage your patients and view health data'}</p>
          </div>
        </div>

        <div className="px-6 py-5 max-w-2xl mx-auto space-y-5">
          {/* Enter access code card */}
          <button
            onClick={() => navigateTo('code-entry')}
            className="w-full m3-card-elevated rounded-[20px] p-5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
              <KeyRound size={24} className="text-[var(--m3-on-primary-container)]" />
            </div>
            <div className="flex-1">
              <p className="m3-title-medium text-[var(--m3-on-surface)]">{t.accessCode || 'Enter Access Code'}</p>
              <p className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.providerPortalInstructions || 'Use a patient\'s access code to view their data'}</p>
            </div>
            <ChevronRight size={20} className="text-[var(--m3-on-surface-variant)]" />
          </button>

          {/* Search patients */}
          {doctorId && (
            <div className="m3-card rounded-[20px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search size={20} className="text-[var(--m3-primary)]" />
                <h2 className="m3-title-medium text-[var(--m3-on-surface)]">{t.searchPatients || 'Find Patient'}</h2>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder={t.searchByNameOrEmail || 'Search by name or email...'}
                className="m3-input mb-2"
              />
              {searchLoading && (
                <div className="text-center py-3">
                  <div className="animate-spin w-5 h-5 border-2 border-[var(--m3-primary)] border-t-transparent rounded-full mx-auto" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="space-y-2 mt-2">
                  {searchResults.map(p => {
                    const alreadySaved = savedPatients.some(sp => sp.id === p.id);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--m3-surface-container-high)]">
                        <div className="w-9 h-9 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
                          <span className="m3-label-medium text-[var(--m3-on-primary-container)] font-bold">{p.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m3-body-medium text-[var(--m3-on-surface)] font-medium truncate">{p.name}</p>
                          <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{p.email} · {p.age} yrs</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openChat({ id: p.id, name: p.name })}
                            className="p-2 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors" title="Chat">
                            <MessageCircle size={16} className="text-[var(--m3-primary)]" />
                          </button>
                          {!alreadySaved ? (
                            <button onClick={() => handleAddFromSearch({ id: p.id, name: p.name })}
                              className="p-2 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors" title="Add to my patients">
                              <UserPlus size={16} className="text-[var(--m3-primary)]" />
                            </button>
                          ) : (
                            <span className="p-2"><ShieldCheck size={16} className="text-green-500" /></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] text-center py-3">{t.noResults || 'No patients found'}</p>
              )}
            </div>
          )}

          {/* Saved patients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-[var(--m3-primary)]" />
              <h2 className="m3-title-medium text-[var(--m3-on-surface)]">{t.myPatients || 'My Patients'}</h2>
              <span className="ml-auto m3-label-medium text-[var(--m3-on-surface-variant)]">{savedPatients.length}</span>
            </div>

            {patientsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-3 border-[var(--m3-primary)] border-t-transparent rounded-full mx-auto" />
              </div>
            ) : savedPatients.length === 0 ? (
              <div className="m3-card rounded-[20px] p-8 text-center">
                <Users size={40} className="text-[var(--m3-on-surface-variant)] mx-auto mb-3 opacity-40" />
                <p className="m3-body-medium text-[var(--m3-on-surface-variant)]">{t.noPatientsYet || 'No patients saved yet'}</p>
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">{t.noPatientsDesc || 'Use an access code to view a patient, then save them to your list'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedPatients.map(p => (
                  <div key={p.id} className="m3-card rounded-[16px] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
                      <span className="m3-label-large text-[var(--m3-on-primary-container)] font-bold">{p.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m3-body-large text-[var(--m3-on-surface)] font-medium truncate">{p.name}</p>
                      <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{p.age} yrs · {p.gender} · {p.weight}kg</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openChat({ id: p.id, name: p.name })}
                        className="relative p-2 rounded-full hover:bg-[var(--m3-surface-container-high)] transition-colors" title="Chat">
                        <MessageCircle size={18} className="text-[var(--m3-primary)]" />
                        {(unreadCounts[p.id] || 0) > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--m3-error)] text-[var(--m3-on-error)] text-[10px] font-bold flex items-center justify-center">
                            {unreadCounts[p.id]}
                          </span>
                        )}
                      </button>
                      <button onClick={() => handleViewSavedPatient(p)}
                        className="p-2 rounded-full hover:bg-[var(--m3-surface-container-high)] transition-colors" title="View data">
                        <Activity size={18} className="text-[var(--m3-primary)]" />
                      </button>
                      <button onClick={() => handleRemovePatient(p.id)}
                        className="p-2 rounded-full hover:bg-[var(--m3-error-container)] transition-colors" title="Remove">
                        <Trash2 size={16} className="text-[var(--m3-error)]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!doctorId && (
            <div className="p-4 rounded-2xl bg-[var(--m3-error-container)]/30 border border-[var(--m3-outline-variant)]">
              <p className="m3-body-small text-[var(--m3-on-surface-variant)] text-center">
                {t.loginToSavePatients || 'Log in as a doctor to save patients and chat with them'}
              </p>
            </div>
          )}

        </div>
        <BottomNav />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // CODE ENTRY VIEW
  // ═══════════════════════════════════════════
  if (view === 'code-entry') {
    return (
      <div className="min-h-screen m3-surface pb-20 desktop-offset">
        <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
          <div className="lg:max-w-5xl lg:mx-auto flex items-center gap-3">
            <button onClick={() => { goHome(); window.history.back(); }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h1 className="m3-title-large">{t.accessCode || 'Access Code'}</h1>
          </div>
        </div>

        <div className="px-6 py-8 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--m3-primary-container)] flex items-center justify-center">
              <ShieldCheck size={36} className="text-[var(--m3-on-primary-container)]" />
            </div>
            <p className="m3-body-medium text-[var(--m3-on-surface-variant)]">{t.providerPortalInstructions || 'Enter the patient\'s access code to view their health data'}</p>
          </div>

          <div className="m3-card-elevated rounded-[28px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={20} className="text-[var(--m3-primary)]" />
              <span className="m3-title-medium text-[var(--m3-on-surface)]">{t.accessCode || 'Access Code'}</span>
            </div>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleCodeAccess()}
              placeholder="XXXX-XXXX"
              className="m3-input text-center text-xl tracking-[0.3em] font-mono mb-4"
              maxLength={9}
              autoFocus
            />
            {codeError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--m3-error-container)] mb-4">
                <AlertTriangle size={16} className="text-[var(--m3-on-error-container)]" />
                <span className="m3-body-small text-[var(--m3-on-error-container)]">{codeError}</span>
              </div>
            )}
            <button
              onClick={handleCodeAccess}
              disabled={codeLoading || !code.trim()}
              className="w-full py-3.5 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] m3-label-large font-bold disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {codeLoading ? t.loading : (t.accessPatientData || 'Access Patient Data')}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-[var(--m3-primary-container)]/20 border border-[var(--m3-outline-variant)]">
            <p className="m3-body-small text-[var(--m3-on-surface-variant)] text-center">
              {t.providerSecurityNote || 'Access codes are generated by patients and expire after 24 hours.'}
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // FULLSCREEN IMAGE VIEWER
  // ═══════════════════════════════════════════
  if (expandedImage) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setExpandedImage(null)}>
        <button onClick={() => setExpandedImage(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white">
          <X size={24} />
        </button>
        <img src={expandedImage} alt="Full size" className="max-w-full max-h-full object-contain" />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // CHAT VIEW
  // ═══════════════════════════════════════════
  if (view === 'chat' && chatPatient) {
    return (
      <div className="h-screen m3-surface flex flex-col desktop-offset">
        {/* Chat header */}
        <div className="m3-gradient-header text-white px-4 pt-4 pb-3 flex items-center gap-3 flex-shrink-0 lg:rounded-b-none">
          <button onClick={() => { goHome(); window.history.back(); }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <span className="font-bold">{chatPatient.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="m3-title-medium font-bold">{chatPatient.name}</p>
            <p className="m3-label-small opacity-70">{t.patient || 'Patient'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle size={40} className="text-[var(--m3-on-surface-variant)] mx-auto mb-3 opacity-30" />
              <p className="m3-body-medium text-[var(--m3-on-surface-variant)]">{t.noMessagesYet || 'No messages yet'}</p>
              <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">{t.startConversation || 'Send a message to start the conversation'}</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === doctorId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-br-md'
                    : 'bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)] rounded-bl-md'
                }`}>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Shared image"
                      className="rounded-xl mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ maxHeight: 240 }}
                      onClick={() => setExpandedImage(msg.imageUrl || null)}
                    />
                  )}
                  {msg.content && <p className="m3-body-medium whitespace-pre-wrap">{msg.content}</p>}
                  <p className={`m3-label-small mt-1 ${isMe ? 'opacity-70' : 'text-[var(--m3-on-surface-variant)]'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 pt-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-xl border m3-border" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--m3-error)] text-[var(--m3-on-error)] rounded-full flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="px-4 py-3 border-t m3-border bg-[var(--m3-surface)] mb-20 lg:mb-0 flex-shrink-0">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform hover:bg-[var(--m3-surface-container-highest)]"
            >
              <ImagePlus size={20} />
            </button>
            <textarea
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={t.typeMessage || 'Type a message...'}
              className="m3-input flex-1 min-h-[44px] max-h-[120px] resize-none py-2.5"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={msgSending || (!msgInput.trim() && !imagePreview)}
              className="w-11 h-11 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] flex items-center justify-center disabled:opacity-40 flex-shrink-0 active:scale-95 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PATIENT DATA VIEW
  // ═══════════════════════════════════════════
  if (!patient) return null;

  const bmi = calculateBMI(patient.weight, patient.height);
  const bmiCat = getBMICategory(bmi);
  const info = getCalorieInfo(patient.weight, patient.height, patient.age, patient.gender as 'male' | 'female', patient.activityLevel, patient.goal as 'lose' | 'maintain' | 'gain');
  const biomarkerData = generateHistoricalData(30, patient.weight, patient.age, patient.height);
  const todayData = biomarkerData[biomarkerData.length - 1];
  const summary = getDailySummary(todayData);
  const alerts = biomarkerData.flatMap(d => checkAlerts(d).map(a => ({ ...a, date: d.date })));

  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }
  const weekFoods = foodLogs.filter(f => last7Days.includes(f.date));
  const avgCalories = weekFoods.length > 0 ? Math.round(weekFoods.reduce((s, f) => s + f.calories, 0) / Math.max(last7Days.filter(d => weekFoods.some(f => f.date === d)).length, 1)) : 0;
  const weekExercise = exerciseLogs.filter(e => last7Days.includes(e.date));
  const exerciseDays = last7Days.filter(d => weekExercise.some(e => e.date === d)).length;
  const avgExerciseMin = exerciseDays > 0 ? Math.round(weekExercise.reduce((s, e) => s + e.duration, 0) / exerciseDays) : 0;

  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      {/* Header */}
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => { setPatient(null); goHome(); window.history.back(); }} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1">
              <h1 className="m3-title-large">{t.providerDashboard || 'Provider Dashboard'}</h1>
              <p className="m3-label-small opacity-80">{t.patientData || 'Patient Data View'}</p>
            </div>
            {/* Save + Chat + Download buttons */}
            {doctorId && (
              <div className="flex gap-2">
                <button onClick={() => {
                  const lines: string[] = [];
                  lines.push('=== PATIENT REPORT ===');
                  lines.push(`Name: ${patient.name}`);
                  lines.push(`Age: ${patient.age} | Gender: ${patient.gender} | Height: ${patient.height}cm | Weight: ${patient.weight}kg`);
                  lines.push(`BMI: ${bmi.toFixed(1)} (${bmiCat})`);
                  lines.push(`Goal: ${patient.goal} | Activity: ${patient.activityLevel}`);
                  lines.push(`Health Conditions: ${patient.healthConditions.join(', ') || 'None'}`);
                  lines.push(`Dietary Restrictions: ${patient.dietaryRestrictions.join(', ') || 'None'}`);
                  lines.push(`Health Score: ${summary.overallScore}/100`);
                  lines.push('');
                  lines.push('=== BIOMARKERS (30 days) ===');
                  lines.push('Date,HR Min,HR Avg,HR Max,Steps,BP Sys,BP Dia,Glucose,SpO2,Temp,Sleep');
                  biomarkerData.forEach(d => lines.push(`${d.date},${d.heartRateMin},${d.heartRateAvg},${d.heartRateMax},${d.steps},${d.bloodPressureSystolic},${d.bloodPressureDiastolic},${d.bloodGlucose},${d.oxygenSaturation},${d.bodyTemperature},${d.sleepHours}`));
                  lines.push('');
                  lines.push('=== NUTRITION LOG ===');
                  lines.push('Date,Meal,Food,Calories,Protein(g),Carbs(g),Fat(g)');
                  foodLogs.forEach(f => lines.push(`${f.date},${f.mealType},"${f.foodName}",${Math.round(f.calories)},${Math.round(f.protein)},${Math.round(f.carbs)},${Math.round(f.fat)}`));
                  lines.push('');
                  lines.push('=== EXERCISE LOG ===');
                  lines.push('Date,Exercise,Duration(min),Calories Burned');
                  exerciseLogs.forEach(e => lines.push(`${e.date},"${e.exerciseName}",${e.duration},${Math.round(e.caloriesBurned)}`));
                  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `${patient.name.replace(/\s/g, '_')}_full_report.csv`; a.click();
                  URL.revokeObjectURL(url);
                }}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors" title="Download All Data">
                  <Download size={18} />
                </button>
                <button onClick={() => openChat({ id: patient.id, name: patient.name })}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors" title="Chat">
                  <MessageCircle size={18} />
                </button>
                {!isPatientSaved ? (
                  <button onClick={handleSavePatient}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors m3-label-medium">
                    <UserPlus size={16} /> {t.savePatient || 'Save'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 m3-label-medium opacity-70">
                    <ShieldCheck size={16} /> {t.saved || 'Saved'}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center m3-title-medium font-bold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="m3-title-medium font-bold">{patient.name}</p>
              <p className="m3-label-small opacity-70">{patient.age} yrs · {patient.gender} · {patient.weight}kg · {patient.height}cm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 max-w-5xl mx-auto">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {(['overview', 'biomarkers', 'nutrition', 'exercise'] as const).map(tb => (
            <button key={tb} onClick={() => setActiveTab(tb)}
              className={`px-4 py-2 rounded-full m3-label-medium whitespace-nowrap transition-all ${activeTab === tb ? 'bg-[var(--m3-primary)] text-white' : 'bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)]'}`}>
              {tb === 'overview' ? (t.overview || 'Overview') :
               tb === 'biomarkers' ? (t.biomarkers || 'Biomarkers') :
               tb === 'nutrition' ? (t.nutritionTab || 'Nutrition') :
               (t.exerciseTab || 'Exercise')}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 max-w-5xl mx-auto">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="m3-card-elevated rounded-[20px] p-4 text-center">
                <p className={`text-3xl font-bold ${summary.overallScore >= 80 ? 'text-green-500' : summary.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{summary.overallScore}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.healthScore || 'Health Score'}</p>
              </div>
              <div className="m3-card-elevated rounded-[20px] p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">{bmi.toFixed(1)}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">BMI · {t[bmiCat]}</p>
              </div>
              <div className="m3-card-elevated rounded-[20px] p-4 text-center">
                <p className="text-3xl font-bold text-[var(--m3-on-surface)]">{avgCalories || '-'}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.avgDaily || 'Avg Daily'} kcal</p>
              </div>
              <div className="m3-card-elevated rounded-[20px] p-4 text-center">
                <p className="text-3xl font-bold text-orange-500">{avgExerciseMin}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.avgDaily || 'Avg'} min/day</p>
              </div>
            </div>

            <div className="m3-card rounded-[20px] p-5">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3 flex items-center gap-2"><User size={18} /> {t.patientInfo || 'Patient Information'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="m3-label-small text-[var(--m3-outline)]">{t.fullName}</span><p className="m3-body-medium text-[var(--m3-on-surface)]">{patient.name}</p></div>
                <div><span className="m3-label-small text-[var(--m3-outline)]">{t.age}</span><p className="m3-body-medium text-[var(--m3-on-surface)]">{patient.age}</p></div>
                <div><span className="m3-label-small text-[var(--m3-outline)]">{t.weight}</span><p className="m3-body-medium text-[var(--m3-on-surface)]">{patient.weight} kg</p></div>
                <div><span className="m3-label-small text-[var(--m3-outline)]">{t.height}</span><p className="m3-body-medium text-[var(--m3-on-surface)]">{patient.height} cm</p></div>
                <div><span className="m3-label-small text-[var(--m3-outline)]">{t.goal}</span><p className="m3-body-medium text-[var(--m3-on-surface)] capitalize">{patient.goal === 'lose' ? t.loseWeight : patient.goal === 'gain' ? t.gainWeight : t.maintainWeight}</p></div>
                <div><span className="m3-label-small text-[var(--m3-outline)]">{t.activityLevel}</span><p className="m3-body-medium text-[var(--m3-on-surface)] capitalize">{patient.activityLevel}</p></div>
                <div className="col-span-2"><span className="m3-label-small text-[var(--m3-outline)]">{t.healthConditions}</span><p className="m3-body-medium text-[var(--m3-on-surface)]">{patient.healthConditions?.length ? patient.healthConditions.join(', ') : t.none}</p></div>
                <div className="col-span-2"><span className="m3-label-small text-[var(--m3-outline)]">{t.dietaryRestrictions}</span><p className="m3-body-medium text-[var(--m3-on-surface)]">{patient.dietaryRestrictions?.length ? patient.dietaryRestrictions.join(', ') : t.none}</p></div>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="m3-card rounded-[20px] p-5">
                <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-orange-500" /> {t.recentAlerts || 'Recent Alerts'} ({alerts.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alerts.slice(0, 10).map((a, i) => (
                    <div key={i} className={`p-3 rounded-xl border-l-4 ${a.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'}`}>
                      <p className="m3-body-small text-[var(--m3-on-surface)]">{t[a.message as keyof typeof t] || a.message}</p>
                      <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{a.date} · {t.value || 'Value'}: {a.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="m3-card rounded-[20px] p-5">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3">{t.dailyTarget || 'Daily Targets'}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="m3-surface-container-high rounded-2xl p-3 text-center"><p className="m3-title-large font-bold text-[var(--m3-primary)]">{info.target}</p><p className="m3-label-small text-[var(--m3-on-surface-variant)]">kcal/day</p></div>
                <div className="m3-surface-container-high rounded-2xl p-3 text-center"><p className="m3-title-large font-bold text-blue-500">{info.macros.protein}g</p><p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.protein}</p></div>
                <div className="m3-surface-container-high rounded-2xl p-3 text-center"><p className="m3-title-large font-bold text-orange-500">{info.macros.carbs}g</p><p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.carbs}</p></div>
                <div className="m3-surface-container-high rounded-2xl p-3 text-center"><p className="m3-title-large font-bold text-yellow-500">{info.macros.fat}g</p><p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.fat}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BIOMARKERS ═══ */}
        {activeTab === 'biomarkers' && (
          <div className="space-y-4">
            <div className="m3-card rounded-[20px] p-5 overflow-x-auto">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3">{t.biomarkerHistory || '30-Day Biomarker History'}</h3>
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b m3-border">
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 pr-3">{t.dateLabel || 'Date'}</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 px-2">HR (bpm)</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 px-2">{t.stepsLabel || 'Steps'}</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 px-2">BP (mmHg)</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 px-2">{t.glucoseShort || 'Glucose'}</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 px-2">SpO2 (%)</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 px-2">{t.temperature || 'Temp'}</th>
                    <th className="m3-label-small text-[var(--m3-outline)] py-2 pl-2">{t.sleepLabel || 'Sleep'}</th>
                  </tr>
                </thead>
                <tbody>
                  {biomarkerData.map((d, i) => {
                    const dayAlerts = checkAlerts(d);
                    return (
                      <tr key={i} className={`border-b m3-border ${dayAlerts.some(a => a.type === 'critical') ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}>
                        <td className="m3-body-small text-[var(--m3-on-surface)] py-2 pr-3">{new Date(d.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</td>
                        <td className="m3-body-small py-2 px-2"><span className={d.heartRateAvg > 100 ? 'text-red-500 font-bold' : ''}>{d.heartRateMin}/{d.heartRateAvg}/{d.heartRateMax}</span></td>
                        <td className="m3-body-small py-2 px-2"><span className={d.steps >= 10000 ? 'text-green-500' : ''}>{d.steps.toLocaleString()}</span></td>
                        <td className="m3-body-small py-2 px-2"><span className={d.bloodPressureSystolic > 140 ? 'text-red-500 font-bold' : ''}>{d.bloodPressureSystolic}/{d.bloodPressureDiastolic}</span></td>
                        <td className="m3-body-small py-2 px-2"><span className={d.bloodGlucose > 140 || d.bloodGlucose < 70 ? 'text-orange-500 font-bold' : ''}>{d.bloodGlucose}</span></td>
                        <td className="m3-body-small py-2 px-2"><span className={d.oxygenSaturation < 95 ? 'text-red-500 font-bold' : ''}>{d.oxygenSaturation}</span></td>
                        <td className="m3-body-small py-2 px-2"><span className={d.bodyTemperature > 37.5 ? 'text-orange-500' : ''}>{d.bodyTemperature}</span></td>
                        <td className="m3-body-small py-2 pl-2">{d.sleepHours}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button onClick={() => {
              const csv = ['Date,HR Min,HR Avg,HR Max,Steps,BP Sys,BP Dia,Glucose,SpO2,Temp,Sleep',
                ...biomarkerData.map(d => `${d.date},${d.heartRateMin},${d.heartRateAvg},${d.heartRateMax},${d.steps},${d.bloodPressureSystolic},${d.bloodPressureDiastolic},${d.bloodGlucose},${d.oxygenSaturation},${d.bodyTemperature},${d.sleepHours}`)
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `patient-${patient.name.replace(/\s/g, '_')}-biomarkers.csv`; a.click();
              URL.revokeObjectURL(url);
            }} className="w-full m3-card rounded-[20px] p-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <Download size={18} className="text-[var(--m3-primary)]" />
              <span className="m3-label-large text-[var(--m3-primary)]">{t.exportBiomarkerData || 'Export Biomarker Report (CSV)'}</span>
            </button>
          </div>
        )}

        {/* ═══ NUTRITION ═══ */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <div className="m3-card rounded-[20px] p-5">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3 flex items-center gap-2"><UtensilsCrossed size={18} /> {t.nutritionHistory || 'Nutrition History'}</h3>
              {foodLogs.length === 0 ? (
                <p className="m3-body-medium text-[var(--m3-on-surface-variant)] text-center py-8">{t.noEntries}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="border-b m3-border">
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.dateLabel || 'Date'}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">Meal</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">Food</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.calories}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.protein}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.carbs}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.fat}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodLogs.slice(0, 50).map((f, i) => (
                        <tr key={i} className="border-b m3-border">
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{f.date}</td>
                          <td className="m3-body-small py-2 capitalize text-[var(--m3-on-surface)]">{f.mealType}</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{f.foodName}</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{Math.round(f.calories)}</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{Math.round(f.protein)}g</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{Math.round(f.carbs)}g</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{Math.round(f.fat)}g</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ EXERCISE ═══ */}
        {activeTab === 'exercise' && (
          <div className="space-y-4">
            <div className="m3-card rounded-[20px] p-5">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3 flex items-center gap-2"><Dumbbell size={18} /> {t.exerciseHistory || 'Exercise History'}</h3>
              {exerciseLogs.length === 0 ? (
                <p className="m3-body-medium text-[var(--m3-on-surface-variant)] text-center py-8">{t.noExercises}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[400px]">
                    <thead>
                      <tr className="border-b m3-border">
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.dateLabel || 'Date'}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.exercise}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.duration}</th>
                        <th className="m3-label-small text-[var(--m3-outline)] py-2">{t.kcalBurned}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseLogs.slice(0, 50).map((e, i) => (
                        <tr key={i} className="border-b m3-border">
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{e.date}</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{e.exerciseName}</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{e.duration} min</td>
                          <td className="m3-body-small py-2 text-[var(--m3-on-surface)]">{Math.round(e.caloriesBurned)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
