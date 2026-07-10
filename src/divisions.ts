import type { TKey } from './i18n'
import type {
  AgeDivision,
  AgeDivisionChange,
  AthleteProfile,
  DivisionSnapshot,
  Sex,
  TimelineEvent,
  Uniform,
  WeightClass,
  WeightUnit,
} from './types'

type T = (key: TKey, vars?: Record<string, string | number>) => string
type Limits = Record<Uniform, Record<WeightUnit, Record<Sex, readonly number[]>>>

const DEFAULT_PROFILE: AthleteProfile = {
  weightUnit: 'kg',
  uniforms: ['gi'],
}

export const AGE_DIVISIONS: AgeDivision[] = [
  'mighty-mite-1',
  'mighty-mite-2',
  'mighty-mite-3',
  'pee-wee-1',
  'pee-wee-2',
  'pee-wee-3',
  'junior-1',
  'junior-2',
  'junior-3',
  'teen-1',
  'teen-2',
  'teen-3',
  'juvenile',
  'adult',
  'master-1',
  'master-2',
  'master-3',
  'master-4',
  'master-5',
  'master-6',
  'master-7',
]

export const WEIGHT_DIVISIONS: WeightClass[] = [
  'rooster',
  'light-feather',
  'feather',
  'light',
  'middle',
  'medium-heavy',
  'heavy',
  'super-heavy',
  'ultra-heavy',
]

const FEMALE_WEIGHT_DIVISIONS = WEIGHT_DIVISIONS.slice(0, -1)

export function normalizeProfile(value: unknown): AthleteProfile {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PROFILE }
  const profile = value as Record<string, unknown>
  const birthYear =
    typeof profile.birthYear === 'number' &&
    Number.isInteger(profile.birthYear) &&
    profile.birthYear >= 1900 &&
    profile.birthYear <= new Date().getFullYear()
      ? profile.birthYear
      : undefined
  const sex = profile.sex === 'male' || profile.sex === 'female' ? profile.sex : undefined
  const weightUnit = profile.weightUnit === 'lb' ? 'lb' : 'kg'
  const requestedUniforms = Array.isArray(profile.uniforms)
    ? profile.uniforms
    : [profile.uniform]
  const uniforms = (['gi', 'no-gi'] as const).filter((uniform) =>
    requestedUniforms.includes(uniform),
  )
  return {
    birthYear,
    sex,
    weightUnit,
    uniforms: uniforms.length > 0 ? uniforms : ['gi'],
  }
}

const ADULT_LIMITS: Limits = {
  gi: {
    kg: {
      male: [57.5, 64, 70, 76, 82.3, 88.3, 94.3, 100.5],
      female: [48.5, 53.5, 58.5, 64, 69, 74, 79.3],
    },
    lb: {
      male: [127, 141.6, 154.6, 168, 181.6, 195, 208, 222],
      female: [107, 118, 129, 141.6, 152.6, 163.6, 175],
    },
  },
  'no-gi': {
    kg: {
      male: [55.5, 61.5, 67.5, 73.5, 79.5, 85.5, 91.5, 97.5],
      female: [46.5, 51.5, 56.5, 61.5, 66.5, 71.5, 76.5],
    },
    lb: {
      male: [122.6, 136, 149, 162.6, 175.6, 188.6, 202, 215],
      female: [103, 114, 125, 136, 147, 158, 169],
    },
  },
}

const JUVENILE_LIMITS: Limits = {
  gi: {
    kg: {
      male: [53.5, 58.5, 64, 69, 74, 79.3, 84.3, 89.3],
      female: [44.3, 48.3, 52.5, 56.5, 60.5, 65, 69],
    },
    lb: {
      male: [118, 129, 141.6, 152.6, 163.6, 175, 186, 197],
      female: [98, 106.6, 116, 125, 133.6, 143.6, 152],
    },
  },
  'no-gi': {
    kg: {
      male: [51.5, 56.5, 61.5, 66.5, 71.5, 76.5, 81.5, 86.5],
      female: [42.5, 46.5, 50.5, 54.5, 58.5, 62.5, 66.5],
    },
    lb: {
      male: [114, 125, 136, 147, 158, 169, 180, 191],
      female: [94, 103, 111.6, 120.6, 129, 138, 147],
    },
  },
}

