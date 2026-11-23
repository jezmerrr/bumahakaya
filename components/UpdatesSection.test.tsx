import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UpdatesSection } from "./UpdatesSection";
import { StoreProvider } from "@/lib/store";

describe("UpdatesSection", () => {
  it("shows posts labeled by platform", () => {
    render(
      <StoreProvider>
        <UpdatesSection />
      </StoreProvider>,
    );
    expect(screen.getAllByText("Facebook").length).toBeGreaterThan(0);
    expect(screen.getAllByText("X").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Reddit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo data").length).toBeGreaterThan(0);
  });
});
