import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import { titles, years, genres, types } from '../data/titles.js'

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function Catalog({ fixedType, heading, autoFocus }) {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const setQ = (v) => setParams(v ? { q: v } : {}, { replace: true })
  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('')
  const [type, setType] = useState('')
  const input = useRef(null)
  useEffect(() => { if (autoFocus) input.current?.focus() }, [autoFocus])

  const activeType = fixedType || type
  const list = titles
    .filter((x) => (!activeType || x.type === activeType) && (!year || x.year === +year) && (!genre || x.genres.includes(genre)))
    .filter((x) => !q || norm(`${x.title} ${x.cast.join(' ')}`).includes(norm(q)))
    .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))

  return (
    <main className="page">
      <h1 className="page-title">{heading}</h1>
      <div className="filters">
        <input ref={input} type="search" placeholder="Buscar título o actor" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Año">
          <option value="">Todos los años</option>{years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Género">
          <option value="">Todos los géneros</option>{genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        {!fixedType && (
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo">
            <option value="">Todos los tipos</option>{types.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
      </div>
      {list.length ? <div className="grid">{list.map((i) => <Card key={i.id} item={i} />)}</div>
        : <p className="empty">Sin resultados. Prueba con otro filtro o búsqueda.</p>}
    </main>
  )
}
