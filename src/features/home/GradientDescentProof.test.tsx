import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GradientDescentProof } from "./GradientDescentProof";

describe("GradientDescentProof", () => {
  it("uses the flagship model to expose oscillation and divergence", () => {
    render(<GradientDescentProof />);

    const slider = screen.getByRole("slider", { name: "Homepage learning rate" });
    expect(screen.getAllByText(/0.52 · converging/).length).toBeGreaterThan(0);

    fireEvent.input(slider, { target: { value: "0.90" } });
    expect(screen.getAllByText(/0.90 · oscillating/).length).toBeGreaterThan(0);

    fireEvent.input(slider, { target: { value: "1.06" } });
    expect(screen.getAllByText(/1.06 · diverging/).length).toBeGreaterThan(0);
    expect(screen.getByText(/1.06 finishes .* above its starting loss after 14 steps/)).toBeInTheDocument();
    expect(screen.getByText(/0.40 lowers loss; at 1.06, loss finishes/)).toBeInTheDocument();
  });
});
