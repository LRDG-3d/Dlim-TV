import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import Detail from './pages/Detail.jsx'
import Favorites from './pages/Favorites.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Admin from './pages/Admin.jsx'
import Settings from './pages/Settings.jsx'
import BottomBar from './components/BottomBar.jsx'

export default function App() {
  const { pathname } = useLocation()
  const [splash, setSplash] = useState(() => !sessionStorage.getItem('dlim:splash'))
  useEffect(() => {
    if (!splash) return
    sessionStorage.setItem('dlim:splash', '1')
    const t = setTimeout(() => setSplash(false), 1900)
    return () => clearTimeout(t)
  }, [splash])
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return (
    <>
      {splash && <div className="splash"><span>DLIM<b>TV</b></span></div>}
      <Navbar />
      <div className="page-anim" key={pathname}>
      <ErrorBoundary resetKey={pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/series" element={<Catalog fixedType="Serie" heading="Series" />} />
        <Route path="/telenovelas" element={<Catalog fixedType="Telenovela" heading="Telenovelas" />} />
        <Route path="/catalogo" element={<Catalog heading="Catálogo" />} />
        <Route path="/buscar" element={<Catalog heading="Buscar" autoFocus />} />
        <Route path="/titulo/:id" element={<Detail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="*" element={<Home />} />
      </Routes>
      </ErrorBoundary>
      </div>
      <BottomBar />
      <footer className="footer">Dlim TV · Proyecto de catálogo fan, sin fines de lucro. Las producciones pertenecen a sus titulares.</footer>
    </>
  )
}
