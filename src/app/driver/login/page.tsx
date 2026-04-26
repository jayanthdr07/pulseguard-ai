"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Truck, Eye, EyeOff, Phone, Lock, AlertCircle } from "lucide-react";

const DEMO_DRIVERS = [
  { id: "PG-117", name: "Ravi Kumar", phone: "9800155432", password: "driver123", vehicle: "MH 01 AB 1234" },
  { id: "PG-118", name: "Suresh Babu", phone: "9900266543", password: "driver123", vehicle: "KA 05 CD 5678" },
];

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const driver = DEMO_DRIVERS.find(d => d.phone === phone && d.password === password);
    if (driver) {
      router.push("/driver");
    } else {
      setError("Invalid credentials. Try demo: phone 9800155432, password driver123");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#0f172a" }}>
      {/* Left panel */}
      <div className="md:w-1/2 flex flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ff6b35 0%, #ff2d55 100%)" }}>
        {/* Background circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.3)" }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: "rgba(255,255,255,0.3)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🚑</div>
            <div>
              <div className="text-xl font-black text-white">PulseGuard AI</div>
              <div className="text-white/60 text-xs">Emergency Response Network</div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Ambulance<br />Driver Portal
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-8">
            Real-time emergency dispatch, live patient vitals, and Bengaluru navigation — all in one dashboard.
          </p>

          <div className="space-y-3">
            {[
              "🗺️ Real-time Bengaluru GPS navigation",
              "💓 Live patient vitals before arrival",
              "🔔 Instant emergency notifications",
              "📱 One-tap accept & route planning",
              "🏥 Direct hospital communication",
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/85 text-sm">{f}</div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">BBMP Emergency Services · Bengaluru</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#0f172a" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
            style={{ background: "linear-gradient(135deg, #ff6b35, #ff2d55)" }}>
            🚑
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Driver Sign In</h2>
          <p className="text-white/40 text-sm mb-8">Access your emergency dispatch dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9800155432"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none border transition-colors"
                  style={{
                    background: "#1e293b",
                    borderColor: error ? "#ff2d55" : "#334155",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#ff6b35"; }}
                  onBlur={e => { e.target.style.borderColor = error ? "#ff2d55" : "#334155"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm text-white outline-none border transition-colors"
                  style={{ background: "#1e293b", borderColor: error ? "#ff2d55" : "#334155" }}
                  onFocus={e => { e.target.style.borderColor = "#ff6b35"; }}
                  onBlur={e => { e.target.style.borderColor = error ? "#ff2d55" : "#334155"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-start gap-2 rounded-xl p-3 text-xs"
                style={{ background: "#ff2d5515", border: "1px solid #ff2d5530", color: "#ff6b81" }}>
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff2d55)" }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <><Truck className="w-4 h-4" /> Sign In to Dashboard</>
              )}
            </motion.button>
          </form>

          {/* Demo cards */}
          <div className="mt-8">
            <div className="text-xs font-bold text-white/20 text-center tracking-widest mb-4">DEMO CREDENTIALS</div>
            <div className="space-y-2">
              {DEMO_DRIVERS.map(d => (
                <motion.button
                  key={d.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setPhone(d.phone); setPassword(d.password); setError(""); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all"
                  style={{ background: "#1e293b", borderColor: "#334155" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #ff6b3520, #ff2d5520)" }}>🚑</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{d.name}</div>
                    <div className="text-xs text-white/40">Unit {d.id} · {d.vehicle}</div>
                  </div>
                  <div className="text-xs text-[#ff6b35] font-semibold">Use →</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/login" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              ← Back to main login
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
