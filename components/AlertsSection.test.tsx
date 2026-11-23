import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertsSection } from "./AlertsSection";
import { StoreProvider } from "@/lib/store";

describe("AlertsSection", () => {
  it("lists flood warnings with a demo-data label", () => {
    render(
      <StoreProvider>
        <AlertsSection />
      </StoreProvider>,
    );
    expect(screen.getByText("Flooding on Taft Ave")).toBeInTheDocument();
    expect(screen.getByText("Class suspension")).toBeInTheDocument();
    expect(screen.getAllByText("Demo data").length).toBeGreaterThan(0);
  });
});
