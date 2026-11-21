import { useRef } from 'react'
import Card from './Card.jsx'

export default function Row({ title, items }) {
  const ref = useRef(null)
  if (!items.length) return null
  const go = (d) => ref.current.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' })
  return (
    <section className="row">
      <h2>{title}</h2>
      <div className="row-wrap">
        <button className="arrow l" onClick={() => go(-1)} aria-label="Anterior">‹</button>
        <div className="track" ref={ref}>{items.map((i) => <Card key={i.id} item={i} />)}</div>
        <button className="arrow r" onClick={() => go(1)} aria-label="Siguiente">›</button>
      </div>
    </section>
  )
}
