import { IonContent, IonPage } from '@ionic/react';
import TopBar from '../components/TopBar';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { CATALOG } from '../data/catalog';
import { CATEGORIES, inCategory, byId } from '../services/catalogUtils';
import { useFavorites } from '../services/favorites';

export default function Home() {
  const { ids } = useFavorites();
  const mine = ids.map(byId).filter(Boolean);
  return (
    <IonPage>
      <TopBar />
      <IonContent fullscreen>
        {!CATALOG.length && <div className="empty">El catálogo está vacío. Añade producciones en src/data/catalog.js.</div>}
        <Hero items={CATALOG.filter((p) => p.featured)} />
        <Carousel title="Mi lista" items={mine} />
        {CATEGORIES.map((c) => <Carousel key={c} title={c} items={inCategory(c)} />)}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
}
