import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportSection } from "./ReportSection";
import { StoreProvider, useStore } from "@/lib/store";

// The pin-picking map uses Leaflet, which can't run in jsdom: a button
// stands in for tapping the map.
vi.mock("next/dynamic", async () => {
  const { createElement } = await import("react");
  return {
    default: () =>
      function PinMapStub({ onChange }: { onChange: (p: { lat: number; lng: number }) => void }) {
        return createElement(
          "button",
          { type: "button", onClick: () => onChange({ lat: 14.5601, lng: 120.9942 }) },
          "Drop pin (test)",
        );
      },
  };
});

function Harness() {
  const { reports } = useStore();
  return (
    <div>
      <span data-testid="count">{reports.length}</span>
      <span data-testid="first-source">{reports[0]?.source ?? ""}</span>
      <span data-testid="first-severity">{reports[0]?.severity ?? ""}</span>
      <span data-testid="first-pin">
        {reports[0] ? `${reports[0].lat},${reports[0].lng}` : ""}
      </span>
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

const count = () => Number(screen.getByTestId("count").textContent);

async function pickOnMap(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /pick on map/i }));
  const sheet = screen.getByRole("dialog", { name: /pick the flooded spot/i });
  await user.click(within(sheet).getByRole("button", { name: "Drop pin (test)" }));
  expect(within(sheet).getByText(/^Pin set · \d+ m from DLSU$/)).toBeInTheDocument();
  await user.click(within(sheet).getByRole("button", { name: /use this spot/i }));
  expect(screen.queryByRole("dialog")).toBeNull();
}

const realGeolocation = navigator.geolocation;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  Object.defineProperty(navigator, "geolocation", { value: realGeolocation, configurable: true });
});

describe("ReportSection", () => {
  it("posts a report at the spot picked on the map", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = count();
    await user.type(screen.getByLabelText(/location/i), "Agno St");
    await pickOnMap(user);
    expect(screen.getByText(/^📍 Pinned · \d+ m from DLSU$/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Not passable" }));
    await user.click(screen.getByRole("button", { name: /post report/i }));

    expect(count()).toBe(before + 1);
    expect(screen.getByTestId("first-source").textContent).toBe("community");
    expect(screen.getByTestId("first-severity").textContent).toBe("Impassable");
    // Saved where the pin is, not at DLSU.
    expect(screen.getByTestId("first-pin").textContent).toBe("14.5601,120.9942");
  });

  it("does not post a report without a location", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = count();
    await user.click(screen.getByRole("button", { name: /post report/i }));
    expect(count()).toBe(before);
    expect(screen.getByLabelText(/location/i)).toBeInvalid();
  });

  it("asks for a pin before posting", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = count();
    await user.type(screen.getByLabelText(/location/i), "Agno St");
    await user.click(screen.getByRole("button", { name: /post report/i }));
    expect(count()).toBe(before);
    expect(screen.getByText(/add a pin first/i)).toBeInTheDocument();
  });

  it("allows a report to be posted without a photo", async () => {
    const user = userEvent.setup();
    renderForm();
    const before = count();
    await user.type(screen.getByLabelText(/location/i), "Agno St");
    await pickOnMap(user);
    await user.click(screen.getByRole("button", { name: /post report/i }));
    expect(count()).toBe(before + 1);
  });

  it("can pin the report at the phone's current location", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: (p: { coords: { latitude: number; longitude: number } }) => void) =>
          ok({ coords: { latitude: 14.563, longitude: 120.995 } }),
      },
    });
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/location/i), "Estrada St");
    await user.click(screen.getByRole("button", { name: /use my location/i }));
    expect(screen.getByText(/^📍 Pinned/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /post report/i }));
    expect(screen.getByTestId("first-pin").textContent).toBe("14.563,120.995");
  });

  it("explains what to do when location is turned off", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_ok: unknown, fail: (e: { code: number; PERMISSION_DENIED: number }) => void) =>
          fail({ code: 1, PERMISSION_DENIED: 1 }),
      },
    });
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /use my location/i }));
    expect(screen.getByText(/location is turned off.*pick the spot on the map/i)).toBeInTheDocument();
  });
});
