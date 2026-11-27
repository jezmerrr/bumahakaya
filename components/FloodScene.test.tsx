import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloodScene, LEVELS, WATER_TOP } from "./FloodScene";

describe("FloodScene", () => {
  it("draws deeper water for deeper reports", () => {
    // Smaller y = higher on screen = deeper water.
    expect(WATER_TOP.Ankle).toBeGreaterThan(WATER_TOP.Knee);
    expect(WATER_TOP.Knee).toBeGreaterThan(WATER_TOP["Waist+"]);
  });

  it("shows traffic moving normally when passable", () => {
    render(<FloodScene level="Ankle" severity="Passable" />);
    expect(
      screen.getByRole("img", { name: /ankle-deep floodwater.*driving through/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("flood-car")).toHaveClass("flood-drive");
    expect(screen.getByTestId("flood-person")).toHaveClass("flood-bob");
    expect(screen.getByTestId("flood-light")).toHaveAttribute("data-lit", "green");
    expect(screen.queryByTestId("flood-sign-caution")).toBeNull();
    expect(screen.queryByTestId("flood-sign-noentry")).toBeNull();
    expect(screen.getByText(/Madadaanan · Ankle-deep/)).toBeInTheDocument();
  });

  it("slows the car with a splash when difficult", () => {
    const { container } = render(<FloodScene level="Knee" severity="Caution" />);
    expect(screen.getByTestId("flood-car")).toHaveClass("flood-drive-slow");
    expect(container.querySelectorAll(".flood-wake")).toHaveLength(2);
    expect(container.querySelector(".flood-leg-slow")).not.toBeNull();
    expect(screen.getByText(/Mag-ingat · Knee-deep/)).toBeInTheDocument();
  });

  it("stalls the car, stops the person, and adds a sign when not passable", () => {
    const { container } = render(
      <FloodScene level="Waist+" severity="Impassable" />,
    );
    expect(
      screen.getByRole("img", { name: /waist-deep floodwater.*stalled car/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("flood-car")).toHaveClass("flood-float");
    expect(screen.getByTestId("flood-person")).not.toHaveClass("flood-bob");
    expect(container.querySelectorAll(".flood-blink")).toHaveLength(2);
    expect(screen.getByTestId("flood-sign-noentry")).toBeInTheDocument();
    expect(screen.getByTestId("flood-light")).toHaveAttribute("data-lit", "red");
    expect(screen.getByText(/Hindi madaanan · Waist-deep/)).toBeInTheDocument();
    expect(screen.getByText(/find another route/i)).toBeInTheDocument();
  });

  it("puts the water at the reported depth", () => {
    const { container } = render(<FloodScene level="Knee" severity="Caution" />);
    const front = container.querySelector(".flood-wave");
    expect(front?.getAttribute("d")).toMatch(
      new RegExp(`^M -60 ${WATER_TOP.Knee} `),
    );
  });

  it("looks different at each flood depth", () => {
    const looks = (["Ankle", "Knee", "Waist+"] as const).map((level) => {
      const { container, unmount } = render(
        <FloodScene level={level} severity="Caution" />,
      );
      const scene = screen.getByTestId("flood-scene");
      const result = {
        person: scene.getAttribute("data-person"),
        water: container.querySelector(".flood-wave")?.getAttribute("fill"),
        rain: container.querySelectorAll(".flood-rain").length,
        debris: container.querySelectorAll(".flood-drift").length,
        current: container.querySelector("[data-testid=flood-current]") !== null,
        caption: container.querySelector("figcaption")?.textContent ?? "",
      };
      unmount();
      return result;
    });
    const [ankle, knee, waist] = looks;

    // Person: walks at the ankle, wades at the knee, stuck at the waist.
    expect([ankle.person, knee.person, waist.person]).toEqual([
      "walk",
      "wade",
      "stuck",
    ]);
    // Water color changes with depth (clear -> murky -> muddy).
    expect(new Set([ankle.water, knee.water, waist.water]).size).toBe(3);
    // Rain and debris get heavier; only deep water has a strong current.
    expect(ankle.rain).toBeLessThan(knee.rain);
    expect(knee.rain).toBeLessThan(waist.rain);
    expect(ankle.debris).toBe(0);
    expect(waist.debris).toBeGreaterThan(knee.debris);
    expect([ankle.current, knee.current, waist.current]).toEqual([
      false,
      false,
      true,
    ]);
    // Caption gives a rough depth.
    expect(ankle.caption).toContain(LEVELS.Ankle.depthNote);
    expect(waist.caption).toContain("1 m or more");
  });

  it("tells passable and gutter-deep apart at the same depth", () => {
    const passable = render(<FloodScene level="Ankle" severity="Passable" />);
    const p = {
      car: screen.getByTestId("flood-car").getAttribute("class"),
      light: screen.getByTestId("flood-light").getAttribute("data-lit"),
      caution: screen.queryByTestId("flood-sign-caution") !== null,
      spray: passable.container.querySelectorAll(".flood-spray").length,
      slowSteps: passable.container.querySelector(".flood-leg-slow") !== null,
    };
    passable.unmount();

    const gutter = render(<FloodScene level="Ankle" severity="Caution" />);
    const g = {
      car: screen.getByTestId("flood-car").getAttribute("class"),
      light: screen.getByTestId("flood-light").getAttribute("data-lit"),
      caution: screen.queryByTestId("flood-sign-caution") !== null,
      spray: gutter.container.querySelectorAll(".flood-spray").length,
      slowSteps: gutter.container.querySelector(".flood-leg-slow") !== null,
    };

    expect(p).toEqual({
      car: "flood-drive",
      light: "green",
      caution: false,
      spray: 0,
      slowSteps: false,
    });
    expect(g).toEqual({
      car: "flood-drive-slow",
      light: "amber",
      caution: true,
      spray: 6,
      slowSteps: true,
    });
    expect(
      screen.getByRole("img", { name: /amber traffic light/i }),
    ).toBeInTheDocument();
  });
});
