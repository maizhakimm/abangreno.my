// Business details shared by the page, metadata and structured data.
// Edit this file to update contact info, service areas and FAQ.

export const BUSINESS = {
  name: "Abang Reno",
  company: "Neugens Solution",
  ssm: "202503301282 (AS0504872-V)",
  url: "https://abangreno.my",
  phoneE164: "+601151317030",
  description:
    "Abang Reno menyediakan servis lantai epoxy dan baiki dinding retak & bocor di seluruh Klang Valley. Site inspection percuma dan quotation bertulis sebelum kerja bermula.",
};

// Set to false once the before/after gallery uses real project photos.
export const galleryIsPlaceholder = true;

export const heroGuarantees = ["Site inspection percuma", "Jaminan perkhidmatan 6 bulan", "Team profesional"];

export const SERVICE_AREAS = [
  "Kuala Lumpur",
  "Petaling Jaya",
  "Shah Alam",
  "Subang Jaya",
  "Klang",
  "Puchong",
  "Cheras",
  "Ampang",
  "Kajang",
  "Bangi",
  "Seri Kembangan",
  "Selayang",
  "Gombak",
  "Rawang",
  "Setia Alam",
  "Cyberjaya",
  "Putrajaya",
];

export function whatsappLink(service?: string) {
  const lines = [
    "Salam Abang Reno, saya nak tempah site inspection percuma.",
    "",
    `Servis: ${service ?? ""}`,
    "Lokasi: ",
    "",
    "(Saya akan lampirkan gambar masalah)",
  ];
  return `https://wa.me/${BUSINESS.phoneE164.replace("+", "")}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export const faqs = [
  {
    q: "Betul ke site inspection percuma?",
    a: "Ya. Kami datang ke rumah anda di sekitar Klang Valley untuk periksa dan ukur tanpa sebarang caj, dan tiada kewajipan untuk teruskan.",
  },
  {
    q: "Berapa harga lantai epoxy?",
    a: "Harga bergantung pada keluasan, keadaan lantai sedia ada dan jenis sistem epoxy yang sesuai. Selepas site inspection, anda akan terima quotation bertulis dengan harga penuh.",
  },
  {
    q: "Berapa lama kerja epoxy siap dan bila lantai boleh digunakan?",
    a: "Kebanyakan kerja rumah siap dalam 1 hingga 3 hari. Biasanya lantai boleh dipijak selepas lebih kurang 24 jam, dan kereta boleh diletakkan selepas beberapa hari. Tempoh tepat akan dimaklumkan mengikut sistem yang digunakan.",
  },
  {
    q: "Dinding saya retak dan air masuk bila hujan. Boleh dibaiki?",
    a: "Boleh. Kami periksa punca kebocoran dahulu, kemudian baiki retakan dan pasang lapisan kalis air sebelum dicat semula supaya masalah tidak berulang.",
  },
  {
    q: "Adakah kerja disertakan jaminan?",
    a: "Ya. Setiap kerja disertakan jaminan perkhidmatan selama 6 bulan. Butiran jaminan dinyatakan dalam quotation anda.",
  },
  {
    q: "Bagaimana cara bayaran?",
    a: "Terma bayaran dan deposit dinyatakan dalam quotation bertulis sebelum kerja bermula. Tiada caj tersembunyi.",
  },
];
