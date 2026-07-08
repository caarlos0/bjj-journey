import { BELT_STYLES } from '../types'

// The adult belt journey, white through red. `coral` and `red` share a
// base color, so the center band rendered below is what sets them apart.
const STRIP_BELTS = [
  'white',
  'blue',
  'purple',
  'brown',
  'black',
  'coral',
  'red',
] as const

// Decorative belt-progression strip used as a header accent. The
// caller's className controls the size.
export function BeltStrip({ className }: { className: string }) {
  const width = `${100 / STRIP_BELTS.length}%`
  return (
    <div className={className} aria-hidden>
      {STRIP_BELTS.map((b) => {
        const style = BELT_STYLES[b]
        return (
          <span key={b} style={{ width, backgroundColor: style.base }}>
            {style.band && (
              <i className="belt-strip-band" style={{ backgroundColor: style.band }} />
            )}
          </span>
        )
      })}
    </div>
  )
}
