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
  const toggle = (id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  return <Ctx.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>{children}</Ctx.Provider>
}

export const useFavorites = () => useContext(Ctx)
