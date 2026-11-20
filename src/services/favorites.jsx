import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';

const KEY = 'favoritos';
const Ctx = createContext({ ids: [], has: () => false, toggle: () => {} });

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    Preferences.get({ key: KEY }).then(({ value }) => { if (value) setIds(JSON.parse(value)); });
  }, []);
  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      Preferences.set({ key: KEY, value: JSON.stringify(next) });
      return next;
    });
  }, []);
  return <Ctx.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>{children}</Ctx.Provider>;
}
export const useFavorites = () => useContext(Ctx);
