"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { filterReports, filterSocial } from "@/lib/feed";
import { distanceMeters, type LatLng } from "@/lib/geo";
import { severityColor, severityShort } from "@/lib/severity";
import type { Severity } from "@/lib/types";
import { SearchIcon, XIcon } from "./icons";
import { ReportCard } from "./ReportCard";
import { SocialCard } from "./SocialCard";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

type Source = "Community" | "Social" | "All";
const SOURCES: Source[] = ["All", "Community", "Social"];

// Worst first, matching how people scan for danger.
const CONDITIONS: Severity[] = ["Impassable", "Caution", "Passable"];

export function HomeSection() {
  const { reports, social } = useStore();
  const [source, setSource] = useState<Source>("All");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [query, setQuery] = useState("");

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
  const total = visibleReports.length + visibleSocial.length;

  function chooseSource(next: Source) {
    setSource(next);
    // The condition row is hidden for Social, so don't leave it silently on.
    if (next === "Social") setSeverity(null);
  }

  function clearFilters() {
    setQuery("");
    setSeverity(null);
  }

  return (
    <div>
      <div className="rounded-t-3xl bg-mist px-4 pb-2 pt-4">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Near you
        </h1>
        <p className="text-sm text-navy/50">Taft Avenue, Manila · Just now</p>

        {/* Search */}
        <div role="search" className="relative mt-3">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
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
            className="w-full rounded-full border border-navy/15 bg-white py-2.5 pl-10 pr-10 text-base text-navy placeholder:text-navy/40 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-navy/50 hover:bg-navy/5"
            >
              <XIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Source filter */}
        <div
          role="group"
          aria-label="Filter by source"
          className="mt-3 flex gap-2"
        >
          {SOURCES.map((s) => {
            const active = s === source;
            return (
              <button
                key={s}
                type="button"
                onClick={() => chooseSource(s)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  active
                    ? "bg-signal text-white"
                    : "border border-navy/15 bg-white text-navy/70"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Road-condition filter (reports only). Tap again to turn off. */}
        {source !== "Social" ? (
          <div
            role="group"
            aria-label="Filter by road condition"
            className="mt-2 flex flex-wrap gap-2"
          >
            {CONDITIONS.map((s) => {
              const active = s === severity;
              const color = severityColor(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(active ? null : s)}
                  aria-pressed={active}
                  style={
                    active
                      ? { backgroundColor: color, borderColor: color }
                      : undefined
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "text-white"
                      : "border-navy/15 bg-white text-navy/70"
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
        ) : null}

        {filtering ? (
          <div className="mt-3 flex items-center justify-between text-xs">
            <p role="status" className="text-navy/50">
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

      <div className="space-y-3 px-4 pb-4 pt-3">
        {visibleReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            distanceM={distanceMeters(DLSU_CENTER, report)}
          />
        ))}
        {visibleSocial.map((post) => (
          <SocialCard key={post.id} post={post} />
        ))}

        {total === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="font-display text-base font-extrabold text-navy">
              {filtering ? "Walang tugma" : "Wala pang posts dito"}
            </p>
            <p className="mt-1 text-sm text-navy/50">
              {filtering
                ? query.trim()
                  ? `Nothing matches “${query.trim()}”. Try another street name or clear the filters.`
                  : "Nothing matches these filters right now."
                : "Reports will show up here once someone posts."}
            </p>
            {filtering ? (
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
    </div>
  );
}
