"use client";

import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "./site";
import { WhatsAppIcon } from "./whatsapp-icon";

function ChatVisual() {
  return (
    <div className="ml-auto max-w-[15rem] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3 py-2 text-left text-[13px] leading-snug text-neutral-800 shadow-sm">
      Salam, dinding bilik saya bocor bila hujan 😥
      <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
        <span>📷 3 gambar</span>
        <span className="text-sky-500">10:24 ✓✓</span>
      </div>
    </div>
  );
}

function VisitVisual() {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm">
      <div className="flex h-11 w-11 flex-none flex-col items-center justify-center overflow-hidden rounded-lg ring-1 ring-neutral-200">
        <span className="w-full bg-orange-600 text-center text-[9px] font-black uppercase text-white">Sab</span>
        <span className="text-base font-black leading-tight text-neutral-950">12</span>
      </div>
      <div className="whitespace-nowrap text-[13px] leading-tight">
        <p className="font-black text-neutral-950">Site visit</p>
        <p className="text-neutral-500">10:00 pagi</p>
      </div>
      <span className="ml-auto rounded-full bg-green-100 px-1.5 py-1 text-[9px] font-black text-green-700">PERCUMA</span>
    </div>
  );
}

function QuoteVisual() {
  return (
    <div className="rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-500">Quotation</p>
        <span className="text-[10px] font-bold text-neutral-400">#AR-0127</span>
      </div>
      <div className="mt-2 grid gap-1.5">
        <span className="h-1.5 w-full rounded-full bg-neutral-200" />
        <span className="h-1.5 w-4/5 rounded-full bg-neutral-200" />
        <span className="h-1.5 w-3/5 rounded-full bg-neutral-200" />
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-neutral-200 pt-2 text-[12px]">
        <span className="font-bold text-neutral-500">Jumlah</span>
        <span className="font-black text-neutral-950">RM ••••</span>
      </div>
    </div>
  );
}

function DoneVisual() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-orange-600 text-white">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7.5 3v5.25c0 4.6-3.2 8.4-7.5 9.75-4.3-1.35-7.5-5.15-7.5-9.75V6L12 3Zm-3 9l2 2 4-4" />
        </svg>
      </span>
      <div className="text-[13px] leading-tight">
        <p className="font-black text-neutral-950">Kerja siap ✓</p>
        <p className="text-neutral-500">Jaminan 6 bulan</p>
      </div>
    </div>
  );
}

const steps = [
  { title: "WhatsApp Gambar", text: "Hantar gambar masalah & lokasi. Kami beri pandangan awal.", Visual: ChatVisual },
  { title: "Site Visit Percuma", text: "Kami datang periksa, ukur dan cari punca sebenar.", Visual: VisitVisual },
  { title: "Quotation Bertulis", text: "Harga & skop kerja jelas sebelum kerja bermula.", Visual: QuoteVisual },
  { title: "Siap & Bergaransi", text: "Kerja kemas, tapak dibersihkan. Jaminan 6 bulan.", Visual: DoneVisual },
];

export function ProcessSteps() {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Number of steps revealed so far; steps light up in order as they scroll into view.
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(steps.length);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          setRevealed((current) => Math.max(current, index + 1));
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.6 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const progress = revealed <= 1 ? 0 : (revealed - 1) / (steps.length - 1);

  return (
    <div>
      <ol className="relative grid gap-6 pl-14 lg:grid-cols-4 lg:gap-6 lg:pl-0 lg:pt-16">
        {/* Track: vertical on mobile, horizontal on desktop */}
        <div aria-hidden="true" className="absolute bottom-8 left-[1.375rem] top-2 w-0.5 bg-white/10 lg:bottom-auto lg:left-[12.5%] lg:right-[12.5%] lg:top-[1.375rem] lg:h-0.5 lg:w-auto">
          <div className="h-full w-full origin-top bg-gradient-to-b from-orange-500 to-orange-400 transition-transform duration-700 ease-out lg:hidden" style={{ transform: `scaleY(${progress})` }} />
          <div className="hidden h-full w-full origin-left bg-gradient-to-r from-orange-500 to-orange-400 transition-transform duration-700 ease-out lg:block" style={{ transform: `scaleX(${progress})` }} />
        </div>

        {steps.map(({ title, text, Visual }, index) => {
          const on = index < revealed;
          return (
            <li
              key={title}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              data-index={index}
              className={`relative transition-all duration-700 ease-out lg:text-center ${on ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            >
              <span
                className={`absolute -left-14 top-0 flex h-11 w-11 items-center justify-center rounded-full text-lg font-black ring-4 ring-neutral-950 transition-colors duration-500 lg:-top-16 lg:left-1/2 lg:-translate-x-1/2 ${
                  on ? "bg-orange-600 text-white shadow-[0_0_24px_rgba(234,88,12,0.6)]" : "bg-neutral-800 text-white/50"
                }`}
              >
                {index + 1}
              </span>
              <div className="h-full rounded-[1.5rem] bg-white/5 p-5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.07] sm:p-6">
                <div className="flex min-h-[5.5rem] items-center">
                  <div className="w-full">
                    <Visual />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-2 leading-7 text-white/70">{text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 text-center">
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-orange-600 px-7 text-base font-extrabold text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-500"
        >
          <WhatsAppIcon />
          Mula Langkah 1
          <span aria-hidden="true" className="transition group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </div>
  );
}
