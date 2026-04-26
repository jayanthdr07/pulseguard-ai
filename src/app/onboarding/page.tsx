"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, Send, ChevronRight, CheckCircle } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import type { UserProfile } from "@/lib/ai-engine";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: number;
  options?: string[];
  inputType?: "text" | "number" | "options";
}

const onboardingFlow = [
  {
    key: "greeting",
    message: "👋 Hi! I'm **PulseGuard AI** — your personal cardiovascular guardian. I'll ask you a few quick questions to build your heart health profile. Ready to begin?",
    options: ["Let's go! 🚀", "Tell me more first"],
    field: null,
  },
  {
    key: "age",
    message: "Great! First — **how old are you?** Age is one of the most important cardiovascular risk factors.",
    inputType: "number",
    placeholder: "Enter your age (e.g. 34)",
    field: "age",
    unit: "years",
  },
  {
    key: "weight",
    message: "Thanks! And your **weight**? This helps me calculate your BMI and metabolic risk.",
    inputType: "number",
    placeholder: "Enter weight (kg)",
    field: "weight",
    unit: "kg",
  },
  {
    key: "smoking",
    message: "Do you currently **smoke or use tobacco** products? This significantly affects cardiovascular risk.",
    options: ["Yes, I smoke 🚬", "No, I don't smoke ✅", "I quit recently"],
    field: "smoking",
  },
  {
    key: "activity",
    message: "How would you describe your **physical activity level**?",
    options: ["Sedentary (desk job, no exercise) 🪑", "Light (occasional walks) 🚶", "Moderate (3-4x/week) 🏃", "Active (daily intense workouts) 💪"],
    field: "activityLevel",
  },
  {
    key: "familyHistory",
    message: "Does your **family have a history** of heart disease, stroke, or high blood pressure?",
    options: ["Yes, direct family 🧬", "No family history ✅", "Not sure"],
    field: "familyHistory",
  },
  {
    key: "diabetic",
    message: "Are you **diabetic or pre-diabetic**? Diabetes significantly increases cardiovascular risk.",
    options: ["Yes, I'm diabetic 💉", "Pre-diabetic", "No, I'm not diabetic ✅"],
    field: "diabetic",
  },
  {
    key: "bp",
    message: "What's your typical **blood pressure**? (If you don't know, I'll use average values for your age)",
    options: ["Normal (< 120/80) ✅", "Elevated (120-139/80-89) ⚠️", "High (140+/90+) 🔴", "I don't know"],
    field: "bp",
  },
  {
    key: "complete",
    message: "🎉 **Perfect!** I've built your cardiovascular profile. Based on what you've shared, I'm ready to start monitoring your heart health in real-time.\n\nTapping **Start Monitoring** will take you to your personal dashboard where you'll see your live risk score, vitals, and AI explanations.",
    options: ["Start Monitoring 🚀"],
    field: null,
  },
];

