import { sortByDate } from './describe'
import type { BeltColor, TimelineEvent } from './types'

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
