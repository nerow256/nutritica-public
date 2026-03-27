'use client';

import { useEffect, useState } from 'react';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

export default function MacroBar({ label, current, target, color }: MacroBarProps) {
  const [animated, setAnimated] = useState(0);
  const exceeded = current > target && target > 0;
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimated(percentage));
    return () => cancelAnimationFrame(timer);
  }, [percentage]);

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="m3-label-large m3-on-surface-variant">{label}</span>
        <span className={`m3-label-medium ${exceeded ? 'text-[var(--m3-error)] font-bold' : 'm3-outline-text'}`}>
          {Math.round(current)}g / {Math.round(target)}g
        </span>
      </div>
      <div className="w-full rounded-full h-2.5 m3-surface-container-highest overflow-hidden">
        <div
          className={`h-full rounded-full ${exceeded ? 'bg-[var(--m3-error)]' : color}`}
          style={{ width: `${animated}%`, transition: 'width 0.8s cubic-bezier(0.05,0.7,0.1,1)' }}
        />
      </div>
    </div>
  );
}
