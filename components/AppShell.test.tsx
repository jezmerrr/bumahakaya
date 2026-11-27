import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./AppShell";
import { StoreProvider } from "@/lib/store";

// Maps (and Home's mini map) use Leaflet, which can't run in jsdom.
vi.mock("next/dynamic", async () => {
  const { createElement } = await import("react");
  return {
    default: () =>
      function MapStub() {
        return createElement("div", { "data-testid": "map-stub" });
      },
  };
});

async function enterApp() {
  const user = userEvent.setup();
  render(
    <StoreProvider>
      <AppShell />
    </StoreProvider>,
  );
  await user.click(screen.getByRole("button", { name: /continue as guest/i }));
  return user;
}

describe("AppShell", () => {
  it("shows the Start screen first, then the app after tapping start", async () => {
    await enterApp();
    for (const name of ["Home", "Maps", "Alerts", "Profile"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("opens the Report form from the center button", async () => {
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByText(/Report flooding/i)).toBeInTheDocument();
  });

  it("switches to the Alerts section", async () => {
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Alerts" }));
    expect(
      screen.getByText(/Flood warnings near you/i),
    ).toBeInTheDocument();
  });

  it("shows the supplementary-source disclaimer", async () => {
    await enterApp();
    expect(screen.getByText(/does not replace/i)).toHaveTextContent(/PAGASA/);
  });

  it("opens the Maps tab from the map preview on Home", async () => {
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Open flood map" }));
    expect(screen.getByRole("heading", { name: "Flood map" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Maps" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
