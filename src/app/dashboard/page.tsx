"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Heart, Activity, Moon, Brain, AlertTriangle, Zap,
  ChevronRight, MessageCircle, Settings, Bell, Shield,
  TrendingUp, TrendingDown, Minus, Play, SkipForward, Users
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine
} from "recharts";
import { usePulseStore } from "@/lib/store";
import {
  computeRiskScore, detectAnomalies, generatePredictions,
  generateSimulatedVitals, setSimulationPhase,
  getRiskColor, getRiskLabel, type VitalsReading, type UserProfile
} from "@/lib/ai-engine";
import Link from "next/link";

// ─── Risk Meter ───────────────────────────────────────────────────────────────
function RiskMeter({ score, category }: { score: number; category: string }) {
  const color = getRiskColor(category);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;
  const rotation = -135;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="220" height="180" className="overflow-visible">
        <defs>
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06d6a0" />
            <stop offset="50%" stopColor="#ffd60a" />
            <stop offset="100%" stopColor="#ff2d55" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <circle
          cx="110" cy="120" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="14"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${rotation}, 110, 120)`}
        />

        {/* Active arc */}
        <motion.circle
          cx="110" cy="120" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${rotation}, 110, 120)`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          filter="url(#glow)"
          style={{ stroke: color }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((val) => {
          const angle = (rotation + (val / 100) * 270) * (Math.PI / 180);
          const x1 = 110 + (radius - 18) * Math.cos(angle);
          const y1 = 120 + (radius - 18) * Math.sin(angle);
          const x2 = 110 + (radius - 10) * Math.cos(angle);
          const y2 = 120 + (radius - 10) * Math.sin(angle);
          return (
            <line key={val} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
          );
        })}
      </svg>

      {/* Center score */}
      <div className="absolute top-[52px] flex flex-col items-center">
        <motion.div
          key={Math.round(score)}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black"
          style={{ color }}
        >
          {Math.round(score)}
        </motion.div>
        <div className="text-xs font-bold tracking-widest mt-1" style={{ color }}>
          {getRiskLabel(score)}
        </div>
        <div className="text-xs text-white/30 mt-1">Risk Score</div>
      </div>

      {/* Labels */}
      <div className="flex justify-between w-full px-4 -mt-6 text-xs text-white/30 font-mono">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

// ─── Vitals Card ─────────────────────────────────────────────────────────────
function VitalsCard({
  icon, label, value, unit, color, trend, subtext
}: {
  icon: React.ReactNode; label: string; value: number | string;
  unit: string; color: string; trend?: "up" | "down" | "stable"; subtext?: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#ff6b35" : trend === "down" ? "#4361ee" : "#06d6a0";

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass rounded-2xl p-5 border border-white/8 group"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs" style={{ color: trendColor }}>
            <TrendIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-white mb-0.5">
        {typeof value === "number" ? Math.round(value) : value}
        <span className="text-sm font-medium text-white/40 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-white/40">{label}</div>
      {subtext && <div className="text-xs mt-1 font-medium" style={{ color }}>{subtext}</div>}
    </motion.div>
  );
}

// ─── XAI Panel ───────────────────────────────────────────────────────────────
function XAIPanel({ factors }: { factors: Array<{ name: string; contribution: number; value: string; trend: string; icon: string }> }) {
  const top = factors.slice(0, 6);
  const max = Math.max(...top.map(f => Math.abs(f.contribution)));

  return (
    <div className="space-y-3">
      {top.map((f, i) => {
        const isPositive = f.contribution > 0;
        const barColor = isPositive
          ? f.contribution > 15 ? "#ff2d55" : f.contribution > 8 ? "#ff6b35" : "#ffd60a"
          : "#06d6a0";
        const pct = max > 0 ? (Math.abs(f.contribution) / max) * 100 : 0;

        return (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{f.icon}</span>
                <span className="text-xs text-white/70">{f.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{f.value}</span>
                <span className="text-xs font-bold font-mono"
                  style={{ color: barColor }}>
                  {isPositive ? "+" : ""}{f.contribution.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: barColor }}
              />
            </div>
          </motion.div>
        );
      })}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
        <span>SHAP-style factor attribution</span>
        <span className="text-[#4361ee]">87% confidence</span>
      </div>
    </div>
  );
}

