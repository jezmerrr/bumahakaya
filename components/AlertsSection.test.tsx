import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertsSection } from "./AlertsSection";
import { StoreProvider } from "@/lib/store";

function renderAlerts(onOpenMap = vi.fn()) {
  render(
    <StoreProvider>
      <AlertsSection onOpenMap={onOpenMap} />
    </StoreProvider>,
  );
  return onOpenMap;
}

const titles = () =>
  screen.getAllByTestId("alert-card").map(
    (c) => within(c).getByRole("button", { expanded: false }).textContent ?? "",
  );

describe("AlertsSection", () => {
  it("lists flood warnings with a demo-data label", () => {
    renderAlerts();
    expect(screen.getByText("Flooding on Taft Ave")).toBeInTheDocument();
    expect(screen.getByText("Class suspension")).toBeInTheDocument();
    expect(screen.getAllByText("Demo data").length).toBeGreaterThan(0);
  });

  it("groups alerts by time and marks the newest", () => {
    renderAlerts();
    const lastHour = screen.getByRole("region", { name: /last hour/i });
    const earlier = screen.getByRole("region", { name: /earlier today/i });
    // Seed: 5m and 22m ago vs 1h and 2h ago.
    expect(within(lastHour).getAllByTestId("alert-card")).toHaveLength(2);
    expect(within(earlier).getAllByTestId("alert-card")).toHaveLength(2);
    expect(within(lastHour).getAllByText("New")).toHaveLength(2);
    expect(within(earlier).queryByText("New")).toBeNull();
    // Newest first.
    expect(titles()[0]).toContain("Flooding on Taft Ave");
  });

  it("labels each alert official or sensor", () => {
    renderAlerts();
    expect(screen.getAllByText("Official")).toHaveLength(3);
    expect(screen.getAllByText("Sensor")).toHaveLength(1);
  });

  it("filters by category with counts", async () => {
    const user = userEvent.setup();
    renderAlerts();
    const chips = screen.getByRole("group", { name: "Filter alerts" });
    expect(within(chips).getByRole("button", { name: "All 4" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(chips).getByRole("button", { name: "Classes 2" }));
    const shown = titles().join(" | ");
    expect(shown).toContain("Class suspension");
    expect(shown).toContain("Shift to online");
    expect(shown).not.toContain("Flooding on Taft Ave");

    await user.click(within(chips).getByRole("button", { name: "Roads 1" }));
    expect(screen.getAllByTestId("alert-card")).toHaveLength(1);
  });

  it("expands an alert and links road alerts to the map", async () => {
    const user = userEvent.setup();
    const onOpenMap = renderAlerts();
    const card = screen.getAllByTestId("alert-card")[0];
    // The card's button is named by the alert title alone.
    const toggle = within(card).getByRole("button", { name: "Flooding on Taft Ave" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAccessibleDescription(/5m ago.*knee-deep water/i);
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(within(card).getByRole("button", { name: /see on map/i }));
    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });

  it("shows flooding near you from reports and sensors", async () => {
    const user = userEvent.setup();
    const onOpenMap = renderAlerts();
    const banner = screen.getByRole("region", { name: "Flooding near you" });
    expect(within(banner).getByText("4 roads not passable within 700 m")).toBeInTheDocument();
    await user.click(within(banner).getByRole("button", { name: /see on map/i }));
    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });
});
