import { parse, matrix, det, inv, lup } from 'mathjs';

export function makeEvaluator(expression) {
  const compiled = parse(expression).compile();
  return (x) => compiled.evaluate({ x });
}

export function evalAt(expression, x) {
  return makeEvaluator(expression)(x);
}

export function sampleCurve(expression, x0, x1, samples = 200) {
  const f = makeEvaluator(expression);
  const points = [];
  for (let i = 0; i <= samples; i += 1) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const y = f(x);
    if (Number.isFinite(y)) points.push({ x, y });
  }
  return points;
}

export function curveBounds(expression, x0, x1, samples = 60) {
  const lo = Math.min(x0, x1);
  const hi = Math.max(x0, x1);
  const ys = sampleCurve(expression, lo, hi, samples).map((p) => p.y);
  let min = Math.min(...ys);
  let max = Math.max(...ys);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  const pad = Math.max((max - min) * 0.1, 1e-9);
  return [min - pad, max + pad];
}

export function shadeRect(a, b, yMin, yMax, fillColor) {
  return [
    {
      label: '',
      type: 'line',
      showLine: false,
      pointRadius: 0,
      points: [
        { x: a, y: yMax },
        { x: b, y: yMax },
      ],
      fill: { target: '+1' },
      fillColor,
      order: 10,
    },
    {
      label: '',
      type: 'line',
      showLine: false,
      pointRadius: 0,
      points: [
        { x: a, y: yMin },
        { x: b, y: yMin },
      ],
      order: 11,
    },
  ];
}

export function rSquared(points, predict) {
  const mean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  let ssTot = 0;
  let ssRes = 0;
  for (const p of points) {
    ssTot += (p.y - mean) ** 2;
    ssRes += (p.y - predict(p.x)) ** 2;
  }
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

export function r2FromPairs(actual, predicted) {
  const mean = actual.reduce((sum, v) => sum + v, 0) / actual.length;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < actual.length; i += 1) {
    ssTot += (actual[i] - mean) ** 2;
    ssRes += (actual[i] - predicted[i]) ** 2;
  }
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

function snapshot(augmented) {
  return augmented.map((row) => [...row]);
}

export function gaussSteps(A, B) {
  const augmented = A.map((row, i) => [...row.map(Number), Number(B[i])]);
  const steps = [];
  const n = A.length;

  for (let i = 0; i < n; i += 1) {
    let maxRow = i;
    for (let k = i + 1; k < n; k += 1) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
    }
    if (maxRow !== i) {
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      steps.push({ label: `Swap rows ${i + 1} ↔ ${maxRow + 1}`, matrix: snapshot(augmented) });
    }

    for (let k = i + 1; k < n; k += 1) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j += 1) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
    steps.push({ label: `Eliminate column ${i + 1}`, matrix: snapshot(augmented) });
  }

  return { steps, final: augmented };
}

export function rrefSteps(A, B) {
  const augmented = A.map((row, i) => [...row.map(Number), Number(B[i])]);
  const steps = [];
  const n = A.length;

  for (let i = 0; i < n; i += 1) {
    let maxRow = i;
    for (let k = i + 1; k < n; k += 1) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
    }
    if (maxRow !== i) {
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      steps.push({ label: `Swap rows ${i + 1} ↔ ${maxRow + 1}`, matrix: snapshot(augmented) });
    }

    const pivot = augmented[i][i];
    if (pivot !== 0) {
      for (let j = 0; j <= n; j += 1) augmented[i][j] /= pivot;
      steps.push({ label: `Normalise row ${i + 1}`, matrix: snapshot(augmented) });
    }

    for (let k = 0; k < n; k += 1) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j <= n; j += 1) augmented[k][j] -= factor * augmented[i][j];
      }
    }
    steps.push({ label: `Clear column ${i + 1}`, matrix: snapshot(augmented) });
  }

  return { steps, final: augmented };
}

export function cramerDetails(A, B) {
  const base = matrix(A);
  const detA = det(base);
  const items = [];
  for (let col = 0; col < A.length; col += 1) {
    const modified = base.clone();
    for (let row = 0; row < A.length; row += 1) {
      modified.set([row, col], Number(B[row]));
    }
    items.push({ matrix: modified.toArray(), det: det(modified) });
  }
  return { detA, items };
}

export function luFactors(A) {
  const factors = lup(matrix(A));
  return {
    L: factors.L.valueOf(),
    U: factors.U.valueOf(),
    P: factors.P.valueOf(),
  };
}

export function inverseOf(A) {
  return inv(matrix(A)).valueOf();
}

