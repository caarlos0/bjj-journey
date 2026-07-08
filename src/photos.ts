// Photos live in IndexedDB (too big for localStorage), keyed by event
// id. They are intentionally left out of share URLs.

const DB_NAME = 'bjjourney'
const STORE = 'photos'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

export function putPhoto(id: string, blob: Blob): Promise<IDBValidKey> {
  return tx('readwrite', (s) => s.put(blob, id))
}

export function deletePhoto(id: string): Promise<undefined> {
  return tx('readwrite', (s) => s.delete(id))
}

export async function getAllPhotos(): Promise<Map<string, Blob>> {
  const [keys, values] = await Promise.all([
    tx('readonly', (s) => s.getAllKeys()),
    tx('readonly', (s) => s.getAll()),
  ])
  const map = new Map<string, Blob>()
  keys.forEach((key, i) => map.set(String(key), values[i] as Blob))
  return map
}

// Downscale before storing: phone photos are huge and the timeline only
// needs a modest resolution.
export async function resizeImage(file: Blob, maxDim = 1280): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height))
  const width = Math.round(bmp.width * scale)
  const height = Math.round(bmp.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height)
  bmp.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.82,
    ),
  )
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob()
}
