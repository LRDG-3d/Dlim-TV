import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'

const links = [['/', 'Inicio'], ['/series', 'Series'], ['/telenovelas', 'Telenovelas'], ['/catalogo', 'Catálogo'], ['/favoritos', 'Mi lista']]

export default function Navbar() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const input = useRef(null)
  const nav = useNavigate()
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 30)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => { if (open) input.current?.focus() }, [open])
  const change = (v) => { setQ(v); nav(v ? `/buscar?q=${encodeURIComponent(v)}` : '/catalogo') }
  return (
    <header className={solid ? 'nav solid' : 'nav'}>
      <Link to="/" className="logo" aria-label="Dlim TV, inicio">DLIM<b>TV</b></Link>
      <nav className="nav-links">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
        ))}
      </nav>
      <div className="nav-right">
        <div className={open ? 'search open' : 'search'}>
          <button aria-label="Buscar" onClick={() => setOpen((o) => !o)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M16 16l5 5" /></svg>
          </button>
          <input ref={input} value={q} onChange={(e) => change(e.target.value)} onBlur={() => !q && setOpen(false)}
            placeholder="Títulos, actores, géneros" aria-label="Buscar" />
        </div>
        <Link to="/favoritos" className="avatar" aria-label="Mi lista">D</Link>
      </div>
    </header>
  )
}
