import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapSection } from "./MapSection";
import { StoreProvider } from "@/lib/store";

// Leaflet can't run in jsdom, so the map is replaced by a list of pin buttons
// that call onSelect exactly like tapping a pin would.
vi.mock("next/dynamic", async () => {
  const { createElement } = await import("react");
  type Props = {
    markers: { id: string; severity: string }[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
  };
  function StubMap({ markers, selectedId, onSelect }: Props) {
    return createElement(
      "div",
      { "data-testid": "map", "data-selected": selectedId ?? "" },
      markers.map((m) =>
        createElement(
          "button",
          {
            key: m.id,
            type: "button",
            "data-severity": m.severity,
            onClick: () => onSelect(m.id),
          },
          `pin ${m.id}`,
        ),
      ),
    );
  }
  return { default: () => StubMap };
});

function renderMap() {
  render(
    <StoreProvider>
      <MapSection />
    </StoreProvider>,
  );
}

const pins = () =>
  within(screen.getByTestId("map")).getAllByRole("button", { name: /^pin / });

beforeEach(() => {
  localStorage.clear();
});

describe("MapSection", () => {
  it("shows the floating title, filters, controls, and a summary", () => {
    renderMap();
    expect(screen.getByRole("heading", { name: "Flood map" })).toBeInTheDocument();
    expect(screen.getByText(/Updated .* ago|Updated just now/)).toBeInTheDocument();
    for (const name of ["Zoom in", "Zoom out", "Back to my location"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    const summary = screen.getByRole("region", { name: /nearby summary/i });
    expect(within(summary).getByText(/reports within 700 m/i)).toBeInTheDocument();
    expect(
      within(summary).getByRole("button", { name: /deepest: waist-deep/i }),
    ).toBeInTheDocument();
  });

  it("filters pins and the summary by road condition", async () => {
    const user = userEvent.setup();
    renderMap();
    const total = pins().length;
    await user.click(screen.getByRole("button", { name: /^not passable/i }));
    const left = pins();
    expect(left.length).toBeLessThan(total);
    for (const p of left) expect(p).toHaveAttribute("data-severity", "Impassable");
    expect(screen.getByText(/marked not passable within 700 m/i)).toBeInTheDocument();
  });

  it("previews a tapped pin and opens its full details", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "pin s-02" }));
    const preview = screen.getByRole("region", { name: /selected report/i });
    expect(within(preview).getByText(/FloodWatch Sensor 02 at Agno St/)).toBeInTheDocument();
    expect(within(preview).getByText(/floodwatch sensor ·/i)).toBeInTheDocument();

    await user.click(within(preview).getByRole("button", { name: /view details/i }));
    const dialog = screen.getByRole("dialog", { name: /report details/i });
    expect(within(dialog).getByTestId("flood-scene")).toHaveAttribute("data-level", "Waist+");
    expect(within(dialog).getAllByText("FloodWatch sensor").length).toBeGreaterThan(0);

    await user.click(within(dialog).getByRole("button", { name: "Back" }));
    await user.click(within(preview).getByRole("button", { name: /close preview/i }));
    expect(screen.queryByRole("region", { name: /selected report/i })).toBeNull();
    expect(screen.getByTestId("map")).toHaveAttribute("data-selected", "");
  });

  it("selects the deepest report from the summary card", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: /deepest: waist-deep/i }));
    const preview = screen.getByRole("region", { name: /selected report/i });
    expect(within(preview).getByText(/waist-deep/i)).toBeInTheDocument();
  });

  it("switches to a list and opens your own report to delete it", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "List" }));
    expect(screen.queryByTestId("map")).toBeNull();
    expect(screen.getByText(/reports within 700 m/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /road near henry still passable/i }));
    const dialog = screen.getByRole("dialog", { name: /report details/i });
    await user.click(within(dialog).getByRole("button", { name: /delete report/i }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /road near henry still passable/i }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Map" }));
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });
});
