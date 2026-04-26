"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MapPin, Phone, Clock, CheckCircle, AlertTriangle,
  Navigation, Heart, Activity, ArrowLeft, Truck,
  User, MessageSquare
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import of Bengaluru map (SSR safe)
const BengaluruMap = dynamic(() => import("../emergency/BengaluruMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 340, borderRadius: 16, background: "#0d1117" }}
      className="flex items-center justify-center">
      <span className="text-white/40 text-sm animate-pulse">Loading map…</span>
    </div>
  ),
});

// Bengaluru coordinates
const PATIENT_LAT = 12.9352;
const PATIENT_LNG = 77.6245;
const HOSPITAL_LAT = 12.9279;
const HOSPITAL_LNG = 77.5937;
const DRIVER_LAT = 12.9166;
const DRIVER_LNG = 77.6101;

interface EmergencyRequest {
  id: string;
  patient: string;
  address: string;
  hr: number;
  spo2: number;
  riskScore: number;
  trigger: "smart_ring" | "manual" | "ai_auto";
  lat: number;
  lng: number;
  distance: string;
  eta: number;
  receivedAt: string;
  vitals: string;
}

const INCOMING_REQUESTS: EmergencyRequest[] = [
  {
    id: "EMR-2024-001",
    patient: "Jayanth DR, 28",
    address: "12A Koramangala 5th Block, Bengaluru 560095",
    hr: 148,
    spo2: 88,
    riskScore: 87,
    trigger: "smart_ring",
    lat: PATIENT_LAT,
    lng: PATIENT_LNG,
    distance: "2.3 km",
    eta: 6,
    receivedAt: "Just now",
    vitals: "HR: 148bpm | SpO₂: 88% | HRV: 12ms",
  },
  {
    id: "EMR-2024-002",
    patient: "Meena Sharma, 62",
    address: "HSR Layout Sector 2, Bengaluru 560102",
    hr: 121,
    spo2: 92,
    riskScore: 79,
    trigger: "manual",
    lat: 12.9116,
    lng: 77.6389,
    distance: "4.1 km",
    eta: 11,
    receivedAt: "3 min ago",
    vitals: "HR: 121bpm | SpO₂: 92% | BP: 165/100",
  },
];

function TriggerBadge({ trigger }: { trigger: EmergencyRequest["trigger"] }) {
  const map = {
    smart_ring: { label: "Smart Ring", color: "#7c3aed", bg: "#7c3aed15" },
    manual: { label: "Manual SOS", color: "#ff2d55", bg: "#ff2d5515" },
    ai_auto: { label: "AI Auto-Detect", color: "#4361ee", bg: "#4361ee15" },
  };
  const t = map[trigger];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: t.color, background: t.bg, border: `1px solid ${t.color}30` }}>
      {t.label}
    </span>
  );
}

