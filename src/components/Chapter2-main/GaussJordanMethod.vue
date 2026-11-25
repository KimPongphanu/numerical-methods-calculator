<template>
  <MethodLayout title="Gauss Jordan Method">
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
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateGaussJordan" @reset="reset" />
    </template>

    <template #output>
      <template v-if="solutions.length > 0">
        <div class="stats">
          <div v-for="(solution, index) in solutions" :key="'x-' + index" class="stat">
            <div class="label">x{{ index + 1 }}</div>
            <div class="value">{{ solution }}</div>
          </div>
        </div>

        <div>
          <h4>Row reduction steps → RREF [A | B]</h4>
          <div class="step-list">
            <MatrixGrid
              v-for="(step, index) in steps"
              :key="'step-' + index"
              :label="`${index + 1}. ${step.label}`"
              :matrix="formatMatrix(step.matrix)"
              highlight-diagonal
            />
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
import { rrefSteps } from '@/utils/visual.js';

export default {
  name: 'GaussJordan',
  components: { MethodLayout, MethodButtons, MatrixGrid },
  data() {
    return {
      numVariables: 2,
      matrixA: [],
      vectorB: [],
      solutions: [],
      steps: [],
    };
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
    calculateGaussJordan() {
      this.solutions = [];
      this.steps = [];
      try {
        const augmentedMatrix = this.matrixA.map((row, index) => [...row.map(Number), parseFloat(this.vectorB[index])]);
        const n = this.numVariables;

        for (let i = 0; i < n; i++) {
          let maxRow = i;
          for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
              maxRow = k;
            }
          }

          [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];

          const pivot = augmentedMatrix[i][i];
          if (pivot === 0) {
            alert('The system has no unique solution. Please check your inputs.');
            return;
          }

          for (let j = 0; j <= n; j++) {
            augmentedMatrix[i][j] /= pivot;
          }

          for (let k = 0; k < n; k++) {
            if (k !== i) {
              const factor = augmentedMatrix[k][i];
              for (let j = 0; j <= n; j++) {
                augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
              }
            }
          }
        }

        const values = augmentedMatrix.map(row => row[n]);
        if (values.some(value => !Number.isFinite(value))) {
          alert('The system could not be solved with the given inputs.');
          return;
        }

        this.solutions = values.map(value => value.toFixed(6));
        this.steps = rrefSteps(this.matrixA, this.vectorB).steps;
      } catch (error) {
        console.error('Error calculating Gauss Jordan Method:', error);
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