// The official 2026 Austin, Rio, and Pan Kids event charts round kg and lb
// independently, so both published sets are preserved instead of converted.
const KIDS_LIMITS: Record<Uniform, Record<WeightUnit, readonly (readonly number[])[]>> =
  {
    gi: {
      kg: [
        [12, 14.7, 17.9, 18.2, 21, 24, 27, 30.2, 32.2, 36.2, 40.3, 44.3],
        [14.7, 17.9, 18.9, 21, 24, 27, 30.2, 33.2, 36.2, 40.3, 44.3, 48.3],
        [18, 20, 22, 24, 27, 30.2, 33.2, 36.2, 40.3, 44.3, 48.3, 52.5],
        [21, 24, 25, 27, 30.2, 33.2, 36.2, 39.3, 44.3, 48.3, 52.5, 56.5],
        [24, 26, 28, 30.2, 33.2, 36.2, 39.3, 42.3, 48.3, 52.5, 56.5, 60.5],
        [27, 29, 31.2, 33.2, 36.2, 39.3, 42.3, 45.3, 52.5, 56.5, 60.5, 65],
        [30, 32, 34.2, 36.2, 39.3, 42.3, 45.3, 48.3, 56.5, 60.5, 65, 69],
        [33, 35, 37.2, 39.3, 42.3, 45.3, 48.3, 51.5, 60.5, 65, 69, 73],
      ],
      lb: [
        [26, 32.6, 39.6, 40, 46.6, 53, 60, 67, 71, 80, 89, 98],
        [32.6, 39.6, 42, 46.6, 53, 60, 67, 73.6, 80, 89, 98, 106.6],
        [40, 44.6, 48.6, 53, 60, 67, 73.6, 80, 89, 98, 106.6, 116],
        [46.6, 53, 55.6, 60, 67, 73.6, 80, 87, 98, 106.6, 116, 125],
        [53, 57.6, 62, 67, 73.6, 80, 87, 93.6, 106.6, 116, 125, 133.6],
        [60, 64, 69, 73.6, 80, 87, 93.6, 100, 116, 125, 133.6, 143.6],
        [66.6, 71, 75.6, 80, 87, 93.6, 100, 106.6, 125, 133.6, 143.6, 152.6],
        [73, 77.6, 82.6, 87, 93.6, 100, 106.6, 114, 133.6, 143.6, 152.6, 161],
      ],
    },
    'no-gi': {
      kg: [
        [10.9, 13.6, 15.6, 17.7, 19.7, 22.7, 25.7, 28.8, 30.8, 34.8, 38.9, 42.9],
        [13.6, 15.6, 17.6, 19.7, 22.7, 25.7, 28.8, 31.8, 34.8, 38.9, 42.9, 46.9],
        [16.6, 18.6, 20.7, 22.7, 25.7, 28.8, 31.8, 34.8, 38.9, 42.9, 46.9, 51],
        [19.6, 21.7, 23.7, 25.7, 28.8, 31.8, 34.8, 37.9, 42.9, 46.9, 51, 55],
        [22.7, 24.7, 26.7, 28.8, 31.8, 34.8, 37.9, 40.9, 46.9, 51, 55, 59],
        [25.7, 27.7, 29.8, 31.8, 34.8, 37.9, 40.9, 43.9, 51, 55, 59, 63],
        [28.7, 30.8, 32.8, 34.8, 37.9, 40.9, 43.9, 46.9, 55, 59, 63, 67],
        [31.8, 33.8, 35.8, 37.9, 40.9, 43.9, 46.9, 50, 59, 63, 67, 71],
      ],
      lb: [
        [24, 30, 34.4, 36.8, 43.4, 50, 56.6, 63.4, 67.8, 76.8, 85.8, 94.6],
        [30, 34.4, 38.8, 43.4, 50, 56.6, 63.4, 70, 76.8, 85.8, 94.6, 103.4],
        [36.6, 41, 45.6, 50, 56.6, 63.4, 70, 76.8, 85.8, 94.6, 103.4, 112.4],
        [42.2, 47.8, 52.2, 56.6, 63.4, 70, 76.8, 83.6, 94.6, 103.4, 112.4, 121.2],
        [50, 54.4, 58.8, 63.4, 70, 76.8, 83.6, 90.2, 103.4, 112.4, 121.2, 130],
        [56.6, 61, 65.6, 70, 76.8, 83.6, 90.2, 96.8, 112.4, 121.2, 130, 138.8],
        [63.2, 67.8, 72.2, 76.8, 83.6, 90.2, 96.8, 103.4, 121.2, 130, 138.8, 147.6],
        [70, 74.6, 79, 83.6, 90.2, 96.8, 103.4, 110.2, 130, 138.8, 147.6, 156.4],
      ],
    },
  }

export function ageDivisionForYear(
  birthYear: number,
  competitionYear: number,
): AgeDivision | null {
  const age = competitionYear - birthYear
  if (age < 4) return null
  if (age <= 15) return AGE_DIVISIONS[age - 4]
  if (age <= 17) return 'juvenile'
  if (age <= 29) return 'adult'
  if (age <= 35) return 'master-1'
  if (age <= 40) return 'master-2'
  if (age <= 45) return 'master-3'
  if (age <= 50) return 'master-4'
  if (age <= 55) return 'master-5'
  if (age <= 60) return 'master-6'
  return 'master-7'
}

export function ageDivisionAtDate(
  birthYear: number | undefined,
  date: string,
): AgeDivision | null {
  if (!birthYear) return null
  return ageDivisionForYear(birthYear, Number(date.slice(0, 4)))
}

