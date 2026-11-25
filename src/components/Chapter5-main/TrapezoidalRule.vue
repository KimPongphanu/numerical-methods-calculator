<template>
  <MethodLayout title="Trapezoidal Rule">
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
        <label>Function f(x)</label>
        <input v-model="functionExpression" placeholder="e.g. x^2 + 3" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Random" @random="randomizeAll" @calculate="calculateTrapezoidalRule" @reset="reset" />
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
            <div class="label">Trapezoids</div>
            <div class="value">1</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="f(x)" :width="600" :height="320" />
        </div>

        <ResultTable
          title="Trapezoid endpoints"
          :headers="['Point', 'x', 'f(x)', 'Weight']"
          :rows="endpointRows"
        />
      </template>
      <p v-else class="hint-note">Enter f(x) and the interval [a, b], then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import * as math from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve, compositeTrapezoid } from '@/utils/visual.js';

export default {
  name: 'TrapezoidalRule',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      lowerLimit: 0,
      upperLimit: 1,
      functionExpression: '',
      result: null,
      error: null,
    };
  },
  computed: {
    endpointRows() {
      if (this.result === null) return [];
      const f = math.parse(this.functionExpression).compile();
      return [
        ['a', this.lowerLimit.toFixed(4), f.evaluate({ x: this.lowerLimit }).toFixed(6), '1/2'],
        ['b', this.upperLimit.toFixed(4), f.evaluate({ x: this.upperLimit }).toFixed(6), '1/2'],
      ];
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
          label: 'trapezoid nodes',
          type: 'scatter',
          points: [
            { x: a, y: math.parse(this.functionExpression).compile().evaluate({ x: a }) },
            { x: b, y: math.parse(this.functionExpression).compile().evaluate({ x: b }) },
          ],
          color: '#e67e22',
          pointRadius: 5,
        },
      ];
    },
  },
  methods: {
    calculateTrapezoidalRule() {
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
        const f = math.parse(expression).compile();
        const h = b - a;
        const result = (h / 2) * (f.evaluate({ x: a }) + f.evaluate({ x: b }));

        if (!Number.isFinite(result)) {
          alert('The function could not be evaluated on the given interval. Please check your inputs.');
          return;
        }

        this.result = result;
        this.error = Math.abs(result - compositeTrapezoid(expression, a, b, 64));
      } catch (error) {
        console.error('Error calculating Trapezoidal Rule:', error);
        alert('An error occurred while calculating the integral. Please check your inputs.');
      }
    },
    randomizeFunction() {
      const functions = [
        'x^2 + 3',
        'sin(x) + 2',
        'x^3 - 4*x + 1',
        'cos(x) + x',
        'e^x - x',
      ];
      this.functionExpression = functions[Math.floor(Math.random() * functions.length)];
    },
    randomizeDataPoints() {
      this.lowerLimit = parseFloat((Math.random() * 10).toFixed(2));
      this.upperLimit = parseFloat((Math.random() * 10 + this.lowerLimit).toFixed(2));
    },
    randomizeAll() {
      this.randomizeFunction();
      this.randomizeDataPoints();
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
