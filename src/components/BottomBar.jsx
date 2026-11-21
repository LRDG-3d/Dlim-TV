import { NavLink } from 'react-router-dom'

const icons = {
  home: <path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M16 16l5 5" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></>,
}
const items = [['/', 'Inicio', 'home'], ['/buscar', 'Buscar', 'search'], ['/ajustes', 'Ajustes', 'gear']]

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
