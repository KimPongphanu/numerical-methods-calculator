<template>
  <div class="container">
    <div>
      <section class="box1" style="display: flex">
        <h1>NUMERICAL METHOD</h1>
        <h1 v-if="chaptersArray.length > 0">
          >> {{ chaptersArray[selectedChapterIndex].chapter }}
        </h1>
      </section>
    </div>

    <div>
      <section>
        <!-- <div class="menuChapter" v-if="chaptersDB.length">
          <div v-for="(chapther, index) in chaptersDB" :key="index" class="menuChapter-child" @click="selection(index)">
            <h1>{{ chapther.chapter }}</h1>
          </div>
        </div> -->
        <div v-if="isDropdownOpen">
          <navChapter
            @chapter-selected="handleChapterSelected"
            @chapter-array="handleChapterArray"
          />
        </div>
      </section>
    </div>

    <div class="boxChapter">
      <section>
        <div class="dropDown" v-if="isDropdownOpen">
          <div
            class="dropDownChild"
            v-for="(item, index) in chapterLists[selectedChapterIndex]"
            :key="index"
            :style="[
              getItemStyle(chapterLists[selectedChapterIndex].length),
              getItemFontStyle(
                item.method,
                chapterLists[selectedChapterIndex].length,
              ),
            ]"
            @click="ClickedDropdownMenu(index)"
            :class="{ selected: CurrentdropdownMenu === index }"
          >
            <h1>{{ item.method }}</h1>
          </div>
        </div>

        <div class="mainContent">
          <section>
            <!-- <h1
              v-if="chapterLists && chapterLists[selectedChapterIndex] && chapterLists[selectedChapterIndex][CurrentdropdownMenu]">
              {{ chapterLists[selectedChapterIndex][CurrentdropdownMenu].method }}
            </h1> -->
            <div class="childContent">
              <div id="mainMethod">
                <div
                  v-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC1[0]
                  "
                >
                  <BisectionMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC1[1]
                  "
                >
                  <FalsePositionMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC1[2]
                  "
                >
                  <OnePointIterationMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC1[3]
                  "
                >
                  <SecantMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC1[4]
                  "
                >
                  <NewtonRaphson />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[0]
                  "
                >
                  <CramersRule />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[1]
                  "
                >
                  <GaussElimination />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[2]
                  "
                >
                  <GaussJordanMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[3]
                  "
                >
                  <InverseMatrixMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[4]
                  "
                >
                  <LuDecompositionMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[5]
                  "
                >
                  <CholeskyDecompositionMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[6]
                  "
                >
                  <JacobiIterationMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[7]
                  "
                >
                  <GaussSeidelIterationMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC2[8]
                  "
                >
                  <ConjugateGradientMethod />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC3[0]
                  "
                >
                  <NewtonsDividedDifferences />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC3[1]
                  "
                >
                  <LagrangePolynomials />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC3[2]
                  "
                >
                  <SplineInterpolation />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC4[0]
                  "
                >
                  <LinearRegression />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC4[1]
                  "
                >
                  <PolynomialRegression />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC4[2]
                  "
                >
                  <MultipleLinearRegression />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[0]
                  "
                >
                  <TrapezoidalRule />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[1]
                  "
                >
                  <CompositeTrapezoidalRule />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[2]
                  "
                >
                  <SimpsonRule />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[3]
                  "
                >
                  <CompositeSimpsonRule />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[4]
                  "
                >
                  <NewtonCotesFormulas />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[5]
                  "
                >
                  <RombergIntegration />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex][CurrentdropdownMenu] ===
                    methodC5[6]
                  "
                >
                  <GaussQuadrature />
                </div>
                <div
                  v-else-if="
                    chapterLists[selectedChapterIndex] &&
                    chapterLists[selectedChapterIndex].length > 0
                  "
                >
                  <p class="notImplemented">
                    This method is not implemented yet.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import BisectionMethod from './components/Chapter1-main/BisectionMethod.vue'
