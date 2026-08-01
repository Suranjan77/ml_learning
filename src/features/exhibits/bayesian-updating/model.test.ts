import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRIOR_MEAN,
  DEFAULT_PRIOR_STRENGTH,
  GRID_STEPS,
  betaPdf,
  credibleInterval,
  describe as describeDistribution,
  grid,
  likelihoodCurve,
  logGamma,
  priorFrom,
  update,
} from "./model";

const integrate = (density: readonly number[]) =>
  density.reduce((sum, value) => sum + value / (GRID_STEPS - 1), 0);

describe("bayesian updating model", () => {
  it("evaluates log-gamma against known factorials", () => {
    expect(Math.exp(logGamma(1))).toBeCloseTo(1, 6);
    expect(Math.exp(logGamma(5))).toBeCloseTo(24, 4);
    expect(Math.exp(logGamma(0.5))).toBeCloseTo(Math.sqrt(Math.PI), 6);
  });

  it("produces densities that integrate to one", () => {
    for (const parameters of [{ alpha: 2, beta: 5 }, { alpha: 12, beta: 12 }, { alpha: 30, beta: 4 }]) {
      expect(integrate(grid.map((x) => betaPdf(x, parameters)))).toBeCloseTo(1, 2);
    }
  });

  it("builds a prior whose mean is the mean the learner asked for", () => {
    for (const mean of [0.1, 0.3, 0.5, 0.85]) {
      const prior = priorFrom(mean, 24);
      expect(prior.alpha / (prior.alpha + prior.beta)).toBeCloseTo(mean, 10);
      expect(prior.alpha + prior.beta).toBeCloseTo(24, 10);
    }
  });

  it("narrows the prior as its strength rises, holding the mean still", () => {
    const weak = describeDistribution(priorFrom(0.4, 4));
    const strong = describeDistribution(priorFrom(0.4, 60));
    expect(weak.mean).toBeCloseTo(strong.mean, 10);
    expect(strong.standardDeviation).toBeLessThan(weak.standardDeviation);
  });

  it("leaves the posterior equal to the prior when nothing has been observed", () => {
    const { prior, posterior, maximumLikelihood, dataInfluence } =
      update(DEFAULT_PRIOR_MEAN, DEFAULT_PRIOR_STRENGTH, 0, 0.7);
    expect(posterior).toEqual(prior);
    expect(maximumLikelihood).toBeNull();
    expect(dataInfluence).toBe(0);
  });

  it("adds observed counts straight onto the prior, which is what conjugacy means", () => {
    const { prior, posterior, successes, failures } = update(0.3, 20, 50, 0.8);
    expect(successes).toBe(40);
    expect(failures).toBe(10);
    expect(posterior.alpha).toBeCloseTo(prior.alpha + 40, 10);
    expect(posterior.beta).toBeCloseTo(prior.beta + 10, 10);
  });

  it("drags the posterior from the prior towards the data as evidence accumulates", () => {
    const meanOf = (observations: number) => {
      const { posterior } = update(0.3, 20, observations, 0.8);
      return posterior.alpha / (posterior.alpha + posterior.beta);
    };

    const none = meanOf(0);
    const few = meanOf(10);
    const many = meanOf(200);

    expect(none).toBeCloseTo(0.3, 10);
    expect(few).toBeGreaterThan(none);
    expect(many).toBeGreaterThan(few);
    // With plenty of data the posterior all but ignores the prior.
    expect(many).toBeGreaterThan(0.75);
  });

  it("lets a confident prior resist the same evidence a diffuse one accepts", () => {
    const diffuse = update(0.3, 2, 20, 0.8);
    const confident = update(0.3, 80, 20, 0.8);
    expect(diffuse.dataInfluence).toBeGreaterThan(confident.dataInfluence);
  });

  it("reports the data's own answer separately from the posterior", () => {
    const { maximumLikelihood, posterior } = update(0.3, 20, 40, 0.75);
    expect(maximumLikelihood).toBeCloseTo(0.75, 10);
    // The posterior sits between the prior mean and the likelihood peak.
    const posteriorMean = posterior.alpha / (posterior.alpha + posterior.beta);
    expect(posteriorMean).toBeGreaterThan(0.3);
    expect(posteriorMean).toBeLessThan(0.75);
  });

  it("tightens the credible interval as evidence accumulates", () => {
    const width = (observations: number) => {
      const { posterior } = update(0.5, 4, observations, 0.6);
      const [low, high] = credibleInterval(posterior);
      return high - low;
    };
    expect(width(200)).toBeLessThan(width(20));
    expect(width(20)).toBeLessThan(width(0));
  });

  it("peaks the likelihood at the observed proportion", () => {
    const curve = likelihoodCurve(30, 10);
    const peakIndex = curve.indexOf(Math.max(...curve));
    expect(grid[peakIndex]).toBeCloseTo(0.75, 2);
  });

  it("draws no likelihood at all before anything is observed", () => {
    expect(likelihoodCurve(0, 0).every((value) => value === 0)).toBe(true);
  });
});
