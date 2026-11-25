<template>
  <MethodLayout title="Cholesky Decomposition Method">
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
    </template>

    <template #buttons>
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateCholeskyDecomposition" @reset="reset" />
    </template>

    <template #output>
      <template v-if="solutions.length > 0 && factors">
        <div class="stats">
          <div v-for="(solution, index) in solutions" :key="'x-' + index" class="stat">
            <div class="label">x{{ index + 1 }}</div>
            <div class="value">{{ solution }}</div>
          </div>
          <div class="stat">
            <div class="label">y (Ly = B)</div>
            <div class="value">{{ factors.y.map((v) => v.toFixed(4)).join(', ') }}</div>
          </div>
        </div>

        <div>
          <h4>A = L · Lᵀ</h4>
          <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px">
            <MatrixGrid label="L (lower)" :matrix="formatMatrix(factors.L)" highlight-diagonal />
            <MatrixGrid label="Lᵀ (transpose)" :matrix="formatMatrix(transposeMatrix(factors.L))" />
          </div>
        </div>
      </template>
      <p v-else class="hint-note">Set n, fill a symmetric positive-definite A and vector B, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import { matrix } from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import MatrixGrid from '../ui/MatrixGrid.vue';

export default {
  name: 'CholeskyDecompositionMethod',
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
  created() {
    this.initializeMatrices();
  },
  methods: {
    formatMatrix(M) {
      return M.map((row) => row.map((value) => Number(value).toFixed(4)));
    },
    transposeMatrix(M) {
      return M[0].map((_, col) => M.map((row) => row[col]));
    },
    initializeMatrices() {
      this.matrixA = Array.from({ length: this.numVariables }, () =>
        Array(this.numVariables).fill(0)
      );
      this.vectorB = Array(this.numVariables).fill(0);
    },
    randomizeMatrices() {
      let symmetricMatrix = Array.from({ length: this.numVariables }, () =>
        Array(this.numVariables).fill(0).map(() => Math.random() * 5 + 1)
      );

      for (let i = 0; i < this.numVariables; i++) {
        for (let j = i; j < this.numVariables; j++) {
          symmetricMatrix[j][i] = symmetricMatrix[i][j];
        }
        symmetricMatrix[i][i] += this.numVariables;
      }

      this.matrixA = symmetricMatrix.map(row => row.map(value => parseFloat(value.toFixed(2))));
      this.vectorB = this.vectorB.map(() => parseFloat((Math.random() * 10).toFixed(2)));
    },
    calculateCholeskyDecomposition() {
      this.solutions = [];
      this.factors = null;
      try {
        const n = this.numVariables;
        const A = matrix(this.matrixA)._data;
        const B = matrix(this.vectorB)._data;

        for (let i = 0; i < n; i++) {
          if (A[i][i] <= 0) {
            alert('The coefficient matrix must be positive definite. Please check your inputs.');
            return;
          }
        }

        let L = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
          for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
              sum += L[i][k] * L[j][k];
            }
            if (i === j) {
              if (A[i][i] - sum <= 0) {
                alert('The coefficient matrix must be positive definite. Please check your inputs.');
                return;
              }
              L[i][j] = Math.sqrt(A[i][i] - sum);
            } else {
              L[i][j] = (A[i][j] - sum) / L[j][j];
            }
          }
        }

        let y = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          let sum = 0;
          for (let k = 0; k < i; k++) {
            sum += L[i][k] * y[k];
          }
          y[i] = (B[i] - sum) / L[i][i];
        }

        let x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
          let sum = 0;
          for (let k = i + 1; k < n; k++) {
            sum += L[k][i] * x[k];
          }
          x[i] = (y[i] - sum) / L[i][i];
        }

        if (x.some(value => !Number.isFinite(value))) {
          alert('The system could not be solved with the given inputs.');
          return;
        }

        this.solutions = x.map(value => value.toFixed(6));
        this.factors = { L, y };
      } catch (error) {
        console.error('Error calculating Cholesky Decomposition Method:', error);
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
