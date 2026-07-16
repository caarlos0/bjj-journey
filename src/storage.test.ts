import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initProfile,
  loadEvents,
  loadName,
  loadProfile,
  saveEvents,
  saveName,
  saveProfile,
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

describe('initProfile', () => {
  it('creates a profile when none exist', () => {
    const id = initProfile()
    expect(id).toBeTruthy()
    expect(localStorage.getItem('bjjourney:profiles')).toBe(
      JSON.stringify([id]),
    )
  })

  it('is idempotent', () => {
    const first = initProfile()
    const second = initProfile()
    expect(second).toBe(first)
  })

  it('migrates legacy single-profile data', () => {
    localStorage.setItem('bjjourney:events', JSON.stringify(events))
    localStorage.setItem('bjjourney:name', 'Carlos')
    const id = initProfile()
    expect(loadEvents(id)).toEqual(events)
    expect(loadName(id)).toBe('Carlos')
    expect(localStorage.getItem('bjjourney:events')).toBeNull()
    expect(localStorage.getItem('bjjourney:name')).toBeNull()
  })

  it('keeps only the last of multiple profiles', () => {
    localStorage.setItem('bjjourney:profiles', JSON.stringify(['a', 'b', 'c']))
    localStorage.setItem('bjjourney:active', 'a')
    saveEvents('c', events)
    const id = initProfile()
    expect(id).toBe('c')
    expect(localStorage.getItem('bjjourney:profiles')).toBe(
      JSON.stringify(['c']),
    )
    expect(localStorage.getItem('bjjourney:active')).toBeNull()
    expect(loadEvents(id)).toEqual(events)
  })
})

describe('per-profile storage', () => {
  it('keeps profiles isolated', () => {
    saveEvents('a', events)
    saveName('a', 'Carlos')
    saveName('b', 'Kiddo')
    saveProfile('a', {
      birthYear: 1985,
      sex: 'male',
    })
    expect(loadEvents('a')).toEqual(events)
    expect(loadEvents('b')).toEqual([])
    expect(loadName('b')).toBe('Kiddo')
    expect(loadProfile('a').birthYear).toBe(1985)
    expect(loadProfile('b')).toEqual({})
  })

  it('survives corrupted json', () => {
    localStorage.setItem('bjjourney:a:events', '{not json')
    localStorage.setItem('bjjourney:a:profile', '{not json')
    expect(loadEvents('a')).toEqual([])
    expect(loadProfile('a')).toEqual({})
  })
})
