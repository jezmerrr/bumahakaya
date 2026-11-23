"use client";

import { useStore } from "@/lib/store";
import { ReportCard } from "./ReportCard";

export function FeedSection() {
  const { reports, sensors } = useStore();
  const items = [...reports, ...sensors].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-3 p-4">
      <h2 className="font-display text-lg font-extrabold text-navy">
        Community feed
      </h2>
      <p className="-mt-2 text-xs text-navy/50">
        Latest reports and sensor readings around DLSU Manila.
      </p>
      {items.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
