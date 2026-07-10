import { useEffect, useState, type FormEvent } from 'react'
import { beltAtDate, today } from '../describe'
import {
  divisionAt,
  eligibleAgeDivisions,
  WEIGHT_DIVISIONS,
  weightDivisionOptions,
} from '../divisions'
import { useI18n } from '../i18n'
import { EVENT_ICONS, RESULT_ICONS } from '../icons'
import {
  ADULT_BELTS,
  KIDS_BELTS,
  maxStripes,
  type AgeDivision,
  type AthleteProfile,
  type BeltColor,
  type CompetitionResult,
  type EventType,
  type TimelineEvent,
  type Uniform,
  type WeightDivision,
  type WeightUnit,
} from '../types'

const EVENT_TYPES: EventType[] = [
  'start',
  'school',
  'stripe',
  'belt',
  'weight',
  'competition',
  'seminar',
  'injury',
  'break',
  'milestone',
]
const RESULTS: CompetitionResult[] = ['gold', 'silver', 'bronze', 'participated']

export type PhotoChange = File | 'remove' | null

interface EventFormProps {
  events: TimelineEvent[]
  profile: AthleteProfile
  onSave: (event: TimelineEvent, photo: PhotoChange) => void
  editing: TimelineEvent | null
  editingPhotoUrl?: string
  onCancelEdit: () => void
}

