# BJJ Journey 🥋

Track your Brazilian Jiu-Jitsu journey and share it: when you started
training, your schools, stripes, belt promotions, and competition results —
rendered as a timeline you can export as an image for social media.

Everything runs in the browser. Data is stored in `localStorage`; there is no
backend and nothing leaves your machine.

## Features

- Add events on the left panel, see the timeline render live on the right:
  started training, changed school, new stripe, new belt, competitions
  (with result and win count).
- Full IBJJF belt system, including kids belts (grey/yellow/orange/green and
  their white/black-band variants) and coral/red-white/red.
- Timeline dots and belt graphics colored by your rank at each moment.
- Export the timeline as a PNG — native share sheet on mobile, download on
  desktop.
- Share a link: the entire timeline is compressed into the URL hash
  (lz-string), so anyone opening it sees your journey — still no backend.
  Visitors can save a shared timeline to their own device.
- Portuguese (pt-BR, default) and English (en-US).

## Development

```sh
pnpm install
pnpm run dev     # start dev server
pnpm run build   # type-check + production build
pnpm run lint    # oxlint
```
