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
  categories,
  locations,
}: {
  phoneVerified: boolean;
  categories: Option[];
  locations: Option[];
}) {
  const [verified, setVerified] = useState(phoneVerified);

  if (!verified) {
    return <PhoneVerificationForm onVerified={() => setVerified(true)} />;
  }

  return <VendorRegistrationForm categories={categories} locations={locations} />;
}
