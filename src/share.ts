import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import type { TimelineEvent } from './types'

// The whole timeline travels inside the URL hash, so shared links work
// without any backend.

export interface SharedData {
  name: string
  events: TimelineEvent[]
}

export function buildShareUrl(data: SharedData): string {
  const payload = compressToEncodedURIComponent(JSON.stringify(data))
  return `${location.origin}${location.pathname}#j=${payload}`
}

export function parseShareHash(hash: string): SharedData | null {
  const match = hash.match(/^#j=(.+)$/)
  if (!match) return null
  try {
    const json = decompressFromEncodedURIComponent(match[1])
    if (!json) return null
    const data = JSON.parse(json)
    if (!Array.isArray(data.events)) return null
    return {
      name: typeof data.name === 'string' ? data.name : '',
      events: data.events,
    }
  } catch {
    return null
  }
}

export function clearShareHash() {
  history.replaceState(null, '', location.pathname + location.search)
}
