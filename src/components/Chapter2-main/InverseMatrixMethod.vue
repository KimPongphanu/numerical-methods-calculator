<template>
  <MethodLayout title="Inverse Matrix Method">
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
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateInverseMatrix" @reset="reset" />
    </template>

    <template #output>
      <template v-if="solutions.length > 0 && inverse">
        <div class="stats">
          <div v-for="(solution, index) in solutions" :key="'x-' + index" class="stat">
            <div class="label">x{{ index + 1 }}</div>
            <div class="value">{{ solution }}</div>
          </div>
        </div>

        <div>
          <h4>X = A⁻¹ · B</h4>
          <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px">
            <MatrixGrid label="A⁻¹" :matrix="formatMatrix(inverse)" highlight-diagonal />
            <MatrixGrid label="B" :matrix="columnVector(vectorB)" />
            <MatrixGrid label="X" :matrix="columnVector(solutions)" />
          </div>
        </div>
      </template>
      <p v-else class="hint-note">Set n, fill matrix A and vector B, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import { matrix, inv, multiply } from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import MatrixGrid from '../ui/MatrixGrid.vue';

export default {
  name: 'InverseMatrixMethod',
  components: { MethodLayout, MethodButtons, MatrixGrid },
  data() {
    return {
      numVariables: 2,
      matrixA: [],
      vectorB: [],
      solutions: [],
      inverse: null,
    };
  },
  created() {
    this.initializeMatrices();
  },
  methods: {
    formatMatrix(M) {
      return M.map((row) => row.map((value) => Number(value).toFixed(4)));
    },
    columnVector(values) {
      return values.map((value) => [Number(value).toFixed(4)]);
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
    calculateInverseMatrix() {
      this.solutions = [];
      this.inverse = null;
      try {
        const originalMatrix = matrix(this.matrixA);
        const inverseMatrix = inv(originalMatrix);
        const constants = matrix(this.vectorB);

        const result = multiply(inverseMatrix, constants);
        const values = result._data;

        if (values.some(value => !Number.isFinite(value))) {
          alert('The system could not be solved with the given inputs.');
          return;
        }

        this.solutions = values.map(value => value.toFixed(6));
        this.inverse = inverseMatrix.toArray();
      } catch (error) {
        console.error('Error calculating Inverse Matrix Method:', error);
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
