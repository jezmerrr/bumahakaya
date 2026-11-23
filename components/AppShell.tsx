"use client";

import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { StartScreen } from "./StartScreen";
import { HomeSection } from "./HomeSection";
import { MapSection } from "./MapSection";
import { ReportSection } from "./ReportSection";
import { AlertsSection } from "./AlertsSection";
import { ProfileSection } from "./ProfileSection";
import {
  BellIcon,
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  UserIcon,
} from "./icons";
import type { ComponentType, SVGProps } from "react";

type TabKey = "Home" | "Maps" | "Report" | "Alerts" | "Profile";
type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const NAV: { key: Exclude<TabKey, "Report">; Icon: IconType }[] = [
  { key: "Home", Icon: HomeIcon },
  { key: "Maps", Icon: MapPinIcon },
  { key: "Alerts", Icon: BellIcon },
  { key: "Profile", Icon: UserIcon },
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
        {NAV.slice(0, 2).map(({ key, Icon }) => (
          <NavButton
            key={key}
            label={key}
            Icon={Icon}
            active={tab === key}
            onClick={() => setTab(key)}
          />
        ))}

        <button
          type="button"
          aria-label="Report"
          onClick={() => setTab("Report")}
          className="-mt-8 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-amber text-white shadow-lg"
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        {NAV.slice(2).map(({ key, Icon }) => (
          <NavButton
            key={key}
            label={key}
            Icon={Icon}
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
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: IconType;
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
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
