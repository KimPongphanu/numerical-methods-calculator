<template>
  <MethodLayout title="Polynomial Regression">
    <template #inputs>
      <div class="field-row">
        <div class="field">
          <label>Number of data points n</label>
          <input type="number" v-model.number="numPoints" min="2" max="10" @change="initializeData" />
        </div>
        <div class="field">
          <label>Polynomial degree d</label>
          <input type="number" v-model.number="degree" min="1" max="5" />
        </div>
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
      <MethodButtons random-label="Randomize Data" @random="randomizeDataPoints" @calculate="calculatePolynomialRegression" @reset="reset" />
    </template>

    <template #output>
      <template v-if="coefficients.length > 0">
        <div class="stats">
          <div class="stat">
            <div class="label">R²</div>
            <div class="value">{{ r2.toFixed(4) }}</div>
          </div>
          <div class="stat">
            <div class="label">Degree</div>
            <div class="value">{{ coefficients.length - 1 }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="y" :width="600" :height="320" />
        </div>

        <div>
          <h4>Polynomial coefficients</h4>
          <div class="equation">
            {{ coefficients.map((c, i) => `a${i} = ${c.toFixed(4)}`).join(',  ') }}
          </div>
        </div>
      </template>
      <p v-else class="hint-note">Enter the data points and degree (n must be greater than d), then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import * as math from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { rSquared } from '@/utils/visual.js';

export default {
  name: 'PolynomialRegression',
  components: { MethodLayout, MethodButtons, FunctionPlot },
  data() {
    return {
      numPoints: 3,
      degree: 2,
      dataPoints: [],
      coefficients: [],
      r2: null,
    };
  },
  computed: {
    predictFunction() {
      const coefficients = this.coefficients;
      return (x) => coefficients.reduce((sum, c, power) => sum + c * Math.pow(x, power), 0);
    },
    chartSeries() {
      if (!this.coefficients.length) return [];
      const xs = this.dataPoints.map((p) => p.x);
      const lo = Math.min(...xs) - 1;
      const hi = Math.max(...xs) + 1;
      const points = [];
      for (let i = 0; i <= 200; i += 1) {
        const x = lo + ((hi - lo) * i) / 200;
        points.push({ x, y: this.predictFunction(x) });
      }

      return [
        { label: 'polynomial fit', type: 'line', points, color: '#d81b60' },
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
    calculatePolynomialRegression() {
      this.coefficients = [];
      this.r2 = null;
      try {
        const n = this.numPoints;
        const degree = Math.floor(this.degree);

        if (degree < 1 || n <= degree) {
          alert('The number of data points must be greater than the polynomial degree.');
          return;
        }

        const xValues = this.dataPoints.map(point => point.x);
        if (new Set(xValues).size !== xValues.length) {
          alert('Duplicate x values detected. Please enter unique x values.');
          return;
        }

        const X = this.dataPoints.map(point =>
          Array.from({ length: degree + 1 }, (_, power) => Math.pow(point.x, power))
        );
        const Y = this.dataPoints.map(point => point.y);

        const XT = math.transpose(X);
        const XTX = math.multiply(XT, X);

        if (math.det(XTX) === 0) {
          alert('The system is singular. Please check your data points.');
          return;
        }

        const rawCoefficients = math.multiply(math.inv(XTX), math.multiply(XT, Y));
        const coefficients = (Array.isArray(rawCoefficients) ? rawCoefficients : rawCoefficients.valueOf()).flat();

        if (coefficients.some(value => !Number.isFinite(value))) {
          alert('The coefficients could not be calculated. Please check your inputs.');
          return;
        }

        this.coefficients = coefficients;
        const predict = (x) => coefficients.reduce((sum, c, power) => sum + c * Math.pow(x, power), 0);
        this.r2 = rSquared(
          this.dataPoints.map((p) => ({ x: p.x, y: p.y })),
          predict
        );
      } catch (error) {
        console.error('Error calculating Polynomial Regression:', error);
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
