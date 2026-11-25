<template>
  <MethodLayout title="Newton's Divided Differences">
    <template #inputs>
      <div class="field">
        <label>Number of data points n</label>
        <input type="number" v-model.number="numPoints" min="2" max="10" @change="initializeData" />
      </div>
      <div class="field">
        <label>Data points (xᵢ, yᵢ)</label>
        <div style="display: flex; flex-direction: column; gap: 6px">
          <div v-for="(point, index) in dataPoints" :key="'point-' + index" style="display: flex; gap: 6px; align-items: center">
            <span style="font-size: 12px; width: 22px">{{ index + 1 }}.</span>
            <input type="number" v-model.number="dataPoints[index].x" placeholder="x" />
            <input type="number" v-model.number="dataPoints[index].y" placeholder="y" />
          </div>
        </div>
      </div>
      <div class="field">
        <label>Evaluate f(x) at x</label>
        <input type="number" v-model.number="targetX" step="0.1" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeDataPoints" @calculate="calculateDividedDifferences" @reset="reset" />
    </template>

    <template #output>
      <template v-if="coefficients.length > 0">
        <div class="stats">
          <div class="stat">
            <div class="label">f(x) at x = {{ targetX }}</div>
            <div class="value">{{ interpolatedValue.toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Order</div>
            <div class="value">{{ coefficients.length - 1 }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="y" :width="600" :height="300" />
        </div>

        <div>
          <h4>Newton polynomial coefficients</h4>
          <div class="equation">
            {{ coefficients.map((c, i) => `a${i} = ${c.toFixed(6)}`).join(',  ') }}
          </div>
        </div>

        <ResultTable title="Divided difference table" :headers="tableHeaders" :rows="diffRows" />
      </template>
      <p v-else class="hint-note">Enter the data points, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { dividedDiffTable, newtonEval } from '@/utils/visual.js';

export default {
  name: 'NewtonsDividedDifferences',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      numPoints: 2,
      dataPoints: [],
      coefficients: [],
      targetX: 1,
      xNodes: [],
      diffRows: [],
    };
  },
  computed: {
    tableHeaders() {
      const headers = ['xᵢ', 'yᵢ'];
      for (let order = 1; order < this.coefficients.length; order += 1) {
        headers.push(`Order ${order}`);
      }
      return headers;
    },
    interpolatedValue() {
      if (!this.coefficients.length) return 0;
      try {
        return newtonEval(this.coefficients, this.xNodes, Number(this.targetX));
      } catch (error) {
        return 0;
      }
    },
    chartSeries() {
      if (!this.coefficients.length) return [];
      const xs = this.dataPoints.map((p) => p.x);
      const lo = Math.min(...xs) - 1;
      const hi = Math.max(...xs) + 1;

      return [
        {
          label: 'P(x)',
          type: 'line',
          points: this.curvePoints(lo, hi),
          color: '#124076',
        },
        {
          label: 'data points',
          type: 'scatter',
          points: this.dataPoints.map((p) => ({ x: p.x, y: p.y })),
          color: '#e67e22',
          pointRadius: 5,
        },
        {
          label: 'f(x) query',
          type: 'scatter',
          points: [{ x: Number(this.targetX), y: this.interpolatedValue }],
          color: '#d81b60',
          pointRadius: 6,
        },
      ];
    },
  },
  methods: {
    curvePoints(lo, hi) {
      const points = [];
      for (let i = 0; i <= 200; i += 1) {
        const x = lo + ((hi - lo) * i) / 200;
        points.push({ x, y: newtonEval(this.coefficients, this.xNodes, x) });
      }
      return points;
    },
    initializeData() {
      this.dataPoints = Array.from({ length: this.numPoints }, () => ({ x: 0, y: 0 }));
    },
    randomizeDataPoints() {
      this.dataPoints = this.dataPoints.map(() => ({
        x: parseFloat((Math.random() * 10).toFixed(2)),
        y: parseFloat((Math.random() * 10).toFixed(2)),
      }));
    },
    calculateDividedDifferences() {
      this.coefficients = [];
      this.xNodes = [];
      this.diffRows = [];
      try {
        const n = this.numPoints;
        const xValues = this.dataPoints.map(point => point.x);

        if (new Set(xValues).size !== xValues.length) {
          alert('Duplicate x values detected. Please enter unique x values.');
          return;
        }

        let table = this.dataPoints.map(point => [point.y]);
        for (let j = 1; j < n; j++) {
          for (let i = 0; i < n - j; i++) {
            const numerator = table[i + 1][j - 1] - table[i][j - 1];
            const denominator = this.dataPoints[i + j].x - this.dataPoints[i].x;
            table[i].push(numerator / denominator);
          }
        }

        if (table[0].some(value => !Number.isFinite(value))) {
          alert('The coefficients could not be calculated. Please check your inputs.');
          return;
        }

        this.coefficients = table[0];
        this.xNodes = this.dataPoints.map(point => point.x);

        const fullTable = dividedDiffTable(this.dataPoints);
        this.diffRows = fullTable.map((row, i) => {
          const cells = [this.dataPoints[i].x.toFixed(4), this.dataPoints[i].y.toFixed(4)];
          for (let j = 1; j < fullTable.length - i; j += 1) {
            cells.push(row[j].toFixed(6));
          }
          return cells;
        });
      } catch (error) {
        console.error("Error calculating Newton's Divided Differences:", error);
        alert('An error occurred while calculating the coefficients. Please check your inputs.');
      }
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
      this.initializeData();
    },
  },
};
</script>
