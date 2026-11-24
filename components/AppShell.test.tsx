import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./AppShell";
import { StoreProvider } from "@/lib/store";

async function enterApp() {
  const user = userEvent.setup();
  render(
    <StoreProvider>
      <AppShell />
    </StoreProvider>,
  );
  await user.click(screen.getByRole("button", { name: /continue as guest/i }));
  return user;
}

describe("AppShell", () => {
  it("shows the Start screen first, then the app after tapping start", async () => {
    await enterApp();
    for (const name of ["Home", "Maps", "Alerts", "Profile"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("opens the Report form from the center button", async () => {
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByText(/Report flooding/i)).toBeInTheDocument();
  });

  it("switches to the Alerts section", async () => {
    const user = await enterApp();
    await user.click(screen.getByRole("button", { name: "Alerts" }));
    expect(
      screen.getByText(/Flood warnings near you/i),
    ).toBeInTheDocument();
  });

  it("shows the supplementary-source disclaimer", async () => {
    await enterApp();
    expect(screen.getByText(/does not replace/i)).toHaveTextContent(/PAGASA/);
  });
});
