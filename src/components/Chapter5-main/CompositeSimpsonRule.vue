<template>
  <MethodLayout title="Composite Simpson's Rule">
    <template #inputs>
      <div class="field-row">
        <div class="field">
          <label>Lower limit a</label>
          <input type="number" v-model.number="lowerLimit" />
        </div>
        <div class="field">
          <label>Upper limit b</label>
          <input type="number" v-model.number="upperLimit" />
        </div>
      </div>
      <div class="field">
        <label>Number of intervals n (even)</label>
        <input type="number" v-model.number="numIntervals" min="2" step="2" />
      </div>
      <div class="field">
        <label>Function f(x)</label>
        <input v-model="functionExpression" placeholder="e.g. x^2 + 3" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Random" @random="randomizeFunctionAndData" @calculate="calculateSimpsonsRule" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Integral ≈</div>
            <div class="value">{{ result.toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Est. error</div>
            <div class="value">{{ error.toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Intervals</div>
            <div class="value">{{ numIntervals }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="f(x)" :width="600" :height="320" />
        </div>

        <ResultTable
          title="Nodes"
          :headers="['i', 'xᵢ', 'f(xᵢ)', 'Weight']"
          :rows="nodeRows"
        />
      </template>
      <p v-else class="hint-note">Enter f(x), the interval [a, b] and an even n, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import * as math from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve, compositeSimpson } from '@/utils/visual.js';

export default {
  name: 'CompositeSimpsonsRule',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      lowerLimit: 0,
      upperLimit: 1,
      numIntervals: 2,
      functionExpression: '',
      result: null,
      error: null,
    };
  },
  computed: {
    nodeRows() {
      if (this.result === null) return [];
      const n = Math.floor(this.numIntervals);
      const a = this.lowerLimit;
      const b = this.upperLimit;
      const h = (b - a) / n;
      const f = math.parse(this.functionExpression).compile();
      const rows = [];
      for (let i = 0; i <= n; i += 1) {
        const x = a + i * h;
        const weight = i === 0 || i === n ? '1' : i % 2 === 0 ? '2' : '4';
        rows.push([i, x.toFixed(4), f.evaluate({ x }).toFixed(6), weight]);
      }
      return rows;
    },
    chartSeries() {
      if (this.result === null) return [];
      const n = Math.floor(this.numIntervals);
      const a = this.lowerLimit;
      const b = this.upperLimit;
      const h = (b - a) / n;
      const f = math.parse(this.functionExpression).compile();
      const nodes = [];
      for (let i = 0; i <= n; i += 1) {
        const x = a + i * h;
        nodes.push({ x, y: f.evaluate({ x }) });
      }

      return [
        {
          label: 'area under f(x)',
          type: 'line',
          points: sampleCurve(this.functionExpression, a, b, 200),
          color: '#124076',
          fill: 'origin',
          fillColor: 'rgba(18,64,118,0.18)',
        },
        {
          label: 'nodes',
          type: 'scatter',
          points: nodes,
          color: '#e67e22',
          pointRadius: 3,
        },
      ];
    },
  },
  methods: {
    calculateSimpsonsRule() {
      this.result = null;
      this.error = null;
      try {
        const expression = (this.functionExpression || '').trim();
        if (!expression) {
          alert('Please enter a function f(x).');
          return;
        }

        const a = this.lowerLimit;
        const b = this.upperLimit;
        const n = Math.floor(this.numIntervals);

        if (n < 2 || n % 2 !== 0) {
          alert('Number of intervals (n) must be an even number of at least 2.');
          return;
        }

        const f = math.parse(expression).compile();
        const h = (b - a) / n;

        let sum = 0;
        for (let i = 0; i <= n; i++) {
          const x = a + i * h;
          const fx = f.evaluate({ x });
          if (i === 0 || i === n) {
            sum += fx;
          } else if (i % 2 === 0) {
            sum += 2 * fx;
          } else {
            sum += 4 * fx;
          }
        }

        const result = (h / 3) * sum;

        if (!Number.isFinite(result)) {
          alert('The function could not be evaluated on the given interval. Please check your inputs.');
          return;
        }

        this.result = result;
        this.error = Math.abs(result - compositeSimpson(expression, a, b, n * 2));
      } catch (error) {
        console.error("Error calculating Simpson's Rule:", error);
        alert("An error occurred while calculating the integral. Please check your inputs.");
      }
    },
    randomizeFunctionAndData() {
      const functions = [
        'x^2 + 3',
        'sin(x) + 2',
        'x^3 - 4*x + 1',
        'cos(x) + x',
        'e^x - x',
      ];
      this.functionExpression = functions[Math.floor(Math.random() * functions.length)];
      this.lowerLimit = parseFloat((Math.random() * 10).toFixed(2));
      this.upperLimit = parseFloat((Math.random() * 10 + this.lowerLimit).toFixed(2));
      this.numIntervals = Math.floor(Math.random() * 10 / 2) * 2 + 2;
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
