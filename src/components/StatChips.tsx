import { useI18n } from '../i18n'
import { formatWins, type Stats } from '../stats'

// Competition/medal/win chips, shared by the timeline header and the
// social export cards. Renders nothing without competitions.
export function StatChips({ stats, className }: { stats: Stats; className: string }) {
  const { t } = useI18n()
  if (stats.competitions === 0) return null
  return (
    <div className={className}>
      <span className="stat-chip">
        🏆{' '}
        {stats.competitions === 1
          ? t('stats.competition')
          : t('stats.competitions', { n: stats.competitions })}
      </span>
      {stats.gold > 0 && <span className="stat-chip">🥇 {stats.gold}</span>}
      {stats.silver > 0 && <span className="stat-chip">🥈 {stats.silver}</span>}
      {stats.bronze > 0 && <span className="stat-chip">🥉 {stats.bronze}</span>}
      {stats.wins > 0 && (
        <span className="stat-chip">✊ {formatWins(stats.wins, t)}</span>
      )}
    </div>
  )
}
