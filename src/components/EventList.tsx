import { beltAt, describeEvent, sortByDate } from '../describe'
import { useI18n } from '../i18n'
import { EVENT_ICONS } from '../icons'
import type { TimelineEvent } from '../types'

interface EventListProps {
  events: TimelineEvent[]
  onDelete: (id: string) => void
}

export function EventList({ events, onDelete }: EventListProps) {
  const { t, formatDate } = useI18n()
  const sorted = sortByDate(events)

  if (sorted.length === 0) {
    return <p className="event-list-empty">{t('panel.noEvents')}</p>
  }

  return (
    <ul className="event-list">
      {sorted.map((event, i) => (
        <li key={event.id} className="event-list-item">
          <span className="event-list-icon" aria-hidden>
            {EVENT_ICONS[event.type]}
          </span>
          <div className="event-list-body">
            <span className="event-list-text">
              {describeEvent(event, beltAt(sorted, i), t)}
            </span>
            <span className="event-list-date">{formatDate(event.date)}</span>
          </div>
          <button
            type="button"
            className="btn-delete"
            aria-label={t('form.delete')}
            title={t('form.delete')}
            onClick={() => onDelete(event.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
