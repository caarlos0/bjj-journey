import { useMemo } from 'react'
import { beltsThrough, describeEvent, restartFlags, sortByDate } from '../describe'
import { useI18n } from '../i18n'
import { EVENT_ICONS } from '../icons'
import type { TimelineEvent } from '../types'

interface EventListProps {
  events: TimelineEvent[]
  editingId?: string
  onEdit: (event: TimelineEvent) => void
  onDelete: (id: string) => void
}

export function EventList({ events, editingId, onEdit, onDelete }: EventListProps) {
  const { t, formatDate } = useI18n()
  const sorted = useMemo(() => sortByDate(events), [events])
  const belts = useMemo(() => beltsThrough(sorted), [sorted])
  const restarts = useMemo(() => restartFlags(sorted), [sorted])

  if (sorted.length === 0) {
    return <p className="event-list-empty">{t('panel.noEvents')}</p>
  }

  return (
    <ul className="event-list">
      {sorted.map((event, i) => (
        <li
          key={event.id}
          className={`event-list-item ${event.id === editingId ? 'editing' : ''}`}
        >
          <span className="event-list-icon" aria-hidden>
            {EVENT_ICONS[event.type]}
          </span>
          <div className="event-list-body">
            <span className="event-list-text">
              {describeEvent(event, belts[i], t, restarts[i])}
            </span>
            <span className="event-list-date">{formatDate(event.date)}</span>
          </div>
          <button
            type="button"
            className="btn-edit"
            aria-label={t('form.edit')}
            title={t('form.edit')}
            onClick={() => onEdit(event)}
          >
            ✎
          </button>
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
