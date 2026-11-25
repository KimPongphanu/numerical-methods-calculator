<template>
  <MethodLayout title="Lagrange Polynomial Interpolation">
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
        <label>Evaluate P(x) at x</label>
        <input type="number" v-model.number="targetX" step="0.1" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeDataPoints" @calculate="calculateLagrangePolynomial" @reset="reset" />
    </template>

    <template #output>
      <template v-if="polynomial">
        <div class="stats">
          <div class="stat">
            <div class="label">P(x) at x = {{ targetX }}</div>
            <div class="value">{{ interpolatedValue.toFixed(6) }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="y" :width="600" :height="300" />
        </div>

        <div>
          <h4>Lagrange polynomial</h4>
          <div class="equation">{{ formattedPolynomial }}</div>
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
import { sampleCurve, evalAt } from '@/utils/visual.js';

export default {
  name: 'LagrangePolynomialInterpolation',
  components: { MethodLayout, MethodButtons, FunctionPlot },
  data() {
    return {
      numPoints: 2,
      dataPoints: [],
      polynomial: '',
      targetX: 1,
    };
  },
  computed: {
    formattedPolynomial() {
      return this.polynomial
        .replace(/\s\+\s-/g, ' - ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s*\*\s*\(/g, ' * (')
        .replace(/\s*\/\s*\(/g, '/(');
    },
    interpolatedValue() {
      if (!this.polynomial) return 0;
      try {
        const value = evalAt(this.polynomial, Number(this.targetX));
        return Number.isFinite(value) ? value : 0;
      } catch (error) {
        return 0;
      }
    },
    chartSeries() {
      if (!this.polynomial) return [];
      const xs = this.dataPoints.map((p) => p.x);
      const lo = Math.min(...xs) - 1;
      const hi = Math.max(...xs) + 1;

      return [
        { label: 'P(x)', type: 'line', points: sampleCurve(this.polynomial, lo, hi, 240), color: '#124076' },
        {
          label: 'data points',
          type: 'scatter',
          points: this.dataPoints.map((p) => ({ x: p.x, y: p.y })),
          color: '#e67e22',
          pointRadius: 5,
        },
        {
          label: 'P(x) query',
          type: 'scatter',
          points: [{ x: Number(this.targetX), y: this.interpolatedValue }],
          color: '#d81b60',
          pointRadius: 6,
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
    calculateLagrangePolynomial() {
      this.polynomial = '';
      try {
        const n = this.numPoints;
        let terms = [];

        for (let i = 0; i < n; i++) {
          let term = `${this.dataPoints[i].y}`;
          for (let j = 0; j < n; j++) {
            if (i !== j) {
              const denominator = this.dataPoints[i].x - this.dataPoints[j].x;
              if (denominator === 0) {
                alert('Duplicate x values detected. Please enter unique x values.');
                return;
              }
              term += ` * (x - ${this.dataPoints[j].x.toFixed(2)}) / (${denominator.toFixed(6)})`;
            }
          }
          terms.push(`(${term})`);
        }

        this.polynomial = terms.join(' + ');
      } catch (error) {
        console.error('Error calculating Lagrange Polynomial:', error);
        alert('An error occurred while calculating the polynomial. Please check your inputs.');
      }
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
      this.initializeData();
    },
  },
};
</script>
