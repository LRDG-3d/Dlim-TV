import { useParams, Link } from 'react-router-dom'
import Poster from '../components/Poster.jsx'
import Row from '../components/Row.jsx'
import { useTitles } from '../hooks/useTitles.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'

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
            <div className="seasons">{it.seasons.map((s) => (
              <a key={s.number} className="btn" href={s.zip} target="_blank" rel="noopener noreferrer">Temporada {s.number}</a>
            ))}</div>
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
