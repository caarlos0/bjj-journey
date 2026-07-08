import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'
import { EVENT_ICONS, RESULT_ICONS } from '../icons'
import {
  ADULT_BELTS,
  KIDS_BELTS,
  type BeltColor,
  type CompetitionResult,
  type EventType,
  type TimelineEvent,
} from '../types'

const EVENT_TYPES: EventType[] = ['start', 'school', 'stripe', 'belt', 'competition']
const RESULTS: CompetitionResult[] = ['gold', 'silver', 'bronze', 'participated']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

interface EventFormProps {
  onAdd: (event: TimelineEvent) => void
}

export function EventForm({ onAdd }: EventFormProps) {
  const { t } = useI18n()
  const [type, setType] = useState<EventType>('start')
  const [date, setDate] = useState(today())
  const [school, setSchool] = useState('')
  const [belt, setBelt] = useState<BeltColor>('blue')
  const [stripe, setStripe] = useState(1)
  const [competitionName, setCompetitionName] = useState('')
  const [result, setResult] = useState<CompetitionResult>('gold')
  const [wins, setWins] = useState(0)
  const [notes, setNotes] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const event: TimelineEvent = {
      id: crypto.randomUUID(),
      type,
      date,
      notes: notes.trim() || undefined,
    }
    if (type === 'start' || type === 'school') event.school = school.trim() || undefined
    if (type === 'belt') event.belt = belt
    if (type === 'stripe') event.stripe = stripe
    if (type === 'competition') {
      event.competitionName = competitionName.trim() || undefined
      event.result = result
      event.wins = wins > 0 ? wins : undefined
    }
    onAdd(event)
    setNotes('')
    setCompetitionName('')
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>{t('form.type')}</span>
        <div className="type-picker" role="radiogroup">
          {EVENT_TYPES.map((et) => (
            <button
              key={et}
              type="button"
              role="radio"
              aria-checked={type === et}
              className={`type-option ${type === et ? 'selected' : ''}`}
              onClick={() => setType(et)}
            >
              <span className="type-icon">{EVENT_ICONS[et]}</span>
              {t(`type.${et}`)}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>{t('form.date')}</span>
        <input
          type="date"
          required
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {(type === 'start' || type === 'school') && (
        <label className="field">
          <span>{t('form.school')}</span>
          <input
            type="text"
            value={school}
            placeholder={t('form.schoolPlaceholder')}
            onChange={(e) => setSchool(e.target.value)}
          />
        </label>
      )}

      {type === 'belt' && (
        <label className="field">
          <span>{t('form.belt')}</span>
          <select value={belt} onChange={(e) => setBelt(e.target.value as BeltColor)}>
            <optgroup label={t('belt.groupAdult')}>
              {ADULT_BELTS.map((b) => (
                <option key={b} value={b}>
                  {t(`belt.${b}`)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('belt.groupKids')}>
              {KIDS_BELTS.filter((b) => b !== 'white').map((b) => (
                <option key={b} value={b}>
                  {t(`belt.${b}`)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      )}

      {type === 'stripe' && (
        <label className="field">
          <span>{t('form.stripe')}</span>
          <select value={stripe} onChange={(e) => setStripe(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {t(`ordinal.${n}` as 'ordinal.1')}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === 'competition' && (
        <>
          <label className="field">
            <span>{t('form.competitionName')}</span>
            <input
              type="text"
              value={competitionName}
              placeholder={t('form.competitionPlaceholder')}
              onChange={(e) => setCompetitionName(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('form.result')}</span>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as CompetitionResult)}
            >
              {RESULTS.map((r) => (
                <option key={r} value={r}>
                  {RESULT_ICONS[r]} {t(`result.${r}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('form.wins')}</span>
            <input
              type="number"
              min={0}
              max={99}
              value={wins}
              onChange={(e) => setWins(Number(e.target.value))}
            />
          </label>
        </>
      )}

      <label className="field">
        <span>{t('form.notes')}</span>
        <input
          type="text"
          value={notes}
          placeholder={t('form.notesPlaceholder')}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <button type="submit" className="btn-primary">
        {t('form.save')}
      </button>
    </form>
  )
}
