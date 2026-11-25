<template>
  <MethodLayout title="Conjugate Gradient Method">
    <template #inputs>
      <div class="field">
        <label>Number of variables n</label>
        <input type="number" v-model.number="numVariables" min="2" max="4" @change="initializeMatrices" />
      </div>
      <div class="field">
        <label>Symmetric positive-definite matrix A</label>
        <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${numVariables}, 1fr)` }">
          <div v-for="(row, rowIndex) in matrixA" :key="'row-' + rowIndex" style="display: contents">
            <input
              v-for="(value, colIndex) in row"
              :key="'col-' + colIndex"
              type="number"
              v-model.number="matrixA[rowIndex][colIndex]"
            />
          </div>
        </div>
      </div>
      <div class="field">
        <label>Constant vector B</label>
        <div class="matrix-grid" :style="{ gridTemplateColumns: '1fr' }">
          <input
            v-for="(value, index) in vectorB"
            :key="'b-' + index"
            type="number"
            v-model.number="vectorB[index]"
          />
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Initial guess x⁽⁰⁾ (all variables)</label>
          <input type="number" v-model.number="initialValue" />
        </div>
        <div class="field">
          <label>Tolerance ε</label>
          <input type="number" v-model.number="tolerance" step="0.000001" />
        </div>
      </div>
      <div class="field">
        <label>Max iterations</label>
        <input type="number" v-model.number="maxIterations" min="1" />
      </div>
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateConjugateGradient" @reset="reset" />
    </template>

    <template #output>
      <template v-if="solutions.length > 0">
        <div class="stats">
          <div v-for="(solution, index) in solutions" :key="'x-' + index" class="stat">
            <div class="label">x{{ index + 1 }}</div>
            <div class="value">{{ solution }}</div>
          </div>
          <div class="stat">
            <div class="label">Iterations</div>
            <div class="value">{{ iterationHistory.length }}</div>
          </div>
        </div>

        <div class="charts">
          <FunctionPlot :series="chartSeries" x-title="iteration" y-title="residual norm" :width="600" :height="300" />
        </div>

        <ResultTable title="Per iteration" :headers="tableHeaders" :rows="tableRows" />
      </template>
      <p v-else class="hint-note">Set n, fill a symmetric positive-definite A and B, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import FunctionPlot from '../ui/FunctionPlot.vue';

const SERIES_COLORS = ['#124076', '#e67e22', '#2e7d32', '#8e24aa'];

export default {
  name: 'ConjugateGradientMethod',
  components: { MethodLayout, MethodButtons, ResultTable, FunctionPlot },
  data() {
    return {
      numVariables: 2,
      matrixA: [],
      vectorB: [],
      solutions: [],
      initialValue: 0,
      tolerance: 1e-6,
      maxIterations: 100,
      iterationHistory: [],
    };
  },
  computed: {
    tableHeaders() {
      return ['Iteration', ...this.matrixA.map((_, i) => `x${i + 1}`), '‖r‖'];
    },
    tableRows() {
      return this.iterationHistory.map((row) => [
        row.iteration,
        ...row.values.map((value) => value.toFixed(6)),
        row.error.toFixed(6),
      ]);
    },
    chartSeries() {
      const series = [
        {
          label: 'residual ‖r‖',
          type: 'line',
          points: this.iterationHistory.map((row) => ({ x: row.iteration, y: row.error })),
          color: '#d81b60',
        },
      ];
      this.matrixA.forEach((_, i) => {
        series.push({
          label: `x${i + 1}`,
          type: 'line',
          points: this.iterationHistory.map((row) => ({ x: row.iteration, y: row.values[i] })),
          color: SERIES_COLORS[i % SERIES_COLORS.length],
          dashed: true,
        });
      });
      return series;
    },
  },
  created() {
    this.initializeMatrices();
  },
  methods: {
    initializeMatrices() {
      this.matrixA = Array.from({ length: this.numVariables }, () =>
        Array(this.numVariables).fill(0)
      );
      this.vectorB = Array(this.numVariables).fill(0);
    },
    randomizeMatrices() {
      const n = this.numVariables;
      const matrix = Array.from({ length: n }, () => Array(n).fill(0));

      for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
          const value = Number((Math.random() * 5 + 1).toFixed(2));
          matrix[i][j] = value;
          matrix[j][i] = value;
        }

        let rowSum = 0;
        for (let j = 0; j < n; j++) {
          if (i !== j) rowSum += Math.abs(matrix[i][j]);
        }
        matrix[i][i] = Number((rowSum * 1.5 + 1).toFixed(2));
      }

      this.matrixA = matrix.map(row => row.map(value => value.toFixed(2)));
      this.vectorB = this.vectorB.map(() => (Math.random() * 10).toFixed(2));
    },
    calculateConjugateGradient() {
      this.solutions = [];
      this.iterationHistory = [];
      try {
        const n = this.numVariables;
        const A = this.matrixA.map(row => row.map(value => parseFloat(value)));
        const B = this.vectorB.map(value => parseFloat(value));
        let x = Array(n).fill(Number(this.initialValue) || 0);
        let r = B.map((b, i) => b - A[i].reduce((acc, aij, j) => acc + aij * x[j], 0));
        let p = [...r];
        let rsOld = r.reduce((acc, val) => acc + val * val, 0);

        for (let iter = 0; iter < this.maxIterations; iter++) {
          const Ap = A.map(row => row.reduce((acc, aij, j) => acc + aij * p[j], 0));
          const pAp = p.reduce((acc, pi, i) => acc + pi * Ap[i], 0);

          if (!Number.isFinite(pAp) || pAp === 0) {
            if (rsOld === 0) {
              break;
            }
            alert('The method cannot proceed with the given matrix. Please check your inputs.');
            return;
          }

          const alpha = rsOld / pAp;
          x = x.map((xi, i) => xi + alpha * p[i]);
          r = r.map((ri, i) => ri - alpha * Ap[i]);
          const rsNew = r.reduce((acc, val) => acc + val * val, 0);

          this.iterationHistory.push({ iteration: iter + 1, values: [...x], error: Math.sqrt(rsNew) });

          if (Math.sqrt(rsNew) < this.tolerance) {
            break;
          }

          p = r.map((ri, i) => ri + (rsNew / rsOld) * p[i]);
          rsOld = rsNew;
        }

        if (x.some(value => !Number.isFinite(value))) {
          alert('The method produced invalid values. Please check your inputs.');
          return;
        }

        this.solutions = x.map(value => value.toFixed(6));
      } catch (error) {
        console.error('Error calculating Conjugate Gradient Method:', error);
        alert('An error occurred while calculating the solutions. Please check your inputs.');
      }
    },
    reset() {
      Object.assign(this, this.$options.data.call(this));
      this.initializeMatrices();
    },
  },
};
</script>
