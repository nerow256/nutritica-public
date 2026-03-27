'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Leaf, Activity, Sparkles } from 'lucide-react';
import { isLoggedIn } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/dashboard');
      return;
    }
    setMounted(true);
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated gradient background */}
      <div className="!absolute inset-0 m3-gradient-header" />

      {/* Floating decorative orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-white/[0.07] m3-animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[45%] right-[5%] w-24 h-24 rounded-full bg-white/[0.05] m3-animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[25%] left-[20%] w-16 h-16 rounded-full bg-white/[0.06] m3-animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[20%] w-20 h-20 rounded-full bg-white/[0.04] m3-animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* App icon */}
        <div className="relative mb-10">
          <div className="w-28 h-28 rounded-[32px] flex items-center justify-center m3-elevation-4 backdrop-blur-sm overflow-hidden">
            <Image src="/logo.png" alt="Nutritica" width={112} height={112} className="object-cover" priority />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--m3-primary-container)] rounded-full flex items-center justify-center m3-elevation-2 m3-animate-pulse">
            <Sparkles size={14} className="text-[var(--m3-on-primary-container)]" />
          </div>
        </div>

        {/* Title & subtitle */}
        <h1 className="m3-display-small font-bold text-white text-center mb-3 text-balance whitespace-pre-line">
          {t.landingTitle}
        </h1>
        <p className="text-white/75 m3-body-large text-center mb-12 max-w-sm lg:max-w-lg mx-auto text-balance leading-relaxed lg:text-base">
          {t.landingSubtitle}
        </p>

        {/* Feature pills */}
        <div className={`flex flex-wrap justify-center gap-2.5 mb-12 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-2 border border-white/10">
            <Leaf size={14} className="text-white/90" />
            <span className="text-white/90 m3-label-medium">{t.smartTracking}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-2 border border-white/10">
            <Activity size={14} className="text-white/90" />
            <span className="text-white/90 m3-label-medium">{t.aiInsights}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-2 border border-white/10">
            <Heart size={14} className="text-white/90" />
            <span className="text-white/90 m3-label-medium">{t.healthGoals}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`w-full max-w-xs space-y-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link
            href="/register"
            className="block w-full bg-white text-[var(--m3-gradient-start)] m3-label-large py-4 rounded-full m3-elevation-3 hover:m3-elevation-4 transition-all text-center font-bold active:scale-[0.97]"
          >
            {t.getStarted}
          </Link>
          <Link
            href="/login"
            className="block w-full border-2 border-white/60 text-white m3-label-large py-3.5 rounded-full hover:bg-white/10 active:bg-white/15 transition-all text-center"
          >
            {t.signIn}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className={`pb-8 text-center relative z-10 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-white/40 m3-label-medium">{t.landingTagline}</p>
      </div>
    </div>
  );
}
