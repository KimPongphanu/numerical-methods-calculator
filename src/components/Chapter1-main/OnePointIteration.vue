<template>
  <MethodLayout title="One Point Iteration Method">
    <template #inputs>
      <div class="field">
        <label>g(x)</label>
        <input v-model="functionInput" placeholder="e.g. sqrt(4 - x)" />
      </div>
      <div class="field">
        <label>Initial guess x₀</label>
        <input type="number" v-model.number="initialGuess" />
      </div>
      <div class="field">
        <label>Tolerance ε</label>
        <input type="number" v-model.number="tolerance" step="0.0001" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons @random="randomFunction" @calculate="calculateIteration" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Fixed point x</div>
            <div class="value">{{ result }}</div>
          </div>
          <div class="stat">
            <div class="label">Error |g(x) − x|</div>
            <div class="value">{{ finalError }}</div>
          </div>
          <div class="stat">
            <div class="label">Iterations</div>
            <div class="value">{{ iterations.length }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="y" :width="600" :height="320" />
        </div>

        <ResultTable title="Iterations" :headers="tableHeaders" :rows="tableRows" />
      </template>
      <p v-else class="hint-note">Enter g(x), an initial guess x₀ and tolerance, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import { evaluate } from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve } from '@/utils/visual.js';

export default {
  name: 'OnePointIteration',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      functionInput: 'sqrt(4 - x)',
      initialGuess: 1,
      tolerance: 0.001,
      result: null,
      iterations: [],
      randomFunctions: [
        'cos(x)',
        'sin(x) + 1 - x',
        'sqrt(4 - x)',
        '1 + log(x)',
        'x - (x^3 - 3*x + 1) / (3*x^2 - 3)',
      ],
    };
  },
  computed: {
    finalError() {
      const last = this.iterations[this.iterations.length - 1];
      if (!last) return '0.000000';
      return Math.abs(Number(last.gx) - Number(last.x)).toFixed(6);
    },
    tableHeaders() {
      return ['Iteration', 'x', 'g(x)', 'Error |g(x) − x|'];
    },
    tableRows() {
      return this.iterations.map((row, index) => [
        index + 1,
        row.x,
        row.gx,
        Math.abs(Number(row.gx) - Number(row.x)).toFixed(6),
      ]);
    },
    chartSeries() {
      if (!this.iterations.length) return [];
      const xs = this.iterations.map((row) => Number(row.x));
      const gxs = this.iterations.map((row) => Number(row.gx));
      const lo = Math.min(...xs, ...gxs) - 1;
      const hi = Math.max(...xs, ...gxs) + 1;

      const cobweb = [{ x: xs[0], y: 0 }];
      for (const row of this.iterations) {
        cobweb.push({ x: Number(row.x), y: Number(row.gx) });
        cobweb.push({ x: Number(row.gx), y: Number(row.gx) });
      }

      return [
        { label: 'y = g(x)', points: sampleCurve(this.functionInput, lo, hi, 240), color: '#124076' },
        { label: 'y = x', points: [{ x: lo, y: lo }, { x: hi, y: hi }], color: '#8d8d8d', dashed: true },
        { label: 'cobweb', points: cobweb, color: '#e67e22', borderWidth: 2, pointRadius: 0 },
        {
          label: 'root',
          type: 'scatter',
          points: [{ x: Number(this.result), y: Number(this.result) }],
          color: '#d81b60',
          pointRadius: 6,
        },
      ];
    },
  },
  methods: {
    randomFunction() {
      const randomIndex = Math.floor(Math.random() * this.randomFunctions.length);
      this.functionInput = this.randomFunctions[randomIndex];
    },
    calculateIteration() {
      let x0 = this.initialGuess;
      let x1;
      let delta;
      const g = (x) => evaluate(this.functionInput, { x });
      this.iterations = [];
      this.result = null;

      let iterationCount = 0;
      const maxIterations = 1000;

      do {
        x1 = g(x0);
        delta = Math.abs(x1 - x0);

        this.iterations.push({
          x: x0.toFixed(6),
          gx: x1.toFixed(6),
        });

        if (delta < this.tolerance) {
          break;
        }

        x0 = x1;
        iterationCount++;

        if (iterationCount >= maxIterations) {
          console.warn('Reached maximum iteration limit');
          break;
        }
      } while (delta >= this.tolerance);

      this.result = x1.toFixed(6);
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
