<template>
  <MethodLayout title="Bisection Method">
    <template #inputs>
      <div class="field">
        <label>f(x)</label>
        <input v-model="functionInput" placeholder="e.g. x^2 - 4" />
      </div>
      <div class="field-row">
        <div class="field">
          <label>Lower bound a (xₗ)</label>
          <input type="number" v-model.number="lowerBound" />
        </div>
        <div class="field">
          <label>Upper bound b (xᵤ)</label>
          <input type="number" v-model.number="upperBound" />
        </div>
      </div>
      <div class="field">
        <label>Tolerance ε</label>
        <input type="number" v-model.number="tolerance" step="0.0001" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons @random="randomFunction" @calculate="calculateBisection" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Root xₘ</div>
            <div class="value">{{ result }}</div>
          </div>
          <div class="stat">
            <div class="label">Error (b − a) / 2</div>
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
import { sampleCurve, curveBounds, shadeRect } from '@/utils/visual.js';

export default {
  name: 'BisectionMethod',
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
      return ((Number(last.b) - Number(last.a)) / 2).toFixed(6);
    },
    tableHeaders() {
      return ['Iteration', 'a', 'b', 'xₘ', 'f(xₘ)', 'Error'];
    },
    tableRows() {
      return this.iterations.map((row, index) => [
        index + 1,
        row.a,
        row.b,
        row.c,
        row.fc,
        ((Number(row.b) - Number(row.a)) / 2).toFixed(6),
      ]);
    },
    chartSeries() {
      if (!this.iterations.length) return [];
      const first = this.iterations[0];
      const last = this.iterations[this.iterations.length - 1];
      const a0 = Number(first.a);
      const b0 = Number(first.b);
      const la = Number(last.a);
      const lb = Number(last.b);
      const [yMin, yMax] = curveBounds(this.functionInput, la, lb);

      return [
        ...shadeRect(la, lb, yMin, yMax, 'rgba(255,140,50,0.25)'),
        { label: 'f(x)', points: sampleCurve(this.functionInput, a0, b0, 240), color: '#124076' },
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
    calculateBisection() {
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

      c = (a + b) / 2;

      let iterationCount = 0;
      while ((b - a) / 2 > this.tolerance) {
        c = (a + b) / 2;
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

        if (fc === 0) {
          break;
        } else if (f(a) * fc < 0) {
          b = c;
        } else {
          a = c;
        }

        iterationCount++;
        if (iterationCount > 1000) {
          console.warn('Reached maximum iteration limit');
          break;
        }
      }

      this.result = c.toFixed(6);
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
