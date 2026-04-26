import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulseGuard AI — Predict. Prevent. Protect.",
  description:
    "AI-powered cardiovascular risk detection and emergency response platform. Real-time heart monitoring, anomaly detection, and instant emergency alerts.",
  keywords:
    "cardiovascular AI, heart rate monitoring, health AI, emergency response, rPPG, risk detection",
  openGraph: {
    title: "PulseGuard AI",
    description: "Predict. Prevent. Protect. Your AI-powered heart guardian.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased noise-bg">{children}</body>
    </html>
  );
}
