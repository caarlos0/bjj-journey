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
      {style.band &&
        (style.bandVertical ? (
          <div className="belt-vbands">
            <span style={{ backgroundColor: style.band, width: 16 * scale }} />
            <span style={{ backgroundColor: style.band, width: 16 * scale }} />
          </div>
        ) : (
          <div
            className="belt-band"
            style={{ backgroundColor: style.band, height: 6 * scale }}
          />
        ))}
      <div
        className="belt-rankbar"
        style={{
          backgroundColor: style.rankBar ?? '#1a1a1a',
          // Wide enough for the stripes plus padding, never narrower
          // than the classic empty rank bar.
          width: Math.max(34, 7 * Math.min(stripes, 6) + 7) * scale,
          marginRight: 14 * scale,
          padding: `0 ${5 * scale}px`,
        }}
      >
        {Array.from({ length: Math.min(stripes, 6) }, (_, i) => (
          <span
            key={i}
            className="belt-stripe"
            style={{
              width: 4 * scale,
              marginLeft: i === 0 ? 0 : 3 * scale,
              ...(style.stripe ? { backgroundColor: style.stripe } : {}),
            }}
          />
        ))}
      </div>
    </div>
  )
}
