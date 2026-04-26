"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import {
  Heart, Shield, Zap, Brain, Activity, AlertTriangle,
  ChevronRight, Check, Globe, Lock, Cpu, Bell, MapPin
} from "lucide-react";

// Animated ECG wave component
function ECGWave() {
  return (
    <svg viewBox="0 0 800 120" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4361ee" stopOpacity="0" />
          <stop offset="30%" stopColor="#4361ee" stopOpacity="1" />
          <stop offset="70%" stopColor="#7c3aed" stopOpacity="1" />
          <stop offset="100%" stopColor="#ff2d55" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="ecg-line"
        d="M0,60 L80,60 L100,60 L110,20 L120,90 L130,10 L145,100 L158,60 L200,60 L280,60 L300,60 L310,20 L320,90 L330,10 L345,100 L358,60 L400,60 L480,60 L500,60 L510,20 L520,90 L530,10 L545,100 L558,60 L600,60 L680,60 L700,60 L710,20 L720,90 L730,10 L745,100 L758,60 L800,60"
        fill="none"
        stroke="url(#ecgGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Animated heart rate number
function LiveHeartRate() {
  const [bpm, setBpm] = useState(72);

  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(72 + Math.floor(Math.sin(Date.now() / 2000) * 5 + Math.random() * 4 - 2));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={bpm}
      initial={{ scale: 1.2, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-6xl font-bold gradient-text"
    >
      {bpm}
    </motion.div>
  );
}

const features = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Camera-Based Heart Rate",
    desc: "Detect your pulse using just your smartphone camera — no wearable needed.",
    color: "#ff2d55",
    grad: "from-[#ff2d55]/20 to-[#ff6b35]/5",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Explainable AI",
    desc: "Understand EXACTLY why your risk score changed with SHAP-style factor breakdown.",
    color: "#7c3aed",
    grad: "from-[#7c3aed]/20 to-[#4361ee]/5",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Anomaly Detection",
    desc: "Detects arrhythmia, tachycardia and HRV drops in real-time before symptoms appear.",
    color: "#ffd60a",
    grad: "from-[#ffd60a]/20 to-[#ff6b35]/5",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Emergency Response",
    desc: "Instantly notifies hospital, ambulance and family when critical risk is detected.",
    color: "#ff6b35",
    grad: "from-[#ff6b35]/20 to-[#ff2d55]/5",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Passive Monitoring",
    desc: "Tracks sleep, steps and stress automatically — zero manual input required.",
    color: "#06d6a0",
    grad: "from-[#06d6a0]/20 to-[#00d4ff]/5",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multilingual AI Coach",
    desc: "Personalized health advice in your language, 24/7 — powered by Google Gemini.",
    color: "#4361ee",
    grad: "from-[#4361ee]/20 to-[#7c3aed]/5",
  },
];

const stats = [
  { value: "87%", label: "Prediction Accuracy" },
  { value: "< 30s", label: "Anomaly Detection" },
  { value: "3min", label: "Emergency Response" },
  { value: "100%", label: "On-Device Privacy" },
];

const steps = [
  { num: "01", title: "Onboard in 60 Seconds", desc: "Chat with our AI. Tell us about yourself. No boring forms.", icon: "💬" },
  { num: "02", title: "AI Starts Monitoring", desc: "Camera-based pulse detection + passive sensors work silently.", icon: "🔍" },
  { num: "03", title: "Risk Score Calculated", desc: "Our model scores your cardiovascular risk every 30 seconds.", icon: "🧠" },
  { num: "04", title: "Emergency if Critical", desc: "Hospital, ambulance and family notified instantly.", icon: "🚨" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #4361ee 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ff2d55 0%, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-heartbeat"
              style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Pulse<span className="gradient-text">Guard</span> AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#technology" className="hover:text-white transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/health">
              <button className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
                Health
              </button>
            </Link>
            <Link href="/login">
              <button className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/driver/login">
              <button className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
                🚑 Driver
              </button>
            </Link>
            <Link href="/onboarding">
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
              >
                Start Free
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm text-white/70 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
          AI-Powered Cardiovascular Intelligence
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", color: "white" }}>
            NEW
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none max-w-5xl"
        >
          <span className="text-white">Predict. </span>
          <span className="gradient-text">Prevent. </span>
          <span className="gradient-text-danger">Protect.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed"
        >
          The world&apos;s first autonomous cardiovascular AI that detects risk before it happens,
          explains every decision, and triggers emergency response in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link href="/onboarding">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-3 shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                boxShadow: "0 0 40px rgba(67,97,238,0.4)",
              }}
            >
              <Heart className="w-5 h-5" fill="white" />
              Start Monitoring Free
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-semibold text-white text-lg glass border border-white/10"
            >
              View Live Demo →
            </motion.button>
          </Link>
        </motion.div>

        {/* Live heart rate display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-strong rounded-3xl p-8 max-w-md w-full mx-auto border border-white/10 glow-blue"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06d6a0] animate-pulse" />
              <span className="text-sm text-white/50 font-medium">LIVE MONITORING</span>
            </div>
            <span className="text-xs text-white/30 font-mono">Real-time</span>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <LiveHeartRate />
            <div className="mb-2">
              <span className="text-lg text-white/40 font-medium">BPM</span>
              <div className="text-xs text-[#06d6a0] font-semibold mt-1">✓ NORMAL</div>
            </div>
          </div>
          <div className="h-16 -mx-2">
            <ECGWave />
          </div>
          <div className="flex justify-between mt-3 text-xs text-white/30 font-mono">
            <span>SpO₂ 98%</span>
            <span>HRV 58ms</span>
            <span>Stress 22%</span>
          </div>
        </motion.div>
      </motion.section>

      {/* Stats */}
      <section className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="gradient-text">Intelligence</span> at Every Beat
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              PulseGuard AI combines camera-based vitals, machine learning, and emergency automation
              into one unified health guardian.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`glass rounded-2xl p-6 border border-white/8 bg-gradient-to-br ${feat.grad} group cursor-default`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}20`, color: feat.color, border: `1px solid ${feat.color}30` }}
                >
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feat.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 grid-overlay">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              From Detection to <span className="gradient-text-danger">Action</span>
            </h2>
            <p className="text-white/50 text-lg">Complete loop. Zero delays.</p>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#4361ee] via-[#7c3aed] to-[#ff2d55] opacity-30" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 rounded-2xl glass-strong border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4 relative z-10">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-white/30 mb-1 font-mono">{step.num}</div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-6 text-white">
              Privacy-First <br /><span className="gradient-text">On-Device AI</span>
            </h2>
            <p className="text-white/50 mb-8 leading-relaxed">
              Your health data never leaves your device. Our AI runs entirely on-device using
              Google&apos;s ML technology — delivering hospital-grade analysis with consumer-grade privacy.
            </p>
            <div className="space-y-4">
              {[
                { icon: <Lock className="w-4 h-4" />, text: "End-to-end encrypted health data", color: "#06d6a0" },
                { icon: <Cpu className="w-4 h-4" />, text: "On-device AI — no cloud exposure", color: "#4361ee" },
                { icon: <Shield className="w-4 h-4" />, text: "HIPAA-compliant architecture", color: "#7c3aed" },
                { icon: <Bell className="w-4 h-4" />, text: "Instant alerts without data selling", color: "#ffd60a" },
                { icon: <MapPin className="w-4 h-4" />, text: "GPS used only during emergencies", color: "#ff6b35" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="text-white/70 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-8 border border-white/10"
          >
            <div className="text-sm font-mono text-white/30 mb-4">AI RISK ASSESSMENT</div>
            <div className="space-y-4">
              {[
                { label: "Rising Heart Rate Trend", value: 78, color: "#ff6b35" },
                { label: "Low Activity Score", value: 65, color: "#ffd60a" },
                { label: "Poor Sleep Quality", value: 52, color: "#ff2d55" },
                { label: "Family History", value: 40, color: "#7c3aed" },
                { label: "Stress Indicator", value: 35, color: "#4361ee" },
              ].map((item, i) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60 text-xs">{item.label}</span>
                    <span className="text-white/80 font-bold text-xs">+{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-white/30 mb-1">OVERALL RISK</div>
                <div className="text-2xl font-black" style={{ color: "#ff6b35" }}>HIGH — 67</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/30 mb-1">CONFIDENCE</div>
                <div className="text-2xl font-black text-white">87%</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass-strong rounded-3xl p-16 border border-white/10"
          style={{ boxShadow: "0 0 80px rgba(67,97,238,0.15)" }}
        >
          <div className="text-5xl mb-6 animate-float">🫀</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Your Heart Can&apos;t Wait.<br />
            <span className="gradient-text">Neither Should You.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Join thousands protecting their hearts with AI that detects risk before symptoms appear.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-3"
                style={{
                  background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                  boxShadow: "0 0 50px rgba(67,97,238,0.5)",
                }}
              >
                <Heart className="w-5 h-5" fill="white" />
                Start Monitoring Now
              </motion.button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-white/30">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#06d6a0]" /> Free Forever</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#06d6a0]" /> No Wearable Needed</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#06d6a0]" /> Privacy First</div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#ff2d55]" fill="#ff2d55" />
            <span className="text-white/40 text-sm">PulseGuard AI © 2026 — Built with Google Technologies</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
            <Link href="/admin" className="hover:text-white/60 transition-colors">Admin</Link>
            <Link href="/driver" className="hover:text-white/60 transition-colors">Driver</Link>
            <Link href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</Link>
            <Link href="/emergency" className="hover:text-white/60 transition-colors">Emergency</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
