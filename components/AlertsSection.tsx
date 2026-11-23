"use client";

import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/time";
import type { AnnouncementType } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";

const ICON: Record<AnnouncementType, { bg: string; dot: string }> = {
  closure: { bg: "bg-impass/10", dot: "bg-impass" },
  suspension: { bg: "bg-amber/15", dot: "bg-amber" },
  advisory: { bg: "bg-signal/10", dot: "bg-signal" },
};

export function AlertsSection() {
  const { announcements } = useStore();

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-navy">Alerts</h1>
      <p className="text-sm text-navy/50">Flood warnings near you</p>

      <div className="mt-4 space-y-3">
        {announcements.map((a) => {
          const icon = ICON[a.type];
          return (
            <article
              key={a.id}
              className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm"
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${icon.bg}`}
              >
                <span className={`h-3 w-3 rounded-full ${icon.dot}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-extrabold text-navy">
                    {a.title}
                  </h3>
                  <span className="shrink-0 text-[11px] text-navy/40">
                    {relativeTime(a.timestamp)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-navy/60">{a.body}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-navy/50">
                    {a.agency}
                  </span>
                  <DemoDataBadge />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
