import Image from "next/image";

const whatsappLink =
  "https://wa.me/601151317030?text=Hi%20Abang%20Reno!%0A%0AService%20Required:%20__________%0ALocation:%20__________%0APlease%20provide%20a%20quotation.%20Thank%20you.";

const navLinks = [
  { label: "Utama", href: "#home" },
  { label: "Perkhidmatan", href: "#services" },
  { label: "Sebelum & Selepas", href: "#projects" },
  { label: "Testimoni", href: "#testimonials" },
  { label: "Soalan Lazim", href: "#faq" },
  { label: "Hubungi", href: "#contact" },
];

const services = [
  {
    title: "Waterproofing",
    image: "/water-proofing.png",
    description: "Pembaikan kebocoran bumbung, siling dan dinding basah dengan sistem kalis air yang tahan lama.",
  },
  {
    title: "Baiki Dinding Retak",
    image: "/wall-crack.png",
    description: "Rawatan retak dalaman dan luaran dengan kemasan kemas dan tahan cuaca.",
  },
  {
    title: "Painting Service",
    image: "/painting.png",
    description: "Mengecat dalaman dan luaran untuk menaikkan seri rumah dan melindungi permukaan.",
  },
  {
    title: "Pemasangan Cermin",
    image: "/window-installation.png",
    description: "Pemasangan cermin mengikut ukuran untuk ruang tamu, bilik mandi dan pejabat.",
  },
  {
    title: "Epoxy Coating",
    image: "/epoxy.png",
    description: "Salutan epoxy berkualiti untuk dapur, garaj dan kawasan basah yang lebih mudah dibersihkan.",
  },
];

const stats = [
  "500+ Projek Disiapkan",
  "24 Jam Respon WhatsApp",
  "Servis Seluruh Klang Valley",
  "Quotation Sebelum Kerja",
];

const beforeAfterImages = [
  { src: "/before-after-water-proofing.png", alt: "Sebelum dan selepas waterproofing" },
  { src: "/before-after-wall-crack.png", alt: "Sebelum dan selepas baiki dinding retak" },
  { src: "/before-after-painting.png", alt: "Sebelum dan selepas painting" },
  { src: "/before-after-epoxy.png", alt: "Sebelum dan selepas epoxy" },
];

const testimonials = [
  {
    name: "Razak",
    image: "/testimoni-01-razak.png",
    quote: "Kerja pantas dan kemas. Sangat berpuas hati dengan hasil Abang Reno.",
  },
  {
    name: "Ayu",
    image: "/testimoni-02-Ayu.png",
    quote: "Quotation jelas sebelum kerja. Pasukan mesra dan sangat profesional.",
  },
  {
    name: "Khalid",
    image: "/testimoni-03-khalid.png",
    quote: "Kebocoran diselesaikan dengan cepat. Cadangan mereka sangat membantu.",
  },
];

function CtaButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "dark" | "light" }) {
  const variants = {
    primary: "bg-orange-600 text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700",
    dark: "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20 hover:bg-neutral-800",
    light: "bg-white text-neutral-950 ring-1 ring-neutral-200 hover:bg-orange-50",
  };

  return (
    <a href={whatsappLink} aria-label={`${children} on WhatsApp`} className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-extrabold transition ${variants[variant]}`}>
      {children}
    </a>
  );
}

function SectionHeader({ eyebrow, title, subtitle, tone = "light" }: { eyebrow?: string; title: string; subtitle?: string; tone?: "light" | "dark" }) {
  const titleClass = tone === "dark" ? "text-white" : "text-neutral-950";
  const subtitleClass = tone === "dark" ? "text-white/70" : "text-neutral-600";

  return (
    <div className="mx-auto mb-9 max-w-2xl text-center">
      {eyebrow ? <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-orange-600">{eyebrow}</p> : null}
      <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${titleClass}`}>{title}</h2>
      {subtitle ? <p className={`mt-4 text-base leading-7 ${subtitleClass}`}>{subtitle}</p> : null}
    </div>
  );
}

function ServiceCard({ title, description, image }: { title: string; description: string; image: string }) {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1">
      <div className="relative h-56 w-full">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-black text-neutral-950">{title}</h3>
        <p className="mt-3 text-neutral-600">{description}</p>
      </div>
    </article>
  );
}

