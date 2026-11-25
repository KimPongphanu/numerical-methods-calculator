<template>
  <MethodLayout title="Spline Interpolation">
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
        <label>Evaluate S(x) at x</label>
        <input type="number" v-model.number="targetX" step="0.1" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeDataPoints" @calculate="calculateSplineInterpolation" @reset="reset" />
    </template>

    <template #output>
      <template v-if="splines.length > 0">
        <div class="stats">
          <div class="stat">
            <div class="label">S(x) at x = {{ targetX }}</div>
            <div class="value">{{ interpolatedValue.toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Segments</div>
            <div class="value">{{ splines.length }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="y" :width="600" :height="300" />
        </div>

        <ResultTable
          title="Linear spline segments"
          :headers="['Segment', 'Equation']"
          :rows="splines.map((spline, index) => [index + 1, spline])"
        />
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
import { splineEval } from '@/utils/visual.js';

export default {
  name: 'SplineInterpolation',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      numPoints: 2,
      dataPoints: [],
      splines: [],
      targetX: 1,
    };
  },
  computed: {
    interpolatedValue() {
      if (!this.splines.length) return 0;
      try {
        const value = splineEval(this.dataPoints, Number(this.targetX));
        return Number.isFinite(value) ? value : 0;
      } catch (error) {
        return 0;
      }
    },
    chartSeries() {
      if (!this.splines.length) return [];
      const sorted = [...this.dataPoints].sort((a, b) => a.x - b.x);

      return [
        {
          label: 'S(x) piecewise',
          type: 'line',
          points: sorted.map((p) => ({ x: p.x, y: p.y })),
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
          label: 'S(x) query',
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
    calculateSplineInterpolation() {
      this.splines = [];
      try {
        const n = this.numPoints;
        const xValues = this.dataPoints.map(point => point.x);

        if (new Set(xValues).size !== xValues.length) {
          alert('Duplicate x values detected. Please enter unique x values.');
          return;
        }

        let splines = [];

        for (let i = 0; i < n - 1; i++) {
          const x0 = this.dataPoints[i].x;
          const y0 = this.dataPoints[i].y;
          const x1 = this.dataPoints[i + 1].x;
          const y1 = this.dataPoints[i + 1].y;

          const slope = (y1 - y0) / (x1 - x0);
          if (!Number.isFinite(slope)) {
            alert('The spline could not be calculated. Please check your inputs.');
            return;
          }
          const spline = `y = ${slope.toFixed(6)} * (x - ${x0.toFixed(2)}) + ${y0.toFixed(6)}`;

          splines.push(spline);
        }

        this.splines = splines;
      } catch (error) {
        console.error('Error calculating Spline Interpolation:', error);
        alert('An error occurred while calculating the splines. Please check your inputs.');
      }
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
      this.initializeData();
    },
  },
};
</script>
