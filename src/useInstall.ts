import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as { standalone?: boolean }).standalone === true)
  )
}

// 'native' → browser fired beforeinstallprompt, we can trigger the real
// install dialog. 'ios' → Safari on iOS, where install is manual via the
// share sheet. null → already installed or not installable.
export function useInstall(): {
  available: 'native' | 'ios' | null
  promptInstall: () => void
} {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setHidden(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const available = hidden ? null : deferred ? 'native' : isIOS ? 'ios' : null

  return {
    available,
    promptInstall: () => {
      void deferred?.prompt()
    },
  }
}
