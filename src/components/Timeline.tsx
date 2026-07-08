import { forwardRef } from 'react'
import { beltAt, describeEvent, sortByDate } from '../describe'
import { useI18n } from '../i18n'
import { EVENT_ICONS, RESULT_ICONS } from '../icons'
import { computeStats } from '../stats'
import { BELT_STYLES, type TimelineEvent } from '../types'
import { Belt } from './Belt'

function matTime(
  firstDate: string,
  t: ReturnType<typeof useI18n>['t'],
): string | null {
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

interface TimelineProps {
  events: TimelineEvent[]
  name: string
  photos?: Record<string, string>
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline({ events, name, photos = {} }, ref) {
    const { t, formatDate } = useI18n()
    const sorted = sortByDate(events)

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
    const stats = computeStats(sorted)

    return (
      <div className="timeline-card" ref={ref}>
        <header className="timeline-header">
          <div className="timeline-header-belt" aria-hidden>
            {(['white', 'blue', 'purple', 'brown', 'black'] as const).map((b) => (
              <span key={b} style={{ backgroundColor: BELT_STYLES[b].base }} />
            ))}
          </div>
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
          {stats.competitions > 0 && (
            <div className="timeline-stats">
              <span className="stat-chip">
                🏆{' '}
                {stats.competitions === 1
                  ? t('stats.competition')
                  : t('stats.competitions', { n: stats.competitions })}
              </span>
              {stats.gold > 0 && <span className="stat-chip">🥇 {stats.gold}</span>}
              {stats.silver > 0 && (
                <span className="stat-chip">🥈 {stats.silver}</span>
              )}
              {stats.bronze > 0 && (
                <span className="stat-chip">🥉 {stats.bronze}</span>
              )}
              {stats.wins > 0 && (
                <span className="stat-chip">
                  ✊ {stats.wins === 1 ? t('tl.win') : t('tl.wins', { n: stats.wins })}
                </span>
              )}
            </div>
          )}
        </header>

        <ol className="timeline">
          {sorted.map((event, i) => {
            const belt = beltAt(sorted, i)
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
                      {event.wins
                        ? ` · ${event.wins === 1 ? t('tl.win') : t('tl.wins', { n: event.wins })}`
                        : ''}
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
