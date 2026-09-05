"use client";

import { useState } from "react";

export default function VerificationReviewActions({
  verificationId,
  vendorId,
}: {
  verificationId: string;
  vendorId: string;
}) {
  const [done, setDone] = useState(false);

  async function decide(decision: "verified_ssm" | "rejected") {
    await fetch("/api/admin/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_id: verificationId, vendor_id: vendorId, decision }),
    });
    setDone(true);
  }

  if (done) return <p className="mt-2 text-xs text-green-700">Keputusan direkodkan.</p>;

  return (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => decide("verified_ssm")}
        className="focus-ring rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
      >
        Approve
      </button>
      <button
        onClick={() => decide("rejected")}
        className="focus-ring rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Reject
      </button>
    </div>
  );
}
