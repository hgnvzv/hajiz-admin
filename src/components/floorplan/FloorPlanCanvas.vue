<template>
  <div class="flex h-full min-h-[420px] flex-col">
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <button type="button" class="btn-secondary text-xs" @click="zoomOut">−</button>
      <span class="text-xs font-bold tabular-nums text-app-muted">{{ Math.round(scale * 100) }}%</span>
      <button type="button" class="btn-secondary text-xs" @click="zoomIn">+</button>
      <button type="button" class="btn-secondary text-xs" @click="fit">{{ fitLabel }}</button>
    </div>
    <div
      ref="viewport"
      class="relative flex-1 overflow-auto rounded-2xl border border-border bg-[#f7f8fa]"
      @pointerdown="onBg"
    >
      <div
        class="relative origin-top-left"
        :style="{
          width: floor.canvasWidth + 'px',
          height: floor.canvasHeight + 'px',
          transform: `scale(${scale})`,
        }"
      >
        <div
          class="absolute inset-0"
          :style="{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }"
        />
        <button
          v-for="table in floor.tables"
          :key="table.id"
          type="button"
          class="absolute select-none border-2 text-[11px] font-black shadow-sm outline-none"
          :class="tableClass(table)"
          :style="tableStyle(table)"
          @pointerdown.stop="startDrag($event, table)"
        >
          <span class="block truncate px-1">{{ table.code }}</span>
          <span class="block text-[10px] font-bold opacity-80">{{ table.capacity }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FloorGeom, FloorTableGeom } from '@/types/floorPlan'

const props = defineProps<{
  floor: FloorGeom
  selectedId: string | null
  fitLabel: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  select: [id: string | null]
  move: [id: string, posX: number, posY: number]
}>()

const viewport = ref<HTMLElement | null>(null)
const scale = ref(0.7)

function zoomIn() {
  scale.value = Math.min(1.6, scale.value + 0.1)
}
function zoomOut() {
  scale.value = Math.max(0.3, scale.value - 0.1)
}
function fit() {
  const el = viewport.value
  if (!el) return
  const sx = (el.clientWidth - 24) / props.floor.canvasWidth
  const sy = (el.clientHeight - 24) / props.floor.canvasHeight
  scale.value = Math.max(0.3, Math.min(1, Math.min(sx, sy) || 0.7))
}

function tableClass(table: FloorTableGeom) {
  const selected = table.id === props.selectedId
  const inactive = !table.isActive
  return [
    selected ? 'border-brand bg-brand text-white z-10' : 'border-slate-300 bg-white text-app-text',
    inactive ? 'opacity-50' : '',
    table.shape === 2 || table.shape === 4 ? 'rounded-full' : 'rounded-lg',
  ]
}

function tableStyle(table: FloorTableGeom) {
  return {
    left: table.posX + 'px',
    top: table.posY + 'px',
    width: table.width + 'px',
    height: table.height + 'px',
    transform: `rotate(${table.rotationDeg}deg)`,
  }
}

function onBg() {
  emit('select', null)
}

function startDrag(ev: PointerEvent, table: FloorTableGeom) {
  emit('select', table.id)
  if (props.readonly) return
  const startX = ev.clientX
  const startY = ev.clientY
  const origX = table.posX
  const origY = table.posY
  const target = ev.currentTarget as HTMLElement
  target.setPointerCapture(ev.pointerId)
  function move(e: PointerEvent) {
    const dx = (e.clientX - startX) / scale.value
    const dy = (e.clientY - startY) / scale.value
    emit('move', table.id, Math.max(0, origX + dx), Math.max(0, origY + dy))
  }
  function up() {
    target.removeEventListener('pointermove', move)
    target.removeEventListener('pointerup', up)
  }
  target.addEventListener('pointermove', move)
  target.addEventListener('pointerup', up)
}

onMounted(fit)
</script>
