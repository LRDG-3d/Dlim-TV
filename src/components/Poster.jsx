import { useState } from 'react'

function hue(id) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

// Muestra la imagen local si existe; si no, una portada generada (nunca imagen rota).
export default function Poster({ item }) {
  const [failed, setFailed] = useState(false)
  const h = hue(item.id)
  if (item.image && !failed) {
    return (
      <img className="poster" alt={item.title} loading="lazy"
        src={`${import.meta.env.BASE_URL}images/${item.image}`} onError={() => setFailed(true)} />
    )
  }
  return (
    <div className="poster gen" role="img" aria-label={item.title}
      style={{ background: `linear-gradient(160deg, hsl(${h} 70% 38%), hsl(${(h + 50) % 360} 60% 12%) 75%)` }}>
      <span>{item.title}</span>
      <small>{item.year}</small>
    </div>
  )
}
