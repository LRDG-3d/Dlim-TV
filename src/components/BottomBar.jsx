import { NavLink } from 'react-router-dom'
import { isNative } from '../lib/downloads.js'

const icons = {
  home: <path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M16 16l5 5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  down: <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></>,
}
const items = [['/', 'Inicio', 'home'], ['/buscar', 'Buscar', 'search'], ...(isNative ? [['/navegador', 'Navegador', 'globe'], ['/descargas', 'Descargas', 'down']] : []), ['/ajustes', 'Ajustes', 'gear']]

export default function BottomBar() {
  return (
    <nav className="bottombar" aria-label="Navegación inferior">
      {items.map(([to, label, ic]) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[ic]}</svg>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
