<template>
  <div>
    <h4 v-if="title">{{ title }}</h4>
    <table class="result-table">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="'header-' + index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="'cell-' + cellIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ResultTable',
  props: {
    title: { type: String, default: '' },
    headers: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
  },
};
</script>
