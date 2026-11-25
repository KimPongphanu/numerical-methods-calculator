<template>
  <MethodLayout title="Jacobi Iteration Method">
    <template #inputs>
      <div class="field">
        <label>Number of variables n</label>
        <input type="number" v-model.number="numVariables" min="2" max="4" @change="initializeMatrices" />
      </div>
      <div class="field">
        <label>Coefficient matrix A</label>
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
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateJacobiIteration" @reset="reset" />
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
          <FunctionPlot :series="chartSeries" x-title="iteration" y-title="value" :width="600" :height="300" />
        </div>

        <ResultTable title="Per iteration" :headers="tableHeaders" :rows="tableRows" />
      </template>
      <p v-else class="hint-note">Set n, fill A and B, then press Calculate (Randomize creates a convergent system).</p>
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
  name: 'JacobiIterationMethod',
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
      return ['Iteration', ...this.matrixA.map((_, i) => `x${i + 1}`), 'Error'];
    },
    tableRows() {
      return this.iterationHistory.map((row) => [
        row.iteration,
        ...row.values.map((value) => value.toFixed(6)),
        row.error.toFixed(6),
      ]);
    },
    chartSeries() {
      const n = this.numVariables;
      const series = [];
      for (let i = 0; i < n; i += 1) {
        series.push({
          label: `x${i + 1}`,
          type: 'line',
          points: this.iterationHistory.map((row) => ({ x: row.iteration, y: row.values[i] })),
          color: SERIES_COLORS[i % SERIES_COLORS.length],
        });
      }
      series.push({
        label: 'error',
        type: 'line',
        points: this.iterationHistory.map((row) => ({ x: row.iteration, y: row.error })),
        color: '#d81b60',
        dashed: true,
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
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const value = Number((Math.random() * 10).toFixed(2));
          matrix[i][j] = value;
          rowSum += Math.abs(value);
        }
        matrix[i][i] = Number((rowSum * 1.5 + 1).toFixed(2));
      }

      this.matrixA = matrix.map(row => row.map(value => value.toFixed(2)));
      this.vectorB = this.vectorB.map(() => (Math.random() * 10).toFixed(2));
    },
    calculateJacobiIteration() {
      this.solutions = [];
      this.iterationHistory = [];
      try {
        const n = this.numVariables;
        const A = this.matrixA.map(row => row.map(value => parseFloat(value)));
        const B = this.vectorB.map(value => parseFloat(value));

        if (A.some((row, index) => row[index] === 0)) {
          alert('The coefficient matrix has a zero on the diagonal. Jacobi iteration cannot proceed.');
          return;
        }

        let x = Array(n).fill(Number(this.initialValue) || 0);
        let newX = Array(n).fill(0);
        let iterations = 0;
        let converged = false;

        while (iterations < this.maxIterations) {
          for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
              if (i !== j) {
                sum += A[i][j] * x[j];
              }
            }
            newX[i] = (B[i] - sum) / A[i][i];
          }

          const error = newX.reduce((acc, val, idx) => acc + Math.abs(val - x[idx]), 0);
          this.iterationHistory.push({ iteration: iterations + 1, values: [...newX], error });

          if (error < this.tolerance) {
            x = [...newX];
            converged = true;
            break;
          }

          x = [...newX];
          iterations++;
        }

        if (!converged) {
          alert(`The method did not converge within ${this.maxIterations} iterations.`);
          return;
        }

        if (x.some(value => !Number.isFinite(value))) {
          alert('The method produced invalid values. Please check your inputs.');
          return;
        }

        this.solutions = x.map(value => value.toFixed(6));
      } catch (error) {
        console.error('Error calculating Jacobi Iteration Method:', error);
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
