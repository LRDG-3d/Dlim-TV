import { IonContent, IonPage } from '@ionic/react';
import TopBar from '../components/TopBar';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { CATEGORIES, inCategory, byId } from '../services/catalogUtils';
import { useFavorites } from '../services/favorites';
import { useCatalog } from '../services/catalogStore';

export default function Home() {
  const { ids } = useFavorites();
  const { items } = useCatalog();
  const mine = ids.map((id) => byId(items, id)).filter(Boolean);
  const featured = items.filter((p) => p.featured);
  return (
    <IonPage>
      <TopBar />
      <IonContent fullscreen>
        {!items.length && <div className="empty">El catálogo está vacío. Publica series desde el panel de administrador.</div>}
        <Hero items={featured.length ? featured : items.slice(0, 5)} />
        <Carousel title="Mi lista" items={mine} />
        {CATEGORIES.map((c) => <Carousel key={c} title={c} items={inCategory(items, c)} />)}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
}