import FalsePositionMethod from './components/Chapter1-main/FalsePositionMethod.vue'
import NewtonRaphson from './components/Chapter1-main/NewtonRaphson.vue'
import OnePointIterationMethod from './components/Chapter1-main/OnePointIteration.vue'
import SecantMethod from './components/Chapter1-main/SecantMethod.vue'
import CholeskyDecompositionMethod from './components/Chapter2-main/CholeskyDecompositionMethod.vue'
import ConjugateGradientMethod from './components/Chapter2-main/ConjugateGradientMethod.vue'
import CramersRule from './components/Chapter2-main/CramersRule.vue'
import GaussElimination from './components/Chapter2-main/GaussElimination.vue'
import GaussJordanMethod from './components/Chapter2-main/GaussJordanMethod.vue'
import GaussSeidelIterationMethod from './components/Chapter2-main/GaussSeidelIterationMethod.vue'
import InverseMatrixMethod from './components/Chapter2-main/InverseMatrixMethod.vue'
import JacobiIterationMethod from './components/Chapter2-main/JacobiIterationMethod.vue'
import LuDecompositionMethod from './components/Chapter2-main/LuDecompositionMethod.vue'
import LagrangePolynomials from './components/Chapter3-main/LagrangePolynomials.vue'
import NewtonsDividedDifferences from './components/Chapter3-main/NewtonsDividedDifferences.vue'
import SplineInterpolation from './components/Chapter3-main/SplineInterpolation.vue'
import LinearRegression from './components/Chapter4-main/LinearRegression.vue'
import MultipleLinearRegression from './components/Chapter4-main/MultipleLinearRegression.vue'
import PolynomialRegression from './components/Chapter4-main/PolynomialRegression.vue'
import CompositeSimpsonRule from './components/Chapter5-main/CompositeSimpsonRule.vue'
import CompositeTrapezoidalRule from './components/Chapter5-main/CompositeTrapezoidalRule.vue'
import GaussQuadrature from './components/Chapter5-main/GaussQuadrature.vue'
import NewtonCotesFormulas from './components/Chapter5-main/NewtonCotesFormulas.vue'
import RombergIntegration from './components/Chapter5-main/RombergIntegration.vue'
import SimpsonRule from './components/Chapter5-main/SimpsonRule.vue'
import TrapezoidalRule from './components/Chapter5-main/TrapezoidalRule.vue'
import navChapter from './components/navChapter.vue'

import { methods } from './data/methods.js'

export default {
  name: 'App',
  components: {
    navChapter,
    BisectionMethod,
    FalsePositionMethod,
    OnePointIterationMethod,
    SecantMethod,
    NewtonRaphson,
    CramersRule,
    GaussElimination,
    GaussJordanMethod,
    InverseMatrixMethod,
    LuDecompositionMethod,
    CholeskyDecompositionMethod,
    JacobiIterationMethod,
    GaussSeidelIterationMethod,
    ConjugateGradientMethod,
    NewtonsDividedDifferences,
    LagrangePolynomials,
    SplineInterpolation,
    LinearRegression,
    PolynomialRegression,
    MultipleLinearRegression,
    TrapezoidalRule,
    CompositeTrapezoidalRule,
    SimpsonRule,
    CompositeSimpsonRule,
    NewtonCotesFormulas,
    RombergIntegration,
    GaussQuadrature,
  },
  data() {
    return {
      isDropdownOpen: true,
      CurrentdropdownMenu: 0,
      chapterLists: [],
      methodC1: [],
      methodC2: [],
      methodC3: [],
      methodC4: [],
      methodC5: [],
      //bisection method
      selectedChapterIndex: 0,
      solution: null,
      variableCount: 2,
      chaptersArray: [],
    }
  },
  created() {
    this.chapterLists = [
      this.methodC1,
      this.methodC2,
      this.methodC3,
      this.methodC4,
      this.methodC5,
    ]
    methods.forEach((item) => {
      switch (item.chapter) {
        case 1:
          this.methodC1.push(item)
          break
        case 2:
          this.methodC2.push(item)
          break
        case 3:
          this.methodC3.push(item)
          break
        case 4:
          this.methodC4.push(item)
          break
        case 5:
          this.methodC5.push(item)
          break
        default:
          console.warn('Chapter not found in data:', item.chapter)
          break
      }
    })
  },
  methods: {
    handleChapterSelected(index) {
      this.selectedChapterIndex = index // เก็บค่า index ที่ได้รับจาก navChapter
      this.CurrentdropdownMenu = 0
      this.solution = null
    },
    handleChapterArray(array) {
      this.chaptersArray = array
    },
    dropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
    },
    ClickedDropdownMenu(index) {
      this.CurrentdropdownMenu = index
      this.solution = null
    },
    getItemStyle(contentCount) {
      const containerWidth = 1330 // ความกว้างของ dropdown ทั้งหมด
      const widthPerItem = containerWidth / contentCount // คำนวณความกว้างต่อคอนเทนต์
      return {
        width: `${widthPerItem}px`, // ส่งกลับ style ให้กับแต่ละคอนเทนต์
      }
    },
    getItemFontStyle(text, contentCount) {
      const containerWidth = 1330
      const widthPerItem = containerWidth / contentCount
      const available = Math.max(widthPerItem - 10, 40)
      const label = String(text ?? '')
      const estimatedGlyphWidth = 0.62 // สัดส่วนความกว้างต่อตัวอักษรของฟอนต์ monospace
      const fitOneLine =
        available / Math.max(label.length * estimatedGlyphWidth, 1)
      const fontSize = Math.max(12, Math.min(16, fitOneLine)) // ต่ำสุด 12px, สูงสุด 16px
      return {
        fontSize: `${fontSize.toFixed(2)}px`,
        lineHeight: 1.2,
      }
    },
  },
}
</script>

