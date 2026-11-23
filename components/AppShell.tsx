"use client";

import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { StartScreen } from "./StartScreen";
import { HomeSection } from "./HomeSection";
import { MapSection } from "./MapSection";
import { ReportSection } from "./ReportSection";
import { AlertsSection } from "./AlertsSection";
import { ProfileSection } from "./ProfileSection";

type TabKey = "Home" | "Maps" | "Report" | "Alerts" | "Profile";

const NAV: { key: Exclude<TabKey, "Report">; icon: string }[] = [
  { key: "Home", icon: "🏠" },
  { key: "Maps", icon: "📍" },
  { key: "Alerts", icon: "🔔" },
  { key: "Profile", icon: "👤" },
];

export function AppShell() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<TabKey>("Home");

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />;
  }

  const darkHeader = tab === "Home" || tab === "Maps";

  const sections: Record<TabKey, ReactNode> = {
    Home: <HomeSection />,
    Maps: <MapSection />,
    Report: <ReportSection onPosted={() => setTab("Home")} />,
    Alerts: <AlertsSection />,
    Profile: <ProfileSection />,
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-mist">
      <header
        className={`px-4 py-3 ${darkHeader ? "bg-navy" : "bg-mist"}`}
      >
        <Logo variant={darkHeader ? "dark" : "light"} />
      </header>

      <p className="bg-amber/10 px-4 py-1.5 text-[11px] leading-snug text-navy/70">
        Demo. BumahaKaya? is a supplementary source and does not replace
        official PAGASA or LGU advisories.
      </p>

      <main className="flex-1 pb-24">{sections[tab]}</main>

      <nav className="fixed inset-x-0 bottom-0 z-[1000] mx-auto flex w-full max-w-md items-center justify-between border-t border-navy/10 bg-white px-5 py-2">
        {NAV.slice(0, 2).map(({ key, icon }) => (
          <NavButton
            key={key}
            label={key}
            icon={icon}
            active={tab === key}
            onClick={() => setTab(key)}
          />
        ))}

        <button
          type="button"
          aria-label="Report"
          onClick={() => setTab("Report")}
          className="-mt-8 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-amber text-2xl font-bold text-white shadow-lg"
        >
          <span aria-hidden>＋</span>
        </button>

        {NAV.slice(2).map(({ key, icon }) => (
          <NavButton
            key={key}
            label={key}
            icon={icon}
            active={tab === key}
            onClick={() => setTab(key)}
          />
        ))}
      </nav>
    </div>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
        active ? "text-signal" : "text-navy/50"
      }`}
    >
      <span aria-hidden className="text-base leading-none">
        {icon}
      </span>
      {label}
    </button>
  );
}
