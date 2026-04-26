"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, AlertTriangle, TrendingUp, MapPin, Activity,
  Shield, Bell, ArrowLeft, Heart, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from "recharts";
import Link from "next/link";

// ── Simulated Population Data ────────────────────────────────────────────────
const REGIONS = [
  { name: "Bengaluru North", users: 4821, critical: 23, high: 189, moderate: 812, low: 3797, lat: 13.1, lng: 77.6 },
  { name: "Bengaluru South", users: 3654, critical: 18, high: 145, moderate: 623, low: 2868, lat: 12.9, lng: 77.5 },
  { name: "Bengaluru East", users: 2903, critical: 31, high: 201, moderate: 541, low: 2130, lat: 13.0, lng: 77.7 },
  { name: "Bengaluru West", users: 1987, critical: 9, high: 87, moderate: 345, low: 1546, lat: 12.9, lng: 77.4 },
  { name: "HSR Layout", users: 1205, critical: 6, high: 54, moderate: 213, low: 932, lat: 12.9, lng: 77.6 },
  { name: "Whitefield", users: 2345, critical: 14, high: 112, moderate: 423, low: 1796, lat: 12.9, lng: 77.7 },
];

const HIGH_RISK_ALERTS = [
  { id: "U-00341", name: "Raj Kumar, 58", region: "Bengaluru East", score: 84, hr: 134, since: "12 min ago", status: "critical" },
  { id: "U-00892", name: "Meena Sharma, 62", region: "HSR Layout", score: 79, hr: 121, since: "28 min ago", status: "critical" },
  { id: "U-01143", name: "Vikram Nair, 51", region: "Whitefield", score: 71, hr: 115, since: "45 min ago", status: "high" },
  { id: "U-00234", name: "Anitha Rao, 67", region: "Bengaluru North", score: 68, hr: 108, since: "1 hr ago", status: "high" },
  { id: "U-00671", name: "Suresh Babu, 44", region: "Bengaluru South", score: 63, hr: 102, since: "2 hr ago", status: "high" },
];

const AGE_DISTRIBUTION = [
  { range: "18-25", count: 2130, risk: 12 },
  { range: "26-35", count: 3890, risk: 18 },
  { range: "36-45", count: 4210, risk: 32 },
  { range: "46-55", count: 3650, risk: 48 },
  { range: "56-65", count: 2100, risk: 61 },
  { range: "65+", count: 935, risk: 74 },
];

function generateTrendData() {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    critical: Math.max(0, 15 + Math.sin(i * 0.5) * 8 + Math.random() * 5),
    high: Math.max(0, 80 + Math.cos(i * 0.3) * 20 + Math.random() * 10),
    moderate: Math.max(0, 250 + Math.sin(i * 0.2) * 40 + Math.random() * 20),
  }));
}

// ── Stats Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, color, trend
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub: string; color: string; trend?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-5 border border-white/8"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs"
            style={{ color: trend > 0 ? "#ff6b35" : "#06d6a0" }}>
            <TrendingUp className="w-3 h-3" />
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-white mb-0.5">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-xs mt-1" style={{ color }}>{sub}</div>
    </motion.div>
  );
}

