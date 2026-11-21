import { Link } from 'react-router-dom'
import Poster from './Poster.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'

export default function Card({ item }) {
  const { has, toggle } = useFavorites()
  const fav = has(item.id)
  return (
    <article className="card">
      <Link to={`/titulo/${item.id}`}><Poster item={item} /></Link>
      <div className="card-info">
        <Link to={`/titulo/${item.id}`} className="card-title">{item.title}</Link>
        <div className="card-meta">{item.year} · {item.type} · {item.genres[0]}</div>
        <button className={fav ? 'fav on' : 'fav'} onClick={() => toggle(item.id)} aria-pressed={fav}>
          {fav ? '✓ En mi lista' : '+ Mi lista'}
        </button>
      </div>
    </article>
  )
}
