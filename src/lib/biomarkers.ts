// Biomarker simulation engine for connected health devices
// Generates realistic health data with natural variation

export interface BiomarkerReading {
  timestamp: string;
  value: number;
  unit: string;
  deviceId: string;
}

export interface DeviceReading {
  heartRate: number;
  steps: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodGlucose: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  sleepHours: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical';
  biomarker: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  dismissed: boolean;
}

export interface DailyBiomarkerLog {
  date: string;
  heartRateAvg: number;
  heartRateMin: number;
  heartRateMax: number;
  steps: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodGlucose: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  sleepHours: number;
  caloriesBurnedPassive: number;
}

// Normal ranges for biomarkers
export const BIOMARKER_RANGES = {
  heartRate: { min: 55, max: 100, unit: 'bpm', criticalLow: 40, criticalHigh: 150, warningHigh: 120 },
  steps: { min: 0, max: 25000, unit: 'steps', dailyGoal: 10000 },
  bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg', criticalHigh: 180, warningHigh: 140 },
  bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg', criticalHigh: 120, warningHigh: 90 },
  bloodGlucose: { min: 70, max: 140, unit: 'mg/dL', criticalHigh: 300, criticalLow: 54, warningHigh: 180, warningLow: 70 },
  oxygenSaturation: { min: 95, max: 100, unit: '%', criticalLow: 90, warningLow: 94 },
  bodyTemperature: { min: 36.1, max: 37.2, unit: '°C', criticalHigh: 39.5, warningHigh: 37.8 },
  sleepHours: { min: 6, max: 9, unit: 'hrs' },
} as const;

// Seed-based pseudo-random for reproducible data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function gaussianRandom(mean: number, stdDev: number, seed: number): number {
  const u1 = seededRandom(seed);
  const u2 = seededRandom(seed + 1);
  const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Generate daily biomarker data for a given date
export function generateDailyData(dateStr: string, userWeight: number, userAge: number, userHeight?: number, isFaultSimulation?: boolean): DailyBiomarkerLog {
  const safeWeight = Math.max(userWeight || 70, 20);
  const safeAge = Math.max(userAge || 25, 1);
  const safeHeight = Math.max(userHeight || 170, 50);
  const dateSeed = new Date(dateStr).getTime() / 86400000;

  // Age-adjusted resting heart rate (older = slightly higher)
  const baseHR = 68 + (safeAge - 30) * 0.15;
  const hrAvg = Math.round(gaussianRandom(baseHR, 5, dateSeed));
  const hrMin = Math.round(Math.max(45, hrAvg - gaussianRandom(15, 3, dateSeed + 10)));
  const hrMax = Math.round(Math.min(180, hrAvg + gaussianRandom(40, 10, dateSeed + 20)));

  // Steps with day-of-week variation (weekends fewer steps)
  const dayOfWeek = new Date(dateStr).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseSteps = isWeekend ? 6000 : 8500;
  let steps = Math.round(Math.max(0, gaussianRandom(baseSteps, 2500, dateSeed + 30)));

  // Fault simulation: impossibly high steps
  if (isFaultSimulation && seededRandom(dateSeed + 999) > 0.85) {
    steps = Math.round(gaussianRandom(1000000, 100000, dateSeed + 999));
  }

  // Blood pressure - slightly correlated with age
  const bpSysBase = 115 + (safeAge - 30) * 0.3;
  const bpSystolic = Math.round(gaussianRandom(bpSysBase, 8, dateSeed + 40));
  const bpDiastolic = Math.round(gaussianRandom(75, 5, dateSeed + 50));

  // Blood glucose - fasting range, with some post-meal spikes
  const glucose = Math.round(gaussianRandom(95, 15, dateSeed + 60));

  // O2 saturation - normally very stable
  const o2 = Math.round(Math.min(100, gaussianRandom(97.5, 1, dateSeed + 70)) * 10) / 10;

  // Body temperature
  const temp = Math.round(gaussianRandom(36.6, 0.3, dateSeed + 80) * 10) / 10;

  // Sleep hours
  const sleep = Math.round(gaussianRandom(isWeekend ? 8 : 7, 0.8, dateSeed + 90) * 10) / 10;

  // Passive calories burned (BMR spread across the day + activity)
  const bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5;
  const passiveCals = Math.round(bmr + steps * 0.04);

  return {
    date: dateStr,
    heartRateAvg: Math.max(50, Math.min(120, hrAvg)),
    heartRateMin: Math.max(40, hrMin),
    heartRateMax: Math.min(200, hrMax),
    steps: Math.max(0, steps),
    bloodPressureSystolic: Math.max(80, Math.min(200, bpSystolic)),
    bloodPressureDiastolic: Math.max(50, Math.min(130, bpDiastolic)),
    bloodGlucose: Math.max(60, Math.min(300, glucose)),
    oxygenSaturation: Math.max(88, Math.min(100, o2)),
    bodyTemperature: Math.max(35.5, Math.min(40, temp)),
    sleepHours: Math.max(2, Math.min(12, sleep)),
    caloriesBurnedPassive: passiveCals,
  };
}

