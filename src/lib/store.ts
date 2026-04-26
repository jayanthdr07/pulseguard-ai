import { create } from "zustand";
import type { UserProfile, VitalsReading, RiskScore, AnomalyEvent } from "@/lib/ai-engine";

interface PulseGuardState {
  // User
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;

  // Vitals stream
  vitalsHistory: VitalsReading[];
  addVitals: (v: VitalsReading) => void;
  latestVitals: VitalsReading | null;

  // Risk
  riskScore: RiskScore | null;
  setRiskScore: (r: RiskScore) => void;

  // Anomalies
  anomalies: AnomalyEvent[];
  addAnomaly: (a: AnomalyEvent) => void;
  clearAnomalies: () => void;

  // Emergency
  emergencyActive: boolean;
  emergencyStartTime: number | null;
  triggerEmergency: () => void;
  resolveEmergency: () => void;

  // Simulation
  simulationPhase: number;
  simulationRunning: boolean;
  setSimulationPhase: (phase: number) => void;
  setSimulationRunning: (running: boolean) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
}

const DEFAULT_VITALS: VitalsReading = {
  heartRate: 72,
  timestamp: Date.now(),
  activity: 40,
  sleepScore: 75,
  hrv: 55,
  spo2: 98,
  stressLevel: 28,
};

export const usePulseStore = create<PulseGuardState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),

  vitalsHistory: [DEFAULT_VITALS],
  latestVitals: DEFAULT_VITALS,
  addVitals: (v) =>
    set((state) => ({
      vitalsHistory: [...state.vitalsHistory.slice(-120), v], // keep last 120 readings
      latestVitals: v,
    })),

  riskScore: null,
  setRiskScore: (r) => set({ riskScore: r }),

  anomalies: [],
  addAnomaly: (a) =>
    set((state) => ({
      anomalies: [a, ...state.anomalies.slice(0, 19)],
    })),
  clearAnomalies: () => set({ anomalies: [] }),

  emergencyActive: false,
  emergencyStartTime: null,
  triggerEmergency: () =>
    set({ emergencyActive: true, emergencyStartTime: Date.now() }),
  resolveEmergency: () =>
    set({ emergencyActive: false, emergencyStartTime: null }),

  simulationPhase: -1,
  simulationRunning: false,
  setSimulationPhase: (phase) => set({ simulationPhase: phase }),
  setSimulationRunning: (running) => set({ simulationRunning: running }),

  onboardingComplete: false,
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
}));
