<template>
    <div class="container">
        <!-- Input Section -->
        <div id="box-1">
            <div id="box-left">
                <!-- Section Title -->
                <div id="box-11">
                    <h3>Trapezoidal Rule</h3>
                    <label>Lower Limit (a):</label>
                    <input type="number" v-model.number="lowerLimit" />
                    <label>Upper Limit (b):</label>
                    <input type="number" v-model.number="upperLimit" />
                </div>

                <!-- Function Section -->
                <div id="box-12">
                    <h4>Function f(x)</h4>
                    <input type="text" v-model="functionExpression" placeholder="Enter function of x (e.g., x^2 + 3)" />
                    <button @click="randomizeFunction">Randomize Function</button>
                </div>
            </div>

            <!-- Buttons Section -->
            <div id="box-last">
                <div id="box-14">
                    <button @click="randomizeDataPoints">Randomize Test Data</button>
                    <button @click="calculateTrapezoidalRule">Calculate</button>
                </div>
                <!-- Output Section -->
                <div id="box-2" v-if="result !== null">
                    <h4>Trapezoidal Rule Result:</h4>
                    <p>Approximate Integral Value: {{ result.toFixed(4) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as math from "mathjs";

export default {
    name: "TrapezoidalRule",
    data() {
        return {
            lowerLimit: 0,
            upperLimit: 1,
            functionExpression: "",
            result: null
        };
    },
    methods: {
        calculateTrapezoidalRule() {
            this.result = null;
            try {
                const expression = (this.functionExpression || "").trim();
                if (!expression) {
                    alert("Please enter a function f(x).");
                    return;
                }

                const a = this.lowerLimit;
                const b = this.upperLimit;
                const f = math.parse(expression).compile();
                const h = b - a;
                const result = (h / 2) * (f.evaluate({ x: a }) + f.evaluate({ x: b }));

                if (!Number.isFinite(result)) {
                    alert("The function could not be evaluated on the given interval. Please check your inputs.");
                    return;
                }

                this.result = result;
            } catch (error) {
                console.error("Error calculating Trapezoidal Rule:", error);
                alert("An error occurred while calculating the integral. Please check your inputs.");
            }
        },
        randomizeFunction() {
            const functions = [
                "x^2 + 3",
                "sin(x) + 2",
                "x^3 - 4*x + 1",
                "cos(x) + x",
                "e^x - x"
            ];
            this.functionExpression = functions[Math.floor(Math.random() * functions.length)];
        },
        randomizeDataPoints() {
            this.lowerLimit = parseFloat((Math.random() * 10).toFixed(2));
            this.upperLimit = parseFloat((Math.random() * 10 + this.lowerLimit).toFixed(2));
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
    width: 150px;
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
