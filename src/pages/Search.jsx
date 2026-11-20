import { useState } from 'react';
import { IonContent, IonPage, IonSearchbar } from '@ionic/react';
import TopBar from '../components/TopBar';
import PosterGrid from '../components/PosterGrid';
import { filterCatalog } from '../services/catalogUtils';

export default function Search() {
  const [text, setText] = useState('');
  return (
    <IonPage>
      <TopBar />
      <IonContent fullscreen>
        <IonSearchbar value={text} placeholder="Título, actor o palabra de la sinopsis" onIonInput={(e) => setText(e.detail.value || '')} />
        {text.trim()
          ? <PosterGrid items={filterCatalog({ text })} empty={`Sin resultados para "${text}".`} />
          : <div className="empty">Escribe para buscar en el catálogo.</div>}
      </IonContent>
    </IonPage>
  );
}
