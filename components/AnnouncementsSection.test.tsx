import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnouncementsSection } from "./AnnouncementsSection";
import { StoreProvider } from "@/lib/store";

describe("AnnouncementsSection", () => {
  it("shows each announcement's issuing agency and a demo-data badge", () => {
    render(
      <StoreProvider>
        <AnnouncementsSection />
      </StoreProvider>,
    );
    for (const agency of ["Manila City Government", "Manila CDRRMO", "PAGASA"]) {
      expect(screen.getByText(agency)).toBeInTheDocument();
    }
    expect(screen.getAllByText("Demo data").length).toBeGreaterThanOrEqual(3);
  });
});
