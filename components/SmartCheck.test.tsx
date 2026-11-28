import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportCard } from "./ReportCard";
import { StoreProvider } from "@/lib/store";
import { seedReports } from "@/data/seed";

const seed = (id: string) => seedReports.find((r) => r.id === id)!;

function renderCard(id: string) {
  render(
    <StoreProvider>
      <ReportCard report={seed(id)} />
    </StoreProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("Smart check chip on feed cards", () => {
  it("says likely accurate when the sensor and people agree", () => {
    renderCard("r-001");
    expect(screen.getByTestId("smart-check-chip")).toHaveTextContent(
      "Smart check: Likely accurate",
    );
  });

  it("says check first when the sensor disagrees", () => {
    renderCard("r-002");
    expect(screen.getByTestId("smart-check-chip")).toHaveTextContent("Check first");
  });

  it("is left off disputed posts, which already show a warning", () => {
    renderCard("r-007");
    expect(screen.queryByTestId("smart-check-chip")).toBeNull();
  });
});

describe("Smart check on the details page", () => {
  it("explains the verdict, check by check", async () => {
    const user = userEvent.setup();
    renderCard("r-002");
    await user.click(
      screen.getByRole("button", { name: "Road near Henry still passable" }),
    );
    const panel = within(screen.getByRole("region", { name: "Smart check" }));
    expect(panel.getByText("AI preview")).toBeInTheDocument();
    expect(panel.getByText("Check before going")).toBeInTheDocument();
    expect(panel.getByText("Sensor reads deeper")).toBeInTheDocument();
    expect(panel.getByText("People agree")).toBeInTheDocument();
    // The photo is still being read (jsdom can't load images).
    expect(panel.getByText("Checking photo…")).toBeInTheDocument();
    expect(panel.getByText(/run on your phone/)).toBeInTheDocument();
  });
});
