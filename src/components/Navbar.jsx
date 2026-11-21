import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const links = [
  ['/', 'Inicio'], ['/series', 'Series'], ['/telenovelas', 'Telenovelas'],
  ['/catalogo', 'Catálogo'], ['/favoritos', 'Favoritos'], ['/buscar', 'Buscar'],
]

export default function Navbar() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 30)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <header className={solid ? 'nav solid' : 'nav'}>
      <Link to="/" className="logo" aria-label="Dlim TV, inicio">dlim<b>tv</b></Link>
      <nav>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
        ))}
      </nav>
    </header>
  )
}
