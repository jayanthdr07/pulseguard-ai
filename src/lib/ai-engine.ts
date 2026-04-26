// AI Engine — Risk scoring, anomaly detection, explainability, prediction
// All runs client-side for privacy-first architecture

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  smoking: boolean;
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  familyHistory: boolean;
  diabetic: boolean;
  systolicBP: number;
  diastolicBP: number;
}

export interface VitalsReading {
  heartRate: number;
  timestamp: number;
  activity: number; // steps/min
  sleepScore: number; // 0-100
  hrv: number; // ms
  spo2: number; // %
  stressLevel: number; // 0-100
}

export interface RiskScore {
  score: number; // 0-100
  category: "low" | "moderate" | "high" | "critical";
  factors: RiskFactor[];
  confidence: number;
}

export interface RiskFactor {
  name: string;
  contribution: number; // -100 to 100 (positive = increases risk)
  value: string;
  trend: "up" | "down" | "stable";
  icon: string;
}

export interface AnomalyEvent {
  type: "tachycardia" | "bradycardia" | "irregular_rhythm" | "hrv_drop" | "bp_spike" | "spo2_low";
  severity: "warning" | "critical";
  timestamp: number;
  details: string;
  heartRate?: number;
}

export interface PredictionScenario {
  label: string;
  description: string;
  riskIn7Days: number;
  riskIn30Days: number;
  riskIn90Days: number;
  color: string;
  actionItems: string[];
}

// ---- RISK SCORING ENGINE ----
export function computeRiskScore(profile: UserProfile, vitals: VitalsReading): RiskScore {
  const factors: RiskFactor[] = [];
  let totalRisk = 0;

  // Age factor
  let ageFactor = 0;
  if (profile.age >= 65) ageFactor = 25;
  else if (profile.age >= 55) ageFactor = 18;
  else if (profile.age >= 45) ageFactor = 12;
  else if (profile.age >= 35) ageFactor = 6;
  else ageFactor = 2;
  totalRisk += ageFactor;
  factors.push({
    name: "Age Risk",
    contribution: ageFactor,
    value: `${profile.age} years`,
    trend: "stable",
    icon: "🧬",
  });

  // Heart rate factor
  const hrRisk = computeHRRisk(vitals.heartRate);
  totalRisk += hrRisk.value;
  factors.push({
    name: hrRisk.label,
    contribution: hrRisk.value,
    value: `${Math.round(vitals.heartRate)} bpm`,
    trend: vitals.heartRate > 90 ? "up" : vitals.heartRate < 55 ? "down" : "stable",
    icon: "💓",
  });

  // HRV factor
  const hrvRisk = vitals.hrv < 20 ? 15 : vitals.hrv < 35 ? 8 : vitals.hrv < 50 ? 3 : -5;
  totalRisk += Math.max(0, hrvRisk);
  factors.push({
    name: "Heart Rate Variability",
    contribution: hrvRisk,
    value: `${Math.round(vitals.hrv)} ms HRV`,
    trend: vitals.hrv < 30 ? "down" : "stable",
    icon: "📊",
  });

  // Smoking
  if (profile.smoking) {
    totalRisk += 20;
    factors.push({ name: "Active Smoker", contribution: 20, value: "Smoking detected", trend: "up", icon: "🚬" });
  }

  // Family history
  if (profile.familyHistory) {
    totalRisk += 12;
    factors.push({ name: "Family History", contribution: 12, value: "Hereditary risk", trend: "stable", icon: "🧬" });
  }

  // Activity
  const actRisk =
    profile.activityLevel === "sedentary" ? 14 :
    profile.activityLevel === "light" ? 7 :
    profile.activityLevel === "moderate" ? 2 : -3;
  totalRisk += Math.max(0, actRisk);
  factors.push({
    name: "Activity Level",
    contribution: actRisk,
    value: profile.activityLevel,
    trend: actRisk > 5 ? "down" : "stable",
    icon: "🏃",
  });

  // Blood pressure
  const bpRisk = computeBPRisk(profile.systolicBP, profile.diastolicBP);
  totalRisk += bpRisk.value;
  factors.push({
    name: "Blood Pressure",
    contribution: bpRisk.value,
    value: `${profile.systolicBP}/${profile.diastolicBP} mmHg`,
    trend: bpRisk.value > 10 ? "up" : "stable",
    icon: "🩺",
  });

  // Sleep
  const sleepRisk = vitals.sleepScore < 40 ? 12 : vitals.sleepScore < 60 ? 7 : vitals.sleepScore < 75 ? 3 : -2;
  totalRisk += Math.max(0, sleepRisk);
  factors.push({
    name: "Sleep Quality",
    contribution: sleepRisk,
    value: `${vitals.sleepScore}/100 score`,
    trend: vitals.sleepScore < 50 ? "down" : "stable",
    icon: "😴",
  });

  // SpO2
  if (vitals.spo2 < 94) {
    const spo2Risk = (94 - vitals.spo2) * 3;
    totalRisk += spo2Risk;
    factors.push({ name: "Oxygen Saturation", contribution: spo2Risk, value: `${vitals.spo2}%`, trend: "down", icon: "🫁" });
  }

  // Diabetic
  if (profile.diabetic) {
    totalRisk += 10;
    factors.push({ name: "Diabetic", contribution: 10, value: "Type 2 risk", trend: "stable", icon: "💉" });
  }

  // Stress
  const stressRisk = vitals.stressLevel > 80 ? 8 : vitals.stressLevel > 60 ? 4 : 0;
  if (stressRisk > 0) {
    totalRisk += stressRisk;
    factors.push({ name: "Stress Level", contribution: stressRisk, value: `${vitals.stressLevel}% stress`, trend: "up", icon: "😰" });
  }

  const clampedScore = Math.min(100, Math.max(0, totalRisk));
  const category =
    clampedScore >= 70 ? "critical" :
    clampedScore >= 50 ? "high" :
    clampedScore >= 30 ? "moderate" : "low";

  // Sort factors by absolute contribution descending
  factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    score: clampedScore,
    category,
    factors,
    confidence: 87,
  };
}

