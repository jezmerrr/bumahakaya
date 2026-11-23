import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityChip } from "./SeverityChip";

describe("SeverityChip", () => {
  it("shows the bilingual label and the brand color for the severity", () => {
    render(<SeverityChip severity="Impassable" />);
    const chip = screen.getByText("Hindi madaanan / Not passable");
    expect(chip).toBeInTheDocument();
    expect(["#d64550", "rgb(214, 69, 80)"]).toContain(
      chip.style.backgroundColor,
    );
  });
});
