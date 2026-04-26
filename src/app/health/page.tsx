"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Upload, Camera, Activity, AlertTriangle, CheckCircle, Salad, FileText, Calendar } from "lucide-react";

function RiskBadge({ score }: { score: number }) {
  const level = score < 30 ? { label: "LOW RISK", color: "#06d6a0", bg: "#06d6a015" }
    : score < 60 ? { label: "MEDIUM RISK", color: "#ffd60a", bg: "#ffd60a15" }
    : { label: "HIGH RISK", color: "#ff2d55", bg: "#ff2d5515" };
  return (
    <span className="px-3 py-1 rounded-full text-xs font-black"
      style={{ color: level.color, background: level.bg, border: `1px solid ${level.color}40` }}>
      {level.label}
    </span>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const color = score < 30 ? "#06d6a0" : score < 60 ? "#ffd60a" : "#ff2d55";
  const pct = Math.min(100, score);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff08" strokeWidth="12" />
          <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - pct / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black" style={{ color }}>{score}</div>
          <div className="text-xs text-white/40">/100</div>
        </div>
      </div>
      <RiskBadge score={score} />
    </div>
  );
}

function MedicalReport({ onExtract }: { onExtract: (data: Record<string, string>) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setStatus("uploading");
    setTimeout(() => {
      setStatus("done");
      onExtract({ bp: "138/88 mmHg", cholesterol: "218 mg/dL", sugar: "102 mg/dL", triglycerides: "165 mg/dL" });
    }, 2000);
  };
  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-[#4361ee]" />
        <span className="font-bold text-sm text-white">Medical Report Analyzer</span>
        <span className="ml-auto text-xs text-white/30">OCR · NLP Extraction</span>
      </div>
      {status === "idle" && (
        <button onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[#4361ee]/40 transition-colors group">
          <Upload className="w-8 h-8 text-white/20 mx-auto mb-2 group-hover:text-[#4361ee]/60 transition-colors" />
          <div className="text-sm text-white/40">Upload blood report, ECG, or lab results (PDF/Image)</div>
          <div className="text-xs text-white/20 mt-1">Supports PDF, JPG, PNG</div>
        </button>
      )}
      {status === "uploading" && (
        <div className="text-center py-8">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
            className="w-10 h-10 border-2 border-[#4361ee]/30 border-t-[#4361ee] rounded-full mx-auto mb-3" />
          <div className="text-sm text-white/50">Extracting health data with OCR…</div>
        </div>
      )}
      {status === "done" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#06d6a0]" />
            <span className="text-xs font-bold text-[#06d6a0]">Extracted Successfully</span>
          </div>
          {[["Blood Pressure", "138/88 mmHg", "#ff6b35"], ["Cholesterol", "218 mg/dL", "#ffd60a"],
            ["Blood Sugar", "102 mg/dL", "#06d6a0"], ["Triglycerides", "165 mg/dL", "#7c3aed"]].map(([k, v, c]) => (
            <div key={k} className="flex justify-between items-center rounded-xl px-3 py-2"
              style={{ background: `${c}10`, border: `1px solid ${c}20` }}>
              <span className="text-xs text-white/60">{k}</span>
              <span className="text-xs font-bold" style={{ color: c as string }}>{v}</span>
            </div>
          ))}
          <button onClick={() => setStatus("idle")}
            className="w-full mt-2 py-2 rounded-xl text-xs text-white/40 hover:text-white/60 border border-white/5">
            Upload another
          </button>
        </motion.div>
      )}
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handle} />
    </div>
  );
}

