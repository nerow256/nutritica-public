'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { localeNames, localeFlags, type Locale } from '@/lib/i18n';
import { User, Moon, Sun, Bell, Shield, Trash2, LogOut, ChevronRight, Watch, HelpCircle, Globe } from 'lucide-react';
import { isLoggedIn, getSessionUserId, dbGetUser, dbGetSettings, dbUpdateSettings, dbDeleteUser, clearSession, type DbUser } from '@/lib/db';

export default function SettingsPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [user, setUser] = useState<DbUser | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const userId = getSessionUserId();

  useEffect(() => {
    if (!isLoggedIn() || !userId) { router.push('/login'); return; }
    (async () => {
      try {
        const u = await dbGetUser(userId);
        setUser(u);
        const settings = await dbGetSettings(userId);
        setNotifications(settings.notifications !== false);
      } catch {}
    })();
  }, [router, userId]);

  const toggleNotifications = async () => {
    if (!userId) return;
    const newVal = !notifications;
    setNotifications(newVal);
    try {
      await dbUpdateSettings(userId, { notifications: newVal });
    } catch {
      setNotifications(!newVal); // revert on failure
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!user || !userId) return;
    // Verify password via login API
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: user.email, password: deletePassword }),
      });
      if (!res.ok) {
        setDeleteError(t.incorrectPassword);
        return;
      }
      await dbDeleteUser(userId);
      clearSession();
      router.push('/');
    } catch {
      setDeleteError(t.somethingWentWrong);
    }
  };

  if (!user) return <div className="min-h-screen m3-surface flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--m3-primary)] border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="lg:max-w-4xl lg:mx-auto">
          <h1 className="m3-title-large">{t.settings}</h1>
        </div>
      </div>

      <div className="px-6 py-4 m3-stagger lg:max-w-4xl lg:mx-auto lg:px-8">
        <Link href="/profile" className="m3-card-elevated p-4 mb-6 flex items-center gap-4 block rounded-[20px] m3-state-layer">
          <div className="w-14 h-14 bg-[var(--m3-primary)] rounded-full flex items-center justify-center text-[var(--m3-on-primary)] m3-title-large font-bold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="m3-title-medium m3-on-surface">{user.name}</p>
            <p className="m3-body-medium m3-on-surface-variant">{user.email}</p>
          </div>
          <ChevronRight size={20} className="m3-outline-text" />
        </Link>

        <div className="m3-card rounded-[20px] mb-6 overflow-hidden">
          <h3 className="px-4 pt-4 pb-2 m3-label-medium m3-outline-text uppercase tracking-wider">{t.preferences}</h3>
          <div className="m3-list-item">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-yellow-100 dark:bg-yellow-500/20'}`}>
                {darkMode ? <Moon size={18} strokeWidth={2.2} className="text-indigo-500" /> : <Sun size={18} strokeWidth={2.2} className="text-yellow-500" />}
              </div>
              <span className="m3-body-large m3-on-surface">{t.darkMode}</span>
            </div>
            <button onClick={toggleDarkMode} className={`m3-switch ${darkMode ? 'm3-switch-on' : 'm3-switch-off'}`}>
              <div className="m3-switch-thumb" />
            </button>
          </div>
          <div className="m3-list-item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Bell size={18} strokeWidth={2.2} className="text-orange-500" />
              </div>
              <span className="m3-body-large m3-on-surface">{t.notifications}</span>
            </div>
            <button onClick={toggleNotifications} className={`m3-switch ${notifications ? 'm3-switch-on' : 'm3-switch-off'}`}>
              <div className="m3-switch-thumb" />
            </button>
          </div>
          <button onClick={() => setShowLanguageModal(true)} className="w-full m3-list-item !border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Globe size={18} strokeWidth={2.2} className="text-blue-500" />
              </div>
              <div>
                <span className="m3-body-large m3-on-surface">{t.language}</span>
                <p className="m3-label-small m3-outline-text">{localeFlags[locale]} {localeNames[locale]}</p>
              </div>
            </div>
            <ChevronRight size={16} className="m3-outline-text" />
          </button>
        </div>

        <div className="m3-card rounded-[20px] mb-6 overflow-hidden">
          <h3 className="px-4 pt-4 pb-2 m3-label-medium m3-outline-text uppercase tracking-wider">{t.account}</h3>
          <Link href="/profile" className="m3-list-item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl m3-icon-container-primary flex items-center justify-center"><User size={18} strokeWidth={2.2} /></div>
              <span className="m3-body-large m3-on-surface">{t.editProfile}</span>
            </div>
            <ChevronRight size={16} className="m3-outline-text" />
          </Link>
          <Link href="/devices" className="m3-list-item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl m3-icon-container-tertiary flex items-center justify-center"><Watch size={18} strokeWidth={2.2} /></div>
              <span className="m3-body-large m3-on-surface">{t.connectedDevices}</span>
            </div>
            <ChevronRight size={16} className="m3-outline-text" />
          </Link>
          <Link href="/privacy" className="m3-list-item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl m3-icon-container-secondary flex items-center justify-center"><Shield size={18} strokeWidth={2.2} /></div>
              <span className="m3-body-large m3-on-surface">{t.privacySecurity}</span>
            </div>
            <ChevronRight size={16} className="m3-outline-text" />
          </Link>
          <Link href="/help" className="m3-list-item !border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl m3-surface-container-high flex items-center justify-center"><HelpCircle size={18} strokeWidth={2.2} className="m3-on-surface-variant" /></div>
              <span className="m3-body-large m3-on-surface">{t.helpFaq}</span>
            </div>
            <ChevronRight size={16} className="m3-outline-text" />
          </Link>
        </div>

        <div className="m3-card rounded-[20px] mb-6 overflow-hidden">
          <button onClick={handleLogout} className="w-full m3-list-item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center"><LogOut size={18} strokeWidth={2.2} className="text-orange-500" /></div>
              <span className="m3-body-large text-orange-500">{t.logOut}</span>
            </div>
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="w-full m3-list-item !border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl m3-icon-container-error flex items-center justify-center"><Trash2 size={18} strokeWidth={2.2} /></div>
              <span className="m3-body-large m3-error-text">{t.deleteAccount}</span>
            </div>
          </button>
        </div>

        <p className="text-center m3-label-medium m3-outline-text mt-4">Nutritica v1.0.0</p>
      </div>

      {showDeleteModal && (
        <div className="m3-scrim flex items-center justify-center px-6">
          <div className="m3-dialog p-6 w-full max-w-sm">
            <h3 className="m3-title-large m3-on-surface mb-2">{t.deleteAccount}</h3>
            <p className="m3-body-medium m3-on-surface-variant mb-4">{t.deleteAccountWarning}</p>
            {deleteError && <p className="m3-body-medium m3-error-text mb-3">{deleteError}</p>}
            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
              placeholder={t.enterPassword} className="m3-input mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }} className="flex-1 m3-btn-outlined py-2.5">{t.cancel}</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-full m3-label-large bg-[var(--m3-error)] text-[var(--m3-on-error)] hover:opacity-90 transition-opacity">{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {showLanguageModal && (
        <div className="m3-scrim flex items-center justify-center px-6" onClick={() => setShowLanguageModal(false)}>
          <div className="m3-dialog p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="m3-title-large m3-on-surface mb-4">{t.selectLanguage}</h3>
            <div className="space-y-1">
              {(Object.keys(localeNames) as Locale[]).map(loc => (
                <button
                  key={loc}
                  onClick={() => { setLocale(loc); setShowLanguageModal(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${locale === loc ? 'bg-[var(--m3-primary-container)]' : 'hover:bg-[var(--m3-surface-container-high)]'}`}
                >
                  <span className="text-xl">{localeFlags[loc]}</span>
                  <span className={`m3-body-large ${locale === loc ? 'text-[var(--m3-on-primary-container)] font-medium' : 'm3-on-surface'}`}>{localeNames[loc]}</span>
                  {locale === loc && <span className="ml-auto text-[var(--m3-primary)]">✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setShowLanguageModal(false)} className="w-full m3-btn-outlined py-2.5 mt-4">{t.cancel}</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
