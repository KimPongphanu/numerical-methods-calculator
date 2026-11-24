import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BisectionMethodComponent from '@/components/Chapter1-main/BisectionMethod.vue';
import FalsePositionMethod from '@/components/Chapter1-main/FalsePositionMethod.vue';
import NewtonRaphson from '@/components/Chapter1-main/NewtonRaphson.vue';
import OnePointIteration from '@/components/Chapter1-main/OnePointIteration.vue';
import SecantMethod from '@/components/Chapter1-main/SecantMethod.vue';
import BisectionSolver from '../src/utils/Bisection.js';
import { callMethod, stubRandom, expectCloseTo, mockAlert } from './helpers.js';

let alertMock;

beforeEach(() => {
  alertMock = mockAlert();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const SIX_DECIMALS = /^-?\d+\.\d{6}$/;

describe('BisectionMethod.vue', () => {
  it('has the expected default input state', () => {
    const data = BisectionMethodComponent.data.call({});
    expect(data.functionInput).toBe('x^2 - 4');
    expect(data.lowerBound).toBe(0);
    expect(data.upperBound).toBe(3);
    expect(data.tolerance).toBe(0.001);
    expect(data.iterations).toEqual([]);
    expect(data.randomFunctions).toHaveLength(8);
  });

  it('randomFunction picks a function from the list', () => {
    stubRandom(0);
    const ctx = callMethod(BisectionMethodComponent, 'randomFunction');
    expect(ctx.functionInput).toBe('x^3 - 2*x - 5');
  });

  it('calculateBisection finds the root of x^2 - 4 on [0, 3]', () => {
    const ctx = callMethod(BisectionMethodComponent, 'calculateBisection', {
      functionInput: 'x^2 - 4',
      lowerBound: 0,
      upperBound: 3,
      tolerance: 0.001,
    });

    expectCloseTo(ctx.result, 2, 0.002);
    expect(ctx.iterations.length).toBeGreaterThan(0);
    expect(ctx.iterations.every((row) => SIX_DECIMALS.test(row.c) && SIX_DECIMALS.test(row.fc))).toBe(true);
    expect(Math.abs(Number(ctx.iterations.at(-1).fc))).toBeLessThan(0.01);
  });

  it('calculateBisection stops immediately when f(c) is exactly zero', () => {
    const ctx = callMethod(BisectionMethodComponent, 'calculateBisection', {
      functionInput: 'x',
      lowerBound: -1,
      upperBound: 1,
      tolerance: 0.001,
    });

    expect(ctx.result).toBe('0.000000');
    expect(ctx.iterations).toHaveLength(1);
    expect(ctx.iterations[0].fc).toBe('0.000000');
  });

  it('alerts when the bounds do not bracket a root', () => {
    const ctx = callMethod(BisectionMethodComponent, 'calculateBisection', {
      functionInput: 'x^2 + 1',
      lowerBound: 0,
      upperBound: 3,
      tolerance: 0.001,
      iterations: [],
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.iterations).toEqual([]);
    expect(ctx.result).toBeNull();
  });

  it('alerts when the function is not finite at a bound', () => {
    const ctx = callMethod(BisectionMethodComponent, 'calculateBisection', {
      functionInput: 'log(x) - 1',
      lowerBound: 0,
      upperBound: 3,
      tolerance: 0.001,
      iterations: [],
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.iterations).toEqual([]);
    expect(ctx.result).toBeNull();
  });
});

describe('FalsePositionMethod.vue', () => {
  it('randomFunction picks the first function when Math.random is 0', () => {
    stubRandom(0);
    const ctx = callMethod(FalsePositionMethod, 'randomFunction');
    expect(ctx.functionInput).toBe('x^3 - 2*x - 5');
  });

  it('calculateFalsePosition finds the root of x^2 - 4 on [0, 3]', () => {
    const ctx = callMethod(FalsePositionMethod, 'calculateFalsePosition', {
      functionInput: 'x^2 - 4',
      lowerBound: 0,
      upperBound: 3,
      tolerance: 0.001,
    });

    expectCloseTo(ctx.result, 2, 0.01);
    expect(ctx.iterations.length).toBeGreaterThan(1);
    expect(ctx.iterations.every((row) => SIX_DECIMALS.test(row.a) && SIX_DECIMALS.test(row.c))).toBe(true);
    expect(Math.abs(Number(ctx.iterations.at(-1).fc))).toBeLessThanOrEqual(0.001);
  });

  it('calculateFalsePosition returns a bound that is already a root', () => {
    const ctx = callMethod(FalsePositionMethod, 'calculateFalsePosition', {
      functionInput: 'x',
      lowerBound: 0,
      upperBound: 2,
      tolerance: 0.001,
    });

    expect(ctx.result).toBe('0.000000');
    expect(ctx.iterations).toHaveLength(1);
  });

  it('alerts when the bounds do not bracket a root', () => {
    const ctx = callMethod(FalsePositionMethod, 'calculateFalsePosition', {
      functionInput: 'x^2 + 1',
      lowerBound: 0,
      upperBound: 3,
      tolerance: 0.001,
      iterations: [],
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.iterations).toEqual([]);
    expect(ctx.result).toBeNull();
  });
});

describe('NewtonRaphson.vue', () => {
  it('randomFunction sets both f(x) and f\'(x)', () => {
    stubRandom(0);
    const ctx = callMethod(NewtonRaphson, 'randomFunction');
    expect(ctx.functionInput).toBe('x^3 - 2*x - 5');
    expect(ctx.derivativeInput).toBe('3*x^2 - 2');
  });

  it('calculateNewtonRaphson converges to 2 for x^2 - 4 starting at x0 = 1', () => {
    const ctx = callMethod(NewtonRaphson, 'calculateNewtonRaphson', {
      functionInput: 'x^2 - 4',
      derivativeInput: '2 * x',
      initialGuess: 1,
      tolerance: 0.001,
    });

    expectCloseTo(ctx.result, 2, 1e-6);
    expect(ctx.iterations.length).toBeGreaterThan(1);
    expect(ctx.iterations.every((row) => SIX_DECIMALS.test(row.x) && SIX_DECIMALS.test(row.fx))).toBe(true);
  });

  it('calculateNewtonRaphson converges in one step when x0 is already a root', () => {
    const ctx = callMethod(NewtonRaphson, 'calculateNewtonRaphson', {
      functionInput: 'x^2 - 4',
      derivativeInput: '2 * x',
      initialGuess: 2,
      tolerance: 0.001,
    });

    expect(ctx.result).toBe('2.000000');
    expect(ctx.iterations).toHaveLength(1);
  });

  it('calculateNewtonRaphson stops gracefully when the derivative is zero', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = callMethod(NewtonRaphson, 'calculateNewtonRaphson', {
      functionInput: 'x^2 + 1',
      derivativeInput: '2 * x',
      initialGuess: 0,
      tolerance: 0.001,
    });

    expect(ctx.result).toBe('0.000000');
    expect(ctx.iterations).toEqual([]);
  });
});

describe('OnePointIteration.vue', () => {
  it('randomFunction picks the first fixed-point function', () => {
    stubRandom(0);
    const ctx = callMethod(OnePointIteration, 'randomFunction');
    expect(ctx.functionInput).toBe('cos(x)');
  });

  it('calculateIteration converges for g(x) = sqrt(4 - x) from x0 = 1', () => {
    const ctx = callMethod(OnePointIteration, 'calculateIteration', {
      functionInput: 'sqrt(4 - x)',
      initialGuess: 1,
      tolerance: 0.001,
    });

    const expectedRoot = (-1 + Math.sqrt(17)) / 2;
    expectCloseTo(ctx.result, expectedRoot, 0.002);
    expect(ctx.iterations.length).toBeGreaterThan(1);
    expect(ctx.iterations.every((row) => SIX_DECIMALS.test(row.x) && SIX_DECIMALS.test(row.gx))).toBe(true);
  });
});

describe('SecantMethod.vue', () => {
  it('randomFunction picks the first function', () => {
    stubRandom(0);
    const ctx = callMethod(SecantMethod, 'randomFunction');
    expect(ctx.functionInput).toBe('x^3 - 2*x - 5');
  });

  it('calculateSecant finds the root of x^2 - 4 for x0 = 0, x1 = 3', () => {
    const ctx = callMethod(SecantMethod, 'calculateSecant', {
      functionInput: 'x^2 - 4',
      x0: 0,
      x1: 3,
      tolerance: 0.001,
    });

    expectCloseTo(ctx.result, 2, 0.001);
    expect(ctx.iterations.length).toBeGreaterThan(1);
    expect(ctx.iterations.every((row) => SIX_DECIMALS.test(row.x2) && SIX_DECIMALS.test(row.fx2))).toBe(true);
  });

  it('calculateSecant handles a zero secant slope when a guess is a root', () => {
    const ctx = callMethod(SecantMethod, 'calculateSecant', {
      functionInput: 'x',
      x0: 0,
      x1: 1,
      tolerance: 0.001,
    });

    expect(ctx.result).toBe('0.000000');
    expect(ctx.iterations[0].fx2).toBe('0.000000');
  });
});

describe('utils/Bisection.js', () => {
  it('solve returns a root within tolerance', () => {
    const solver = new BisectionSolver('x^2 - 4', 0, 3, 1e-6, 100);
    const solution = solver.solve();

    expectCloseTo(solution.root, 2, 1e-6);
    expect(solution.error).toBeLessThanOrEqual(1e-6);
    expect(solution.iterations).toBeGreaterThan(0);
    expect(solution.iterations).toBeLessThanOrEqual(100);
  });

  it('solve throws when the bounds do not bracket a root', () => {
    const solver = new BisectionSolver('x^2 + 1', -1, 1, 1e-6, 100);

    expect(() => solver.solve()).toThrow(
      'The function must have different signs at the bounds a and b.'
    );
  });

  it('solve respects maxIterations when tolerance is unreachable', () => {
    const solver = new BisectionSolver('x^2 - 4', 0, 3, 0, 5);
    const solution = solver.solve();

    expect(solution.iterations).toBe(5);
    expect(solution.error).toBeGreaterThan(0);
  });

  it('solve stops early when the midpoint is an exact root', () => {
    const solver = new BisectionSolver('x', -1, 1, 1e-6, 100);
    const solution = solver.solve();

    expect(solution.root).toBe(0);
    expect(solution.iterations).toBe(0);
  });
});
