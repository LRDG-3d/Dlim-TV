import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import { useTitles } from '../hooks/useTitles.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'

export default function Favorites() {
  const { titles } = useTitles()
  const { ids } = useFavorites()
  const list = titles.filter((x) => ids.includes(x.id))
  return (
    <main className="page">
      <h1 className="page-title">Mis favoritos</h1>
      {list.length ? <div className="grid">{list.map((i) => <Card key={i.id} item={i} />)}</div>
        : <p className="empty">Aún no tienes favoritos. Explora el <Link to="/catalogo">catálogo</Link> y toca “+ Mi lista”.</p>}
    </main>
  )
}