export function ageDivisionChanges(
  birthYear: number | undefined,
  startDate: string | undefined,
  throughYear = new Date().getFullYear(),
): AgeDivisionChange[] {
  if (!birthYear || !startDate) return []
  const startYear = Math.max(birthYear + 4, Number(startDate.slice(0, 4)))
  let previous = ageDivisionForYear(birthYear, startYear - 1)
  const changes: AgeDivisionChange[] = []
  for (let year = startYear; year <= throughYear; year++) {
    const ageDivision = ageDivisionForYear(birthYear, year)
    if (ageDivision && ageDivision !== previous) {
      changes.push({ date: `${year}-01-01`, ageDivision })
    }
    previous = ageDivision
  }
  return changes
}

export function eligibleAgeDivisions(
  birthYear: number | undefined,
  date: string,
): AgeDivision[] {
  const current = ageDivisionAtDate(birthYear, date)
  if (!current) return []
  if (!current.startsWith('master-')) return [current]
  const master = Number(current.slice(-1))
  return ['adult', ...AGE_DIVISIONS.slice(14, 14 + master)]
}

export function weightDivisionOptions(
  age: AgeDivision,
  sex: Sex | undefined,
): WeightClass[] {
  if (!sex || AGE_DIVISIONS.indexOf(age) < 12) return WEIGHT_DIVISIONS
  return sex === 'female' ? FEMALE_WEIGHT_DIVISIONS : WEIGHT_DIVISIONS
}

function weightLimits(
  age: AgeDivision,
  sex: Sex,
  uniform: Uniform,
  unit: WeightUnit,
): readonly number[] {
  const kidsIndex = AGE_DIVISIONS.indexOf(age)
  if (kidsIndex >= 0 && kidsIndex < 12) {
    return KIDS_LIMITS[uniform][unit].map((limits) => limits[kidsIndex])
  }
  return (age === 'juvenile' ? JUVENILE_LIMITS : ADULT_LIMITS)[uniform][unit][sex]
}

export function weightDivisionFor(
  weight: number,
  unit: WeightUnit,
  age: AgeDivision,
  sex: Sex,
  uniform: Uniform,
): WeightClass | undefined {
  if (!Number.isFinite(weight) || weight <= 0) return undefined
  const options = weightDivisionOptions(age, sex)
  const limits = weightLimits(age, sex, uniform, unit)
  return options.find((_, index) => limits[index] === undefined || weight <= limits[index])
}

export function weightAtDate(
  events: TimelineEvent[],
  date: string,
): { weight: number; unit: WeightUnit } | null {
  let latest: { date: string; weight: number; unit: WeightUnit } | null = null
  for (const event of events) {
    if (
      event.type === 'weight' &&
      event.date <= date &&
      typeof event.weight === 'number' &&
      event.weight > 0 &&
      (event.weightUnit === 'kg' || event.weightUnit === 'lb') &&
      (!latest || event.date >= latest.date)
    ) {
      latest = {
        date: event.date,
        weight: event.weight,
        unit: event.weightUnit,
      }
    }
  }
  return latest ? { weight: latest.weight, unit: latest.unit } : null
}

export function convertWeight(
  weight: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) return weight
  const converted = from === 'kg' ? weight * 2.2046226218 : weight / 2.2046226218
  return Math.round(converted * 10) / 10
}

export function divisionAt(
  events: TimelineEvent[],
  profile: AthleteProfile,
  date: string,
  uniform = profile.uniforms[0],
): DivisionSnapshot | null {
  const age = ageDivisionAtDate(profile.birthYear, date)
  if (!age) return null
  const measured = weightAtDate(events, date)
  const weight =
    profile.sex && measured
      ? weightDivisionFor(measured.weight, measured.unit, age, profile.sex, uniform)
      : undefined
  return { age, weight, uniform }
}

export function formatAgeDivision(age: AgeDivision, t: T): string {
  return t(`division.age.${age}` as TKey)
}

export function formatDivision(division: DivisionSnapshot, t: T): string {
  const parts = [formatAgeDivision(division.age, t)]
  if (division.weight) parts.push(t(`division.weight.${division.weight}` as TKey))
  parts.push(t(`division.uniform.${division.uniform}` as TKey))
  return parts.join(' · ')
}

export function formatDivisions(
  divisions: DivisionSnapshot[],
  t: T,
): string[] {
  const [first, second] = divisions
  if (
    divisions.length === 2 &&
    first.age === second.age &&
    first.weight === second.weight &&
    first.uniform !== second.uniform
  ) {
    const parts = [formatAgeDivision(first.age, t)]
    if (first.weight) {
      parts.push(t(`division.weight.${first.weight}` as TKey))
    }
    parts.push(t('division.uniform.both'))
    return [parts.join(' · ')]
  }
  return divisions.map((division) => formatDivision(division, t))
}
