/**
 * §16 — Never implies endorsement of quality, only that SSM documents were
 * reviewed. The disclaimer text is fixed per spec and must not be reworded
 * into something that sounds like a quality guarantee.
 */
const DISCLAIMER =
  "Identiti perniagaan telah disemak berdasarkan dokumen SSM yang dikemukakan. Pengesahan ini bukan jaminan kualiti perkhidmatan.";

export default function VerifiedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      title={DISCLAIMER}
      className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800 ${textSize}`}
    >
      SSM Verified ✓
    </span>
  );
}

export { DISCLAIMER as SSM_VERIFIED_DISCLAIMER };
