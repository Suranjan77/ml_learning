import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ClassificationThresholdScene from "./ClassificationThresholdScene";

const liveRegion = () => screen.getByText(/Threshold .* base rate/i);

describe("ClassificationThresholdScene", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/visualisations/classification-threshold");
  });

  it("opens each step on the state that makes its own point", () => {
    const { unmount } = render(<ClassificationThresholdScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Attack base rate" }) as HTMLInputElement).value).toBe("1");
    // Step 0 opens where accuracy is highest, which is the point of the exhibit.
    expect((screen.getByRole("slider", { name: "Alert threshold" }) as HTMLInputElement).value).toBe("0.8");
    unmount();

    render(<ClassificationThresholdScene step={2} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Attack base rate" }) as HTMLInputElement).value).toBe("0.2");
  });

  it("shares and restores threshold, base rate and separation", () => {
    const { unmount } = render(<ClassificationThresholdScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Alert threshold" }), { target: { value: "0.72" } });
    fireEvent.change(screen.getByRole("slider", { name: "Attack base rate" }), { target: { value: "5" } });

    const params = new URL(window.location.href).searchParams;
    expect(params.get("threshold")).toBe("0.72");
    expect(params.get("rate")).toBe("5");
    unmount();

    window.history.replaceState({}, "", "/visualisations/classification-threshold?threshold=0.30&rate=25");
    render(<ClassificationThresholdScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Alert threshold" }) as HTMLInputElement).value).toBe("0.3");
    expect((screen.getByRole("slider", { name: "Attack base rate" }) as HTMLInputElement).value).toBe("25");
  });

  it("announces the contradiction the exhibit is built on", () => {
    render(<ClassificationThresholdScene step={0} resetKey={0} />);
    // Accuracy above 99% while four attacks in five go uncaught.
    expect(liveRegion().textContent).toMatch(/Accuracy 99\.\d\d%/);
    const recall = Number(liveRegion().textContent?.match(/recall ([\d.]+)%/i)?.[1]);
    expect(recall).toBeLessThan(25);
    expect(liveRegion().textContent).toMatch(/missed/);
  });

  it("holds recall still and moves precision when only the base rate changes", () => {
    render(<ClassificationThresholdScene step={0} resetKey={0} />);
    const readRecall = () => liveRegion().textContent?.match(/recall ([\d.]+)%/i)?.[1];
    const readPrecision = () => liveRegion().textContent?.match(/precision ([\d.]+)%/i)?.[1];

    fireEvent.change(screen.getByRole("slider", { name: "Attack base rate" }), { target: { value: "50" } });
    const recallCommon = readRecall();
    const precisionCommon = Number(readPrecision());

    fireEvent.change(screen.getByRole("slider", { name: "Attack base rate" }), { target: { value: "0.1" } });
    expect(readRecall()).toBe(recallCommon);
    expect(Number(readPrecision())).toBeLessThan(precisionCommon);
  });

  it("jumps to the accuracy-optimal threshold, which alerts on almost nothing", () => {
    render(<ClassificationThresholdScene step={2} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Best accuracy" }));

    const recall = Number(liveRegion().textContent?.match(/recall ([\d.]+)%/i)?.[1]);
    expect(recall).toBeLessThan(10);
  });

  it("reaches a usable balance when asked for one", () => {
    render(<ClassificationThresholdScene step={2} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Best balance" }));

    const recall = Number(liveRegion().textContent?.match(/recall ([\d.]+)%/i)?.[1]);
    expect(recall).toBeGreaterThan(20);
  });
});
