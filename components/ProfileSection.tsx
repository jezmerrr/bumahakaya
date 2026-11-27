
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { Avatar } from "./ui";
import { ReportCard } from "./ReportCard";

const AREAS = ["Taft Ave", "Vito Cruz", "Agno St", "Estrada St", "Leon Guinto"];
const SAVED_KEY = "bk.savedAreas.v1";

type View = "menu" | "reports" | "areas";

export function ProfileSection({
  onLogout,
  onBusinessDashboard,
}: {
  onLogout?: () => void;
  onBusinessDashboard?: () => void;
}) {
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
          <p className="text-sm text-navy/65">
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
        <p className="mb-3 text-sm text-navy/65">
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
                <span className="text-sm font-semibold text-navy">
                  {area}
                </span>

                <button
                  type="button"
                  aria-label={`${isSaved ? "Saved" : "Save"} ${area}`}
                  onClick={() => toggleArea(area)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isSaved
                      ? "bg-signal text-white"
                      : "border border-navy/20 text-navy/70"
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
      <h1 className="font-display text-2xl font-extrabold text-navy">
        Profile
      </h1>

      <div className="mt-4 flex flex-col items-center">
        <Avatar
          name={CURRENT_USER.name}
          className="h-24 w-24 bg-signal text-2xl"
        />

        <h2 className="mt-3 font-display text-xl font-extrabold text-navy">
          {CURRENT_USER.name}
        </h2>

        <p className="text-sm text-navy/65">{CURRENT_USER.role}</p>
      </div>

      <div className="mt-5 flex rounded-3xl bg-white p-4 shadow-sm">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-display text-xl font-extrabold text-navy">
              {s.value}
            </p>
            <p className="text-xs text-navy/65">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Menu */}
      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setView("reports")}
          className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-navy"
        >
          My reports <span className="text-navy/45">›</span>
        </button>

        <div className="mx-4 border-t border-navy/10" />

        <button
          type="button"
          onClick={() => setView("areas")}
          className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-navy"
        >
          Saved areas <span className="text-navy/45">›</span>
        </button>

        <div className="mx-4 border-t border-navy/10" />

        <button
          type="button"
          onClick={() => onLogout?.()}
          className="w-full px-4 py-4 text-left text-sm font-semibold text-impass"
        >
          Log out
        </button>
      </div>

      {/* Business Tools */}
      <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-extrabold text-navy">
            Business Tools
          </h3>

          <span className="rounded-full bg-[#E8F3EF] px-2.5 py-1 text-[10px] font-bold text-[#247A60]">
            Business
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBusinessDashboard?.()}
          className="flex w-full items-center gap-3 text-left"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E8F3EF] text-[#247A60]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
              <path d="M9 9v.01" />
              <path d="M9 12v.01" />
              <path d="M9 15v.01" />
              <path d="M9 18v.01" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy">
              Business Dashboard
            </p>

            <p className="mt-0.5 text-xs text-navy/65">
              Monitor flood risks and business insights.
            </p>
          </div>

          <span className="text-lg text-navy/45">›</span>
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-navy/60">
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
