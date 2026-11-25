<template>
  <MethodLayout title="Newton-Raphson Method">
    <template #inputs>
      <div class="field">
        <label>f(x)</label>
        <input v-model="functionInput" placeholder="e.g. x^2 - 4" />
      </div>
      <div class="field">
        <label>f′(x)</label>
        <input v-model="derivativeInput" placeholder="e.g. 2 * x" />
      </div>
      <div class="field-row">
        <div class="field">
          <label>Initial guess x₀</label>
          <input type="number" v-model.number="initialGuess" />
        </div>
        <div class="field">
          <label>Tolerance ε</label>
          <input type="number" v-model.number="tolerance" step="0.0001" />
        </div>
      </div>
    </template>

    <template #buttons>
      <MethodButtons @random="randomFunction" @calculate="calculateNewtonRaphson" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Root</div>
            <div class="value">{{ result }}</div>
          </div>
          <div class="stat">
            <div class="label">Error |f(x)|</div>
            <div class="value">{{ finalError }}</div>
          </div>
          <div class="stat">
            <div class="label">Iterations</div>
            <div class="value">{{ iterations.length }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="f(x)" :width="600" :height="300" />
        </div>

        <ResultTable title="Iterations" :headers="tableHeaders" :rows="tableRows" />
      </template>
      <p v-else class="hint-note">Enter f(x), f′(x), an initial guess and tolerance, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import { evaluate } from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve, evalAt } from '@/utils/visual.js';

export default {
  name: 'NewtonRaphson',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      functionInput: 'x^2 - 4',
      derivativeInput: '2 * x',
      initialGuess: 1,
      tolerance: 0.001,
      result: null,
      iterations: [],
      randomFunctions: [
        { f: 'x^3 - 2*x - 5', fp: '3*x^2 - 2' },
        { f: 'x^2 - 4', fp: '2 * x' },
        { f: 'sin(x) - 0.5', fp: 'cos(x)' },
        { f: 'x^3 - 4*x + 1', fp: '3*x^2 - 4' },
        { f: 'cos(x) - x', fp: '-sin(x) - 1' },
      ],
    };
  },
  computed: {
    finalError() {
      const last = this.iterations[this.iterations.length - 1];
      if (!last) return '0.000000';
      return Math.abs(Number(last.fx)).toFixed(6);
    },
    tableHeaders() {
      return ['Iteration', 'x', 'f(x)', "f'(x)", 'Error |f(x)|'];
    },
    tableRows() {
      return this.iterations.map((row, index) => [
        index + 1,
        row.x,
        row.fx,
        row.fpx,
        Math.abs(Number(row.fx)).toFixed(6),
      ]);
    },
    chartSeries() {
      if (!this.iterations.length) return [];
      const last = this.iterations[this.iterations.length - 1];
      const x = Number(last.x);
      const y = evalAt(this.functionInput, x);
      const slope = evalAt(this.derivativeInput, x);
      const dx = 2;

      return [
        {
          label: 'f(x)',
          points: sampleCurve(this.functionInput, x - 4, x + 4, 240),
          color: '#124076',
        },
        {
          label: 'tangent at last x',
          type: 'line',
          points: [
            { x: x - dx, y: y - dx * slope },
            { x: x + dx, y: y + dx * slope },
          ],
          color: '#e67e22',
          dashed: true,
        },
        {
          label: 'root',
          type: 'scatter',
          points: [{ x: Number(this.result), y: 0 }],
          color: '#d81b60',
          pointRadius: 6,
        },
      ];
    },
  },
  methods: {
    randomFunction() {
      const randomIndex = Math.floor(Math.random() * this.randomFunctions.length);
      this.functionInput = this.randomFunctions[randomIndex].f;
      this.derivativeInput = this.randomFunctions[randomIndex].fp;
    },
    calculateNewtonRaphson() {
      let x0 = this.initialGuess;
      const f = (x) => evaluate(this.functionInput, { x });
      const fPrime = (x) => evaluate(this.derivativeInput, { x });
      this.iterations = [];
      this.result = null;

      let iterationCount = 0;
      const maxIterations = 1000;

      let x1;
      do {
        const fx = f(x0);
        const fpx = fPrime(x0);

        if (fpx === 0) {
          console.warn('Derivative is zero. Stopping iteration to avoid division by zero.');
          x1 = x0;
          break;
        }

        x1 = x0 - fx / fpx;

        this.iterations.push({
          x: x0.toFixed(6),
          fx: fx.toFixed(6),
          fpx: fpx.toFixed(6),
        });

        if (Math.abs(x1 - x0) < this.tolerance) {
          break;
        }

        x0 = x1;
        iterationCount++;

        if (iterationCount >= maxIterations) {
          console.warn('Reached maximum iteration limit');
          break;
        }
      } while (Math.abs(f(x1)) >= this.tolerance);

      this.result = x1.toFixed(6);
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
