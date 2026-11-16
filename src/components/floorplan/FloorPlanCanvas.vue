<template>
  <div class="flex h-full min-h-[420px] flex-col">
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <button type="button" class="btn-secondary text-xs" @click="zoomOut">−</button>
      <span class="text-xs font-bold tabular-nums text-app-muted">{{ Math.round(scale * 100) }}%</span>
      <button type="button" class="btn-secondary text-xs" @click="zoomIn">+</button>
      <button type="button" class="btn-secondary text-xs" @click="fit">{{ fitLabel }}</button>
      <template v-if="!readonly">
        <span class="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-bold"
          :class="tool === 'select' ? 'bg-brand text-white' : 'bg-slate-100 text-app-text'"
          @click="tool = 'select'"
        >
          {{ selectLabel }}
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-bold"
          :class="tool === 'wall' ? 'bg-brand text-white' : 'bg-slate-100 text-app-text'"
          @click="setTool('wall')"
        >
          {{ wallLabel }}
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-bold"
          :class="tool === 'window' ? 'bg-brand text-white' : 'bg-slate-100 text-app-text'"
          @click="setTool('window')"
        >
          {{ windowLabel }}
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-bold"
          :class="tool === 'shelf' ? 'bg-brand text-white' : 'bg-slate-100 text-app-text'"
          @click="setTool('shelf')"
        >
          {{ shelfLabel }}
        </button>
        <button
          type="button"
          class="btn-secondary text-xs"
          :disabled="!selectedDecorId"
          @click="removeSelectedDecor"
        >
          {{ deleteDecorLabel }}
        </button>
      </template>
    </div>
    <p v-if="!readonly && tool === 'wall'" class="mb-1 text-[11px] text-app-muted">{{ wallHint }}</p>
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

        <!-- Simple décor layer -->
        <svg
          class="absolute inset-0"
          :width="floor.canvasWidth"
          :height="floor.canvasHeight"
          :style="{ pointerEvents: tool === 'select' ? 'none' : 'auto' }"
          @pointerdown.stop="onDecorLayer"
        >
          <g v-for="d in floor.decorations" :key="d.id">
            <line
              v-if="d.type === 'wall' && d.x2 != null && d.y2 != null"
              :x1="d.x1"
              :y1="d.y1"
              :x2="d.x2"
              :y2="d.y2"
              stroke="#334155"
              :stroke-width="selectedDecorId === d.id ? 8 : 5"
              stroke-linecap="round"
              class="cursor-pointer"
              style="pointer-events: stroke"
              @pointerdown.stop="selectDecor(d.id)"
            />
            <g
              v-else-if="d.type === 'window'"
              :transform="`translate(${d.x1},${d.y1}) rotate(${d.rotationDeg || 0})`"
              class="cursor-pointer"
              style="pointer-events: all"
              @pointerdown.stop="selectDecor(d.id)"
            >
              <rect
                x="-22"
                y="-6"
                width="44"
                height="12"
                rx="2"
                :fill="selectedDecorId === d.id ? '#bae6fd' : '#e0f2fe'"
                stroke="#0284c7"
                stroke-width="2"
              />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#0284c7" stroke-width="1.5" />
            </g>
            <g
              v-else-if="d.type === 'shelf'"
              :transform="`translate(${d.x1},${d.y1}) rotate(${d.rotationDeg || 0})`"
              class="cursor-pointer"
              style="pointer-events: all"
              @pointerdown.stop="selectDecor(d.id)"
            >
              <rect
                x="-26"
                y="-5"
                width="52"
                height="10"
                rx="1"
                :fill="selectedDecorId === d.id ? '#d6d3d1' : '#a8a29e'"
                stroke="#57534e"
                stroke-width="2"
              />
            </g>
          </g>
          <line
            v-if="wallDraft"
            :x1="wallDraft.x1"
            :y1="wallDraft.y1"
            :x2="wallDraft.x2"
            :y2="wallDraft.y2"
            stroke="#64748b"
            stroke-width="4"
            stroke-dasharray="8 6"
            stroke-linecap="round"
            pointer-events="none"
          />
        </svg>

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
import type { FloorDecorType, FloorGeom, FloorTableGeom } from '@/types/floorPlan'

