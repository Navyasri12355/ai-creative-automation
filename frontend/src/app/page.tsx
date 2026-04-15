"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FESTIVALS = [
  { name: "Diwali", hi: "दीपावली", color: "#FFD700" },
  { name: "Holi", hi: "होली", color: "#FF00FF" },
  { name: "Navratri", hi: "नवरात्रि", color: "#FF4500" },
  { name: "Eid", hi: "ईद", color: "#00C48C" },
  { name: "Pongal", hi: "பொங்கல்", color: "#FF6B2B" },
  { name: "Onam", hi: "ഓണം", color: "#FFB830" },
];

const FEATURES = [
  {
    icon: "🎨",
    title: "Brand Memory",
    desc: "Upload your logo, colors, and guidelines once. Every creative stays on-brand automatically.",
  },
  {
    icon: "🗓️",
    title: "Festival Engine",
    desc: "Never miss Diwali, Eid, Pongal, or 50+ Indian occasions. AI suggests themes weeks ahead.",
  },
  {
    icon: "🌐",
    title: "9 Languages",
    desc: "Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, and English.",
  },
  {
    icon: "📱",
    title: "Every Platform",
    desc: "Instagram, Stories, Facebook, LinkedIn, WhatsApp Business — perfect dimensions, every time.",
  },
];

export default function LandingPage() {
  const [festivalIdx, setFestivalIdx] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFestivalIdx((i) => (i + 1) % FESTIVALS.length);
    }, 2200);
    return () => clearInterval(intervalRef.current);
  }, []);

  const current = FESTIVALS[festivalIdx];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-white/5">
        <span className="text-lg font-bold tracking-tight gradient-text">IndiSocial</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-5 py-2 rounded-full gradient-saffron text-black hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-32 px-6 md:px-12 text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#ff6b2b]/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-[#ffb830]/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Festival ticker */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00c48c] animate-pulse" />
            <span className="text-zinc-400">Next up:</span>
            <span
              className="font-semibold transition-colors duration-500"
              style={{ color: current.color }}
            >
              {current.name}
            </span>
            <span className="text-zinc-500 font-devanagari">{current.hi}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Social media creatives{" "}
            <span className="gradient-text">built for Bharat</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-generated, culturally precise, brand-consistent posts for every Indian
            festival — in your language, on your platform, in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-saffron text-black font-bold text-base hover:opacity-90 transition-opacity glow-saffron"
            >
              Start for free
              <span className="text-lg">→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full glass text-zinc-300 font-medium text-base hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FESTIVAL STRIP */}
      <section className="py-10 border-y border-white/5 overflow-hidden">
        <div className="flex gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {[...FESTIVALS, ...FESTIVALS].map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 shrink-0"
            >
              <span style={{ color: f.color }}>●</span>
              {f.name}
              <span className="font-devanagari">{f.hi}</span>
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-[#ff6b2b] uppercase mb-4 text-center">
            Everything you need
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
            Designed for the Indian market
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-7 hover:border-[#ff6b2b]/30 transition-colors group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 group-hover:gradient-text transition-all">
                  {f.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-28 px-6 text-center border-t border-white/5">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to celebrate with your audience?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join brands creating culturally resonant content across India.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full gradient-saffron text-black font-bold text-base hover:opacity-90 transition-opacity glow-saffron"
          >
            Create your first creative free
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}