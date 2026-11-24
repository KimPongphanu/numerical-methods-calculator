import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CramersRule from '@/components/Chapter2-main/CramersRule.vue';
import GaussElimination from '@/components/Chapter2-main/GaussElimination.vue';
import GaussJordanMethod from '@/components/Chapter2-main/GaussJordanMethod.vue';
import InverseMatrixMethod from '@/components/Chapter2-main/InverseMatrixMethod.vue';
import LuDecompositionMethod from '@/components/Chapter2-main/LuDecompositionMethod.vue';
import CholeskyDecompositionMethod from '@/components/Chapter2-main/CholeskyDecompositionMethod.vue';
import JacobiIterationMethod from '@/components/Chapter2-main/JacobiIterationMethod.vue';
import GaussSeidelIterationMethod from '@/components/Chapter2-main/GaussSeidelIterationMethod.vue';
import ConjugateGradientMethod from '@/components/Chapter2-main/ConjugateGradientMethod.vue';
import { callMethod, stubRandom, expectCloseTo, mockAlert } from './helpers.js';

let alertMock;

beforeEach(() => {
  alertMock = mockAlert();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const allLinearComponents = [
  ['CramersRule', CramersRule],
  ['GaussElimination', GaussElimination],
  ['GaussJordanMethod', GaussJordanMethod],
  ['InverseMatrixMethod', InverseMatrixMethod],
  ['LuDecompositionMethod', LuDecompositionMethod],
  ['CholeskyDecompositionMethod', CholeskyDecompositionMethod],
  ['JacobiIterationMethod', JacobiIterationMethod],
  ['GaussSeidelIterationMethod', GaussSeidelIterationMethod],
  ['ConjugateGradientMethod', ConjugateGradientMethod],
];

describe.each(allLinearComponents)('%s shared matrix helpers', (_name, component) => {
  it('initializeMatrices creates square A and vector B of size n', () => {
    const ctx = callMethod(component, 'initializeMatrices', { numVariables: 3 });
    expect(ctx.matrixA).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(ctx.vectorB).toEqual([0, 0, 0]);
  });

  it('initializeMatrices keeps the current matrix size', () => {
    const ctx = callMethod(component, 'initializeMatrices', { numVariables: 2 });
    expect(ctx.matrixA).toHaveLength(2);
    expect(ctx.matrixA[0]).toHaveLength(2);
    expect(ctx.vectorB).toHaveLength(2);
  });
});

const standardRandomizers = [
  ['CramersRule', CramersRule],
  ['GaussElimination', GaussElimination],
  ['GaussJordanMethod', GaussJordanMethod],
  ['InverseMatrixMethod', InverseMatrixMethod],
];

describe.each(standardRandomizers)('%s randomizeMatrices', (_name, component) => {
  it('fills A and B with two-decimal numbers in [-10, 10)', () => {
    stubRandom(0.5);
    const ctx = callMethod(component, 'randomizeMatrices', {
      numVariables: 2,
      matrixA: [[0, 0], [0, 0]],
      vectorB: [0, 0],
    });

    expect(ctx.matrixA).toEqual([
      ['0.00', '0.00'],
      ['0.00', '0.00'],
    ]);
    expect(ctx.vectorB).toEqual(['0.00', '0.00']);
  });
});

const iterativeRandomizers = [
  ['JacobiIterationMethod', JacobiIterationMethod],
  ['GaussSeidelIterationMethod', GaussSeidelIterationMethod],
];

describe.each(iterativeRandomizers)('%s randomizeMatrices', (_name, component) => {
  it('builds a diagonally dominant matrix that guarantees convergence', () => {
    stubRandom(0.5);
    const ctx = callMethod(component, 'randomizeMatrices', {
      numVariables: 2,
      matrixA: [[0, 0], [0, 0]],
      vectorB: [0, 0],
    });

    expect(ctx.matrixA).toEqual([
      ['8.50', '5.00'],
      ['5.00', '8.50'],
    ]);
    expect(ctx.vectorB).toEqual(['5.00', '5.00']);
  });
});

describe('ConjugateGradientMethod randomizeMatrices', () => {
  it('builds a symmetric positive-definite matrix', () => {
    stubRandom(0.5);
    const ctx = callMethod(ConjugateGradientMethod, 'randomizeMatrices', {
      numVariables: 2,
      matrixA: [[0, 0], [0, 0]],
      vectorB: [0, 0],
    });

    expect(ctx.matrixA).toEqual([
      ['6.25', '3.50'],
      ['3.50', '6.25'],
    ]);
    expect(ctx.vectorB).toEqual(['5.00', '5.00']);
    expect(Number(ctx.matrixA[0][1])).toBe(Number(ctx.matrixA[1][0]));
  });
});

describe('CramersRule', () => {
  it('solves a 2x2 system', () => {
    const ctx = callMethod(CramersRule, 'calculateCramersRule', {
      numVariables: 2,
      matrixA: [[2, 1], [5, 3]],
      vectorB: [4, 11],
    });

    expect(ctx.solutions).toEqual(['1.000000', '2.000000']);
  });

  it('solves a 3x3 system', () => {
    const ctx = callMethod(CramersRule, 'calculateCramersRule', {
      numVariables: 3,
      matrixA: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      vectorB: [8, -11, -3],
    });

    expectCloseTo(ctx.solutions[0], 2, 1e-6);
    expectCloseTo(ctx.solutions[1], 3, 1e-6);
    expectCloseTo(ctx.solutions[2], -1, 1e-6);
  });

  it('alerts and keeps solutions empty for a singular matrix', () => {
    const ctx = callMethod(CramersRule, 'calculateCramersRule', {
      numVariables: 2,
      matrixA: [[1, 2], [2, 4]],
      vectorB: [1, 2],
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('GaussElimination', () => {
  it('solves a 2x2 system', () => {
    const ctx = callMethod(GaussElimination, 'calculateGaussElimination', {
      numVariables: 2,
      matrixA: [[2, 1], [5, 3]],
      vectorB: [4, 11],
    });

    expect(ctx.solutions).toEqual(['1.000000', '2.000000']);
  });

  it('solves a 3x3 system', () => {
    const ctx = callMethod(GaussElimination, 'calculateGaussElimination', {
      numVariables: 3,
      matrixA: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      vectorB: [8, -11, -3],
    });

    expectCloseTo(ctx.solutions[0], 2, 1e-6);
    expectCloseTo(ctx.solutions[1], 3, 1e-6);
    expectCloseTo(ctx.solutions[2], -1, 1e-6);
  });

  it('applies partial pivoting when the first pivot is zero', () => {
    const ctx = callMethod(GaussElimination, 'calculateGaussElimination', {
      numVariables: 2,
      matrixA: [[0, 1], [1, 0]],
      vectorB: [2, 3],
    });

    expect(ctx.solutions).toEqual(['3.000000', '2.000000']);
  });

  it('alerts and clears solutions for a singular system', () => {
    const ctx = callMethod(GaussElimination, 'calculateGaussElimination', {
      numVariables: 2,
      matrixA: [[1, 2], [2, 4]],
      vectorB: [1, 2],
      solutions: ['old'],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('GaussJordanMethod', () => {
  it('solves a 2x2 system', () => {
    const ctx = callMethod(GaussJordanMethod, 'calculateGaussJordan', {
      numVariables: 2,
      matrixA: [[2, 1], [5, 3]],
      vectorB: [4, 11],
    });

    expect(ctx.solutions).toEqual(['1.000000', '2.000000']);
  });

  it('solves a 3x3 system', () => {
    const ctx = callMethod(GaussJordanMethod, 'calculateGaussJordan', {
      numVariables: 3,
      matrixA: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      vectorB: [8, -11, -3],
    });

    expectCloseTo(ctx.solutions[0], 2, 1e-6);
    expectCloseTo(ctx.solutions[1], 3, 1e-6);
    expectCloseTo(ctx.solutions[2], -1, 1e-6);
  });

  it('applies row swapping for a zero pivot', () => {
    const ctx = callMethod(GaussJordanMethod, 'calculateGaussJordan', {
      numVariables: 2,
      matrixA: [[0, 1], [1, 0]],
      vectorB: [2, 3],
    });

    expect(ctx.solutions).toEqual(['3.000000', '2.000000']);
  });

  it('alerts and clears solutions for a singular system', () => {
    const ctx = callMethod(GaussJordanMethod, 'calculateGaussJordan', {
      numVariables: 2,
      matrixA: [[1, 2], [2, 4]],
      vectorB: [1, 2],
      solutions: ['old'],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('InverseMatrixMethod', () => {
  it('solves a 2x2 system using the inverse matrix', () => {
    const ctx = callMethod(InverseMatrixMethod, 'calculateInverseMatrix', {
      numVariables: 2,
      matrixA: [[2, 1], [5, 3]],
      vectorB: [4, 11],
    });

    expect(ctx.solutions).toEqual(['1.000000', '2.000000']);
  });

  it('solves a 3x3 system using the inverse matrix', () => {
    const ctx = callMethod(InverseMatrixMethod, 'calculateInverseMatrix', {
      numVariables: 3,
      matrixA: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      vectorB: [8, -11, -3],
    });

    expectCloseTo(ctx.solutions[0], 2, 1e-6);
    expectCloseTo(ctx.solutions[1], 3, 1e-6);
    expectCloseTo(ctx.solutions[2], -1, 1e-6);
  });

  it('alerts and keeps solutions empty for a singular matrix', () => {
    const ctx = callMethod(InverseMatrixMethod, 'calculateInverseMatrix', {
      numVariables: 2,
      matrixA: [[1, 2], [2, 4]],
      vectorB: [1, 2],
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('CholeskyDecompositionMethod', () => {
  it('solves a symmetric positive-definite 2x2 system', () => {
    const ctx = callMethod(CholeskyDecompositionMethod, 'calculateCholeskyDecomposition', {
      numVariables: 2,
      matrixA: [[4, 2], [2, 3]],
      vectorB: [10, 8],
    });

    expect(ctx.solutions).toEqual(['1.750000', '1.500000']);
  });

  it('solves the same system when matrix entries are numeric strings', () => {
    const ctx = callMethod(CholeskyDecompositionMethod, 'calculateCholeskyDecomposition', {
      numVariables: 2,
      matrixA: [['4.00', '2.00'], ['2.00', '3.00']],
      vectorB: ['10.00', '8.00'],
    });

    expect(ctx.solutions).toEqual(['1.750000', '1.500000']);
  });

  it('alerts when a diagonal entry is not positive', () => {
    const ctx = callMethod(CholeskyDecompositionMethod, 'calculateCholeskyDecomposition', {
      numVariables: 2,
      matrixA: [[0, 1], [1, 0]],
      vectorB: [1, 2],
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });

  it('alerts when the matrix is not positive definite', () => {
    const ctx = callMethod(CholeskyDecompositionMethod, 'calculateCholeskyDecomposition', {
      numVariables: 2,
      matrixA: [[1, 2], [2, 1]],
      vectorB: [1, 2],
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('LuDecompositionMethod', () => {
  it('solves a non-symmetric 2x2 system', () => {
    const ctx = callMethod(LuDecompositionMethod, 'calculateLuDecomposition', {
      numVariables: 2,
      matrixA: [[2, 1], [5, 3]],
      vectorB: [4, 11],
    });

    expect(ctx.solutions).toEqual(['1.000000', '2.000000']);
  });

  it('solves a 3x3 system', () => {
    const ctx = callMethod(LuDecompositionMethod, 'calculateLuDecomposition', {
      numVariables: 3,
      matrixA: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      vectorB: [8, -11, -3],
    });

    expectCloseTo(ctx.solutions[0], 2, 1e-6);
    expectCloseTo(ctx.solutions[1], 3, 1e-6);
    expectCloseTo(ctx.solutions[2], -1, 1e-6);
  });

  it('applies partial pivoting when the first pivot is zero', () => {
    const ctx = callMethod(LuDecompositionMethod, 'calculateLuDecomposition', {
      numVariables: 2,
      matrixA: [[0, 2], [1, 3]],
      vectorB: [4, 7],
    });

    expect(ctx.solutions).toEqual(['1.000000', '2.000000']);
  });

  it('alerts and keeps solutions empty for a singular matrix', () => {
    const ctx = callMethod(LuDecompositionMethod, 'calculateLuDecomposition', {
      numVariables: 2,
      matrixA: [[1, 2], [2, 4]],
      vectorB: [1, 2],
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('CholeskyDecompositionMethod randomizeMatrices', () => {
  it('builds a symmetric positive-definite matrix and a small B vector', () => {
    stubRandom(0.5);
    const ctx = callMethod(CholeskyDecompositionMethod, 'randomizeMatrices', {
      numVariables: 2,
      matrixA: [[0, 0], [0, 0]],
      vectorB: [0, 0],
    });

    const numericA = ctx.matrixA.map((row) => row.map(Number));
    const numericB = ctx.vectorB.map(Number);

    expect(numericA).toEqual([[5.5, 3.5], [3.5, 5.5]]);
    expect(numericB).toEqual([5, 5]);
    expect(numericA[0][1]).toBe(numericA[1][0]);
    expect(numericA[0][0]).toBeGreaterThan(0);
  });
});

describe('LuDecompositionMethod randomizeMatrices', () => {
  it('fills A and B with two-decimal values in [-10, 10)', () => {
    stubRandom(0.5);
    const ctx = callMethod(LuDecompositionMethod, 'randomizeMatrices', {
      numVariables: 2,
      matrixA: [[0, 0], [0, 0]],
      vectorB: [0, 0],
    });

    expect(ctx.matrixA).toEqual([
      ['0.00', '0.00'],
      ['0.00', '0.00'],
    ]);
    expect(ctx.vectorB).toEqual(['0.00', '0.00']);
  });
});

describe('JacobiIterationMethod', () => {
  it('converges to the solution of a diagonally dominant 2x2 system', () => {
    const ctx = callMethod(JacobiIterationMethod, 'calculateJacobiIteration', {
      numVariables: 2,
      matrixA: [[4, 1], [1, 3]],
      vectorB: [1, 2],
      tolerance: 1e-6,
      maxIterations: 100,
    });

    expectCloseTo(ctx.solutions[0], 1 / 11, 1e-4);
    expectCloseTo(ctx.solutions[1], 7 / 11, 1e-4);
  });

  it('alerts when the matrix has a zero on the diagonal', () => {
    const ctx = callMethod(JacobiIterationMethod, 'calculateJacobiIteration', {
      numVariables: 2,
      matrixA: [[0, 1], [1, 0]],
      vectorB: [1, 2],
      tolerance: 1e-6,
      maxIterations: 100,
      solutions: ['old'],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });

  it('alerts when the method does not converge', () => {
    const ctx = callMethod(JacobiIterationMethod, 'calculateJacobiIteration', {
      numVariables: 2,
      matrixA: [[1, 2], [3, 1]],
      vectorB: [1, 1],
      tolerance: 1e-6,
      maxIterations: 5,
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('GaussSeidelIterationMethod', () => {
  it('converges to the solution of a diagonally dominant 2x2 system', () => {
    const ctx = callMethod(GaussSeidelIterationMethod, 'calculateGaussSeidelIteration', {
      numVariables: 2,
      matrixA: [[4, 1], [1, 3]],
      vectorB: [1, 2],
      tolerance: 1e-6,
      maxIterations: 100,
    });

    expectCloseTo(ctx.solutions[0], 1 / 11, 1e-4);
    expectCloseTo(ctx.solutions[1], 7 / 11, 1e-4);
  });

  it('alerts when the matrix has a zero on the diagonal', () => {
    const ctx = callMethod(GaussSeidelIterationMethod, 'calculateGaussSeidelIteration', {
      numVariables: 2,
      matrixA: [[0, 1], [1, 0]],
      vectorB: [1, 2],
      tolerance: 1e-6,
      maxIterations: 100,
      solutions: ['old'],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });

  it('alerts when the method does not converge', () => {
    const ctx = callMethod(GaussSeidelIterationMethod, 'calculateGaussSeidelIteration', {
      numVariables: 2,
      matrixA: [[1, 2], [3, 1]],
      vectorB: [1, 1],
      tolerance: 1e-6,
      maxIterations: 5,
      solutions: [],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});

describe('ConjugateGradientMethod', () => {
  it('solves a symmetric positive-definite 2x2 system', () => {
    const ctx = callMethod(ConjugateGradientMethod, 'calculateConjugateGradient', {
      numVariables: 2,
      matrixA: [[4, 1], [1, 3]],
      vectorB: [1, 2],
      tolerance: 1e-6,
      maxIterations: 100,
    });

    expectCloseTo(ctx.solutions[0], 1 / 11, 1e-6);
    expectCloseTo(ctx.solutions[1], 7 / 11, 1e-6);
  });

  it('alerts when the matrix cannot be processed', () => {
    const ctx = callMethod(ConjugateGradientMethod, 'calculateConjugateGradient', {
      numVariables: 2,
      matrixA: [[0, 0], [0, 0]],
      vectorB: [1, 2],
      tolerance: 1e-6,
      maxIterations: 100,
      solutions: ['old'],
    });

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(ctx.solutions).toEqual([]);
  });
});
