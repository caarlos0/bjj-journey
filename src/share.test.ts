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
