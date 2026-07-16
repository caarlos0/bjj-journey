import { normalizeProfile } from './divisions'
import type { AthleteProfile, TimelineEvent } from './types'

const PROFILES_KEY = 'bjjourney:profiles'
const ACTIVE_KEY = 'bjjourney:active'
const LEGACY_EVENTS_KEY = 'bjjourney:events'
const LEGACY_NAME_KEY = 'bjjourney:name'

const eventsKey = (profile: string) => `bjjourney:${profile}:events`
const nameKey = (profile: string) => `bjjourney:${profile}:name`
const profileKey = (profile: string) => `bjjourney:${profile}:profile`

// Ensures the single profile exists, migrating pre-profile data into
// it. Older versions supported multiple profiles; only the last one is
// kept and the others are ignored (their data stays in localStorage but
// is never shown). Idempotent.
export function initProfile(): string {
  let stored: string[] = []
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILES_KEY) ?? 'null')
    if (Array.isArray(parsed)) stored = parsed
  } catch {
    // fall through to re-init
  }
  let id = stored.length > 0 ? stored[stored.length - 1] : null
  if (!id) {
    id = crypto.randomUUID()
    const legacyEvents = localStorage.getItem(LEGACY_EVENTS_KEY)
    const legacyName = localStorage.getItem(LEGACY_NAME_KEY)
    if (legacyEvents) localStorage.setItem(eventsKey(id), legacyEvents)
    if (legacyName) localStorage.setItem(nameKey(id), legacyName)
    localStorage.removeItem(LEGACY_EVENTS_KEY)
    localStorage.removeItem(LEGACY_NAME_KEY)
  }
  if (stored.length !== 1) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify([id]))
  }
  localStorage.removeItem(ACTIVE_KEY)
  return id
}

export function loadEvents(profile: string): TimelineEvent[] {
  try {
    const raw = localStorage.getItem(eventsKey(profile))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveEvents(profile: string, events: TimelineEvent[]) {
  localStorage.setItem(eventsKey(profile), JSON.stringify(events))
}

export function loadName(profile: string): string {
  return localStorage.getItem(nameKey(profile)) ?? ''
}

export function saveName(profile: string, name: string) {
  localStorage.setItem(nameKey(profile), name)
}

export function loadProfile(profile: string): AthleteProfile {
  try {
    return normalizeProfile(JSON.parse(localStorage.getItem(profileKey(profile)) ?? 'null'))
  } catch {
    return normalizeProfile(null)
  }
}

export function saveProfile(profile: string, data: AthleteProfile) {
  localStorage.setItem(profileKey(profile), JSON.stringify(data))
}
