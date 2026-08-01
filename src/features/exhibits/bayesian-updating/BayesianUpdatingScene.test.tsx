import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import BayesianUpdatingScene from "./BayesianUpdatingScene";

const liveRegion = () => screen.getByText(/Prior mean .* worth/i);
const posteriorMean = () => Number(liveRegion().textContent?.match(/Posterior mean ([\d.]+)%/i)?.[1]);
const influence = () => Number(liveRegion().textContent?.match(/Data influence ([\d.]+)%/i)?.[1]);

describe("BayesianUpdatingScene", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/visualisations/bayesian-updating");
  });

  it("opens each step on the state that makes its own point", () => {
    const { unmount } = render(<BayesianUpdatingScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Observations" }) as HTMLInputElement).value).toBe("0");
    unmount();

    const second = render(<BayesianUpdatingScene step={2} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Observations" }) as HTMLInputElement).value).toBe("200");
    second.unmount();

    render(<BayesianUpdatingScene step={3} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Prior strength" }) as HTMLInputElement).value).toBe("80");
  });

  it("leaves the posterior on the prior before anything is observed", () => {
    render(<BayesianUpdatingScene step={0} resetKey={0} />);
    expect(posteriorMean()).toBeCloseTo(30, 1);
    expect(influence()).toBe(0);
  });

  it("drags the posterior towards the data as observations accumulate", () => {
    render(<BayesianUpdatingScene step={0} resetKey={0} />);
    const start = posteriorMean();

    fireEvent.change(screen.getByRole("slider", { name: "Observations" }), { target: { value: "10" } });
    const few = posteriorMean();

    fireEvent.change(screen.getByRole("slider", { name: "Observations" }), { target: { value: "200" } });
    const many = posteriorMean();

    expect(few).toBeGreaterThan(start);
    expect(many).toBeGreaterThan(few);
    expect(influence()).toBeGreaterThan(85);
  });

  it("lets a stronger prior resist the very same evidence", () => {
    render(<BayesianUpdatingScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Observations" }), { target: { value: "20" } });

    fireEvent.change(screen.getByRole("slider", { name: "Prior strength" }), { target: { value: "2" } });
    const weak = influence();

    fireEvent.change(screen.getByRole("slider", { name: "Prior strength" }), { target: { value: "80" } });
    expect(influence()).toBeLessThan(weak);
  });

  it("shares and restores every control", () => {
    const { unmount } = render(<BayesianUpdatingScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Prior belief" }), { target: { value: "0.6" } });
    fireEvent.change(screen.getByRole("slider", { name: "Observations" }), { target: { value: "35" } });

    const params = new URL(window.location.href).searchParams;
    expect(params.get("mean")).toBe("0.60");
    expect(params.get("n")).toBe("35");
    unmount();

    window.history.replaceState({}, "", "/visualisations/bayesian-updating?mean=0.15&strength=50&n=64&rate=0.25");
    render(<BayesianUpdatingScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Prior belief" }) as HTMLInputElement).value).toBe("0.15");
    expect((screen.getByRole("slider", { name: "Prior strength" }) as HTMLInputElement).value).toBe("50");
    expect((screen.getByRole("slider", { name: "Observations" }) as HTMLInputElement).value).toBe("64");
    expect((screen.getByRole("slider", { name: "Observed rate" }) as HTMLInputElement).value).toBe("0.25");
  });

  it("narrows the credible interval as evidence accumulates", () => {
    render(<BayesianUpdatingScene step={0} resetKey={0} />);
    const width = () => {
      // Bounded digit groups: [\d.]+ would swallow the sentence's full stop.
      const match = liveRegion().textContent?.match(/interval (\d+\.\d+) to (\d+\.\d+)/i);
      return Number(match?.[2]) - Number(match?.[1]);
    };
    const before = width();
    fireEvent.change(screen.getByRole("slider", { name: "Observations" }), { target: { value: "200" } });
    expect(width()).toBeLessThan(before);
  });
});
