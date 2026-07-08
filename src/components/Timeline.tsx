import { forwardRef, useMemo } from 'react'
import { beltsThrough, describeEvent, sortByDate } from '../describe'
import { useI18n } from '../i18n'
import { EVENT_ICONS, RESULT_ICONS } from '../icons'
import { computeStats, formatWins, matTime } from '../stats'
import { BELT_STYLES, type TimelineEvent } from '../types'
import { Belt } from './Belt'
import { BeltStrip } from './BeltStrip'
import { StatChips } from './StatChips'

interface TimelineProps {
  events: TimelineEvent[]
  name: string
  photos?: Record<string, string>
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline({ events, name, photos = {} }, ref) {
    const { t, formatDate } = useI18n()
    const sorted = useMemo(() => sortByDate(events), [events])
    const belts = useMemo(() => beltsThrough(sorted), [sorted])
    const stats = useMemo(() => computeStats(sorted), [sorted])

    if (sorted.length === 0) {
      return (
        <div className="timeline-empty">
          {t('tl.empty')
            .split('\n')
            .map((line, i) => (
              <p key={i}>{line}</p>
            ))}
        </div>
      )
    }

    const duration = matTime(sorted[0].date, t)

    return (
      <div className="timeline-card" ref={ref}>
        <header className="timeline-header">
          <BeltStrip className="timeline-header-belt" />
          <h2>{t('tl.title')}</h2>
          {name && <p className="timeline-name">{name}</p>}
          {duration && <p className="timeline-duration">{duration}</p>}
          <div className="timeline-current-belt">
            <Belt
              color={stats.currentBelt}
              stripes={stats.currentStripes}
              width={160}
            />
          </div>
          <StatChips stats={stats} className="timeline-stats" />
        </header>

        <ol className="timeline">
          {sorted.map((event, i) => {
            const belt = belts[i]
            const dotColor =
              event.type === 'belt' && event.belt
                ? BELT_STYLES[event.belt].base
                : BELT_STYLES[belt].base
            return (
              <li key={event.id} className="timeline-item">
                <span
                  className="timeline-dot"
                  style={{ backgroundColor: dotColor }}
                />
                <div className="timeline-content">
                  <time className="timeline-date">{formatDate(event.date)}</time>
                  <p className="timeline-text">
                    <span className="timeline-icon" aria-hidden>
                      {event.type === 'competition' && event.result
                        ? RESULT_ICONS[event.result]
                        : EVENT_ICONS[event.type]}
                    </span>
                    {describeEvent(event, belt, t)}
                  </p>
                  {event.type === 'belt' && event.belt && (
                    <Belt color={event.belt} />
                  )}
                  {event.type === 'stripe' && (
                    <Belt color={belt} stripes={event.stripe ?? 1} />
                  )}
                  {event.type === 'competition' && (
                    <p className="timeline-sub">
                      {event.result && t(`result.${event.result}`)}
                      {event.wins ? ` · ${formatWins(event.wins, t)}` : ''}
                    </p>
                  )}
                  {event.notes && <p className="timeline-notes">{event.notes}</p>}
                  {photos[event.id] && (
                    <img className="timeline-photo" src={photos[event.id]} alt="" />
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <footer className="timeline-footer">🥋 {t('export.footer')}</footer>
      </div>
    )
  },
)
