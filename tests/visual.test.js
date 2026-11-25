import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import NewtonCotesFormulas from '@/components/Chapter5-main/NewtonCotesFormulas.vue';
import RombergIntegration from '@/components/Chapter5-main/RombergIntegration.vue';
import GaussQuadrature from '@/components/Chapter5-main/GaussQuadrature.vue';
import {
  newtonCotes,
  rombergTable,
  gaussQuadrature,
  compositeSimpson,
  compositeTrapezoid,
  dividedDiffTable,
  newtonEval,
  splineEval,
  rSquared,
  gaussSteps,
  rrefSteps,
} from '../src/utils/visual.js';
import { callMethod, mockAlert } from './helpers.js';

let alertMock;

beforeEach(() => {
  alertMock = mockAlert();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Newton-Cotes formulas', () => {
  it('reduces to the trapezoidal rule with 2 points', () => {
    const { result } = newtonCotes('x', 0, 1, 2);
    expect(result).toBeCloseTo(0.5, 12);
  });

  it('matches Simpson 1/3 with 3 points', () => {
    const { result } = newtonCotes('x^2', 0, 1, 3);
    expect(result).toBeCloseTo(1 / 3, 12);
  });

  it('matches Boole rule exactly for quartics with 5 points', () => {
    const { result } = newtonCotes('x^4', 0, 1, 5);
    expect(result).toBeCloseTo(0.2, 10);
  });

  it('component calculate stores nodes and result', () => {
    const ctx = callMethod(NewtonCotesFormulas, 'calculateNewtonCotes', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      points: 3,
      result: null,
      nodes: [],
    });

    expectClose(ctx.result, 1 / 3, 1e-12);
    expect(ctx.nodes).toHaveLength(3);
  });
});

describe('Romberg integration', () => {
  it('converges to the exact integral for a quadratic', () => {
    const { value, rows } = rombergTable('x^2', 0, 1, 3);
    expect(value).toBeCloseTo(1 / 3, 10);
    expect(rows).toHaveLength(3);
  });

  it('reports a positive error estimate for a quartic', () => {
    const { value, error } = rombergTable('x^4', 0, 1, 3);
    expect(value).toBeCloseTo(0.2, 3);
    expect(error).toBeGreaterThan(0);
  });

  it('component calculate stores the triangle rows', () => {
    const ctx = callMethod(RombergIntegration, 'calculateRomberg', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      levels: 3,
      result: null,
      error: null,
      rows: [],
    });

    expectClose(ctx.result, 1 / 3, 1e-10);
    expect(ctx.rows).toHaveLength(3);
  });
});

describe('Gauss quadrature', () => {
  it('integrates quadratics exactly with 2 points', () => {
    const { result, nodes } = gaussQuadrature('x^2', 0, 1, 2);
    expect(result).toBeCloseTo(1 / 3, 12);
    expect(nodes).toHaveLength(2);
  });

  it('integrates cubics exactly with 3 points', () => {
    const { result } = gaussQuadrature('x^3', 0, 1, 3);
    expect(result).toBeCloseTo(0.25, 12);
  });

  it('component calculate stores nodes and result', () => {
    const ctx = callMethod(GaussQuadrature, 'calculateGaussQuadrature', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      points: 3,
      result: null,
      nodes: [],
    });

    expectClose(ctx.result, 1 / 3, 1e-12);
    expect(ctx.nodes).toHaveLength(3);
  });
});

describe('visual helpers', () => {
  it('compositeSimpson integrates x^2 exactly', () => {
    expect(compositeSimpson('x^2', 0, 1, 4)).toBeCloseTo(1 / 3, 12);
  });

  it('compositeTrapezoid approximates the integral', () => {
    expect(compositeTrapezoid('x^2', 0, 1, 100)).toBeCloseTo(1 / 3, 3);
  });

  it('dividedDiffTable builds the full triangular table', () => {
    const table = dividedDiffTable([
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 5 },
    ]);

    expect(table[0]).toEqual([1, 1, 1]);
    expect(table[1]).toEqual([2, 3]);
    expect(table[2]).toEqual([5]);
  });

  it('newtonEval evaluates the Newton form', () => {
    const value = newtonEval([1, 1, 1], [0, 1, 2], 2);
    expect(value).toBe(5);
  });

  it('splineEval interpolates linear segments', () => {
    const value = splineEval(
      [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 7 },
      ],
      1.5
    );
    expect(value).toBe(5);
  });

  it('rSquared is 1 for a perfect fit', () => {
    const r2 = rSquared([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }], (x) => 1 + 2 * x);
    expect(r2).toBeCloseTo(1, 12);
  });

  it('gaussSteps records elimination snapshots', () => {
    const { steps, final } = gaussSteps([[2, 1], [5, 3]], [4, 11]);
    expect(steps.length).toBeGreaterThan(0);
    expect(final[1][0]).toBeCloseTo(0, 10);
  });

  it('rrefSteps produces the identity block', () => {
    const { final } = rrefSteps([[2, 1], [5, 3]], [4, 11]);
    expect(final[0][0]).toBeCloseTo(1, 10);
    expect(final[1][1]).toBeCloseTo(1, 10);
    expect(final[0][2]).toBeCloseTo(1, 6);
    expect(final[1][2]).toBeCloseTo(2, 6);
  });
});

function expectClose(actual, expected, precision) {
  expect(Math.abs(Number(actual) - expected)).toBeLessThanOrEqual(precision);
}
