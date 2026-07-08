import { useCallback, useEffect, useState } from 'react'
import { blobToDataUrl, getAllPhotos } from './photos'

// Data URLs for every stored photo, keyed by event id. Data URLs (not
// object URLs) so html-to-image can embed them directly when exporting
// — fetching blob: URLs during capture is unreliable. Call reload after
// writing to or deleting from the photo store.
export function usePhotos(): {
  photoUrls: Record<string, string>
  reloadPhotos: () => Promise<void>
} {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})

  const reloadPhotos = useCallback(async () => {
    const all = await getAllPhotos()
    const next: Record<string, string> = {}
    for (const [id, blob] of all) next[id] = await blobToDataUrl(blob)
    setPhotoUrls(next)
  }, [])

  useEffect(() => {
    void reloadPhotos()
  }, [reloadPhotos])

  return { photoUrls, reloadPhotos }
}
