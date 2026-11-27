"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./themeScript";

// "system" follows the phone/computer setting; the others are a fixed choice.
export type ThemePref = "light" | "dark" | "system";
export type Theme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set<() => void>();

export function readThemePref(): ThemePref {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function systemIsDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.(DARK_QUERY).matches === true
  );
}

export function resolveTheme(pref: ThemePref): Theme {
  if (pref === "system") return systemIsDark() ? "dark" : "light";
  return pref;
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function apply(pref: ThemePref) {
  document.documentElement.setAttribute("data-theme", resolveTheme(pref));
}

export function setThemePref(pref: ThemePref) {
  try {
    if (pref === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, pref);
  } catch {
    // storage unavailable: the choice still applies for this visit
  }
  apply(pref);
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // While on "system", follow the device if it switches (e.g. at sunset).
  const media = window.matchMedia?.(DARK_QUERY);
  const onSystemChange = () => {
    if (readThemePref() === "system") apply("system");
    onChange();
  };
  media?.addEventListener?.("change", onSystemChange);
  return () => {
    listeners.delete(onChange);
    media?.removeEventListener?.("change", onSystemChange);
  };
}

export function useTheme(): {
  pref: ThemePref;
  theme: Theme;
  setPref: (pref: ThemePref) => void;
} {
  const pref = useSyncExternalStore(subscribe, readThemePref, () => "system" as const);
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as const);
  return { pref, theme, setPref: setThemePref };
}
