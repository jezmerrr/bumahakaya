
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportSection } from "./ReportSection";
import { StoreProvider, useStore } from "@/lib/store";

function Harness() {
  const { reports } = useStore();
  return (
    <div>
      <span data-testid="count">{reports.length}</span>
      <span data-testid="first-source">{reports[0]?.source ?? ""}</span>
      <span data-testid="first-severity">{reports[0]?.severity ?? ""}</span>
      <ReportSection />
    </div>
  );
}

function renderForm() {
  render(
    <StoreProvider>
      <Harness />
    </StoreProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ReportSection", () => {
  it("posts a community report with a selected status", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = Number(screen.getByTestId("count").textContent);
    await user.type(screen.getByLabelText(/location/i), "Agno St");
    await user.click(screen.getByRole("button", { name: "Not passable" }));
    await user.click(screen.getByRole("button", { name: /post report/i }));
    expect(Number(screen.getByTestId("count").textContent)).toBe(before + 1);
    expect(screen.getByTestId("first-source").textContent).toBe("community");
    expect(screen.getByTestId("first-severity").textContent).toBe("Impassable");
  });

  it("does not post a report without a location", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = Number(screen.getByTestId("count").textContent);

    await user.click(screen.getByRole("button", { name: /post report/i }));

    expect(Number(screen.getByTestId("count").textContent)).toBe(before);
    expect(screen.getByLabelText(/location/i)).toBeInvalid();
  });

  it("allows a report to be posted without a photo", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = Number(screen.getByTestId("count").textContent);

    await user.type(screen.getByLabelText(/location/i), "Agno St");
    await user.click(screen.getByRole("button", { name: /post report/i }));

    expect(Number(screen.getByTestId("count").textContent)).toBe(before + 1);
  });
});
