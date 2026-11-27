"use client";

import { useId, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  CloudRain,
  GraduationCap,
  Megaphone,
  Radio,
  TrafficCone,
  Waves,
  type LucideIcon,
} from "lucide-react";

import {
  ALERT_CATEGORIES,
  alertCategory,
  groupAlerts,
  isNewAlert,
  type AlertCategory,
} from "@/lib/alerts";
import type { LatLng } from "@/lib/geo";
import { areaStatus, nearbyItems } from "@/lib/mapSummary";
import { severityColor, severityInk, severityShort } from "@/lib/severity";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/time";
import type { Announcement } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";
import { AlertIcon } from "./icons";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };
const RADIUS_M = 700;

// One look per category: chip/heading label, icon, and tint.
const CATEGORY: Record<
  AlertCategory,
  { label: string; Icon: LucideIcon; tile: string; mapLink: boolean }
> = {
  classes: {
    label: "Classes",
    Icon: GraduationCap,
    tile: "bg-violet-50 text-violet-700",
    mapLink: false,
  },
  roads: {
    label: "Roads",
    Icon: TrafficCone,
    tile: "bg-blue-50 text-blue-700",
    mapLink: true,
  },
  water: {
    label: "Water levels",
    Icon: Waves,
    tile: "bg-teal-50 text-teal-700",
    mapLink: true,
  },
  weather: {
    label: "Weather",
    Icon: CloudRain,
    tile: "bg-blue-50 text-blue-700",
    mapLink: false,
  },
  advisory: {
    label: "Advisories",
    Icon: Megaphone,
    tile: "bg-blue-50 text-blue-700",
    mapLink: false,
  },
};

type Filter = AlertCategory | "all";

export function AlertsSection({ onOpenMap }: { onOpenMap?: () => void }) {
  const { announcements, reports, sensors } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // Live status from reports + sensors, the same numbers as the Home card.
  const status = useMemo(
    () =>
      areaStatus(
        nearbyItems([...reports, ...sensors], DLSU_CENTER, RADIUS_M, null),
      ),
    [reports, sensors],
  );

  const counts = useMemo(() => {
    const c = new Map<AlertCategory, number>();
    for (const a of announcements) {
      const k = alertCategory(a);
      c.set(k, (c.get(k) ?? 0) + 1);
    }
    return c;
  }, [announcements]);

  const shown = useMemo(
    () =>
      filter === "all"
        ? announcements
        : announcements.filter((a) => alertCategory(a) === filter),
    [announcements, filter],
  );
  const groups = groupAlerts(shown);
  const chips: Filter[] = [
    "all",
    ...ALERT_CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0),
  ];

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-ink">Alerts</h1>
      <p className="text-sm text-ink/65">
        Official advisories for DLSU and nearby streets
      </p>

      {/* Flooding near you right now (from reports and sensors) */}
      {status.severity !== "Passable" ? (
        <NearYouBanner
          count={status.count}
          label={severityShort(status.severity).toLowerCase()}
          color={severityColor(status.severity)}
          ink={severityInk(status.severity)}
          onOpenMap={onOpenMap}
        />
      ) : null}

      {/* Category chips */}
      <div
        role="group"
        aria-label="Filter alerts"
        className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {chips.map((key) => {
          const active = key === filter;
          const label = key === "all" ? "All" : CATEGORY[key].label;
          const n = key === "all" ? announcements.length : (counts.get(key) ?? 0);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                active
                  ? "border-ink bg-ink text-surface"
                  : "border-ink/15 bg-surface text-ink/70"
              }`}
            >
              {label}{" "}
              <span className={active ? "text-surface/70" : "text-ink/50"}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Alerts, newest first, in time sections */}
      {groups.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-surface p-6 text-center text-sm text-ink/65 shadow-sm">
          Walang alerts dito ngayon.
        </p>
      ) : (
        groups.map((g) => (
          <AlertGroupSection
            key={g.label}
            label={g.label}
            items={g.items}
            openId={openId}
            onToggle={(id) => setOpenId((cur) => (cur === id ? null : id))}
            onOpenMap={onOpenMap}
          />
        ))
      )}
    </div>
  );
}

function NearYouBanner({
  count,
  label,
  color,
  ink,
  onOpenMap,
}: {
  count: number;
  label: string;
  color: string;
  ink: string;
  onOpenMap?: () => void;
}) {
  return (
    <section
      aria-label="Flooding near you"
      className="mt-4 flex items-center gap-3 rounded-2xl border p-3"
      style={{ backgroundColor: `${color}14`, borderColor: `${color}40` }}
    >
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${color}24`, color: ink }}
      >
        <AlertIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ink }}>
          Flooding near you
        </p>
        <p className="text-sm font-semibold text-ink">
          {count} {count === 1 ? "road" : "roads"} {label} within {RADIUS_M} m
        </p>
      </div>
      {onOpenMap ? (
        <button
          type="button"
          onClick={onOpenMap}
          className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
        >
          See on map ›
        </button>
      ) : null}
    </section>
  );
}

