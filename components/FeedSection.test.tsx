import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedSection } from "./FeedSection";
import { StoreProvider } from "@/lib/store";

function renderFeed() {
  render(
    <StoreProvider>
      <FeedSection />
    </StoreProvider>,
  );
}

describe("FeedSection", () => {
  it("lists community reports and sensors newest-first", () => {
    renderFeed();
    const cards = screen.getAllByTestId("report-card");
    expect(cards.length).toBeGreaterThanOrEqual(14);
    // Newest item is FloodWatch Sensor 01 (3 minutes ago).
    expect(cards[0]).toHaveTextContent(/Sensor 01/);
  });

  it("marks sensor readings as demo data", () => {
    renderFeed();
    expect(screen.getAllByText("Demo data").length).toBeGreaterThan(0);
  });
});
