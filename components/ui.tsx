import { severityColor, severityShort } from "@/lib/severity";
import type { Severity, Trend } from "@/lib/types";
import type { ReactNode } from "react";
import { PencilIcon, TrashIcon } from "./icons";

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

export function formatDistance(m: number): string {
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

// Round icon-only button. Always pass a label: it becomes the accessible name
// and the hover tooltip.
export function IconButton({
  label,
  onClick,
  tone = "neutral",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
        tone === "danger"
          ? "bg-impass/10 text-impass hover:bg-impass/15"
          : "bg-navy/5 text-navy/60 hover:bg-navy/10"
      }`}
    >
      {children}
    </button>
  );
}

// Edit + delete controls shown only on the current user's own reports.
export function OwnerActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 self-start">
      <IconButton label="Edit report" onClick={onEdit}>
        <PencilIcon className="h-4 w-4" />
      </IconButton>
      <IconButton label="Delete report" tone="danger" onClick={onDelete}>
        <TrashIcon className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
