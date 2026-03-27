'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import BottomNav from '@/components/BottomNav';
import { exerciseDatabase } from '@/lib/exercises';
import { Plus, X, Trash2, Flame, Clock } from 'lucide-react';
import { isLoggedIn, getSessionUserId, dbGetExerciseLogs, dbCreateExerciseLog, dbDeleteExerciseLog, type DbExerciseLog } from '@/lib/db';

export default function ExercisePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const today = new Date().toISOString().split('T')[0];
  const [entries, setEntries] = useState<DbExerciseLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<typeof exerciseDatabase[0] | null>(null);
  const [duration, setDuration] = useState('30');

  const userId = getSessionUserId();

  const loadEntries = useCallback(async () => {
    if (!userId) return;
    try {
      const logs = await dbGetExerciseLogs(userId, today);
      setEntries(logs);
    } catch { setEntries([]); }
  }, [userId, today]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadEntries();
  }, [router, loadEntries]);

  const addExercise = async () => {
    if (!selectedExercise || !userId) return;
    const dur = parseInt(duration) || 30;
    try {
      await dbCreateExerciseLog({
        date: today,
        exerciseName: selectedExercise.name,
        duration: dur,
        caloriesBurned: Math.round(selectedExercise.caloriesPerMinute * dur),
        userId,
      });
      setShowModal(false);
      setSelectedExercise(null);
      setDuration('30');
      loadEntries();
    } catch { /* entry stays open so user can retry */ }
  };

  const deleteEntry = async (id: string) => {
    try {
      await dbDeleteExerciseLog(id);
      loadEntries();
    } catch { /* silently fail, entry remains visible */ }
  };

  const totalMins = entries.reduce((s, e) => s + e.duration, 0);
  const totalCals = entries.reduce((s, e) => s + e.caloriesBurned, 0);

  const categoryIcons: Record<string, string> = { Cardio: '🏃', Strength: '💪', Flexibility: '🧘', Sports: '⚽' };
  const categories = [...new Set(exerciseDatabase.map(e => e.category))];

  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="lg:max-w-5xl lg:mx-auto">
          <h1 className="m3-title-large">{t.exerciseLog}</h1>
          <p className="m3-body-medium opacity-80 mt-1">{t.trackActivities}</p>
        </div>
      </div>

      <div className="px-6 py-4 m3-stagger lg:max-w-5xl lg:mx-auto lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="m3-card-elevated rounded-[20px] p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl m3-icon-container-tertiary flex items-center justify-center">
                <Clock size={18} strokeWidth={2.2} />
              </div>
              <span className="m3-label-large m3-on-surface-variant">{t.duration}</span>
            </div>
            <p className="m3-headline-small font-bold m3-on-surface">{totalMins} <span className="m3-body-medium font-normal m3-outline-text">{t.min}</span></p>
          </div>
          <div className="m3-card-elevated rounded-[20px] p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Flame size={18} strokeWidth={2.2} className="text-orange-500" />
              </div>
              <span className="m3-label-large m3-on-surface-variant">{t.burned}</span>
            </div>
            <p className="m3-headline-small font-bold text-orange-500">{totalCals} <span className="m3-body-medium font-normal m3-outline-text">{t.kcal}</span></p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="w-full lg:w-auto m3-btn-filled py-3.5 mb-6">
          <Plus size={20} /> {t.logExercise}
        </button>

        <h3 className="m3-title-medium m3-on-surface mb-3">{t.todaysActivities}</h3>
        <div className="lg:grid lg:grid-cols-2 lg:gap-3">
        {entries.length > 0 ? entries.map(entry => (
          <div key={entry.id} className="m3-card rounded-[20px] p-4 mb-3 lg:mb-0 flex justify-between items-center">
            <div>
              <p className="m3-body-large m3-on-surface">{entry.exerciseName}</p>
              <p className="m3-body-medium m3-on-surface-variant">{entry.duration} {t.min} · {entry.caloriesBurned} {t.kcalBurned}</p>
            </div>
            <button onClick={() => deleteEntry(entry.id)} className="m3-outline-text hover:text-[var(--m3-error)] transition-colors p-2 rounded-full m3-state-layer">
              <Trash2 size={18} />
            </button>
          </div>
        )) : (
          <div className="text-center py-8 m3-on-surface-variant">
            <Flame size={48} className="mx-auto mb-3 opacity-30" />
            <p className="m3-body-large">{t.noExercises}</p>
            <p className="m3-body-medium m3-outline-text">{t.noExercisesHint}</p>
          </div>
        )}
        </div>
      </div>

      {showModal && (
        <div className="m3-scrim flex items-end justify-center">
          <div className="m3-bottom-sheet w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b m3-border">
              <h3 className="m3-title-medium m3-on-surface">{t.logExercise}</h3>
              <button onClick={() => { setShowModal(false); setSelectedExercise(null); }} className="p-1 rounded-full m3-state-layer m3-outline-text"><X size={24} /></button>
            </div>
            {!selectedExercise ? (
              <div className="flex-1 overflow-y-auto p-4">
                {categories.map(cat => (
                  <div key={cat} className="mb-4">
                    <h4 className="m3-title-small m3-on-surface-variant mb-2">{categoryIcons[cat]} {cat}</h4>
                    <div className="space-y-1">
                      {exerciseDatabase.filter(e => e.category === cat).map(ex => (
                        <button key={ex.id} onClick={() => setSelectedExercise(ex)}
                          className="w-full text-left p-3 rounded-2xl m3-state-layer transition-colors flex justify-between items-center">
                          <span className="m3-body-large m3-on-surface">{ex.name}</span>
                          <span className="m3-label-small m3-outline-text">~{ex.caloriesPerMinute} {t.kcalPerMin}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="m3-title-large m3-on-surface">{selectedExercise.name}</h4>
                  <p className="m3-body-medium m3-on-surface-variant">{selectedExercise.category} · ~{selectedExercise.caloriesPerMinute} {t.kcalPerMin}</p>
                </div>
                <div>
                  <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.durationMinutes}</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="m3-input" />
                </div>
                <div className="bg-[var(--m3-tertiary-container)] rounded-2xl p-4 text-center">
                  <p className="m3-label-large m3-on-surface-variant">{t.estimatedBurn}</p>
                  <p className="m3-display-small font-bold text-orange-500">{Math.round(selectedExercise.caloriesPerMinute * (parseInt(duration) || 0))}</p>
                  <p className="m3-label-large m3-on-surface-variant">{t.kcal}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedExercise(null)} className="flex-1 m3-btn-outlined py-2.5">{t.back}</button>
                  <button onClick={addExercise} className="flex-1 m3-btn-filled py-2.5">{t.addExercise}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
