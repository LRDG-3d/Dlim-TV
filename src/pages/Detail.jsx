import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listZips, epLabel, epNum, epCode, mb, fmtDate } from '../lib/zips.js'
import Spinner from '../components/Spinner.jsx'
import { useDownloads, isNative, safeName, fmtSpeed, pctOf } from '../lib/downloads.js'
import { useTitles } from '../hooks/useTitles.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'

const hueOf = (id) => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 0)
const pad = (n) => String(n).padStart(2, '0')
const PLAY = 'M7 4l13 8-13 8z'
const HEART = 'M12 21s-7-4.6-9.3-9A5.3 5.3 0 0112 6.6 5.3 5.3 0 0121.3 12C19 16.4 12 21 12 21z'
const SHARE = 'M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13'
const Icon = ({ d, fill }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={fill || 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

function Cover({ it }) {
  const [bad, setBad] = useState(false)
  const src = it.cover || (it.image && `${import.meta.env.BASE_URL}images/${it.image}`)
  if (src && !bad) return <img className="dv-img" src={src} alt={it.title} onError={() => setBad(true)} />
  const h = hueOf(it.id)
  return (
    <div className="dv-img dv-gen" style={{ background: `linear-gradient(160deg, hsl(${h} 70% 38%), hsl(${(h + 50) % 360} 60% 10%) 80%)` }}>
      <span>{it.title}</span>
    </div>
  )
}

function Episode({ e, i, dl }) {
  const body = (
    <>
      <span className="dv-epn">{epNum(e.name) ?? i + 1}</span>
      <span className="dv-ept">
        <small>{epCode(e.name)}</small>
        <b>{epLabel(e.name)}</b>
        <em>{[fmtDate(e.date), mb(e.size)].filter(Boolean).join(' · ')}</em>
      </span>
    </>
  )
  if (!isNative) return <a className="dv-ep" href={e.url} target="_blank" rel="noopener noreferrer">{body}<i>›</i></a>
  const id = safeName(e.name.split('/').pop())
  const s = dl.map[id]
  const st = s && s.state
  const p = pctOf(s)
  let ctl
  if (st === 'done') ctl = <span className="dl-done">✓ En la app</span>
  else if (st === 'downloading' || st === 'queued') {
    ctl = <span className="dl-ctl"><b>{st === 'queued' ? 'En cola' : `${p}% · ${fmtSpeed(s.speed)}`}</b>
      <button onClick={() => dl.pause(id)}>Pausar</button><button onClick={() => dl.cancel(id)}>✕</button></span>
  } else if (st === 'paused') {
    ctl = <span className="dl-ctl"><b>Pausado · {p}%</b>
      <button onClick={() => dl.start(e.url, id)}>Reanudar</button><button onClick={() => dl.cancel(id)}>✕</button></span>
  } else ctl = <button className="dl-btn" onClick={() => dl.start(e.url, id)}>{st === 'error' ? '↻ Reintentar' : '↓ Descargar'}</button>
  return (
    <div className="dv-ep dl-row">
      {body}{ctl}
      {(st === 'downloading' || st === 'paused' || st === 'queued') && <div className="dl-bar"><i style={{ width: `${p}%` }} /></div>}
    </div>
  )
}

function Season({ s, desc, refresh, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const [st, setSt] = useState({ loading: false, list: null, err: '' })
  const dl = useDownloads()
  useEffect(() => {
    if (!open) return undefined
    let live = true
    setSt((p) => ({ ...p, loading: true, err: '' }))
    listZips(s.zip)
      .then((list) => { if (live) setSt({ loading: false, list, err: '' }) })
      .catch(() => { if (live) setSt({ loading: false, list: null, err: 'No se pudo leer la carpeta desde aquí.' }) })
    return () => { live = false }
  }, [open, s.zip, refresh])
  const list = st.list ? (desc ? [...st.list].reverse() : st.list) : null
  const total = st.list ? st.list.length : s.count
  return (
    <div className="dv-season">
      <button className={open ? 'dv-sh2 open' : 'dv-sh2'} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="dv-folder"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg></span>
        <span className="dv-st">Temporada {pad(s.number)}{total ? <small>{total} episodios</small> : null}</span>
        <span className="dv-chev">⌃</span>
      </button>
      {open && (
        <div className="dv-eps">
          {st.loading && <p className="dv-note dv-load"><Spinner small /> Buscando episodios…</p>}
          {st.err && <p className="dv-note">{st.err}</p>}
          {list && !list.length && <p className="dv-note">No se detectaron archivos ZIP en la carpeta.</p>}
          {list && list.map((e, i) => <Episode key={e.url} e={e} i={i} dl={dl} />)}
          <a className="dv-folderlink" href={s.zip} target="_blank" rel="noopener noreferrer">Abrir carpeta ↗</a>
        </div>
      )}
    </div>
  )
}

export default function Detail() {
  const { id } = useParams()
  const { titles, loading } = useTitles()
  const { has, toggle } = useFavorites()
  const [tab, setTab] = useState('resumen')
  const [desc, setDesc] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [msg, setMsg] = useState('')
  const it = titles.find((x) => x.id === id)
  if (!it && loading) return <main className="page"><Spinner label="Cargando…" /></main>
  if (!it) return <main className="page"><p className="empty">No encontramos esa producción. <Link to="/catalogo">Ir al catálogo</Link></p></main>

  const seasons = Array.isArray(it.seasons) ? it.seasons : []
  const seasonCount = seasons.length || (typeof it.seasons === 'number' ? it.seasons : 0)
  const fav = has(it.id)
  async function share() {
    const data = { title: it.title, text: `${it.title} en Dlim TV`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(window.location.href); setMsg('Enlace copiado'); setTimeout(() => setMsg(''), 1800) }
    } catch { /* cancelado */ }
  }

  return (
    <main className="dv">
      <div className="dv-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'resumen'} className={tab === 'resumen' ? 'on' : ''} onClick={() => setTab('resumen')}>Resumen</button>
        <button role="tab" aria-selected={tab === 'temporadas'} className={tab === 'temporadas' ? 'on' : ''} onClick={() => setTab('temporadas')}>Temporadas</button>
      </div>

      {tab === 'resumen' ? (
        <div className="dv-view">
          <div className="dv-cover">
            <Cover it={it} />
            <div className="dv-actions">
              <button onClick={() => setTab('temporadas')} aria-label="Ver temporadas"><Icon d={PLAY} fill="currentColor" /></button>
              <button className={fav ? 'fav-on' : ''} onClick={() => toggle(it.id)} aria-pressed={fav} aria-label="Favoritos"><Icon d={HEART} fill={fav ? 'currentColor' : 'none'} /></button>
              <button onClick={share} aria-label="Compartir"><Icon d={SHARE} /></button>
            </div>
            {msg && <span className="dv-msg">{msg}</span>}
          </div>
          <section className="dv-sheet up">
            <h1>{it.title}</h1>
            <div className="dv-chips">
              <span className="first">{it.type}</span>
              <span>{it.year}</span>
              {seasonCount > 0 && <span>{seasonCount} {seasonCount === 1 ? 'temporada' : 'temporadas'}</span>}
              {it.episodes > 0 && <span>{it.episodes} episodios</span>}
              {it.genres.map((g) => <span key={g}>{g}</span>)}
            </div>
            {it.synopsis && <p className="dv-syn">{it.synopsis}</p>}
          </section>
          {it.cast.length > 0 && (
            <section className="dv-sheet">
              <h2>Reparto</h2>
              <div className="dv-cast">
                {it.cast.map((n) => (
                  <div className="dv-person" key={n}>
                    <span>{n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
                    <b>{n}</b>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="dv-view dv-seasons">
          <div className="dv-top">
            <h2>{it.title}</h2>
            <div>
              <button className="dv-pill" onClick={() => setDesc((d) => !d)}>⇅ {desc ? 'Descendente' : 'Ascendente'}</button>
              <button className="dv-pill sq" onClick={() => setRefresh((r) => r + 1)} aria-label="Actualizar">↻</button>
            </div>
          </div>
          {seasons.length
            ? seasons.map((s, i) => <Season key={s.number} s={s} desc={desc} refresh={refresh} defaultOpen={i === 0} />)
            : <p className="dv-note">Aún no hay temporadas agregadas.</p>}
        </div>
      )}
    </main>
  )
}
