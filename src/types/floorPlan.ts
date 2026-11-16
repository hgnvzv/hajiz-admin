/** Shared persisted floor/table geometry — same fields as backend DTOs. */

export interface FloorTableGeom {
  id: string
  code: string
  capacity: number
  minGuests: number
  shape: number
  posX: number
  posY: number
  width: number
  height: number
  rotationDeg: number
  isActive: boolean
}

/** Simple sketch: wall line, or window/shelf stamp. */
export type FloorDecorType = 'wall' | 'window' | 'shelf'

export interface FloorDecor {
  id: string
  type: FloorDecorType
  x1: number
  y1: number
  x2?: number
  y2?: number
  rotationDeg?: number
}

export interface FloorGeom {
  id: string
  name: string
  nameAr: string
  levelIndex: number
  canvasWidth: number
  canvasHeight: number
  isActive: boolean
  tables: FloorTableGeom[]
  decorations: FloorDecor[]
}

export const TABLE_SHAPES = [
  { id: 1, key: 'shape.1' },
  { id: 2, key: 'shape.2' },
  { id: 3, key: 'shape.3' },
  { id: 4, key: 'shape.4' },
] as const

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '')
    : `d${Date.now()}${Math.floor(Math.random() * 1e6)}`
}

export function parseDecor(raw: Record<string, unknown>): FloorDecor | null {
  const type = String(raw.type ?? '').toLowerCase()
  if (type !== 'wall' && type !== 'window' && type !== 'shelf') return null
  const x1 = Number(raw.x1 ?? 0) || 0
  const y1 = Number(raw.y1 ?? 0) || 0
  if (type === 'wall') {
    if (raw.x2 == null || raw.y2 == null) return null
    return {
      id: String(raw.id ?? newId()),
      type: 'wall',
      x1,
      y1,
      x2: Number(raw.x2) || 0,
      y2: Number(raw.y2) || 0,
    }
  }
  return {
    id: String(raw.id ?? newId()),
    type,
    x1,
    y1,
    rotationDeg: Number(raw.rotationDeg ?? 0) || 0,
  }
}

export function parseFloor(raw: Record<string, unknown>): FloorGeom {
  const tablesRaw = raw.tables
  const tables = Array.isArray(tablesRaw)
    ? tablesRaw.map((t) => parseTable(t as Record<string, unknown>))
    : []
  const decorRaw = raw.decorations
  const decorations = Array.isArray(decorRaw)
    ? (decorRaw
        .map((d) => parseDecor(d as Record<string, unknown>))
        .filter(Boolean) as FloorDecor[])
    : []
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    nameAr: String(raw.nameAr ?? ''),
    levelIndex: Number(raw.levelIndex ?? 0),
    canvasWidth: Number(raw.canvasWidth ?? 1000) || 1000,
    canvasHeight: Number(raw.canvasHeight ?? 1000) || 1000,
    isActive: raw.isActive !== false,
    tables,
    decorations,
  }
}

export function parseTable(raw: Record<string, unknown>): FloorTableGeom {
  return {
    id: String(raw.id ?? ''),
    code: String(raw.code ?? ''),
    capacity: Number(raw.capacity ?? 4) || 4,
    minGuests: Number(raw.minGuests ?? 1) || 1,
    shape: Number(raw.shape ?? 1) || 1,
    posX: Number(raw.posX ?? 0) || 0,
    posY: Number(raw.posY ?? 0) || 0,
    width: Number(raw.width ?? 80) || 80,
    height: Number(raw.height ?? 80) || 80,
    rotationDeg: Number(raw.rotationDeg ?? 0) || 0,
    isActive: raw.isActive !== false,
  }
}

export function tablePayload(t: FloorTableGeom) {
  return {
    code: t.code,
    capacity: t.capacity,
    minGuests: t.minGuests,
    shape: t.shape,
    posX: t.posX,
    posY: t.posY,
    width: t.width,
    height: t.height,
    rotationDeg: t.rotationDeg,
    isActive: t.isActive,
  }
}

export function floorPayload(f: FloorGeom) {
  return {
    name: f.name,
    nameAr: f.nameAr,
    levelIndex: f.levelIndex,
    canvasWidth: f.canvasWidth,
    canvasHeight: f.canvasHeight,
    isActive: f.isActive,
    decorations: f.decorations.map((d) => ({
      id: d.id,
      type: d.type,
      x1: d.x1,
      y1: d.y1,
      x2: d.x2,
      y2: d.y2,
      rotationDeg: d.rotationDeg,
    })),
  }
}

export function makeDecorId() {
  return newId()
}