function AlertGroupSection({
  label,
  items,
  openId,
  onToggle,
  onOpenMap,
}: {
  label: string;
  items: Announcement[];
  openId: string | null;
  onToggle: (id: string) => void;
  onOpenMap?: () => void;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="mt-5">
      <h2
        id={headingId}
        className="mb-2 flex items-baseline justify-between px-1 text-xs font-semibold uppercase tracking-wide text-ink/65"
      >
        {label}
        <span className="font-normal normal-case tracking-normal">
          {items.length} {items.length === 1 ? "alert" : "alerts"}
        </span>
      </h2>
      <ul className="space-y-2.5">
        {items.map((a) => (
          <li key={a.id}>
            <AlertCard
              alert={a}
              open={openId === a.id}
              onToggle={() => onToggle(a.id)}
              onOpenMap={onOpenMap}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AlertCard({
  alert: a,
  open,
  onToggle,
  onOpenMap,
}: {
  alert: Announcement;
  open: boolean;
  onToggle: () => void;
  onOpenMap?: () => void;
}) {
  const cat = CATEGORY[alertCategory(a)];
  const Icon = cat.Icon;
  const fresh = isNewAlert(a);
  const bodyId = useId();
  const titleId = useId();
  const metaId = useId();
  const sensor = a.source === "sensor";

  return (
    <article
      data-testid="alert-card"
      className="rounded-3xl bg-surface p-4 shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        // Screen readers hear the title as the name, then time and text.
        aria-labelledby={titleId}
        aria-describedby={`${metaId} ${bodyId}`}
        className="flex w-full gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${cat.tile}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            id={metaId}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/65"
          >
            {cat.label}
            <span aria-hidden="true">·</span>
            <span className="normal-case tracking-normal">
              {relativeTime(a.timestamp)}
            </span>
            {fresh ? (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-signal px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-white">
                New
              </span>
            ) : null}
          </span>
          <span
            id={titleId}
            className="mt-0.5 block font-display text-base font-extrabold leading-snug text-ink"
          >
            {a.title}
          </span>
          <span
            id={bodyId}
            // line-clamp sets its own display, so only use "block" when open.
            className={`mt-1 text-sm leading-relaxed text-ink/70 ${
              open ? "block" : "line-clamp-2"
            }`}
          >
            {a.body}
          </span>
        </span>

        <ChevronDown
          aria-hidden="true"
          size={18}
          className={`mt-1 shrink-0 text-ink/45 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-14">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            sensor ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {sensor ? <Radio size={12} /> : <BadgeCheck size={12} />}
          {sensor ? "Sensor" : "Official"}
        </span>
        <span className="text-xs font-semibold text-ink/70">{a.agency}</span>
        <DemoDataBadge />
      </div>

      {open && cat.mapLink && onOpenMap ? (
        <div className="mt-3 pl-14">
          <button
            type="button"
            onClick={onOpenMap}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-surface"
          >
            See on map ›
          </button>
        </div>
      ) : null}
    </article>
  );
}
