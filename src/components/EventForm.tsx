import { useEffect, useState, type FormEvent } from 'react'
import { beltAtDate, today } from '../describe'
import {
  divisionAt,
  eligibleAgeDivisions,
  uniformsAtDate,
  WEIGHT_DIVISIONS,
  weightAtDate,
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
  type Sex,
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
  'uniform',
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
  onProfileChange: (profile: AthleteProfile) => void
  onSave: (event: TimelineEvent, photo: PhotoChange) => void
  editing: TimelineEvent | null
  editingPhotoUrl?: string
  onCancelEdit: () => void
}

export function EventForm({
  events,
  profile,
  onProfileChange,
  onSave,
  editing,
  editingPhotoUrl,
  onCancelEdit,
}: EventFormProps) {
  const { t } = useI18n()
  const [type, setType] = useState<EventType | ''>('start')
  const [date, setDate] = useState(today)
  const [school, setSchool] = useState('')
  const [belt, setBelt] = useState<BeltColor>('blue')
  const [stripe, setStripe] = useState(1)
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(
    () => weightAtDate(events, date)?.unit ?? 'kg',
  )
  const [uniforms, setUniforms] = useState<Uniform[]>(() =>
    uniformsAtDate(events, date),
  )
  const [birthYear, setBirthYear] = useState(profile.birthYear?.toString() ?? '')
  const [sex, setSex] = useState<Sex | ''>(profile.sex ?? '')
  const [competitionName, setCompetitionName] = useState('')
  const [uniform, setUniform] = useState<Uniform>(uniforms[0])
  const [ageDivision, setAgeDivision] = useState<AgeDivision | ''>('')
  const [weightDivision, setWeightDivision] = useState<WeightDivision | ''>('')
  const [result, setResult] = useState<CompetitionResult>('gold')
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [instructor, setInstructor] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<PhotoChange>(null)
  const earliestOtherStart = events
    .filter((event) => event.type === 'start' && event.id !== editing?.id)
    .reduce<TimelineEvent | null>(
      (earliest, event) =>
        !earliest || event.date < earliest.date ? event : earliest,
      null,
    )
  const isFirstStart =
    type === 'start' &&
    (!earliestOtherStart ||
      (editing ? date <= earliestOtherStart.date : date < earliestOtherStart.date))

  useEffect(() => {
    if (!editing) return
    const editingUniforms = editing.uniforms ?? uniformsAtDate(events, editing.date)
    const editingUniform = editing.uniform ?? editingUniforms[0]
    const suggested = divisionAt(events, profile, editing.date, editingUniform)
    setType(editing.type)
    setDate(editing.date)
    setSchool(editing.school ?? '')
    setBelt(editing.belt ?? 'blue')
    setStripe(editing.stripe ?? 1)
    setWeight(editing.weight?.toString() ?? '')
    setWeightUnit(
      editing.weightUnit ?? weightAtDate(events, editing.date)?.unit ?? 'kg',
    )
    setUniforms(editingUniforms)
    setBirthYear(profile.birthYear?.toString() ?? '')
    setSex(profile.sex ?? '')
    setCompetitionName(editing.competitionName ?? '')
    setUniform(editingUniform)
    setAgeDivision(editing.ageDivision ?? suggested?.age ?? '')
    setWeightDivision(editing.weightDivision ?? suggested?.weight ?? '')
    setResult(editing.result ?? 'gold')
    setWins(editing.wins ?? 0)
    setLosses(editing.losses ?? 0)
    setInstructor(editing.instructor ?? '')
    setTitle(editing.title ?? '')
    setNotes(editing.notes ?? '')
    setPhoto(null)
  }, [editing, events, profile])

  useEffect(() => {
    if (editing) return
    setBirthYear(profile.birthYear?.toString() ?? '')
    setSex(profile.sex ?? '')
  }, [editing, profile.birthYear, profile.sex])

  useEffect(() => {
    if (editing) return
    if (type === 'weight' || isFirstStart) {
      setWeightUnit(weightAtDate(events, date)?.unit ?? 'kg')
    }
    if (type === 'uniform' || isFirstStart) {
      setUniforms(uniformsAtDate(events, date))
    }
  }, [date, editing, events, isFirstStart, type])

  useEffect(() => {
    if (type !== 'competition' || editing) return
    setUniform(uniformsAtDate(events, date)[0])
  }, [date, editing, events, type])

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
    setType('')
    setSchool('')
    setBelt('blue')
    setStripe(1)
    setNotes('')
    setWeight('')
    setWeightUnit(weightAtDate(events, date)?.unit ?? 'kg')
    setUniforms(uniformsAtDate(events, date))
    setCompetitionName('')
    setUniform(uniformsAtDate(events, date)[0])
    setAgeDivision('')
    setWeightDivision('')
    setResult('gold')
    setWins(0)
    setLosses(0)
    setInstructor('')
    setTitle('')
    setPhoto(null)
  }

  function toggleUniform(selected: Uniform) {
    if (!uniforms.includes(selected)) {
      setUniforms(
        (['gi', 'no-gi'] as const).filter(
          (uniform) => uniform === selected || uniforms.includes(uniform),
        ),
      )
      return
    }
    if (uniforms.length > 1) {
      setUniforms(uniforms.filter((uniform) => uniform !== selected))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!type) return
    const event: TimelineEvent = {
      id: editing?.id ?? crypto.randomUUID(),
      type,
      date,
      notes: notes.trim() || undefined,
    }
    if (type === 'start' || type === 'school') event.school = school.trim() || undefined
    if (isFirstStart) {
      event.weight = weight ? Number(weight) : undefined
      event.weightUnit = weight ? weightUnit : undefined
      event.uniforms = uniforms
      onProfileChange({
        birthYear: birthYear ? Number(birthYear) : undefined,
        sex: sex || undefined,
      })
    }
    if (type === 'belt') event.belt = belt
    if (type === 'stripe') event.stripe = Math.min(stripe, stripeMax)
    if (type === 'weight') {
      event.weight = Number(weight)
      event.weightUnit = weightUnit
    }
    if (type === 'uniform') event.uniforms = uniforms
    if (type === 'competition') {
      event.competitionName = competitionName.trim() || undefined
      event.uniform = uniform
      event.ageDivision = ageDivision || undefined
      event.weightDivision = weightDivision || undefined
      event.result = result
      event.wins = wins > 0 ? wins : undefined
      event.losses = losses > 0 ? losses : undefined
    }
    if (type === 'seminar') event.instructor = instructor.trim() || undefined
    if (type === 'milestone') event.title = title.trim() || undefined
    onSave(event, photo)
    reset()
  }

  function cancelEdit() {
    reset()
    onCancelEdit()
  }

  const hasCurrentPhoto = !!editing && !!editingPhotoUrl && photo === null

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>{t('form.type')}</span>
        <select
          required
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
        >
          <option value="" disabled>
            {t('form.typePlaceholder')}
          </option>
          {EVENT_TYPES.map((et) => (
            <option key={et} value={et}>
              {EVENT_ICONS[et]} {t(`type.${et}`)}
            </option>
          ))}
        </select>
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

      {type && (
        <>
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

      {isFirstStart && (
        <>
          <label className="field">
            <span>{t('profile.birthYear')}</span>
            <input
              type="number"
              required
              min={1900}
              max={new Date().getFullYear() - 4}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
            <small className="field-hint">{t('profile.birthYearHint')}</small>
          </label>
          <label className="field">
            <span>{t('profile.sex')}</span>
            <select
              required
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
            >
              <option value="" disabled>
                {t('profile.sexPlaceholder')}
              </option>
              <option value="male">{t('profile.sex.male')}</option>
              <option value="female">{t('profile.sex.female')}</option>
            </select>
          </label>
        </>
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

      {(type === 'weight' || isFirstStart) && (
        <>
          <label className="field">
            <span>{t(type === 'weight' ? 'form.weight' : 'form.initialWeight')}</span>
            <input
              type="number"
              required={type === 'weight'}
              min={0.1}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('form.weightUnit')}</span>
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

      {(type === 'uniform' || isFirstStart) && (
        <label className="field">
          <span>{t('form.uniforms')}</span>
          <div className="uniform-picker" role="group">
            {(['gi', 'no-gi'] as const).map((uniform) => (
              <button
                key={uniform}
                type="button"
                className={`type-option uniform-option ${
                  uniforms.includes(uniform) ? 'selected' : ''
                }`}
                aria-pressed={uniforms.includes(uniform)}
                onClick={() => toggleUniform(uniform)}
              >
                {t(`division.uniform.${uniform}`)}
              </button>
            ))}
          </div>
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
          <label className="field">
            <span>{t('form.losses')}</span>
            <input
              type="number"
              min={0}
              max={99}
              value={losses}
              onChange={(e) => setLosses(Number(e.target.value))}
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
        <button type="button" className="btn-secondary btn-cancel" onClick={cancelEdit}>
          {t('form.cancel')}
        </button>
      )}
        </>
      )}
    </form>
  )
}
