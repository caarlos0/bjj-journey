export type BeltColor =
  | 'white'
  | 'grey-white'
  | 'grey'
  | 'grey-black'
  | 'yellow-white'
  | 'yellow'
  | 'yellow-black'
  | 'orange-white'
  | 'orange'
  | 'orange-black'
  | 'green-white'
  | 'green'
  | 'green-black'
  | 'blue'
  | 'purple'
  | 'brown'
  | 'black'
  | 'coral'
  | 'red-white'
  | 'red'

export type EventType =
  | 'start'
  | 'school'
  | 'stripe'
  | 'belt'
  | 'weight'
  | 'age'
  | 'competition'
  | 'injury'
  | 'break'
  | 'seminar'
  | 'milestone'

export type CompetitionResult = 'gold' | 'silver' | 'bronze' | 'participated'

export type Sex = 'male' | 'female'
export type WeightUnit = 'kg' | 'lb'
export type Uniform = 'gi' | 'no-gi'

export type AgeDivision =
  | 'mighty-mite-1'
  | 'mighty-mite-2'
  | 'mighty-mite-3'
  | 'pee-wee-1'
  | 'pee-wee-2'
  | 'pee-wee-3'
  | 'junior-1'
  | 'junior-2'
  | 'junior-3'
  | 'teen-1'
  | 'teen-2'
  | 'teen-3'
  | 'juvenile'
  | 'adult'
  | 'master-1'
  | 'master-2'
  | 'master-3'
  | 'master-4'
  | 'master-5'
  | 'master-6'
  | 'master-7'

export type WeightClass =
  | 'rooster'
  | 'light-feather'
  | 'feather'
  | 'light'
  | 'middle'
  | 'medium-heavy'
  | 'heavy'
  | 'super-heavy'
  | 'ultra-heavy'

export type WeightDivision = WeightClass | 'absolute'

export interface AthleteProfile {
  birthYear?: number
  sex?: Sex
  weightUnit: WeightUnit
  uniforms: Uniform[]
}

export interface DivisionSnapshot {
  age: AgeDivision
  weight?: WeightDivision
  uniform: Uniform
}

export interface AgeDivisionChange {
  date: string
  ageDivision: AgeDivision
}

export interface TimelineEvent {
  id: string
  type: EventType
  date: string // yyyy-mm-dd
  school?: string
  belt?: BeltColor
  stripe?: number // 1-4
  competitionName?: string
  result?: CompetitionResult
  wins?: number
  weight?: number
  weightUnit?: WeightUnit
  uniform?: Uniform
  ageDivision?: AgeDivision
  weightDivision?: WeightDivision
  instructor?: string // seminar
  title?: string // milestone
  notes?: string
}

export interface BeltStyle {
  base: string
  // Accent band over the base color. By default a stripe running the
  // length of the belt (kids split belts); for the coral-snake adult
  // belts, bandVertical draws it across the belt instead.
  band?: string
  bandVertical?: boolean
  // Rank bar and stripe colors, when not the default black bar with
  // white stripes.
  rankBar?: string
  stripe?: string
}

const grey = '#8a8d90'
const yellow = '#e3b820'
const orange = '#d96c1e'
const green = '#2e7d3a'
const white = '#f4f1ea'
const black = '#1a1a1a'
const red = '#a01916'

export const BELT_STYLES: Record<BeltColor, BeltStyle> = {
  white: { base: white },
  'grey-white': { base: grey, band: white },
  grey: { base: grey },
  'grey-black': { base: grey, band: black },
  'yellow-white': { base: yellow, band: white },
  yellow: { base: yellow },
  'yellow-black': { base: yellow, band: black },
  'orange-white': { base: orange, band: white },
  orange: { base: orange },
  'orange-black': { base: orange, band: black },
  'green-white': { base: green, band: white },
  green: { base: green },
  'green-black': { base: green, band: black },
  blue: { base: '#1e5aa8' },
  purple: { base: '#6b3fa0' },
  brown: { base: '#6d4527' },
  black: { base: black, rankBar: red },
  coral: { base: red, band: black, bandVertical: true, rankBar: white, stripe: black },
  'red-white': { base: red, band: white, bandVertical: true },
  red: { base: red },
}

export const KIDS_BELTS: BeltColor[] = [
  'white',
  'grey-white',
  'grey',
  'grey-black',
  'yellow-white',
  'yellow',
  'yellow-black',
  'orange-white',
  'orange',
  'orange-black',
  'green-white',
  'green',
  'green-black',
]

// Colored belts take up to 4 stripes; black belts up to 6 degrees
// before coral.
export function maxStripes(belt: BeltColor): number {
  return belt === 'black' ? 6 : 4
}

export const ADULT_BELTS: BeltColor[] = [
  'white',
  'blue',
  'purple',
  'brown',
  'black',
  'coral',
  'red-white',
  'red',
]
