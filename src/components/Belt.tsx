import { BELT_STYLES, type BeltColor } from '../types'

interface BeltProps {
  color: BeltColor
  stripes?: number
  width?: number
}

// A flat belt graphic: colored band, optional center band (kids split
// belts, coral, red-white), and a rank bar near the end holding the
// white stripes.
export function Belt({ color, stripes = 0, width = 120 }: BeltProps) {
  const style = BELT_STYLES[color]
  const rankBarColor =
    color === 'black' ? '#a01916' : color === 'coral' ? '#f4f1ea' : '#1a1a1a'
  return (
    <div
      className="belt"
      style={{ width, backgroundColor: style.base }}
      aria-hidden
    >
      {style.band && (
        <div className="belt-band" style={{ backgroundColor: style.band }} />
      )}
      <div className="belt-rankbar" style={{ backgroundColor: rankBarColor }}>
        {Array.from({ length: Math.min(stripes, 4) }, (_, i) => (
          <span
            key={i}
            className="belt-stripe"
            style={color === 'coral' ? { backgroundColor: '#1a1a1a' } : undefined}
          />
        ))}
      </div>
    </div>
  )
}
