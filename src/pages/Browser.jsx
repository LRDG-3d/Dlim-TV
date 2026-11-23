import { useState } from 'react'
import { isNative, openBrowser } from '../lib/downloads.js'

const KEY = 'dlim:recent'
const loadRecent = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export default function Browser() {
  const [q, setQ] = useState('')
  const [recent, setRecent] = useState(loadRecent)
  if (!isNative) return (
    <main className="page"><h1 className="page-title">Navegador</h1>
      <p className="empty">El navegador con descargas funciona solo en la app de Android.</p></main>
  )
  const go = (text) => {
    const v = text.trim()
    if (!v) return
    const r = [v, ...recent.filter((x) => x !== v)].slice(0, 8)
    setRecent(r)
    try { localStorage.setItem(KEY, JSON.stringify(r)) } catch { /* sin almacenamiento */ }
    openBrowser(v)
  }
  return (
    <main className="page">
      <h1 className="page-title">Navegador</h1>
      <p className="dl-hint">Abre cualquier página. Cuando detecte un video (que no sea de YouTube), aparecerá el botón <b>Descargar</b>.</p>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go(q)} placeholder="Buscar o escribir dirección" />
        <button className="btn primary" onClick={() => go(q)}>Abrir</button>
      </div>
      {recent.length > 0 && (
        <>
          <h2 className="set-h">Recientes</h2>
          <div className="dl-list">
            {recent.map((r) => <button key={r} className="recent" onClick={() => go(r)}>{r}</button>)}
          </div>
        </>
      )}
    </main>
  )
}
