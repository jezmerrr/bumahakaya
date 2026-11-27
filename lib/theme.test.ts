import { beforeEach, describe, expect, it } from "vitest";
import { readThemePref, resolveTheme, setThemePref } from "./theme";
import { THEME_KEY, THEME_SCRIPT } from "./themeScript";

const html = () => document.documentElement;

beforeEach(() => {
  localStorage.clear();
  html().setAttribute("data-theme", "light");
});

describe("theme", () => {
  it("defaults to following the device", () => {
    expect(readThemePref()).toBe("system");
    // jsdom has no dark-mode media query, so "system" resolves to light.
    expect(resolveTheme("system")).toBe("light");
  });

  it("saves a fixed choice and applies it to <html>", () => {
    setThemePref("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(html()).toHaveAttribute("data-theme", "dark");
    expect(readThemePref()).toBe("dark");

    setThemePref("light");
    expect(html()).toHaveAttribute("data-theme", "light");
  });

  it("forgets the fixed choice when switching back to system", () => {
    setThemePref("dark");
    setThemePref("system");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(html()).toHaveAttribute("data-theme", "light");
  });

  it("applies a saved dark choice from the early <head> script", () => {
    localStorage.setItem(THEME_KEY, "dark");
    new Function(THEME_SCRIPT)();
    expect(html()).toHaveAttribute("data-theme", "dark");

    localStorage.setItem(THEME_KEY, "light");
    new Function(THEME_SCRIPT)();
    expect(html()).toHaveAttribute("data-theme", "light");
  });
});
