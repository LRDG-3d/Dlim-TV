import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites.jsx'

export default function Hero({ items }) {
  const [i, setI] = useState(0)
  const { has, toggle } = useFavorites()
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 8000)
    return () => clearInterval(id)
  }, [items.length])
  const it = items[i]
  const h = [...it.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 0)
  const bg = it.image
    ? `url(${import.meta.env.BASE_URL}images/${it.image}) center/cover`
    : `radial-gradient(circle at 75% 30%, hsl(${h} 70% 40%), transparent 60%), linear-gradient(120deg, hsl(${(h + 40) % 360} 50% 14%), #0b0b10)`
  return (
    <section className="hero" key={it.id}>
      <div className="hero-bg" style={{ background: bg }} />
      <div className="hero-fade" />
      <div className="hero-body">
        <p className="hero-tag">{it.type} · {it.year}</p>
        <h1>{it.title}</h1>
        <p className="hero-syn">{it.synopsis}</p>
        <div className="hero-btns">
          <Link to={`/titulo/${it.id}`} className="btn primary">▶ Ver ficha</Link>
          <button className="btn" onClick={() => toggle(it.id)}>{has(it.id) ? '✓ En mi lista' : '+ Mi lista'}</button>
        </div>
      </div>
      <div className="dots">
        {items.map((x, n) => <button key={x.id} className={n === i ? 'on' : ''} onClick={() => setI(n)} aria-label={x.title} />)}
      </div>
    </section>
  )
}
