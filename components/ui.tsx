import { severityColor, severityShort } from "@/lib/severity";
import type { Severity, Trend } from "@/lib/types";

export function initialsOf(name: string): string {
  const parts = name.split(/[\s._@/]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-navy font-bold text-white ${
        className ?? "h-10 w-10 text-sm"
      }`}
    >
      {initialsOf(name)}
    </span>
  );
}

export function StatusPill({ severity }: { severity: Severity }) {
  return (
    <span
      style={{ backgroundColor: severityColor(severity) }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {severityShort(severity)}
    </span>
  );
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function SensorBar({
  cm,
  trend,
  severity,
  distanceM,
}: {
  cm: number;
  trend?: Trend;
  severity: Severity;
  distanceM?: number;
}) {
  const pct = Math.min(100, Math.round((cm / 80) * 100));
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          style={{ width: `${pct}%`, backgroundColor: severityColor(severity) }}
          className="h-full rounded-full"
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-navy/60">
        <span>
          Sensor: {cm} cm{trend ? ` · ${trend}` : ""}
        </span>
        {distanceM != null ? <span>{formatDistance(distanceM)}</span> : null}
      </div>
    </div>
  );
}