// Generate historical data for N days
export function generateHistoricalData(days: number, userWeight: number, userAge: number, userHeight?: number, faultSimulation: boolean = false): DailyBiomarkerLog[] {
  const data: DailyBiomarkerLog[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    data.push(generateDailyData(dateStr, userWeight, userAge, userHeight, faultSimulation));
  }
  return data;
}

// Check for alerts on current readings
export function checkAlerts(reading: DailyBiomarkerLog): Omit<Alert, 'id' | 'dismissed'>[] {
  const alerts: Omit<Alert, 'id' | 'dismissed'>[] = [];
  const R = BIOMARKER_RANGES;

  // Heart rate alerts
  if (reading.heartRateMax >= R.heartRate.criticalHigh) {
    alerts.push({ type: 'critical', biomarker: 'heartRate', message: 'criticalHeartRateHigh', value: reading.heartRateMax, threshold: R.heartRate.criticalHigh, timestamp: reading.date });
  } else if (reading.heartRateMax >= R.heartRate.warningHigh) {
    alerts.push({ type: 'warning', biomarker: 'heartRate', message: 'warningHeartRateHigh', value: reading.heartRateMax, threshold: R.heartRate.warningHigh, timestamp: reading.date });
  }
  if (reading.heartRateMin <= R.heartRate.criticalLow) {
    alerts.push({ type: 'critical', biomarker: 'heartRate', message: 'criticalHeartRateLow', value: reading.heartRateMin, threshold: R.heartRate.criticalLow, timestamp: reading.date });
  }

  // Blood pressure alerts
  if (reading.bloodPressureSystolic >= R.bloodPressureSystolic.criticalHigh) {
    alerts.push({ type: 'critical', biomarker: 'bloodPressure', message: 'criticalBPHigh', value: reading.bloodPressureSystolic, threshold: R.bloodPressureSystolic.criticalHigh, timestamp: reading.date });
  } else if (reading.bloodPressureSystolic >= R.bloodPressureSystolic.warningHigh) {
    alerts.push({ type: 'warning', biomarker: 'bloodPressure', message: 'warningBPHigh', value: reading.bloodPressureSystolic, threshold: R.bloodPressureSystolic.warningHigh, timestamp: reading.date });
  }

  // Blood glucose alerts
  if (reading.bloodGlucose >= R.bloodGlucose.criticalHigh) {
    alerts.push({ type: 'critical', biomarker: 'bloodGlucose', message: 'criticalGlucoseHigh', value: reading.bloodGlucose, threshold: R.bloodGlucose.criticalHigh, timestamp: reading.date });
  } else if (reading.bloodGlucose >= R.bloodGlucose.warningHigh) {
    alerts.push({ type: 'warning', biomarker: 'bloodGlucose', message: 'warningGlucoseHigh', value: reading.bloodGlucose, threshold: R.bloodGlucose.warningHigh, timestamp: reading.date });
  }
  if (reading.bloodGlucose <= R.bloodGlucose.criticalLow) {
    alerts.push({ type: 'critical', biomarker: 'bloodGlucose', message: 'criticalGlucoseLow', value: reading.bloodGlucose, threshold: R.bloodGlucose.criticalLow, timestamp: reading.date });
  }

  // O2 saturation alerts
  if (reading.oxygenSaturation <= R.oxygenSaturation.criticalLow) {
    alerts.push({ type: 'critical', biomarker: 'oxygenSaturation', message: 'criticalO2Low', value: reading.oxygenSaturation, threshold: R.oxygenSaturation.criticalLow, timestamp: reading.date });
  } else if (reading.oxygenSaturation <= R.oxygenSaturation.warningLow) {
    alerts.push({ type: 'warning', biomarker: 'oxygenSaturation', message: 'warningO2Low', value: reading.oxygenSaturation, threshold: R.oxygenSaturation.warningLow, timestamp: reading.date });
  }

  // Temperature alerts
  if (reading.bodyTemperature >= R.bodyTemperature.criticalHigh) {
    alerts.push({ type: 'critical', biomarker: 'bodyTemperature', message: 'criticalTempHigh', value: reading.bodyTemperature, threshold: R.bodyTemperature.criticalHigh, timestamp: reading.date });
  } else if (reading.bodyTemperature >= R.bodyTemperature.warningHigh) {
    alerts.push({ type: 'warning', biomarker: 'bodyTemperature', message: 'warningTempHigh', value: reading.bodyTemperature, threshold: R.bodyTemperature.warningHigh, timestamp: reading.date });
  }

  // Fault detection: impossible step count
  if (reading.steps > 100000) {
    alerts.push({ type: 'critical', biomarker: 'steps', message: 'faultStepsImpossible', value: reading.steps, threshold: 100000, timestamp: reading.date });
  }

  return alerts;
}

