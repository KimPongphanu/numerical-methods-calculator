<template>
  <div class="chart-box">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'FunctionPlot',
  props: {
    series: { type: Array, default: () => [] },
    xTitle: { type: String, default: 'x' },
    yTitle: { type: String, default: 'y' },
    width: { type: Number, default: 560 },
    height: { type: Number, default: 300 },
  },
  data() {
    return { chart: null };
  },
  mounted() {
    this.render();
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy();
  },
  watch: {
    series: {
      deep: true,
      handler() {
        this.render();
      },
    },
  },
  methods: {
    render() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      canvas.width = this.width;
      canvas.height = this.height;

      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const datasets = this.series.map((item, index) => ({
        label: item.label || '',
        data: item.points || [],
        type: item.type || 'line',
        parsing: false,
        showLine: item.showLine !== undefined ? item.showLine : item.type !== 'scatter',
        borderColor: item.color || '#124076',
        backgroundColor: item.fillColor || item.color || '#124076',
        borderWidth: item.borderWidth ?? (item.type === 'scatter' ? 0 : 2),
        borderDash: item.dashed ? [6, 4] : undefined,
        pointRadius: item.pointRadius ?? (item.type === 'scatter' ? 4 : 0),
        pointBackgroundColor: item.color || '#124076',
        fill: item.fill === 'origin' ? 'origin' : item.fill || false,
        tension: 0,
        order: item.order ?? index,
      }));

      this.chart = new Chart(canvas, {
        type: 'scatter',
        data: { datasets },
        options: {
          responsive: false,
          animation: false,
          scales: {
            x: { type: 'linear', title: { display: true, text: this.xTitle } },
            y: { type: 'linear', title: { display: true, text: this.yTitle } },
          },
          plugins: {
            legend: {
              labels: {
                boxWidth: 12,
                font: { size: 11 },
                filter: (item) => item.text !== '',
              },
            },
          },
        },
      });
    },
  },
};
</script>