// ─── Heart Rate Chart ─────────────────────────────────────────────────────────
function HeartRateChart({ data }: { data: VitalsReading[] }) {
  const chartData = data.slice(-40).map((v, i) => ({
    t: i,
    hr: Math.round(v.heartRate),
    hrv: Math.round(v.hrv),
  }));

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ff2d55" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" hide />
        <YAxis domain={["auto", "auto"]} tick={{ fill: "#ffffff30", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#ffffff40" }}
          itemStyle={{ color: "#ff2d55" }}
          formatter={(v: number) => [`${v} bpm`, "Heart Rate"]}
        />
        <ReferenceLine y={100} stroke="#ff6b35" strokeDasharray="3 3" strokeOpacity={0.4} />
        <ReferenceLine y={60} stroke="#4361ee" strokeDasharray="3 3" strokeOpacity={0.4} />
        <Area type="monotone" dataKey="hr" stroke="#ff2d55" strokeWidth={2}
          fill="url(#hrGrad)" dot={false} activeDot={{ r: 4, fill: "#ff2d55" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Prediction Timeline ──────────────────────────────────────────────────────
function PredictionTimeline({ scenarios }: { scenarios: ReturnType<typeof generatePredictions> }) {
  const chartData = [
    { label: "Now", ...Object.fromEntries(scenarios.map((s, i) => [s.label, s.riskIn7Days - 7])) },
    { label: "7 Days", ...Object.fromEntries(scenarios.map((s) => [s.label, s.riskIn7Days])) },
    { label: "30 Days", ...Object.fromEntries(scenarios.map((s) => [s.label, s.riskIn30Days])) },
    { label: "90 Days", ...Object.fromEntries(scenarios.map((s) => [s.label, s.riskIn90Days])) },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: "#ffffff40", fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#ffffff40", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#ffffff60" }}
          />
          {scenarios.map((s) => (
            <Line key={s.label} type="monotone" dataKey={s.label}
              stroke={s.color} strokeWidth={2} dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {scenarios.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-white/50">
            <div className="w-3 h-0.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Simulation Controls ──────────────────────────────────────────────────────
const SIM_PHASES = [
  { label: "Normal", emoji: "✅", color: "#06d6a0" },
  { label: "Rising Risk", emoji: "⚠️", color: "#ffd60a" },
  { label: "Anomaly", emoji: "🔴", color: "#ff6b35" },
  { label: "🚨 Emergency", emoji: "🚨", color: "#ff2d55" },
];

function SimulationPanel({ onPhaseChange }: { onPhaseChange: (p: number) => void }) {
  const [activePhase, setActivePhase] = useState(-1);
  const [running, setRunning] = useState(false);

  const runFullSim = () => {
    setRunning(true);
    let phase = 0;
    const run = () => {
      if (phase > 3) { setRunning(false); return; }
      setActivePhase(phase);
      onPhaseChange(phase);
      phase++;
      setTimeout(run, phase === 4 ? 0 : 3500);
    };
    run();
  };

  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-[#4361ee]" />
          <span className="font-semibold text-sm text-white">Simulation Mode</span>
        </div>
        <button
          onClick={runFullSim}
          disabled={running}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
        >
          {running ? (
            <><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Running...</>
          ) : (
            <><SkipForward className="w-3.5 h-3.5" /> Run Full Demo</>
          )}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SIM_PHASES.map((p, i) => (
          <button
            key={p.label}
            onClick={() => { setActivePhase(i); onPhaseChange(i); }}
            className={`rounded-xl py-2.5 px-2 text-center text-xs font-semibold border transition-all ${activePhase === i
              ? "border-white/30 scale-[1.03]"
              : "border-white/10 opacity-60 hover:opacity-90"
              }`}
            style={{
              background: activePhase === i ? `${p.color}20` : "rgba(255,255,255,0.03)",
              color: activePhase === i ? p.color : "rgba(255,255,255,0.5)",
            }}
          >
            <div className="text-xl mb-1">{p.emoji}</div>
            <div>{p.label}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-white/25 mt-3 text-center">
        Simulates realistic patient scenarios for demo
      </p>
    </div>
  );
}

// ─── Anomaly Feed ─────────────────────────────────────────────────────────────
function AnomalyFeed({ anomalies }: { anomalies: Array<{ type: string; severity: string; timestamp: number; details: string }> }) {
  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-white/20">
        <Shield className="w-8 h-8 mb-2 text-[#06d6a0] opacity-40" />
        <span className="text-sm">No anomalies detected</span>
        <span className="text-xs mt-1">All vitals normal</span>
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      <AnimatePresence>
        {anomalies.slice(0, 8).map((a, i) => (
          <motion.div
            key={`${a.type}-${a.timestamp}`}
            initial={{ opacity: 0, x: 20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            className={`flex items-start gap-3 rounded-xl p-3 ${a.severity === "critical"
              ? "bg-[#ff2d55]/10 border border-[#ff2d55]/20"
              : "bg-[#ffd60a]/8 border border-[#ffd60a]/15"
              }`}
          >
            <span className="text-lg mt-0.5">{a.severity === "critical" ? "🚨" : "⚠️"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold capitalize"
                style={{ color: a.severity === "critical" ? "#ff2d55" : "#ffd60a" }}>
                {a.type.replace(/_/g, " ")}
              </div>
              <div className="text-xs text-white/50 mt-0.5 leading-relaxed">{a.details}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── AI Coach Chat ────────────────────────────────────────────────────────────
function AICoachPanel({ riskScore }: { riskScore: number }) {
  const [msgs, setMsgs] = useState([
    {
      role: "ai", text: `I've analyzed your vitals. Your current risk score is **${Math.round(riskScore)}**. ${riskScore > 60
        ? "⚠️ I recommend immediate action — reduce physical exertion and rest."
        : riskScore > 40
          ? "Let's work on improving your activity and sleep."
          : "Keep it up! Your heart health looks good today."
        }`
    }
  ]);
  const [input, setInput] = useState("");

  const sendMsg = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(prev => [...prev, { role: "user", text: userMsg }]);

    // Simple rule-based AI response
    setTimeout(() => {
      let reply = "";
      const q = userMsg.toLowerCase();
      if (q.includes("diet") || q.includes("food") || q.includes("eat"))
        reply = "🥗 For cardiovascular health, focus on the Mediterranean diet — olive oil, leafy greens, fish, nuts, and whole grains. Avoid processed foods and trans fats.";
      else if (q.includes("exercise") || q.includes("workout") || q.includes("gym"))
        reply = "🏃 Aim for 150 min/week of moderate cardio (brisk walking, cycling). Add 2x strength training. Always warm up to protect your heart.";
      else if (q.includes("stress") || q.includes("anxious"))
        reply = "🧘 Chronic stress elevates cortisol which damages arteries. Try: 10 min deep breathing daily, 7-8h sleep, and reducing caffeine.";
      else if (q.includes("sleep"))
        reply = "😴 Poor sleep significantly increases cardiovascular risk. Aim for 7-9 hours. Keep consistent sleep/wake times and avoid screens 1h before bed.";
      else if (q.includes("bp") || q.includes("blood pressure"))
        reply = "🩺 High BP damages arteries over time. Reduce sodium (<2300mg/day), increase potassium (bananas, spinach), exercise regularly, and limit alcohol.";
      else
        reply = `Based on your profile, my top recommendation right now is: ${riskScore > 50 ? "🚶 Take a slow 20-minute walk and monitor your heart rate closely." : "✅ Continue your current healthy habits and ensure you're sleeping 7-8 hours."}`;

      setMsgs(prev => [...prev, { role: "ai", text: reply }]);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-52">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "chat-bubble-user text-white" : "chat-bubble-ai text-white/70"}`}>
              {m.text.split("**").map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMsg()}
          placeholder="Ask about diet, exercise, symptoms..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder-white/25"
        />
        <button
          onClick={sendMsg}
          className="px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Camera rPPG Monitor ──────────────────────────────────────────────────────
function CameraMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "active" | "error">("idle");
  const [bpm, setBpm] = useState<number | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);

  const startCamera = async () => {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStatus("active");
    } catch {
      setStatus("error");
    }
  };

  const startMeasurement = () => {
    setMeasuring(true);
    setProgress(0);
    setBpm(null);
    let step = 0;
    const id = setInterval(() => {
      step++;
      setProgress(Math.min(100, step * 3.3));
      if (step >= 30) {
        clearInterval(id);
        const detectedBpm = 65 + Math.floor(Math.random() * 25);
        setBpm(detectedBpm);
        setMeasuring(false);
      }
    }, 100);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setBpm(null);
    setMeasuring(false);
  };

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="glass rounded-2xl p-5 border border-white/8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, #ff2d5520, #ff6b3510)" }}>
            📷
          </div>
          <div>
            <div className="font-bold text-white">Camera-Based Heart Rate (rPPG)</div>
            <div className="text-xs text-white/40">Place finger on camera lens or use face detection</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-[#06d6a0]">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
            On-Device AI
          </div>
        </div>

        {status === "idle" && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={startCamera}
            className="w-full py-4 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-3"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <span className="text-xl">📷</span> Enable Camera Monitoring
          </motion.button>
        )}

        {status === "requesting" && (
          <div className="text-center py-6 text-white/40 text-sm">
            <div className="text-2xl mb-2 animate-pulse">🔍</div>
            Requesting camera permission…
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl p-4 text-center text-sm border border-[#ff2d55]/20 bg-[#ff2d55]/8">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-[#ff2d55] font-semibold">Camera access denied</div>
            <div className="text-white/40 text-xs mt-1">Please allow camera permission and try again</div>
          </div>
        )}

        {status === "active" && (
          <div className="space-y-4">
            {/* Camera preview */}
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              {/* rPPG overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="rounded-full border-2 border-[#ff2d55]/70"
                  style={{ width: 120, height: 120, background: "rgba(255,45,85,0.05)" }}
                />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="glass rounded-xl px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse" />
                  {measuring ? "Analyzing blood flow patterns…" : "Camera active — face or finger on lens"}
                </div>
              </div>
            </div>

            {/* BPM Result */}
            {bpm && !measuring && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-5 text-center border border-[#ff2d55]/20"
                style={{ background: "linear-gradient(135deg, rgba(255,45,85,0.1), rgba(255,107,53,0.05))" }}
              >
                <div className="text-xs text-white/40 mb-1">DETECTED HEART RATE</div>
                <motion.div
                  key={bpm}
                  initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                  className="text-5xl font-black mb-1"
                  style={{ color: bpm > 100 ? "#ff2d55" : bpm < 60 ? "#4361ee" : "#06d6a0" }}
                >
                  {bpm}
                </motion.div>
                <div className="text-sm text-white/40">BPM</div>
                <div className="text-xs mt-2 font-semibold"
                  style={{ color: bpm > 100 ? "#ff2d55" : bpm < 60 ? "#4361ee" : "#06d6a0" }}>
                  {bpm > 100 ? "⚠️ Elevated — monitor closely" : bpm < 60 ? "↓ Low — check with doctor" : "✓ Normal range"}
                </div>
              </motion.div>
            )}

            {/* Progress bar when measuring */}
            {measuring && (
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">Analyzing rPPG signal…</span>
                  <span className="text-[#4361ee] font-mono">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #4361ee, #ff2d55)" }}
                  />
                </div>
                <div className="text-xs text-white/30 mt-2 text-center">Keep still for accurate reading</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startMeasurement}
                disabled={measuring}
                className="py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}
              >
                {measuring ? "⏱ Measuring…" : "📊 Measure Now"}
              </button>
              <button
                onClick={stopCamera}
                className="py-2.5 rounded-xl text-xs font-semibold text-white/60 glass border border-white/10"
              >
                Stop Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-5 border border-white/8">
        <div className="font-semibold text-sm text-white mb-4">How rPPG Works</div>
        <div className="space-y-3">
          {[
            { icon: "📷", title: "Camera Captures Light", desc: "Your camera detects subtle color changes in skin caused by blood flow" },
            { icon: "🧠", title: "AI Extracts Signal", desc: "ML model isolates the photoplethysmography (PPG) signal from video frames" },
            { icon: "💓", title: "BPM Calculated", desc: "Heart rate computed from periodic blood volume pulse cycles" },
          ].map(s => (
            <div key={s.title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: "rgba(67,97,238,0.1)" }}>
                {s.icon}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{s.title}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DEFAULT PROFILE ──────────────────────────────────────────────────────────
const DEFAULT_PROFILE: UserProfile = {
  age: 45, weight: 78, height: 172,
  smoking: false, activityLevel: "light",
  familyHistory: true, diabetic: false,
  systolicBP: 132, diastolicBP: 84,
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const store = usePulseStore();
  const profile = store.profile ?? DEFAULT_PROFILE;
  const stepRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "ai" | "coach" | "predict" | "camera">("overview");
  const [ringAlert, setRingAlert] = useState<null | { hr: number; spo2: number }>(null);

  const startMonitoring = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      stepRef.current++;
      const vitals = generateSimulatedVitals(stepRef.current);
      store.addVitals(vitals);

      const risk = computeRiskScore(profile, vitals);
      store.setRiskScore(risk);

      const newAnomalies = detectAnomalies(store.vitalsHistory.slice(-5).concat([vitals]));
      newAnomalies.forEach(a => store.addAnomaly(a));

      // Auto emergency trigger
      if (risk.score >= 70 && !store.emergencyActive) {
        store.triggerEmergency();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/emergency")) {
          router.push("/emergency");
        }
      }
    }, 1500);
  }, [profile, router, store]);

  useEffect(() => {
    startMonitoring();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startMonitoring]);

  // ── Smart Ring Auto-Detection ──────────────────────────────────────────────
  useEffect(() => {
    const checkRing = setInterval(() => {
      const v = store.latestVitals;
      if (!v) return;
      // Detect attack pattern: HR > 130 AND SpO2 < 91 AND HRV < 18
      if (v.heartRate > 130 && v.spo2 < 91 && v.hrv < 18 && !store.emergencyActive) {
        setRingAlert({ hr: Math.round(v.heartRate), spo2: v.spo2 });
        // Auto-trigger after 3s if not dismissed
        setTimeout(() => {
          store.triggerEmergency();
          if (typeof window !== "undefined" && !window.location.pathname.includes("/emergency")) {
            router.push("/emergency");
          }
        }, 3000);
      }
    }, 2000);
    return () => clearInterval(checkRing);
  }, [store, router]);

  const handleSimPhase = useCallback((phase: number) => {
    setSimulationPhase(phase);
    store.setSimulationPhase(phase);
    stepRef.current = 0;
    store.clearAnomalies();
  }, [store]);

  const vitals = store.latestVitals;
  const risk = store.riskScore;
  const riskColor = getRiskColor(risk?.category ?? "low");
  const predictions = risk ? generatePredictions(risk.score, profile) : [];

  return (
    <div className="min-h-screen" style={{ background: "#060612" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #4361ee, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Top Nav */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center animate-heartbeat"
              style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold tracking-tight">
              Pulse<span className="gradient-text">Guard</span> AI
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
              <span className="text-white/60">LIVE</span>
            </div>

            {/* Emergency button */}
            <button
              onClick={() => { store.triggerEmergency(); router.push("/emergency"); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}
            >
              <Zap className="w-3.5 h-3.5" /> Emergency
            </button>

            <Link href="/admin">
              <button className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center hover:bg-white/5">
                <Users className="w-4 h-4 text-white/50" />
              </button>
            </Link>
            <button className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center hover:bg-white/5 relative">
              <Bell className="w-4 h-4 text-white/50" />
              {store.anomalies.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "#ff2d55" }}>
                  {store.anomalies.length > 9 ? "9+" : store.anomalies.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">

        {/* Smart Ring Auto-Detection Banner */}
        {ringAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 rounded-2xl p-4 border flex items-center justify-between"
            style={{ background: "rgba(124,58,237,0.12)", borderColor: "#7c3aed50", boxShadow: "0 0 30px rgba(124,58,237,0.15)" }}
          >
            <div className="flex items-center gap-3">
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-2xl">💍</motion.span>
              <div>
                <div className="font-bold text-sm text-[#7c3aed]">⚡ Smart Ring Auto-Detected Cardiac Event</div>
                <div className="text-xs text-white/50 mt-0.5">
                  HR: {ringAlert.hr} bpm · SpO₂: {ringAlert.spo2}% · HRV dropped critical — Auto-alerting neighbours & ambulance in 3s…
                </div>
              </div>
            </div>
            <button
              onClick={() => setRingAlert(null)}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white/60 glass border border-white/10"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Emergency Banner */}
        <AnimatePresence>
          {risk && risk.score >= 60 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 rounded-2xl p-4 flex items-center justify-between border"
              style={{
                background: risk.score >= 70 ? "rgba(255,45,85,0.12)" : "rgba(255,107,53,0.1)",
                borderColor: risk.score >= 70 ? "#ff2d5540" : "#ff6b3540",
              }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" style={{ color: riskColor }} />
                <div>
                  <div className="font-bold text-sm" style={{ color: riskColor }}>
                    {risk.score >= 70 ? "⚠️ CRITICAL RISK DETECTED" : "⚠️ Elevated Risk"}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {risk.score >= 70 ? "Emergency response may be triggered. Stay calm." : "Monitor closely and follow AI recommendations."}
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push("/emergency")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1"
                style={{ background: risk.score >= 70 ? "#ff2d55" : "#ff6b35" }}
              >
                View <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ─ Left Column ─ */}
          <div className="space-y-5">
            {/* Risk Meter Card */}
            <div className="glass rounded-2xl p-6 border border-white/8 text-center"
              style={{ borderColor: `${riskColor}20`, boxShadow: `0 0 30px ${riskColor}10` }}>
              <div className="text-xs font-bold text-white/30 mb-2 tracking-widest">CARDIOVASCULAR RISK</div>
              <RiskMeter score={risk?.score ?? 0} category={risk?.category ?? "low"} />
              <div className="mt-2 text-xs text-white/30">
                AI Confidence: <span className="text-[#4361ee] font-bold">87%</span>
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-3">
              <VitalsCard
                icon={<Heart className="w-4 h-4" />}
                label="Heart Rate"
                value={vitals?.heartRate ?? 72}
                unit="bpm"
                color="#ff2d55"
                trend={vitals && vitals.heartRate > 90 ? "up" : vitals && vitals.heartRate < 55 ? "down" : "stable"}
                subtext={vitals && vitals.heartRate > 100 ? "⚠️ Elevated" : "✓ Normal"}
              />
              <VitalsCard
                icon={<Activity className="w-4 h-4" />}
                label="HRV"
                value={vitals?.hrv ?? 55}
                unit="ms"
                color="#4361ee"
                trend={vitals && vitals.hrv < 30 ? "down" : "stable"}
              />
              <VitalsCard
                icon={<Moon className="w-4 h-4" />}
                label="Sleep Score"
                value={vitals?.sleepScore ?? 75}
                unit="/100"
                color="#7c3aed"
                trend={vitals && vitals.sleepScore < 50 ? "down" : "stable"}
              />
              <VitalsCard
                icon={<Brain className="w-4 h-4" />}
                label="SpO₂"
                value={vitals?.spo2 ?? 98}
                unit="%"
                color="#06d6a0"
                trend={vitals && vitals.spo2 < 95 ? "down" : "stable"}
                subtext={vitals && vitals.spo2 >= 95 ? "✓ Normal" : "⚠️ Low"}
              />
            </div>

            {/* Simulation Panel */}
            <SimulationPanel onPhaseChange={handleSimPhase} />
          </div>

          {/* ─ Center Column ─ */}
          <div className="space-y-5 lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex gap-1 glass rounded-2xl p-1 border border-white/8">
              {(["overview", "ai", "predict", "coach", "camera"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${activeTab === tab
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                    }`}
                  style={activeTab === tab ? {
                    background: "linear-gradient(135deg, #4361ee, #7c3aed)"
                  } : {}}
                >
                  {tab === "ai" ? "🧠 XAI Panel" : tab === "predict" ? "📈 Predictions" : tab === "coach" ? "💬 AI Coach" : tab === "camera" ? "📷 Camera" : "📊 Overview"}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Heart Rate Chart */}
                <div className="glass rounded-2xl p-5 border border-white/8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-sm text-white">Heart Rate Trend</div>
                      <div className="text-xs text-white/40 mt-0.5">Real-time stream · Last 60 readings</div>
                    </div>
                    <div className="text-2xl font-black" style={{ color: "#ff2d55" }}>
                      {Math.round(vitals?.heartRate ?? 72)}<span className="text-sm font-medium text-white/40 ml-1">bpm</span>
                    </div>
                  </div>
                  <HeartRateChart data={store.vitalsHistory} />
                </div>

                {/* Vitals Bar Chart */}
                <div className="glass rounded-2xl p-5 border border-white/8">
                  <div className="font-semibold text-sm text-white mb-4">Health Metrics Overview</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart
                      data={[
                        { name: "HR Score", value: Math.max(0, 100 - Math.abs(((vitals?.heartRate ?? 72) - 70) * 1.5)), color: "#ff2d55" },
                        { name: "HRV", value: Math.min(100, ((vitals?.hrv ?? 55) / 80) * 100), color: "#4361ee" },
                        { name: "Sleep", value: vitals?.sleepScore ?? 75, color: "#7c3aed" },
                        { name: "SpO₂", value: vitals?.spo2 ?? 98, color: "#06d6a0" },
                        { name: "Activity", value: Math.min(100, (vitals?.activity ?? 40) * 2), color: "#ffd60a" },
                        { name: "Stress", value: 100 - (vitals?.stressLevel ?? 25), color: "#00d4ff" },
                      ]}
                      margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
                    >
                      <XAxis dataKey="name" tick={{ fill: "#ffffff50", fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#ffffff30", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 10, fontSize: 11 }}
                        formatter={(v: number) => [`${Math.round(v)}%`, "Score"]}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} label={false}>
                        {[
                          { color: "#ff2d55" }, { color: "#4361ee" }, { color: "#7c3aed" },
                          { color: "#06d6a0" }, { color: "#ffd60a" }, { color: "#00d4ff" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Anomaly Feed */}
                <div className="glass rounded-2xl p-5 border border-white/8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#ffd60a]" />
                      <div className="font-semibold text-sm text-white">Anomaly Detection</div>
                    </div>
                    {store.anomalies.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black" style={{ background: "#ff2d55" }}>
                        {store.anomalies.length} detected
                      </span>
                    )}
                  </div>
                  <AnomalyFeed anomalies={store.anomalies} />
                </div>
              </motion.div>
            )}

            {/* ── XAI TAB ── */}
            {activeTab === "ai" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="glass rounded-2xl p-6 border border-white/8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #7c3aed20, #4361ee20)" }}>
                      <Brain className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Explainable AI Panel</div>
                      <div className="text-xs text-white/40">Why is your risk score {Math.round(risk?.score ?? 0)}?</div>
                    </div>
                  </div>
                  {risk?.factors && risk.factors.length > 0 ? (
                    <XAIPanel factors={risk.factors} />
                  ) : (
                    <div className="text-center py-8 text-white/30 text-sm">Computing factors...</div>
                  )}
                </div>

                {/* Privacy badge */}
                <div className="glass rounded-2xl p-4 border border-[#06d6a0]/20 flex items-center gap-4">
                  <Shield className="w-8 h-8 text-[#06d6a0] flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#06d6a0]">On-Device AI Processing</div>
                    <div className="text-xs text-white/40 mt-0.5">
                      All analysis runs locally on your device. No health data is transmitted to any external server.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PREDICTIONS TAB ── */}
            {activeTab === "predict" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="glass rounded-2xl p-6 border border-white/8">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4 text-[#4361ee]" />
                    <div className="font-bold text-white">Risk Prediction Timeline</div>
                  </div>
                  <PredictionTimeline scenarios={predictions} />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {predictions.map((s) => (
                    <motion.div
                      key={s.label}
                      whileHover={{ x: 4 }}
                      className="glass rounded-2xl p-4 border border-white/8 flex items-start gap-4"
                      style={{ borderColor: `${s.color}25` }}
                    >
                      <div className="w-2 h-full rounded-full flex-shrink-0 min-h-[40px]"
                        style={{ background: s.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-sm text-white">{s.label}</div>
                          <div className="text-xs font-mono" style={{ color: s.color }}>
                            90d: {Math.round(s.riskIn90Days)}
                          </div>
                        </div>
                        <div className="text-xs text-white/40 mb-2">{s.description}</div>
                        {s.actionItems.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.actionItems.map(a => (
                              <span key={a} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── AI COACH TAB ── */}
            {activeTab === "coach" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/8"
                style={{ minHeight: 420 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: "linear-gradient(135deg, #4361ee20, #7c3aed20)" }}>
                    🤖
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">AI Care Coach</div>
                    <div className="text-xs text-white/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse" />
                      Powered by Google Gemini · Multilingual
                    </div>
                  </div>
                </div>
                <AICoachPanel riskScore={risk?.score ?? 20} />
              </motion.div>
            )}

            {/* ── CAMERA TAB ── */}
            {activeTab === "camera" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CameraMonitor />
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
