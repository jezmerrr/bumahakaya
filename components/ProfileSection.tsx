"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { Avatar } from "./ui";
import { ReportCard } from "./ReportCard";

const AREAS = ["Taft Ave", "Vito Cruz", "Agno St", "Estrada St", "Leon Guinto"];
const SAVED_KEY = "bk.savedAreas.v1";

type View = "menu" | "reports" | "areas";

export function ProfileSection({ onLogout }: { onLogout?: () => void }) {
  const { reports } = useStore();
  const myReports = reports.filter((r) => r.author === CURRENT_USER.handle);

  const [view, setView] = useState<View>("menu");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  function toggleArea(area: string) {
    setSaved((prev) => {
      const next = prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area];
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  if (view === "reports") {
    return (
      <Subpage title="My reports" onBack={() => setView("menu")}>
        {myReports.length === 0 ? (
          <p className="text-sm text-navy/50">
            Wala ka pang na-report. Mag-tap sa + button para mag-report ng baha.
          </p>
        ) : (
          <div className="space-y-3">
            {myReports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </Subpage>
    );
  }

  if (view === "areas") {
    return (
      <Subpage title="Saved areas" onBack={() => setView("menu")}>
        <p className="mb-3 text-sm text-navy/50">
          Save the streets you pass often para mabilis mo silang ma-check.
        </p>
        <div className="space-y-2">
          {AREAS.map((area) => {
            const isSaved = saved.includes(area);
            return (
              <div
                key={area}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <span className="text-sm font-semibold text-navy">{area}</span>
                <button
                  type="button"
                  aria-label={`${isSaved ? "Saved" : "Save"} ${area}`}
                  onClick={() => toggleArea(area)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isSaved
                      ? "bg-signal text-white"
                      : "border border-navy/20 text-navy/60"
                  }`}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            );
          })}
        </div>
      </Subpage>
    );
  }

  const stats = [
    { value: myReports.length, label: "Reports" },
    { value: 9, label: "Verified" },
    { value: saved.length, label: "Saved" },
  ];

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-navy">Profile</h1>

      <div className="mt-4 flex flex-col items-center">
        <Avatar name={CURRENT_USER.name} className="h-24 w-24 bg-signal text-2xl" />
        <h2 className="mt-3 font-display text-xl font-extrabold text-navy">
          {CURRENT_USER.name}
        </h2>
        <p className="text-sm text-navy/50">{CURRENT_USER.role}</p>
      </div>

      <div className="mt-5 flex rounded-3xl bg-white p-4 shadow-sm">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-display text-xl font-extrabold text-navy">
              {s.value}
            </p>
            <p className="text-xs text-navy/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        <button
          onClick={() => setView("reports")}
          className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-navy"
        >
          My reports <span className="text-navy/30">›</span>
        </button>
        <div className="mx-4 border-t border-navy/10" />
        <button
          onClick={() => setView("areas")}
          className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-navy"
        >
          Saved areas <span className="text-navy/30">›</span>
        </button>
        <div className="mx-4 border-t border-navy/10" />
        <button
          onClick={() => onLogout?.()}
          className="w-full px-4 py-4 text-left text-sm font-semibold text-impass"
        >
          Log out
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-navy/40">
        Demo profile. Accounts are not part of this MVP.
      </p>
    </div>
  );
}

function Subpage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 pb-4 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="rounded-full border border-navy/15 px-3 py-1 text-sm font-semibold text-navy/70"
        >
          ‹ Back
        </button>
        <h1 className="font-display text-xl font-extrabold text-navy">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
