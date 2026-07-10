import type { TKey } from './i18n'
import { formatAgeDivision } from './divisions'
import type { BeltColor, TimelineEvent } from './types'

type T = (key: TKey, vars?: Record<string, string | number>) => string

// Belt in effect at each index of a date-sorted event list, in a
// single pass — so stripe events can say which belt they landed on and
// timeline dots can be painted with the belt of that moment.
export function beltsThrough(sorted: TimelineEvent[]): BeltColor[] {
  let belt: BeltColor = 'white'
  return sorted.map((e) => {
    if (e.type === 'belt' && e.belt) belt = e.belt
    return belt
  })
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// True at each index for a 'start' that resumes training after a break,
// so it reads as a "restart" rather than the first start.
export function restartFlags(sorted: TimelineEvent[]): boolean[] {
  let paused = false
  return sorted.map((e) => {
    if (e.type === 'break') {
      paused = true
      return false
    }
    if (e.type === 'start') {
      const resumed = paused
      paused = false
      return resumed
    }
    return false
  })
}

// Belt in effect on a given date, considering only belt events dated on
// or before it.
export function beltAtDate(events: TimelineEvent[], date: string): BeltColor {
  let belt: BeltColor = 'white'
  for (const e of sortByDate(events)) {
    if (e.type === 'belt' && e.belt && e.date <= date) belt = e.belt
  }
  return belt
}

export function describeEvent(
  event: TimelineEvent,
  currentBelt: BeltColor,
  t: T,
  isRestart = false,
): string {
  switch (event.type) {
    case 'start':
      if (isRestart) {
        return event.school
          ? t('tl.restart', { school: event.school })
          : t('tl.restartNoSchool')
      }
      return event.school
        ? t('tl.start', { school: event.school })
        : t('tl.startNoSchool')
    case 'school':
      return t('tl.school', { school: event.school ?? '?' })
    case 'stripe':
      return t(currentBelt === 'black' ? 'tl.degree' : 'tl.stripe', {
        n: t(`ordinal.${event.stripe ?? 1}` as TKey),
        belt: t(`belt.${currentBelt}` as TKey).toLowerCase(),
      })
    case 'belt':
      return t('tl.belt', {
        belt: t(`belt.${event.belt ?? 'white'}` as TKey).toLowerCase(),
      })
    case 'weight':
      return t('tl.weight', {
        weight: event.weight ?? '?',
        unit: event.weightUnit ?? '',
      })
    case 'age':
      return event.ageDivision
        ? t('tl.ageDivision', {
            division: formatAgeDivision(event.ageDivision, t),
          })
        : t('type.age')
    case 'competition':
      return event.competitionName || t('type.competition')
    case 'injury':
      return t('type.injury')
    case 'break':
      return t('tl.break')
    case 'seminar':
      return event.instructor
        ? t('tl.seminar', { name: event.instructor })
        : t('type.seminar')
    case 'milestone':
      return event.title || t('type.milestone')
  }
}

export function sortByDate(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date))
}