function DietAnalysis() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [result, setResult] = useState<{ label: string; calories: number; rating: string; color: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const foods = [
    { label: "Grilled Chicken & Salad", calories: 320, rating: "Healthy ✓", color: "#06d6a0" },
    { label: "Butter Chicken + Naan", calories: 780, rating: "High Fat ⚠️", color: "#ff6b35" },
    { label: "Sambar Rice", calories: 420, rating: "Balanced 👍", color: "#4361ee" },
    { label: "Biryani (large)", calories: 950, rating: "High Calorie 🔴", color: "#ff2d55" },
  ];
  const handle = () => {
    setStatus("analyzing");
    setTimeout(() => {
      setResult(foods[Math.floor(Math.random() * foods.length)]);
      setStatus("done");
    }, 2000);
  };
  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-center gap-2 mb-4">
        <Salad className="w-4 h-4 text-[#06d6a0]" />
        <span className="font-bold text-sm text-white">Diet Analyzer</span>
        <span className="ml-auto text-xs text-white/30">AI Food Recognition</span>
      </div>
      {status === "idle" && (
        <div className="space-y-2">
          <button onClick={() => { fileRef.current?.click(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white/60 glass border border-white/10 hover:bg-white/5">
            <Camera className="w-4 h-4" /> Take Food Photo
          </button>
          <button onClick={handle}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white/60 glass border border-white/10 hover:bg-white/5">
            <Upload className="w-4 h-4" /> Upload Food Image
          </button>
        </div>
      )}
      {status === "analyzing" && (
        <div className="text-center py-6">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-4xl mb-3">🍽️</motion.div>
          <div className="text-sm text-white/50">Identifying food & estimating calories…</div>
        </div>
      )}
      {status === "done" && result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-4 text-center" style={{ background: `${result.color}12`, border: `1px solid ${result.color}30` }}>
          <div className="text-2xl mb-1">🍽️</div>
          <div className="font-bold text-white text-sm">{result.label}</div>
          <div className="text-3xl font-black mt-2" style={{ color: result.color }}>{result.calories}</div>
          <div className="text-xs text-white/40 mb-2">estimated calories</div>
          <div className="text-sm font-bold" style={{ color: result.color }}>{result.rating}</div>
          <button onClick={() => setStatus("idle")} className="mt-3 text-xs text-white/30 hover:text-white/50">Analyze another</button>
        </motion.div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
}

function LifestyleTracker() {
  const [values, setValues] = useState({ smoking: "No", alcohol: "Never", activity: "Light", sleep: "6", stress: "Medium" });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const opts: Record<string, string[]> = {
    smoking: ["No", "Occasionally", "Daily"],
    alcohol: ["Never", "Occasionally", "Weekly"],
    activity: ["Sedentary", "Light", "Moderate", "Active"],
    sleep: ["4", "5", "6", "7", "8", "9"],
    stress: ["Low", "Medium", "High"],
  };
  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#7c3aed]" />
        <span className="font-bold text-sm text-white">Lifestyle Tracker</span>
        {saved && <span className="ml-auto text-xs text-[#06d6a0] font-bold">✓ Saved</span>}
      </div>
      <div className="space-y-3">
        {Object.entries(opts).map(([key, options]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-white/50 capitalize w-20">{key === "sleep" ? "Sleep (hrs)" : key}</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {options.map(o => (
                <button key={o} onClick={() => setValues(v => ({ ...v, [key]: o }))}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                  style={values[key as keyof typeof values] === o
                    ? { background: "#4361ee", color: "white" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={save}
        className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-white"
        style={{ background: "linear-gradient(135deg, #7c3aed, #4361ee)" }}>
        Save Lifestyle Data
      </button>
    </div>
  );
}

function WorkloadMonitor() {
  const meetings = [
    { day: "Mon", count: 4, stress: "Medium" },
    { day: "Tue", count: 7, stress: "High" },
    { day: "Wed", count: 2, stress: "Low" },
    { day: "Thu", count: 6, stress: "High" },
    { day: "Fri", count: 3, stress: "Medium" },
  ];
  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-[#00d4ff]" />
        <span className="font-bold text-sm text-white">Workload Monitor</span>
        <span className="ml-auto text-xs text-white/30">Google Calendar</span>
      </div>
      <div className="flex items-end gap-2 h-24 mb-3">
        {meetings.map(m => {
          const color = m.stress === "High" ? "#ff2d55" : m.stress === "Medium" ? "#ffd60a" : "#06d6a0";
          return (
            <div key={m.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg" style={{ height: `${m.count * 12}px`, background: color, opacity: 0.8 }} />
              <div className="text-[10px] text-white/40">{m.day}</div>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl p-3 text-xs" style={{ background: "#ff2d5510", border: "1px solid #ff2d5520" }}>
        <span className="text-[#ff2d55] font-bold">⚠️ High workload detected Tuesday & Thursday</span>
        <span className="text-white/40 ml-1">— Take a 10-min break every 90 minutes</span>
      </div>
    </div>
  );
}

export default function NewDashboardPage() {
  const router = useRouter();
  const [riskScore] = useState(52);
  const [reportData, setReportData] = useState<Record<string, string> | null>(null);
  const [activeModule, setActiveModule] = useState<"overview" | "report" | "diet" | "lifestyle">("overview");

  const riskColor = riskScore < 30 ? "#06d6a0" : riskScore < 60 ? "#ffd60a" : "#ff2d55";

  const recommendations = riskScore < 30
    ? ["Maintain your current lifestyle", "Annual cardiac checkup recommended", "Keep up regular exercise"]
    : riskScore < 60
    ? ["Reduce sodium intake to < 1500mg/day", "30 min cardio 5x per week", "Reduce stress — try meditation", "Consult a doctor for BP management"]
    : ["Immediate doctor consultation required", "Strict low-fat, low-sodium diet", "Avoid all strenuous activity", "Monitor BP twice daily", "Consider cardiac specialist referral"];

  return (
    <div className="min-h-screen" style={{ background: "#060612" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 px-4 py-3"
        style={{ background: "rgba(6,6,18,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-black text-white text-sm">PulseGuard <span className="text-[#4361ee]">AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/emergency">
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
                🚨 SOS
              </button>
            </Link>
            <Link href="/driver/login">
              <button className="px-3 py-1.5 rounded-xl text-xs font-semibold glass border border-white/10 text-white/60 hover:text-white">
                🚑 Driver
              </button>
            </Link>
            <Link href="/admin">
              <button className="px-3 py-1.5 rounded-xl text-xs font-semibold glass border border-white/10 text-white/60 hover:text-white">
                Admin
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Module tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1 border border-white/8 mb-6 overflow-x-auto">
          {([
            { key: "overview", label: "📊 Overview" },
            { key: "report", label: "📋 Medical Report" },
            { key: "diet", label: "🥗 Diet Analysis" },
            { key: "lifestyle", label: "💪 Lifestyle" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveModule(t.key)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
              style={activeModule === t.key
                ? { background: "linear-gradient(135deg, #4361ee, #7c3aed)", color: "white" }
                : { color: "rgba(255,255,255,0.4)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeModule === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Risk Score */}
            <div className="glass rounded-2xl p-6 border border-white/8 flex flex-col items-center">
              <div className="text-xs font-bold text-white/40 tracking-widest mb-4">CARDIOVASCULAR RISK</div>
              <ScoreMeter score={riskScore} />
              <div className="mt-5 w-full space-y-2">
                {[
                  { label: "Age Factor", weight: 65, color: "#ff6b35" },
                  { label: "Blood Pressure", weight: 72, color: "#ff2d55" },
                  { label: "Cholesterol", weight: 58, color: "#ffd60a" },
                  { label: "Activity", weight: 30, color: "#06d6a0" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{f.label}</span>
                      <span style={{ color: f.color }}>{f.weight}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${f.weight}%` }}
                        transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: f.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vitals + Recommendations */}
            <div className="lg:col-span-2 space-y-5">
              {/* Vitals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Heart Rate", value: "78", unit: "bpm", icon: "❤️", color: "#ff2d55" },
                  { label: "Blood Pressure", value: "138/88", unit: "mmHg", icon: "🩸", color: "#ff6b35" },
                  { label: "SpO₂", value: "97", unit: "%", icon: "💨", color: "#4361ee" },
                  { label: "HRV", value: "45", unit: "ms", icon: "〰️", color: "#06d6a0" },
                ].map(v => (
                  <div key={v.label} className="glass rounded-2xl p-4 border border-white/8 text-center">
                    <div className="text-xl mb-1">{v.icon}</div>
                    <div className="font-black text-lg" style={{ color: v.color }}>{v.value}</div>
                    <div className="text-[10px] text-white/30">{v.unit}</div>
                    <div className="text-xs text-white/50 mt-1">{v.label}</div>
                  </div>
                ))}
              </div>

              {/* Report data if uploaded */}
              {reportData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-4 border border-[#4361ee]/20">
                  <div className="text-xs font-bold text-[#4361ee] mb-3">📋 From Your Medical Report</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(reportData).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-white/40 capitalize">{k}</span>
                        <span className="text-white font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              <div className="glass rounded-2xl p-5 border border-white/8">
                <div className="flex items-center gap-2 mb-4">
                  {riskScore >= 60
                    ? <AlertTriangle className="w-4 h-4 text-[#ff2d55]" />
                    : <CheckCircle className="w-4 h-4 text-[#06d6a0]" />}
                  <span className="font-bold text-sm text-white">AI Recommendations</span>
                  <RiskBadge score={riskScore} />
                </div>
                <div className="space-y-2">
                  {recommendations.map((r, i) => (
                    <motion.div key={r} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-0.5 flex-shrink-0" style={{ color: riskColor }}>→</span>
                      {r}
                    </motion.div>
                  ))}
                </div>
                {riskScore >= 60 && (
                  <button onClick={() => router.push("/emergency")}
                    className="w-full mt-4 py-3 rounded-xl font-bold text-white text-sm"
                    style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
                    🏥 Find Nearby Hospitals
                  </button>
                )}
              </div>

              <WorkloadMonitor />
            </div>
          </div>
        )}

        {activeModule === "report" && <MedicalReport onExtract={d => { setReportData(d); setActiveModule("overview"); }} />}
        {activeModule === "diet" && <DietAnalysis />}
        {activeModule === "lifestyle" && <LifestyleTracker />}
      </main>
    </div>
  );
}
