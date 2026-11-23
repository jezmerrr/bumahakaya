import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NearbyBanner } from "./NearbyBanner";
import type { Report } from "@/lib/types";

const impassable: Report = {
  id: "x",
  lat: 14.5666,
  lng: 120.9948,
  streetName: "Agno St",
  severity: "Impassable",
  waterLevel: "Waist+",
  passable: false,
  source: "community",
  timestamp: new Date().toISOString(),
};

describe("NearbyBanner", () => {
  it("renders nothing when the user location is unknown", () => {
    const { container } = render(
      <NearbyBanner userLocation={null} reports={[impassable]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("warns when reports are near the user location", () => {
    render(
      <NearbyBanner
        userLocation={{ lat: 14.5666, lng: 120.9948 }}
        reports={[impassable]}
      />,
    );
    expect(screen.getByText(/near you/i)).toBeInTheDocument();
  });
});
