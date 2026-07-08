import { compressToBase64, decompressFromBase64 } from 'lz-string'
import type { TimelineEvent } from './types'

// The whole timeline travels inside the URL hash, so shared links work
// without any backend. The payload is base64url (only A-Za-z0-9-_ plus
// the "/" marker) because chat apps like WhatsApp cut a link short at
// characters such as "=" and "+", which plain base64/URI encoding uses.

export interface SharedData {
  name: string
  events: TimelineEvent[]
}

export function buildShareUrl(data: SharedData): string {
  const payload = compressToBase64(JSON.stringify(data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${location.origin}${location.pathname}#j/${payload}`
}

export function parseShareHash(hash: string): SharedData | null {
  const match = hash.match(/^#j\/(.+)$/)
  if (!match) return null
  try {
    const b64 = match[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decompressFromBase64(b64)
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
