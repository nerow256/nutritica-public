'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, BarChart3, Mail, Settings, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Translations } from '@/lib/i18n';

type Tab = { href: string; labelKey: keyof Translations; icon: typeof Home; noFill?: boolean };

const patientTabs: Tab[] = [
  { href: '/dashboard', labelKey: 'home', icon: Home },
  { href: '/diary', labelKey: 'diary', icon: BookOpen },
  { href: '/chatbot', labelKey: 'aiChat', icon: MessageCircle },
  { href: '/progress', labelKey: 'progress', icon: BarChart3, noFill: true },
  { href: '/messages', labelKey: 'messagesNav', icon: Mail },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

const doctorTabs: Tab[] = [
  { href: '/provider', labelKey: 'home', icon: Stethoscope },
  { href: '/chatbot', labelKey: 'aiChat', icon: MessageCircle },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('dhc_user_role'));
  }, []);

  const tabs = role === 'doctor' ? doctorTabs : patientTabs;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 m3-glass m3-elevation-2">
        <div className="max-w-lg mx-auto flex justify-around items-center h-20 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={t[tab.labelKey] as string}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 group"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive
                    ? 'm3-nav-indicator scale-100'
                    : 'bg-transparent scale-90 group-hover:bg-[var(--m3-on-surface)]/[0.06]'
                }`}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    fill={isActive && !tab.noFill ? 'currentColor' : 'none'}
                    className={`transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isActive
                        ? 'text-[var(--m3-on-secondary-container)]'
                        : 'text-[var(--m3-on-surface-variant)]'
                    }`}
                  />
                </div>
                <span className={`text-xs transition-all duration-300 ${
                  isActive
                    ? 'text-[var(--m3-on-surface)] font-semibold'
                    : 'text-[var(--m3-on-surface-variant)] font-medium'
                }`}>
                  {t[tab.labelKey]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop side navigation rail */}
      <nav className="desktop-nav fixed left-0 top-0 bottom-0 z-50 w-20 flex flex-col items-center py-6 gap-2 m3-surface-container border-r border-[var(--m3-outline-variant)]">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
          <img src="/logo.png" alt="Nutritica" width={48} height={48} className="object-cover" />
        </div>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={t[tab.labelKey] as string}
              className="flex flex-col items-center justify-center w-full py-1 gap-1 group"
            >
              <div className={`flex items-center justify-center w-14 h-8 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isActive
                  ? 'm3-nav-indicator scale-100'
                  : 'bg-transparent scale-90 group-hover:bg-[var(--m3-on-surface)]/[0.08]'
              }`}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  fill={isActive ? 'currentColor' : 'none'}
                  className={`transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isActive
                      ? 'text-[var(--m3-on-secondary-container)]'
                      : 'text-[var(--m3-on-surface-variant)]'
                  }`}
                />
              </div>
              <span className={`text-[0.6875rem] transition-all duration-300 ${
                isActive
                  ? 'text-[var(--m3-on-surface)] font-semibold'
                  : 'text-[var(--m3-on-surface-variant)] font-medium'
              }`}>
                {t[tab.labelKey]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
