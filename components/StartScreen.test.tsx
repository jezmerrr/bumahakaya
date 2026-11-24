import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartScreen } from "./StartScreen";

describe("StartScreen", () => {
  it("offers log in, sign up, and guest entry", () => {
    render(<StartScreen onStart={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue as guest/i }),
    ).toBeInTheDocument();
  });

  it("opens the sign up form with a name field", async () => {
    const user = userEvent.setup();
    render(<StartScreen onStart={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Sign up" }));
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("enters the app after submitting login", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<StartScreen onStart={onStart} />);
    await user.click(screen.getByRole("button", { name: "Log in" }));
    await user.type(screen.getByLabelText(/email/i), "me@dlsu.edu.ph");
    await user.type(screen.getByLabelText(/password/i), "secret12");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("enters the app as guest", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<StartScreen onStart={onStart} />);
    await user.click(screen.getByRole("button", { name: /continue as guest/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
