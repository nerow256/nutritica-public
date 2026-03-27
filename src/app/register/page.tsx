'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Stethoscope, User } from 'lucide-react';
import { dbRegister, setSession } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [specialty, setSpecialty] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: '', key: '' };
    if (password.length < 6) return { label: t.passwordWeak, color: 'bg-[var(--m3-error)]', key: 'weak' };
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return { label: t.passwordMedium, color: 'bg-yellow-500', key: 'medium' };
    return { label: t.passwordStrong, color: 'bg-[var(--m3-primary)]', key: 'strong' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError(t.fillAllFields);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsNoMatch);
      return;
    }
    if (password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }
    if (!agreed) {
      setError(t.agreeTermsError);
      return;
    }

    setLoading(true);
    try {
      const user = await dbRegister(email, password, name, role, specialty);
      setSession(user.id);
      localStorage.setItem('dhc_user_role', role);
      if (role === 'doctor') localStorage.setItem('dhc_user_specialty', specialty);
      router.push(role === 'doctor' ? '/provider' : '/onboarding');
    } catch (err) {
      setError((err as Error).message || t.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen m3-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm lg:max-w-md lg:m3-card-elevated lg:rounded-[28px] lg:p-8 m3-animate-enter">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src="/logo.png" alt="Nutritica" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="m3-headline-small font-bold m3-on-surface">{t.createAccount}</h1>
          <p className="m3-body-medium m3-on-surface-variant mt-1">{t.createAccountSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="m3-error-container m3-body-medium p-3 rounded-2xl">{error}</div>
          )}

          <div>
            <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.iAmA}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === 'patient'
                    ? 'border-[var(--m3-primary)] m3-primary-container'
                    : 'border-[var(--m3-outline-variant)] m3-surface-container'
                }`}
              >
                <User size={28} className={role === 'patient' ? 'm3-on-primary-container' : 'm3-on-surface-variant'} />
                <span className={`m3-label-large ${role === 'patient' ? 'm3-on-primary-container' : 'm3-on-surface-variant'}`}>{t.patient}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === 'doctor'
                    ? 'border-[var(--m3-primary)] m3-primary-container'
                    : 'border-[var(--m3-outline-variant)] m3-surface-container'
                }`}
              >
                <Stethoscope size={28} className={role === 'doctor' ? 'm3-on-primary-container' : 'm3-on-surface-variant'} />
                <span className={`m3-label-large ${role === 'doctor' ? 'm3-on-primary-container' : 'm3-on-surface-variant'}`}>{t.doctor}</span>
              </button>
            </div>
          </div>

          {role === 'doctor' && (
            <div>
              <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.specialty || 'Specialty'}</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="m3-input"
              >
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

          <div>
            <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.fullName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.enterName}
              className="m3-input"
            />
          </div>

          <div>
            <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.enterEmail}
              className="m3-input"
            />
          </div>

          <div>
            <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.password}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.createPassword}
                className="m3-input pr-11"
              />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 m3-outline-text hover:m3-on-surface-variant transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {strength.label && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden m3-surface-container-highest">
                  <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                    style={{ width: strength.key === 'weak' ? '33%' : strength.key === 'medium' ? '66%' : '100%' }} />
                </div>
                <span className="m3-label-small m3-on-surface-variant">{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.confirmPassword}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmYourPassword}
              className="m3-input"
            />
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="m3-checkbox mt-0.5 cursor-pointer" />
            <span className="m3-body-medium m3-on-surface-variant">
              {t.agreeTerms.split('Terms of Service').length > 1 || t.agreeTerms.split('Условия использования').length > 1 ? (
                <>
                  {t.agreeTerms.split(/(Terms of Service|Privacy Policy|Условия использования|Политику конфиденциальности)/g).map((part, i) =>
                    part === 'Terms of Service' || part === 'Условия использования' ? (
                      <a key={i} href="/terms" target="_blank" rel="noopener noreferrer" className="m3-primary-text hover:underline">{part}</a>
                    ) : part === 'Privacy Policy' || part === 'Политику конфиденциальности' ? (
                      <a key={i} href="/privacy" target="_blank" rel="noopener noreferrer" className="m3-primary-text hover:underline">{part}</a>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </>
              ) : t.agreeTerms}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full m3-btn-filled py-3.5 disabled:opacity-60"
          >
            {loading ? t.creating : t.createAccount}
          </button>
        </form>

        <p className="text-center m3-body-medium m3-on-surface-variant mt-6">
          {t.hasAccount}{' '}
          <Link href="/login" className="m3-primary-text m3-label-large hover:underline">{t.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
