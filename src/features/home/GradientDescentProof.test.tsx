import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GradientDescentProof } from "./GradientDescentProof";

describe("GradientDescentProof", () => {
  it("uses the flagship model to expose oscillation and divergence", () => {
    render(<GradientDescentProof />);

    const slider = screen.getByRole("slider", { name: "Homepage learning rate" });
    expect(screen.getByText(/0.90 · oscillating/)).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "1.06" } });
    expect(screen.getByText(/1.06 · diverging/)).toBeInTheDocument();
    expect(screen.getByText(/After 14 steps, loss is .* higher/)).toBeInTheDocument();
  });
});
