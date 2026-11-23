"use client";

import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { MapSection } from "./MapSection";
import { FeedSection } from "./FeedSection";
import { ReportSection } from "./ReportSection";

type TabKey = "Map" | "Feed" | "Report" | "Announcements" | "Updates";

const TABS: { key: TabKey; icon: string }[] = [
  { key: "Map", icon: "📍" },
  { key: "Feed", icon: "📰" },
  { key: "Report", icon: "➕" },
  { key: "Announcements", icon: "📢" },
  { key: "Updates", icon: "💬" },
];

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6 text-navy/60">
      <h2 className="font-display text-lg font-extrabold text-navy">{title}</h2>
      <p className="mt-1 text-sm">Coming up.</p>
    </div>
  );
}

export function AppShell() {
  const [tab, setTab] = useState<TabKey>("Map");

  const sections: Record<TabKey, ReactNode> = {
    Map: <MapSection />,
    Feed: <FeedSection />,
    Report: <ReportSection />,
    Announcements: <Placeholder title="Official announcements" />,
    Updates: <Placeholder title="From social media" />,
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-mist">
      <header className="sticky top-0 z-[1000] border-b border-navy/10 bg-white/90 px-4 py-3 backdrop-blur">
        <Logo />
        <p className="mt-1 font-display text-sm font-extrabold text-navy">
          Alamin bago lumusong.
        </p>
        <p className="text-xs text-navy/60">
          Every flood update that matters, in one place.
        </p>
      </header>

      <p className="bg-amber/10 px-4 py-2 text-[11px] font-medium leading-snug text-navy/70">
        Heads up: this is a demo. BumahaKaya? is a supplementary source and does
        not replace official PAGASA or LGU advisories. Sensor, announcement, and
        social-media items shown here are demo data.
      </p>

      <main className="flex-1 pb-20">{sections[tab]}</main>

      <nav className="fixed inset-x-0 bottom-0 z-[1000] mx-auto flex w-full max-w-md justify-between border-t border-navy/10 bg-white px-2 py-1.5">
        {TABS.map(({ key, icon }) => {
          const active = key === tab;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-pressed={active}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold ${
                active ? "text-signal" : "text-navy/50"
              }`}
            >
              <span aria-hidden className="text-base leading-none">
                {icon}
              </span>
              {key}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