function computeHRRisk(hr: number): { value: number; label: string } {
  if (hr > 120) return { value: 22, label: "Severe Tachycardia" };
  if (hr > 100) return { value: 14, label: "Elevated Heart Rate" };
  if (hr > 90) return { value: 7, label: "Slightly High Heart Rate" };
  if (hr >= 60 && hr <= 80) return { value: 0, label: "Normal Heart Rate" };
  if (hr < 45) return { value: 18, label: "Severe Bradycardia" };
  if (hr < 55) return { value: 10, label: "Low Heart Rate" };
  return { value: 2, label: "Borderline Heart Rate" };
}

function computeBPRisk(systolic: number, diastolic: number): { value: number } {
  if (systolic >= 180 || diastolic >= 120) return { value: 25 };
  if (systolic >= 160 || diastolic >= 100) return { value: 18 };
  if (systolic >= 140 || diastolic >= 90) return { value: 12 };
  if (systolic >= 130 || diastolic >= 80) return { value: 6 };
  if (systolic >= 120) return { value: 3 };
  return { value: 0 };
}

// ---- ANOMALY DETECTION ENGINE ----
export function detectAnomalies(readings: VitalsReading[]): AnomalyEvent[] {
  const anomalies: AnomalyEvent[] = [];
  if (readings.length < 2) return anomalies;

  const latest = readings[readings.length - 1];
  const prev = readings[readings.length - 2];

  // Tachycardia
  if (latest.heartRate > 110) {
    anomalies.push({
      type: "tachycardia",
      severity: latest.heartRate > 130 ? "critical" : "warning",
      timestamp: latest.timestamp,
      details: `Heart rate ${Math.round(latest.heartRate)} bpm — significantly elevated`,
      heartRate: latest.heartRate,
    });
  }

  // Bradycardia
  if (latest.heartRate < 50) {
    anomalies.push({
      type: "bradycardia",
      severity: latest.heartRate < 40 ? "critical" : "warning",
      timestamp: latest.timestamp,
      details: `Heart rate ${Math.round(latest.heartRate)} bpm — dangerously low`,
      heartRate: latest.heartRate,
    });
  }

  // Sudden spike
  const hrDelta = Math.abs(latest.heartRate - prev.heartRate);
  if (hrDelta > 25) {
    anomalies.push({
      type: "irregular_rhythm",
      severity: hrDelta > 40 ? "critical" : "warning",
      timestamp: latest.timestamp,
      details: `Sudden heart rate change of ${Math.round(hrDelta)} bpm detected`,
      heartRate: latest.heartRate,
    });
  }

  // HRV drop
  if (latest.hrv < 20 && prev.hrv >= 20) {
    anomalies.push({
      type: "hrv_drop",
      severity: "warning",
      timestamp: latest.timestamp,
      details: `HRV dropped to ${Math.round(latest.hrv)} ms — possible stress or arrhythmia`,
    });
  }

  // SpO2 low
  if (latest.spo2 < 92) {
    anomalies.push({
      type: "spo2_low",
      severity: latest.spo2 < 88 ? "critical" : "warning",
      timestamp: latest.timestamp,
      details: `Blood oxygen at ${latest.spo2}% — below safe threshold`,
    });
  }

  return anomalies;
}

