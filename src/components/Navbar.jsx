import { Link, useLocation, useNavigate } from 'react-router-dom'

// Barra superior: logo centrado y botón de retroceso en todas las pantallas menos Inicio.
export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const back = () => (window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/'))
  return (
    <header className="nav">
      {pathname !== '/' && (
        <button className="nav-back" onClick={back} aria-label="Volver">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      )}
      <Link to="/" className="logo" aria-label="Dlim TV, inicio">DLIM<b>TV</b></Link>
    </header>
  )
}
