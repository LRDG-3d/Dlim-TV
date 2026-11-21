import { useState } from 'react'
import { useFavorites } from '../hooks/useFavorites.jsx'
import { ACCENTS, BGS, DEFAULTS, loadTheme, applyTheme, saveTheme } from '../lib/theme.js'

function Swatches({ list, value, onPick }) {
  const preset = list.some(([, c]) => c.toLowerCase() === value.toLowerCase())
  return (
    <div className="swatches">
      {list.map(([n, c]) => (
        <button key={c} className={c.toLowerCase() === value.toLowerCase() ? 'sw on' : 'sw'} style={{ background: c }} onClick={() => onPick(c)} aria-label={n} title={n} />
      ))}
      <label className={preset ? 'sw custom' : 'sw custom on'} title="Color personalizado">
        <input type="color" value={value} onChange={(e) => onPick(e.target.value)} aria-label="Color personalizado" />
        <span>+</span>
      </label>
    </div>
  )
}

function Switch({ on, onChange, label }) {
  return <button role="switch" aria-checked={on} className={on ? 'switch on' : 'switch'} onClick={() => onChange(!on)} aria-label={label}><i /></button>
}

export default function Settings() {
  const { ids, clear } = useFavorites()
  const [t, setT] = useState(loadTheme)
  const [safe, setSafe] = useState(() => document.documentElement.classList.contains('safe'))
  const upd = (p) => { const n = { ...t, ...p }; setT(n); applyTheme(n); saveTheme(n) }
  const reset = () => { setT({ ...DEFAULTS }); applyTheme(DEFAULTS); saveTheme(DEFAULTS) }
  const flipSafe = () => {
    const n = !safe; setSafe(n); document.documentElement.classList.toggle('safe', n)
    try { localStorage.setItem('dlim:safe', n ? '1' : '0') } catch { /* sin almacenamiento */ }
  }
  return (
    <main className="page">
      <h1 className="page-title">Ajustes</h1>

      <h2 className="set-h">Apariencia</h2>
      <section className="setting col">
        <div><h3>Color principal</h3><p>Botones, subrayados y detalles. Toca “+” para elegir cualquier color.</p></div>
        <Swatches list={ACCENTS} value={t.accent} onPick={(c) => upd({ accent: c })} />
      </section>
      <section className="setting col">
        <div><h3>Color de fondo</h3><p>Las tarjetas y barras se ajustan a este color.</p></div>
        <Swatches list={BGS} value={t.bg} onPick={(c) => upd({ bg: c })} />
      </section>
      <section className="setting col">
        <div><h3>Tamaño de portadas</h3></div>
        <div className="seg">
          {[['Pequeñas', 0.85], ['Medianas', 1], ['Grandes', 1.2]].map(([n, v]) => (
            <button key={v} className={t.size === v ? 'on' : ''} onClick={() => upd({ size: v })}>{n}</button>
          ))}
        </div>
      </section>
      <section className="setting">
        <div><h3>Animaciones</h3><p>Efectos de entrada y movimiento.</p></div>
        <Switch on={t.anim} onChange={(v) => upd({ anim: v })} label="Animaciones" />
      </section>
      <section className="setting">
        <div><h3>Efecto vidrio</h3><p>Transparencia en las barras de arriba y abajo.</p></div>
        <Switch on={t.glass} onChange={(v) => upd({ glass: v })} label="Efecto vidrio" />
      </section>
      <button className="btn" onClick={reset}>Restablecer apariencia</button>

      <h2 className="set-h">Datos</h2>
      <section className="setting">
        <div><h3>Mi lista</h3><p>{ids.length} {ids.length === 1 ? 'producción guardada' : 'producciones guardadas'} en este dispositivo.</p></div>
        <button className="btn" disabled={!ids.length} onClick={() => window.confirm('¿Borrar todos tus favoritos?') && clear()}>Borrar favoritos</button>
      </section>
      <section className="setting">
        <div><h3>Modo seguro: {safe ? 'activado' : 'desactivado'}</h3><p>Quita animaciones, vidrio y barras flotantes. Úsalo si ves fallos de dibujo.</p></div>
        <button className="btn" onClick={flipSafe}>{safe ? 'Desactivar' : 'Activar'}</button>
      </section>
      <section className="setting">
        <div><h3>Acerca de Dlim TV</h3><p>Catálogo de series y telenovelas de Televisa, 2000-2014. Versión 1.0.</p></div>
      </section>
    </main>
  )
}
