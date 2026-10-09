"use client";

import { useEffect, useState } from "react";
import { heroGuarantees, whatsappLink } from "./site";
import { WhatsAppIcon } from "./whatsapp-icon";

const floorWords = ["kusam", "berdebu", "retak"];
const wallWords = ["bocor", "lembap", "berkulat"];

function RotatingWord({ words, index }: { words: string[]; index: number }) {
  const word = words[index % words.length];
  return (
    <span key={word} className="hero-word inline-block text-orange-400">
      {word}
    </span>
  );
}

export function HeroContent() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="section-shell pb-10 pt-10 sm:pt-14 lg:py-24">
      <div className="max-w-2xl">
        <p className="hero-rise mb-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-orange-300 sm:text-sm sm:tracking-[0.18em]">
          <span className="hidden h-px w-8 bg-orange-400 sm:block" />
          Pakar Epoxy & Dinding Retak · Klang Valley
        </p>

        <h1 className="hero-rise text-[2.4rem] font-black leading-[1.08] tracking-[-0.03em] [animation-delay:100ms] sm:text-6xl">
          <span className="sr-only">Lantai kusam atau dinding bocor? Settle dengan Abang Reno.</span>
          <span aria-hidden="true">
            Lantai <RotatingWord words={floorWords} index={tick} />?
            <br />
            Dinding <RotatingWord words={wallWords} index={tick} />?
            <br />
            Settle dengan <span className="whitespace-nowrap">Abang Reno.</span>
          </span>
        </h1>

        <p className="hero-rise mt-6 text-lg leading-8 text-white/80 [animation-delay:200ms] sm:text-xl">
          Site visit percuma. Jaminan perkhidmatan 6 bulan.
        </p>

        <div className="hero-rise mt-8 [animation-delay:300ms]">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-8 text-base font-extrabold text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-500 sm:w-auto"
          >
            <WhatsAppIcon />
            Tempah Site Visit Percuma
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <ul className="hero-rise mt-7 hidden flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/80 [animation-delay:400ms] sm:flex xl:hidden">
          {heroGuarantees.map((item) => (
            <li key={item}>
              <span className="text-orange-400">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
