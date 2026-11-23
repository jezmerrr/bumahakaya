"use client";

import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/time";
import type { AnnouncementType } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";

const TYPE_LABEL: Record<AnnouncementType, string> = {
  suspension: "Class suspension",
  closure: "Road closure",
  advisory: "Advisory",
};

export function AnnouncementsSection() {
  const { announcements } = useStore();

  return (
    <div className="space-y-3 p-4">
      <h2 className="font-display text-lg font-extrabold text-navy">
        Official announcements
      </h2>
      <p className="-mt-2 text-xs text-navy/50">
        From government agencies and LGUs. Labeled by source.
      </p>
      {announcements.map((a) => (
        <article
          key={a.id}
          className="rounded-2xl border-l-4 border-navy bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Official
            </span>
            <span className="inline-flex items-center rounded-full bg-navy/5 px-2 py-0.5 text-[11px] font-semibold text-navy/70">
              {TYPE_LABEL[a.type]}
            </span>
            <DemoDataBadge />
          </div>
          <h3 className="mt-2 font-display text-sm font-extrabold text-navy">
            {a.title}
          </h3>
          <p className="mt-1 text-xs text-navy/70">{a.body}</p>
          <p className="mt-2 text-[11px] text-navy/50">
            <span className="font-semibold text-navy/70">{a.agency}</span> ·{" "}
            {relativeTime(a.timestamp)}
          </p>
        </article>
      ))}
    </div>
  );
}
