<template>
  <MethodLayout title="Cramer's Rule">
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
      <MethodButtons random-label="Randomize Data" @random="randomizeMatrices" @calculate="calculateCramersRule" @reset="reset" />
    </template>

    <template #output>
      <template v-if="solutions.length > 0 && details">
        <div class="stats">
          <div v-for="(solution, index) in solutions" :key="'x-' + index" class="stat">
            <div class="label">x{{ index + 1 }}</div>
            <div class="value">{{ solution }}</div>
          </div>
          <div class="stat">
            <div class="label">det(A)</div>
            <div class="value">{{ details.detA.toFixed(6) }}</div>
          </div>
        </div>

        <div>
          <h4>Replacement matrices Aᵢ (column i replaced by B)</h4>
          <div style="display: flex; flex-wrap: wrap; align-items: flex-start">
            <MatrixGrid label="A" :matrix="numericA" />
            <MatrixGrid
              v-for="(item, index) in details.items"
              :key="'ai-' + index"
              :label="`A${index + 1}, det = ${item.det.toFixed(6)}`"
              :matrix="formatMatrix(item.matrix)"
            />
          </div>
        </div>

        <ResultTable
          title="Per variable"
          :headers="['Variable', 'det(Aᵢ)', 'xᵢ = det(Aᵢ) / det(A)']"
          :rows="detailRows"
        />
      </template>
      <p v-else class="hint-note">Set n, fill matrix A and vector B, then press Calculate.</p>
    </template>
  </MethodLayout>
</template>

<script>
import { matrix, det } from 'mathjs';
import MethodLayout from '../ui/MethodLayout.vue';
import MethodButtons from '../ui/MethodButtons.vue';
import ResultTable from '../ui/ResultTable.vue';
import MatrixGrid from '../ui/MatrixGrid.vue';

export default {
  name: 'CramersRule',
  components: { MethodLayout, MethodButtons, ResultTable, MatrixGrid },
  data() {
    return {
      numVariables: 2,
      matrixA: [],
      vectorB: [],
      solutions: [],
      details: null,
    };
  },
  computed: {
    numericA() {
      return this.matrixA.map((row) => row.map(Number));
    },
    detailRows() {
      if (!this.details) return [];
      return this.details.items.map((item, index) => [
        `x${index + 1}`,
        item.det.toFixed(6),
        this.solutions[index],
      ]);
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
    calculateCramersRule() {
      this.solutions = [];
      this.details = null;
      try {
        const originalMatrix = matrix(this.matrixA);
        const determinantA = det(originalMatrix);

        if (determinantA === 0) {
          alert('The determinant of the coefficient matrix is zero. The system has no unique solution.');
          return;
        }

        for (let i = 0; i < this.numVariables; i++) {
          const modifiedMatrix = originalMatrix.clone();
          for (let j = 0; j < this.numVariables; j++) {
            modifiedMatrix.set([j, i], this.vectorB[j]);
          }

          const determinantModified = det(modifiedMatrix);
          const solution = determinantModified / determinantA;
          this.solutions.push(solution.toFixed(6));
        }

        this.details = {
          detA: determinantA,
          items: this.solutions.map((_, col) => {
            const modified = originalMatrix.clone();
            for (let row = 0; row < this.numVariables; row += 1) {
              modified.set([row, col], Number(this.vectorB[row]));
            }
            return { matrix: modified.toArray(), det: det(modified) };
          }),
        };
      } catch (error) {
        console.error("Error calculating Cramer's Rule:", error);
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
