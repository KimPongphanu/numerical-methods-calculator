import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import NewtonsDividedDifferences from '@/components/Chapter3-main/NewtonsDividedDifferences.vue';
import LagrangePolynomials from '@/components/Chapter3-main/LagrangePolynomials.vue';
import SplineInterpolation from '@/components/Chapter3-main/SplineInterpolation.vue';
import LinearRegression from '@/components/Chapter4-main/LinearRegression.vue';
import PolynomialRegression from '@/components/Chapter4-main/PolynomialRegression.vue';
import MultipleLinearRegression from '@/components/Chapter4-main/MultipleLinearRegression.vue';
import { callMethod, callComputed, stubRandom, expectCloseTo, mockAlert } from './helpers.js';

let alertMock;

beforeEach(() => {
  alertMock = mockAlert();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('NewtonsDividedDifferences', () => {
  it('initializeData creates the requested number of empty points', () => {
    const ctx = callMethod(NewtonsDividedDifferences, 'initializeData', { numPoints: 3 });
    expect(ctx.dataPoints).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('randomizeDataPoints fills every point with two-decimal values', () => {
    stubRandom(0.5);
    const ctx = callMethod(NewtonsDividedDifferences, 'randomizeDataPoints', {
      dataPoints: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    });

    expect(ctx.dataPoints).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it('calculateDividedDifferences returns [1, 1, 1] for (0,1), (1,2), (2,5)', () => {
    const ctx = callMethod(NewtonsDividedDifferences, 'calculateDividedDifferences', {
      numPoints: 3,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 5 },
      ],
    });

    expect(ctx.coefficients).toEqual([1, 1, 1]);
  });

  it('calculateDividedDifferences returns the leading coefficient for a quadratic', () => {
    const ctx = callMethod(NewtonsDividedDifferences, 'calculateDividedDifferences', {
      numPoints: 4,
      dataPoints: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 4 },
        { x: 3, y: 9 },
      ],
    });

    expect(ctx.coefficients).toEqual([0, 1, 1, 0]);
  });

  it('alerts and returns no coefficients when x values are duplicated', () => {
    const ctx = callMethod(NewtonsDividedDifferences, 'calculateDividedDifferences', {
      numPoints: 3,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
      ],
      coefficients: [9, 9],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.coefficients).toEqual([]);
  });
});

describe('LagrangePolynomials', () => {
  it('initializeData creates the requested number of points', () => {
    const ctx = callMethod(LagrangePolynomials, 'initializeData', { numPoints: 2 });
    expect(ctx.dataPoints).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('randomizeDataPoints fills every point', () => {
    stubRandom(0.5);
    const ctx = callMethod(LagrangePolynomials, 'randomizeDataPoints', {
      dataPoints: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    });

    expect(ctx.dataPoints).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it('calculateLagrangePolynomial builds the expected polynomial string', () => {
    const ctx = callMethod(LagrangePolynomials, 'calculateLagrangePolynomial', {
      numPoints: 2,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
      ],
    });

    expect(ctx.polynomial).toBe(
      '(1 * (x - 1.00) / (-1.000000)) + (2 * (x - 0.00) / (1.000000))'
    );
  });

  it('alerts and leaves the polynomial empty when x values are duplicated', () => {
    const ctx = callMethod(LagrangePolynomials, 'calculateLagrangePolynomial', {
      numPoints: 2,
      dataPoints: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      polynomial: '',
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.polynomial).toBe('');
  });

  it('formattedPolynomial normalises signs, repeated spaces and parentheses', () => {
    const formatted = callComputed(LagrangePolynomials, 'formattedPolynomial', {
      polynomial: '5 + -3 * (x) / (2)',
    });

    expect(formatted).toBe('5 - 3 * (x)/(2)');
  });

  it('formattedPolynomial cleans the polynomial produced by the calculation', () => {
    const formatted = callComputed(LagrangePolynomials, 'formattedPolynomial', {
      polynomial:
        '(1 * (x - 1.00) / (-1.000000)) + (2 * (x - 0.00) / (1.000000))',
    });

    expect(formatted).toBe(
      '(1 * (x - 1.00)/(-1.000000)) + (2 * (x - 0.00)/(1.000000))'
    );
  });
});

describe('SplineInterpolation', () => {
  it('initializeData creates empty points', () => {
    const ctx = callMethod(SplineInterpolation, 'initializeData', { numPoints: 2 });
    expect(ctx.dataPoints).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('randomizeDataPoints fills every point', () => {
    stubRandom(0.5);
    const ctx = callMethod(SplineInterpolation, 'randomizeDataPoints', {
      dataPoints: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    });

    expect(ctx.dataPoints).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it('calculateSplineInterpolation builds one linear spline per segment', () => {
    const ctx = callMethod(SplineInterpolation, 'calculateSplineInterpolation', {
      numPoints: 3,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 7 },
      ],
    });

    expect(ctx.splines).toEqual([
      'y = 2.000000 * (x - 0.00) + 1.000000',
      'y = 4.000000 * (x - 1.00) + 3.000000',
    ]);
  });

  it('alerts and returns no splines when x values are duplicated', () => {
    const ctx = callMethod(SplineInterpolation, 'calculateSplineInterpolation', {
      numPoints: 3,
      dataPoints: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      splines: ['old'],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.splines).toEqual([]);
  });
});

describe('LinearRegression', () => {
  it('initializeData creates empty points', () => {
    const ctx = callMethod(LinearRegression, 'initializeData', { numPoints: 3 });
    expect(ctx.dataPoints).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('randomizeDataPoints fills every point', () => {
    stubRandom(0.5);
    const ctx = callMethod(LinearRegression, 'randomizeDataPoints', {
      dataPoints: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    });

    expect(ctx.dataPoints).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it('calculateLinearRegression recovers y = 2x + 1 exactly', () => {
    const ctx = callMethod(LinearRegression, 'calculateLinearRegression', {
      numPoints: 3,
      dataPoints: [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ],
    });

    expect(ctx.regressionEquation).toBe('y = 2.000000 * x + 1.000000');
  });

  it('calculateLinearRegression computes least-squares values', () => {
    const ctx = callMethod(LinearRegression, 'calculateLinearRegression', {
      numPoints: 3,
      dataPoints: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 4 },
      ],
    });

    expect(ctx.regressionEquation).toBe('y = 1.500000 * x + -0.666667');
  });

  it('alerts when all x values are equal', () => {
    const ctx = callMethod(LinearRegression, 'calculateLinearRegression', {
      numPoints: 3,
      dataPoints: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
      ],
      regressionEquation: 'old equation',
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.regressionEquation).toBe('');
  });
});

describe('PolynomialRegression', () => {
  it('initializeData creates empty points', () => {
    const ctx = callMethod(PolynomialRegression, 'initializeData', { numPoints: 2 });
    expect(ctx.dataPoints).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('randomizeDataPoints fills every point', () => {
    stubRandom(0.5);
    const ctx = callMethod(PolynomialRegression, 'randomizeDataPoints', {
      dataPoints: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    });

    expect(ctx.dataPoints).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it('calculatePolynomialRegression fits a quadratic exactly', () => {
    const ctx = callMethod(PolynomialRegression, 'calculatePolynomialRegression', {
      numPoints: 3,
      degree: 2,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 5 },
      ],
      coefficients: [],
    });

    expectCloseTo(ctx.coefficients[0], 1, 1e-9);
    expectCloseTo(ctx.coefficients[1], 0, 1e-9);
    expectCloseTo(ctx.coefficients[2], 1, 1e-9);
  });

  it('calculatePolynomialRegression fits a line when degree is 1', () => {
    const ctx = callMethod(PolynomialRegression, 'calculatePolynomialRegression', {
      numPoints: 3,
      degree: 1,
      dataPoints: [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ],
      coefficients: [],
    });

    expectCloseTo(ctx.coefficients[0], 1, 1e-9);
    expectCloseTo(ctx.coefficients[1], 2, 1e-9);
  });

  it('alerts when there are not enough data points for the degree', () => {
    const ctx = callMethod(PolynomialRegression, 'calculatePolynomialRegression', {
      numPoints: 2,
      degree: 2,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
      ],
      coefficients: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.coefficients).toEqual([]);
  });

  it('alerts when x values are duplicated', () => {
    const ctx = callMethod(PolynomialRegression, 'calculatePolynomialRegression', {
      numPoints: 3,
      degree: 2,
      dataPoints: [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 5 },
      ],
      coefficients: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.coefficients).toEqual([]);
  });
});

describe('MultipleLinearRegression', () => {
  it('initializeData creates points with the requested feature count', () => {
    const ctx = callMethod(MultipleLinearRegression, 'initializeData', {
      numPoints: 3,
      numFeatures: 2,
    });

    expect(ctx.dataPoints).toEqual([
      { features: [0, 0], y: 0 },
      { features: [0, 0], y: 0 },
      { features: [0, 0], y: 0 },
    ]);
  });

  it('randomizeDataPoints fills features and y', () => {
    stubRandom(0.5);
    const ctx = callMethod(MultipleLinearRegression, 'randomizeDataPoints', {
      dataPoints: [
        { features: [0, 0], y: 0 },
        { features: [0, 0], y: 0 },
      ],
    });

    expect(ctx.dataPoints).toEqual([
      { features: [5, 5], y: 5 },
      { features: [5, 5], y: 5 },
    ]);
  });

  it('calculateMultipleLinearRegression recovers y = 2 + a + 3b', () => {
    const ctx = callMethod(MultipleLinearRegression, 'calculateMultipleLinearRegression', {
      numPoints: 4,
      numFeatures: 2,
      dataPoints: [
        { features: [0, 0], y: 2 },
        { features: [1, 0], y: 3 },
        { features: [0, 1], y: 5 },
        { features: [1, 1], y: 6 },
      ],
    });

    expectCloseTo(ctx.coefficients[0], 2, 1e-9);
    expectCloseTo(ctx.coefficients[1], 1, 1e-9);
    expectCloseTo(ctx.coefficients[2], 3, 1e-9);
  });

  it('alerts when the normal equation matrix is singular', () => {
    const ctx = callMethod(MultipleLinearRegression, 'calculateMultipleLinearRegression', {
      numPoints: 2,
      numFeatures: 2,
      dataPoints: [
        { features: [0, 0], y: 1 },
        { features: [1, 1], y: 2 },
      ],
      coefficients: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.coefficients).toEqual([]);
  });
});