// ---- PREDICTION ENGINE ----
export function generatePredictions(currentScore: number, profile: UserProfile): PredictionScenario[] {
  const degradationRate = profile.smoking ? 0.8 : profile.activityLevel === "sedentary" ? 0.5 : 0.2;
  const improvementRate = profile.smoking ? -0.3 : -0.6;

  return [
    {
      label: "No Action",
      description: "Continuing current lifestyle with no intervention",
      riskIn7Days: Math.min(100, currentScore + degradationRate * 7),
      riskIn30Days: Math.min(100, currentScore + degradationRate * 30),
      riskIn90Days: Math.min(100, currentScore + degradationRate * 90),
      color: "#ff2d55",
      actionItems: [],
    },
    {
      label: "Moderate Improvement",
      description: "Reducing smoking + increasing activity to moderate",
      riskIn7Days: Math.max(0, currentScore - 3),
      riskIn30Days: Math.max(0, currentScore + improvementRate * 30 * 0.5),
      riskIn90Days: Math.max(0, currentScore + improvementRate * 90 * 0.5),
      color: "#ffd60a",
      actionItems: ["30 min walk daily", "Reduce smoking by 50%", "Sleep 7-8 hours"],
    },
    {
      label: "Optimal Lifestyle",
      description: "Full lifestyle transformation with medical guidance",
      riskIn7Days: Math.max(0, currentScore - 5),
      riskIn30Days: Math.max(0, currentScore + improvementRate * 30),
      riskIn90Days: Math.max(0, currentScore + improvementRate * 90),
      color: "#06d6a0",
      actionItems: ["Quit smoking", "45 min cardio 5x/week", "Mediterranean diet", "Stress management"],
    },
  ];
}

// ---- VITALS SIMULATION ----
let _simPhase = 0;
let _simStep = 0;

export function setSimulationPhase(phase: number) {
  _simPhase = phase;
  _simStep = 0;
}

export function generateSimulatedVitals(step: number): VitalsReading {
  const now = Date.now();

  switch (_simPhase) {
    case 0: // Normal user
      return {
        heartRate: 68 + Math.sin(step * 0.1) * 3 + Math.random() * 2,
        timestamp: now,
        activity: 35 + Math.random() * 15,
        sleepScore: 78,
        hrv: 55 + Math.random() * 10,
        spo2: 98,
        stressLevel: 25,
      };
    case 1: // Gradual risk increase
      return {
        heartRate: 68 + step * 0.5 + Math.random() * 3,
        timestamp: now,
        activity: Math.max(5, 35 - step * 0.3),
        sleepScore: Math.max(40, 75 - step * 0.8),
        hrv: Math.max(20, 55 - step * 0.4),
        spo2: Math.max(95, 98 - step * 0.03),
        stressLevel: Math.min(85, 25 + step * 0.8),
      };
    case 2: // Sudden anomaly
      return {
        heartRate: step < 5 ? 70 : 125 + Math.random() * 15,
        timestamp: now,
        activity: 10,
        sleepScore: 45,
        hrv: step < 5 ? 50 : 15 + Math.random() * 5,
        spo2: step < 5 ? 97 : 91 + Math.random() * 2,
        stressLevel: step < 5 ? 30 : 90,
      };
    case 3: // Emergency
      return {
        heartRate: 148 + Math.random() * 20,
        timestamp: now,
        activity: 0,
        sleepScore: 20,
        hrv: 12 + Math.random() * 3,
        spo2: 88 + Math.random() * 2,
        stressLevel: 98,
      };
    default:
      return {
        heartRate: 72,
        timestamp: now,
        activity: 40,
        sleepScore: 80,
        hrv: 60,
        spo2: 99,
        stressLevel: 20,
      };
  }
}

// ---- HELPERS ----
export function getRiskColor(category: string): string {
  switch (category) {
    case "low": return "#06d6a0";
    case "moderate": return "#ffd60a";
    case "high": return "#ff6b35";
    case "critical": return "#ff2d55";
    default: return "#4361ee";
  }
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "HIGH RISK";
  if (score >= 30) return "MODERATE";
  return "LOW RISK";
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
