
"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { distanceMeters, type LatLng } from "@/lib/geo";
import { ReportCard } from "./ReportCard";
import { SocialCard } from "./SocialCard";

const DLSU_CENTER: LatLng = { lat: 14.5647, lng: 120.9936 };

type Filter = "Community" | "Social" | "All";
const FILTERS: Filter[] = ["All", "Community", "Social"];

export function HomeSection() {
  const { reports, social } = useStore();
  const [filter, setFilter] = useState<Filter>("All");

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [reports],
  );

  const showReports = filter !== "Social";
  const showSocial = filter !== "Community";

  return (
    <div>
      <div className="rounded-t-3xl bg-mist px-4 pb-2 pt-4">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Near you
        </h1>
        <p className="text-sm text-navy/50">Taft Avenue, Manila · Just now</p>

        <div className="mt-3 flex gap-2">
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  active
                    ? "bg-signal text-white"
                    : "border border-navy/15 bg-white text-navy/70"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4 pt-3">
        {showReports &&
          sortedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              distanceM={distanceMeters(DLSU_CENTER, report)}
            />
          ))}
        {showSocial &&
          social.map((post) => <SocialCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
