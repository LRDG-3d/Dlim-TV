import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Preferences } from '@capacitor/preferences';
import { db } from './firebase';
import { CATALOG } from '../data/catalog';

const CACHE = 'catalogo-cache';
const Ctx = createContext({ items: [], loading: true });

const norm = (p) => ({
  categories: [], genres: [], cast: [], temporadas: [], seasons: 0, episodes: 0, synopsis: '',
  colors: ['#3b2a7a', '#10102a'], featured: false, cover: null, ...p, year: Number(p.year) || 0,
});

export function CatalogProvider({ children }) {
  const [items, setItems] = useState(CATALOG.map(norm));
  const [loading, setLoading] = useState(true);
  const live = useRef(false);

  useEffect(() => {
    Preferences.get({ key: CACHE }).then(({ value }) => {
      if (value && !live.current) setItems(JSON.parse(value).map(norm));
    });
    if (!db) { setLoading(false); return; }
    return onSnapshot(collection(db, 'series'), (snap) => {
      const list = snap.docs.map((d) => { const { updatedAt, ...rest } = d.data(); return norm({ id: d.id, ...rest }); });
      live.current = true;
      setItems(list); setLoading(false);
      Preferences.set({ key: CACHE, value: JSON.stringify(list) });
    }, () => setLoading(false));
  }, []);

  return <Ctx.Provider value={{ items, loading }}>{children}</Ctx.Provider>;
}
export const useCatalog = () => useContext(Ctx);
