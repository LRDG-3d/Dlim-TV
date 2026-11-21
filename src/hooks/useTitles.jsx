import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { titles as local } from '../data/titles.js'

const norm = (x) => ({ cast: [], genres: [], seasons: null, image: null, cover: '', episodes: 0, ...x })
const Ctx = createContext({ titles: local, remote: [], loading: false })

export function TitlesProvider({ children }) {
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(!!db)
  useEffect(() => {
    if (!db) return undefined
    const off = onSnapshot(collection(db, 'titles'),
      (s) => { setRemote(s.docs.map((d) => norm({ ...d.data(), id: d.id }))); setLoading(false) },
      (e) => { console.warn('Firestore:', e.code); setLoading(false) })
    return () => { if (typeof off === 'function') off() }
  }, [])
  const titles = useMemo(() => {
    const ids = new Set(remote.map((r) => r.id))
    return [...local.filter((l) => !ids.has(l.id)).map(norm), ...remote]
  }, [remote])
  return <Ctx.Provider value={{ titles, remote, loading }}>{children}</Ctx.Provider>
}

export const useTitles = () => useContext(Ctx)