// Generate real-time heart rate (fluctuating value)
export function getLiveHeartRate(baseHR: number): number {
  const variation = Math.sin(Date.now() / 2000) * 3 + (Math.random() - 0.5) * 4;
  return Math.round(Math.max(50, Math.min(130, baseHR + variation)));
}

// Daily summary report
export interface DailySummary {
  date: string;
  biomarkers: DailyBiomarkerLog;
  alerts: Omit<Alert, 'id' | 'dismissed'>[];
  stepsGoalMet: boolean;
  sleepAdequate: boolean;
  bpNormal: boolean;
  glucoseNormal: boolean;
  overallScore: number; // 0-100 health score
}

export function getDailySummary(data: DailyBiomarkerLog): DailySummary {
  const alerts = checkAlerts(data);
  const stepsGoalMet = data.steps >= BIOMARKER_RANGES.steps.dailyGoal;
  const sleepAdequate = data.sleepHours >= 6 && data.sleepHours <= 9;
  const bpNormal = data.bloodPressureSystolic <= 140 && data.bloodPressureDiastolic <= 90;
  const glucoseNormal = data.bloodGlucose >= 70 && data.bloodGlucose <= 140;

  // Calculate health score
  let score = 100;
  if (!stepsGoalMet) score -= 10;
  if (!sleepAdequate) score -= 10;
  if (!bpNormal) score -= 15;
  if (!glucoseNormal) score -= 15;
  alerts.forEach(a => { score -= a.type === 'critical' ? 20 : 10; });
  score = Math.max(0, Math.min(100, score));

  return {
    date: data.date,
    biomarkers: data,
    alerts,
    stepsGoalMet,
    sleepAdequate,
    bpNormal,
    glucoseNormal,
    overallScore: score,
  };
}
