import { sortByDate, today } from './describe'
import type { TKey } from './i18n'
import type { BeltColor, TimelineEvent } from './types'

type T = (key: TKey, vars?: Record<string, string | number>) => string

// Whole months between two ISO dates (yyyy-mm-dd), never negative.
function monthsBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  let months = (y2 - y1) * 12 + (m2 - m1)
  if (d2 < d1) months--
  return Math.max(0, months)
}

// "X years on the mats": from the first event to today, minus every
// break→restart gap, so time spent off the mats doesn't count.
export function matTime(events: TimelineEvent[], t: T): string | null {
  const sorted = sortByDate(events)
  if (sorted.length === 0) return null
  let activeSince: string | null = sorted[0].date
  let months = 0
  for (const e of sorted) {
    if (e.type === 'break') {
      if (activeSince) {
        months += monthsBetween(activeSince, e.date)
        activeSince = null
      }
    } else if (e.type === 'start' && !activeSince) {
      activeSince = e.date
    }
  }
  if (activeSince) months += monthsBetween(activeSince, today())
  if (months < 1) return null
  if (months < 12) {
    return t('tl.trainingFor', {
      years: months === 1 ? t('tl.month') : t('tl.months', { n: months }),
    })
  }
  const years = Math.floor(months / 12)
  return t('tl.trainingFor', {
    years: years === 1 ? t('tl.year') : t('tl.years', { n: years }),
  })
}

export function formatWins(wins: number, t: T): string {
  return wins === 1 ? t('tl.win') : t('tl.wins', { n: wins })
}

export function formatLosses(losses: number, t: T): string {
  return losses === 1 ? t('tl.loss') : t('tl.losses', { n: losses })
}

export interface Stats {
  competitions: number
  gold: number
  silver: number
  bronze: number
  wins: number
  losses: number
  currentBelt: BeltColor
  currentStripes: number
}

export function computeStats(events: TimelineEvent[]): Stats {
  const stats: Stats = {
    competitions: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    wins: 0,
    losses: 0,
    currentBelt: 'white',
    currentStripes: 0,
  }
  for (const e of sortByDate(events)) {
    switch (e.type) {
      case 'belt':
        if (e.belt) {
          stats.currentBelt = e.belt
          // Stripes/degrees reset when a new belt is tied.
          stats.currentStripes = 0
        }
        break
      case 'stripe':
        stats.currentStripes = Math.max(stats.currentStripes, e.stripe ?? 0)
        break
      case 'competition':
        stats.competitions++
        stats.wins += e.wins ?? 0
        stats.losses += e.losses ?? 0
        if (e.result === 'gold') stats.gold++
        if (e.result === 'silver') stats.silver++
        if (e.result === 'bronze') stats.bronze++
        break
    }
  }
  return stats
}
