import { describe, expect, it } from 'vitest'
import {
  ageDivisionChanges,
  ageDivisionForYear,
  convertWeight,
  divisionAt,
  eligibleAgeDivisions,
  formatDivision,
  formatDivisions,
  normalizeProfile,
  weightAtDate,
  weightDivisionFor,
} from './divisions'
import type { TKey } from './i18n'
import type { AthleteProfile, TimelineEvent } from './types'

const t = (key: TKey, vars?: Record<string, string | number>) =>
  vars ? `${key}[${Object.values(vars).join(',')}]` : key

const profile: AthleteProfile = {
  birthYear: 1985,
  sex: 'male',
  weightUnit: 'kg',
  uniforms: ['gi'],
}

const weight = (
  date: string,
  value: number,
  unit: 'kg' | 'lb' = 'kg',
): TimelineEvent => ({
  id: `${date}-${value}`,
  type: 'weight',
  date,
  weight: value,
  weightUnit: unit,
})

describe('IBJJF age divisions', () => {
  it('defaults profiles to Gi and keeps selected uniforms in Gi-first order', () => {
    expect(normalizeProfile(null).uniforms).toEqual(['gi'])
    expect(normalizeProfile({ uniform: 'no-gi' }).uniforms).toEqual(['no-gi'])
    expect(normalizeProfile({ uniforms: ['no-gi', 'gi'] }).uniforms).toEqual([
      'gi',
      'no-gi',
    ])
  })

  it('uses birth year across kids, juvenile, adult, and master boundaries', () => {
    expect(ageDivisionForYear(2022, 2026)).toBe('mighty-mite-1')
    expect(ageDivisionForYear(2011, 2026)).toBe('teen-3')
    expect(ageDivisionForYear(2010, 2026)).toBe('juvenile')
    expect(ageDivisionForYear(2008, 2026)).toBe('adult')
    expect(ageDivisionForYear(1996, 2026)).toBe('master-1')
    expect(ageDivisionForYear(1990, 2026)).toBe('master-2')
    expect(ageDivisionForYear(1965, 2026)).toBe('master-7')
  })

  it('derives only progression changes in the visible date range', () => {
    expect(ageDivisionChanges(2010, '2024-06-01', 2028)).toEqual([
      { date: '2024-01-01', ageDivision: 'teen-2' },
      { date: '2025-01-01', ageDivision: 'teen-3' },
      { date: '2026-01-01', ageDivision: 'juvenile' },
      { date: '2028-01-01', ageDivision: 'adult' },
    ])
  })

  it('offers only age divisions the athlete may enter', () => {
    expect(eligibleAgeDivisions(1985, '2026-06-01')).toEqual([
      'adult',
      'master-1',
      'master-2',
      'master-3',
    ])
    expect(eligibleAgeDivisions(2010, '2026-06-01')).toEqual(['juvenile'])
  })
})

describe('IBJJF weight divisions', () => {
  it('formats Absolute as a manual competition division', () => {
    expect(
      formatDivision(
        { age: 'adult', weight: 'absolute', uniform: 'gi' },
        t,
      ),
    ).toBe(
      'division.age.adult · division.weight.absolute · division.uniform.gi',
    )
  })

  it('combines matching Gi and No-Gi divisions', () => {
    expect(
      formatDivisions(
        [
          { age: 'master-2', weight: 'ultra-heavy', uniform: 'gi' },
          { age: 'master-2', weight: 'ultra-heavy', uniform: 'no-gi' },
        ],
        t,
      ),
    ).toEqual([
      'division.age.master-2 · division.weight.ultra-heavy · division.uniform.both',
    ])
  })

  it('keeps different Gi and No-Gi weight classes separate', () => {
    expect(
      formatDivisions(
        [
          { age: 'master-2', weight: 'medium-heavy', uniform: 'gi' },
          { age: 'master-2', weight: 'heavy', uniform: 'no-gi' },
        ],
        t,
      ),
    ).toHaveLength(2)
  })

  it('converts displayed weights when the preferred unit changes', () => {
    expect(convertWeight(80, 'kg', 'lb')).toBe(176.4)
    expect(convertWeight(176.4, 'lb', 'kg')).toBe(80)
  })

  it('uses the published adult Gi limits in both units', () => {
    expect(weightDivisionFor(57.5, 'kg', 'adult', 'male', 'gi')).toBe('rooster')
    expect(weightDivisionFor(57.6, 'kg', 'adult', 'male', 'gi')).toBe(
      'light-feather',
    )
    expect(weightDivisionFor(127, 'lb', 'adult', 'male', 'gi')).toBe('rooster')
    expect(weightDivisionFor(127.1, 'lb', 'adult', 'male', 'gi')).toBe(
      'light-feather',
    )
  })

  it('uses female and juvenile No-Gi tables', () => {
    expect(weightDivisionFor(76.5, 'kg', 'adult', 'female', 'no-gi')).toBe('heavy')
    expect(weightDivisionFor(76.6, 'kg', 'adult', 'female', 'no-gi')).toBe(
      'super-heavy',
    )
    expect(weightDivisionFor(51.5, 'kg', 'juvenile', 'male', 'no-gi')).toBe(
      'rooster',
    )
  })

  it('uses age-specific kids limits', () => {
    expect(weightDivisionFor(12, 'kg', 'mighty-mite-1', 'female', 'gi')).toBe(
      'rooster',
    )
    expect(weightDivisionFor(12.1, 'kg', 'mighty-mite-1', 'male', 'gi')).toBe(
      'light-feather',
    )
    expect(weightDivisionFor(94.6, 'lb', 'teen-3', 'male', 'no-gi')).toBe('rooster')
  })
})

describe('dated divisions', () => {
  const events = [
    weight('2023-01-01', 80),
    weight('2025-01-01', 88),
    weight('2027-01-01', 95),
  ]

  it('uses the latest weight on or before the target date', () => {
    expect(weightAtDate(events, '2024-01-01')).toEqual({ weight: 80, unit: 'kg' })
    expect(weightAtDate(events, '2026-01-01')).toEqual({ weight: 88, unit: 'kg' })
    expect(weightAtDate(events, '2022-01-01')).toBeNull()
  })

  it('ignores malformed imported weight units', () => {
    const malformed = weight('2025-01-01', 88)
    malformed.weightUnit = 'stone' as never
    expect(weightAtDate([malformed], '2026-01-01')).toBeNull()
    expect(divisionAt([malformed], profile, '2026-01-01')).toEqual({
      age: 'master-3',
      weight: undefined,
      uniform: 'gi',
    })
  })

  it('calculates a complete division snapshot at the event date', () => {
    expect(divisionAt(events, profile, '2026-06-01')).toEqual({
      age: 'master-3',
      weight: 'medium-heavy',
      uniform: 'gi',
    })
  })
})
