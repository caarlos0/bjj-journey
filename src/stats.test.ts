import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeStats, matTime } from './stats'
import type { TKey } from './i18n'
import type { TimelineEvent } from './types'

const t = (key: TKey, vars?: Record<string, string | number>) =>
  vars ? `${key}[${Object.values(vars).join(',')}]` : key

const ev = (partial: Partial<TimelineEvent>): TimelineEvent => ({
  id: crypto.randomUUID(),
  type: 'milestone',
  date: '2020-01-01',
  ...partial,
})

describe('computeStats', () => {
  it('starts at white belt with zero everything', () => {
    const stats = computeStats([])
    expect(stats.currentBelt).toBe('white')
    expect(stats.currentStripes).toBe(0)
    expect(stats.competitions).toBe(0)
  })

  it('counts competitions, medals, wins and losses', () => {
    const stats = computeStats([
      ev({ type: 'competition', date: '2021-01-01', result: 'gold', wins: 3 }),
      ev({
        type: 'competition',
        date: '2022-01-01',
        result: 'silver',
        wins: 2,
        losses: 1,
      }),
      ev({ type: 'competition', date: '2023-01-01', result: 'participated' }),
    ])
    expect(stats.competitions).toBe(3)
    expect(stats.gold).toBe(1)
    expect(stats.silver).toBe(1)
    expect(stats.bronze).toBe(0)
    expect(stats.wins).toBe(5)
    expect(stats.losses).toBe(1)
  })

  it('tracks current belt and stripes, resetting stripes on promotion', () => {
    const stats = computeStats([
      ev({ type: 'stripe', stripe: 4, date: '2020-06-01' }),
      ev({ type: 'belt', belt: 'blue', date: '2021-01-01' }),
      ev({ type: 'stripe', stripe: 1, date: '2022-01-01' }),
      ev({ type: 'stripe', stripe: 2, date: '2023-01-01' }),
    ])
    expect(stats.currentBelt).toBe('blue')
    expect(stats.currentStripes).toBe(2)
  })

  it('ignores event order in the input array', () => {
    const stats = computeStats([
      ev({ type: 'stripe', stripe: 1, date: '2022-01-01' }),
      ev({ type: 'belt', belt: 'blue', date: '2021-01-01' }),
    ])
    expect(stats.currentBelt).toBe('blue')
    expect(stats.currentStripes).toBe(1)
  })
})

describe('matTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts whole time from the first event to today', () => {
    expect(matTime([ev({ type: 'start', date: '2023-01-01' })], t)).toBe(
      'tl.trainingFor[tl.year]',
    )
  })

  it('excludes break→restart gaps from mat time', () => {
    const events = [
      ev({ type: 'start', date: '2020-01-01' }),
      ev({ type: 'break', date: '2021-01-01' }),
      ev({ type: 'start', date: '2023-01-01' }),
    ]
    // 12 active months before the break + 12 after the restart = 2 years,
    // the 2-year break dropped.
    expect(matTime(events, t)).toBe('tl.trainingFor[tl.years[2]]')
  })

  it('stops counting while a break is still open', () => {
    const events = [
      ev({ type: 'start', date: '2020-01-01' }),
      ev({ type: 'break', date: '2021-01-01' }),
    ]
    expect(matTime(events, t)).toBe('tl.trainingFor[tl.year]')
  })

  it('returns null with no events or under a month', () => {
    expect(matTime([], t)).toBeNull()
    expect(matTime([ev({ type: 'start', date: '2023-12-20' })], t)).toBeNull()
  })
})
