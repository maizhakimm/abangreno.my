"use client";

import { useState } from "react";
import PhoneVerificationForm from "@/components/auth/PhoneVerificationForm";
import VendorRegistrationForm from "@/components/vendor/VendorRegistrationForm";

interface Option {
  id: string;
  name: string;
}

export default function VendorRegistrationGate({
  phoneVerified,
  verifiedPhone,
  categories,
  locations,
}: {
  phoneVerified: boolean;
  verifiedPhone: string | null;
  categories: Option[];
  locations: Option[];
}) {
  const [phone, setPhone] = useState<string | null>(phoneVerified ? verifiedPhone : null);

  if (!phone) {
    return <PhoneVerificationForm onVerified={(verified) => setPhone(verified)} />;
  }

  return <VendorRegistrationForm verifiedPhone={phone} categories={categories} locations={locations} />;
}
