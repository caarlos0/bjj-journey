import { describe, expect, it } from 'vitest'
import { beltAt, beltAtDate, describeEvent, sortByDate } from './describe'
import type { TKey } from './i18n'
import type { TimelineEvent } from './types'

const t = (key: TKey, vars?: Record<string, string | number>) =>
  vars ? `${key}[${Object.values(vars).join(',')}]` : key

const ev = (partial: Partial<TimelineEvent>): TimelineEvent => ({
  id: partial.id ?? crypto.randomUUID(),
  type: 'milestone',
  date: '2020-01-01',
  ...partial,
})

describe('sortByDate', () => {
  it('sorts events by date ascending', () => {
    const events = [
      ev({ id: 'b', date: '2022-05-01' }),
      ev({ id: 'a', date: '2019-01-01' }),
      ev({ id: 'c', date: '2024-12-31' }),
    ]
    expect(sortByDate(events).map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input', () => {
    const events = [ev({ id: 'b', date: '2022-05-01' }), ev({ id: 'a', date: '2019-01-01' })]
    sortByDate(events)
    expect(events[0].id).toBe('b')
  })
})

describe('beltAt', () => {
  const events = sortByDate([
    ev({ id: 'start', type: 'start', date: '2019-01-01' }),
    ev({ id: 'blue', type: 'belt', belt: 'blue', date: '2021-01-01' }),
    ev({ id: 'comp', type: 'competition', date: '2022-01-01' }),
    ev({ id: 'purple', type: 'belt', belt: 'purple', date: '2024-01-01' }),
  ])

  it('defaults to white before any promotion', () => {
    expect(beltAt(events, 0)).toBe('white')
  })

  it('tracks the belt at each index', () => {
    expect(beltAt(events, 1)).toBe('blue')
    expect(beltAt(events, 2)).toBe('blue')
    expect(beltAt(events, 3)).toBe('purple')
  })
})

describe('beltAtDate', () => {
  const events = [
    ev({ type: 'belt', belt: 'blue', date: '2021-01-01' }),
    ev({ type: 'belt', belt: 'black', date: '2024-01-01' }),
  ]

  it('returns white before the first promotion', () => {
    expect(beltAtDate(events, '2020-06-01')).toBe('white')
  })

  it('returns the belt in effect on the date', () => {
    expect(beltAtDate(events, '2022-01-01')).toBe('blue')
    expect(beltAtDate(events, '2024-01-01')).toBe('black')
    expect(beltAtDate(events, '2030-01-01')).toBe('black')
  })
})

describe('describeEvent', () => {
  it('uses stripe wording on colored belts', () => {
    const text = describeEvent(ev({ type: 'stripe', stripe: 2 }), 'blue', t)
    expect(text).toContain('tl.stripe')
  })

  it('uses degree wording on the black belt', () => {
    const text = describeEvent(ev({ type: 'stripe', stripe: 5 }), 'black', t)
    expect(text).toContain('tl.degree')
  })

  it('falls back when optional fields are missing', () => {
    expect(describeEvent(ev({ type: 'start' }), 'white', t)).toBe('tl.startNoSchool')
    expect(describeEvent(ev({ type: 'seminar' }), 'white', t)).toBe('type.seminar')
    expect(describeEvent(ev({ type: 'milestone' }), 'white', t)).toBe(
      'type.milestone',
    )
  })

  it('uses provided names', () => {
    expect(
      describeEvent(ev({ type: 'start', school: 'Alliance' }), 'white', t),
    ).toBe('tl.start[Alliance]')
    expect(
      describeEvent(ev({ type: 'competition', competitionName: 'Worlds' }), 'white', t),
    ).toBe('Worlds')
  })
})