const props = withDefaults(
  defineProps<{
    floor: FloorGeom
    selectedId: string | null
    fitLabel: string
    selectLabel?: string
    wallLabel?: string
    windowLabel?: string
    shelfLabel?: string
    deleteDecorLabel?: string
    wallHint?: string
    readonly?: boolean
  }>(),
  {
    selectLabel: 'Select',
    wallLabel: 'Wall',
    windowLabel: 'Window',
    shelfLabel: 'Shelf',
    deleteDecorLabel: 'Delete',
    wallHint: 'Click and drag to draw a wall line.',
    readonly: false,
  },
)

const emit = defineEmits<{
  select: [id: string | null]
  move: [id: string, posX: number, posY: number]
  'add-decor': [type: FloorDecorType, x1: number, y1: number, x2?: number, y2?: number]
  'select-decor': [id: string | null]
  'remove-decor': [id: string]
}>()

const viewport = ref<HTMLElement | null>(null)
const scale = ref(0.7)
const tool = ref<'select' | FloorDecorType>('select')
const selectedDecorId = ref<string | null>(null)
const wallDraft = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
const wallStart = ref<{ x: number; y: number } | null>(null)

function setTool(next: FloorDecorType) {
  tool.value = next
  selectedDecorId.value = null
  emit('select-decor', null)
  wallStart.value = null
  wallDraft.value = null
}

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

function localPoint(ev: PointerEvent) {
  const board = (ev.currentTarget as HTMLElement).closest('.relative.origin-top-left') as HTMLElement | null
  const el = board ?? (ev.currentTarget as HTMLElement)
  const rect = el.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(props.floor.canvasWidth, (ev.clientX - rect.left) / scale.value)),
    y: Math.max(0, Math.min(props.floor.canvasHeight, (ev.clientY - rect.top) / scale.value)),
  }
}

function onBg() {
  if (tool.value !== 'select') return
  emit('select', null)
  selectedDecorId.value = null
  emit('select-decor', null)
}

function selectDecor(id: string) {
  selectedDecorId.value = id
  emit('select-decor', id)
  emit('select', null)
}

function removeSelectedDecor() {
  if (!selectedDecorId.value) return
  emit('remove-decor', selectedDecorId.value)
  selectedDecorId.value = null
  emit('select-decor', null)
}

function onDecorLayer(ev: PointerEvent) {
  if (props.readonly || tool.value === 'select') return
  const p = localPoint(ev)
  if (tool.value === 'window' || tool.value === 'shelf') {
    emit('add-decor', tool.value, p.x, p.y)
    return
  }
  if (tool.value !== 'wall') return
  wallStart.value = { x: p.x, y: p.y }
  wallDraft.value = { x1: p.x, y1: p.y, x2: p.x, y2: p.y }
  const target = ev.currentTarget as SVGSVGElement
  target.setPointerCapture(ev.pointerId)
  function move(e: PointerEvent) {
    if (!wallStart.value) return
    const board = target.closest('.relative.origin-top-left') as HTMLElement
    const rect = board.getBoundingClientRect()
    const x = Math.max(0, Math.min(props.floor.canvasWidth, (e.clientX - rect.left) / scale.value))
    const y = Math.max(0, Math.min(props.floor.canvasHeight, (e.clientY - rect.top) / scale.value))
    wallDraft.value = { x1: wallStart.value.x, y1: wallStart.value.y, x2: x, y2: y }
  }
  function up(e: PointerEvent) {
    target.removeEventListener('pointermove', move)
    target.removeEventListener('pointerup', up)
    if (!wallStart.value) return
    const board = target.closest('.relative.origin-top-left') as HTMLElement
    const rect = board.getBoundingClientRect()
    const x = Math.max(0, Math.min(props.floor.canvasWidth, (e.clientX - rect.left) / scale.value))
    const y = Math.max(0, Math.min(props.floor.canvasHeight, (e.clientY - rect.top) / scale.value))
    const dx = x - wallStart.value.x
    const dy = y - wallStart.value.y
    if (Math.hypot(dx, dy) >= 12) {
      emit('add-decor', 'wall', wallStart.value.x, wallStart.value.y, x, y)
    }
    wallStart.value = null
    wallDraft.value = null
  }
  target.addEventListener('pointermove', move)
  target.addEventListener('pointerup', up)
}

function startDrag(ev: PointerEvent, table: FloorTableGeom) {
  emit('select', table.id)
  selectedDecorId.value = null
  emit('select-decor', null)
  if (props.readonly || tool.value !== 'select') return
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