export default function DriverPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"online" | "busy" | "offline">("online");
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [etaLeft, setEtaLeft] = useState(6);
  const [completedTrips, setCompletedTrips] = useState(3);
  const [msgLog, setMsgLog] = useState<string[]>([
    "🚦 System: You are now online. Monitoring for emergencies.",
    "📡 GPS: Location synced — BTM Layout, Bengaluru",
  ]);

  // Simulate incoming emergency after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setActiveRequest(INCOMING_REQUESTS[0]);
      setMsgLog(prev => [...prev, "🚨 EMERGENCY ALERT: New cardiac emergency — Koramangala (Smart Ring triggered)"]);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  // ETA countdown when accepted
  useEffect(() => {
    if (!accepted || arrived) return;
    if (etaLeft <= 0) {
      setArrived(true);
      setMsgLog(prev => [...prev, "✅ System: You have arrived at patient location. Hand over to medical team."]);
      return;
    }
    const t = setInterval(() => setEtaLeft(e => e - 1), 8000);
    return () => clearInterval(t);
  }, [accepted, arrived, etaLeft]);

  const handleAccept = () => {
    setAccepted(true);
    setStatus("busy");
    setMsgLog(prev => [...prev,
      "✅ You accepted EMR-2024-001",
      "🗺️ Navigation started → Koramangala 5th Block",
      "📱 Patient family notified: Driver Ravi Kumar is on the way",
    ]);
  };

  const handleReject = () => {
    setActiveRequest(null);
    setMsgLog(prev => [...prev, "❌ Request declined. Reassigning to next available unit."]);
  };

  const handleComplete = () => {
    setActiveRequest(null);
    setAccepted(false);
    setArrived(false);
    setEtaLeft(6);
    setStatus("online");
    setCompletedTrips(c => c + 1);
    setMsgLog(prev => [...prev,
      "🏥 Trip completed. Patient handed over to Apollo ER team.",
      "🚦 System: You are back online for new emergencies.",
    ]);
  };

  return (
    <div className="min-h-screen" style={{ background: "#060612" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 rounded-full"
          style={{ background: "radial-gradient(circle, #ff6b35, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/login")}
              className="w-8 h-8 glass border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 text-white/60" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff2d55)" }}>
              🚑
            </div>
            <div>
              <div className="font-bold text-white text-sm">Ambulance Driver Dashboard</div>
              <div className="text-xs text-white/40">Ravi Kumar · Unit PG-117 · BBMP Emergency Services</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status selector */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value as typeof status)}
              className="text-xs font-bold rounded-xl px-3 py-1.5 border outline-none cursor-pointer"
              style={{
                background: status === "online" ? "#06d6a015" : status === "busy" ? "#ffd60a15" : "#ff2d5515",
                color: status === "online" ? "#06d6a0" : status === "busy" ? "#ffd60a" : "#ff2d55",
                borderColor: status === "online" ? "#06d6a040" : status === "busy" ? "#ffd60a40" : "#ff2d5540",
              }}
            >
              <option value="online">🟢 Online</option>
              <option value="busy">🟡 On Mission</option>
              <option value="offline">🔴 Offline</option>
            </select>

            <div className="text-xs text-white/40 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse inline-block mr-1" />
              GPS Live
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Trips Today", value: completedTrips, icon: "🚑", color: "#06d6a0" },
            { label: "Avg Response", value: "4.2 min", icon: "⏱", color: "#4361ee" },
            { label: "Lives Saved", value: 12, icon: "❤️", color: "#ff2d55" },
            { label: "Rating", value: "4.9★", icon: "⭐", color: "#ffd60a" },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 border border-white/8">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Incoming Requests + Log */}
          <div className="space-y-5">
            {/* Incoming Emergency Alert */}
            <AnimatePresence>
              {activeRequest && !accepted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,45,85,0.1), rgba(255,107,53,0.05))",
                    borderColor: "#ff2d5540",
                    boxShadow: "0 0 30px rgba(255,45,85,0.2)",
                  }}
                >
                  {/* Pulsing top bar */}
                  <div className="flex items-center gap-2 px-4 py-2"
                    style={{ background: "#ff2d55", animation: "pulse 1s infinite" }}>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                      🚨
                    </motion.div>
                    <span className="text-white font-black text-sm tracking-wider">NEW EMERGENCY</span>
                    <span className="ml-auto text-white/80 text-xs font-mono">{activeRequest.receivedAt}</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{activeRequest.patient}</div>
                        <div className="text-xs text-white/50 mt-0.5 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />{activeRequest.address}
                        </div>
                      </div>
                      <TriggerBadge trigger={activeRequest.trigger} />
                    </div>

                    {/* Vital signs */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Heart Rate", value: `${activeRequest.hr} bpm`, color: "#ff2d55", critical: true },
                        { label: "SpO₂", value: `${activeRequest.spo2}%`, color: activeRequest.spo2 < 92 ? "#ff6b35" : "#06d6a0", critical: activeRequest.spo2 < 92 },
                        { label: "Risk", value: `${activeRequest.riskScore}/100`, color: "#ffd60a", critical: true },
                      ].map(v => (
                        <div key={v.label} className="rounded-xl p-2 text-center"
                          style={{ background: `${v.color}12`, border: `1px solid ${v.color}25` }}>
                          <div className="text-sm font-black" style={{ color: v.color }}>{v.value}</div>
                          <div className="text-[10px] text-white/40">{v.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/50">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{activeRequest.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />ETA ~{activeRequest.eta} min</span>
                    </div>

                    {/* Accept / Reject */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleAccept}
                        className="py-3 rounded-xl font-bold text-white text-sm"
                        style={{ background: "linear-gradient(135deg, #06d6a0, #059669)" }}
                      >
                        ✓ Accept & Navigate
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleReject}
                        className="py-3 rounded-xl font-bold text-sm glass border border-white/10 text-white/60"
                      >
                        ✕ Decline
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Mission Status */}
            {accepted && activeRequest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border"
                style={{ borderColor: "#06d6a040" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-4 h-4 text-[#06d6a0]" />
                  <div className="font-bold text-white text-sm">Active Mission</div>
                  <span className="ml-auto text-xs font-bold text-[#06d6a0]">EN ROUTE</span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{activeRequest.patient}</div>
                <div className="text-xs text-white/50 mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{activeRequest.address}
                </div>

                {/* ETA meter */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Time remaining</span>
                    <span className="font-bold text-[#ffd60a]">{etaLeft} min</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      animate={{ width: `${((activeRequest.eta - etaLeft) / activeRequest.eta) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #06d6a0, #4361ee)" }}
                    />
                  </div>
                </div>

                {arrived ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleComplete}
                    className="w-full py-3 rounded-xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #06d6a0, #059669)" }}
                  >
                    ✓ Mark Complete — Patient Handed Over
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setArrived(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold glass border border-white/10 text-white/60"
                  >
                    I have arrived at patient location
                  </button>
                )}
              </motion.div>
            )}

            {/* No active request */}
            {!activeRequest && !accepted && (
              <div className="glass rounded-2xl p-6 border border-white/8 text-center">
                <div className="text-3xl mb-3">🟢</div>
                <div className="font-semibold text-white text-sm">Waiting for emergencies</div>
                <div className="text-xs text-white/40 mt-1">You are online and available</div>
              </div>
            )}

            {/* Pending requests */}
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffd60a]" /> Queue
                <span className="ml-auto text-xs text-white/30">{INCOMING_REQUESTS.length} pending</span>
              </div>
              {INCOMING_REQUESTS.slice(1).map(r => (
                <div key={r.id} className="rounded-xl p-3 border border-white/5 bg-white/2 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{r.patient}</span>
                    <TriggerBadge trigger={r.trigger} />
                  </div>
                  <div className="text-xs text-white/40 flex items-center gap-2">
                    <Navigation className="w-3 h-3" />{r.distance} · {r.receivedAt}
                  </div>
                </div>
              ))}
            </div>

            {/* Message log */}
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#4361ee]" />
                <span className="font-semibold text-sm text-white">System Log</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                <AnimatePresence>
                  {msgLog.slice().reverse().map((m, i) => (
                    <motion.div
                      key={m + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-white/50 leading-relaxed"
                    >
                      {m}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right — Big Map */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4361ee]" /> Live Bengaluru Map
                </div>
                <div className="text-xs text-white/40 font-mono">
                  📍 BTM Layout → Koramangala
                </div>
              </div>
              <BengaluruMap
                ambulanceLat={DRIVER_LAT}
                ambulanceLng={DRIVER_LNG}
                patientLat={PATIENT_LAT}
                patientLng={PATIENT_LNG}
                hospitalLat={HOSPITAL_LAT}
                hospitalLng={HOSPITAL_LNG}
                eta={etaLeft}
              />
              <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff2d55]" /> Patient</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#06d6a0]" /> Hospital</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4361ee]" /> Your Unit (PG-117)</span>
              </div>
            </div>

            {/* Patient vitals card */}
            {(accepted && activeRequest) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-5 border border-white/8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#ff2d55]" />
                  <div className="font-bold text-white text-sm">Live Patient Vitals — {activeRequest.patient}</div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-[#ff2d55]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d55] animate-pulse" />CRITICAL
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Heart Rate", value: `${activeRequest.hr} bpm`, color: "#ff2d55" },
                    { label: "SpO₂", value: `${activeRequest.spo2}%`, color: "#ff6b35" },
                    { label: "HRV", value: "12 ms", color: "#ffd60a" },
                    { label: "Risk Score", value: `${activeRequest.riskScore}/100`, color: "#7c3aed" },
                  ].map(v => (
                    <div key={v.label} className="rounded-xl p-3 text-center"
                      style={{ background: `${v.color}12`, border: `1px solid ${v.color}25` }}>
                      <div className="font-black text-sm" style={{ color: v.color }}>{v.value}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{v.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl p-3 border border-[#ff2d55]/20"
                  style={{ background: "#ff2d5508" }}>
                  <div className="text-xs font-bold text-[#ff2d55] mb-1">⚠️ Clinical Alert for Paramedic</div>
                  <div className="text-xs text-white/60">
                    Suspected ventricular arrhythmia. Prepare defibrillator. O₂ supplementation recommended.
                    Patient triggered by smart ring — may be unconscious. Neighbour Suresh is on-site.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              <button className="glass border border-white/10 rounded-2xl p-4 text-center hover:bg-white/5 transition-all">
                <div className="text-2xl mb-1">📞</div>
                <div className="text-xs font-semibold text-white">Call Patient</div>
              </button>
              <button className="glass border border-white/10 rounded-2xl p-4 text-center hover:bg-white/5 transition-all">
                <div className="text-2xl mb-1">🏥</div>
                <div className="text-xs font-semibold text-white">Call Apollo ER</div>
              </button>
              <button className="glass border border-white/10 rounded-2xl p-4 text-center hover:bg-white/5 transition-all">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-xs font-semibold text-white">Patient Report</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
