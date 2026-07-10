import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildShareUrl, parseShareHash } from './share'
import type { TimelineEvent } from './types'

beforeEach(() => {
  vi.stubGlobal('location', {
    origin: 'https://bjj.example',
    pathname: '/',
  })
})

const events: TimelineEvent[] = [
  { id: '1', type: 'start', date: '2019-03-11', school: 'Gracie Barra' },
  { id: '2', type: 'belt', date: '2021-06-05', belt: 'blue', notes: 'oss' },
  {
    id: '3',
    type: 'competition',
    date: '2022-04-30',
    competitionName: 'IBJJF Open São Paulo',
    result: 'gold',
    wins: 3,
  },
]

describe('share url', () => {
  it('round-trips name and events through the hash', () => {
    const url = buildShareUrl({ name: 'Carlos Becker', events })
    expect(url.startsWith('https://bjj.example/#j/')).toBe(true)
    expect(url).not.toContain('=')
    expect(url).not.toContain('+')
    const parsed = parseShareHash(new URL(url).hash)
    expect(parsed).toEqual({ name: 'Carlos Becker', events })
  })

  it('round-trips division snapshots without profile inputs', () => {
    const data = {
      name: 'Carlos Becker',
      events,
      divisions: [
        {
          age: 'master-3' as const,
          weight: 'medium-heavy' as const,
          uniform: 'gi' as const,
        },
        {
          age: 'master-3' as const,
          weight: 'heavy' as const,
          uniform: 'no-gi' as const,
        },
      ],
      ageDivisions: [{ date: '2026-01-01', ageDivision: 'master-3' as const }],
    }
    const parsed = parseShareHash(new URL(buildShareUrl(data)).hash)
    expect(parsed).toEqual(data)
    expect(parsed).not.toHaveProperty('birthYear')
    expect(parsed).not.toHaveProperty('weight')
  })

  it('rejects hashes without the payload marker', () => {
    expect(parseShareHash('')).toBeNull()
    expect(parseShareHash('#foo')).toBeNull()
    expect(parseShareHash('#j/')).toBeNull()
    expect(parseShareHash('#j=legacy')).toBeNull()
  })

  it('rejects garbage payloads', () => {
    expect(parseShareHash('#j/not-a-real-payload')).toBeNull()
  })

  it('rejects payloads without an events array', () => {
    const url = buildShareUrl({ name: 'x', events: 'nope' as never })
    expect(parseShareHash(new URL(url).hash)).toBeNull()
  })
})
