<template>
  <div class="matrix-card">
    <div v-if="label" class="matrix-label">{{ label }}</div>
    <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(52px, auto))` }">
      <div
        v-for="(cell, index) in cells"
        :key="index"
        class="matrix-cell"
        :class="{ pivot: highlightDiagonal && index % (columns + 1) === 0 }"
      >
        {{ cell }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatrixGrid',
  props: {
    label: { type: String, default: '' },
    matrix: { type: Array, required: true },
    highlightDiagonal: { type: Boolean, default: false },
  },
  computed: {
    columns() {
      return this.matrix[0] ? this.matrix[0].length : 1;
    },
    cells() {
      return this.matrix.flat();
    },
  },
};
</script>
