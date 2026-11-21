import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import Detail from './pages/Detail.jsx'
import Favorites from './pages/Favorites.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/series" element={<Catalog fixedType="Serie" heading="Series" />} />
        <Route path="/telenovelas" element={<Catalog fixedType="Telenovela" heading="Telenovelas" />} />
        <Route path="/catalogo" element={<Catalog heading="Catálogo" />} />
        <Route path="/buscar" element={<Catalog heading="Buscar" autoFocus />} />
        <Route path="/titulo/:id" element={<Detail />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="footer">Dlim TV · Proyecto de catálogo fan, sin fines de lucro. Las producciones pertenecen a sus titulares.</footer>
    </>
  )
}
