import type { TimelineEvent } from './types'

const EVENTS_KEY = 'bjjourney:events'
const NAME_KEY = 'bjjourney:name'

export function loadEvents(): TimelineEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveEvents(events: TimelineEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function loadName(): string {
  return localStorage.getItem(NAME_KEY) ?? ''
}

export function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name)
}