function TestimonialCard({ name, image, quote }: { name: string; image: string; quote: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-4">
        <Image src={image} alt={name} width={64} height={64} className="rounded-full" />
        <div>
          <p className="font-black text-neutral-950">{name}</p>
          <p className="text-sm text-neutral-500">Pelanggan</p>
        </div>
      </div>
      <p className="mt-5 text-neutral-700">{quote}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main id="home" className="min-h-screen overflow-hidden bg-[#fffaf5]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="section-shell flex min-h-20 items-center justify-between gap-4 py-3">
          <a href="#home" className="flex items-center gap-3" aria-label="Abang Reno home">
            <Image src="/abang-reno-logo.svg" width={58} height={58} alt="Abang Reno logo" priority className="rounded-full" />
            <div className="leading-tight">
              <p className="text-lg font-black text-neutral-950">Abang Reno</p>
              <p className="text-xs font-bold text-neutral-500">Waterproofing · Baiki Dinding Retak · Painting · Cermin · Epoxy</p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-bold text-neutral-700 transition hover:text-orange-600">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <CtaButton>WhatsApp Untuk Quotation</CtaButton>
            <CtaButton variant="dark">Hantar Gambar Masalah Rumah</CtaButton>
          </div>

          <details className="group lg:hidden">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950" aria-label="Open mobile menu">
              <span className="relative h-4 w-5 before:absolute before:left-0 before:top-0 before:h-0.5 before:w-5 before:bg-current after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-5 after:bg-current">
                <span className="absolute left-0 top-[7px] h-0.5 w-5 bg-current" />
              </span>
            </summary>
            <div className="absolute left-4 right-4 top-[76px] rounded-[1.5rem] border border-neutral-100 bg-white p-4 shadow-2xl">
              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-orange-50">
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                <CtaButton>WhatsApp Untuk Quotation</CtaButton>
                <CtaButton variant="dark">Hantar Gambar Masalah Rumah</CtaButton>
              </div>
            </div>
          </details>
        </div>
      </header>

      <section className="hero-grid-bg relative pb-16 pt-10 sm:pb-24 lg:pt-16">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600 shadow-sm ring-1 ring-orange-100">
              Servis profesional sekitar Klang Valley
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-neutral-950 sm:text-6xl lg:text-7xl">
              Rumah Ada Masalah Bocor, Dinding Retak atau Cat Mengelupas?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
              Abang Reno menyediakan servis waterproofing, baiki dinding retak, painting, epoxy coating dan pemasangan cermin sekitar Klang Valley dengan quotation yang jelas sebelum kerja bermula.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton>WhatsApp Untuk Quotation</CtaButton>
              <CtaButton variant="light">Hantar Gambar Masalah Rumah</CtaButton>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((label) => (
                <div key={label} className="rounded-2xl bg-white p-4 text-sm font-extrabold text-neutral-800 shadow-sm ring-1 ring-black/5">
                  <span className="mb-2 block text-orange-600">✓</span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-orange-500/15 blur-3xl" />
            <Image src="/team-van.svg" width={1200} height={820} alt="Abang Reno team with branded van" priority className="relative rounded-[2rem] border border-white bg-white shadow-[0_40px_80px_rgba(255,138,51,0.15)]" />
          </div>
        </div>
      </section>

      <section id="services" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Perkhidmatan" title="Perkhidmatan Utama" subtitle="Pilih servis yang sesuai untuk masalah rumah anda." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} title={service.title} description={service.description} image={service.image} />
          ))}
        </div>
      </section>

      <section id="projects" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Sebelum & Selepas" title="Sebelum & Selepas" subtitle="Lihat perubahan nyata selepas kerja Abang Reno." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {beforeAfterImages.map((item) => (
            <div key={item.src} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <Image src={item.src} alt={item.alt} width={600} height={440} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Testimoni" title="Apa Kata Pelanggan" subtitle="Pelanggan kami berkongsi pengalaman mereka." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} name={item.name} image={item.image} quote={item.quote} />
          ))}
        </div>
      </section>

      <section id="faq" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Soalan Lazim" title="Soalan Lazim" subtitle="Jawapan ringkas untuk persoalan biasa." />
        <div className="mx-auto grid max-w-3xl gap-3">
          <details className="group rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-black text-neutral-950">
              Apakah itu waterproofing?
              <span className="text-orange-600 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 leading-7 text-neutral-600">Waterproofing membantu menghentikan kebocoran dan kelembapan pada bumbung, siling dan dinding basah.</p>
          </details>
          <details className="group rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-black text-neutral-950">
              Adakah quotation diberikan sebelum kerja bermula?
              <span className="text-orange-600 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 leading-7 text-neutral-600">Ya, quotation jelas akan diberikan sebelum kami mula kerja.</p>
          </details>
          <details className="group rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-black text-neutral-950">
              Bolehkah saya hantar gambar melalui WhatsApp?
              <span className="text-orange-600 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 leading-7 text-neutral-600">Ya, hantar gambar masalah rumah untuk semakan awal dan panduan quotation.</p>
          </details>
        </div>
      </section>

      <section id="contact" className="section-shell py-16 sm:py-24">
        <div className="rounded-[2.5rem] bg-orange-500/10 p-8 shadow-[0_40px_80px_rgba(255,138,51,0.15)] sm:p-12">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-orange-600">Sedia untuk mula?</p>
              <h2 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-5xl">Hubungi Kami untuk Quotation</h2>
              <p className="mt-5 text-lg leading-8 text-neutral-700">Hantar lokasi dan gambar masalah rumah melalui WhatsApp kami. Kami akan bantu anda dengan cepat dan jelas.</p>
            </div>
            <div className="flex flex-col gap-3">
              <CtaButton>WhatsApp Untuk Quotation</CtaButton>
              <CtaButton variant="dark">Hantar Gambar Masalah Rumah</CtaButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-950 pb-20 pt-14 text-white sm:pb-16">
        <div className="section-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Image src="/abang-reno-logo.svg" width={72} height={72} alt="Abang Reno logo" className="rounded-full bg-white" />
            <h2 className="mt-4 text-2xl font-black">Abang Reno</h2>
            <p className="mt-2 text-white/70">Waterproofing · Painting · Baiki Dinding Retak · Cermin · Epoxy</p>
            <div className="mt-5 space-y-2 text-sm text-white/70">
              <p>WhatsApp: +601151317030</p>
              <p>Website: abangreno.my</p>
              <p>Servis: Klang Valley</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black">Syarikat</h3>
            <p className="mt-4 text-white/70">Neugens Solution</p>
            <p className="mt-2 text-white/70">Reg. No. : 202503301282 (AS0504872-V)</p>
          </div>
          <div>
            <h3 className="text-lg font-black">Pautan Pantas</h3>
            <div className="mt-4 grid gap-2 text-white/70">
              {navLinks.slice(1).map((link) => (
                <a key={link.href} href={link.href} className="hover:text-orange-400">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <a href={whatsappLink} aria-label="WhatsApp Abang Reno for quotation" className="fixed bottom-5 right-5 z-50 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-base font-black text-white shadow-2xl shadow-green-700/30 transition hover:scale-105">
        <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor">
          <path d="M16.02 3.2C9.28 3.2 3.8 8.55 3.8 15.12c0 2.23.64 4.4 1.86 6.28L3.4 28.8l7.65-2.16a12.63 12.63 0 0 0 4.97.99c6.74 0 12.22-5.35 12.22-11.93S22.76 3.2 16.02 3.2Zm0 22.28c-1.58 0-3.12-.4-4.5-1.14l-.32-.17-4.53 1.28 1.33-4.33-.2-.34a10.15 10.15 0 0 1-1.58-5.37c0-5.38 4.4-9.76 9.8-9.76s9.8 4.38 9.8 9.76-4.4 10.07-9.8 10.07Zm5.39-7.32c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.64.08-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.48-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.91-2.18-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.36-.27.3-1.04 1-1.04 2.45s1.07 2.85 1.21 3.05c.15.2 2.1 3.15 5.1 4.41.71.31 1.27.5 1.7.64.71.22 1.36.19 1.88.12.57-.08 1.76-.7 2.01-1.38.25-.68.25-1.27.17-1.39-.07-.12-.27-.19-.56-.34Z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp Abang Reno</span>
      </a>
    </main>
  );
}
