import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeSection } from "./HomeSection";
import { StoreProvider } from "@/lib/store";

function renderHome() {
  render(
    <StoreProvider>
      <HomeSection />
    </StoreProvider>,
  );
}

describe("HomeSection", () => {
  it("shows community reports by default", () => {
    renderHome();
    expect(screen.getAllByTestId("report-card").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("social-card")).toBeNull();
  });

  it("switches to social posts, then both with All", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("button", { name: "Social" }));
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("report-card")).toBeNull();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByTestId("report-card").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
  });

  it("lets you remove your own report from the feed", async () => {
    const user = userEvent.setup();
    renderHome();
    // Seed report r-002 is authored by the current user and is removable.
    expect(
      screen.getByText(/Road near Henry still passable/i),
    ).toBeInTheDocument();
    const removeButtons = screen.getAllByRole("button", {
      name: /remove report/i,
    });
    expect(removeButtons).toHaveLength(1);
    await user.click(removeButtons[0]);
    expect(
      screen.queryByText(/Road near Henry still passable/i),
    ).toBeNull();
  });

  it("increments a report's Confirm count when tapped", async () => {
    const user = userEvent.setup();
    renderHome();
    const card = screen.getAllByTestId("report-card")[0];
    const confirm = within(card).getByRole("button", { name: /confirm/i });
    await user.click(confirm);
    expect(
      within(card).getByRole("button", { name: /confirm \(13\)/i }),
    ).toBeInTheDocument();
  });
});
