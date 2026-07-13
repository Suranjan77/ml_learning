import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import OverfittingScene from "./OverfittingScene";

afterEach(() => window.history.replaceState({}, "", "/"));

describe("OverfittingScene", () => {
  it("changes the fit and regime label when the degree slider moves", () => {
    render(<OverfittingScene step={0} resetKey={0} />);

    const slider = screen.getByRole("slider", { name: "Degree" });
    expect(slider).toHaveValue("1");
    expect(screen.getByText(/1\s*·\s*underfit/)).toBeInTheDocument();
    expect(screen.getByText(/Underfitting: the model is too simple/)).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "3" } });
    expect(screen.getByText(/Degree 3\./)).toBeInTheDocument();
    expect(screen.getByText(/3\s*·\s*good fit/)).toBeInTheDocument();
    expect(screen.getByText(/Good fit: the curve tracks the pattern/)).toBeInTheDocument();
  });

  it("applies the guided degree preset for the overfitting step", () => {
    render(<OverfittingScene step={2} resetKey={0} />);

    expect(screen.getByRole("slider", { name: "Degree" })).toHaveValue("11");
    expect(screen.getByText(/Overfitting: the curve chases the noise\./)).toBeInTheDocument();
  });

  it("supports keyboard degree changes and a deterministic external reset", () => {
    const { rerender } = render(<OverfittingScene step={1} resetKey={0} />);
    const stage = screen.getByTestId("overfitting-stage");
    const slider = screen.getByRole("slider", { name: "Degree" });
    expect(slider).toHaveValue("3");

    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(slider).toHaveValue("4");
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(slider).toHaveValue("2");

    rerender(<OverfittingScene step={1} resetKey={1} />);
    expect(slider).toHaveValue("3");
  });

  it("resamples the data without changing the selected degree", () => {
    render(<OverfittingScene step={1} resetKey={0} />);

    const slider = screen.getByRole("slider", { name: "Degree" });
    const before = screen.getByText(/Degree 3\./).textContent;

    fireEvent.click(screen.getByRole("button", { name: "Resample data" }));

    expect(slider).toHaveValue("3");
    expect(screen.getByText(/Degree 3\./).textContent).not.toBe(before);
  });

  it("toggles the validation points on and off", () => {
    render(<OverfittingScene step={0} resetKey={0} />);

    const toggle = screen.getByRole("button", { name: "Validation points" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("seeds a moderate fit for a degree-only overfitting comparison", () => {
    render(<OverfittingScene step={2} resetKey={0} />);

    expect(screen.getByRole("button", { name: "Clear kept degree 3" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Degree 3 → 11: training/)).toHaveLength(2);
    expect(screen.getByText(/Degree 11\..*Overfitting:/)).toBeInTheDocument();
  });

  it("shares resampling, validation visibility, and a cleared comparison", () => {
    window.history.replaceState({}, "", "/visualisations/overfitting/");
    render(<OverfittingScene step={2} resetKey={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear kept degree 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Resample data" }));
    fireEvent.click(screen.getByRole("button", { name: "Validation points" }));

    const params = new URL(window.location.href).searchParams;
    expect(params.get("compare")).toBe("off");
    expect(params.get("seed")).toBe("2");
    expect(params.get("validation")).toBe("off");
  });
});
