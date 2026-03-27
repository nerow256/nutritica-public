'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, Heart, Watch, Scale, Smartphone, Info,
  Droplets, Thermometer, Moon, Footprints, AlertTriangle, AlertCircle,
  X, Award, Share2, Bell,
  ShieldCheck, Zap, Wind
} from 'lucide-react';
import { isLoggedIn, getSessionUserId, dbGetUser, type DbUser } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';
import type { Translations } from '@/lib/i18n';
import BottomNav from '@/components/BottomNav';
import {
  generateHistoricalData, generateDailyData, checkAlerts, getLiveHeartRate,
  getDailySummary, BIOMARKER_RANGES,
  type DailyBiomarkerLog, type DailySummary
} from '@/lib/biomarkers';

// ── Device config ──
interface DeviceConfig {
  id: string;
  nameKey: keyof Translations;
  descKey: keyof Translations;
  icon: typeof Activity;
  colorClass: string;
  iconColorClass: string;
  biomarkers: string[];
}

const devices: DeviceConfig[] = [
  { id: 'fitness_watch', nameKey: 'fitnessWatch', descKey: 'fitnessWatchDesc', icon: Watch, colorClass: 'bg-orange-100 dark:bg-orange-500/20', iconColorClass: 'text-orange-500', biomarkers: ['heartRate', 'steps', 'oxygenSaturation', 'sleep'] },
  { id: 'bp_monitor', nameKey: 'bpMonitor', descKey: 'bpMonitorDesc', icon: Activity, colorClass: 'bg-red-100 dark:bg-red-500/20', iconColorClass: 'text-red-500', biomarkers: ['bloodPressure'] },
  { id: 'glucose_monitor', nameKey: 'glucoseMonitor', descKey: 'glucoseMonitorDesc', icon: Droplets, colorClass: 'bg-blue-100 dark:bg-blue-500/20', iconColorClass: 'text-blue-500', biomarkers: ['bloodGlucose'] },
  { id: 'smart_scale', nameKey: 'smartScale', descKey: 'smartScaleDesc', icon: Scale, colorClass: 'bg-purple-100 dark:bg-purple-500/20', iconColorClass: 'text-purple-500', biomarkers: ['weight', 'bodyTemperature'] },
  { id: 'google_fit', nameKey: 'googleFit', descKey: 'googleFitDesc', icon: Smartphone, colorClass: 'bg-green-100 dark:bg-green-500/20', iconColorClass: 'text-green-500', biomarkers: ['steps', 'heartRate'] },
];

