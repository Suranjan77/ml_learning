import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DecisionTreeScene from "./DecisionTreeScene";

afterEach(() => window.history.replaceState({}, "", "/"));

describe("DecisionTreeScene", () => {
  it("reveals the full tree in the depth-three guided step", () => {
    render(<DecisionTreeScene step={2} resetKey={0} />);
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Decision tree with depth 3, 5 leaves/)).toHaveLength(2);
  });

  it("updates the root threshold and accessible result", () => {
    render(<DecisionTreeScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Root threshold" }), { target: { value: "5" } });
    expect(screen.getAllByText(/root threshold x less than 5.0/)).toHaveLength(2);
  });

  it("seeds a kept root and distinguishes rerouting from prediction changes", () => {
    render(<DecisionTreeScene step={3} resetKey={0} />);

    expect(screen.getByRole("button", { name: "Clear kept threshold 4.0" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Compared with kept threshold 4.0/)).toHaveLength(2);
    expect(screen.getAllByText(/points change root branch, .* predictions change/)).toHaveLength(2);
  });

  it("restores a cleared root comparison from the URL", () => {
    window.history.replaceState({}, "", "/visualisations/decision-tree?step=3&compare=off");
    render(<DecisionTreeScene step={3} resetKey={0} />);

    expect(screen.getByRole("button", { name: "Keep this threshold to compare" })).toHaveAttribute("aria-pressed", "false");
  });
});
