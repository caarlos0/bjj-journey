import { sortByDate } from './describe'
import type { TKey } from './i18n'
import type { BeltColor, TimelineEvent } from './types'

type T = (key: TKey, vars?: Record<string, string | number>) => string

// "X years on the mats", from the first event to today.
export function matTime(firstDate: string, t: T): string | null {
  const [y, m, d] = firstDate.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const now = new Date()
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  if (now.getDate() < start.getDate()) months--
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

export interface Stats {
  competitions: number
  gold: number
  silver: number
  bronze: number
  wins: number
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
        if (e.result === 'gold') stats.gold++
        if (e.result === 'silver') stats.silver++
        if (e.result === 'bronze') stats.bronze++
        break
    }
  }
  return stats
}
