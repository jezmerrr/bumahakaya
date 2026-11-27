"use client";

import { Fragment, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { filterReports, filterSocial } from "@/lib/feed";
import { distanceMeters, type LatLng } from "@/lib/geo";
import {
  areaStatus,
  nearbyItems,
  newestTimestamp,
  summarize,
} from "@/lib/mapSummary";
import { severityColor, severityFill, severityShort } from "@/lib/severity";
import type { Severity, SocialPost } from "@/lib/types";
import { HomeHero } from "./HomeHero";
import { SearchIcon, SlidersIcon, XIcon } from "./icons";
import { ReportCard } from "./ReportCard";
import { BottomSheet } from "./Sheet";
import { SocialCard } from "./SocialCard";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };
const RADIUS_M = 700;

type Source = "Community" | "Social" | "All";
const SOURCES: Source[] = ["All", "Community", "Social"];

// Worst first, matching how people scan for danger.
const CONDITIONS: Severity[] = ["Impassable", "Caution", "Passable"];

export function HomeSection({ onOpenMap }: { onOpenMap?: () => void }) {
  const { reports, sensors, social } = useStore();
  const [source, setSource] = useState<Source>("All");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Status card: everything reported within 700 m, reports and sensors.
  const all = useMemo(() => [...reports, ...sensors], [reports, sensors]);
  const nearby = useMemo(
    () => nearbyItems(all, DLSU_CENTER, RADIUS_M, null),
    [all],
  );

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [reports],
  );

  const visibleReports = useMemo(
    () =>
      source === "Social"
        ? []
        : filterReports(sortedReports, { query, severity }),
    [sortedReports, source, query, severity],
  );

  // Social posts have no road condition, so a condition filter hides them.
  const visibleSocial = useMemo(
    () =>
      source === "Community" || severity !== null
        ? []
        : filterSocial(social, query),
    [social, source, query, severity],
  );

  const filtering = query.trim() !== "" || severity !== null;
  const activeFilters = (source !== "All" ? 1 : 0) + (severity ? 1 : 0);
  const total = visibleReports.length + visibleSocial.length;

  function chooseSource(next: Source) {
    setSource(next);
    // The condition filter doesn't apply to Social, so don't leave it on.
    if (next === "Social") setSeverity(null);
  }

  function showSeverity(next: Severity) {
    setSeverity(next);
    if (source === "Social") setSource("All");
  }

  function clearFilters() {
    setQuery("");
    setSeverity(null);
    setSource("All");
  }

  return (
    <div>
      <div className="px-4 pt-4">
        <HomeHero
          status={areaStatus(nearby)}
          summary={summarize(nearby)}
          markers={all}
          center={DLSU_CENTER}
          updatedAt={newestTimestamp(all)}
          onShow={showSeverity}
          onOpenMap={onOpenMap}
        />
      </div>

      {/* Search + Filters stay at the top while scrolling */}
      <div className="sticky top-0 z-20 border-b border-ink/5 bg-mist/85 px-4 pb-2 pt-3 backdrop-blur-xl">
        <div className="flex gap-2">
          <div role="search" className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              aria-label="Search reports and posts"
              placeholder="Search a street or keyword"
              enterKeyHint="search"
              autoComplete="off"
              // 16px text stops iOS Safari from zooming in on focus.
              className="w-full rounded-full border border-ink/10 bg-surface py-2.5 pl-10 pr-10 text-base text-ink shadow-sm placeholder:text-ink/50 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink/65 hover:bg-ink/5"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-haspopup="dialog"
            aria-label={
              activeFilters ? `Filters (${activeFilters} on)` : "Filters"
            }
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border shadow-sm ${
              activeFilters
                ? "border-ink bg-ink text-surface"
                : "border-ink/10 bg-surface text-ink/70"
            }`}
          >
            <SlidersIcon className="h-5 w-5" />
            {activeFilters ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-signal text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            ) : null}
          </button>
        </div>

        {/* Active filters, each removable */}
        {activeFilters ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {source !== "All" ? (
              <ActiveChip
                label={source}
                onRemove={() => setSource("All")}
              />
            ) : null}
            {severity ? (
              <ActiveChip
                label={severityShort(severity)}
                color={severityColor(severity)}
                onRemove={() => setSeverity(null)}
              />
            ) : null}
          </div>
        ) : null}

        {filtering ? (
          <div className="mt-2 flex items-center justify-between text-xs">
            <p role="status" className="text-ink/70">
              {total} {total === 1 ? "result" : "results"}
              {severity !== null && source === "All"
                ? " · community reports only"
                : ""}
            </p>
            {total > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-signal"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2.5 px-4 pb-4 pt-3">
        {!filtering ? (
          <div className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-base font-extrabold text-ink">
              Latest updates
            </h2>
            <span className="text-xs text-ink/65">
              {total} {total === 1 ? "post" : "posts"}
            </span>
          </div>
        ) : null}

        {visibleReports.map((report, i) => (
          <Fragment key={report.id}>
            <ReportCard
              report={report}
              distanceM={distanceMeters(DLSU_CENTER, report)}
            />
            {/* Social posts get their own sideways row, early in the feed */}
            {i === Math.min(2, visibleReports.length - 1) &&
            source === "All" ? (
              <SocialRow posts={visibleSocial} />
            ) : null}
          </Fragment>
        ))}
        {/* Only social posts (or no reports matched): show them full width */}
        {source === "Social" || visibleReports.length === 0
          ? visibleSocial.map((post) => <SocialCard key={post.id} post={post} />)
          : null}

        {total === 0 ? (
          <div className="rounded-3xl bg-surface p-6 text-center shadow-sm">
            <p className="font-display text-base font-extrabold text-ink">
              {filtering ? "Walang tugma" : "Wala pang posts dito"}
            </p>
            <p className="mt-1 text-sm text-ink/70">
              {filtering
                ? query.trim()
                  ? `Nothing matches “${query.trim()}”. Try another street name or clear the filters.`
                  : "Nothing matches these filters right now."
                : "Reports will show up here once someone posts."}
            </p>
            {filtering || activeFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {filtersOpen ? (
        <BottomSheet title="Filters" onClose={() => setFiltersOpen(false)}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/65">
            Show
          </p>
          <div
            role="group"
            aria-label="Filter by source"
            className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-ink/5 p-1"
          >
            {SOURCES.map((s) => {
              const active = s === source;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => chooseSource(s)}
                  aria-pressed={active}
                  className={`rounded-full py-2 text-sm font-semibold ${
                    active ? "bg-surface text-ink shadow-sm" : "text-ink/70"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {source !== "Social" ? (
            <>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink/65">
                Road condition
              </p>
              <div
                role="group"
                aria-label="Filter by road condition"
                className="mt-2 flex flex-wrap gap-2"
              >
                {CONDITIONS.map((s) => {
                  const active = s === severity;
                  const color = severityColor(s);
                  const fill = severityFill(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(active ? null : s)}
                      aria-pressed={active}
                      style={
                        active
                          ? { backgroundColor: fill, borderColor: fill }
                          : undefined
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold ${
                        active
                          ? "text-white"
                          : "border-ink/15 bg-surface text-ink/70"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: active ? "#fff" : color }}
                      />
                      {severityShort(s)}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSeverity(null);
                setSource("All");
              }}
              className="px-2 py-3 text-sm font-semibold text-ink/70"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 rounded-2xl bg-signal py-3 text-sm font-semibold text-white"
            >
              Show {total} {total === 1 ? "post" : "posts"}
            </button>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}

function ActiveChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-surface py-1 pl-2.5 pr-1.5 text-xs font-semibold text-ink/80 shadow-sm"
    >
      {color ? (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {label}
      <XIcon className="h-3.5 w-3.5 text-ink/60" />
    </button>
  );
}

// Sideways-scrolling row of social posts, with a heading and a count.
function SocialRow({ posts }: { posts: SocialPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-label="From social media" className="-mx-4 py-1">
      <div className="flex items-baseline justify-between px-5 pb-2">
        <h2 className="font-display text-base font-extrabold text-ink">
          From social media
        </h2>
        <span className="text-xs text-ink/65">
          {posts.length} {posts.length === 1 ? "post" : "posts"} · swipe
        </span>
      </div>
      <div className="flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <SocialCard key={post.id} post={post} compact />
        ))}
      </div>
    </section>
  );
}
