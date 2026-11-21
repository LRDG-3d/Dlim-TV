import { useState } from 'react'
import { useFavorites } from '../hooks/useFavorites.jsx'

export default function Settings() {
  const { ids, clear } = useFavorites()
  const [safe, setSafe] = useState(() => document.documentElement.classList.contains('safe'))
  const flip = () => {
    const n = !safe; setSafe(n); document.documentElement.classList.toggle('safe', n)
    try { localStorage.setItem('dlim:safe', n ? '1' : '0') } catch { /* sin almacenamiento */ }
  }
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
          <h2>Modo seguro: {safe ? 'activado' : 'desactivado'}</h2>
          <p>Quita animaciones, vidrio y barras flotantes. Úsalo para descartar fallos de dibujo.</p>
        </div>
        <button className="btn" onClick={flip}>{safe ? 'Activar efectos' : 'Activar modo seguro'}</button>
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
