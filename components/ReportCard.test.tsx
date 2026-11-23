import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportCard } from "./ReportCard";
import { StoreProvider } from "@/lib/store";
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
});
