"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "./site";
import { WhatsAppIcon } from "./whatsapp-icon";

const floorWords = ["kusam", "berdebu", "retak"];
const wallWords = ["bocor", "lembap", "berkulat"];

const problems = [
  { icon: "🚗", label: "Lantai Garaj", service: "Lantai Epoxy (Garaj / Porch)" },
  { icon: "🚿", label: "Bilik Air", service: "Lantai Epoxy (Bilik Air / Dapur)" },
  { icon: "🧱", label: "Dinding Retak", service: "Baiki Dinding Retak" },
  { icon: "💧", label: "Dinding Bocor", service: "Dinding Bocor / Lembap" },
];

function RotatingWord({ words, index }: { words: string[]; index: number }) {
  const word = words[index % words.length];
  return (
    <span className="relative inline-block text-orange-400">
      <span key={word} className="hero-word inline-block">
        {word}
      </span>
      <span aria-hidden="true" className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-orange-500/40" />
    </span>
  );
}

export function HeroContent() {
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2400);
    return () => window.clearInterval(id);
  }, []);

  const choice = selected === null ? null : problems[selected];

  return (
    <div className="section-shell pb-10 pt-8 sm:pt-12 lg:py-20">
      <div className="max-w-2xl lg:max-w-3xl">
        <p className="hero-rise mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-orange-300 ring-1 ring-white/20 backdrop-blur sm:text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
          </span>
          Pakar Epoxy & Dinding · Klang Valley
        </p>

        <h1 className="hero-rise text-[2.3rem] font-black leading-[1.08] tracking-[-0.03em] [animation-delay:100ms] sm:text-6xl">
          <span className="sr-only">Lantai kusam atau dinding bocor? Settle dengan Abang Reno.</span>
          <span aria-hidden="true">
            Lantai <RotatingWord words={floorWords} index={tick} />?
            <br />
            Dinding <RotatingWord words={wallWords} index={tick} />?
            <br />
            <span className="text-white/95">Settle dengan <span className="whitespace-nowrap">Abang Reno.</span></span>
          </span>
        </h1>

        <p className="hero-rise mt-5 max-w-xl text-base leading-7 text-white/85 [animation-delay:200ms] sm:text-lg sm:leading-8">
          Kami datang periksa <strong className="text-white">percuma</strong>, cari punca sebenar dan beri harga bertulis. Tiada kejutan.
        </p>

        <div className="hero-rise mt-6 [animation-delay:300ms]">
          <p className="text-sm font-bold text-white/70">Apa masalah rumah anda?</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {problems.map((problem, index) => {
              const active = index === selected;
              return (
                <button
                  key={problem.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(active ? null : index)}
                  className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold ring-1 backdrop-blur transition ${
                    active ? "bg-orange-500 text-white ring-orange-300 shadow-lg shadow-orange-600/30" : "bg-white/10 text-white ring-white/25 hover:bg-white/20"
                  }`}
                >
                  <span aria-hidden="true">{problem.icon}</span>
                  {problem.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hero-rise mt-6 flex flex-col gap-3 [animation-delay:400ms] sm:flex-row sm:items-center">
          <a
            href={whatsappLink(choice?.service)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-13 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-orange-600 px-6 text-base font-extrabold text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-500"
          >
            <WhatsAppIcon />
            {choice ? `WhatsApp: ${choice.label}` : "Tempah Inspection Percuma"}
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </a>
          <p className="text-center text-xs font-bold text-white/60 sm:text-left">
            Percuma · Tiada komitmen
          </p>
        </div>
      </div>
    </div>
  );
}
