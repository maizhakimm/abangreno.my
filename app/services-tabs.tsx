"use client";

import Image from "next/image";
import { useState } from "react";
import { whatsappLink } from "./site";
import { services } from "./services-data";
import { WhatsAppIcon } from "./whatsapp-icon";


export function ServicesTabs() {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <div>
      <div role="tablist" aria-label="Pilih servis" className="mx-auto mb-8 flex w-full max-w-md rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5">
        {services.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="panel-servis"
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  const next = (index + (event.key === "ArrowRight" ? 1 : -1) + services.length) % services.length;
                  setActive(next);
                  document.getElementById(`tab-${services[next].id}`)?.focus();
                }
              }}
              tabIndex={selected ? 0 : -1}
              className={`min-h-11 flex-1 whitespace-nowrap rounded-full px-2 text-[13px] font-extrabold transition sm:px-3 sm:text-base ${
                selected ? "bg-neutral-950 text-white shadow-md" : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {item.tab}
            </button>
          );
        })}
      </div>

      <div
        key={service.id}
        id="panel-servis"
        role="tabpanel"
        aria-labelledby={`tab-${service.id}`}
        className="tab-fade grid overflow-hidden rounded-[2rem] bg-white card-shadow lg:grid-cols-2"
      >
        <div className="relative aspect-[16/10] w-full lg:aspect-auto lg:min-h-[420px]">
          <Image src={service.image} alt={service.imageAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <h3 className="text-2xl font-black text-neutral-950 sm:text-3xl">{service.title}</h3>
          <p className="mt-3 text-lg leading-8 text-neutral-600">{service.intro}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {service.highlights.map((item) => (
              <span key={item} className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 ring-1 ring-orange-100">
                {item}
              </span>
            ))}
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Sesuai untuk</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {service.suitable.map((item) => (
              <li key={item} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-800">
                {item}
              </li>
            ))}
          </ul>

          <a
            href={whatsappLink(service.message)}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-6 text-base font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-700 sm:w-auto sm:self-start"
          >
            <WhatsAppIcon />
            {service.cta}
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