// ── Population Heatmap ────────────────────────────────────────────────────────
function PopulationHeatmap({ regions }: { regions: typeof REGIONS }) {
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: 320 }}>
      {/* Map base */}
      <div className="absolute inset-0" style={{
        background: "#0a0f1a",
        backgroundImage: `
          linear-gradient(rgba(67,97,238,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(67,97,238,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}>
        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#4361ee" strokeWidth="1.5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#4361ee" strokeWidth="1.5" />
          <line x1="25%" y1="0" x2="75%" y2="100%" stroke="#4361ee" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="75%" y1="0" x2="25%" y2="100%" stroke="#4361ee" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Region markers */}
        {[
          { x: "20%", y: "20%", region: regions[0] },
          { x: "45%", y: "65%", region: regions[1] },
          { x: "72%", y: "35%", region: regions[2] },
          { x: "18%", y: "70%", region: regions[3] },
          { x: "58%", y: "72%", region: regions[4] },
          { x: "78%", y: "68%", region: regions[5] },
        ].map(({ x, y, region }) => {
          const maxRisk = Math.max(region.critical / region.users, 0.001) * 1000;
          const size = Math.max(40, Math.min(80, region.users / 80));
          const color = region.critical > 20 ? "#ff2d55" : region.critical > 12 ? "#ff6b35" : "#ffd60a";

          return (
            <motion.div
              key={region.name}
              className="absolute flex flex-col items-center"
              style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}
              whileHover={{ scale: 1.2, zIndex: 10 }}
            >
              {/* Heatmap blob */}
              <div
                className="absolute rounded-full opacity-20"
                style={{
                  width: size * 1.8,
                  height: size * 1.8,
                  background: color,
                  filter: "blur(20px)",
                  transform: "translate(-50%,-50%)",
                  top: "50%",
                  left: "50%",
                }}
              />
              <div
                className="rounded-full flex items-center justify-center relative z-10 cursor-pointer"
                style={{
                  width: size * 0.7,
                  height: size * 0.7,
                  background: `${color}25`,
                  border: `2px solid ${color}60`,
                }}
              >
                <div className="text-center">
                  <div className="text-xs font-black" style={{ color }}>{region.critical}</div>
                </div>
              </div>
              <div className="text-xs font-medium text-white/60 mt-1.5 whitespace-nowrap bg-black/50 px-2 py-0.5 rounded-full"
                style={{ fontSize: 9 }}>
                {region.name.split(" ").slice(-1)[0]}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 glass rounded-xl p-3 text-xs space-y-1.5">
        <div className="text-white/40 mb-2 font-semibold">RISK DENSITY</div>
        {[
          { label: "Critical (70+)", color: "#ff2d55" },
          { label: "High (50-70)", color: "#ff6b35" },
          { label: "Moderate (30-50)", color: "#ffd60a" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-white/50">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [trendData] = useState(generateTrendData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"map" | "regions" | "trends" | "alerts">("map");

  const totalUsers = REGIONS.reduce((s, r) => s + r.users, 0);
  const totalCritical = REGIONS.reduce((s, r) => s + r.critical, 0);
  const totalHigh = REGIONS.reduce((s, r) => s + r.high, 0);
  const totalModerate = REGIONS.reduce((s, r) => s + r.moderate, 0);

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const pieData = [
    { name: "Critical", value: totalCritical, color: "#ff2d55" },
    { name: "High", value: totalHigh, color: "#ff6b35" },
    { name: "Moderate", value: totalModerate, color: "#ffd60a" },
    {
      name: "Low",
      value: totalUsers - totalCritical - totalHigh - totalModerate,
      color: "#06d6a0",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#060612" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 opacity-8 rounded-full"
          style={{ background: "radial-gradient(circle, #4361ee, transparent)", filter: "blur(100px)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="w-9 h-9 glass border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 text-white/60" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#4361ee]" />
                <span className="font-bold text-white">Population Health Command Center</span>
              </div>
              <div className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse" />
                Live · Updated {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="glass border border-white/10 rounded-xl p-2 hover:bg-white/5">
              <RefreshCw className="w-4 h-4 text-white/50" />
            </button>
            <button className="glass border border-white/10 rounded-xl p-2 hover:bg-white/5">
              <Bell className="w-4 h-4 text-white/50" />
            </button>
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="text-sm font-bold hidden md:block">PulseGuard AI</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">

        {/* Critical Alert Banner */}
        {totalCritical > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl p-4 flex items-center gap-4 border"
            style={{ background: "rgba(255,45,85,0.08)", borderColor: "#ff2d5530" }}
          >
            <AlertTriangle className="w-5 h-5 text-[#ff2d55] flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="font-bold text-[#ff2d55] text-sm">{totalCritical} Users in Critical Condition</span>
              <span className="text-white/50 text-xs ml-2">across {REGIONS.length} regions · Emergency response teams alerted</span>
            </div>
            <button className="text-xs font-bold text-[#ff2d55] border border-[#ff2d55]/30 px-3 py-1.5 rounded-xl hover:bg-[#ff2d55]/10">
              View All →
            </button>
          </motion.div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Monitored Users"
            value={totalUsers.toLocaleString()} sub="+243 this week" color="#4361ee" trend={4} />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Critical Risk Users"
            value={totalCritical} sub="Immediate attention needed" color="#ff2d55" trend={12} />
          <StatCard icon={<Activity className="w-5 h-5" />} label="High Risk Users"
            value={totalHigh} sub="Monitoring closely" color="#ff6b35" trend={7} />
          <StatCard icon={<Shield className="w-5 h-5" />} label="Safe Users"
            value={(totalUsers - totalCritical - totalHigh - totalModerate).toLocaleString()}
            sub="Low / No risk" color="#06d6a0" trend={-2} />
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 glass rounded-2xl p-1 border border-white/8 mb-5">
          {(["map", "regions", "trends", "alerts"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${activeTab === tab ? "text-white" : "text-white/40 hover:text-white/60"}`}
              style={activeTab === tab ? { background: "linear-gradient(135deg, #4361ee, #7c3aed)" } : {}}
            >
              {tab === "map" ? "🗺️ Heatmap" : tab === "regions" ? "📊 Regions" : tab === "trends" ? "📈 Trends" : "🚨 Alerts"}
            </button>
          ))}
        </div>

        {/* ── MAP TAB ── */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-white">Population Risk Heatmap</div>
                  <div className="text-xs text-white/40 mt-0.5">Bengaluru Metropolitan Area · Real-time</div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4361ee]" />
                  <span className="text-xs text-white/40">{REGIONS.length} regions</span>
                </div>
              </div>
              <PopulationHeatmap regions={REGIONS} />
            </div>

            <div className="space-y-4">
              {/* Risk distribution pie */}
              <div className="glass rounded-2xl p-5 border border-white/8">
                <div className="font-semibold text-sm text-white mb-4">Risk Distribution</div>
                <div className="flex justify-center">
                  <PieChart width={180} height={180}>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 10, fontSize: 11 }}
                    />
                  </PieChart>
                </div>
                <div className="space-y-2 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-white/60">{d.name}</span>
                      </div>
                      <span className="font-bold text-white">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age distribution */}
              <div className="glass rounded-2xl p-5 border border-white/8">
                <div className="font-semibold text-sm text-white mb-4">Risk by Age Group</div>
                <div className="space-y-2">
                  {AGE_DISTRIBUTION.map(a => (
                    <div key={a.range}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">{a.range}</span>
                        <span className="font-bold" style={{ color: a.risk > 60 ? "#ff2d55" : a.risk > 40 ? "#ff6b35" : a.risk > 25 ? "#ffd60a" : "#06d6a0" }}>
                          {a.risk}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${a.risk}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background: a.risk > 60 ? "#ff2d55" : a.risk > 40 ? "#ff6b35" : a.risk > 25 ? "#ffd60a" : "#06d6a0"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REGIONS TAB ── */}
        {activeTab === "regions" && (
          <div className="glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center justify-between">
              <div className="font-bold text-white">Region-wise Analytics</div>
              <div className="text-xs text-white/30">{REGIONS.length} regions monitored</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Region", "Users", "Critical", "High", "Moderate", "Safe", "Risk %"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs text-white/40 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map((r, i) => {
                    const riskPct = Math.round(((r.critical + r.high) / r.users) * 100);
                    return (
                      <motion.tr
                        key={r.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/3 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-4 font-medium text-white">{r.name}</td>
                        <td className="px-5 py-4 text-white/60">{r.users.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#ff2d55]">{r.critical}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#ff6b35]">{r.high}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#ffd60a]">{r.moderate}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#06d6a0]">{r.low.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden w-16">
                              <div className="h-full rounded-full"
                                style={{
                                  width: `${riskPct}%`,
                                  background: riskPct > 10 ? "#ff2d55" : riskPct > 6 ? "#ff6b35" : "#ffd60a"
                                }} />
                            </div>
                            <span className="text-xs font-mono text-white/60">{riskPct}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRENDS TAB ── */}
        {activeTab === "trends" && (
          <div className="grid grid-cols-1 gap-5">
            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="font-bold text-white mb-1">24-Hour Risk Event Trends</div>
              <div className="text-xs text-white/40 mb-5">Critical, high, and moderate events over last 24 hours</div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {[
                      { id: "cGrad", color: "#ff2d55" },
                      { id: "hGrad", color: "#ff6b35" },
                      { id: "mGrad", color: "#ffd60a" },
                    ].map(g => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={g.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "#ffffff40", fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 10, fontSize: 11 }}
                    formatter={(v: number, name: string) => [Math.round(v), name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Area type="monotone" dataKey="moderate" stroke="#ffd60a" fill="url(#mGrad)" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="high" stroke="#ff6b35" fill="url(#hGrad)" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="critical" stroke="#ff2d55" fill="url(#cGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="font-bold text-white mb-1">Region-wise Critical Cases</div>
              <div className="text-xs text-white/40 mb-5">Comparative risk across monitored regions</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={REGIONS.map(r => ({ name: r.name.split(" ").splice(-1)[0], critical: r.critical, high: r.high }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#ffffff30", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 10, fontSize: 11 }}
                  />
                  <Bar dataKey="critical" fill="#ff2d55" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="high" fill="#ff6b35" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {activeTab === "alerts" && (
          <div className="glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff2d55]" />
                <div className="font-bold text-white">High-Risk User Alerts</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black"
                style={{ background: "#ff2d55" }}>{HIGH_RISK_ALERTS.length} active</span>
            </div>
            <div className="divide-y divide-white/3">
              {HIGH_RISK_ALERTS.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background: alert.status === "critical" ? "#ff2d5515" : "#ff6b3515",
                      border: `1px solid ${alert.status === "critical" ? "#ff2d5530" : "#ff6b3530"}`,
                    }}
                  >
                    {alert.status === "critical" ? "🚨" : "⚠️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{alert.name}</span>
                      <span className="text-xs text-white/30 font-mono">{alert.id}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {alert.region}
                      <span>·</span>
                      <span>HR: {alert.hr} bpm</span>
                      <span>·</span>
                      <span>{alert.since}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black"
                      style={{ color: alert.status === "critical" ? "#ff2d55" : "#ff6b35" }}>
                      {alert.score}
                    </div>
                    <div className="text-xs text-white/30">risk score</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: alert.status === "critical" ? "#ff2d55" : "#ff6b35" }}>
                    Alert
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
