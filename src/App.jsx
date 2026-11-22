import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import logo from './assets/logo.png'
import { isNative } from './lib/downloads.js'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import Detail from './pages/Detail.jsx'
import Favorites from './pages/Favorites.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Downloads from './pages/Downloads.jsx'
import Admin from './pages/Admin.jsx'
import Settings from './pages/Settings.jsx'
import BottomBar from './components/BottomBar.jsx'

export default function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isNative) return undefined
    let live = true
    let handle = null
    CapApp.addListener('backButton', () => {
      if (window.history.state && window.history.state.idx > 0) navigate(-1)
      else CapApp.exitApp()
    }).then((h) => { if (live) handle = h; else h.remove() })
    return () => { live = false; if (handle) handle.remove() }
  }, [navigate])
  const enFicha = pathname.startsWith('/titulo/')
  const [splash, setSplash] = useState(() => !sessionStorage.getItem('dlim:splash'))
  useEffect(() => {
    if (!splash) return
    sessionStorage.setItem('dlim:splash', '1')
    const t = setTimeout(() => setSplash(false), 1900)
    return () => clearTimeout(t)
  }, [splash])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      {splash && <div className="splash"><img src={logo} alt="Dlim TV" /></div>}
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
        <Route path="/descargas" element={<Downloads />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="*" element={<Home />} />
      </Routes>
      </ErrorBoundary>
      </div>
      {!enFicha && <BottomBar />}
      {!enFicha && <div className="bar-space" aria-hidden="true" />}
    </>
  )
}
