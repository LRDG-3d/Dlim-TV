import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { byId } from '../services/catalogUtils';
import { coverStyle } from '../components/Cover';
import { useFavorites } from '../services/favorites';

export default function Detail() {
  const { id } = useParams();
  const p = byId(id);
  const { has, toggle } = useFavorites();
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/inicio" text="" /></IonButtons></IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {!p ? <div className="empty">Producción no encontrada.</div> : (
          <>
            <div className="detail-top" style={coverStyle(p)} />
            <div className="detail-body">
              <h1>{p.title}</h1>
              <div className="facts">
                <span><b>{p.year}</b></span>
                <span>{p.genres.join(', ')}</span>
                <span><b>{p.seasons}</b> {p.seasons === 1 ? 'temporada' : 'temporadas'}</span>
                <span><b>{p.episodes}</b> episodios</span>
              </div>
              <button className={`btn ${has(p.id) ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggle(p.id)}>
                {has(p.id) ? '✓ En mi lista' : '+ Añadir a mi lista'}
              </button>
              {p.videoUrl
                ? <video className="player" controls playsInline src={p.videoUrl} />
                : <div className="soon">Reproducción disponible próximamente.</div>}
              <p>{p.synopsis}</p>
              <h3>Reparto</h3>
              <div className="cast">{p.cast.map((c) => <span key={c}>{c}</span>)}</div>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
