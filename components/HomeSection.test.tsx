
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
  it("shows all posts by default", () => {
    renderHome();
    expect(screen.getAllByTestId("report-card").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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

  it("deletes your own report only after confirming", async () => {
    const user = userEvent.setup();
    renderHome();
    // Seed report r-002 is authored by the current user, so only it is deletable.
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete report/i,
    });
    expect(deleteButtons).toHaveLength(1);

    // Cancel keeps it.
    await user.click(deleteButtons[0]);
    const dialog = screen.getByRole("alertdialog", {
      name: /delete this report/i,
    });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(
      screen.getByText(/Road near Henry still passable/i),
    ).toBeInTheDocument();

    // Delete removes it.
    await user.click(screen.getByRole("button", { name: /delete report/i }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    expect(
      screen.queryByText(/Road near Henry still passable/i),
    ).toBeNull();
  });

  it("searches reports and posts by street or keyword", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.type(
      screen.getByRole("searchbox", { name: /search reports and posts/i }),
      "castro",
    );
    const cards = screen.getAllByTestId("report-card");
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText("Castro St clear")).toBeInTheDocument();
    expect(screen.queryByTestId("social-card")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("1 result");

    await user.click(screen.getByRole("button", { name: /clear search/i }));
    expect(screen.getAllByTestId("report-card").length).toBeGreaterThan(1);
  });

  it("filters by road condition and hides social posts while on", async () => {
    const user = userEvent.setup();
    renderHome();
    const notPassable = screen.getByRole("button", { name: "Not passable" });
    await user.click(notPassable);
    expect(notPassable).toHaveAttribute("aria-pressed", "true");

    const cards = screen.getAllByTestId("report-card");
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(within(card).getByText("Not passable")).toBeInTheDocument();
    }
    expect(screen.queryByTestId("social-card")).toBeNull();

    // Tapping again turns it off.
    await user.click(notPassable);
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
  });

  it("hides the condition filter for Social and resets it", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "Passable" }));
    await user.click(screen.getByRole("button", { name: "Social" }));
    expect(
      screen.queryByRole("group", { name: /road condition/i }),
    ).toBeNull();
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByRole("button", { name: "Passable" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows an empty state that clears the filters", async () => {
    const user = userEvent.setup();
    renderHome();
    const search = screen.getByRole("searchbox");
    await user.type(search, "zzzz");
    expect(screen.queryByTestId("report-card")).toBeNull();
    expect(screen.getByText(/walang tugma/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(search).toHaveValue("");
    expect(screen.getAllByTestId("report-card").length).toBeGreaterThan(0);
  });

  it("opens a report's full details and closes with Back", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(
      screen.getByRole("button", { name: "Flooding Taft Ave cor. Estrada" }),
    );
    const dialog = screen.getByRole("dialog", { name: /report details/i });
    expect(within(dialog).getByText("Knee-deep")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Hindi madaanan / Not passable"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/from DLSU/)).toBeInTheDocument();
    // The full comment thread is open on the details page.
    expect(
      within(dialog).getByText(/Confirmed, nasa Estrada/i),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Back" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("increments a report's Confirm count when tapped", async () => {
    const user = userEvent.setup();
    renderHome();
    const card = screen.getAllByTestId("report-card")[0];
    const confirm = within(card).getByRole("button", { name: /confirm/i });
    await user.click(confirm);
    expect(
      within(card).getByRole("button", { name: /confirm \(\s*13\s*\)/i }),
    ).toBeInTheDocument();
  });
});
