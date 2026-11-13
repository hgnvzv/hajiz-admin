<template>
  <Line :data="chartData" :options="mergedOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  labels: string[]
  values: number[]
  label?: string
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label ?? 'الحجوزات',
      data: props.values,
      borderColor: '#2E8B57',
      backgroundColor: 'rgba(46, 139, 87, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: '#2E8B57',
    },
  ],
}))

const mergedOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      rtl: true,
      labels: { font: { family: 'Cairo' } },
    },
  },
  scales: {
    x: {
      ticks: { font: { family: 'Cairo' } },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { font: { family: 'Cairo' } },
    },
  },
}))
</script>
