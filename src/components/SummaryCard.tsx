import { forwardRef } from 'react'
import { sortByDate } from '../describe'
import { useI18n } from '../i18n'
import { computeStats, matTime } from '../stats'
import { BELT_STYLES, type TimelineEvent } from '../types'
import { Belt } from './Belt'
import { BeltStrip } from './BeltStrip'
import { StatChips } from './StatChips'

export type CardFormat = 'story' | 'square'

interface SummaryCardProps {
  events: TimelineEvent[]
  name: string
  format: CardFormat
}

// Fixed-size card for social exports: 1080x1920 (story) or 1080x1080
// (square). Rendered off-screen only while exporting.
export const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(
  function SummaryCard({ events, name, format }, ref) {
    const { t, formatDate } = useI18n()
    const sorted = sortByDate(events)
    const stats = computeStats(sorted)
    const duration = matTime(sorted, t)
    const beltHistory = sorted.filter((e) => e.type === 'belt' && e.belt)
    const maxBelts = format === 'story' ? 8 : 4

    // Table/block layout instead of flexbox: html-to-image serializes
    // the DOM through an SVG foreignObject, where flex is unreliable
    // (notably in Safari) — flex here produced wrapped, overlapping
    // text in real exports.
    return (
      <div
        ref={ref}
        className="summary-card"
        style={{ width: 1080, height: format === 'story' ? 1920 : 1080 }}
      >
        <div className="summary-inner">
          <BeltStrip className="summary-belt-strip" />

          <h2 className="summary-title">
            {t('tl.titleBreak')
              .split('\n')
              .map((line) => (
                <span key={line} className="summary-title-line">
                  {line}
                </span>
              ))}
          </h2>
          {name && <p className="summary-name">{name}</p>}
          {duration && <p className="summary-duration">{duration}</p>}

          <div className="summary-belt-wrap">
            <Belt
              color={stats.currentBelt}
              stripes={stats.currentStripes}
              width={140}
              scale={3}
            />
          </div>

          <StatChips stats={stats} className="summary-stats" />

          {beltHistory.length > 0 && (
            <ul className="summary-belts">
              {beltHistory.slice(-maxBelts).map((e) => (
                <li key={e.id}>
                  <span
                    className="summary-belt-dot"
                    style={{ backgroundColor: BELT_STYLES[e.belt!].base }}
                  />
                  <span className="summary-belt-name">{t(`belt.${e.belt!}`)}</span>
                  <span className="summary-belt-date">{formatDate(e.date)}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="summary-footer">🥋 {t('export.footer')}</p>
        </div>
      </div>
    )
  },
)
