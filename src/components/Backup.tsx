import { useRef } from 'react'
import { useI18n } from '../i18n'
import type { TimelineEvent } from '../types'

export interface BackupData {
  name: string
  events: TimelineEvent[]
}

interface BackupProps {
  name: string
  events: TimelineEvent[]
  onRestore: (data: BackupData) => void
}

export function Backup({ name, events, onRestore }: BackupProps) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)

  function download() {
    const payload = JSON.stringify(
      { version: 1, exportedAt: new Date().toISOString(), name, events },
      null,
      2,
    )
    const blob = new Blob([payload], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `bjj-journey-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async function restore(file: File) {
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.events)) throw new Error('missing events')
      onRestore({
        name: typeof data.name === 'string' ? data.name : '',
        events: data.events,
      })
    } catch {
      alert(t('backup.invalid'))
    }
  }

  return (
    <div className="backup">
      <button
        type="button"
        className="btn-secondary"
        disabled={events.length === 0}
        onClick={download}
      >
        💾 {t('backup.download')}
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => fileRef.current?.click()}
      >
        📂 {t('backup.restore')}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void restore(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
