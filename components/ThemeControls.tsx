"use client";

import { useTheme, type ThemePref } from "@/lib/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

// Sun/moon button in the header: flips between light and dark.
export function ThemeToggle() {
  const { theme, setPref } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? SunIcon : MoonIcon;
  return (
    <button
      type="button"
      onClick={() => setPref(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

const OPTIONS: [ThemePref, string, typeof SunIcon][] = [
  ["light", "Light", SunIcon],
  ["dark", "Dark", MoonIcon],
  ["system", "System", MonitorIcon],
];

// Full choice in Profile, including "System" (follow the phone's setting).
export function AppearancePicker() {
  const { pref, setPref } = useTheme();
  return (
    <div
      role="group"
      aria-label="Appearance"
      className="grid grid-cols-3 gap-1 rounded-full bg-ink/5 p-1"
    >
      {OPTIONS.map(([key, label, Icon]) => {
        const active = pref === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setPref(key)}
            aria-pressed={active}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold ${
              active ? "bg-surface text-ink shadow-sm" : "text-ink/65"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
