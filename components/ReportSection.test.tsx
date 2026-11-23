import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/street or landmark/i), "Agno St");
  await user.selectOptions(screen.getByLabelText(/water level/i), "Knee");
  await user.selectOptions(screen.getByLabelText(/road status/i), "Caution");
  await user.click(screen.getByRole("button", { name: /submit report/i }));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReportSection", () => {
  it("adds a community report with no photo and no note", async () => {
    renderForm();
    const before = Number(screen.getByTestId("count").textContent);
    await fillAndSubmit();
    expect(Number(screen.getByTestId("count").textContent)).toBe(before + 1);
    expect(screen.getByTestId("first-source").textContent).toBe("community");
  });

  it("still works when geolocation is denied", async () => {
    Object.defineProperty(global.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: PositionCallback,
          error?: PositionErrorCallback,
        ) => error?.({ code: 1, message: "denied" } as GeolocationPositionError),
      },
    });
    renderForm();
    const before = Number(screen.getByTestId("count").textContent);
    await userEvent.click(
      screen.getByRole("button", { name: /use my location/i }),
    );
    await fillAndSubmit();
    expect(Number(screen.getByTestId("count").textContent)).toBe(before + 1);
  });
});
