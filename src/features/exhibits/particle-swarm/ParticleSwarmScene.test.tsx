import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ParticleSwarmScene from "./ParticleSwarmScene";

describe("ParticleSwarmScene", () => {
  it("selects any particle and exposes its exact microscope state", () => {
    render(<ParticleSwarmScene step={0} resetKey={0} />);

    fireEvent.click(screen.getByRole("button", { name: /Select particle 4\./ }));
    expect(screen.getByText("PARTICLE 4 MICROSCOPE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Momentum" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Personal memory" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Shared knowledge" })).toHaveAttribute("aria-pressed", "true");
  });

  it("supports keyboard particle navigation and semantic vector toggles", () => {
    render(<ParticleSwarmScene step={1} resetKey={0} />);
    const field = screen.getByTestId("particle-swarm-field");
    expect(screen.getByText("PARTICLE 6 MICROSCOPE")).toBeInTheDocument();
    expect(screen.getByLabelText(/Head-to-tail force addition/)).toBeInTheDocument();

    fireEvent.keyDown(field, { key: "ArrowRight" });
    expect(screen.getByText("PARTICLE 7 MICROSCOPE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Shared knowledge" }));
    expect(screen.getByRole("button", { name: "Shared knowledge" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Show same-origin vector comparison" }));
    expect(screen.getByRole("button", { name: "Show head-to-tail vector addition" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Same-origin force comparison/)).toBeInTheDocument();
  });

  it("takes a deterministic step and restarts without resetting force weights", () => {
    render(<ParticleSwarmScene step={0} resetKey={0} />);
    const social = screen.getByRole("slider", { name: "Social pull" });
    fireEvent.change(social, { target: { value: "0.8" } });
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    expect(screen.getByTestId("particle-swarm-field")).toHaveAttribute("aria-label", expect.stringContaining("Iteration 1"));
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByTestId("particle-swarm-field")).toHaveAttribute("aria-label", expect.stringContaining("Iteration 0"));
    expect(social).toHaveValue("0.8");
  });

  it("renders the deterministic discovery and collapse signature states", () => {
    const { rerender } = render(<ParticleSwarmScene step={2} resetKey={0} />);
    expect(screen.getByText("NEW SHARED DISCOVERY")).toBeInTheDocument();
    expect(screen.getByText(/Every social target changed/)).toBeInTheDocument();

    rerender(<ParticleSwarmScene step={3} resetKey={0} />);
    expect(screen.getByText("PREMATURE COLLAPSE")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Social pull" })).toHaveValue("2.2");
  });
});
