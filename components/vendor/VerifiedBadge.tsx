const DISCLAIMER =
  "Pengesahan ini hanya mengesahkan dokumen perniagaan yang dikemukakan dan bukan jaminan atau endorsement terhadap kualiti kerja vendor.";

export default function VerifiedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";
  return (
    <span title={DISCLAIMER} className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800 ${textSize}`}>
      Disahkan SSM ✓
    </span>
  );
}
export { DISCLAIMER as SSM_VERIFIED_DISCLAIMER };
