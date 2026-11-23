/* eslint-disable @next/next/no-img-element */
import { relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { SeverityChip } from "./SeverityChip";
import { SourceBadge } from "./SourceBadge";
import { DemoDataBadge } from "./DemoDataBadge";

export function ReportCard({ report }: { report: Report }) {
  return (
    <article
      data-testid="report-card"
      className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-sm font-extrabold text-navy">
          {report.streetName}
        </h3>
        <span className="shrink-0 text-[11px] text-navy/50">
          {relativeTime(report.timestamp)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <SeverityChip severity={report.severity} />
        <SourceBadge source={report.source} />
        {report.source === "sensor" ? <DemoDataBadge /> : null}
      </div>

      <p className="mt-2 text-xs text-navy/70">
        Water: <span className="font-semibold">{report.waterLevel}</span> ·{" "}
        {report.passable ? "Madadaanan" : "Hindi madaanan"}
      </p>

      {report.note ? (
        <p className="mt-1 text-xs text-navy/60">{report.note}</p>
      ) : null}

      {report.photoUrl ? (
        <img
          src={report.photoUrl}
          alt={`Flood at ${report.streetName}`}
          className="mt-2 h-32 w-full rounded-xl object-cover"
        />
      ) : null}
    </article>
  );
}