export function choleskyOf(A) {
  const n = A.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j <= i; j += 1) {
      let sum = 0;
      for (let k = 0; k < j; k += 1) sum += L[i][k] * L[j][k];
      if (i === j) {
        L[i][j] = Math.sqrt(A[i][i] - sum);
      } else {
        L[i][j] = (A[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}

export function transposeMatrix(M) {
  return M[0].map((_, col) => M.map((row) => row[col]));
}

export function dividedDiffTable(points) {
  const n = points.length;
  const table = points.map((p) => [p.y]);
  for (let j = 1; j < n; j += 1) {
    for (let i = 0; i < n - j; i += 1) {
      table[i].push((table[i + 1][j - 1] - table[i][j - 1]) / (points[i + j].x - points[i].x));
    }
  }
  return table;
}

export function newtonEval(coefficients, xNodes, x) {
  let sum = coefficients[0];
  let product = 1;
  for (let k = 1; k < coefficients.length; k += 1) {
    product *= x - xNodes[k - 1];
    sum += coefficients[k] * product;
  }
  return sum;
}

export function splineEval(points, x) {
  const sorted = [...points].sort((p, q) => p.x - q.x);
  const last = sorted.length - 1;
  if (x <= sorted[0].x) {
    const slope = (sorted[1].y - sorted[0].y) / (sorted[1].x - sorted[0].x);
    return sorted[0].y + slope * (x - sorted[0].x);
  }
  for (let i = 0; i < last; i += 1) {
    if (x <= sorted[i + 1].x) {
      const slope = (sorted[i + 1].y - sorted[i].y) / (sorted[i + 1].x - sorted[i].x);
      return sorted[i].y + slope * (x - sorted[i].x);
    }
  }
  const slope = (sorted[last].y - sorted[last - 1].y) / (sorted[last].x - sorted[last - 1].x);
  return sorted[last].y + slope * (x - sorted[last].x);
}

export function compositeTrapezoid(expression, a, b, n) {
  const f = makeEvaluator(expression);
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i += 1) sum += 2 * f(a + i * h);
  return (h / 2) * sum;
}

export function compositeSimpson(expression, a, b, n) {
  const f = makeEvaluator(expression);
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i += 1) {
    const x = a + i * h;
    sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
  }
  return (h / 3) * sum;
}

export function newtonCotes(expression, a, b, points) {
  const weightTable = {
    2: [1 / 2, 1 / 2],
    3: [1 / 6, 4 / 6, 1 / 6],
    4: [1 / 8, 3 / 8, 3 / 8, 1 / 8],
    5: [7 / 90, 32 / 90, 12 / 90, 32 / 90, 7 / 90],
  };
  const weights = weightTable[points] || weightTable[3];
  const f = makeEvaluator(expression);
  const nodes = weights.map((weight, i) => {
    const x = a + ((b - a) * i) / (weights.length - 1);
    return { x, weight, y: f(x) };
  });
  const result = (b - a) * nodes.reduce((sum, node) => sum + node.weight * node.y, 0);
  return { result, nodes };
}

export function rombergTable(expression, a, b, levels) {
  const f = makeEvaluator(expression);
  const rows = [];
  for (let i = 0; i < levels; i += 1) {
    const n = 2 ** i;
    const h = (b - a) / n;
    let sum = 0;
    for (let k = 1; k < n; k += 1) sum += f(a + k * h);
    rows.push([(h / 2) * (f(a) + f(b) + 2 * sum)]);
  }
  for (let j = 1; j < levels; j += 1) {
    for (let i = j; i < levels; i += 1) {
      rows[i][j] = rows[i][j - 1] + (rows[i][j - 1] - rows[i - 1][j - 1]) / (4 ** j - 1);
    }
  }
  const lastRow = rows[levels - 1];
  const value = lastRow[levels - 1];
  const error = levels > 1 ? Math.abs(lastRow[levels - 1] - lastRow[levels - 2]) : null;
  return { value, rows, error };
}

export function gaussQuadrature(expression, a, b, points) {
  const table = {
    2: {
      nodes: [-0.5773502691896257, 0.5773502691896257],
      weights: [1, 1],
    },
    3: {
      nodes: [0, -0.7745966692414834, 0.7745966692414834],
      weights: [8 / 9, 5 / 9, 5 / 9],
    },
    4: {
      nodes: [-0.3399810435848563, 0.3399810435848563, -0.8611363115940526, 0.8611363115940526],
      weights: [0.6521451548625461, 0.6521451548625461, 0.3478548451374538, 0.3478548451374538],
    },
    5: {
      nodes: [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664],
      weights: [0.5688888888888889, 0.4786286704993665, 0.4786286704993665, 0.2369268850189274, 0.2369268850189274],
    },
  };
  const config = table[points] || table[3];
  const f = makeEvaluator(expression);
  const nodes = config.nodes.map((xi, i) => {
    const x = (a + b) / 2 + ((b - a) / 2) * xi;
    return { xi, weight: config.weights[i], x, y: f(x) };
  });
  const result = ((b - a) / 2) * nodes.reduce((sum, node) => sum + node.weight * node.y, 0);
  return { result, nodes };
}
