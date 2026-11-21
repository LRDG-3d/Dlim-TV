import { Link } from 'react-router-dom'

// Barra superior mínima: solo el logo. (Series, Telenovelas, Catálogo y Mi lista siguen existiendo como rutas.)
export default function Navbar() {
  return (
    <header className="nav">
      <Link to="/" className="logo" aria-label="Dlim TV, inicio">DLIM<b>TV</b></Link>
    </header>
  )
}
