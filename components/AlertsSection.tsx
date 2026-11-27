
"use client";

import {
  CloudRain,
  GraduationCap,
  Landmark,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/time";
import type { AnnouncementSource } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";

const SOURCE_STYLE: Record<
  AnnouncementSource,
  {
    label: string;
    bg: string;
    color: string;
    Icon: LucideIcon;
  }
> = {
  lgu: {
    label: "LGU",
    bg: "bg-blue-50",
    color: "text-blue-700",
    Icon: Landmark,
  },
  school: {
    label: "School",
    bg: "bg-violet-50",
    color: "text-violet-700",
    Icon: GraduationCap,
  },
  sensor: {
    label: "Water Sensor",
    bg: "bg-teal-50",
    color: "text-teal-700",
    Icon: Waves,
  },
  weather: {
    label: "Weather",
    bg: "bg-rose-50",
    color: "text-rose-700",
    Icon: CloudRain,
  },
};

export function AlertsSection() {
  const { announcements } = useStore();

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Alerts
      </h1>
      <p className="text-sm text-ink/65">Flood warnings near you</p>

      <div className="mt-4 space-y-3">
        {announcements.map((a) => {
          const source = SOURCE_STYLE[a.source];
          const Icon = source.Icon;

          return (
            <article
              key={a.id}
              className="flex gap-3 rounded-3xl bg-surface p-4 shadow-sm"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${source.bg} ${source.color}`}
              >
                <Icon size={21} strokeWidth={1.8} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-extrabold text-ink">
                    {a.title}
                  </h3>
                  <span className="shrink-0 text-[11px] text-ink/60">
                    {relativeTime(a.timestamp)}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-ink/70">
                  {a.body}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${source.bg} ${source.color}`}
                  >
                    {source.label}
                  </span>

                  <span className="text-[11px] font-semibold text-ink/65">
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
