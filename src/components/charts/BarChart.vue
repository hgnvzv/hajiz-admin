<template>
  <Bar :data="chartData" :options="mergedOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  revenue: number[]
  commission: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'الإيرادات',
      data: props.revenue,
      backgroundColor: 'rgba(108, 99, 255, 0.75)',
      borderRadius: 8,
    },
    {
      label: 'العمولة',
      data: props.commission,
      backgroundColor: 'rgba(16, 185, 129, 0.75)',
      borderRadius: 8,
    },
  ],
}))

const mergedOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      rtl: true,
      labels: { font: { family: 'Cairo' } },
    },
  },
  scales: {
    x: {
      stacked: false,
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
