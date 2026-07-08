import type { CompetitionResult, EventType } from './types'

export const EVENT_ICONS: Record<EventType, string> = {
  start: '🥋',
  school: '🏫',
  stripe: '🎖️',
  belt: '🥇',
  competition: '🏆',
}

export const RESULT_ICONS: Record<CompetitionResult, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  participated: '🤝',
}
