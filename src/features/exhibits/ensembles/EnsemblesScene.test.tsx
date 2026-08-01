import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import EnsemblesScene from "./EnsemblesScene";

const liveRegion = () => screen.getByText(/stumps\. Ensemble accuracy/i);
const accuracy = () => Number(liveRegion().textContent?.match(/Ensemble accuracy (\d+\.\d+)%/i)?.[1]);
const rival = () => Number(liveRegion().textContent?.match(/stumps reaches (\d+\.\d+)%/i)?.[1]);

describe("EnsemblesScene", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/visualisations/bagging-and-boosting");
  });

  it("opens each step on the state that makes its own point", () => {
    const first = render(<EnsemblesScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Weak learners" }) as HTMLInputElement).value).toBe("1");
    first.unmount();

    const third = render(<EnsemblesScene step={2} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Weak learners" }) as HTMLInputElement).value).toBe("12");
    expect(screen.getByRole("button", { name: "bagging" })).toHaveAttribute("aria-pressed", "true");
    third.unmount();

    render(<EnsemblesScene step={3} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Weak learners" }) as HTMLInputElement).value).toBe("30");
  });

  it("improves as learners are added", () => {
    render(<EnsemblesScene step={0} resetKey={0} />);
    const alone = accuracy();

    fireEvent.change(screen.getByRole("slider", { name: "Weak learners" }), { target: { value: "20" } });
    expect(accuracy()).toBeGreaterThan(alone);
  });

  it("beats bagging with boosting on the same budget", () => {
    render(<EnsemblesScene step={1} resetKey={0} />);
    expect(screen.getByRole("button", { name: "boosting" })).toHaveAttribute("aria-pressed", "true");
    expect(accuracy()).toBeGreaterThan(rival());
  });

  it("reports the same pair of numbers whichever method is selected", () => {
    render(<EnsemblesScene step={1} resetKey={0} />);
    const boosted = accuracy();
    const bagged = rival();

    fireEvent.click(screen.getByRole("button", { name: "bagging" }));
    expect(accuracy()).toBeCloseTo(bagged, 5);
    expect(rival()).toBeCloseTo(boosted, 5);
  });

  it("shares and restores the learner count and the method", () => {
    const { unmount } = render(<EnsemblesScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Weak learners" }), { target: { value: "17" } });
    fireEvent.click(screen.getByRole("button", { name: "bagging" }));

    const params = new URL(window.location.href).searchParams;
    expect(params.get("depth")).toBe("17");
    expect(params.get("mode")).toBe("bagging");
    unmount();

    window.history.replaceState({}, "", "/visualisations/bagging-and-boosting?depth=8&mode=bagging");
    render(<EnsemblesScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Weak learners" }) as HTMLInputElement).value).toBe("8");
    expect(screen.getByRole("button", { name: "bagging" })).toHaveAttribute("aria-pressed", "true");
  });
});
