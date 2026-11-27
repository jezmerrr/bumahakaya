"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { NavContext, type AppNav } from "@/lib/nav";
import { Logo } from "./Logo";
import { StartScreen } from "./StartScreen";
import { HomeSection } from "./HomeSection";
import { MapSection } from "./MapSection";
import { ReportSection } from "./ReportSection";
import { AlertsSection } from "./AlertsSection";
import { ProfileSection } from "./ProfileSection";
import { BusinessDashboard } from "./BusinessDashboard";
import { ThemeToggle } from "./ThemeControls";
import {
  BellIcon,
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  UserIcon,
} from "./icons";
import type { ComponentType, SVGProps } from "react";

type TabKey = "Home" | "Maps" | "Report" | "Alerts" | "Profile" | "Business";
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
  // Report/sensor to select when the Maps tab opens ("Show on map").
  const [mapFocus, setMapFocus] = useState<string | null>(null);
  const nav = useMemo<AppNav>(
    () => ({
      showOnMap: (reportId) => {
        setMapFocus(reportId);
        setTab("Maps");
      },
    }),
    [],
  );

  // Switching tabs normally opens Maps without a preselected report.
  function go(next: TabKey) {
    setMapFocus(null);
    setTab(next);
  }

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />;
  }

  const fullScreen = tab === "Maps";

  const sections: Record<TabKey, ReactNode> = {
    Home: <HomeSection onOpenMap={() => go("Maps")} />,
    // Keyed so a new "Show on map" request opens a fresh, focused map.
    Maps: <MapSection key={mapFocus ?? "map"} focusId={mapFocus} />,
    Report: <ReportSection onPosted={() => go("Home")} />,
    Alerts: <AlertsSection onOpenMap={() => go("Maps")} />,
    Profile: (
      <ProfileSection
        onLogout={() => {
          go("Home");
          setStarted(false);
        }}
        onBusinessDashboard={() => go("Business")}
      />
    ),
    Business: <BusinessDashboard onBack={() => go("Profile")} />,
  };

  return (
    <NavContext.Provider value={nav}>
      <div
        className={`mx-auto flex w-full max-w-md flex-col bg-mist ${
          // The map fills the screen below the header, behind the bottom nav.
          fullScreen ? "h-dvh overflow-hidden" : "min-h-full"
        }`}
      >
        <header className="flex items-center justify-between bg-navy px-4 py-2">
          <Logo variant="dark" />
          <ThemeToggle />
        </header>

        <DemoNotice />

        <main className={fullScreen ? "relative min-h-0 flex-1" : "flex-1 pb-24"}>
          {sections[tab]}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-[1000] mx-auto flex w-full max-w-md items-center justify-between border-t border-ink/10 bg-surface px-5 py-2">
          {NAV.slice(0, 2).map(({ key, Icon }) => (
            <NavButton
              key={key}
              label={key}
              Icon={Icon}
              active={tab === key}
              onClick={() => go(key)}
            />
          ))}

          <button
            type="button"
            aria-label="Report"
            onClick={() => go("Report")}
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
              onClick={() => go(key)}
            />
          ))}
        </nav>
      </div>
    </NavContext.Provider>
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
        active ? "text-signal" : "text-ink/65"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

// Required demo notice (see the MVP spec): one line by default so it doesn't
// crowd every screen; "More" shows the full wording.
function DemoNotice() {
  const [open, setOpen] = useState(false);
  const fullId = useId();
  return (
    <div className="border-b border-amber/30 bg-notice px-4 py-1.5 text-[11px] leading-snug text-ink/70">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate">
          <strong className="font-semibold text-ink/85">Demo</strong> · Not an
          official advisory. Follow PAGASA and LGU.
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={fullId}
          className="shrink-0 font-semibold text-ink/85 underline-offset-2 hover:underline"
        >
          {open ? "Less" : "More"}
        </button>
      </div>
      <p id={fullId} hidden={!open} className="mt-1">
        Heads up, this is a demo. Always follow official PAGASA and LGU
        advisories. BumahaKaya? helps you check your street, it does not replace
        them.
      </p>
    </div>
  );
}
