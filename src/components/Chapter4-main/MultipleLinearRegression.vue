<template>
  <MethodLayout title="Multiple Linear Regression">
    <template #inputs>
      <div class="field-row">
        <div class="field">
          <label>Number of data points n</label>
          <input type="number" v-model.number="numPoints" min="2" max="10" @change="initializeData" />
        </div>
        <div class="field">
          <label>Number of features m</label>
          <input type="number" v-model.number="numFeatures" min="1" max="5" @change="initializeData" />
        </div>
      </div>
      <div class="field">
        <label>Data points (features and y)</label>
        <div style="display: flex; flex-direction: column; gap: 6px">
          <div v-for="(point, index) in dataPoints" :key="'point-' + index" style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap">
            <span style="font-size: 12px; width: 22px">{{ index + 1 }}.</span>
            <input
              v-for="featureIndex in numFeatures"
              :key="'feature-' + featureIndex"
              type="number"
              v-model.number="dataPoints[index].features[featureIndex - 1]"
              :placeholder="`x${featureIndex}`"
              style="width: 64px"
            />
            <input type="number" v-model.number="dataPoints[index].y" placeholder="y" style="width: 64px" />
          </div>
        </div>
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeDataPoints" @calculate="calculateMultipleLinearRegression" @reset="reset" />
    </template>

    <template #output>
      <template v-if="coefficients.length > 0">
        <div class="stats">
          <div class="stat">
            <div class="label">R²</div>
            <div class="value">{{ r2.toFixed(4) }}</div>
          </div>
          <div class="stat">
            <div class="label">Intercept a₀</div>
            <div class="value">{{ coefficients[0].toFixed(4) }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="actual y" y-title="predicted ŷ" :width="480" :height="320" />
        </div>

        <div>
          <h4>Regression equation</h4>
          <div class="equation">{{ equationText }}</div>
        </div>

        <ResultTable
          title="Actual vs predicted"
          :headers="['Point', 'Actual y', 'Predicted ŷ', 'Error']"
          :rows="comparisonRows"
        />
      </template>
      <p v-else class="hint-note">Enter the data (n must exceed the number of coefficients), then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import * as math from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { r2FromPairs } from '@/utils/visual.js';

export default {
  name: 'MultipleLinearRegression',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      numPoints: 2,
      numFeatures: 1,
      dataPoints: [],
      coefficients: [],
      predictions: [],
      r2: null,
    };
  },
  computed: {
    equationText() {
      if (!this.coefficients.length) return '';
      const terms = this.coefficients
        .map((c, k) => (k === 0 ? `${c.toFixed(4)}` : `${c >= 0 ? '+ ' : '- '}${Math.abs(c).toFixed(4)}·x${k}`))
        .join(' ');
      return `ŷ = ${terms}`;
    },
    comparisonRows() {
      return this.dataPoints.map((point, index) => [
        index + 1,
        point.y.toFixed(4),
        this.predictions[index].toFixed(4),
        Math.abs(point.y - this.predictions[index]).toFixed(4),
      ]);
    },
    chartSeries() {
      if (!this.coefficients.length) return [];
      const all = [...this.dataPoints.map((p) => p.y), ...this.predictions];
      const lo = Math.min(...all) - 1;
      const hi = Math.max(...all) + 1;

      return [
        { label: 'y = ŷ', type: 'line', points: [{ x: lo, y: lo }, { x: hi, y: hi }], color: '#8d8d8d', dashed: true },
        {
          label: 'points',
          type: 'scatter',
          points: this.dataPoints.map((p, index) => ({ x: p.y, y: this.predictions[index] })),
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
      this.dataPoints = Array.from({ length: this.numPoints }, () => ({
        features: Array.from({ length: this.numFeatures }, () => 0),
        y: 0,
      }));
    },
    randomizeDataPoints() {
      this.dataPoints = this.dataPoints.map(point => ({
        features: point.features.map(() => parseFloat((Math.random() * 10).toFixed(2))),
        y: parseFloat((Math.random() * 10).toFixed(2)),
      }));
    },
    calculateMultipleLinearRegression() {
      this.coefficients = [];
      this.predictions = [];
      this.r2 = null;
      try {
        const X = this.dataPoints.map(point => [1, ...point.features]);
        const Y = this.dataPoints.map(point => point.y);

        const XT = math.transpose(X);
        const XTX = math.multiply(XT, X);
        if (math.det(XTX) === 0) {
          throw new Error('Matrix is singular and cannot be inverted.');
        }
        const XTXInv = math.inv(XTX);
        const XTY = math.multiply(XT, Y);
        const coefficients = math.multiply(XTXInv, XTY);

        if (coefficients.some(value => !Number.isFinite(value))) {
          alert('The coefficients could not be calculated. Please check your inputs.');
          return;
        }

        this.coefficients = coefficients;
        this.predictions = this.dataPoints.map(point =>
          coefficients.reduce((sum, c, k) => sum + c * (k === 0 ? 1 : point.features[k - 1]), 0)
        );
        this.r2 = r2FromPairs(
          this.dataPoints.map((p) => p.y),
          this.predictions
        );
      } catch (error) {
        console.error('Error calculating Multiple Linear Regression:', error);
        alert('An error occurred while calculating the coefficients. Please check your inputs. Matrix might be singular.');
      }
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
      this.initializeData();
    },
  },
};
</script>
