import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Backup, type BackupData } from './components/Backup'
import { EventForm, type PhotoChange } from './components/EventForm'
import { SummaryCard, type CardFormat } from './components/SummaryCard'
import { EventList } from './components/EventList'
import { Timeline } from './components/Timeline'
import { today } from './describe'
import {
  ageDivisionChanges,
  convertWeight,
  divisionAt,
  formatDivisions,
  weightAtDate,
} from './divisions'
import { useI18n, type Lang } from './i18n'
import { dataUrlToBlob, deletePhoto, putPhoto, resizeImage } from './photos'
import {
  initProfiles,
  loadEvents,
  loadName,
  loadProfile,
  removeProfileData,
  saveEvents,
  saveName,
  saveProfile,
  saveProfiles,
  setActiveProfile,
} from './storage'
import { usePhotos } from './usePhotos'
import {
  buildShareUrl,
  clearShareHash,
  parseShareHash,
  type SharedData,
} from './share'
import type {
  AthleteProfile,
  Sex,
  TimelineEvent,
  Uniform,
  WeightUnit,
} from './types'

export default function App() {
  const { t, lang, setLang } = useI18n()
  const [initial] = useState(initProfiles)
  const [profiles, setProfiles] = useState<string[]>(initial.profiles)
  const [active, setActive] = useState(initial.active)
  const [events, setEvents] = useState<TimelineEvent[]>(() =>
    loadEvents(initial.active),
  )
  const [name, setName] = useState(() => loadName(initial.active))
  const [profile, setProfile] = useState(() => loadProfile(initial.active))
  const [currentWeightInput, setCurrentWeightInput] = useState(() => {
    const measured = weightAtDate(events, today())
    return measured
      ? String(convertWeight(measured.weight, measured.unit, profile.weightUnit))
      : ''
  })
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState<SharedData | null>(() =>
    parseShareHash(location.hash),
  )
  const [editing, setEditing] = useState<TimelineEvent | null>(null)
  const { photoUrls, reloadPhotos } = usePhotos()
  const timelineRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const shareWrapRef = useRef<HTMLDivElement>(null)
  const [shareMenu, setShareMenu] = useState(false)
  const [cardFormat, setCardFormat] = useState<CardFormat | null>(null)

  useEffect(() => {
    const onHashChange = () => setShared(parseShareHash(location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Close the share dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!shareMenu) return
    const onDown = (e: MouseEvent) => {
      if (!shareWrapRef.current?.contains(e.target as Node)) setShareMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [shareMenu])

  const viewEvents = shared ? shared.events : events
  const viewName = shared ? shared.name : name
  const currentWeight = weightAtDate(events, today())
  const displayedWeight = currentWeight
    ? convertWeight(currentWeight.weight, currentWeight.unit, profile.weightUnit)
    : ''
  const currentDivisions = profile.uniforms.flatMap((uniform) => {
    const division = divisionAt(events, profile, today(), uniform)
    return division ? [division] : []
  })
  const firstEventDate =
    events.length > 0
      ? events.reduce(
          (first, event) => (event.date < first ? event.date : first),
          events[0].date,
        )
      : undefined
  const localAgeDivisions = ageDivisionChanges(profile.birthYear, firstEventDate)
  const viewDivisions = shared ? (shared.divisions ?? []) : currentDivisions
  const viewAgeDivisions = shared ? (shared.ageDivisions ?? []) : localAgeDivisions

  useEffect(() => {
    setCurrentWeightInput(String(displayedWeight))
  }, [active, displayedWeight])

  function updateEvents(next: TimelineEvent[]) {
    setEvents(next)
    saveEvents(active, next)
  }

  function switchProfile(id: string) {
    setActive(id)
    setActiveProfile(id)
    setEvents(loadEvents(id))
    setName(loadName(id))
    setProfile(loadProfile(id))
    setEditing(null)
  }

  function addProfile() {
    const id = crypto.randomUUID()
    const next = [...profiles, id]
    setProfiles(next)
    saveProfiles(next)
    switchProfile(id)
  }

  function deleteProfile() {
    if (!confirm(t('profile.confirmDelete'))) return
    void Promise.all(events.map((e) => deletePhoto(e.id))).then(reloadPhotos)
    removeProfileData(active)
    let next = profiles.filter((id) => id !== active)
    if (next.length === 0) next = [crypto.randomUUID()]
    setProfiles(next)
    saveProfiles(next)
    switchProfile(next[0])
  }

  async function saveEvent(event: TimelineEvent, photo: PhotoChange) {
    if (editing) {
      updateEvents(events.map((e) => (e.id === event.id ? event : e)))
      setEditing(null)
    } else {
      updateEvents([...events, event])
    }
    if (photo instanceof File) {
      await putPhoto(event.id, await resizeImage(photo))
      await reloadPhotos()
    } else if (photo === 'remove') {
      await deletePhoto(event.id)
      await reloadPhotos()
    }
  }

  function startEdit(event: TimelineEvent) {
    setEditing(event)
    document.querySelector('.event-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleName(value: string) {
    setName(value)
    saveName(active, value)
  }

  function handleProfile(value: AthleteProfile) {
    setProfile(value)
    saveProfile(active, value)
  }

  function toggleUniform(uniform: Uniform) {
    const isSelected = profile.uniforms.includes(uniform)
    if (isSelected && profile.uniforms.length === 1) return
    const selected = isSelected
      ? profile.uniforms.filter((current) => current !== uniform)
      : [...profile.uniforms, uniform]
    const uniforms = (['gi', 'no-gi'] as const).filter((current) =>
      selected.includes(current),
    )
    handleProfile({ ...profile, uniforms })
  }

  function handleCurrentWeight() {
    const weight = Number(currentWeightInput)
    if (!Number.isFinite(weight) || weight <= 0) {
      setCurrentWeightInput(String(displayedWeight))
      return
    }
    if (weight === displayedWeight) return
    const date = today()
    const existing = [...events]
      .reverse()
      .find((event) => event.type === 'weight' && event.date === date)
    const event: TimelineEvent = {
      ...existing,
      id: existing?.id ?? crypto.randomUUID(),
      type: 'weight',
      date,
      weight,
      weightUnit: profile.weightUnit,
    }
    updateEvents(
      existing
        ? events.map((current) => (current.id === existing.id ? event : current))
        : [...events, event],
    )
  }

  async function restoreBackup(data: BackupData) {
    if (events.length > 0 && !confirm(t('shared.confirmReplace'))) return
    setEditing(null)
    updateEvents(data.events)
    handleName(data.name)
    handleProfile(data.profile)
    for (const [id, dataUrl] of Object.entries(data.photos ?? {})) {
      await putPhoto(id, await dataUrlToBlob(dataUrl))
    }
    await reloadPhotos()
  }

  function closeShared() {
    clearShareHash()
    setShared(null)
  }

  async function handleShareLink() {
    const url = buildShareUrl({
      name: viewName,
      events: viewEvents,
      divisions: viewDivisions,
      ageDivisions: viewAgeDivisions,
    })
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function capture(node: HTMLElement, pixelRatio: number): Promise<string> {
    await document.fonts.ready
    // Make sure every photo is fully decoded before serializing.
    await Promise.all(
      Array.from(node.querySelectorAll('img')).map((img) =>
        img.decode().catch(() => {}),
      ),
    )
    const options = { pixelRatio, backgroundColor: '#14161a' }
    // Safari decodes images inside the SVG capture lazily, so the first
    // render(s) come out with blank photos. Warm-up passes are the
    // established workaround; the last pass has everything painted.
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      await toPng(node, options)
      await toPng(node, options)
    }
    return toPng(node, options)
  }

  async function deliverPng(dataUrl: string) {
    // Native share sheet only on mobile: it's how you post to social
    // apps there. On desktop it's clunky, so download instead.
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'bjj-journey.png', { type: 'image/png' })
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
    link.download = 'bjj-journey.png'
    link.href = dataUrl
    link.click()
  }

  async function exportTimeline() {
    const node = timelineRef.current
    if (!node || exporting) return
    setExporting(true)
    try {
      await deliverPng(await capture(node, 2))
    } finally {
      setExporting(false)
    }
  }

  // The summary card renders off-screen; capture it on the frame after
  // it mounts.
  useEffect(() => {
    if (!cardFormat) return
    let cancelled = false
    const run = async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const node = cardRef.current
      if (node && !cancelled) {
        await deliverPng(await capture(node, 1))
      }
      setCardFormat(null)
      setExporting(false)
    }
    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardFormat])

  function pickExport(format: CardFormat | 'full') {
    setShareMenu(false)
    if (format === 'full') {
      void exportTimeline()
    } else {
      setExporting(true)
      setCardFormat(format)
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
          <div className="export-wrap" ref={shareWrapRef}>
            <button
              type="button"
              className="btn-primary"
              disabled={viewEvents.length === 0 || exporting}
              onClick={() => setShareMenu((v) => !v)}
            >
              {exporting ? t('export.sharing') : `📤 ${t('share.menu')}`}
            </button>
            {shareMenu && (
              <div className="export-menu">
                <button type="button" onClick={handleShareLink}>
                  {copied ? `✅ ${t('share.copied')}` : `🔗 ${t('share.button')}`}
                </button>
                <button
                  type="button"
                  onClick={() => pickExport('story')}
                  title={t('export.instagramHint')}
                >
                  📸 {t('export.instagram')}
                </button>
                <div className="export-menu-sep" />
                <button type="button" onClick={() => pickExport('full')}>
                  📜 {t('export.full')}
                </button>
                <button type="button" onClick={() => pickExport('story')}>
                  📱 {t('export.story')}
                </button>
                <button type="button" onClick={() => pickExport('square')}>
                  ⬛ {t('export.square')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {cardFormat && (
        <div className="offscreen" aria-hidden>
          <SummaryCard
            ref={cardRef}
            events={viewEvents}
            name={viewName}
            divisions={viewDivisions}
            format={cardFormat}
          />
        </div>
      )}

      {shared && (
        <div className="shared-banner">
          <span>👀 {t('shared.banner')}</span>
          <div className="shared-banner-actions">
            <button type="button" className="btn-primary" onClick={closeShared}>
              🥋 {t('shared.create')}
            </button>
          </div>
        </div>
      )}

      <main className={`app-main ${shared ? 'app-main-shared' : ''}`}>
        {!shared && (
          <aside className="panel panel-left">
            <label className="field">
              <span>{t('profile.title')}</span>
              <div className="profile-row">
                <select
                  value={active}
                  onChange={(e) => switchProfile(e.target.value)}
                >
                  {profiles.map((id, i) => (
                    <option key={id} value={id}>
                      {(id === active ? name : loadName(id)) ||
                        `${t('profile.default')} ${i + 1}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary btn-profile"
                  title={t('profile.add')}
                  aria-label={t('profile.add')}
                  onClick={addProfile}
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-profile"
                  title={t('profile.delete')}
                  aria-label={t('profile.delete')}
                  onClick={deleteProfile}
                >
                  🗑
                </button>
              </div>
            </label>

            <label className="field">
              <span>{t('panel.yourName')}</span>
              <input
                type="text"
                value={name}
                placeholder={t('panel.yourNamePlaceholder')}
                onChange={(e) => handleName(e.target.value)}
              />
            </label>

            <div className="profile-details">
              <label className="field">
                <span>{t('profile.birthYear')}</span>
                <input
                  type="number"
                  min={1900}
                  max={new Date().getFullYear() - 4}
                  value={profile.birthYear ?? ''}
                  onChange={(e) =>
                    handleProfile({
                      ...profile,
                      birthYear: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
                <small className="field-hint">{t('profile.birthYearHint')}</small>
              </label>

              <label className="field">
                <span>{t('profile.sex')}</span>
                <select
                  value={profile.sex ?? ''}
                  onChange={(e) =>
                    handleProfile({
                      ...profile,
                      sex: (e.target.value as Sex) || undefined,
                    })
                  }
                >
                  <option value="">{t('profile.sexPlaceholder')}</option>
                  <option value="male">{t('profile.sex.male')}</option>
                  <option value="female">{t('profile.sex.female')}</option>
                </select>
              </label>

              <label className="field">
                <span>
                  {t('profile.currentWeight', { unit: profile.weightUnit })}
                </span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={currentWeightInput}
                  onChange={(e) => setCurrentWeightInput(e.target.value)}
                  onBlur={handleCurrentWeight}
                />
                <small className="field-hint">
                  {t('profile.currentWeightHint')}
                </small>
              </label>

              <label className="field">
                <span>{t('profile.weightUnit')}</span>
                <select
                  value={profile.weightUnit}
                  onChange={(e) =>
                    handleProfile({
                      ...profile,
                      weightUnit: e.target.value as WeightUnit,
                    })
                  }
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </label>

              <label className="field">
                <span>{t('profile.uniform')}</span>
                <div className="uniform-picker" role="group">
                  {(['gi', 'no-gi'] as const).map((uniform) => (
                    <button
                      key={uniform}
                      type="button"
                      className={`type-option uniform-option ${
                        profile.uniforms.includes(uniform) ? 'selected' : ''
                      }`}
                      aria-pressed={profile.uniforms.includes(uniform)}
                      onClick={() => toggleUniform(uniform)}
                    >
                      {t(`division.uniform.${uniform}`)}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="profile-divisions">
              {formatDivisions(currentDivisions, t).map((division) => (
                <p key={division} className="profile-division">
                  {division}
                </p>
              ))}
            </div>

            <h2 className="panel-title">{t('panel.addEvent')}</h2>
            <EventForm
              events={events}
              profile={profile}
              onSave={(event, photo) => void saveEvent(event, photo)}
              editing={editing}
              editingPhotoUrl={editing ? photoUrls[editing.id] : undefined}
              onCancelEdit={() => setEditing(null)}
            />

            <h2 className="panel-title">{t('panel.events')}</h2>
            <EventList
              events={events}
              editingId={editing?.id}
              onEdit={startEdit}
              onDelete={(id) => {
                if (!confirm(t('form.confirmDelete'))) return
                if (editing?.id === id) setEditing(null)
                updateEvents(events.filter((e) => e.id !== id))
                void deletePhoto(id).then(reloadPhotos)
              }}
            />

            <h2 className="panel-title">{t('backup.title')}</h2>
            <Backup
              name={name}
              profile={profile}
              events={events}
              onRestore={restoreBackup}
            />
          </aside>
        )}

        <section className="panel panel-right">
          <Timeline
            ref={timelineRef}
            events={viewEvents}
            name={viewName}
            divisions={viewDivisions}
            ageDivisions={viewAgeDivisions}
            photos={shared ? undefined : photoUrls}
          />
        </section>
      </main>

      <footer className="app-footer">
        {t('footer.by')}{' '}
        <a href="https://caarlos0.dev" target="_blank" rel="noreferrer">
          caarlos0.dev
        </a>{' '}
        ·{' '}
        <a
          href="https://github.com/caarlos0/bjj-journey"
          target="_blank"
          rel="noreferrer"
        >
          {t('footer.source')}
        </a>
      </footer>
    </div>
  )
}
