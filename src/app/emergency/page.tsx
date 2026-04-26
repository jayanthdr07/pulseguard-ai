"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Heart, Phone, MapPin, AlertTriangle, CheckCircle,
  Clock, Activity, ArrowLeft, Siren, MessageSquare
} from "lucide-react";
import { usePulseStore } from "@/lib/store";
import dynamic from "next/dynamic";

const BengaluruMap = dynamic(() => import("./BengaluruMap"), { ssr: false, loading: () => (
  <div style={{ height: 280, borderRadius: 16, background: "#0d1117" }} className="flex items-center justify-center">
    <span className="text-white/40 text-sm animate-pulse">Loading Bengaluru map…</span>
  </div>
) });

// ── Countdown timer ──────────────────────────────────────────────────────────
function useCountup(startTime: number | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Emergency Status Steps ────────────────────────────────────────────────────
const RESPONSE_STEPS = [
  { id: "detect", label: "Critical Condition Detected", detail: "AI anomaly engine triggered", delay: 0, icon: "🧠", color: "#ff2d55" },
  { id: "locate", label: "Location Acquired", detail: "GPS coordinates obtained", delay: 1500, icon: "📍", color: "#ff6b35" },
  { id: "hospital", label: "Hospital Notified", detail: "Apollo Hospitals — 2.3 km away", delay: 3000, icon: "🏥", color: "#ffd60a" },
  { id: "ambulance", label: "Ambulance Dispatched", detail: "Unit PG-117 — ETA 6 minutes", delay: 5000, icon: "🚑", color: "#4361ee" },
  { id: "family", label: "Family Notified", detail: "2 emergency contacts messaged", delay: 7000, icon: "👨‍👩‍👧", color: "#7c3aed" },
  { id: "doctor", label: "Doctor Assigned", detail: "Dr. Mehta (Cardiologist) — on call", delay: 9000, icon: "👨‍⚕️", color: "#06d6a0" },
];

// ── Simulated pulse waveform ──────────────────────────────────────────────────
function EmergencyPulseWave() {
  return (
    <svg viewBox="0 0 400 60" className="w-full h-10 opacity-60">
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff2d55" stopOpacity="0" />
          <stop offset="50%" stopColor="#ff2d55" />
          <stop offset="100%" stopColor="#ff2d55" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="ecg-line"
        d="M0,30 L40,30 L50,30 L56,8 L62,52 L66,4 L74,56 L80,30 L120,30 L160,30 L166,8 L172,52 L176,4 L184,56 L190,30 L230,30 L270,30 L276,8 L282,52 L286,4 L294,56 L300,30 L340,30 L380,30 L386,8 L392,52 L396,4 L400,30"
        fill="none"
        stroke="url(#waveGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Bengaluru real coordinates
// Patient: Koramangala, Hospital: Apollo Jayanagar, Ambulance: BTM Layout
const PATIENT_LAT = 12.9352;
const PATIENT_LNG = 77.6245;
const HOSPITAL_LAT = 12.9279;
const HOSPITAL_LNG = 77.5937;
const AMBULANCE_START_LAT = 12.9166;
const AMBULANCE_START_LNG = 77.6101;

// ── Clinical Summary ──────────────────────────────────────────────────────────
function ClinicalSummary() {
  const { riskScore, latestVitals, anomalies } = usePulseStore();

  const rows = [
    { label: "Heart Rate", value: `${Math.round(latestVitals?.heartRate ?? 148)} bpm`, status: "critical" },
    { label: "SpO₂", value: `${latestVitals?.spo2 ?? 88}%`, status: latestVitals && latestVitals.spo2 < 92 ? "critical" : "normal" },
    { label: "HRV", value: `${Math.round(latestVitals?.hrv ?? 13)} ms`, status: "critical" },
    { label: "Risk Score", value: `${Math.round(riskScore?.score ?? 85)}/100`, status: "critical" },
    { label: "Risk Category", value: riskScore?.category.toUpperCase() ?? "CRITICAL", status: "critical" },
    { label: "BP (Est.)", value: "158/98 mmHg", status: "high" },
    { label: "Anomalies", value: `${anomalies.length} detected`, status: anomalies.length > 0 ? "high" : "normal" },
    { label: "Last Normal", value: "06:42 AM", status: "normal" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map(r => (
        <div key={r.label} className="glass rounded-xl p-3 border border-white/5">
          <div className="text-xs text-white/40 mb-1">{r.label}</div>
          <div className="text-sm font-bold"
            style={{
              color: r.status === "critical" ? "#ff2d55" : r.status === "high" ? "#ff6b35" : "#06d6a0"
            }}>
            {r.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN EMERGENCY PAGE ───────────────────────────────────────────────────────
export default function EmergencyPage() {
  const router = useRouter();
  const { emergencyActive, emergencyStartTime, resolveEmergency, latestVitals } = usePulseStore();
  const elapsed = useCountup(emergencyStartTime);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Trigger alert sound
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio not available
    }

    // Voice announcement
    try {
      if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance(
          "Emergency alert. Critical cardiovascular condition detected. Emergency services have been notified. Help is on the way."
        );
        msg.rate = 0.9;
        msg.pitch = 1;
        window.speechSynthesis.speak(msg);
      }
    } catch {
      // Speech not available
    }
  }, []);

  // Send real SMS to emergency contacts
  useEffect(() => {
    const hr = Math.round(latestVitals?.heartRate ?? 148);
    const spo2 = latestVitals?.spo2 ?? 88;
    const contacts = [
      { name: "Rajesh Kumar (Father)", number: "7899164329" },
      { name: "Neighbour Suresh", number: "7899164329" },
      { name: "Driver Ravi Kumar", number: "7899164329" },
    ];
    const sendSMS = async () => {
      for (const c of contacts) {
        let msg = "";
        if (c.name.includes("Driver")) {
          msg = `PULSEGUARD EMERGENCY: Cardiac event detected. Patient: Jayanth DR, 12A Koramangala 5th Block Bengaluru. HR:${hr}bpm SpO2:${spo2}%. Smart ring triggered. Navigate immediately. -PulseGuard AI`;
        } else if (c.name.includes("Neighbour")) {
          msg = `EMERGENCY: Your neighbour Jayanth (Flat 205) has had a cardiac event. Smart ring triggered alert. Address: 12A Koramangala 5th Block. Please assist or call 108. -PulseGuard AI`;
        } else {
          msg = `URGENT: Jayanth's smart ring detected a heart attack. HR:${hr}bpm SpO2:${spo2}%. Ambulance dispatched ETA 6 min. Location: Koramangala, Bengaluru. -PulseGuard AI`;
        }
        try {
          await fetch("/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numbers: c.number, message: msg }),
          });
        } catch { /* ignore */ }
      }
    };
    sendSMS();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progressively complete steps
  useEffect(() => {
    RESPONSE_STEPS.forEach(step => {
      setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, step.id]));
      }, step.delay);
    });
  }, []);

  const handleResolve = () => {
    resolveEmergency();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#06010a" }}>
      {/* Pulsing emergency BG */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ background: "radial-gradient(circle at center, #ff2d55 0%, transparent 70%)" }}
      />

      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-0.5"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,85,0.2), transparent)" }}
          animate={{ top: ["-2px", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-[#ff2d55]/30"
        style={{ background: "rgba(255,45,85,0.08)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#ff2d55", boxShadow: "0 0 20px rgba(255,45,85,0.6)" }}
            >
              <AlertTriangle className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-lg font-black text-[#ff2d55] tracking-wider">EMERGENCY ACTIVE</div>
              <div className="text-xs text-white/50 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Response time: {formatTime(elapsed)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-sm text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={handleResolve}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white border border-[#06d6a0]/40 hover:bg-[#06d6a0]/10"
              style={{ color: "#06d6a0" }}
            >
              ✓ Resolve Emergency
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* Main Alert Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 mb-6 text-center border"
          style={{
            background: "linear-gradient(135deg, rgba(255,45,85,0.12), rgba(255,107,53,0.06))",
            borderColor: "rgba(255,45,85,0.3)",
            boxShadow: "0 0 60px rgba(255,45,85,0.15)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🚨
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black text-[#ff2d55] mb-2">
            Critical Condition Detected
          </h1>
          <p className="text-white/60 text-lg mb-6">
            PulseGuard AI has detected a life-threatening cardiovascular event.
            Emergency services have been automatically notified.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-black text-[#ff2d55]">
                {Math.round(latestVitals?.heartRate ?? 148)}
              </div>
              <div className="text-white/40 text-xs">BPM</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#4361ee]">
                {latestVitals?.spo2 ?? 88}%
              </div>
              <div className="text-white/40 text-xs">SpO₂</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#ffd60a]">
                {usePulseStore.getState().riskScore?.score ? Math.round(usePulseStore.getState().riskScore!.score) : 87}
              </div>
              <div className="text-white/40 text-xs">Risk Score</div>
            </div>
          </div>
          <EmergencyPulseWave />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left — Response Timeline */}
          <div>
            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="flex items-center gap-2 mb-5">
                <Siren className="w-4 h-4 text-[#ff2d55]" />
                <div className="font-bold text-white">Emergency Response</div>
              </div>

              <div className="space-y-4">
                {RESPONSE_STEPS.map((step, i) => {
                  const done = completedSteps.has(step.id);
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: done ? 1 : 0.4, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="relative flex-shrink-0">
                        <motion.div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{
                            background: done ? `${step.color}20` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${done ? step.color + "40" : "rgba(255,255,255,0.1)"}`,
                          }}
                        >
                          {done ? <CheckCircle className="w-5 h-5" style={{ color: step.color }} /> : step.icon}
                        </motion.div>
                        {i < RESPONSE_STEPS.length - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-4"
                            style={{ background: done ? step.color + "40" : "rgba(255,255,255,0.06)" }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{step.label}</div>
                        <div className="text-xs text-white/40 mt-0.5">{step.detail}</div>
                      </div>
                      {done && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${step.color}20`, color: step.color }}
                        >
                          DONE
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="glass rounded-2xl p-5 border border-white/8 mt-5">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-[#06d6a0]" />
                <div className="font-semibold text-sm text-white">Emergency Contacts Notified</div>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Rajesh Kumar (Father)", phone: "+91 98765 43210", status: "Notified ✓" },
                  { name: "Dr. Priya Mehta (Physician)", phone: "+91 98765 43211", status: "On Call ✓" },
                  { name: "Apollo Emergency", phone: "1066", status: "Alerted ✓" },
                ].map(c => (
                  <div key={c.name} className="flex items-center justify-between rounded-xl p-3 bg-white/3 border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-white">{c.name}</div>
                      <div className="text-xs text-white/40 font-mono">{c.phone}</div>
                    </div>
                    <span className="text-xs font-bold text-[#06d6a0]">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Map + Clinical Summary */}
          <div className="space-y-5">
            {/* REAL BENGALURU MAP */}
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#4361ee]" />
                <div className="font-semibold text-sm text-white">Live Bengaluru Emergency Map</div>
                <span className="text-xs text-[#ffd60a] ml-auto flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd60a] animate-pulse" />
                  🚑 Koramangala → Apollo
                </span>
              </div>
              <BengaluruMap
                ambulanceLat={AMBULANCE_START_LAT}
                ambulanceLng={AMBULANCE_START_LNG}
                patientLat={PATIENT_LAT}
                patientLng={PATIENT_LNG}
                hospitalLat={HOSPITAL_LAT}
                hospitalLng={HOSPITAL_LNG}
                eta={6}
              />
              <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff2d55]" /> Patient (Koramangala)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#06d6a0]" /> Apollo Hospitals</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4361ee]" /> Ambulance PG-117</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-[#ffd60a]" />
                <div className="font-semibold text-sm text-white">Clinical Summary</div>
                <span className="text-xs text-white/30 ml-auto">Auto-generated for paramedics</span>
              </div>
              <ClinicalSummary />
            </div>

            {/* Smart Ring SMS Notifications */}
            <div className="glass rounded-2xl p-5 border border-[#06d6a0]/20">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-[#06d6a0]" />
                <div className="font-semibold text-sm text-white">Smart Ring Auto-Alerts Sent</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-auto"
                  style={{ background: "#06d6a020", color: "#06d6a0", border: "1px solid #06d6a040" }}>
                  AUTO-TRIGGERED
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { to: "Neighbour — Suresh (Door 204)", phone: "+91 99001 12345", msg: "🚨 Your neighbour Jayanth needs help NOW. Heart attack detected by smart ring. Address: 12A Koramangala 5th Block. Please check immediately.", time: "0s ago", color: "#ff2d55" },
                  { to: "Neighbour — Kavitha (Door 203)", phone: "+91 99002 67890", msg: "🚨 Emergency: Jayanth (Flat 205) has had a cardiac event. Smart ring triggered alert. Please assist or call 108.", time: "0s ago", color: "#ff6b35" },
                  { to: "Driver — Ravi Kumar (PG-117)", phone: "+91 98001 55432", msg: "🚑 NEW EMERGENCY: Cardiac arrest. Patient: Jayanth DR, 12A Koramangala 5th Block, Bengaluru. HR: 148bpm, SpO2: 88%. Navigate now.", time: "1s ago", color: "#4361ee" },
                  { to: "Father — Rajesh Kumar", phone: "+91 98765 43210", msg: "⚠️ Jayanth's smart ring detected a heart attack. Ambulance PG-117 dispatched. ETA 6 min. He is at Koramangala. Please come immediately.", time: "2s ago", color: "#ffd60a" },
                ].map((n, i) => (
                  <motion.div
                    key={n.to}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="rounded-xl p-3 border"
                    style={{ background: `${n.color}08`, borderColor: `${n.color}25` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-white">{n.to}</div>
                      <span className="text-[10px] text-white/30 font-mono">{n.time}</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/40 mb-1">{n.phone}</div>
                    <div className="text-xs text-white/60 leading-relaxed">{n.msg}</div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="text-[10px] font-bold" style={{ color: "#06d6a0" }}>✓ SMS Delivered</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="glass border border-white/10 rounded-2xl p-4 text-center hover:bg-white/5 transition-all group">
                <div className="text-2xl mb-1">📞</div>
                <div className="text-xs font-semibold text-white">Call 108</div>
                <div className="text-xs text-white/30">Ambulance</div>
              </button>
              <button
                onClick={() => window.print()}
                className="glass border border-white/10 rounded-2xl p-4 text-center hover:bg-white/5 transition-all"
              >
                <div className="text-2xl mb-1">📋</div>
                <div className="text-xs font-semibold text-white">Medical Report</div>
                <div className="text-xs text-white/30">Print / Save PDF</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
