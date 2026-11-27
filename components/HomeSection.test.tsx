
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { HomeSection } from "./HomeSection";
import { StoreProvider } from "@/lib/store";

// The status card's mini map uses Leaflet, which can't run in jsdom.
vi.mock("next/dynamic", async () => {
  const { createElement } = await import("react");
  return {
    default: () =>
      function MiniMapStub() {
        return createElement("div", { "data-testid": "mini-map" });
      },
  };
});

function renderHome(onOpenMap = vi.fn()) {
  render(
    <StoreProvider>
      <HomeSection onOpenMap={onOpenMap} />
    </StoreProvider>,
  );
  return onOpenMap;
}

type User = ReturnType<typeof userEvent.setup>;

// Open the Filters panel, run `pick`, then close it with "Show N posts".
async function withFilters(user: User, pick: (panel: HTMLElement) => Promise<void>) {
  await user.click(screen.getByRole("button", { name: /^filters/i }));
  const panel = screen.getByRole("dialog", { name: "Filters" });
  await pick(panel);
  await user.click(within(panel).getByRole("button", { name: /^show \d+ posts?$/i }));
  expect(screen.queryByRole("dialog", { name: "Filters" })).toBeNull();
}

// Each test starts from the sample data, not what an earlier test saved.
beforeEach(() => {
  localStorage.clear();
});

describe("HomeSection", () => {
  it("shows all posts by default", async () => {
    const user = userEvent.setup();
    renderHome();
    expect(screen.getAllByTestId("report-card").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();
    await withFilters(user, async (panel) => {
      expect(within(panel).getByRole("button", { name: "All" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });

  it("switches to social posts, then both with All", async () => {
    const user = userEvent.setup();
    renderHome();

    await withFilters(user, (panel) =>
      user.click(within(panel).getByRole("button", { name: "Social" })),
    );
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("report-card")).toBeNull();
    expect(screen.getByRole("button", { name: "Filters (1 on)" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove filter: Social" }));
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
    await withFilters(user, async (panel) => {
      const notPassable = within(panel).getByRole("button", { name: "Not passable" });
      await user.click(notPassable);
      expect(notPassable).toHaveAttribute("aria-pressed", "true");
    });

    const cards = screen.getAllByTestId("report-card");
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(within(card).getByText("Not passable")).toBeInTheDocument();
    }
    expect(screen.queryByTestId("social-card")).toBeNull();

    // Removing the chip turns it off.
    await user.click(screen.getByRole("button", { name: "Remove filter: Not passable" }));
    expect(screen.getAllByTestId("social-card").length).toBeGreaterThan(0);
  });

  it("hides the condition filter for Social and resets it", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: /^filters/i }));
    const panel = screen.getByRole("dialog", { name: "Filters" });
    await user.click(within(panel).getByRole("button", { name: "Passable" }));
    await user.click(within(panel).getByRole("button", { name: "Social" }));
    expect(within(panel).queryByRole("group", { name: /road condition/i })).toBeNull();

    await user.click(within(panel).getByRole("button", { name: "All" }));
    expect(within(panel).getByRole("button", { name: "Passable" })).toHaveAttribute(
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
    // The flood illustration matches the report: knee-deep, not passable.
    expect(
      within(dialog).getByRole("img", { name: /knee-deep floodwater/i }),
    ).toBeInTheDocument();
    expect(within(dialog).getByTestId("flood-scene")).toHaveAttribute(
      "data-severity",
      "Impassable",
    );
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

  it("leads with a status card for the area", async () => {
    const user = userEvent.setup();
    const onOpenMap = renderHome();
    const hero = screen.getByRole("region", { name: /flood status near you/i });
    expect(hero).toHaveAttribute("data-status", "Impassable");

    // 1. Greeting + freshness
    expect(within(hero).getByText(/^Magandang (umaga|hapon|gabi), Juan$/)).toBeInTheDocument();
    expect(within(hero).getByText(/^Updated (just now|\d+[mhd] ago)$/)).toBeInTheDocument();
    // 2. Headline: 4 reports/sensors marked not passable within 700 m
    expect(
      within(hero).getByRole("heading", { name: "4 roads not passable" }),
    ).toBeInTheDocument();
    expect(within(hero).getByText("Near you · 2 reports · 2 sensors")).toBeInTheDocument();
    // 3. The one to avoid
    expect(within(hero).getByText("Iwasan muna")).toBeInTheDocument();
    expect(within(hero).getByText("Dagonoy side hindi madaanan")).toBeInTheDocument();
    expect(within(hero).getByText(/^Waist-deep · \d+ m away$/)).toBeInTheDocument();
    // 5. Stats
    for (const label of ["Reports nearby", "Deepest", "Closest"]) {
      expect(within(hero).getByText(label)).toBeInTheDocument();
    }

    await user.click(within(hero).getByRole("button", { name: "Open flood map" }));
    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });

  it("shows the worst reports straight from the status card", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "See all not passable reports" }));
    expect(screen.getByRole("button", { name: "Remove filter: Not passable" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("2 results · community reports only");
    for (const card of screen.getAllByTestId("report-card")) {
      expect(within(card).getByText("Not passable")).toBeInTheDocument();
    }
  });

  it("puts social posts in their own sideways row", async () => {
    const user = userEvent.setup();
    renderHome();
    const row = screen.getByRole("region", { name: "From social media" });
    expect(within(row).getAllByTestId("social-card")).toHaveLength(5);
    // Every social card on the page is inside the row.
    expect(screen.getAllByTestId("social-card")).toHaveLength(5);

    // Showing only social posts lists them full width instead.
    await withFilters(user, (panel) =>
      user.click(within(panel).getByRole("button", { name: "Social" })),
    );
    expect(screen.queryByRole("region", { name: "From social media" })).toBeNull();
    expect(screen.getAllByTestId("social-card")).toHaveLength(5);
  });

  it("leaves disputed reports out of the status card but keeps them in the feed", () => {
    renderHome();
    const hero = screen.getByRole("region", { name: /flood status near you/i });
    // 8 reports + 4 sensors nearby, minus the disputed "Castro St clear".
    expect(within(hero).getByText("Reports nearby").nextSibling).toHaveTextContent("11");
    const castro = screen
      .getAllByTestId("report-card")
      .find((c) => within(c).queryByText("Castro St clear"));
    expect(castro).toBeDefined();
    expect(within(castro!).getByRole("note")).toHaveTextContent(/disputed/i);
  });
});
