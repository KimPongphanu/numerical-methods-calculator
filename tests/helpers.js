import { expect, vi } from 'vitest';

export function createContext(component, overrides = {}) {
  const initialData = typeof component.data === 'function' ? component.data.call({}) : {};
  return { ...initialData, ...overrides };
}

export function callMethod(component, methodName, overrides = {}) {
  const context = createContext(component, overrides);
  component.methods[methodName].call(context);
  return context;
}

export function callComputed(component, computedName, overrides = {}) {
  return component.computed[computedName].call(overrides);
}

export function stubRandom(value) {
  return vi.spyOn(Math, 'random').mockReturnValue(value);
}

export function expectCloseTo(actual, expected, precision = 1e-6) {
  expect(Math.abs(Number(actual) - expected)).toBeLessThanOrEqual(precision);
}

export function mockAlert() {
  const alertMock = vi.fn();
  vi.stubGlobal('alert', alertMock);
  return alertMock;
}
