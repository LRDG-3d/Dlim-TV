import { useFavorites } from '../hooks/useFavorites.jsx'

export default function Settings() {
  const { ids, clear } = useFavorites()
  return (
    <main className="page">
      <h1 className="page-title">Ajustes</h1>
      <section className="setting">
        <div>
          <h2>Mi lista</h2>
          <p>{ids.length} {ids.length === 1 ? 'producción guardada' : 'producciones guardadas'} en este dispositivo.</p>
        </div>
        <button className="btn" disabled={!ids.length}
          onClick={() => window.confirm('¿Borrar todos tus favoritos?') && clear()}>Borrar favoritos</button>
      </section>
      <section className="setting">
        <div>
          <h2>Acerca de Dlim TV</h2>
          <p>Catálogo de series y telenovelas de Televisa, 2000-2014. Versión 1.0.</p>
        </div>
      </section>
    </main>
  )
}
