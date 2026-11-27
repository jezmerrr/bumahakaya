import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityChip } from "./SeverityChip";

describe("SeverityChip", () => {
  it("shows the bilingual label on the readable shade of the severity color", () => {
    render(<SeverityChip severity="Impassable" />);
    const chip = screen.getByText("Hindi madaanan / Not passable");
    expect(chip).toBeInTheDocument();
    // White text needs the darker "ink" red (6.2:1), not the bright pin red.
    expect(["#b42f2f", "rgb(180, 47, 47)"]).toContain(
      chip.style.backgroundColor,
    );
  });
});
