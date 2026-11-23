import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSection } from "./ProfileSection";
import { StoreProvider } from "@/lib/store";

function renderProfile(onLogout = vi.fn()) {
  render(
    <StoreProvider>
      <ProfileSection onLogout={onLogout} />
    </StoreProvider>,
  );
  return onLogout;
}

beforeEach(() => {
  localStorage.clear();
});

describe("ProfileSection", () => {
  it("calls onLogout when Log out is tapped", async () => {
    const user = userEvent.setup();
    const onLogout = renderProfile();
    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("opens My reports and lists the user's own reports", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(screen.getByRole("button", { name: /my reports/i }));
    // Seed report r-002 is authored by the current user (jramos).
    expect(
      screen.getByText(/Road near Henry still passable/i),
    ).toBeInTheDocument();
  });

  it("saves an area and persists it", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(screen.getByRole("button", { name: /saved areas/i }));
    await user.click(screen.getByRole("button", { name: /save taft ave/i }));
    expect(localStorage.getItem("bk.savedAreas.v1")).toContain("Taft Ave");
  });
});
