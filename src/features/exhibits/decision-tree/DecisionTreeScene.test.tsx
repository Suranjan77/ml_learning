import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DecisionTreeScene from "./DecisionTreeScene";

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
});
