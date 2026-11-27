import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeHero } from "./HomeHero";
import type { AreaStatus } from "@/lib/mapSummary";
import type { Report } from "@/lib/types";

// The mini map uses Leaflet, which can't run in jsdom.
vi.mock("next/dynamic", async () => {
  const { createElement } = await import("react");
  return { default: () => () => createElement("div", { "data-testid": "mini-map" }) };
});

const CENTER = { lat: 14.5647, lng: 120.9936 };
const report: Report = {
  id: "x",
  lat: CENTER.lat,
  lng: CENTER.lng,
  streetName: "Leon Guinto St",
  headline: "Leon Guinto gutter-deep",
  severity: "Caution",
  waterLevel: "Knee",
  passable: true,
  source: "community",
  timestamp: new Date().toISOString(),
};

function renderHero(status: AreaStatus, onShow = vi.fn()) {
  render(
    <HomeHero
      status={status}
      summary={null}
      markers={[]}
      center={CENTER}
      updatedAt={null}
      onShow={onShow}
    />,
  );
  return { hero: screen.getByRole("region", { name: /flood status/i }), onShow };
}

describe("HomeHero", () => {
  it("says all clear, with no number and nothing to avoid, when nothing is flooded", () => {
    const { hero } = renderHero({ severity: "Passable", count: 0, reports: 0, sensors: 0, worst: null });
    expect(within(hero).getByRole("heading", { name: "All clear near you" })).toBeInTheDocument();
    expect(within(hero).queryByText("Iwasan muna")).toBeNull();
    expect(within(hero).queryByRole("button", { name: /see all/i })).toBeNull();
    expect(within(hero).getByText(/Madadaanan ang mga daan/)).toBeInTheDocument();
    expect(within(hero).queryByText(/^Updated/)).toBeNull();
  });

  it("uses singular words and filters by the worst condition", async () => {
    const user = userEvent.setup();
    const { hero, onShow } = renderHero({
      severity: "Caution",
      count: 1,
      reports: 1,
      sensors: 0,
      worst: { report, distanceM: 375 },
    });
    expect(within(hero).getByRole("heading", { name: "1 road needs caution" })).toBeInTheDocument();
    expect(within(hero).getByText("Near you · 1 report · 0 sensors")).toBeInTheDocument();
    expect(within(hero).getByText("Leon Guinto gutter-deep")).toBeInTheDocument();
    expect(within(hero).getByText("Knee-deep · 375 m away")).toBeInTheDocument();

    await user.click(within(hero).getByRole("button", { name: "See all gutter-deep reports" }));
    expect(onShow).toHaveBeenCalledWith("Caution");
  });
});
