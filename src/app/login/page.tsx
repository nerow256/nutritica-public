'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { dbLogin, setSession, isLoggedIn } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t.fillAllFields);
      return;
    }
    setLoading(true);
    try {
      const user = await dbLogin(email, password);
      setSession(user.id);
      localStorage.setItem('dhc_user_role', user.role);
      router.push(user.role === 'doctor' ? '/provider' : '/dashboard');
    } catch (err) {
      setError((err as Error).message || t.invalidCredentials);
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
          <h1 className="m3-headline-small font-bold m3-on-surface">{t.welcomeBack}</h1>
          <p className="m3-body-medium m3-on-surface-variant mt-1">{t.signInSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="m3-error-container m3-body-medium p-3 rounded-2xl">{error}</div>
          )}

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
                placeholder={t.enterPassword}
                className="m3-input pr-11"
              />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 m3-outline-text hover:m3-on-surface-variant transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(t.passwordResetSent)}
            className="m3-label-large m3-primary-text hover:underline"
          >
            {t.forgotPassword}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full m3-btn-filled py-3.5 disabled:opacity-60"
          >
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>

        <p className="text-center m3-body-medium m3-on-surface-variant mt-6">
          {t.noAccount}{' '}
          <Link href="/register" className="m3-primary-text m3-label-large hover:underline">{t.signUp}</Link>
        </p>
      </div>
    </div>
  );
}
