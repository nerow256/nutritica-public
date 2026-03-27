'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Mail, Info } from 'lucide-react';
import { isLoggedIn } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';
import type { Translations } from '@/lib/i18n';

type FaqItem = { q: keyof Translations; a: keyof Translations };

const faqItems: FaqItem[] = [
  { q: 'faqTrackMeals', a: 'faqTrackMealsAnswer' },
  { q: 'faqChangeGoals', a: 'faqChangeGoalsAnswer' },
  { q: 'faqAiChat', a: 'faqAiChatAnswer' },
  { q: 'faqExercise', a: 'faqExerciseAnswer' },
  { q: 'faqLanguage', a: 'faqLanguageAnswer' },
  { q: 'faqDataSafe', a: 'faqDataSafeAnswer' },
];

export default function HelpPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen m3-surface">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="m3-title-large">{t.helpTitle}</h1>
            <p className="m3-label-small opacity-80">{t.helpSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-2xl mx-auto space-y-5">
        {/* FAQ */}
        <div className="m3-card rounded-[20px] overflow-hidden">
          <div className="px-5 py-4 border-b m3-border">
            <h2 className="m3-title-medium text-[var(--m3-on-surface)]">{t.faqSection}</h2>
          </div>
          <div>
            {faqItems.map((item, i) => (
              <div key={i} className={`border-b m3-border last:border-b-0 ${openIndex === i ? 'm3-surface-container-low' : ''}`}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="m3-body-large text-[var(--m3-on-surface)] pr-4">{t[item.q]}</span>
                  <ChevronDown
                    size={18}
                    className={`m3-outline-text flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-60 pb-4' : 'max-h-0'}`}>
                  <p className="m3-body-medium text-[var(--m3-on-surface-variant)] px-5">{t[item.a]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="m3-card rounded-[20px] overflow-hidden">
          <div className="m3-list-item !border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--m3-primary-container)] flex items-center justify-center">
                <Mail size={18} className="text-[var(--m3-on-primary-container)]" />
              </div>
              <div>
                <p className="m3-body-large text-[var(--m3-on-surface)]">{t.contactSupport}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.contactSupportDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="m3-card rounded-[20px] overflow-hidden">
          <div className="m3-list-item !border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl m3-surface-container-high flex items-center justify-center">
                <Info size={18} className="m3-on-surface-variant" />
              </div>
              <div>
                <p className="m3-body-large text-[var(--m3-on-surface)]">{t.appVersion}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)]">Nutritica v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
