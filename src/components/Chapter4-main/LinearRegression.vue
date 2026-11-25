<template>
  <MethodLayout title="Linear Regression">
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
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeDataPoints" @calculate="calculateLinearRegression" @reset="reset" />
    </template>

    <template #output>
      <template v-if="regressionEquation">
        <div class="stats">
          <div class="stat">
            <div class="label">R²</div>
            <div class="value">{{ r2.toFixed(4) }}</div>
          </div>
          <div class="stat">
            <div class="label">Slope a₁</div>
            <div class="value">{{ coefficients[1].toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Intercept a₀</div>
            <div class="value">{{ coefficients[0].toFixed(6) }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="y" :width="600" :height="320" />
        </div>

        <div>
          <h4>Regression equation</h4>
          <div class="equation">{{ regressionEquation }}</div>
        </div>
      </template>
      <p v-else class="hint-note">Enter the data points, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve, rSquared } from '@/utils/visual.js';

export default {
  name: 'LinearRegression',
  components: { MethodLayout, MethodButtons, FunctionPlot },
  data() {
    return {
      numPoints: 2,
      dataPoints: [],
      regressionEquation: '',
      coefficients: [],
      r2: null,
    };
  },
  computed: {
    chartSeries() {
      if (!this.coefficients.length) return [];
      const xs = this.dataPoints.map((p) => p.x);
      const lo = Math.min(...xs) - 1;
      const hi = Math.max(...xs) + 1;
      const intercept = this.coefficients[0];
      const slope = this.coefficients[1];

      return [
        {
          label: 'best fit',
          type: 'line',
          points: sampleCurve(`${intercept} + ${slope} * x`, lo, hi, 2),
          color: '#d81b60',
        },
        {
          label: 'data points',
          type: 'scatter',
          points: this.dataPoints.map((p) => ({ x: p.x, y: p.y })),
          color: '#124076',
          pointRadius: 5,
        },
      ];
    },
  },
  created() {
    this.initializeData();
  },
  methods: {
    initializeData() {
      this.dataPoints = Array.from({ length: this.numPoints }, () => ({ x: 0, y: 0 }));
    },
    randomizeDataPoints() {
      this.dataPoints = this.dataPoints.map(() => ({
        x: parseFloat((Math.random() * 10).toFixed(2)),
        y: parseFloat((Math.random() * 10).toFixed(2)),
      }));
    },
    calculateLinearRegression() {
      this.regressionEquation = '';
      this.coefficients = [];
      this.r2 = null;
      try {
        const n = this.numPoints;
        const sumX = this.dataPoints.reduce((sum, point) => sum + point.x, 0);
        const sumY = this.dataPoints.reduce((sum, point) => sum + point.y, 0);
        const sumXY = this.dataPoints.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumX2 = this.dataPoints.reduce((sum, point) => sum + point.x * point.x, 0);

        const denominator = n * sumX2 - sumX * sumX;
        if (denominator === 0) {
          alert('The x values must not all be equal. Please check your inputs.');
          return;
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        if (!Number.isFinite(slope) || !Number.isFinite(intercept)) {
          alert('The regression could not be calculated. Please check your inputs.');
          return;
        }

        this.regressionEquation = `y = ${slope.toFixed(6)} * x + ${intercept.toFixed(6)}`;
        this.coefficients = [intercept, slope];
        this.r2 = rSquared(
          this.dataPoints.map((p) => ({ x: p.x, y: p.y })),
          (x) => intercept + slope * x
        );
      } catch (error) {
        console.error('Error calculating Linear Regression:', error);
        alert('An error occurred while calculating the regression. Please check your inputs.');
      }
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
      this.initializeData();
    },
  },
};
</script>