function parseAnswer(step: typeof onboardingFlow[0], answer: string): Partial<UserProfile> {
  const updates: Partial<UserProfile> = {};
  switch (step.field) {
    case "age":
      updates.age = parseInt(answer) || 35;
      break;
    case "weight":
      updates.weight = parseFloat(answer) || 70;
      break;
    case "smoking":
      updates.smoking = answer.toLowerCase().includes("yes") || answer.toLowerCase().includes("smoke");
      break;
    case "activityLevel":
      if (answer.includes("Sedentary") || answer.includes("desk")) updates.activityLevel = "sedentary";
      else if (answer.includes("Light") || answer.includes("walk")) updates.activityLevel = "light";
      else if (answer.includes("Moderate")) updates.activityLevel = "moderate";
      else updates.activityLevel = "active";
      break;
    case "familyHistory":
      updates.familyHistory = answer.includes("Yes") || answer.includes("direct");
      break;
    case "diabetic":
      updates.diabetic = answer.includes("diabetic 💉") || answer.includes("Pre");
      break;
    case "bp":
      if (answer.includes("Normal")) { updates.systolicBP = 115; updates.diastolicBP = 75; }
      else if (answer.includes("Elevated")) { updates.systolicBP = 130; updates.diastolicBP = 84; }
      else if (answer.includes("High")) { updates.systolicBP = 150; updates.diastolicBP = 95; }
      else { updates.systolicBP = 120; updates.diastolicBP = 78; }
      break;
    default:
      break;
  }
  return updates;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-white/40"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function formatMessage(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, setOnboardingComplete } = usePulseStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    height: 170,
    systolicBP: 120,
    diastolicBP: 78,
  });
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Start the flow
  useEffect(() => {
    setTimeout(() => {
      addAIMessage(0);
    }, 500);
  }, []);

  const addAIMessage = (stepIndex: number) => {
    setIsTyping(true);
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      setIsTyping(false);
      const step = onboardingFlow[stepIndex];
      setMessages(prev => [...prev, {
        role: "ai",
        content: step.message,
        timestamp: Date.now(),
        options: step.options,
        inputType: (step as { inputType?: "text" | "number" | "options" }).inputType,
      }]);
    }, delay);
  };

  const handleAnswer = (answer: string) => {
    const step = onboardingFlow[currentStep];

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: answer, timestamp: Date.now() }]);

    // Parse and accumulate profile data
    if (step.field) {
      const updates = parseAnswer(step, answer);
      setProfileData(prev => ({ ...prev, ...updates }));
    }

    const nextStep = currentStep + 1;

    if (nextStep >= onboardingFlow.length) {
      // Complete
      const finalProfile: UserProfile = {
        age: profileData.age ?? 35,
        weight: profileData.weight ?? 70,
        height: profileData.height ?? 170,
        smoking: profileData.smoking ?? false,
        activityLevel: profileData.activityLevel ?? "moderate",
        familyHistory: profileData.familyHistory ?? false,
        diabetic: profileData.diabetic ?? false,
        systolicBP: profileData.systolicBP ?? 120,
        diastolicBP: profileData.diastolicBP ?? 78,
      };
      setProfile(finalProfile);
      setOnboardingComplete(true);
      setIsComplete(true);
      router.push("/dashboard");
      return;
    }

    if (answer === "Start Monitoring 🚀") {
      const finalProfile: UserProfile = {
        age: profileData.age ?? 35,
        weight: profileData.weight ?? 70,
        height: profileData.height ?? 170,
        smoking: profileData.smoking ?? false,
        activityLevel: profileData.activityLevel ?? "moderate",
        familyHistory: profileData.familyHistory ?? false,
        diabetic: profileData.diabetic ?? false,
        systolicBP: profileData.systolicBP ?? 120,
        diastolicBP: profileData.diastolicBP ?? 78,
      };
      setProfile(finalProfile);
      setOnboardingComplete(true);
      router.push("/dashboard");
      return;
    }

    setCurrentStep(nextStep);
    setInputValue("");
    addAIMessage(nextStep);
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;
    handleAnswer(inputValue.trim());
  };

  const progressPercent = Math.round((currentStep / (onboardingFlow.length - 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #060612 0%, #0d0d1f 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-heartbeat"
            style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b35)" }}>
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold">
            Pulse<span className="gradient-text">Guard</span> AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/30">Health Profile Setup</span>
          <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #4361ee, #7c3aed)" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-white/40 font-mono">{progressPercent}%</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={`${i}-${msg.timestamp}`}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
              >
                {msg.role === "ai" && (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div className={`max-w-sm`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                    ? "chat-bubble-user text-white"
                    : "chat-bubble-ai text-white/80"
                    }`}>
                    {formatMessage(msg.content)}
                  </div>

                  {/* Options */}
                  {msg.role === "ai" && msg.options && i === messages.length - 1 && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 glass border border-white/10 hover:border-[#4361ee]/50 hover:text-white hover:bg-[#4361ee]/10 transition-all duration-200"
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                <span className="text-sm">🤖</span>
              </div>
              <div className="chat-bubble-ai rounded-2xl">
                <TypingDots />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area — only shown for number/text steps */}
      {!isTyping && messages.length > 0 && (() => {
        const lastMsg = messages[messages.length - 1];
        const step = onboardingFlow[currentStep];
        if (lastMsg.role === "ai" && !lastMsg.options && (step as { inputType?: string }).inputType) {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-6 max-w-2xl mx-auto w-full"
            >
              <div className="flex gap-3 glass-strong rounded-2xl border border-white/10 p-3">
                <input
                  ref={inputRef}
                  type={(step as { inputType?: string }).inputType === "number" ? "number" : "text"}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
                  placeholder={(step as { placeholder?: string }).placeholder ?? "Type your answer..."}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30 px-2"
                  autoFocus
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-white/20">Press Enter to send</span>
                <button
                  onClick={() => handleAnswer("Skip")}
                  className="text-xs text-white/20 hover:text-white/40 transition-colors"
                >
                  Skip →
                </button>
              </div>
            </motion.div>
          );
        }
        return null;
      })()}

      {isComplete && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(6,6,18,0.9)" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <CheckCircle className="w-16 h-16 text-[#06d6a0] mx-auto mb-4" />
            <div className="text-2xl font-bold text-white">Profile Created!</div>
            <div className="text-white/50 mt-2">Taking you to your dashboard…</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
