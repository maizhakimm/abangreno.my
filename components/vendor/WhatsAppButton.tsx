/** §17/§46 — WhatsApp must be the dominant CTA; never placed near ad slots. */
export default function WhatsAppButton({
  phone,
  message,
  className = "",
}: {
  phone: string;
  message?: string;
  className?: string;
}) {
  const digits = phone.replace(/[^0-9]/g, "");
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95 ${className}`}
    >
      WhatsApp
    </a>
  );
}
