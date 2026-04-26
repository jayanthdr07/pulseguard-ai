"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, User, Stethoscope, Truck, Shield, Globe } from "lucide-react";
import Link from "next/link";

const ROLES = [
  {
    id: "patient",
    label: "Patient",
    icon: <User className="w-5 h-5" />,
    emoji: "🧑‍⚕️",
    desc: "Monitor your cardiovascular health in real-time",
    color: "#4361ee",
    href: "/dashboard",
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: <Stethoscope className="w-5 h-5" />,
    emoji: "👨‍⚕️",
    desc: "View patient alerts and clinical summaries",
    color: "#06d6a0",
    href: "/admin",
  },
  {
    id: "driver",
    label: "Ambulance Driver",
    icon: <Truck className="w-5 h-5" />,
    emoji: "🚑",
    desc: "Accept emergency requests and navigate to patients",
    color: "#ff6b35",
    href: "/driver/login",
  },
  {
    id: "admin",
    label: "Admin",
    icon: <Shield className="w-5 h-5" />,
    emoji: "🗺️",
    desc: "Population health analytics and command center",
    color: "#7c3aed",
    href: "/admin",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState("English");

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      {/* Left — Brand Panel */}
      <div
        className="hidden md:flex flex-col justify-between w-[45%] p-12 text-white"
        style={{ background: "linear-gradient(135deg, #14b8a6 0%, #059669 100%)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <div className="text-xl font-bold">PulseGuard AI</div>
              <div className="text-white/70 text-xs">AI-powered cardiovascular early-warning</div>
            </div>
          </div>

          <h1 className="text-4xl font-black leading-tight mb-6">
            Stop heart disease<br />before it stops you.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            AI-powered cardiovascular risk monitoring for urban and rural India.
            Smart ring integration. No wearable required.
          </p>

          <div className="space-y-4">
            {[
              "Real-time risk scoring with Explainable AI",
              "Auto emergency dispatch — no button needed",
              "Bengaluru ambulance tracker with live GPS",
              "Smart ring detects attacks automatically",
              "Instant SMS to family, neighbours & driver",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-white/85 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/40 text-xs">
          Built with Google Gemini AI · Bengaluru Smart City Initiative
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Language selector */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
          >
            {["English", "ಕನ್ನಡ", "हिंदी", "தமிழ்", "తెలుగు", "മലയാളം"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #14b8a6, #059669)" }}>
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-gray-800">PulseGuard AI</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your PulseGuard account</p>

          <form onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }} className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-teal-400 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-teal-400 transition-colors bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #14b8a6, #059669)" }}
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mb-6">
            No account?{" "}
            <Link href="/onboarding" className="text-teal-600 font-semibold hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo role buttons */}
          <div className="border-t border-gray-100 pt-6">
            <div className="text-xs font-bold text-gray-400 text-center mb-4 tracking-widest">
              HACKATHON DEMO — ONE CLICK ACCESS
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(role.href)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 bg-white text-left hover:shadow-sm transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-sm"
                    style={{ background: role.color }}
                  >
                    {role.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-700">{role.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{role.desc.slice(0, 28)}…</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
