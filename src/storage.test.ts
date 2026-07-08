import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initProfiles,
  loadEvents,
  loadName,
  removeProfileData,
  saveEvents,
  saveName,
} from './storage'
import type { TimelineEvent } from './types'

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
  })
})

const events: TimelineEvent[] = [
  { id: '1', type: 'start', date: '2019-03-11', school: 'Gracie Barra' },
]

describe('initProfiles', () => {
  it('creates a first profile when none exist', () => {
    const { profiles, active } = initProfiles()
    expect(profiles).toHaveLength(1)
    expect(active).toBe(profiles[0])
  })

  it('is idempotent', () => {
    const first = initProfiles()
    const second = initProfiles()
    expect(second).toEqual(first)
  })

  it('migrates legacy single-profile data', () => {
    localStorage.setItem('bjjourney:events', JSON.stringify(events))
    localStorage.setItem('bjjourney:name', 'Carlos')
    const { active } = initProfiles()
    expect(loadEvents(active)).toEqual(events)
    expect(loadName(active)).toBe('Carlos')
    expect(localStorage.getItem('bjjourney:events')).toBeNull()
    expect(localStorage.getItem('bjjourney:name')).toBeNull()
  })
})

describe('per-profile storage', () => {
  it('keeps profiles isolated', () => {
    saveEvents('a', events)
    saveName('a', 'Carlos')
    saveName('b', 'Kiddo')
    expect(loadEvents('a')).toEqual(events)
    expect(loadEvents('b')).toEqual([])
    expect(loadName('b')).toBe('Kiddo')
  })

  it('removes profile data', () => {
    saveEvents('a', events)
    saveName('a', 'Carlos')
    removeProfileData('a')
    expect(loadEvents('a')).toEqual([])
    expect(loadName('a')).toBe('')
  })

  it('survives corrupted json', () => {
    localStorage.setItem('bjjourney:a:events', '{not json')
    expect(loadEvents('a')).toEqual([])
  })
})
