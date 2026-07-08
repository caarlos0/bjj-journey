import { useEffect, useState, type FormEvent } from 'react'
import { beltAtDate } from '../describe'
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
  events: TimelineEvent[]
  onSave: (event: TimelineEvent) => void
  editing: TimelineEvent | null
  onCancelEdit: () => void
}

export function EventForm({ events, onSave, editing, onCancelEdit }: EventFormProps) {
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

  useEffect(() => {
    if (!editing) return
    setType(editing.type)
    setDate(editing.date)
    setSchool(editing.school ?? '')
    setBelt(editing.belt ?? 'blue')
    setStripe(editing.stripe ?? 1)
    setCompetitionName(editing.competitionName ?? '')
    setResult(editing.result ?? 'gold')
    setWins(editing.wins ?? 0)
    setNotes(editing.notes ?? '')
  }, [editing])

  // Black belts take up to 6 degrees before coral; colored belts cap at
  // 4 stripes.
  const onBlackBelt = beltAtDate(events, date) === 'black'
  const maxStripes = onBlackBelt ? 6 : 4

  function reset() {
    setNotes('')
    setCompetitionName('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const event: TimelineEvent = {
      id: editing?.id ?? crypto.randomUUID(),
      type,
      date,
      notes: notes.trim() || undefined,
    }
    if (type === 'start' || type === 'school') event.school = school.trim() || undefined
    if (type === 'belt') event.belt = belt
    if (type === 'stripe') event.stripe = Math.min(stripe, maxStripes)
    if (type === 'competition') {
      event.competitionName = competitionName.trim() || undefined
      event.result = result
      event.wins = wins > 0 ? wins : undefined
    }
    onSave(event)
    reset()
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
          <select
            value={Math.min(stripe, maxStripes)}
            onChange={(e) => setStripe(Number(e.target.value))}
          >
            {Array.from({ length: maxStripes }, (_, i) => i + 1).map((n) => (
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
        {editing ? t('form.update') : t('form.save')}
      </button>
      {editing && (
        <button type="button" className="btn-secondary btn-cancel" onClick={onCancelEdit}>
          {t('form.cancel')}
        </button>
      )}
    </form>
  )
}
