import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { AGE_DIVISIONS, WEIGHT_DIVISIONS } from './divisions'
import type {
  AgeDivision,
  AgeDivisionChange,
  DivisionSnapshot,
  TimelineEvent,
  Uniform,
  WeightClass,
  WeightDivision,
} from './types'

// The whole timeline travels inside the URL hash, so shared links work
// without any backend. The payload is base64url (only A-Za-z0-9-_ plus
// the "/" marker) because chat apps like WhatsApp cut a link short at
// characters such as "=" and "+", which plain base64/URI encoding uses.

export interface SharedData {
  name: string
  events: TimelineEvent[]
  divisions?: DivisionSnapshot[]
  ageDivisions?: AgeDivisionChange[]
}

export function buildShareUrl(data: SharedData): string {
  const payload = compressToBase64(JSON.stringify(data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${location.origin}${location.pathname}#j/${payload}`
}

export function parseShareHash(hash: string): SharedData | null {
  const match = hash.match(/^#j\/(.+)$/)
  if (!match) return null
  try {
    const b64 = match[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decompressFromBase64(b64)
    if (!json) return null
    const data = JSON.parse(json)
    if (!Array.isArray(data.events)) return null
    const parsed: SharedData = {
      name: typeof data.name === 'string' ? data.name : '',
      events: data.events,
    }
    const divisions = parseDivisions(data.divisions, data.division)
    const ageDivisions = parseAgeDivisions(data.ageDivisions)
    if (divisions) parsed.divisions = divisions
    if (ageDivisions) parsed.ageDivisions = ageDivisions
    return parsed
  } catch {
    return null
  }
}

function isAgeDivision(value: unknown): value is AgeDivision {
  return typeof value === 'string' && AGE_DIVISIONS.includes(value as AgeDivision)
}

function isUniform(value: unknown): value is Uniform {
  return value === 'gi' || value === 'no-gi'
}

function isWeightDivision(value: unknown): value is WeightDivision {
  return (
    value === 'absolute' ||
    (typeof value === 'string' &&
      WEIGHT_DIVISIONS.includes(value as WeightClass))
  )
}

function parseDivision(value: unknown): DivisionSnapshot | undefined {
  if (!value || typeof value !== 'object') return undefined
  const division = value as Record<string, unknown>
  if (!isAgeDivision(division.age) || !isUniform(division.uniform)) return undefined
  const weight = isWeightDivision(division.weight) ? division.weight : undefined
  return { age: division.age, weight, uniform: division.uniform }
}

function parseDivisions(
  value: unknown,
  legacyValue: unknown,
): DivisionSnapshot[] | undefined {
  if (Array.isArray(value)) {
    const divisions = value.flatMap((entry) => {
      const division = parseDivision(entry)
      return division ? [division] : []
    })
    return divisions.length > 0 ? divisions : undefined
  }
  const legacy = parseDivision(legacyValue)
  return legacy ? [legacy] : undefined
}

function parseAgeDivisions(value: unknown): AgeDivisionChange[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const change = entry as Record<string, unknown>
    if (
      typeof change.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(change.date) ||
      !isAgeDivision(change.ageDivision)
    ) {
      return []
    }
    return [{ date: change.date, ageDivision: change.ageDivision }]
  })
}

export function clearShareHash() {
  history.replaceState(null, '', location.pathname + location.search)
}
