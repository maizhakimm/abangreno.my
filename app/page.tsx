import Image from "next/image";

const whatsappLink =
  "https://wa.me/601151317030?text=Hi%20Abang%20Reno!%0A%0AService%20Required:%20__________%0ALocation:%20__________%0APlease%20provide%20a%20quotation.%20Thank%20you.";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Coverage", href: "#coverage" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const services = [
  ["Waterproofing", "Prevent and repair roof, ceiling, wall and wet-area leakage.", "💧"],
  ["Wall Crack Repair", "Internal and external wall crack treatment and repair.", "🧱"],
  ["Painting", "Interior and exterior painting for homes and commercial spaces.", "🎨"],
  ["Epoxy Coating", "Epoxy coating for bathroom, kitchen, wet areas and selected surfaces.", "✨"],
  ["Mirror Installation", "Custom mirror installation for home, office and commercial spaces.", "🪞"],
  ["Minor Renovation & Repair", "General maintenance, touch-up and repair works.", "🛠️"],
];

const reasons = [
  "Local Klang Valley team",
  "Clear quotation before work starts",
  "Fast response via WhatsApp",
  "Neat workmanship",
  "Flexible payment options",
  "Friendly and professional service",
];

const payments = ["Atome", "Grab PayLater", "SPayLater", "Boost PayFlex", "Visa", "Mastercard", "FPX", "DuitNow QR"];
const areas = ["Shah Alam", "Klang", "Setia Alam", "Subang Jaya", "Petaling Jaya", "Kuala Lumpur", "Putrajaya", "Selangor"];

const gallery = [
  ["Waterproofing work", "Roof and wet-area leakage protection"],
  ["Wall crack repair", "Crack treatment for interior and exterior walls"],
  ["Painting work", "Clean paint finish for homes and shops"],
  ["Epoxy coating", "Durable coating for selected surfaces"],
  ["Mirror installation", "Measured fitting for residential and commercial spaces"],
  ["Before and after repair", "Visible repair progress and tidy handover"],
];

const faqs = [
  ["What is waterproofing?", "Waterproofing helps prevent water leakage and seepage on roofs, walls, ceilings, bathrooms and wet areas."],
  ["Do you provide quotation before work starts?", "Yes, we provide a quotation based on the service required, site condition and project scope."],
  ["Can I send photos first through WhatsApp?", "Yes, customers can send photos through WhatsApp for initial checking and quotation guidance."],
  ["Which areas do you cover?", "We cover Shah Alam, Klang, Setia Alam, Subang Jaya, Petaling Jaya, Kuala Lumpur, Putrajaya and selected Klang Valley areas."],
  ["Can I pay using BNPL?", "BNPL may be available through selected payment partners, subject to approval."],
];

function CtaButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "dark" | "light" }) {
  const variants = {
    primary: "bg-orange-600 text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700",
    dark: "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20 hover:bg-neutral-800",
    light: "bg-white text-neutral-950 ring-1 ring-neutral-200 hover:bg-orange-50",
  };

  return (
    <a
      href={whatsappLink}
      aria-label={`${children} on WhatsApp`}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-extrabold transition ${variants[variant]}`}
    >
      {children}
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
}) {
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

function PlaceholderImage({ title, detail, index }: { title: string; detail: string; index: number }) {
  return (
    <div className="group overflow-hidden rounded-[2rem] bg-white card-shadow">
      <div className="relative min-h-56 overflow-hidden bg-neutral-950 p-5">
        <div className={`absolute inset-0 ${index % 2 ? "bg-orange-600" : "bg-neutral-950"}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.36),transparent_26%),linear-gradient(135deg,rgba(255,90,0,.88),rgba(8,11,16,.82))]" />
        <div className="relative flex h-48 flex-col justify-between rounded-[1.5rem] border border-white/18 bg-white/10 p-5 text-white backdrop-blur-sm transition group-hover:scale-[1.02]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-orange-600">{["💧", "🧱", "🎨", "✨", "🪞", "🛠️"][index]}</span>
          <div>
            <p className="text-xl font-black">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/78">{detail}</p>
          </div>
        </div>
      </div>
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
              <p className="text-xs font-bold text-neutral-500">Home Repair Experts</p>
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
            <CtaButton>Request Quotation</CtaButton>
            <CtaButton variant="dark">Contact Us</CtaButton>
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
                <CtaButton>Request Quotation</CtaButton>
                <CtaButton variant="dark">Contact Us</CtaButton>
              </div>
            </div>
          </details>
        </div>
      </header>

      <section className="hero-grid-bg relative pb-16 pt-10 sm:pb-24 lg:pt-16">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600 shadow-sm ring-1 ring-orange-100">
              Klang Valley contractor & home repair team
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-neutral-950 sm:text-6xl lg:text-7xl">
              Your Trusted Home Repair & Renovation Partner
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
              Waterproofing, wall crack repair, painting, epoxy coating, mirror installation and minor renovation services throughout Klang Valley.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton>Request Free Quotation</CtaButton>
              <CtaButton variant="light">WhatsApp Abang Reno</CtaButton>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['Free Quotation', 'Fast Response', 'Klang Valley Coverage', 'Flexible Payment Options'].map((badge) => (
                <div key={badge} className="rounded-2xl bg-white p-4 text-sm font-extrabold text-neutral-800 shadow-sm ring-1 ring-black/5">
                  <span className="mb-2 block text-orange-600">✓</span>{badge}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-orange-500/15 blur-3xl" />
            <Image src="/team-van.svg" width={1200} height={820} alt="Abang Reno team of workers in orange shirts and caps standing beside a branded contractor service van" priority className="relative rounded-[2rem] border border-white bg-white card-shadow" />
          </div>
        </div>
      </section>

      <section id="services" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Services" title="Our Services" subtitle="Reliable repair and renovation services for homes, shops and offices." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, description, icon]) => (
            <article key={title} className="rounded-[2rem] bg-white p-6 card-shadow ring-1 ring-black/5 transition hover:-translate-y-1 hover:ring-orange-200">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">{icon}</div>
              <h3 className="text-xl font-black text-neutral-950">{title}</h3>
              <p className="mt-3 leading-7 text-neutral-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 py-16 text-white sm:py-24">
        <div className="section-shell">
          <SectionHeader eyebrow="Why homeowners call us" title="Why Choose Abang Reno" tone="dark" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <div key={reason} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-lg font-black">{index + 1}</span>
                <p className="text-lg font-extrabold">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16 sm:py-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-orange-50 p-6 ring-1 ring-orange-100 sm:p-10">
          <SectionHeader title="Flexible Payment Options" subtitle="Make your home improvement project more manageable with selected payment options." />
          <p className="mx-auto mb-6 max-w-2xl text-center font-bold text-neutral-700">Available through selected payment partners</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {payments.map((payment) => (
              <div key={payment} className="payment-logo flex items-center justify-center rounded-2xl px-3 text-center text-sm font-black text-neutral-900">
                {payment}
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl bg-white p-4 text-center text-sm font-bold text-neutral-600 ring-1 ring-orange-100">
            BNPL availability is subject to approval by selected payment partners.
          </p>
        </div>
      </section>

      <section id="projects" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="Gallery" title="Recent Works" subtitle="A quick look at repair, waterproofing, painting and installation works." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map(([title, detail], index) => <PlaceholderImage key={title} title={title} detail={detail} index={index} />)}
        </div>
      </section>

      <section className="section-shell grid items-center gap-8 py-16 sm:py-24 lg:grid-cols-2">
        <Image src="/team-van.svg" width={1200} height={820} alt="Local Abang Reno team with orange uniforms and branded van" className="rounded-[2rem] bg-white card-shadow" />
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-orange-600">Our team</p>
          <h2 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">Local Team You Can Trust</h2>
          <p className="mt-5 text-lg leading-8 text-neutral-600">Our team provides site inspection, quotation and repair services throughout Klang Valley.</p>
          <div className="mt-7"><CtaButton>Talk to Our Team</CtaButton></div>
        </div>
      </section>

      <section id="coverage" className="bg-white py-16 sm:py-24">
        <div className="section-shell">
          <SectionHeader eyebrow="Coverage" title="Areas We Cover" subtitle="Other nearby Klang Valley areas may be available upon request." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area) => (
              <div key={area} className="rounded-2xl border border-neutral-100 bg-[#fffaf5] p-5 text-center font-black text-neutral-900 shadow-sm">{area}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell py-16 sm:py-24">
        <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto grid max-w-3xl gap-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-3xl bg-white p-5 card-shadow ring-1 ring-black/5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-black text-neutral-950">
                {question}<span className="text-orange-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-neutral-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="section-shell py-16 sm:py-24">
        <div className="orange-gradient overflow-hidden rounded-[2.75rem] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-white/72">Ready to start?</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Need Repair or Renovation Work?</h2>
            <p className="mt-5 text-lg leading-8 text-white/82">Send us your issue, location and photos through WhatsApp. Our team will assist you with the next step.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton variant="light">Request Quotation</CtaButton>
              <CtaButton variant="dark">WhatsApp Now</CtaButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-950 pb-28 pt-14 text-white sm:pb-16">
        <div className="section-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Image src="/abang-reno-logo.svg" width={72} height={72} alt="Abang Reno logo" className="rounded-full bg-white" />
            <h2 className="mt-4 text-2xl font-black">Abang Reno</h2>
            <p className="mt-2 text-white/70">Home Repair & Renovation Services</p>
            <div className="mt-5 space-y-2 text-sm text-white/70">
              <p>WhatsApp: +601151317030</p>
              <p>Website: abangreno.my</p>
              <p>Coverage: Klang Valley, Malaysia</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black">Company</h3>
            <p className="mt-4 text-white/70">Neugens Solution</p>
            <p className="mt-2 text-white/70">Reg. No. : 202503301282 (AS0504872-V)</p>
          </div>
          <div>
            <h3 className="text-lg font-black">Quick Links</h3>
            <div className="mt-4 grid gap-2 text-white/70">
              {navLinks.slice(1).map((link) => <a key={link.href} href={link.href} className="hover:text-orange-400">{link.label}</a>)}
            </div>
          </div>
        </div>
      </footer>

      <a
        href={whatsappLink}
        aria-label="WhatsApp Abang Reno for quotation"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-base font-black text-white shadow-2xl shadow-green-700/30 transition hover:scale-105"
      >
        <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor"><path d="M16.02 3.2C9.28 3.2 3.8 8.55 3.8 15.12c0 2.23.64 4.4 1.86 6.28L3.4 28.8l7.65-2.16a12.63 12.63 0 0 0 4.97.99c6.74 0 12.22-5.35 12.22-11.93S22.76 3.2 16.02 3.2Zm0 22.28c-1.58 0-3.12-.4-4.5-1.14l-.32-.17-4.53 1.28 1.33-4.33-.2-.34a10.15 10.15 0 0 1-1.58-5.37c0-5.38 4.4-9.76 9.8-9.76s9.8 4.38 9.8 9.76-4.4 10.07-9.8 10.07Zm5.39-7.32c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.64.08-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.48-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.91-2.18-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.36-.27.3-1.04 1-1.04 2.45s1.07 2.85 1.21 3.05c.15.2 2.1 3.15 5.1 4.41.71.31 1.27.5 1.7.64.71.22 1.36.19 1.88.12.57-.08 1.76-.7 2.01-1.38.25-.68.25-1.27.17-1.39-.07-.12-.27-.19-.56-.34Z" /></svg>
        <span className="hidden sm:inline">WhatsApp Abang Reno</span>
      </a>
    </main>
  );
}
