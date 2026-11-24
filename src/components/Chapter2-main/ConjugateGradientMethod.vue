/* eslint-disable */
<template>
    <div class="container">
        <!-- Input Section -->
        <div id="box-1">
            <div id="box-left">
                <!-- Section Title -->
                <div id="box-11">
                    <h3>Conjugate Gradient Method</h3>
                    <label>Number of Variables (n):</label>
                    <input type="number" v-model.number="numVariables" min="2" max="4" @change="initializeMatrices" />
                </div>

                <!-- Coefficient Matrix Section -->
                <div id="box-12" v-if="numVariables > 0">
                    <h4>Coefficient Matrix (A)</h4>
                    <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${numVariables}, 1fr)` }">
                        <div v-for="(row, rowIndex) in matrixA" :key="'row-' + rowIndex">
                            <div v-for="(value, colIndex) in row" :key="'col-' + colIndex" class="matrix-cell">
                                <input type="number" v-model.number="matrixA[rowIndex][colIndex]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Constant Vector Section -->
            <div id="box-right">
                <div id="box-13" v-if="numVariables > 0">
                    <h4>Constant Vector (B)</h4>
                    <div class="vector-section">
                        <div v-for="(value, index) in vectorB" :key="'b-' + index" class="vector-cell">
                            <input type="number" v-model.number="vectorB[index]" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Buttons Section -->
            <div id="box-last">
                <div id="box-14">
                    <button @click="randomizeMatrices">Randomize Test Data</button>
                    <button @click="calculateConjugateGradient">Calculate</button>
                </div>
                <!-- Output Section -->
                <div id="box-2" v-if="solutions.length > 0">
                    <h4>Solutions:</h4>
                    <ul>
                        <li v-for="(solution, index) in solutions" :key="'solution-' + index">
                            x{{ index + 1 }} = {{ solution }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ConjugateGradientMethod",
    data() {
        return {
            numVariables: 2,
            matrixA: [],
            vectorB: [],
            solutions: [],
            tolerance: 1e-6,
            maxIterations: 100
        };
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
            try {
                const n = this.numVariables;
                const A = this.matrixA.map(row => row.map(value => parseFloat(value)));
                const B = this.vectorB.map(value => parseFloat(value));
                let x = Array(n).fill(0);
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
                        alert("The method cannot proceed with the given matrix. Please check your inputs.");
                        return;
                    }

                    const alpha = rsOld / pAp;
                    x = x.map((xi, i) => xi + alpha * p[i]);
                    r = r.map((ri, i) => ri - alpha * Ap[i]);
                    const rsNew = r.reduce((acc, val) => acc + val * val, 0);

                    if (Math.sqrt(rsNew) < this.tolerance) {
                        break;
                    }

                    p = r.map((ri, i) => ri + (rsNew / rsOld) * p[i]);
                    rsOld = rsNew;
                }

                if (x.some(value => !Number.isFinite(value))) {
                    alert("The method produced invalid values. Please check your inputs.");
                    return;
                }

                this.solutions = x.map(value => value.toFixed(6));
            } catch (error) {
                console.error("Error calculating Conjugate Gradient Method:", error);
                alert("An error occurred while calculating the solutions. Please check your inputs.");
            }
        }
    }
};
</script>

<style scoped>
body {
    display: flex;
    flex-direction: row;
    align-items: center;
}

input {
    width: 80px;
    height: 30px;
    margin: 5px;
}

label {
    font-size: 20px;
    margin-bottom: 5px;
}

button {
    width: 150px;
    height: 35px;
    margin-top: 15px;
}

.container {
    position: relative;
    top: 20px;
    width: 1300px;
    height: 460px;
    display: flex;
    flex-direction: row;
    gap: 20px;
    overflow: auto;
}

#box-1 {
    position: relative;
    top: 0;
    margin-top: 40px;
    width: 1200px;
    height: 650px;
    background-color: #FEFBF6;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    border-radius: 8px;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
}

#box-left {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

#box-right {
    display: flex;
    flex-direction: column;
}

#box-last {
    display: flex;
    flex-direction: column;
}

#box-11 {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

#box-12 {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 600px;
}

.matrix-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
}

.matrix-cell {
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 5px;
}

.vector-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.vector-cell {
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 5px;
}

#box-13 {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

#box-14 {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background-color: #f7fef6;
    padding: 10px;
    border-radius: 8px;
    z-index: 10;
}

#box-2 {
    width: 200px;
    height: 200px;
    background-color: #3cff00;
    border-radius: 10px;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 18px;
}

h3,
h4 {
    text-align: center;
}
</style>
