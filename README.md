# BJJ Journey 🥋

Track your Brazilian Jiu-Jitsu journey and share it: when you started
training, your schools, stripes, belt promotions, and competition results —
rendered as a timeline you can export as an image for social media.

Everything runs in the browser. Data is stored in `localStorage`; there is no
backend and nothing leaves your machine.

## Features

- Add and edit events on the left panel, see the timeline render live on the
  right: started training, changed school, new stripe, new belt,
  competitions (with result and win count), seminars, injuries/time off, and
  free-text milestones.
- Full IBJJF belt system, including kids belts (grey/yellow/orange/green and
  their white/black-band variants), coral/red-white/red, and black belt
  degrees up to the 6th.
- Timeline dots and belt graphics colored by your rank at each moment, plus
  a stats header: current belt, competitions, medals, and wins.
- Photos on events, stored locally in IndexedDB and resized on import.
- Export as a PNG — full timeline, Story (9:16), or square (1:1) summary
  card. Native share sheet on mobile, download on desktop.
- Share a link: the entire timeline is compressed into the URL hash
  (lz-string), so anyone opening it sees your journey — still no backend.
  Visitors can save a shared timeline to their own device.
- Backup and restore everything (events, name, and photos) as a JSON file.
- Multiple profiles — track your own journey and your kids' in the same
  browser.
- Portuguese (pt-BR, default) and English (en-US).

## Development

```sh
pnpm install
pnpm run dev     # start dev server
pnpm run build   # type-check + production build
pnpm run test    # vitest
pnpm run lint    # oxlint
```

## Credits

Made by [caarlos0](https://caarlos0.dev) —
[github.com/caarlos0/bjj-journey](https://github.com/caarlos0/bjj-journey).
