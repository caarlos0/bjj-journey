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
  | 'competition'
  | 'injury'
  | 'seminar'
  | 'milestone'

export type CompetitionResult = 'gold' | 'silver' | 'bronze' | 'participated'

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
  instructor?: string // seminar
  title?: string // milestone
  notes?: string
}

export interface BeltStyle {
  base: string
  // Center band running the length of the belt (kids split belts,
  // coral and red-white belts).
  band?: string
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
  black: { base: black },
  coral: { base: red, band: black },
  'red-white': { base: red, band: white },
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