const STORAGE_KEY = 'dhc_connected_devices';
type DeviceStates = Record<string, { connected: boolean; lastSynced: string | null }>;

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '< 1m';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ── Mini chart component ──
function MiniChart({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Bar chart component ──
function BarChart({ data, labels, color, maxVal }: { data: number[]; labels: string[]; color: string; maxVal?: number }) {
  const mx = maxVal || Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="w-full flex flex-col items-center justify-end flex-1">
            <div className={`w-full max-w-[16px] rounded-t-sm transition-all duration-300 ${color}`} style={{ height: `${Math.max((v / mx) * 100, 2)}%` }} />
          </div>
          <span className="m3-label-small text-[var(--m3-outline)] mt-1 text-[10px]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function DevicesPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [user, setUser] = useState<DbUser | null>(null);
  const [states, setStates] = useState<DeviceStates>({});
  const [tab, setTab] = useState<'devices' | 'biomarkers' | 'alerts' | 'summary'>('biomarkers');
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [historicalData, setHistoricalData] = useState<DailyBiomarkerLog[]>([]);
  const [todayData, setTodayData] = useState<DailyBiomarkerLog | null>(null);
  const [liveHR, setLiveHR] = useState(72);
  const [faultSimulation, setFaultSimulation] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [shareMsg, setShareMsg] = useState('');

  // Load user and device states
  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const userId = getSessionUserId();
    if (!userId) return;
    (async () => {
      try {
        const u = await dbGetUser(userId);
        setUser(u);
        // Auto-connect all devices for demo
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setStates(JSON.parse(saved));
        } else {
          const initial: DeviceStates = {};
          devices.forEach(d => { initial[d.id] = { connected: true, lastSynced: new Date().toISOString() }; });
          setStates(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch { router.push('/login'); }
    })();
  }, [router]);

  // Generate biomarker data when user loads or period/fault changes
  useEffect(() => {
    if (!user) return;
    const days = period === 'week' ? 7 : 30;
    const data = generateHistoricalData(days, user.weight, user.age, user.height, faultSimulation);
    setHistoricalData(data);
    const today = new Date().toISOString().split('T')[0];
    const td = generateDailyData(today, user.weight, user.age, user.height, faultSimulation);
    setTodayData(td);
    setSummary(getDailySummary(td));
  }, [user, period, faultSimulation]);

  // Live heart rate simulation
  useEffect(() => {
    if (!todayData) return;
    const iv = setInterval(() => setLiveHR(getLiveHeartRate(todayData.heartRateAvg)), 1500);
    return () => clearInterval(iv);
  }, [todayData]);

  const toggleDevice = useCallback((id: string) => {
    setStates(prev => {
      const current = prev[id];
      const next: DeviceStates = {
        ...prev,
        [id]: current?.connected
          ? { connected: false, lastSynced: null }
          : { connected: true, lastSynced: new Date().toISOString() },
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, []);

  const connectedCount = Object.values(states).filter(s => s.connected).length;
  const alerts = todayData ? checkAlerts(todayData) : [];
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  const handleShare = useCallback(() => {
    if (!summary) return;
    const text = `My Health Score: ${summary.overallScore}/100 | Steps: ${summary.biomarkers.steps} | HR: ${summary.biomarkers.heartRateAvg} bpm | BP: ${summary.biomarkers.bloodPressureSystolic}/${summary.biomarkers.bloodPressureDiastolic} mmHg — via Nutritica`;
    if (navigator.share) {
      navigator.share({ title: 'My Health Summary', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShareMsg(t.dataExported || 'Copied!');
        setTimeout(() => setShareMsg(''), 2000);
      });
    }
  }, [summary, t]);

  if (!user || !todayData) return (
    <div className="min-h-screen m3-surface flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[var(--m3-primary)] border-t-transparent rounded-full" />
    </div>
  );

  // Chart data
  const hrData = historicalData.map(d => d.heartRateAvg);
  const stepsData = historicalData.map(d => d.steps);
  const bpSysData = historicalData.map(d => d.bloodPressureSystolic);
  const bpDiaData = historicalData.map(d => d.bloodPressureDiastolic);
  const glucoseData = historicalData.map(d => d.bloodGlucose);
  const o2Data = historicalData.map(d => d.oxygenSaturation);
  const sleepData = historicalData.map(d => d.sleepHours);
  const chartLabels = historicalData.map(d => {
    const dt = new Date(d.date);
    return period === 'week' ? dt.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2) : `${dt.getDate()}`;
  });

  // Gamification
  const stepsStreak = (() => {
    let streak = 0;
    for (let i = historicalData.length - 1; i >= 0; i--) {
      if (historicalData[i].steps >= BIOMARKER_RANGES.steps.dailyGoal) streak++;
      else break;
    }
    return streak;
  })();

  const badges: { icon: typeof Award; label: string; earned: boolean; color: string }[] = [
    { icon: Footprints, label: t.badge10kSteps || '10K Steps', earned: todayData.steps >= 10000, color: 'text-green-500' },
    { icon: Heart, label: t.badgeHealthyHR || 'Healthy Heart', earned: todayData.heartRateAvg >= 55 && todayData.heartRateAvg <= 85, color: 'text-red-500' },
    { icon: Moon, label: t.badgeGoodSleep || 'Good Sleep', earned: todayData.sleepHours >= 7 && todayData.sleepHours <= 9, color: 'text-indigo-500' },
    { icon: Zap, label: t.badgeActiveWeek || 'Active Week', earned: stepsStreak >= 5, color: 'text-orange-500' },
    { icon: ShieldCheck, label: t.badgeNormalBP || 'Normal BP', earned: todayData.bloodPressureSystolic <= 130 && todayData.bloodPressureDiastolic <= 85, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      {/* Header */}
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="lg:max-w-5xl lg:mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="m3-title-large">{t.devicesTitle}</h1>
              <p className="m3-label-small opacity-80">{connectedCount} {t.devicesConnected || 'devices connected'}</p>
            </div>
            {alerts.length > 0 && (
              <div className="relative">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">{alerts.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-4 pt-3 lg:max-w-5xl lg:mx-auto relative">
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {(['biomarkers', 'devices', 'alerts', 'summary'] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-4 py-2 rounded-full m3-label-medium whitespace-nowrap transition-all ${tab === tb ? 'bg-[var(--m3-primary)] text-white' : 'bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)]'}`}>
              {tb === 'biomarkers' ? (t.biomarkers || 'Biomarkers') :
               tb === 'devices' ? (t.devicesTab || 'Devices') :
               tb === 'alerts' ? `${t.alertsTab || 'Alerts'} (${alerts.length})` :
               (t.dailySummaryReport || 'Summary')}
            </button>
          ))}
        </div>
        <div className="absolute right-4 top-3 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-[var(--m3-surface)] to-transparent lg:hidden" />
      </div>

      <div className="px-5 py-4 max-w-5xl mx-auto lg:px-8">

        {/* ═══════ BIOMARKERS TAB ═══════ */}
        {tab === 'biomarkers' && (
          <div className="space-y-4">
            {/* Period toggle */}
            <div className="m3-segment-group">
              <button onClick={() => setPeriod('week')} className={`m3-segment ${period === 'week' ? 'm3-segment-active' : ''}`}>{t.week}</button>
              <button onClick={() => setPeriod('month')} className={`m3-segment ${period === 'month' ? 'm3-segment-active' : ''}`}>{t.month}</button>
            </div>

            {/* Live heart rate */}
            <div className="m3-card-elevated rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart size={20} className="text-red-500" />
                  <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.heartRate || 'Heart Rate'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
                  <span className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.live || 'Live'}</span>
                </div>
              </div>
              <div className="flex items-end gap-4">
                <p className="text-4xl font-bold text-red-500">{liveHR}</p>
                <p className="m3-label-medium text-[var(--m3-on-surface-variant)] pb-1">bpm</p>
              </div>
              <div className="mt-3 flex gap-4 text-center">
                <div><p className="m3-label-small text-[var(--m3-outline)]">{t.minLabel || 'Min'}</p><p className="m3-body-medium text-[var(--m3-on-surface)]">{todayData.heartRateMin}</p></div>
                <div><p className="m3-label-small text-[var(--m3-outline)]">{t.avgLabel || 'Avg'}</p><p className="m3-body-medium text-[var(--m3-on-surface)]">{todayData.heartRateAvg}</p></div>
                <div><p className="m3-label-small text-[var(--m3-outline)]">{t.maxLabel || 'Max'}</p><p className="m3-body-medium text-[var(--m3-on-surface)]">{todayData.heartRateMax}</p></div>
              </div>
              <div className="mt-3">
                <MiniChart data={hrData} color="#ef4444" />
              </div>
            </div>

            {/* Steps */}
            <div className="m3-card-elevated rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Footprints size={20} className="text-green-500" />
                  <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.stepsLabel || 'Steps'}</h3>
                </div>
                {todayData.steps >= BIOMARKER_RANGES.steps.dailyGoal && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 m3-label-small">{t.goalReached || 'Goal reached!'}</span>
                )}
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-4xl font-bold text-green-500">{todayData.steps > 100000 ? '⚠️ ' : ''}{todayData.steps.toLocaleString()}</p>
                <p className="m3-label-medium text-[var(--m3-on-surface-variant)] pb-1">/ {BIOMARKER_RANGES.steps.dailyGoal.toLocaleString()}</p>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-[var(--m3-surface-container-highest)] overflow-hidden mb-3">
                <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${Math.min((todayData.steps / BIOMARKER_RANGES.steps.dailyGoal) * 100, 100)}%` }} />
              </div>
              {todayData.steps > 100000 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-500/10 mb-3">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="m3-label-small text-red-600 dark:text-red-400">{t.faultDetected || 'Fault detected: impossible step count. Device may be malfunctioning.'}</span>
                </div>
              )}
              <BarChart data={stepsData} labels={chartLabels} color="bg-green-500" maxVal={Math.max(...stepsData.filter(s => s < 100000), BIOMARKER_RANGES.steps.dailyGoal)} />
            </div>

            {/* Blood Pressure */}
            <div className="m3-card-elevated rounded-[20px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={20} className="text-red-600" />
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.bloodPressureLabel || 'Blood Pressure'}</h3>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-bold text-[var(--m3-on-surface)]">{todayData.bloodPressureSystolic}/{todayData.bloodPressureDiastolic}</p>
                <p className="m3-label-medium text-[var(--m3-on-surface-variant)] pb-0.5">mmHg</p>
              </div>
              <p className={`m3-label-small mb-3 ${todayData.bloodPressureSystolic <= 120 ? 'text-green-500' : todayData.bloodPressureSystolic <= 140 ? 'text-orange-500' : 'text-red-500'}`}>
                {todayData.bloodPressureSystolic <= 120 ? (t.bpNormalLabel || 'Normal') : todayData.bloodPressureSystolic <= 140 ? (t.bpElevated || 'Elevated') : (t.bpHigh || 'High')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="m3-label-small text-[var(--m3-outline)] mb-1">{t.systolic || 'Systolic'}</p>
                  <MiniChart data={bpSysData} color="#dc2626" />
                </div>
                <div>
                  <p className="m3-label-small text-[var(--m3-outline)] mb-1">{t.diastolic || 'Diastolic'}</p>
                  <MiniChart data={bpDiaData} color="#2563eb" />
                </div>
              </div>
            </div>

            {/* Blood Glucose */}
            <div className="m3-card-elevated rounded-[20px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={20} className="text-blue-500" />
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.bloodGlucoseLabel || 'Blood Glucose'}</h3>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-bold text-blue-500">{todayData.bloodGlucose}</p>
                <p className="m3-label-medium text-[var(--m3-on-surface-variant)] pb-0.5">mg/dL</p>
              </div>
              <p className={`m3-label-small mb-3 ${todayData.bloodGlucose >= 70 && todayData.bloodGlucose <= 140 ? 'text-green-500' : 'text-orange-500'}`}>
                {todayData.bloodGlucose >= 70 && todayData.bloodGlucose <= 140 ? (t.glucoseNormalLabel || 'Normal range') : (t.glucoseOutOfRange || 'Outside normal range')}
              </p>
              <MiniChart data={glucoseData} color="#3b82f6" />
            </div>

            {/* O2 Saturation & Temperature side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="m3-card-elevated rounded-[20px] p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wind size={16} className="text-cyan-500" />
                  <span className="m3-label-medium text-[var(--m3-on-surface)]">SpO2</span>
                </div>
                <p className="text-2xl font-bold text-cyan-500">{todayData.oxygenSaturation}%</p>
                <div className="mt-2"><MiniChart data={o2Data} color="#06b6d4" height={32} /></div>
              </div>
              <div className="m3-card-elevated rounded-[20px] p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Thermometer size={16} className="text-orange-500" />
                  <span className="m3-label-medium text-[var(--m3-on-surface)]">{t.temperature || 'Temp'}</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">{todayData.bodyTemperature}°C</p>
                <p className={`m3-label-small mt-1 ${todayData.bodyTemperature <= 37.2 ? 'text-green-500' : 'text-orange-500'}`}>
                  {todayData.bodyTemperature <= 37.2 ? (t.tempNormal || 'Normal') : (t.tempElevated || 'Elevated')}
                </p>
              </div>
            </div>

            {/* Sleep */}
            <div className="m3-card-elevated rounded-[20px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Moon size={20} className="text-indigo-500" />
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.sleepLabel || 'Sleep'}</h3>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-3xl font-bold text-indigo-500">{todayData.sleepHours}</p>
                <p className="m3-label-medium text-[var(--m3-on-surface-variant)] pb-0.5">{t.hours || 'hours'}</p>
              </div>
              <BarChart data={sleepData} labels={chartLabels} color="bg-indigo-500" maxVal={12} />
            </div>

            {/* Gamification: Badges */}
            <div className="m3-card rounded-[20px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award size={20} className="text-yellow-500" />
                <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.achievements || 'Achievements'}</h3>
              </div>
              {stepsStreak > 0 && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10">
                  <span className="text-lg">🔥</span>
                  <span className="m3-label-medium text-orange-600 dark:text-orange-400">{stepsStreak} {t.dayStreak || 'day step streak!'}</span>
                </div>
              )}
              <div className="grid grid-cols-5 gap-2">
                {badges.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className={`flex flex-col items-center p-2 rounded-xl transition-all ${b.earned ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${b.earned ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-gray-100 dark:bg-gray-500/20'}`}>
                        <Icon size={20} className={b.earned ? b.color : 'text-gray-400'} />
                      </div>
                      <span className="m3-label-small text-center text-[10px] leading-tight text-[var(--m3-on-surface-variant)]">{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ DEVICES TAB ═══════ */}
        {tab === 'devices' && (
          <div className="space-y-4">
            <div className="flex gap-3 p-4 rounded-2xl bg-[var(--m3-primary-container)]/30 border border-[var(--m3-outline-variant)]">
              <Info size={18} className="text-[var(--m3-primary)] flex-shrink-0 mt-0.5" />
              <p className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.devicesNote}</p>
            </div>

            <div className="m3-card rounded-[20px] overflow-hidden">
              {devices.map((device, i) => {
                const Icon = device.icon;
                const state = states[device.id];
                const isConnected = state?.connected ?? false;
                return (
                  <div key={device.id} className={`p-4 flex items-center gap-3 ${i < devices.length - 1 ? 'border-b m3-border' : ''}`}>
                    <div className={`w-11 h-11 rounded-xl ${device.colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={device.iconColorClass} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m3-body-large text-[var(--m3-on-surface)]">{String(t[device.nameKey])}</p>
                      <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{String(t[device.descKey])}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`m3-label-small ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-[var(--m3-on-surface-variant)]'}`}>
                          {isConnected ? t.connected : t.disconnected}
                        </span>
                        {isConnected && state?.lastSynced && (
                          <span className="m3-label-small text-[var(--m3-on-surface-variant)]">· {t.lastSynced} {getRelativeTime(state.lastSynced)}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => toggleDevice(device.id)}
                      className={`relative w-[52px] h-[32px] p-0 border-0 rounded-full transition-colors flex-shrink-0 cursor-pointer ${isConnected ? 'bg-[var(--m3-primary)]' : 'bg-[var(--m3-on-surface-variant)]/40'}`}>
                      <span className={`block absolute top-[4px] left-[4px] w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${isConnected ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Fault simulation toggle */}
            <div className="m3-card rounded-[20px] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="m3-body-large text-[var(--m3-on-surface)]">{t.faultSimulationLabel || 'Fault Simulation'}</p>
                  <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.faultSimulationDesc || 'Simulate device malfunctions (e.g. impossible step counts)'}</p>
                </div>
                <button onClick={() => setFaultSimulation(!faultSimulation)}
                  className={`relative w-[52px] h-[32px] p-0 border-0 rounded-full transition-colors flex-shrink-0 cursor-pointer ${faultSimulation ? 'bg-[var(--m3-error)]' : 'bg-[var(--m3-on-surface-variant)]/40'}`}>
                  <span className={`block absolute top-[4px] left-[4px] w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${faultSimulation ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <p className="text-center m3-label-small text-[var(--m3-on-surface-variant)] opacity-60">{t.simulatedConnection}</p>
          </div>
        )}

        {/* ═══════ ALERTS TAB ═══════ */}
        {tab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck size={48} className="text-green-500 mx-auto mb-3" />
                <p className="m3-title-medium text-[var(--m3-on-surface)]">{t.noAlerts || 'All Clear!'}</p>
                <p className="m3-body-medium text-[var(--m3-on-surface-variant)]">{t.noAlertsDesc || 'All biomarkers are within normal ranges.'}</p>
              </div>
            ) : (
              <>
                {criticalAlerts.length > 0 && (
                  <div>
                    <h3 className="m3-label-large text-red-500 mb-2 flex items-center gap-1"><AlertCircle size={16} /> {t.criticalAlerts || 'Critical'}</h3>
                    {criticalAlerts.map((a, i) => (
                      <div key={i} className="m3-card rounded-[16px] p-4 mb-2 border-l-4 border-red-500">
                        <p className="m3-body-medium text-[var(--m3-on-surface)]">{t[a.message as keyof Translations] || a.message}</p>
                        <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.value || 'Value'}: {a.value} | {t.threshold || 'Threshold'}: {a.threshold}</p>
                      </div>
                    ))}
                  </div>
                )}
                {warningAlerts.length > 0 && (
                  <div>
                    <h3 className="m3-label-large text-orange-500 mb-2 flex items-center gap-1"><AlertTriangle size={16} /> {t.warningAlerts || 'Warnings'}</h3>
                    {warningAlerts.map((a, i) => (
                      <div key={i} className="m3-card rounded-[16px] p-4 mb-2 border-l-4 border-orange-500">
                        <p className="m3-body-medium text-[var(--m3-on-surface)]">{t[a.message as keyof Translations] || a.message}</p>
                        <p className="m3-label-small text-[var(--m3-on-surface-variant)]">{t.value || 'Value'}: {a.value} | {t.threshold || 'Threshold'}: {a.threshold}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Alert automation info */}
            <div className="m3-card rounded-[20px] p-4">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-2">{t.automationRules || 'Automation Rules'}</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2"><Heart size={14} className="text-red-500 mt-0.5 flex-shrink-0" /><span className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.ruleHR || 'Alert when heart rate exceeds 120 bpm or drops below 40 bpm'}</span></div>
                <div className="flex items-start gap-2"><Activity size={14} className="text-red-600 mt-0.5 flex-shrink-0" /><span className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.ruleBP || 'Alert when blood pressure exceeds 140/90 mmHg'}</span></div>
                <div className="flex items-start gap-2"><Droplets size={14} className="text-blue-500 mt-0.5 flex-shrink-0" /><span className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.ruleGlucose || 'Alert when blood glucose is outside 70-180 mg/dL'}</span></div>
                <div className="flex items-start gap-2"><Wind size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" /><span className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.ruleO2 || 'Alert when oxygen saturation drops below 94%'}</span></div>
                <div className="flex items-start gap-2"><AlertTriangle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" /><span className="m3-body-small text-[var(--m3-on-surface-variant)]">{t.ruleFault || 'Detect device faults (e.g. impossible readings)'}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ SUMMARY TAB ═══════ */}
        {tab === 'summary' && summary && (
          <div className="space-y-4">
            {/* Health score */}
            <div className="m3-card-elevated rounded-[20px] p-6 text-center">
              <p className="m3-label-medium text-[var(--m3-on-surface-variant)] mb-2">{t.healthScore || 'Health Score'}</p>
              <div className="relative w-32 h-32 mx-auto mb-3">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="var(--m3-surface-container-highest)" strokeWidth="10" />
                  <circle cx="64" cy="64" r="56" fill="none"
                    stroke={summary.overallScore >= 80 ? '#22c55e' : summary.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(summary.overallScore / 100) * 352} 352`}
                    transform="rotate(-90 64 64)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${summary.overallScore >= 80 ? 'text-green-500' : summary.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{summary.overallScore}</span>
                </div>
              </div>
              <p className={`m3-title-medium ${summary.overallScore >= 80 ? 'text-green-500' : summary.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                {summary.overallScore >= 80 ? (t.scoreExcellent || 'Excellent') : summary.overallScore >= 60 ? (t.scoreGood || 'Good') : (t.scoreNeedsAttention || 'Needs Attention')}
              </p>
            </div>

            {/* Summary checklist */}
            <div className="m3-card rounded-[20px] p-5">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3">{t.todaySummary || "Today's Summary"}</h3>
              <div className="space-y-3">
                {[
                  { label: t.stepsGoal || 'Steps Goal (10,000)', met: summary.stepsGoalMet, value: `${summary.biomarkers.steps.toLocaleString()} steps` },
                  { label: t.sleepGoal || 'Sleep (6-9 hrs)', met: summary.sleepAdequate, value: `${summary.biomarkers.sleepHours} hrs` },
                  { label: t.bpGoal || 'Blood Pressure', met: summary.bpNormal, value: `${summary.biomarkers.bloodPressureSystolic}/${summary.biomarkers.bloodPressureDiastolic}` },
                  { label: t.glucoseGoal || 'Blood Glucose', met: summary.glucoseNormal, value: `${summary.biomarkers.bloodGlucose} mg/dL` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.met ? 'bg-green-500' : 'bg-red-500'}`}>
                        {item.met ? <span className="text-white text-xs">✓</span> : <X size={12} className="text-white" />}
                      </div>
                      <span className="m3-body-medium text-[var(--m3-on-surface)]">{item.label}</span>
                    </div>
                    <span className={`m3-label-medium ${item.met ? 'text-green-500' : 'text-red-500'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="m3-card rounded-[20px] p-5">
              <h3 className="m3-title-medium text-[var(--m3-on-surface)] mb-3">{t.recommendations || 'Recommendations'}</h3>
              <div className="space-y-2">
                {!summary.stepsGoalMet && (
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-green-50 dark:bg-green-500/10">
                    <Footprints size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="m3-body-small text-[var(--m3-on-surface)]">{t.recSteps || `Try a 30-minute walk to reach your step goal. You need ${Math.max(0, 10000 - summary.biomarkers.steps).toLocaleString()} more steps.`}</span>
                  </div>
                )}
                {!summary.sleepAdequate && (
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                    <Moon size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="m3-body-small text-[var(--m3-on-surface)]">{t.recSleep || 'Aim for 7-9 hours of sleep. Consider adjusting your bedtime routine.'}</span>
                  </div>
                )}
                {!summary.bpNormal && (
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-500/10">
                    <Activity size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="m3-body-small text-[var(--m3-on-surface)]">{t.recBP || 'Your blood pressure is elevated. Consider reducing sodium intake and consulting your healthcare provider.'}</span>
                  </div>
                )}
                {summary.overallScore >= 80 && (
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-green-50 dark:bg-green-500/10">
                    <Award size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="m3-body-small text-[var(--m3-on-surface)]">{t.recGreat || 'Great job! Keep up the healthy habits.'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Share button */}
            <button onClick={handleShare} className="w-full m3-card rounded-[20px] p-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <Share2 size={18} className="text-[var(--m3-primary)]" />
              <span className="m3-label-large text-[var(--m3-primary)]">{t.shareResults || 'Share Results'}</span>
            </button>
            {shareMsg && <p className="text-center m3-label-small text-green-500">{shareMsg}</p>}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
