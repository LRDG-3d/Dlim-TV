import { useEffect, useState } from 'react';
import { useIonRouter } from '@ionic/react';
import { coverStyle } from './Cover';
import { useFavorites } from '../services/favorites';

export default function Hero({ items }) {
  const [i, setI] = useState(0);
  const router = useIonRouter();
  const { has, toggle } = useFavorites();
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);
  const p = items[i];
  if (!p) return null;
  return (
    <section className="hero">
      <div className="hero-bg" key={p.id} style={coverStyle(p)} />
      <div className="hero-body">
        <h1>{p.title}</h1>
        <div className="hero-meta">{p.year} · {p.genres.join(', ')}</div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => router.push(`/detalle/${p.id}`)}>Ver ficha</button>
          <button className="btn btn-ghost" onClick={() => toggle(p.id)}>{has(p.id) ? '✓ En mi lista' : '+ Mi lista'}</button>
        </div>
      </div>
    </section>
  );
}
