import { describe, expect, it } from "vitest";
import {
  DATASET,
  DOMAIN,
  bag,
  bestStump,
  boost,
  decisionGrid,
  ensemble,
  predict,
  singleStumpAccuracy,
  stumpPredict,
  trainingAccuracy,
  trueBoundaryY,
} from "./model";

const uniform = () => DATASET.map(() => 1 / DATASET.length);

describe("ensembles model", () => {
  it("builds the same dataset on every run", () => {
    expect(DATASET).toHaveLength(90);
    expect(DATASET.every((point) => point.x >= DOMAIN.xMin && point.x <= DOMAIN.xMax)).toBe(true);
    expect(DATASET.every((point) => point.label === 1 || point.label === -1)).toBe(true);
    // Both classes are represented in useful numbers.
    const positives = DATASET.filter((point) => point.label === 1).length;
    expect(positives).toBeGreaterThan(20);
    expect(positives).toBeLessThan(70);
  });

  it("labels points by the diagonal it asks the stumps to approximate", () => {
    const agreeing = DATASET.filter(
      (point) => (point.y > trueBoundaryY(point.x)) === (point.label === 1),
    ).length;
    // All but the deliberately flipped few.
    expect(agreeing / DATASET.length).toBeGreaterThan(0.9);
  });

  it("cannot fit a diagonal with one axis-aligned split", () => {
    const accuracy = singleStumpAccuracy();
    expect(accuracy).toBeGreaterThan(0.6);
    expect(accuracy).toBeLessThan(0.9);
  });

  it("chooses the split that minimises weighted error", () => {
    const stump = bestStump(DATASET, uniform());
    const errorOf = (candidate: typeof stump) =>
      DATASET.filter((point) => stumpPredict(candidate, point.x, point.y) !== point.label).length;

    const chosen = errorOf(stump);
    for (const feature of [0, 1] as const) {
      for (const threshold of [1, 3, 5, 7, 9]) {
        for (const polarity of [1, -1] as const) {
          const alternative = { feature, threshold, polarity, weight: 0, weightedError: 0 };
          expect(chosen).toBeLessThanOrEqual(errorOf(alternative));
        }
      }
    }
  });

  it("responds to weights: emphasised points change which split wins", () => {
    const weights = uniform();
    const plain = bestStump(DATASET, weights);

    // Pile all the weight onto points the first stump got wrong.
    const focused = DATASET.map((point) =>
      stumpPredict(plain, point.x, point.y) === point.label ? 1e-6 : 1);
    const reweighted = bestStump(DATASET, focused);

    expect(
      reweighted.feature !== plain.feature
      || Math.abs(reweighted.threshold - plain.threshold) > 1e-9
      || reweighted.polarity !== plain.polarity,
    ).toBe(true);
  });

  it("gives boosting a positive vote weight that falls as error rises", () => {
    const learners = boost(6);
    expect(learners).toHaveLength(6);
    expect(learners.every((stump) => stump.weight > 0)).toBe(true);
    // The first round works on unweighted data, so it is the most accurate.
    expect(learners[0].weightedError).toBeLessThan(0.5);
  });

  it("improves on a single stump under boosting, but not under bagging", () => {
    const single = singleStumpAccuracy();
    const boosted = trainingAccuracy(boost(12));
    const bagged = trainingAccuracy(bag(12));

    expect(boosted).toBeGreaterThan(single);
    expect(boosted).toBeGreaterThan(bagged);
    // Bagging addresses variance, and a stump on ninety points has almost none.
    expect(bagged).toBeLessThanOrEqual(single);
  });

  it("leaves bagging flat however many stumps are added, which is the lesson", () => {
    const counts = [2, 5, 12, 20, 30].map((rounds) => trainingAccuracy(bag(rounds)));
    const spread = Math.max(...counts) - Math.min(...counts);
    expect(spread).toBeLessThan(0.03);
  });

  it("votes the same way as one stump, which is why bagging is flat", () => {
    const bagged = bag(20);
    const single = [{ ...bestStump(DATASET, uniform()), weight: 1 }];

    // Every resample picks the same axis to split on...
    expect(new Set(bagged.map((stump) => stump.feature)).size).toBe(1);

    // ...and although the thresholds vary, the majority vote lands where a
    // single stump does across almost the whole feature space. There is no
    // disagreement for bagging to average away.
    let agreements = 0;
    let total = 0;
    for (let column = 0; column < 40; column += 1) {
      for (let row = 0; row < 24; row += 1) {
        const x = DOMAIN.xMin + ((column + 0.5) / 40) * (DOMAIN.xMax - DOMAIN.xMin);
        const y = DOMAIN.yMin + ((row + 0.5) / 24) * (DOMAIN.yMax - DOMAIN.yMin);
        if (predict(bagged, x, y) === predict(single, x, y)) agreements += 1;
        total += 1;
      }
    }
    expect(agreements / total).toBeGreaterThan(0.9);
  });

  it("keeps improving boosting as rounds accumulate", () => {
    const few = trainingAccuracy(boost(3));
    const many = trainingAccuracy(boost(25));
    expect(many).toBeGreaterThanOrEqual(few);
    expect(many).toBeGreaterThan(0.85);
  });

  it("gives every bagged stump an equal vote", () => {
    const learners = bag(8);
    expect(new Set(learners.map((stump) => stump.weight))).toEqual(new Set([1]));
  });

  it("produces identical ensembles on repeated runs", () => {
    expect(boost(9)).toEqual(boost(9));
    expect(bag(9)).toEqual(bag(9));
    expect(ensemble("boosting", 5)).toEqual(boost(5));
    expect(ensemble("bagging", 5)).toEqual(bag(5));
  });

  it("agrees between the grid margin and the prediction it implies", () => {
    const learners = boost(10);
    const { columns, rows, cells } = decisionGrid(learners, 12, 8);
    expect(cells).toHaveLength(columns * rows);

    cells.forEach((margin, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = DOMAIN.xMin + ((column + 0.5) / columns) * (DOMAIN.xMax - DOMAIN.xMin);
      const y = DOMAIN.yMin + ((row + 0.5) / rows) * (DOMAIN.yMax - DOMAIN.yMin);
      expect(margin >= 0).toBe(predict(learners, x, y) === 1);
      expect(Math.abs(margin)).toBeLessThanOrEqual(1 + 1e-9);
    });
  });

  it("returns no learners, and no confidence, for a zero-round ensemble", () => {
    expect(boost(0)).toEqual([]);
    expect(trainingAccuracy([])).toBe(0);
    expect(decisionGrid([], 4, 4).cells.every((value) => value === 0)).toBe(true);
  });
});
