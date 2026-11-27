import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportCard } from "./ReportCard";
import { StoreProvider, useStore } from "@/lib/store";
import { seedReports } from "@/data/seed";

const r1 = seedReports.find((r) => r.id === "r-001")!;

function renderCard() {
  render(
    <StoreProvider>
      <ReportCard report={r1} />
    </StoreProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ReportCard comments", () => {
  it("hides the thread until Comments is tapped", () => {
    renderCard();
    expect(
      screen.getByRole("button", { name: /comments \(3\)/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Confirmed, nasa Estrada/i)).toBeNull();
  });

  it("opens the thread and posts a new comment", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: /comments/i }));
    expect(screen.getByText(/Confirmed, nasa Estrada/i)).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/add a comment/i),
      "test comment",
    );
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(screen.getByText("test comment")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /comments \(4\)/i }),
    ).toBeInTheDocument();
  });

  it("deletes your own comment after confirming", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: /comments/i }));
    await user.type(screen.getByPlaceholderText(/add a comment/i), "mine");
    await user.click(screen.getByRole("button", { name: "Post" }));
    expect(screen.getByText("mine")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete comment/i }));
    await user.click(
      within(
        screen.getByRole("alertdialog", { name: /delete this comment/i }),
      ).getByRole("button", { name: "Delete" }),
    );
    expect(screen.queryByText("mine")).toBeNull();
  });
});

// Renders the live store copy so edits show up, like the real feed does.
function LiveCard({ id }: { id: string }) {
  const { reports } = useStore();
  const report = reports.find((r) => r.id === id);
  return report ? <ReportCard report={report} /> : null;
}

describe("ReportCard ownership", () => {
  it("shows edit and delete icons only on your own reports", () => {
    renderCard(); // r-001 belongs to someone else
    expect(screen.queryByRole("button", { name: /edit report/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /delete report/i })).toBeNull();
  });

  it("edits your report with the pre-filled report form", async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <LiveCard id="r-002" />
      </StoreProvider>,
    );
    await user.click(screen.getByRole("button", { name: /edit report/i }));
    const sheet = screen.getByRole("dialog", { name: /edit report/i });
    expect(within(sheet).getByLabelText(/location/i)).toHaveValue(
      "Taft Avenue, Malate",
    );
    const description = within(sheet).getByLabelText(/description/i);
    expect(description).toHaveValue(
      "Gutter-deep water, motorbikes passing slowly.",
    );

    await user.clear(description);
    await user.type(description, "Tubig hanggang tuhod na.");
    await user.click(within(sheet).getByRole("button", { name: "Not passable" }));
    await user.click(
      within(sheet).getByRole("button", { name: /save changes/i }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    const card = screen.getByTestId("report-card");
    expect(within(card).getByText("Tubig hanggang tuhod na.")).toBeInTheDocument();
    expect(within(card).getByText("Not passable")).toBeInTheDocument();
    expect(within(card).getByText(/edited/i)).toBeInTheDocument();
    // Custom headlines are kept when editing.
    expect(
      within(card).getByText("Road near Henry still passable"),
    ).toBeInTheDocument();
  });

  it("cancelling an edit changes nothing", async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <LiveCard id="r-002" />
      </StoreProvider>,
    );
    await user.click(screen.getByRole("button", { name: /edit report/i }));
    const sheet = screen.getByRole("dialog", { name: /edit report/i });
    await user.type(within(sheet).getByLabelText(/description/i), " extra");
    await user.click(within(sheet).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText(/extra/)).toBeNull();
    expect(screen.queryByText(/edited/i)).toBeNull();
  });

  it("edits and deletes from the details page", async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <LiveCard id="r-002" />
      </StoreProvider>,
    );
    await user.click(
      screen.getByRole("button", { name: "Road near Henry still passable" }),
    );
    const details = screen.getByRole("dialog", { name: /report details/i });

    // Edit on top of details, then land back on the updated details.
    await user.click(within(details).getByRole("button", { name: /edit report/i }));
    const sheet = screen.getByRole("dialog", { name: /edit report/i });
    await user.click(within(sheet).getByRole("button", { name: "Waist-deep" }));
    await user.click(within(sheet).getByRole("button", { name: /save changes/i }));
    expect(within(details).getByText("Waist-deep")).toBeInTheDocument();

    await user.click(
      within(details).getByRole("button", { name: /delete report/i }),
    );
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("report-card")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
