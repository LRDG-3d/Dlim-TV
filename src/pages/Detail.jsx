import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listZips, epLabel, mb } from '../lib/zips.js'
import Poster from '../components/Poster.jsx'
import Row from '../components/Row.jsx'
import { useTitles } from '../hooks/useTitles.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'

function Season({ s }) {
  const [open, setOpen] = useState(false)
  const [st, setSt] = useState({ loading: false, list: null, err: '' })
  async function toggle() {
    const o = !open; setOpen(o)
    if (o && !st.list && !st.loading) {
      setSt({ loading: true, list: null, err: '' })
      try { setSt({ loading: false, list: await listZips(s.zip), err: '' }) }
      catch { setSt({ loading: false, list: null, err: 'No se pudo leer la carpeta desde aquí.' }) }
    }
  }
  return (
    <div className="season">
      <button className="btn" onClick={toggle} aria-expanded={open}>
        Temporada {s.number}{s.count ? ` · ${s.count} episodios` : ''} {open ? '▴' : '▾'}
      </button>
      {open && (
        <div className="eps">
          {st.loading && <p>Buscando episodios…</p>}
          {st.err && <p>{st.err}</p>}
          {st.list && !st.list.length && <p>No se detectaron archivos ZIP en la carpeta.</p>}
          {st.list && st.list.map((e) => (
            <a key={e.url} className="ep" href={e.url} target="_blank" rel="noopener noreferrer">
              <span>{epLabel(e.name)}</span><small>{mb(e.size)}</small><b>Descargar ZIP</b>
            </a>
          ))}
          <a className="folder" href={s.zip} target="_blank" rel="noopener noreferrer">Abrir carpeta ↗</a>
        </div>
      )}
    </div>
  )
}

export default function Detail() {
  const { id } = useParams()
  const { titles } = useTitles()
  const { has, toggle } = useFavorites()
  const it = titles.find((x) => x.id === id)
  if (!it) return <main className="page"><p className="empty">No encontramos esa producción. <Link to="/catalogo">Ir al catálogo</Link></p></main>
  const similar = titles.filter((x) => x.id !== it.id && x.genres.some((g) => it.genres.includes(g)))
  const seasonCount = Array.isArray(it.seasons) ? it.seasons.length : it.seasons || 0
  return (
    <main>
      <section className="detail">
        <Poster item={it} />
        <div className="detail-body">
          <h1>{it.title}</h1>
          <p className="detail-meta">{it.year} · {it.type} · {it.genres.join(', ')}</p>
          <p className="detail-syn">{it.synopsis}</p>
          <dl>
            <dt>Episodios</dt><dd>{it.episodes}</dd>
            {seasonCount > 0 && <><dt>Temporadas</dt><dd>{seasonCount}</dd></>}
            {it.cast.length > 0 && <><dt>Reparto</dt><dd>{it.cast.join(', ')}</dd></>}
          </dl>
          {Array.isArray(it.seasons) && it.seasons.length > 0 && (
            <div className="seasons">{it.seasons.map((s) => <Season key={s.number} s={s} />)}</div>
          )}
          <button className={has(it.id) ? 'btn on' : 'btn primary'} onClick={() => toggle(it.id)}>
            {has(it.id) ? '✓ En mi lista (quitar)' : '+ Agregar a favoritos'}
          </button>
        </div>
      </section>
      <div className="similar"><Row title="Más como esto" items={similar} /></div>
    </main>
  )
}
