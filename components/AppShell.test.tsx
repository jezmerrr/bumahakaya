import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
      screen.getByText(/Official advisories for DLSU and nearby streets/i),
    ).toBeInTheDocument();
  });

  it("shows a one-line demo notice that expands to the full disclaimer", async () => {
    const user = await enterApp();
    expect(screen.getByText(/not an official advisory/i)).toHaveTextContent(/PAGASA/);
    const more = screen.getByRole("button", { name: "More" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/does not replace/i)).not.toBeVisible();

    await user.click(more);
    expect(screen.getByRole("button", { name: "Less" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/does not replace/i)).toBeVisible();
  });

  it("shows a post on the map from its details page", async () => {
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Flooding Taft Ave cor. Estrada" }));
    const details = screen.getByRole("dialog", { name: /report details/i });
    await user.click(within(details).getByRole("button", { name: /show on map/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Maps" })).toHaveAttribute("aria-pressed", "true");
    const preview = screen.getByRole("region", { name: /selected report/i });
    expect(within(preview).getByText("Flooding Taft Ave cor. Estrada")).toBeInTheDocument();
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

  it("switches between light and dark from the header", async () => {
    localStorage.clear();
    document.documentElement.setAttribute("data-theme", "light");
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    localStorage.clear();
  });
});
