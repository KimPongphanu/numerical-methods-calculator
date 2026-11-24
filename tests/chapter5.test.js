import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TrapezoidalRule from '@/components/Chapter5-main/TrapezoidalRule.vue';
import CompositeTrapezoidalRule from '@/components/Chapter5-main/CompositeTrapezoidalRule.vue';
import SimpsonRule from '@/components/Chapter5-main/SimpsonRule.vue';
import CompositeSimpsonRule from '@/components/Chapter5-main/CompositeSimpsonRule.vue';
import { callMethod, stubRandom, expectCloseTo, mockAlert } from './helpers.js';

let alertMock;

beforeEach(() => {
  alertMock = mockAlert();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TrapezoidalRule single application', () => {
  it('integrates x^2 on [0, 1] using only the endpoints', () => {
    const ctx = callMethod(TrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
    });

    expectCloseTo(ctx.result, 0.5, 1e-12);
  });

  it('uses one trapezoid even for a cubic function', () => {
    const ctx = callMethod(TrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^3',
      lowerLimit: 0,
      upperLimit: 1,
    });

    expectCloseTo(ctx.result, 0.5, 1e-12);
  });

  it('integrates x^2 + 3 on [0, 1] exactly', () => {
    const ctx = callMethod(TrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^2 + 3',
      lowerLimit: 0,
      upperLimit: 1,
    });

    expectCloseTo(ctx.result, 3.5, 1e-12);
  });

  it('alerts and leaves result null for an invalid function', () => {
    const ctx = callMethod(TrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^',
      lowerLimit: 0,
      upperLimit: 1,
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });

  it('alerts and leaves result null when the function is empty', () => {
    const ctx = callMethod(TrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: '',
      lowerLimit: 0,
      upperLimit: 1,
      result: 0.5,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });

  it('randomizeFunction picks a preset function', () => {
    stubRandom(0);
    const ctx = callMethod(TrapezoidalRule, 'randomizeFunction');
    expect(ctx.functionExpression).toBe('x^2 + 3');
  });

  it('randomizeDataPoints creates a valid interval without interval count', () => {
    stubRandom(0.5);
    const ctx = callMethod(TrapezoidalRule, 'randomizeDataPoints', {
      lowerLimit: 0,
      upperLimit: 1,
    });

    expect(ctx.lowerLimit).toBe(5);
    expect(ctx.upperLimit).toBe(10);
    expect(ctx.numIntervals).toBeUndefined();
  });
});

describe('CompositeTrapezoidalRule', () => {
  it('integrates x^2 on [0, 1] with one interval', () => {
    const ctx = callMethod(CompositeTrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 1,
    });

    expectCloseTo(ctx.result, 0.5, 1e-12);
  });

  it('integrates x^2 on [0, 1] with two intervals', () => {
    const ctx = callMethod(CompositeTrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 2,
    });

    expectCloseTo(ctx.result, 0.375, 1e-12);
  });

  it('alerts and leaves result null for an invalid function', () => {
    const ctx = callMethod(CompositeTrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: 'x^',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 2,
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });

  it('alerts and leaves result null when the function is empty', () => {
    const ctx = callMethod(CompositeTrapezoidalRule, 'calculateTrapezoidalRule', {
      functionExpression: '',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 2,
      result: 0.5,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });
});

describe('Composite Simpson and Composite Trapezoidal randomizers', () => {
  it.each([
    ['CompositeTrapezoidalRule', CompositeTrapezoidalRule],
    ['CompositeSimpsonRule', CompositeSimpsonRule],
  ])('%s randomizeFunctionAndData sets function, interval and even n', (_name, component) => {
    stubRandom(0.5);
    const ctx = callMethod(component, 'randomizeFunctionAndData', {
      functionExpression: '',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 1,
    });

    expect(ctx.functionExpression).toBe('x^3 - 4*x + 1');
    expect(ctx.lowerLimit).toBe(5);
    expect(ctx.upperLimit).toBe(10);
    expect(ctx.numIntervals % 2).toBe(0);
  });
});

describe('SimpsonRule single application', () => {
  it('integrates x^2 on [0, 1] exactly with the fixed two-subinterval rule', () => {
    const ctx = callMethod(SimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
    });

    expectCloseTo(ctx.result, 1 / 3, 1e-12);
  });

  it('uses exactly two subintervals for a quartic function', () => {
    const ctx = callMethod(SimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: 'x^4',
      lowerLimit: 0,
      upperLimit: 1,
    });

    expectCloseTo(ctx.result, 0.20833333333333334, 1e-12);
  });

  it('alerts and leaves result null for an invalid function', () => {
    const ctx = callMethod(SimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: 'x^',
      lowerLimit: 0,
      upperLimit: 1,
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });

  it('alerts and leaves result null when the function is empty', () => {
    const ctx = callMethod(SimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: '',
      lowerLimit: 0,
      upperLimit: 1,
      result: 0.5,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });

  it('randomizeFunctionAndData sets function and interval without an interval count', () => {
    stubRandom(0.5);
    const ctx = callMethod(SimpsonRule, 'randomizeFunctionAndData', {
      functionExpression: '',
      lowerLimit: 0,
      upperLimit: 1,
    });

    expect(ctx.functionExpression).toBe('x^3 - 4*x + 1');
    expect(ctx.lowerLimit).toBe(5);
    expect(ctx.upperLimit).toBe(10);
    expect(ctx.numIntervals).toBeUndefined();
  });
});

describe('CompositeSimpsonRule', () => {
  it('integrates x^2 on [0, 1] exactly with two intervals', () => {
    const ctx = callMethod(CompositeSimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 2,
    });

    expectCloseTo(ctx.result, 1 / 3, 1e-12);
  });

  it('integrates x^2 on [0, 1] exactly with four intervals', () => {
    const ctx = callMethod(CompositeSimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 4,
    });

    expectCloseTo(ctx.result, 1 / 3, 1e-12);
  });

  it('alerts and leaves result null when the interval count is odd', () => {
    const ctx = callMethod(CompositeSimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: 'x^2',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 3,
      result: null,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });

  it('alerts and leaves result null when the function is empty', () => {
    const ctx = callMethod(CompositeSimpsonRule, 'calculateSimpsonsRule', {
      functionExpression: '',
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 2,
      result: 0.5,
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.result).toBeNull();
  });
});
