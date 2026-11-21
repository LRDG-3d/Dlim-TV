import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'dlimtv:favoritos'
const Ctx = createContext(null)

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* modo privado */ }
  }, [ids])
  const [toast, setToast] = useState('')
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t) }, [toast])
  const toggle = (id) => {
    setToast(ids.includes(id) ? 'Quitado de Mi lista' : 'Agregado a Mi lista')
    setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  return <Ctx.Provider value={{ ids, toggle, clear: () => setIds([]), has: (id) => ids.includes(id) }}>{children}{toast && <div className="toast" role="status" key={toast + ids.length}>{toast}</div>}</Ctx.Provider>
}

export const useFavorites = () => useContext(Ctx)
