import { useCallback, useEffect, useState } from 'react'
import { getAllPhotos } from './photos'

// Object URLs for every stored photo, keyed by event id. Call reload
// after writing to or deleting from the photo store.
export function usePhotos(): {
  photoUrls: Record<string, string>
  reloadPhotos: () => Promise<void>
} {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})

  const reloadPhotos = useCallback(async () => {
    const all = await getAllPhotos()
    setPhotoUrls((prev) => {
      for (const url of Object.values(prev)) URL.revokeObjectURL(url)
      const next: Record<string, string> = {}
      for (const [id, blob] of all) next[id] = URL.createObjectURL(blob)
      return next
    })
  }, [])

  useEffect(() => {
    void reloadPhotos()
  }, [reloadPhotos])

  return { photoUrls, reloadPhotos }
}
