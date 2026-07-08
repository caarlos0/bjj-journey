import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { EventForm } from './components/EventForm'
import { EventList } from './components/EventList'
import { Timeline } from './components/Timeline'
import { useI18n, type Lang } from './i18n'
import { loadEvents, loadName, saveEvents, saveName } from './storage'
import {
  buildShareUrl,
  clearShareHash,
  parseShareHash,
  type SharedData,
} from './share'
import type { TimelineEvent } from './types'

export default function App() {
  const { t, lang, setLang } = useI18n()
  const [events, setEvents] = useState<TimelineEvent[]>(loadEvents)
  const [name, setName] = useState(loadName)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState<SharedData | null>(() =>
    parseShareHash(location.hash),
  )
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onHashChange = () => setShared(parseShareHash(location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const viewEvents = shared ? shared.events : events
  const viewName = shared ? shared.name : name

  function updateEvents(next: TimelineEvent[]) {
    setEvents(next)
    saveEvents(next)
  }

  function handleName(value: string) {
    setName(value)
    saveName(value)
  }

  function importShared() {
    if (!shared) return
    if (events.length > 0 && !confirm(t('shared.confirmReplace'))) return
    updateEvents(shared.events)
    handleName(shared.name)
    closeShared()
  }

  function closeShared() {
    clearShareHash()
    setShared(null)
  }

  async function handleShareLink() {
    const url = buildShareUrl({ name: viewName, events: viewEvents })
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExport() {
    const node = timelineRef.current
    if (!node || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#14161a',
      })
      // Native share sheet only on mobile: it's how you post to social
      // apps there. On desktop it's clunky, so download instead.
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'bjjourney.png', { type: 'image/png' })
      if (isMobile && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: t('tl.title') })
          return
        } catch (err) {
          // User cancelled the share sheet: don't force a download.
          if (err instanceof DOMException && err.name === 'AbortError') return
        }
      }
      const link = document.createElement('a')
      link.download = 'bjjourney.png'
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>
            <span className="brand-green">B</span>
            <span className="brand-yellow">J</span>
            <span className="brand-blue">J</span> Journey
          </h1>
          <p>{t('app.tagline')}</p>
        </div>
        <div className="app-actions">
          <select
            className="lang-select"
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
          >
            <option value="en-US">🇺🇸 English</option>
            <option value="pt-BR">🇧🇷 Português</option>
          </select>
          <button
            type="button"
            className="btn-secondary"
            disabled={viewEvents.length === 0}
            onClick={handleShareLink}
          >
            {copied ? `✅ ${t('share.copied')}` : `🔗 ${t('share.button')}`}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={viewEvents.length === 0 || exporting}
            onClick={handleExport}
          >
            {exporting ? t('export.sharing') : `📸 ${t('export.button')}`}
          </button>
        </div>
      </header>

      {shared && (
        <div className="shared-banner">
          <span>👀 {t('shared.banner')}</span>
          <div className="shared-banner-actions">
            {events.length === 0 ? (
              <>
                <button type="button" className="btn-primary" onClick={closeShared}>
                  🥋 {t('shared.create')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={importShared}
                >
                  {t('shared.import')}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-primary" onClick={importShared}>
                  {t('shared.import')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeShared}
                >
                  {t('shared.close')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <main className={`app-main ${shared ? 'app-main-shared' : ''}`}>
        {!shared && (
          <aside className="panel panel-left">
            <label className="field">
              <span>{t('panel.yourName')}</span>
              <input
                type="text"
                value={name}
                placeholder={t('panel.yourNamePlaceholder')}
                onChange={(e) => handleName(e.target.value)}
              />
            </label>

            <h2 className="panel-title">{t('panel.addEvent')}</h2>
            <EventForm onAdd={(event) => updateEvents([...events, event])} />

            <h2 className="panel-title">{t('panel.events')}</h2>
            <EventList
              events={events}
              onDelete={(id) => updateEvents(events.filter((e) => e.id !== id))}
            />
          </aside>
        )}

        <section className="panel panel-right">
          <Timeline ref={timelineRef} events={viewEvents} name={viewName} />
        </section>
      </main>
    </div>
  )
}
