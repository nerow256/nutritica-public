'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import ProgressRing from '@/components/ProgressRing';
import MacroBar from '@/components/MacroBar';
import { getCalorieInfo, calculateBMI, getBMICategory } from '@/lib/calculations';
import { translateFood } from '@/lib/food-translations';
import { UtensilsCrossed, Dumbbell, MessageCircle, Flame, Timer, TrendingUp, ChevronRight, Scale } from 'lucide-react';
import { isLoggedIn, getSessionUserId, clearSession, dbGetUser, dbGetFoodLogs, dbGetExerciseLogs, type DbUser, type DbFoodLog, type DbExerciseLog } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

function DashboardSkeleton() {
  return (
    <div className="min-h-screen m3-surface pb-24 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-10 pb-14 rounded-b-[32px]">
        <div className="lg:max-w-5xl lg:mx-auto">
          <div className="m3-skeleton h-4 w-40 mb-2 !bg-white/20 !rounded-lg" />
          <div className="m3-skeleton h-7 w-56 !bg-white/20 !rounded-lg" />
        </div>
      </div>
      <div className="px-5 -mt-8 lg:max-w-5xl lg:mx-auto">
        <div className="m3-card-elevated rounded-[28px] p-6 mb-5">
          <div className="flex flex-col items-center">
            <div className="m3-skeleton w-40 h-40 !rounded-full" />
            <div className="flex justify-around w-full mt-5 gap-4">
              <div className="m3-skeleton h-12 flex-1 !rounded-xl" />
              <div className="m3-skeleton h-12 flex-1 !rounded-xl" />
              <div className="m3-skeleton h-12 flex-1 !rounded-xl" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="m3-skeleton h-5 w-full !rounded-lg" />
            <div className="m3-skeleton h-5 w-full !rounded-lg" />
            <div className="m3-skeleton h-5 w-full !rounded-lg" />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [user, setUser] = useState<DbUser | null>(null);
  const [foodEntries, setFoodEntries] = useState<DbFoodLog[]>([]);
  const [exerciseEntries, setExerciseEntries] = useState<DbExerciseLog[]>([]);
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiHeight, setBmiHeight] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    const userId = getSessionUserId();
    if (!userId) return;

    (async () => {
      try {
        const u = await dbGetUser(userId);
        if (!u.age || !u.weight || !u.height) {
          router.push('/onboarding');
          return;
        }
        setUser(u);
        const [foods, exercises] = await Promise.all([
          dbGetFoodLogs(userId, today),
          dbGetExerciseLogs(userId, today),
        ]);
        setFoodEntries(foods);
        setExerciseEntries(exercises);
      } catch {
        clearSession();
        router.push('/login');
      }
    })();
  }, [router, today]);

  if (!user) return <DashboardSkeleton />;

  const info = getCalorieInfo(
    user.weight, user.height, user.age,
    user.gender as 'male' | 'female', user.activityLevel, user.goal as 'lose' | 'maintain' | 'gain'
  );

  const consumed = foodEntries.reduce((sum, e) => sum + e.calories, 0);
  const proteinConsumed = foodEntries.reduce((sum, e) => sum + e.protein, 0);
  const carbsConsumed = foodEntries.reduce((sum, e) => sum + e.carbs, 0);
  const fatConsumed = foodEntries.reduce((sum, e) => sum + e.fat, 0);
  const exerciseCals = exerciseEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const exerciseMins = exerciseEntries.reduce((sum, e) => sum + e.duration, 0);
  const remaining = info.target - consumed + exerciseCals;
  const percentage = info.target > 0 ? (consumed / info.target) * 100 : 0;

  const calcW = parseFloat(bmiWeight) || user.weight;
  const calcH = parseFloat(bmiHeight) || user.height;
  const bmi = calculateBMI(calcW, calcH);
  const bmiCategory = getBMICategory(bmi);
  const bmiColor = bmiCategory === 'normal' ? 'text-[var(--m3-primary)]' : bmiCategory === 'underweight' ? 'text-[var(--m3-tertiary)]' : 'text-[var(--m3-error)]';
  const bmiPercent = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);

  const mealLabels: Record<string, string> = { breakfast: t.breakfast, lunch: t.lunch, dinner: t.dinner, snack: t.snack };
  const mealGroups = ['breakfast', 'lunch', 'dinner', 'snack'].map(type => ({
    type,
    label: mealLabels[type],
    entries: foodEntries.filter(e => e.mealType === type),
    total: foodEntries.filter(e => e.mealType === type).reduce((s, e) => s + e.calories, 0),
  }));

  const dateStr = new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;

  return (
    <div className="min-h-screen m3-surface pb-24 desktop-offset">
      {/* Gradient header */}
      <div className="m3-gradient-header text-white px-6 pt-10 pb-14 rounded-b-[32px] lg:rounded-b-none">
        <div className="lg:max-w-5xl lg:mx-auto">
          <p className="m3-label-medium opacity-80">{dateStr}</p>
          <h1 className="m3-headline-small font-bold mt-1 lg:text-[1.75rem] lg:leading-[2.25rem]">{greeting}, {user.name}!</h1>
        </div>
      </div>

      <div className="px-5 -mt-8 m3-stagger lg:max-w-5xl lg:mx-auto lg:-mt-6 lg:px-8">
        {/* Desktop: two-column layout for main content */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
          {/* Left column */}
          <div>
            {/* Main calorie card */}
            <div className="m3-card-elevated rounded-[28px] p-6 pt-8 mb-5 m3-container-transform overflow-hidden">
              <div className="flex flex-col items-center lg:flex-row lg:gap-8 lg:items-start">
                <ProgressRing percentage={percentage} size={140} strokeWidth={12} label={`${Math.round(consumed)}`} sublabel={`of ${info.target} ${t.kcal}`} />
                <div className="w-full">
                  <div className="flex w-full mt-5 lg:mt-0 text-center items-center">
                    <div className="flex-1 flex flex-col items-center">
                      <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.eaten}</p>
                      <p className="m3-title-medium text-[var(--m3-on-surface)]">{Math.round(consumed)}</p>
                    </div>
                    <div className="w-px h-8 bg-[var(--m3-outline-variant)]" />
                    <div className="flex-1 flex flex-col items-center">
                      <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.burned}</p>
                      <p className="m3-title-medium text-[var(--m3-error)]">{Math.round(exerciseCals)}</p>
                    </div>
                    <div className="w-px h-8 bg-[var(--m3-outline-variant)]" />
                    <div className="flex-1 flex flex-col items-center">
                      <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.remaining}</p>
                      <p className={`m3-title-medium ${remaining >= 0 ? 'text-[var(--m3-primary)]' : 'text-[var(--m3-error)]'}`}>{Math.round(remaining)}</p>
                    </div>
                  </div>
                  <div className="mt-6 lg:mt-4">
                    <MacroBar label={t.protein} current={proteinConsumed} target={info.macros.protein} color="bg-blue-500" />
                    <MacroBar label={t.carbs} current={carbsConsumed} target={info.macros.carbs} color="bg-orange-400" />
                    <MacroBar label={t.fat} current={fatConsumed} target={info.macros.fat} color="bg-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Meals */}
            <div className="m3-card rounded-[20px] p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.todaysMeals}</h3>
                <Link href="/diary" className="m3-label-small m3-primary-text flex items-center gap-0.5 hover:underline">
                  {t.viewAll} <ChevronRight size={14} />
                </Link>
              </div>
              {mealGroups.map(group => (
                <div key={group.type} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="m3-label-large text-[var(--m3-on-surface-variant)]">{group.label}</span>
                    <span className="m3-label-small text-[var(--m3-outline)]">{Math.round(group.total)} {t.kcal}</span>
                  </div>
                  {group.entries.length > 0 ? (
                    group.entries.map(entry => (
                      <div key={entry.id} className="flex justify-between items-center py-1.5 pl-3">
                        <span className="m3-body-medium text-[var(--m3-on-surface)]">{translateFood(entry.foodName, locale)} ({entry.amount}g)</span>
                        <span className="m3-body-small text-[var(--m3-outline)]">{Math.round(entry.calories)} {t.kcal}</span>
                      </div>
                    ))
                  ) : (
                    <p className="m3-body-small text-[var(--m3-outline)] pl-3">{t.noEntries}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right column (sidebar on desktop, inline on mobile) */}
          <div>
            {/* Quick actions */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 mb-5">
              <Link href="/diary" className="m3-card-elevated rounded-[20px] p-4 text-center lg:text-left lg:flex lg:items-center lg:gap-3 m3-ripple active:scale-[0.96] transition-transform">
                <div className="w-12 h-12 mx-auto lg:mx-0 mb-2.5 lg:mb-0 rounded-2xl bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed className="text-[var(--m3-on-primary-container)]" size={22} strokeWidth={2} />
                </div>
                <span className="m3-label-medium text-[var(--m3-on-surface)]">{t.logFood}</span>
              </Link>
              <Link href="/exercise" className="m3-card-elevated rounded-[20px] p-4 text-center lg:text-left lg:flex lg:items-center lg:gap-3 m3-ripple active:scale-[0.96] transition-transform">
                <div className="w-12 h-12 mx-auto lg:mx-0 mb-2.5 lg:mb-0 rounded-2xl bg-[var(--m3-tertiary-container)] flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="text-[var(--m3-on-tertiary-container)]" size={22} strokeWidth={2} />
                </div>
                <span className="m3-label-medium text-[var(--m3-on-surface)]">{t.exercise}</span>
              </Link>
              <Link href="/chatbot" className="m3-card-elevated rounded-[20px] p-4 text-center lg:text-left lg:flex lg:items-center lg:gap-3 m3-ripple active:scale-[0.96] transition-transform">
                <div className="w-12 h-12 mx-auto lg:mx-0 mb-2.5 lg:mb-0 rounded-2xl bg-[var(--m3-secondary-container)] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-[var(--m3-on-secondary-container)]" size={22} strokeWidth={2} />
                </div>
                <span className="m3-label-medium text-[var(--m3-on-surface)]">{t.aiChat}</span>
              </Link>
            </div>

            {/* Exercise summary */}
            <div className="m3-card rounded-[20px] p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.exerciseToday}</h3>
                <Link href="/exercise" className="m3-label-small m3-primary-text flex items-center gap-0.5 hover:underline">
                  {t.details} <ChevronRight size={14} />
                </Link>
              </div>
              <div className="flex gap-3 lg:flex-col">
                <div className="flex items-center gap-3 flex-1 m3-surface-container-high rounded-2xl p-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--m3-tertiary-container)] flex items-center justify-center">
                    <Timer size={18} className="text-[var(--m3-on-tertiary-container)]" />
                  </div>
                  <div>
                    <p className="m3-title-medium text-[var(--m3-on-surface)]">{exerciseMins}</p>
                    <p className="m3-label-small text-[var(--m3-outline)]">{t.minutes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 m3-surface-container-high rounded-2xl p-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--m3-error-container)] flex items-center justify-center">
                    <Flame size={18} className="text-[var(--m3-error)]" />
                  </div>
                  <div>
                    <p className="m3-title-medium text-[var(--m3-error)]">{Math.round(exerciseCals)}</p>
                    <p className="m3-label-small text-[var(--m3-outline)]">{t.kcalBurned}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Calculator */}
            <div className="m3-card rounded-[20px] p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.bmiCalculator}</h3>
                <div className="w-10 h-10 rounded-xl bg-[var(--m3-primary-container)] flex items-center justify-center">
                  <Scale size={18} className="text-[var(--m3-on-primary-container)]" />
                </div>
              </div>
              {/* Inputs */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="m3-label-small text-[var(--m3-on-surface-variant)] mb-1 block">{t.weightKg}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={`${user.weight}`}
                    value={bmiWeight}
                    onChange={e => setBmiWeight(e.target.value)}
                    className="w-full m3-surface-container-high rounded-xl px-3 py-2.5 m3-body-medium text-[var(--m3-on-surface)] outline-none border border-[var(--m3-outline-variant)] focus:border-[var(--m3-primary)] transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="m3-label-small text-[var(--m3-on-surface-variant)] mb-1 block">{t.heightCm}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={`${user.height}`}
                    value={bmiHeight}
                    onChange={e => setBmiHeight(e.target.value)}
                    className="w-full m3-surface-container-high rounded-xl px-3 py-2.5 m3-body-medium text-[var(--m3-on-surface)] outline-none border border-[var(--m3-outline-variant)] focus:border-[var(--m3-primary)] transition-colors"
                  />
                </div>
              </div>
              {/* Result */}
              <div className="flex items-end gap-2 mb-3">
                <p className={`text-3xl font-bold ${bmiColor}`}>{bmi.toFixed(1)}</p>
                <p className="m3-label-medium text-[var(--m3-on-surface-variant)] pb-1">{t[bmiCategory]}</p>
              </div>
              {/* BMI scale bar */}
              <div className="relative h-2 rounded-full overflow-hidden bg-[var(--m3-surface-container-highest)]">
                <div className="absolute inset-0 flex">
                  <div className="h-full flex-1 bg-blue-400" />
                  <div className="h-full flex-[2] bg-green-400" />
                  <div className="h-full flex-1 bg-orange-400" />
                  <div className="h-full flex-1 bg-red-400" />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[var(--m3-on-surface)] shadow-sm transition-all duration-300"
                  style={{ left: `clamp(0%, ${bmiPercent}%, 100%)` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="m3-label-small text-[var(--m3-outline)]">18.5</span>
                <span className="m3-label-small text-[var(--m3-outline)]">25</span>
                <span className="m3-label-small text-[var(--m3-outline)]">30</span>
              </div>
            </div>

            {/* Progress link */}
            <Link href="/progress" className="m3-card-elevated rounded-[20px] p-4 mb-5 flex items-center gap-3 m3-ripple">
              <div className="w-10 h-10 rounded-xl bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-[var(--m3-on-primary-container)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m3-label-large text-[var(--m3-on-surface)]">{t.viewProgress}</p>
                <p className="m3-body-small text-[var(--m3-outline)] truncate">{t.viewProgressSubtitle}</p>
              </div>
              <ChevronRight size={18} className="m3-outline-text flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
