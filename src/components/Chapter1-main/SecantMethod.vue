<template>
  <MethodLayout title="Secant Method">
    <template #inputs>
      <div class="field">
        <label>f(x)</label>
        <input v-model="functionInput" placeholder="e.g. x^2 - 4" />
      </div>
      <div class="field-row">
        <div class="field">
          <label>Initial guess x₀</label>
          <input type="number" v-model.number="x0" />
        </div>
        <div class="field">
          <label>Initial guess x₁</label>
          <input type="number" v-model.number="x1" />
        </div>
      </div>
      <div class="field">
        <label>Tolerance ε</label>
        <input type="number" v-model.number="tolerance" step="0.0001" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons @random="randomFunction" @calculate="calculateSecant" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Root</div>
            <div class="value">{{ result }}</div>
          </div>
          <div class="stat">
            <div class="label">Error |x₂ − x₁|</div>
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
      <p v-else class="hint-note">Enter f(x), two initial guesses and tolerance, then press Calculate.</p>
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
  name: 'SecantMethod',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      functionInput: 'x^2 - 4',
      x0: 0,
      x1: 3,
      tolerance: 0.001,
      result: null,
      iterations: [],
      randomFunctions: [
        'x^3 - 2*x - 5',
        'x^2 - 4',
        'sin(x) - 0.5',
        'x^3 - 4*x + 1',
        'cos(x) - x',
        'log(x) - 1',
        'x^3 - 6*x^2 + 11*x - 6',
        'tan(x) - x',
      ],
    };
  },
  computed: {
    finalError() {
      const last = this.iterations[this.iterations.length - 1];
      if (!last) return '0.000000';
      return Math.abs(Number(last.x2) - Number(last.x1)).toFixed(6);
    },
    tableHeaders() {
      return ['Iteration', 'x₀', 'x₁', 'x₂', 'f(x₂)', 'Error |x₂ − x₁|'];
    },
    tableRows() {
      return this.iterations.map((row, index) => [
        index + 1,
        row.x0,
        row.x1,
        row.x2,
        row.fx2,
        Math.abs(Number(row.x2) - Number(row.x1)).toFixed(6),
      ]);
    },
    chartSeries() {
      if (!this.iterations.length) return [];
      const last = this.iterations[this.iterations.length - 1];
      const a = Number(last.x0);
      const b = Number(last.x1);

      return [
        {
          label: 'f(x)',
          points: sampleCurve(this.functionInput, Math.min(a, b) - 2, Math.max(a, b) + 2, 240),
          color: '#124076',
        },
        {
          label: 'secant line',
          type: 'line',
          points: [
            { x: a, y: evalAt(this.functionInput, a) },
            { x: b, y: evalAt(this.functionInput, b) },
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
      this.functionInput = this.randomFunctions[randomIndex];
    },
    calculateSecant() {
      let x0 = this.x0;
      let x1 = this.x1;
      const f = (x) => evaluate(this.functionInput, { x });
      this.iterations = [];
      this.result = null;
      let x2;
      let delta;
      let iterationCount = 0;
      const maxIterations = 1000;

      do {
        x2 = x1 - (f(x1) * (x1 - x0)) / (f(x1) - f(x0));
        const fx2 = f(x2);
        delta = Math.abs(x2 - x1);

        this.iterations.push({
          x0: x0.toFixed(6),
          x1: x1.toFixed(6),
          x2: x2.toFixed(6),
          fx2: fx2.toFixed(6),
        });

        if (delta < this.tolerance) {
          break;
        }

        x0 = x1;
        x1 = x2;
        iterationCount++;

        if (iterationCount >= maxIterations) {
          console.warn('Reached maximum iteration limit');
          break;
        }
      } while (delta >= this.tolerance);

      this.result = x2.toFixed(6);
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
