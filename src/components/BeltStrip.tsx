import { BELT_STYLES } from '../types'

const STRIP_BELTS = ['white', 'blue', 'purple', 'brown', 'black'] as const

// Decorative white-to-black belt gradient strip used as a header
// accent. The caller's className controls the size.
export function BeltStrip({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden>
      {STRIP_BELTS.map((b) => (
        <span key={b} style={{ backgroundColor: BELT_STYLES[b].base }} />
      ))}
    </div>
  )
}
