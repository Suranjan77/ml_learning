import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TokenSamplingScene from "./TokenSamplingScene";
import { CANDIDATES } from "./data";
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  SAMPLE_DRAWS,
  applyTopP,
  entropy,
  sampleIndex,
  softmaxWithTemperature,
} from "./model";

const LOGITS = CANDIDATES.map((candidate) => candidate.logit);

function tokenAt(temperature: number, drawIndex: number): string {
  const probabilities = softmaxWithTemperature(LOGITS, temperature);
  const index = sampleIndex(probabilities, SAMPLE_DRAWS[drawIndex % SAMPLE_DRAWS.length]);
  return CANDIDATES[index].token;
}

describe("TokenSamplingScene", () => {
  it("samples deterministic tokens and clears them on demand", () => {
    render(<TokenSamplingScene step={0} resetKey={0} />);

    const temperatureSlider = screen.getByRole("slider", { name: "Temperature" });
    expect(temperatureSlider).toHaveValue(String(DEFAULT_TEMPERATURE));
    expect(screen.getByText(/0\.80\s*·\s*balanced/)).toBeInTheDocument();

    const continuation = screen.getByTestId("sampled-continuation");
    expect(within(continuation).queryByText(/·/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sample token" }));
    const firstToken = tokenAt(DEFAULT_TEMPERATURE, 0);
    expect(continuation).toHaveTextContent(firstToken);

    fireEvent.click(screen.getByRole("button", { name: "Sample token" }));
    const secondToken = tokenAt(DEFAULT_TEMPERATURE, 1);
    expect(continuation).toHaveTextContent(`${firstToken} · ${secondToken}`);

    fireEvent.click(screen.getByRole("button", { name: "Clear samples" }));
    expect(within(continuation).queryByText(/·/)).not.toBeInTheDocument();
  });

  it("changes the temperature regime and entropy readout", () => {
    render(<TokenSamplingScene step={0} resetKey={0} />);

    const temperatureSlider = screen.getByRole("slider", { name: "Temperature" });
    const defaultEntropy = entropy(softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE)).toFixed(2);
    expect(screen.getByText(new RegExp(`ENTROPY ${defaultEntropy} bits`))).toBeInTheDocument();

    fireEvent.change(temperatureSlider, { target: { value: "0.2" } });
    expect(screen.getByText(/0\.20\s*·\s*near-greedy/)).toBeInTheDocument();
    const lowEntropy = entropy(softmaxWithTemperature(LOGITS, 0.2)).toFixed(2);
    expect(screen.getByText(new RegExp(`ENTROPY ${lowEntropy} bits`))).toBeInTheDocument();
    expect(Number(lowEntropy)).toBeLessThan(Number(defaultEntropy));

    fireEvent.change(temperatureSlider, { target: { value: "2" } });
    expect(screen.getByText(/2\.00\s*·\s*adventurous/)).toBeInTheDocument();
  });

  it("greys out truncated tokens, reflected in the live status count", () => {
    render(<TokenSamplingScene step={0} resetKey={0} />);

    const status = screen.getByTestId("token-sampling-status");
    expect(status).toHaveTextContent(`${CANDIDATES.length} of ${CANDIDATES.length} tokens remain.`);

    fireEvent.click(screen.getByRole("button", { name: "Top-p" }));
    expect(screen.getByRole("button", { name: "Top-p" })).toHaveAttribute("aria-pressed", "true");

    const survivingCount = applyTopP(
      softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE),
      DEFAULT_TOP_P,
    ).survivingIndices.length;
    expect(survivingCount).toBeLessThan(CANDIDATES.length);
    expect(status).toHaveTextContent(
      `${survivingCount} of ${CANDIDATES.length} tokens remain after top-p ${DEFAULT_TOP_P.toFixed(2)}`,
    );
  });

  it("applies the guided preset for each step", () => {
    const { rerender } = render(<TokenSamplingScene step={1} resetKey={0} />);
    expect(screen.getByRole("slider", { name: "Temperature" })).toHaveValue("0.3");
    expect(screen.getByText(/0\.30\s*·\s*near-greedy/)).toBeInTheDocument();

    rerender(<TokenSamplingScene step={2} resetKey={0} />);
    expect(screen.getByRole("slider", { name: "Temperature" })).toHaveValue("1");
    expect(screen.getByRole("button", { name: "Top-p" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("slider", { name: "Top-p" })).toHaveValue(String(DEFAULT_TOP_P));

    rerender(<TokenSamplingScene step={3} resetKey={0} />);
    expect(screen.getByRole("slider", { name: "Temperature" })).toHaveValue("1.8");
    expect(screen.getByRole("button", { name: "None" })).toHaveAttribute("aria-pressed", "true");
  });

  it("clears samples on external reset", () => {
    const { rerender } = render(<TokenSamplingScene step={0} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Sample token" }));
    const continuation = screen.getByTestId("sampled-continuation");
    const firstToken = tokenAt(DEFAULT_TEMPERATURE, 0);
    expect(continuation).toHaveTextContent(firstToken);

    rerender(<TokenSamplingScene step={0} resetKey={1} />);
    expect(continuation).not.toHaveTextContent(firstToken);
    expect(screen.getByRole("slider", { name: "Temperature" })).toHaveValue(String(DEFAULT_TEMPERATURE));
  });
});
