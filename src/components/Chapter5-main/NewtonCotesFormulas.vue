<template>
  <MethodLayout title="Newton-Cotes Integration Formulas">
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
        <label>Number of points</label>
        <select v-model.number="points">
          <option :value="2">2 points (Trapezoidal)</option>
          <option :value="3">3 points (Simpson 1/3)</option>
          <option :value="4">4 points (Simpson 3/8)</option>
          <option :value="5">5 points (Boole)</option>
        </select>
      </div>
      <div class="field">
        <label>Function f(x)</label>
        <input v-model="functionExpression" placeholder="e.g. x^2 + 3" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Random" @random="randomizeAll" @calculate="calculateNewtonCotes" @reset="reset" />
    </template>

    <template #output>
      <template v-if="result !== null">
        <div class="stats">
          <div class="stat">
            <div class="label">Integral ≈</div>
            <div class="value">{{ result.toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Points</div>
            <div class="value">{{ points }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="f(x)" :width="600" :height="320" />
        </div>

        <ResultTable
          title="Equally spaced nodes and Cotes weights"
          :headers="['i', 'xᵢ', 'f(xᵢ)', 'Weight wᵢ']"
          :rows="nodeRows"
        />
      </template>
      <p v-else class="hint-note">Enter f(x), the interval [a, b] and the number of points, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve, newtonCotes } from '@/utils/visual.js';

export default {
  name: 'NewtonCotesFormulas',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      lowerLimit: 0,
      upperLimit: 1,
      points: 3,
      functionExpression: '',
      result: null,
      nodes: [],
    };
  },
  computed: {
    nodeRows() {
      return this.nodes.map((node, index) => [
        index + 1,
        node.x.toFixed(6),
        node.y.toFixed(6),
        node.weight.toFixed(6),
      ]);
    },
    chartSeries() {
      if (this.result === null) return [];
      const a = this.lowerLimit;
      const b = this.upperLimit;

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
          label: 'Cotes nodes',
          type: 'scatter',
          points: this.nodes.map((node) => ({ x: node.x, y: node.y })),
          color: '#e67e22',
          pointRadius: 5,
        },
      ];
    },
  },
  methods: {
    calculateNewtonCotes() {
      this.result = null;
      this.nodes = [];
      try {
        const expression = (this.functionExpression || '').trim();
        if (!expression) {
          alert('Please enter a function f(x).');
          return;
        }

        const a = this.lowerLimit;
        const b = this.upperLimit;
        const { result, nodes } = newtonCotes(expression, a, b, Math.floor(this.points));

        if (!Number.isFinite(result)) {
          alert('The function could not be evaluated on the given interval. Please check your inputs.');
          return;
        }

        this.result = result;
        this.nodes = nodes;
      } catch (error) {
        console.error('Error calculating Newton-Cotes formula:', error);
        alert('An error occurred while calculating the integral. Please check your inputs.');
      }
    },
    randomizeAll() {
      const functions = ['x^2 + 3', 'sin(x) + 2', 'x^3 - 4*x + 1', 'cos(x) + x', 'e^x - x'];
      this.functionExpression = functions[Math.floor(Math.random() * functions.length)];
      this.lowerLimit = parseFloat((Math.random() * 10).toFixed(2));
      this.upperLimit = parseFloat((Math.random() * 10 + this.lowerLimit).toFixed(2));
      this.points = Math.floor(Math.random() * 4) + 2;
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
