'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getSessionUserId, dbUpdateUser } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const activityLevels = [
    { value: 'sedentary', label: t.sedentary, desc: t.sedentaryDesc },
    { value: 'light', label: t.lightlyActive, desc: t.lightlyActiveDesc },
    { value: 'moderate', label: t.moderatelyActive, desc: t.moderatelyActiveDesc },
    { value: 'active', label: t.veryActive, desc: t.veryActiveDesc },
    { value: 'veryActive', label: t.extraActive, desc: t.extraActiveDesc },
  ];

  const goals = [
    { value: 'lose', label: t.loseWeight, icon: '📉' },
    { value: 'maintain', label: t.maintainWeight, icon: '⚖️' },
    { value: 'gain', label: t.gainWeight, icon: '📈' },
  ];

  const healthConditionsList = [
    { value: 'None', label: t.none },
    { value: 'Diabetes', label: t.diabetes },
    { value: 'Heart Disease', label: t.heartDisease },
    { value: 'High Blood Pressure', label: t.highBloodPressure },
    { value: 'Allergies', label: t.allergies },
  ];
  const dietaryRestrictionsList = [
    { value: 'None', label: t.none },
    { value: 'Vegetarian', label: t.vegetarian },
    { value: 'Vegan', label: t.vegan },
    { value: 'Gluten-Free', label: t.glutenFree },
    { value: 'Lactose Intolerant', label: t.lactoseIntolerant },
    { value: 'Halal', label: t.halal },
    { value: 'Kosher', label: t.kosher },
  ];
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (item === 'None') {
      setList(['None']);
      return;
    }
    const filtered = list.filter(i => i !== 'None');
    if (filtered.includes(item)) {
      setList(filtered.filter(i => i !== item));
    } else {
      setList([...filtered, item]);
    }
  };

  const handleComplete = async () => {
    const userId = getSessionUserId();
    if (!userId) return;
    try {
      await dbUpdateUser(userId, {
        gender,
        age: parseInt(age) || 25,
        height: parseInt(height) || 170,
        weight: parseInt(weight) || 70,
        activityLevel,
        goal,
        healthConditions: healthConditions.filter(h => h !== 'None'),
        dietaryRestrictions: dietaryRestrictions.filter(d => d !== 'None'),
      });
      router.push('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen m3-surface px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-sm lg:max-w-lg lg:m3-card-elevated lg:rounded-[28px] lg:p-8 lg:mt-8 m3-animate-enter">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-500 ease-[cubic-bezier(0.05,0.7,0.1,1)] ${
              s === step
                ? 'w-8 bg-[var(--m3-primary)]'
                : s < step
                  ? 'w-8 bg-[var(--m3-primary-container)]'
                  : 'w-3 bg-[var(--m3-outline-variant)]'
            }`} />
          ))}
        </div>

        {step === 1 && (
          <div className="m3-container-transform">
            <h2 className="m3-headline-small font-bold m3-on-surface mb-2">{t.basicInfo}</h2>
            <p className="m3-body-medium m3-on-surface-variant mb-6">{t.basicInfoSubtitle}</p>

            <div className="mb-5">
              <label className="block m3-label-large m3-on-surface-variant mb-2">{t.gender}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`py-3.5 rounded-2xl m3-label-large transition-all duration-300 ${
                      gender === g
                        ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] m3-elevation-2'
                        : 'm3-surface-container-low m3-on-surface border border-[var(--m3-outline-variant)]'
                    }`}>
                    {g === 'male' ? `👨 ${t.male}` : `👩 ${t.female}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.age}</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25"
                className="m3-input" />
            </div>

            <div className="mb-4">
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.heightCm}</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170"
                className="m3-input" />
            </div>

            <div className="mb-4">
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.weightKg}</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70"
                className="m3-input" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="m3-container-transform">
            <h2 className="m3-headline-small font-bold m3-on-surface mb-2">{t.yourGoals}</h2>
            <p className="m3-body-medium m3-on-surface-variant mb-6">{t.yourGoalsSubtitle}</p>

            <div className="mb-6">
              <label className="block m3-label-large m3-on-surface-variant mb-3">{t.goal}</label>
              <div className="space-y-3">
                {goals.map(g => (
                  <button key={g.value} onClick={() => setGoal(g.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                      goal === g.value
                        ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] m3-elevation-2'
                        : 'm3-surface-container-low m3-on-surface border border-[var(--m3-outline-variant)]'
                    }`}>
                    <span className="text-2xl">{g.icon}</span>
                    <span className="m3-label-large">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block m3-label-large m3-on-surface-variant mb-3">{t.activityLevel}</label>
              <div className="space-y-2">
                {activityLevels.map(a => (
                  <button key={a.value} onClick={() => setActivityLevel(a.value)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-300 ${
                      activityLevel === a.value
                        ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] m3-elevation-2'
                        : 'm3-surface-container-low m3-on-surface border border-[var(--m3-outline-variant)]'
                    }`}>
                    <div className="m3-label-large">{a.label}</div>
                    <div className={`m3-label-small ${
                      activityLevel === a.value
                        ? 'opacity-80'
                        : 'm3-outline-text'
                    }`}>{a.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="m3-container-transform">
            <h2 className="m3-headline-small font-bold m3-on-surface mb-2">{t.healthInfo}</h2>
            <p className="m3-body-medium m3-on-surface-variant mb-6">{t.healthInfoSubtitle}</p>

            <div className="mb-6">
              <label className="block m3-label-large m3-on-surface-variant mb-3">{t.healthConditions}</label>
              <div className="flex flex-wrap gap-2">
                {healthConditionsList.map(h => (
                  <button key={h.value} onClick={() => toggleItem(healthConditions, setHealthConditions, h.value)}
                    className={healthConditions.includes(h.value) ? 'm3-chip-selected' : 'm3-chip'}>
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block m3-label-large m3-on-surface-variant mb-3">{t.dietaryRestrictions}</label>
              <div className="flex flex-wrap gap-2">
                {dietaryRestrictionsList.map(d => (
                  <button key={d.value} onClick={() => toggleItem(dietaryRestrictions, setDietaryRestrictions, d.value)}
                    className={dietaryRestrictions.includes(d.value) ? 'm3-chip-selected' : 'm3-chip'}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 m3-btn-outlined py-3.5">
              {t.back}
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              className="flex-1 m3-btn-filled py-3.5">
              {t.next}
            </button>
          ) : (
            <button onClick={handleComplete}
              className="flex-1 m3-btn-filled py-3.5">
              {t.completeSetup}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
