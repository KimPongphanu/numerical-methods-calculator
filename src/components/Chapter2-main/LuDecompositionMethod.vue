<template>
  <MethodLayout title="LU Decomposition Method">
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
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateLuDecomposition" @reset="reset" />
    </template>

    <template #output>
      <template v-if="solutions.length > 0 && factors">
        <div class="stats">
          <div v-for="(solution, index) in solutions" :key="'x-' + index" class="stat">
            <div class="label">x{{ index + 1 }}</div>
            <div class="value">{{ solution }}</div>
          </div>
          <div class="stat">
            <div class="label">y (Ly = Pb)</div>
            <div class="value">{{ factors.y.map((v) => v.toFixed(4)).join(', ') }}</div>
          </div>
        </div>

        <div>
          <h4>P·A = L · U</h4>
          <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px">
            <MatrixGrid label="L (lower)" :matrix="formatMatrix(factors.L)" highlight-diagonal />
            <MatrixGrid label="U (upper)" :matrix="formatMatrix(factors.U)" />
            <MatrixGrid label="P (permutation)" :matrix="formatMatrix(permutationMatrix)" />
          </div>
        </div>
      </template>
      <p v-else class="hint-note">Set n, fill matrix A and vector B, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import MatrixGrid from '../ui/MatrixGrid.vue';

export default {
  name: 'LuDecompositionMethod',
  components: { MethodLayout, MethodButtons, MatrixGrid },
  data() {
    return {
      numVariables: 2,
      matrixA: [],
      vectorB: [],
      solutions: [],
      factors: null,
    };
  },
  computed: {
    permutationMatrix() {
      if (!this.factors) return [];
      const n = this.factors.permutation.length;
      return this.factors.permutation.map((rowIndex) =>
        Array.from({ length: n }, (_, col) => (col === rowIndex ? 1 : 0))
      );
    },
  },
  created() {
    this.initializeMatrices();
  },
  methods: {
    formatMatrix(M) {
      return M.map((row) => row.map((value) => Number(value).toFixed(4)));
    },
    initializeMatrices() {
      this.matrixA = Array.from({ length: this.numVariables }, () =>
        Array(this.numVariables).fill(0)
      );
      this.vectorB = Array(this.numVariables).fill(0);
    },
    randomizeMatrices() {
      this.matrixA = this.matrixA.map(row => row.map(() => (Math.random() * 20 - 10).toFixed(2)));
      this.vectorB = this.vectorB.map(() => (Math.random() * 20 - 10).toFixed(2));
    },
    calculateLuDecomposition() {
      this.solutions = [];
      this.factors = null;
      try {
        const n = this.numVariables;
        const A = this.matrixA.map(row => row.map(Number));
        const b = this.vectorB.map(Number);
        const L = Array.from({ length: n }, () => Array(n).fill(0));
        const U = A.map(row => [...row]);
        const permutation = Array.from({ length: n }, (_, index) => index);

        for (let i = 0; i < n; i++) {
          let pivotRow = i;
          for (let k = i + 1; k < n; k++) {
            if (Math.abs(U[k][i]) > Math.abs(U[pivotRow][i])) {
              pivotRow = k;
            }
          }

          if (U[pivotRow][i] === 0) {
            alert('The coefficient matrix is singular. The system has no unique solution.');
            return;
          }

          if (pivotRow !== i) {
            [U[i], U[pivotRow]] = [U[pivotRow], U[i]];
            [permutation[i], permutation[pivotRow]] = [permutation[pivotRow], permutation[i]];
            for (let k = 0; k < i; k++) {
              [L[i][k], L[pivotRow][k]] = [L[pivotRow][k], L[i][k]];
            }
          }

          L[i][i] = 1;
          for (let k = i + 1; k < n; k++) {
            const factor = U[k][i] / U[i][i];
            L[k][i] = factor;
            for (let j = i; j < n; j++) {
              U[k][j] -= factor * U[i][j];
            }
          }
        }

        const permutedB = permutation.map(index => b[index]);

        const y = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          let sum = permutedB[i];
          for (let k = 0; k < i; k++) {
            sum -= L[i][k] * y[k];
          }
          y[i] = sum;
        }

        const x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
          let sum = y[i];
          for (let k = i + 1; k < n; k++) {
            sum -= U[i][k] * x[k];
          }
          x[i] = sum / U[i][i];
        }

        if (x.some(value => !Number.isFinite(value))) {
          alert('The system could not be solved with the given inputs.');
          return;
        }

        this.solutions = x.map(value => value.toFixed(6));
        this.factors = { L, U, permutation, y };
      } catch (error) {
        console.error('Error calculating LU Decomposition Method:', error);
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
