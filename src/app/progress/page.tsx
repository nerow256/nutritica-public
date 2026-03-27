'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { getCalorieInfo, calculateBMI, getBMICategory } from '@/lib/calculations';
import { TrendingUp, Scale, Target, Activity } from 'lucide-react';
import { isLoggedIn, getSessionUserId, dbGetUser, dbGetFoodLogs, dbGetExerciseLogs, type DbUser } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

export default function ProgressPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [user, setUser] = useState<DbUser | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number; target: number; exercise: number }[]>([]);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const userId = getSessionUserId();
    if (!userId) return;

    (async () => {
      try {
        const u = await dbGetUser(userId);
        setUser(u);

        const [foods, exercises] = await Promise.all([
          dbGetFoodLogs(userId),
          dbGetExerciseLogs(userId),
        ]);
        const info = getCalorieInfo(u.weight, u.height, u.age, u.gender as 'male' | 'female', u.activityLevel, u.goal as 'lose' | 'maintain' | 'gain');

        const days = period === 'week' ? 7 : 30;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayLabel = d.toLocaleDateString(locale, { weekday: 'short' });
          const dayCals = foods.filter(f => f.date === dateStr).reduce((s, f) => s + f.calories, 0);
          const dayExercise = exercises.filter(e => e.date === dateStr).reduce((s, e) => s + e.caloriesBurned, 0);
          data.push({ day: period === 'week' ? dayLabel : `${d.getMonth() + 1}/${d.getDate()}`, calories: Math.round(dayCals), target: info.target, exercise: Math.round(dayExercise) });
        }
        setWeeklyData(data);
      } catch {}
    })();
  }, [router, period]);

  if (!user) return <div className="min-h-screen m3-surface flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--m3-primary)] border-t-transparent rounded-full" /></div>;

  const info = getCalorieInfo(user.weight, user.height, user.age, user.gender as 'male' | 'female', user.activityLevel, user.goal as 'lose' | 'maintain' | 'gain');
  const bmi = calculateBMI(user.weight, user.height);
  const bmiCat = getBMICategory(bmi);

  const daysWithCalories = weeklyData.filter(d => d.calories > 0).length;
  const avgCalories = daysWithCalories > 0 ? Math.round(weeklyData.reduce((s, d) => s + d.calories, 0) / daysWithCalories) : 0;
  const maxCal = Math.max(...weeklyData.map(d => Math.max(d.calories, d.target)), 1);
  const daysOnTrack = weeklyData.filter(d => d.calories > 0 && d.calories <= d.target * 1.1).length;

  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="lg:max-w-5xl lg:mx-auto">
          <h1 className="m3-title-large">{t.progress}</h1>
          <p className="m3-body-medium opacity-80 mt-1">{t.trackJourney}</p>
        </div>
      </div>

      <div className="px-6 py-4 m3-stagger lg:max-w-5xl lg:mx-auto lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="m3-card-elevated rounded-[20px] p-4">
            <Scale size={18} className="text-blue-500 mb-2" />
            <p className="m3-headline-small font-bold m3-on-surface">{bmi.toFixed(1)}</p>
            <p className="m3-label-small m3-on-surface-variant">{t.bmi} · {t[bmiCat]}</p>
          </div>
          <div className="m3-card-elevated rounded-[20px] p-4">
            <Target size={18} className="m3-primary-text mb-2" />
            <p className="m3-headline-small font-bold m3-on-surface">{info.target}</p>
            <p className="m3-label-small m3-on-surface-variant">{t.dailyTarget} ({t.kcal})</p>
          </div>
          <div className="m3-card-elevated rounded-[20px] p-4">
            <TrendingUp size={18} className="text-orange-500 mb-2" />
            <p className="m3-headline-small font-bold m3-on-surface">{avgCalories || '-'}</p>
            <p className="m3-label-small m3-on-surface-variant">{t.avgDaily} ({t.kcal})</p>
          </div>
          <div className="m3-card-elevated rounded-[20px] p-4">
            <Activity size={18} className="text-purple-500 mb-2" />
            <p className="m3-headline-small font-bold m3-on-surface">{daysOnTrack}</p>
            <p className="m3-label-small m3-on-surface-variant">{t.daysOnTrack}</p>
          </div>
        </div>

        <div className="m3-segment-group mb-4">
          <button onClick={() => setPeriod('week')} className={`m3-segment ${period === 'week' ? 'm3-segment-active' : ''}`}>{t.week}</button>
          <button onClick={() => setPeriod('month')} className={`m3-segment ${period === 'month' ? 'm3-segment-active' : ''}`}>{t.month}</button>
        </div>

        <div className="m3-card rounded-[20px] p-4 mb-6">
          <h3 className="m3-title-medium m3-on-surface mb-4">{t.calorieIntake}</h3>
          <div className="flex items-end gap-1 h-40">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full flex flex-col items-center justify-end flex-1 relative">
                  <div className="absolute w-full border-t border-dashed border-[var(--m3-primary-container)]" style={{ bottom: `${(d.target / maxCal) * 100}%` }} />
                  <div className={`w-full max-w-[20px] rounded-t-md transition-all duration-500 ${d.calories > d.target ? 'bg-[var(--m3-error)]' : d.calories > 0 ? 'bg-[var(--m3-primary)]' : 'bg-[var(--m3-surface-container-high)]'}`}
                    style={{ height: `${Math.max((d.calories / maxCal) * 100, 2)}%` }} />
                </div>
                <span className="m3-label-small m3-outline-text mt-1">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[var(--m3-primary)] rounded-sm" /> <span className="m3-label-small m3-on-surface-variant">{t.underTarget}</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[var(--m3-error)] rounded-sm" /> <span className="m3-label-small m3-on-surface-variant">{t.overTarget}</span></div>
            <div className="flex items-center gap-1"><div className="w-6 border-t border-dashed border-[var(--m3-primary)]" /> <span className="m3-label-small m3-on-surface-variant">{t.target}</span></div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="m3-card rounded-[20px] p-4 mb-6 lg:mb-0">
          <h3 className="m3-title-medium m3-on-surface mb-3">{t.bodyInformation}</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="m3-body-medium m3-on-surface-variant">{t.weight}</span><span className="m3-label-large m3-on-surface">{user.weight} kg</span></div>
            <div className="flex justify-between"><span className="m3-body-medium m3-on-surface-variant">{t.height}</span><span className="m3-label-large m3-on-surface">{user.height} cm</span></div>
            <div className="flex justify-between"><span className="m3-body-medium m3-on-surface-variant">BMR</span><span className="m3-label-large m3-on-surface">{Math.round(info.bmr)} {t.kcal}</span></div>
            <div className="flex justify-between"><span className="m3-body-medium m3-on-surface-variant">TDEE</span><span className="m3-label-large m3-on-surface">{Math.round(info.tdee)} {t.kcal}</span></div>
            <div className="flex justify-between"><span className="m3-body-medium m3-on-surface-variant">{t.goal}</span><span className="m3-label-large m3-on-surface capitalize">{user.goal === 'lose' ? t.loseWeight : user.goal === 'gain' ? t.gainWeight : t.maintainWeight}</span></div>
          </div>
        </div>

        <div className="m3-card rounded-[20px] p-4 mb-6 lg:mb-0">
          <h3 className="m3-title-medium m3-on-surface mb-3">{t.dailyMacroTargets}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="m3-surface-container-high rounded-2xl p-3">
              <p className="m3-title-large font-bold text-blue-500">{info.macros.protein}g</p>
              <p className="m3-label-small m3-on-surface-variant">{t.protein}</p>
            </div>
            <div className="m3-surface-container-high rounded-2xl p-3">
              <p className="m3-title-large font-bold text-orange-500">{info.macros.carbs}g</p>
              <p className="m3-label-small m3-on-surface-variant">{t.carbs}</p>
            </div>
            <div className="m3-surface-container-high rounded-2xl p-3">
              <p className="m3-title-large font-bold text-yellow-500">{info.macros.fat}g</p>
              <p className="m3-label-small m3-on-surface-variant">{t.fat}</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
