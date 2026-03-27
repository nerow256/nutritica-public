'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Stethoscope, User } from 'lucide-react';
import Link from 'next/link';
import { isLoggedIn, getSessionUserId, dbGetUser, dbUpdateUser } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useLanguage();

  const activityLevels = [
    { value: 'sedentary', label: t.sedentary },
    { value: 'light', label: t.lightlyActive },
    { value: 'moderate', label: t.moderatelyActive },
    { value: 'active', label: t.veryActive },
    { value: 'veryActive', label: t.extraActive },
  ];

  const goalOptions = [
    { value: 'lose', label: t.loseWeight },
    { value: 'maintain', label: t.maintainWeight },
    { value: 'gain', label: t.gainWeight },
  ];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [healthConditions, setHealthConditions] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [role, setRole] = useState('patient');
  const [specialty, setSpecialty] = useState('');
  const [saved, setSaved] = useState(false);
  const [memberSince, setMemberSince] = useState('');

  const userId = getSessionUserId();

  useEffect(() => {
    if (!isLoggedIn() || !userId) { router.push('/login'); return; }
    (async () => {
      try {
        const u = await dbGetUser(userId);
        setName(u.name || '');
        setEmail(u.email || '');
        setAge(u.age?.toString() || '');
        setHeight(u.height?.toString() || '');
        setWeight(u.weight?.toString() || '');
        setGender(u.gender || 'male');
        setActivityLevel(u.activityLevel || 'moderate');
        setGoal(u.goal || 'maintain');
        setHealthConditions((u.healthConditions || []).join(', '));
        setDietaryRestrictions((u.dietaryRestrictions || []).join(', '));
        setRole(u.role || 'patient');
        setSpecialty(u.specialty || '');
        if (u.createdAt) {
          setMemberSince(new Date(u.createdAt).toLocaleDateString(locale, { month: 'long', year: 'numeric' }));
        }
      } catch {}
    })();
  }, [router, userId]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      await dbUpdateUser(userId, {
        name,
        email,
        age: parseInt(age) || 25,
        height: parseInt(height) || 170,
        weight: parseInt(weight) || 70,
        gender,
        activityLevel,
        goal,
        role,
        specialty: role === 'doctor' ? specialty : '',
        healthConditions: healthConditions.split(',').map(s => s.trim()).filter(Boolean),
        dietaryRestrictions: dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
      });
      localStorage.setItem('dhc_user_role', role);
      if (role === 'doctor') localStorage.setItem('dhc_user_specialty', specialty);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen m3-surface pb-8 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-16 rounded-b-[32px] lg:rounded-b-none lg:px-8">
        <div className="lg:max-w-4xl lg:mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors"><ArrowLeft size={24} /></Link>
            <h1 className="m3-title-large">{t.profile}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center m3-headline-small font-bold">
              {name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="m3-title-large font-bold">{name || 'User'}</p>
                {role === 'doctor' && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide">
                    {t.doctor || 'Doctor'}
                  </span>
                )}
              </div>
              <p className="m3-body-medium opacity-70">
                {role === 'doctor' && specialty ? `${
                  ({ general: t.generalPractitioner, cardiology: t.cardiology, endocrinology: t.endocrinology, nutrition: t.nutritionist, internal: t.internalMedicine, sports: t.sportsMedicine, psychiatry: t.psychiatry, pediatrics: t.pediatrics, other: t.otherSpecialty } as Record<string, string>)[specialty] || specialty
                } · ` : ''}
                {t.memberSince} {memberSince || t.recently}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 lg:max-w-4xl lg:mx-auto lg:px-8">
        <div className="m3-card-elevated rounded-[28px] p-6 m3-animate-enter">
          <h3 className="m3-title-medium m3-on-surface mb-4">{t.personalInfo}</h3>

          {/* Role selector */}
          <div className="mb-5">
            <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.iAmA || 'I am a'}</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('patient')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === 'patient' ? 'border-[var(--m3-primary)] bg-[var(--m3-primary-container)]' : 'border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]'
                }`}>
                <User size={28} className={role === 'patient' ? 'text-[var(--m3-on-primary-container)]' : 'text-[var(--m3-on-surface-variant)]'} />
                <span className={`m3-label-large ${role === 'patient' ? 'text-[var(--m3-on-primary-container)]' : 'text-[var(--m3-on-surface-variant)]'}`}>{t.patient || 'Patient'}</span>
              </button>
              <button type="button" onClick={() => setRole('doctor')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === 'doctor' ? 'border-[var(--m3-primary)] bg-[var(--m3-primary-container)]' : 'border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]'
                }`}>
                <Stethoscope size={28} className={role === 'doctor' ? 'text-[var(--m3-on-primary-container)]' : 'text-[var(--m3-on-surface-variant)]'} />
                <span className={`m3-label-large ${role === 'doctor' ? 'text-[var(--m3-on-primary-container)]' : 'text-[var(--m3-on-surface-variant)]'}`}>{t.doctor || 'Doctor'}</span>
              </button>
            </div>
          </div>

          {role === 'doctor' && (
            <div className="mb-5">
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.specialty || 'Specialty'}</label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="m3-input">
                <option value="">{t.selectSpecialty || 'Select your specialty...'}</option>
                <option value="general">{t.generalPractitioner || 'General Practitioner'}</option>
                <option value="cardiology">{t.cardiology || 'Cardiology'}</option>
                <option value="endocrinology">{t.endocrinology || 'Endocrinology'}</option>
                <option value="nutrition">{t.nutritionist || 'Nutrition / Dietetics'}</option>
                <option value="internal">{t.internalMedicine || 'Internal Medicine'}</option>
                <option value="sports">{t.sportsMedicine || 'Sports Medicine'}</option>
                <option value="psychiatry">{t.psychiatry || 'Psychiatry'}</option>
                <option value="pediatrics">{t.pediatrics || 'Pediatrics'}</option>
                <option value="other">{t.otherSpecialty || 'Other'}</option>
              </select>
            </div>
          )}

          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <div>
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.fullName}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="m3-input" />
            </div>
            <div>
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="m3-input" />
            </div>
          </div>

          {/* Patient-only fields */}
          {role !== 'doctor' && (
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.age}</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} className="m3-input" />
                </div>
                <div>
                  <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.gender}</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="m3-input">
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.heightCm}</label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="m3-input" />
                </div>
                <div>
                  <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.weightKg}</label>
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="m3-input" />
                </div>
              </div>
              <div>
                <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.activityLevel}</label>
                <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="m3-input">
                  {activityLevels.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.goal}</label>
                <select value={goal} onChange={e => setGoal(e.target.value)} className="m3-input">
                  {goalOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.healthConditions}</label>
                <input type="text" value={healthConditions} onChange={e => setHealthConditions(e.target.value)}
                  placeholder={t.healthConditionsPlaceholder} className="m3-input" />
              </div>
              <div>
                <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.dietaryRestrictions}</label>
                <input type="text" value={dietaryRestrictions} onChange={e => setDietaryRestrictions(e.target.value)}
                  placeholder={t.dietaryRestrictionsPlaceholder} className="m3-input" />
              </div>
            </div>
          )}

          <button onClick={handleSave} className="w-full mt-6 m3-btn-filled py-3.5">
            <Save size={18} />
            {saved ? '✓' : t.save}
          </button>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 lg:bottom-8">
          <div className="m3-snackbar">{t.save} ✓</div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
