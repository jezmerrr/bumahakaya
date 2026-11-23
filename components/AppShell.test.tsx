import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./AppShell";
import { StoreProvider } from "@/lib/store";

function renderShell() {
  return render(
    <StoreProvider>
      <AppShell />
    </StoreProvider>,
  );
}

describe("AppShell", () => {
  it("offers the five section tabs", () => {
    renderShell();
    for (const name of ["Map", "Feed", "Report", "Announcements", "Updates"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("switches to the Report section when its tab is clicked", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByText(/Report a flooded street/i)).toBeInTheDocument();
  });

  it("shows the supplementary-source disclaimer", () => {
    renderShell();
    expect(screen.getByText(/does not replace/i)).toHaveTextContent(/PAGASA/);
  });
});
