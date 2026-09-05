"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — also enforced at the storage bucket level (0007 migration)

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Jenis fail tidak dibenarkan. Hanya PDF, PNG, atau JPG dibenarkan.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Saiz fail melebihi had 5MB.";
  }
  return null;
}

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  return file.type === "application/pdf" ? "pdf" : "jpg";
}

/**
 * Uploads go into the PRIVATE `vendor-private-documents` bucket — never
 * public. Storage paths are never derived from the user's original
 * filename: the server (§7, /api/verification/prepare-upload) issues a
 * random, non-guessable path first, and this component uploads to exactly
 * that path. MIME type and size are validated here client-side and also
 * enforced server-side at the storage bucket level (§5) and by object
 * existence checks before the verification request is created (§6).
 */
export default function VerificationUploadForm({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [ssmFile, setSsmFile] = useState<File | null>(null);
  const [icFile, setIcFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ssmFile || !icFile) return;

    const ssmError = validateFile(ssmFile);
    const icError = validateFile(icFile);
    if (ssmError || icError) {
      setErrorMessage(ssmError ?? icError);
      setStatus("error");
      return;
    }

    setErrorMessage(null);
    setStatus("submitting");

    // Step 1: ask the server for the exact paths to upload to.
    const prepareRes = await fetch("/api/verification/prepare-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssm_extension: extensionFor(ssmFile),
        ic_extension: extensionFor(icFile),
      }),
    });

    if (!prepareRes.ok) {
      const data = await prepareRes.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Gagal menyediakan muat naik.");
      setStatus("error");
      return;
    }

    const { ssmPath, icPath } = await prepareRes.json();

    // Step 2: upload directly to the paths the server issued.
    const [ssmUpload, icUpload] = await Promise.all([
      supabase.storage.from("vendor-private-documents").upload(ssmPath, ssmFile, { contentType: ssmFile.type }),
      supabase.storage.from("vendor-private-documents").upload(icPath, icFile, { contentType: icFile.type }),
    ]);

    if (ssmUpload.error || icUpload.error) {
      setErrorMessage("Gagal memuat naik fail. Sila cuba lagi.");
      setStatus("error");
      return;
    }

    // Step 3: finalize — server confirms both objects exist, then submits
    // via the atomic RPC.
    const res = await fetch("/api/verification/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssm_document_path: ssmPath,
        ic_document_path: icPath,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Gagal menghantar dokumen.");
      setStatus("error");
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="mt-4 text-sm text-green-700">
        Dokumen anda telah dihantar dan sedang menunggu semakan admin.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="block text-sm font-medium">Sijil SSM</label>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          required
          onChange={(e) => setSsmFile(e.target.files?.[0] ?? null)}
          className="mt-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Kad Pengenalan (IC)</label>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          required
          onChange={(e) => setIcFile(e.target.files?.[0] ?? null)}
          className="mt-1 text-sm"
        />
      </div>
      {status === "error" && errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="focus-ring rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "submitting" ? "Menghantar..." : "Hantar untuk Semakan"}
      </button>
    </form>
  );
}
