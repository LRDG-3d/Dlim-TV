import { useEffect, useState } from 'react'
import { Capacitor, registerPlugin } from '@capacitor/core'

// Descargas dentro de la app (solo en la app de Android; en la web se usa el enlace normal).
export const isNative = Capacitor.isNativePlatform()
const Native = isNative ? registerPlugin('Downloader') : null

export const safeName = (n) => n.replace(/[\\/:*?"<>|]/g, '_')
export const fmtSpeed = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB/s` : `${Math.round((b || 0) / 1024)} KB/s`)
export const fmtSize = (b) => (b ? `${(b / 1048576).toFixed(1)} MB` : '')
export const pctOf = (x) => (x && x.total ? Math.min(100, Math.floor((x.done * 100) / x.total)) : 0)

export function useDownloads() {
  const [map, setMap] = useState({})
  useEffect(() => {
    if (!Native) return undefined
    let live = true
    let handle = null
    Native.list()
      .then((r) => { if (live) setMap(Object.fromEntries((r.items || []).map((x) => [x.id, x]))) })
      .catch(() => {})
    Native.addListener('progress', (o) => setMap((p) => ({ ...p, [o.id]: { ...p[o.id], ...o } })))
      .then((h) => { if (live) handle = h; else h.remove() })
    return () => { live = false; if (handle) handle.remove() }
  }, [])
  const drop = (id) => setMap((p) => { const n = { ...p }; delete n[id]; return n })
  return {
    map,
    start: (url, name) => { const id = safeName(name); Native.start({ id, url, name: id }).catch(() => {}) },
    pause: (id) => { Native.pause({ id }).catch(() => {}) },
    cancel: (id) => { Native.cancel({ id }).catch(() => {}); drop(id) },
    remove: (id) => { Native.remove({ id }).catch(() => {}); drop(id) },
  }
}

// Navegador propio de la app (detecta videos) y apertura de archivos descargados.
export const openBrowser = (url) => { if (Native) Native.openBrowser({ url }).catch(() => {}) }
export const openFile = (id) => { if (Native) Native.open({ id }).catch(() => {}) }
