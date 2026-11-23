import type { Source } from "@/lib/types";

const LABELS: Record<Source, string> = {
  community: "Community",
  sensor: "Sensor",
  official: "Official",
};

const STYLES: Record<Source, string> = {
  community: "bg-signal/10 text-signal",
  sensor: "bg-aqua/20 text-navy",
  official: "bg-navy text-white",
};

export function SourceBadge({ source }: { source: Source }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLES[source]}`}
    >
      {LABELS[source]}
    </span>
  );
}
