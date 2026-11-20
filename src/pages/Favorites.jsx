import { IonContent, IonPage } from '@ionic/react';
import TopBar from '../components/TopBar';
import PosterGrid from '../components/PosterGrid';
import { byId } from '../services/catalogUtils';
import { useFavorites } from '../services/favorites';

export default function Favorites() {
  const { ids } = useFavorites();
  return (
    <IonPage>
      <TopBar />
      <IonContent fullscreen>
        <PosterGrid items={ids.map(byId).filter(Boolean)} empty="Tu lista está vacía. Añade producciones desde su ficha." />
      </IonContent>
    </IonPage>
  );
}