<style>
@font-face {
  font-family: 'Jersey 25';
  src: url('@/assets/fonts/Jersey25-Regular.ttf') format('truetype');
}

#mainMethod {
  position: relative;
  top: 20px;
  width: 1300px;
  height: 480px;
  border-radius: 10px;
  /* background-color: #E9EED9; */
}

body {
  display: flex;
  font-family: sans-serif, Arial;
  max-width: 1366px;
  max-height: 708px;
  width: 1366px;
  height: 708px;
  padding: 0;
  margin-top: -10px;
  background-color: #06113c;
  overflow-x: hidden;
  overflow-y: hidden;
}

.container {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.box1 {
  display: flex;
  width: 1366px;
  height: 80px;
  background-color: #ff8c32;
}

.box1 h1 {
  position: relative;
  top: 20px;
  left: 30px;
  font-size: 48;
  color: white;
}

.menuChapter {
  display: inline-flex;
  flex-direction: row;
  background-color: #ffffff;
}

.menuChapter-child {
  display: flex;
  align-items: center;
  justify-content: center;
  /* width: 241.3333px; */
  width: 273.2px;
  height: 60px;
  font-size: 13px;
  font-family: monospace;
  cursor: pointer;
}

.menuChapter-child:nth-child(even) {
  background-color: #dddddd;
}

.menuChapter-child:nth-child(odd) {
  background-color: #ffffff;
}

.menuChapter:hover > :not(:hover) {
  filter: blur(5px);
  opacity: 0.5;
}

.boxChapter {
  display: flex;
  width: 1360px;
  height: 600px;
  /* background-color: #948979; */
  background-color: #eeedeb;
  overflow: hidden;
}

.dropDown {
  margin-top: 30px;
  width: 1360px;
  height: 36px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.dropDownChild {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-family: monospace;
  height: 50px;
  overflow: auto;
  margin: 2px;
  background-color: #06113c;
  color: #ffffff;
  cursor: pointer;
}

.dropDownChild:hover {
  background-color: #b0b1b2;
  /* เปลี่ยนสีเมื่อ hover เพื่อแสดงการตอบสนองของเมนู */
}

.dropDownChild h1 {
  font-size: inherit;
  margin: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.2;
}

.mainContent {
  width: 1360px;
  /* width: 90vw; */
  height: 480px;
}

.childContent {
  position: relative;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.childContent > div {
  margin: 0;
}

#div-1 {
  width: 400px;
  height: 400px;
  background-color: #ffffffc4;
  border-radius: 10px;
}

.selected {
  background-color: rgb(255, 0, 0);
}

.notImplemented {
  margin-top: 120px;
  font-size: 24px;
  color: #06113c;
}
</style>
