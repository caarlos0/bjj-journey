import { describe, expect, it } from 'vitest'
import { computeStats } from './stats'
import type { TimelineEvent } from './types'

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

  it('counts competitions, medals and wins', () => {
    const stats = computeStats([
      ev({ type: 'competition', date: '2021-01-01', result: 'gold', wins: 3 }),
      ev({ type: 'competition', date: '2022-01-01', result: 'silver', wins: 2 }),
      ev({ type: 'competition', date: '2023-01-01', result: 'participated' }),
    ])
    expect(stats.competitions).toBe(3)
    expect(stats.gold).toBe(1)
    expect(stats.silver).toBe(1)
    expect(stats.bronze).toBe(0)
    expect(stats.wins).toBe(5)
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
