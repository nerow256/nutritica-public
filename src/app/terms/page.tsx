'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Shield, HeartPulse, UserCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function TermsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const sections = [
    { icon: FileText, title: t.termsAcceptance, desc: t.termsAcceptanceDesc, container: 'bg-[var(--m3-primary-container)]', iconClass: 'text-[var(--m3-on-primary-container)]' },
    { icon: Shield, title: t.termsUse, desc: t.termsUseDesc, container: 'bg-[var(--m3-secondary-container)]', iconClass: 'text-[var(--m3-on-secondary-container)]' },
    { icon: HeartPulse, title: t.termsHealth, desc: t.termsHealthDesc, container: 'bg-[var(--m3-error-container)]', iconClass: 'text-[var(--m3-error)]' },
    { icon: UserCheck, title: t.termsAccount, desc: t.termsAccountDesc, container: 'bg-[var(--m3-tertiary-container)]', iconClass: 'text-[var(--m3-on-tertiary-container)]' },
    { icon: RefreshCw, title: t.termsChanges, desc: t.termsChangesDesc, container: 'bg-[var(--m3-surface-container-highest)]', iconClass: 'text-[var(--m3-on-surface-variant)]' },
  ];

  return (
    <div className="min-h-screen m3-surface">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="m3-title-large">{t.termsTitle}</h1>
            <p className="m3-label-small opacity-80">{t.termsSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-2xl mx-auto space-y-5">
        <div className="m3-card rounded-[20px] overflow-hidden">
          <div className="p-4 space-y-4">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.container} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={s.iconClass} />
                  </div>
                  <div>
                    <p className="m3-label-large text-[var(--m3-on-surface)]">{s.title}</p>
                    <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
