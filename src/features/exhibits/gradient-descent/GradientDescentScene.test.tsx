import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import GradientDescentScene from "./GradientDescentScene";

afterEach(() => window.history.replaceState({}, "", "/"));

describe("GradientDescentScene", () => {
  it("takes manual steps and restarts the path without changing the controls", () => {
    render(<GradientDescentScene step={0} resetKey={0} />);

    const rate = screen.getByRole("slider", { name: "Learning rate" });
    expect(rate).toHaveValue("0.24");
    fireEvent.change(rate, { target: { value: "0.4" } });
    fireEvent.click(screen.getByRole("button", { name: "Take step" }));
    expect(screen.getByText(/Step 1\. Current loss/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByText(/Step 0\. Current loss/)).toBeInTheDocument();
    expect(rate).toHaveValue("0.4");
  });

  it("uses the guided high-rate preset to show valley overshoot", () => {
    render(<GradientDescentScene step={2} resetKey={0} />);

    expect(screen.getByRole("button", { name: "valley" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("slider", { name: "Learning rate" })).toHaveValue("0.9");
    expect(screen.getByText(/Overshoot: crossed the valley/)).toBeInTheDocument();
  });

  it("supports keyboard positioning and deterministic external reset", () => {
    const { rerender } = render(<GradientDescentScene step={0} resetKey={0} />);
    const landscape = screen.getByTestId("loss-landscape");
    expect(landscape).toHaveAttribute("aria-label", expect.stringContaining("x -3.40, y 1.90"));

    fireEvent.keyDown(landscape, { key: "ArrowRight" });
    expect(landscape).toHaveAttribute("aria-label", expect.stringContaining("x -3.24, y 1.90"));
    fireEvent.change(screen.getByRole("slider", { name: "Learning rate" }), { target: { value: "1.2" } });

    rerender(<GradientDescentScene step={0} resetKey={1} />);
    expect(landscape).toHaveAttribute("aria-label", expect.stringContaining("x -3.40, y 1.90"));
    expect(screen.getByRole("slider", { name: "Learning rate" })).toHaveValue("0.24");
  });

  it("labels a loss-increasing high-rate step", () => {
    render(<GradientDescentScene step={0} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "valley" }));
    fireEvent.change(screen.getByRole("slider", { name: "Learning rate" }), { target: { value: "1.2" } });
    expect(screen.getByText(/Loss increased/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Take step" }));
    expect(screen.getByText(/Loss increased/)).toBeInTheDocument();
  });

  it("keeps one path while the learning rate changes for causal comparison", () => {
    render(<GradientDescentScene step={2} resetKey={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Keep this path to compare" }));
    fireEvent.change(screen.getByRole("slider", { name: "Learning rate" }), { target: { value: "1.2" } });

    expect(screen.getByRole("button", { name: "Clear kept path at 0.90" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Grey: kept path")).toBeInTheDocument();
    expect(screen.getByText("Compare: rate only")).toBeInTheDocument();
    expect(screen.getByText(/Diverging: after 14 steps, loss is .* higher/i)).toBeInTheDocument();
  });

  it("restores a shareable comparison between starts that reach different basins", () => {
    window.history.replaceState({}, "", "/visualisations/gradient-descent?step=3&surface=multimodal&x=0.4&y=0.4&refX=-3.4&refY=1.9&refLr=0.24");
    render(<GradientDescentScene step={3} resetKey={0} />);

    expect(screen.getByTestId("loss-landscape")).toHaveAttribute("aria-label", expect.stringMatching(/Current start point x 0\.40, y 0\.40.*Kept path starts at x -3\.40, y 1\.90/));
    expect(screen.getByRole("button", { name: "Clear kept path at 0.24" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Compare: start only")).toBeInTheDocument();
    expect(screen.getByText(/Starts reach different basins/)).toBeInTheDocument();
    expect(screen.getByText(/Step 8\. Current loss/)).toHaveAttribute("aria-label", expect.stringContaining("Starts reach different basins"));
  });

  it("does not attribute a confounded comparison to the start alone", () => {
    window.history.replaceState({}, "", "/visualisations/gradient-descent?step=3&x=0.4&y=0.4&lr=0.4&refX=-3.4&refY=1.9&refLr=0.24");
    render(<GradientDescentScene step={3} resetKey={0} />);

    expect(screen.getByText("Compare: rate + start")).toHaveClass("text-warning");
    expect(screen.getByText(/Paths reach different basins/)).toBeInTheDocument();
    expect(screen.queryByText(/Starts reach different basins/)).not.toBeInTheDocument();
    expect(screen.getByText(/Step 8\. Current loss/)).toHaveAttribute("aria-label", expect.stringContaining("does not isolate one cause"));
  });

  it("shows a distinct multimodal failure case", () => {
    render(<GradientDescentScene step={3} resetKey={0} />);
    expect(screen.getByRole("button", { name: "Many minima" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/local basin|global minimum/i)).toBeInTheDocument();
  });
});
