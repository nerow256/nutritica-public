'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 10,
  color,
  label,
  sublabel,
}: ProgressRingProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(Math.max(percentage, 0), 150);
  const offset = circumference - (animatedPct / 100) * circumference;

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimatedPct(clamped));
    return () => cancelAnimationFrame(timer);
  }, [clamped]);

  const getColor = () => {
    if (color) return color;
    if (clamped > 100) return 'var(--m3-error)';
    if (clamped > 85) return '#eab308';
    return 'var(--m3-primary)';
  };

  const gradientId = `ring-grad-${size}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getColor()} stopOpacity="1" />
            <stop offset="100%" stopColor={getColor()} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-[var(--m3-surface-container-highest)]"
          fill="none" strokeLinecap="round"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke={`url(#${gradientId})`}
          fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.05,0.7,0.1,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {label && <span className="m3-headline-small font-bold m3-on-surface">{label}</span>}
        {sublabel && <span className="m3-label-small m3-on-surface-variant">{sublabel}</span>}
      </div>
    </div>
  );
}
