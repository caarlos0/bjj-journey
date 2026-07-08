import { BELT_STYLES, type BeltColor } from '../types'

interface BeltProps {
  color: BeltColor
  stripes?: number
  width?: number
  scale?: number
}

// A flat belt graphic: colored band, optional center band (kids split
// belts, coral, red-white), and a rank bar near the end holding the
// stripes. `scale` grows every dimension, for large renders like the
// social export cards.
export function Belt({ color, stripes = 0, width = 120, scale = 1 }: BeltProps) {
  const style = BELT_STYLES[color]
  const rankBarColor =
    color === 'black' ? '#a01916' : color === 'coral' ? '#f4f1ea' : '#1a1a1a'
  return (
    <div
      className="belt"
      style={{
        width: width * scale,
        height: 18 * scale,
        borderRadius: 3 * scale,
        backgroundColor: style.base,
      }}
      aria-hidden
    >
      {style.band && (
        <div
          className="belt-band"
          style={{ backgroundColor: style.band, height: 6 * scale }}
        />
      )}
      <div
        className="belt-rankbar"
        style={{
          backgroundColor: rankBarColor,
          width: (stripes > 4 ? 48 : 34) * scale,
          marginRight: 14 * scale,
          gap: 3 * scale,
          padding: `0 ${5 * scale}px`,
        }}
      >
        {Array.from({ length: Math.min(stripes, 6) }, (_, i) => (
          <span
            key={i}
            className="belt-stripe"
            style={{
              width: 4 * scale,
              ...(color === 'coral' ? { backgroundColor: '#1a1a1a' } : {}),
            }}
          />
        ))}
      </div>
    </div>
  )
}