export function EventForm({
  events,
  profile,
  onSave,
  editing,
  editingPhotoUrl,
  onCancelEdit,
}: EventFormProps) {
  const { t } = useI18n()
  const [type, setType] = useState<EventType>('start')
  const [date, setDate] = useState(today())
  const [school, setSchool] = useState('')
  const [belt, setBelt] = useState<BeltColor>('blue')
  const [stripe, setStripe] = useState(1)
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(profile.weightUnit)
  const [competitionName, setCompetitionName] = useState('')
  const [uniform, setUniform] = useState<Uniform>(profile.uniforms[0])
  const [ageDivision, setAgeDivision] = useState<AgeDivision | ''>('')
  const [weightDivision, setWeightDivision] = useState<WeightDivision | ''>('')
  const [result, setResult] = useState<CompetitionResult>('gold')
  const [wins, setWins] = useState(0)
  const [instructor, setInstructor] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<PhotoChange>(null)

  useEffect(() => {
    if (!editing) return
    const editingUniform = editing.uniform ?? profile.uniforms[0]
    const suggested = divisionAt(events, profile, editing.date, editingUniform)
    setType(editing.type)
    setDate(editing.date)
    setSchool(editing.school ?? '')
    setBelt(editing.belt ?? 'blue')
    setStripe(editing.stripe ?? 1)
    setWeight(editing.weight?.toString() ?? '')
    setWeightUnit(editing.weightUnit ?? profile.weightUnit)
    setCompetitionName(editing.competitionName ?? '')
    setUniform(editingUniform)
    setAgeDivision(editing.ageDivision ?? suggested?.age ?? '')
    setWeightDivision(editing.weightDivision ?? suggested?.weight ?? '')
    setResult(editing.result ?? 'gold')
    setWins(editing.wins ?? 0)
    setInstructor(editing.instructor ?? '')
    setTitle(editing.title ?? '')
    setNotes(editing.notes ?? '')
    setPhoto(null)
  }, [editing, events, profile])

  useEffect(() => {
    if (editing) return
    setWeightUnit(profile.weightUnit)
    setUniform(profile.uniforms[0])
  }, [editing, profile.uniforms, profile.weightUnit])

  useEffect(() => {
    if (type !== 'competition' || editing) return
    const suggested = divisionAt(events, profile, date, uniform)
    setAgeDivision(suggested?.age ?? '')
    setWeightDivision(suggested?.weight ?? '')
  }, [date, editing, events, profile, type, uniform])

  const stripeMax = maxStripes(beltAtDate(events, date))
  const ageOptions = eligibleAgeDivisions(profile.birthYear, date)
  const competitionAgeOptions =
    ageDivision && !ageOptions.includes(ageDivision)
      ? [...ageOptions, ageDivision]
      : ageOptions
  const weightOptions = ageDivision
    ? weightDivisionOptions(ageDivision, profile.sex)
    : WEIGHT_DIVISIONS
  const competitionWeightOptions: WeightDivision[] = [...weightOptions, 'absolute']
  if (weightDivision && !competitionWeightOptions.includes(weightDivision)) {
    competitionWeightOptions.push(weightDivision)
  }
  const canClassify = competitionAgeOptions.length > 0 && !!profile.sex

  function reset() {
    setNotes('')
    setWeight('')
    setCompetitionName('')
    setInstructor('')
    setTitle('')
    setPhoto(null)
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
    if (type === 'stripe') event.stripe = Math.min(stripe, stripeMax)
    if (type === 'weight') {
      event.weight = Number(weight)
      event.weightUnit = weightUnit
    }
    if (type === 'competition') {
      event.competitionName = competitionName.trim() || undefined
      event.uniform = uniform
      event.ageDivision = ageDivision || undefined
      event.weightDivision = weightDivision || undefined
      event.result = result
      event.wins = wins > 0 ? wins : undefined
    }
    if (type === 'seminar') event.instructor = instructor.trim() || undefined
    if (type === 'milestone') event.title = title.trim() || undefined
    onSave(event, photo)
    reset()
  }

  const hasCurrentPhoto = !!editing && !!editingPhotoUrl && photo === null

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
              {ADULT_BELTS.filter((b) => b !== 'white').map((b) => (
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
            value={Math.min(stripe, stripeMax)}
            onChange={(e) => setStripe(Number(e.target.value))}
          >
            {Array.from({ length: stripeMax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {t(`ordinal.${n}` as 'ordinal.1')}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === 'weight' && (
        <>
          <label className="field">
            <span>{t('form.weight')}</span>
            <input
              type="number"
              required
              min={0.1}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('profile.weightUnit')}</span>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
            <small className="field-hint">{t('form.weightHint')}</small>
          </label>
        </>
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
            <span>{t('form.uniform')}</span>
            <select
              value={uniform}
              onChange={(e) => setUniform(e.target.value as Uniform)}
            >
              <option value="gi">{t('division.uniform.gi')}</option>
              <option value="no-gi">{t('division.uniform.no-gi')}</option>
            </select>
          </label>
          {canClassify ? (
            <>
              <label className="field">
                <span>{t('form.ageDivision')}</span>
                <select
                  required
                  value={ageDivision}
                  onChange={(e) => setAgeDivision(e.target.value as AgeDivision)}
                >
                  {competitionAgeOptions.map((division) => (
                    <option key={division} value={division}>
                      {t(`division.age.${division}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t('form.weightDivision')}</span>
                <select
                  required
                  value={weightDivision}
                  onChange={(e) =>
                    setWeightDivision(e.target.value as WeightDivision)
                  }
                >
                  <option value="" disabled>
                    —
                  </option>
                  {competitionWeightOptions.map((division) => (
                    <option key={division} value={division}>
                      {t(`division.weight.${division}`)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <p className="form-hint">{t('form.divisionIncomplete')}</p>
          )}
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

      {type === 'seminar' && (
        <label className="field">
          <span>{t('form.instructor')}</span>
          <input
            type="text"
            value={instructor}
            placeholder={t('form.instructorPlaceholder')}
            onChange={(e) => setInstructor(e.target.value)}
          />
        </label>
      )}

      {type === 'milestone' && (
        <label className="field">
          <span>{t('form.milestoneTitle')}</span>
          <input
            type="text"
            value={title}
            placeholder={t('form.milestonePlaceholder')}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
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

      <label className="field">
        <span>{t('form.photo')}</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </label>
      {hasCurrentPhoto && (
        <div className="photo-preview">
          <img src={editingPhotoUrl} alt="" />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPhoto('remove')}
          >
            {t('form.removePhoto')}
          </button>
        </div>
      )}

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
