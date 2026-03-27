'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Database, ShieldCheck, Bot, Lock, Download, Trash2 } from 'lucide-react';
import { isLoggedIn, getSessionUserId, clearSession, dbGetUser, dbGetFoodLogs, dbGetExerciseLogs, dbClearChatMessages } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

export default function PrivacyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const loggedIn = typeof window !== 'undefined' && isLoggedIn();

  const handleExportData = async () => {
    const userId = getSessionUserId();
    if (!userId) return;
    try {
      const user = await dbGetUser(userId);
      const [foods, exercises] = await Promise.all([
        dbGetFoodLogs(userId),
        dbGetExerciseLogs(userId),
      ]);
      const exportDate = new Date().toISOString().split('T')[0];
      const data = { user, foodLogs: foods, exerciseLogs: exercises, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-data-${exportDate}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert(t.dataExported);
    } catch { /* ignore */ }
  };

  const handleClearData = async () => {
    if (!confirm(t.clearDataWarning)) return;
    const userId = getSessionUserId();
    if (!userId) return;
    try {
      await Promise.all([
        fetch(`/api/food-log?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' }),
        fetch(`/api/exercise-log?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' }),
        dbClearChatMessages(userId),
      ]);
      clearSession();
      window.location.href = '/login';
    } catch {
      alert('Failed to clear data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen m3-surface">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="m3-title-large">{t.privacyTitle}</h1>
            <p className="m3-label-small opacity-80">{t.privacySubtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-2xl mx-auto space-y-5">
        {/* Data Privacy */}
        <div className="m3-card rounded-[20px] overflow-hidden">
          <div className="px-5 py-4 border-b m3-border">
            <h2 className="m3-title-medium text-[var(--m3-on-surface)]">{t.dataPrivacy}</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
                <Database size={18} className="text-[var(--m3-on-primary-container)]" />
              </div>
              <div>
                <p className="m3-label-large text-[var(--m3-on-surface)]">{t.dataStoredLocally}</p>
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-0.5">{t.dataStoredLocallyDesc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--m3-tertiary-container)] flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} className="text-[var(--m3-on-tertiary-container)]" />
              </div>
              <div>
                <p className="m3-label-large text-[var(--m3-on-surface)]">{t.noThirdParty}</p>
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-0.5">{t.noThirdPartyDesc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--m3-secondary-container)] flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-[var(--m3-on-secondary-container)]" />
              </div>
              <div>
                <p className="m3-label-large text-[var(--m3-on-surface)]">{t.aiChatPrivacy}</p>
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-0.5">{t.aiChatPrivacyDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {loggedIn && (
          <>
            {/* Account Security */}
            <div className="m3-card rounded-[20px] overflow-hidden">
              <div className="px-5 py-4 border-b m3-border">
                <h2 className="m3-title-medium text-[var(--m3-on-surface)]">{t.accountSecurity}</h2>
              </div>
              <button onClick={() => router.push('/profile')} className="w-full m3-list-item !border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--m3-primary-container)] flex items-center justify-center">
                    <Lock size={18} className="text-[var(--m3-on-primary-container)]" />
                  </div>
                  <div className="text-left">
                    <p className="m3-body-large text-[var(--m3-on-surface)]">{t.changePassword}</p>
                    <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.changePasswordDesc}</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Data Management */}
            <div className="m3-card rounded-[20px] overflow-hidden">
              <div className="px-5 py-4 border-b m3-border">
                <h2 className="m3-title-medium text-[var(--m3-on-surface)]">{t.dataManagement}</h2>
              </div>
              <button onClick={handleExportData} className="w-full m3-list-item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--m3-primary-container)] flex items-center justify-center">
                    <Download size={18} className="text-[var(--m3-on-primary-container)]" />
                  </div>
                  <div className="text-left">
                    <p className="m3-body-large text-[var(--m3-on-surface)]">{t.exportData}</p>
                    <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.exportDataDesc}</p>
                  </div>
                </div>
              </button>
              <button onClick={handleClearData} className="w-full m3-list-item !border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <Trash2 size={18} className="text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="m3-body-large text-red-500">{t.clearAllData}</p>
                    <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.clearAllDataDesc}</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
