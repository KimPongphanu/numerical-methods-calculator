<template>
    <div class="container">
        <!-- Input Section -->
        <div id="box-1">
            <div id="box-left">
                <!-- Section Title -->
                <div id="box-11">
                    <h3>Polynomial Regression</h3>
                    <label>Number of Data Points (n):</label>
                    <input type="number" v-model.number="numPoints" min="2" max="10" @change="initializeData" />
                    <label>Polynomial Degree (d):</label>
                    <input type="number" v-model.number="degree" min="1" max="5" />
                </div>

                <!-- Data Points Section -->
                <div id="box-12" v-if="numPoints > 0">
                    <h4>Data Points</h4>
                    <div class="data-grid" :style="{ gridTemplateColumns: `repeat(${Math.min(numPoints, 5)}, 1fr)` }">
                        <div v-for="(point, index) in dataPoints" :key="'point-' + index" class="data-cell" :style="{ marginBottom: index >= 5 ? '10px' : '0' }">
                            <label>X{{ index + 1 }}:</label>
                            <input type="number" v-model.number="dataPoints[index].x" />
                            <label>Y{{ index + 1 }}:</label>
                            <input type="number" v-model.number="dataPoints[index].y" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Buttons Section -->
            <div id="box-last">
                <div id="box-14">
                    <button @click="randomizeDataPoints">Randomize Test Data</button>
                    <button @click="calculatePolynomialRegression">Calculate</button>
                </div>
                <!-- Output Section -->
                <div id="box-2" v-if="coefficients.length > 0">
                    <h4>Polynomial Regression Coefficients:</h4>
                    <ul>
                        <li v-for="(coef, index) in coefficients" :key="'coef-' + index">
                            a{{ index }} = {{ coef.toFixed(4) }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as math from "mathjs";

export default {
    name: "PolynomialRegression",
    data() {
        return {
            numPoints: 3,
            degree: 2,
            dataPoints: [],
            coefficients: []
        };
    },
    created() {
        this.initializeData();
    },
    methods: {
        initializeData() {
            this.dataPoints = Array.from({ length: this.numPoints }, () => ({ x: 0, y: 0 }));
        },
        randomizeDataPoints() {
            this.dataPoints = this.dataPoints.map(() => ({
                x: parseFloat((Math.random() * 10).toFixed(2)),
                y: parseFloat((Math.random() * 10).toFixed(2))
            }));
        },
        calculatePolynomialRegression() {
            this.coefficients = [];
            try {
                const n = this.numPoints;
                const degree = Math.floor(this.degree);

                if (degree < 1 || n <= degree) {
                    alert("The number of data points must be greater than the polynomial degree.");
                    return;
                }

                const xValues = this.dataPoints.map(point => point.x);
                if (new Set(xValues).size !== xValues.length) {
                    alert("Duplicate x values detected. Please enter unique x values.");
                    return;
                }

                const X = this.dataPoints.map(point =>
                    Array.from({ length: degree + 1 }, (_, power) => Math.pow(point.x, power))
                );
                const Y = this.dataPoints.map(point => point.y);

                const XT = math.transpose(X);
                const XTX = math.multiply(XT, X);

                if (math.det(XTX) === 0) {
                    alert("The system is singular. Please check your data points.");
                    return;
                }

                const rawCoefficients = math.multiply(math.inv(XTX), math.multiply(XT, Y));
                const coefficients = (Array.isArray(rawCoefficients) ? rawCoefficients : rawCoefficients.valueOf()).flat();

                if (coefficients.some(value => !Number.isFinite(value))) {
                    alert("The coefficients could not be calculated. Please check your inputs.");
                    return;
                }

                this.coefficients = coefficients;
            } catch (error) {
                console.error("Error calculating Polynomial Regression:", error);
                alert("An error occurred while calculating the coefficients. Please check your inputs.");
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
    font-size: 16px;
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

.data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
}

.data-cell {
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 5px;
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
    width: 300px;
    height: auto;
    background-color: #3cff00;
    border-radius: 10px;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    text-align: left;
    flex-direction: column;
    align-items: center;
    font-size: 18px;
}

h3,
h4 {
    text-align: center;
}
</style>
