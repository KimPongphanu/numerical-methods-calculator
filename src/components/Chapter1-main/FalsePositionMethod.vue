<template>
  <MethodLayout title="False Position Method">
    <template #inputs>
      <div class="field">
        <label>f(x)</label>
        <input v-model="functionInput" placeholder="e.g. x^2 - 4" />
      </div>
      <div class="field-row">
        <div class="field">
          <label>Lower bound a</label>
          <input type="number" v-model.number="lowerBound" />
        </div>
        <div class="field">
          <label>Upper bound b</label>
          <input type="number" v-model.number="upperBound" />
        </div>
      </div>
      <div class="field">
        <label>Tolerance ε</label>
        <input type="number" v-model.number="tolerance" step="0.0001" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons @random="randomFunction" @calculate="calculateFalsePosition" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Root xᵣ</div>
            <div class="value">{{ result }}</div>
          </div>
          <div class="stat">
            <div class="label">Error |f(xᵣ)|</div>
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
      <p v-else class="hint-note">Enter f(x), a bracketing interval [a, b] and tolerance, then press Calculate.</p>
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
  name: 'FalsePositionMethod',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      functionInput: 'x^2 - 4',
      lowerBound: 0,
      upperBound: 3,
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
      return Math.abs(Number(last.fc)).toFixed(6);
    },
    tableHeaders() {
      return ['Iteration', 'a', 'b', 'xᵣ', 'f(xᵣ)', 'Error |f(xᵣ)|'];
    },
    tableRows() {
      return this.iterations.map((row, index) => [
        index + 1,
        row.a,
        row.b,
        row.c,
        row.fc,
        Math.abs(Number(row.fc)).toFixed(6),
      ]);
    },
    chartSeries() {
      if (!this.iterations.length) return [];
      const last = this.iterations[this.iterations.length - 1];
      const a = Number(last.a);
      const b = Number(last.b);

      return [
        {
          label: 'f(x)',
          points: sampleCurve(this.functionInput, Number(this.iterations[0].a), Number(this.iterations[0].b), 240),
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
    calculateFalsePosition() {
      let a = this.lowerBound;
      let b = this.upperBound;
      const f = (x) => evaluate(this.functionInput, { x });
      let c;
      this.iterations = [];
      this.result = null;

      const fa = f(a);
      const fb = f(b);

      if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
        alert('The function is not defined at the bounds. Please check your inputs.');
        return;
      }

      if (fa * fb > 0) {
        alert('The function must have different signs at the bounds a and b.');
        return;
      }

      let iterationCount = 0;
      do {
        c = (a * f(b) - b * f(a)) / (f(b) - f(a));
        const fc = f(c);

        if (!Number.isFinite(fc)) {
          alert('The function could not be evaluated inside the interval. Please check your inputs.');
          return;
        }

        this.iterations.push({
          a: a.toFixed(6),
          b: b.toFixed(6),
          c: c.toFixed(6),
          fc: fc.toFixed(6),
        });

        if (f(a) * fc < 0) {
          b = c;
        } else {
          a = c;
        }

        iterationCount++;
        if (iterationCount > 1000) {
          console.warn('Reached maximum iteration limit');
          break;
        }
      } while (Math.abs(f(c)) > this.tolerance);

      this.result = c.toFixed(6);
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
