import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import Card from '../components/Card.jsx'
import { useTitles } from '../hooks/useTitles.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'

export default function Favorites() {
  const { titles, loading } = useTitles()
  const { ids } = useFavorites()
  const list = titles.filter((x) => ids.includes(x.id))
  return (
    <main className="page">
      <h1 className="page-title">Mis favoritos</h1>
      {loading && !list.length ? <Spinner label="Cargando…" /> : list.length ? <div className="grid">{list.map((i) => <Card key={i.id} item={i} />)}</div>
        : <p className="empty">Aún no tienes favoritos. Explora el <Link to="/catalogo">catálogo</Link> y toca “+ Mi lista”.</p>}
    </main>
  )
}
