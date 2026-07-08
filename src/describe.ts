import type { TKey } from './i18n'
import type { BeltColor, TimelineEvent } from './types'

type T = (key: TKey, vars?: Record<string, string | number>) => string

// Walks events in date order tracking the current belt, so stripe
// events can say which belt they landed on and timeline dots can be
// painted with the belt of that moment.
export function beltAt(
  events: TimelineEvent[],
  index: number,
): BeltColor {
  let belt: BeltColor = 'white'
  for (let i = 0; i <= index; i++) {
    const e = events[i]
    if (e.type === 'belt' && e.belt) belt = e.belt
  }
  return belt
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
): string {
  switch (event.type) {
    case 'start':
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
    case 'competition':
      return event.competitionName || t('type.competition')
    case 'injury':
      return t('type.injury')
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
