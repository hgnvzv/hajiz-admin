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

export interface FloorGeom {
  id: string
  name: string
  nameAr: string
  levelIndex: number
  canvasWidth: number
  canvasHeight: number
  isActive: boolean
  tables: FloorTableGeom[]
}

export const TABLE_SHAPES = [
  { id: 1, key: 'shape.1' },
  { id: 2, key: 'shape.2' },
  { id: 3, key: 'shape.3' },
  { id: 4, key: 'shape.4' },
] as const

export function parseFloor(raw: Record<string, unknown>): FloorGeom {
  const tablesRaw = raw.tables
  const tables = Array.isArray(tablesRaw)
    ? tablesRaw.map((t) => parseTable(t as Record<string, unknown>))
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
  }
}
