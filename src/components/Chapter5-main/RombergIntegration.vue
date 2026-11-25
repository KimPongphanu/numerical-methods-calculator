<template>
  <MethodLayout title="Romberg Integration">
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
        <label>Levels k (Romberg rows)</label>
        <input type="number" v-model.number="levels" min="1" max="8" />
      </div>
      <div class="field">
        <label>Function f(x)</label>
        <input v-model="functionExpression" placeholder="e.g. x^2 + 3" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Random" @random="randomizeAll" @calculate="calculateRomberg" @reset="reset" />
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
            <div class="value">{{ error === null ? '—' : error.toFixed(6) }}</div>
          </div>
          <div class="stat">
            <div class="label">Levels</div>
            <div class="value">{{ levels }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="x" y-title="f(x)" :width="600" :height="320" />
        </div>

        <ResultTable title="Romberg triangle" :headers="tableHeaders" :rows="tableRows" />
      </template>
      <p v-else class="hint-note">Enter f(x), the interval [a, b] and the number of levels, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';
import { sampleCurve, rombergTable } from '@/utils/visual.js';

export default {
  name: 'RombergIntegration',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      lowerLimit: 0,
      upperLimit: 1,
      levels: 4,
      functionExpression: '',
      result: null,
      error: null,
      rows: [],
    };
  },
  computed: {
    tableHeaders() {
      const headers = ['k', 'h = (b−a)/2ᵏ'];
      for (let j = 0; j < this.levels; j += 1) {
        headers.push(`R[j=${j}]`);
      }
      return headers;
    },
    tableRows() {
      return this.rows.map((row, i) => {
        const cells = [i, ((this.upperLimit - this.lowerLimit) / 2 ** i).toFixed(6)];
        for (let j = 0; j < this.levels; j += 1) {
          cells.push(row[j] === undefined ? '' : row[j].toFixed(8));
        }
        return cells;
      });
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
      ];
    },
  },
  methods: {
    calculateRomberg() {
      this.result = null;
      this.error = null;
      this.rows = [];
      try {
        const expression = (this.functionExpression || '').trim();
        if (!expression) {
          alert('Please enter a function f(x).');
          return;
        }

        const levels = Math.max(1, Math.min(8, Math.floor(this.levels)));
        const { value, rows, error } = rombergTable(expression, this.lowerLimit, this.upperLimit, levels);

        if (!Number.isFinite(value)) {
          alert('The function could not be evaluated on the given interval. Please check your inputs.');
          return;
        }

        this.result = value;
        this.error = error;
        this.rows = rows;
      } catch (error) {
        console.error('Error calculating Romberg Integration:', error);
        alert('An error occurred while calculating the integral. Please check your inputs.');
      }
    },
    randomizeAll() {
      const functions = ['x^2 + 3', 'sin(x) + 2', 'x^3 - 4*x + 1', 'cos(x) + x', 'e^x - x'];
      this.functionExpression = functions[Math.floor(Math.random() * functions.length)];
      this.lowerLimit = parseFloat((Math.random() * 10).toFixed(2));
      this.upperLimit = parseFloat((Math.random() * 10 + this.lowerLimit).toFixed(2));
      this.levels = Math.floor(Math.random() * 5) + 2;
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
    },
  },
};
</script>
