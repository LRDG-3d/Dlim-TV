import { useState } from 'react';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { byId } from '../services/catalogUtils';
import { coverStyle } from '../components/Cover';
import { useFavorites } from '../services/favorites';
import { useCatalog } from '../services/catalogStore';

export default function Detail() {
  const { id } = useParams();
  const { items } = useCatalog();
  const p = byId(items, id);
  const { has, toggle } = useFavorites();
  const [season, setSeason] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [failed, setFailed] = useState(false);
  const temps = p?.temporadas || [];
  const cur = temps.find((t) => t.n === season) || temps[0];
  const play = (url, label) => { setFailed(false); setPlaying({ url, label }); };

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
              {playing && (
                <div>
                  <video key={playing.url} className="player" controls autoPlay playsInline src={playing.url} onError={() => setFailed(true)} />
                  <div className="soon">{failed ? 'No se pudo reproducir este episodio.' : playing.label}</div>
                </div>
              )}
              {p.videoUrl && !playing && <video className="player" controls playsInline src={p.videoUrl} />}
              {cur ? (
                <>
                  {temps.length > 1 && (
                    <div className="chips" style={{ padding: '12px 0 0' }}>
                      {temps.map((t) => <button key={t.n} className={`chip ${t.n === cur.n ? 'on' : ''}`} onClick={() => setSeason(t.n)}>Temporada {t.n}</button>)}
                    </div>
                  )}
                  <div className="eps">
                    {cur.urls.map((u, i) => (
                      <button key={u} className={`ep ${playing?.url === u ? 'on' : ''}`} onClick={() => play(u, `Temporada ${cur.n} · Episodio ${i + 1}`)}>{i + 1}</button>
                    ))}
                  </div>
                </>
              ) : !p.videoUrl && <div className="soon">Aún no hay episodios disponibles.</div>}
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
