import { useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import TopBar from '../components/TopBar';
import PosterGrid from '../components/PosterGrid';
import { CATEGORIES, GENRES, YEARS, filterCatalog } from '../services/catalogUtils';

export default function Catalog() {
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const items = useMemo(() => filterCatalog({ category, year, genre }), [category, year, genre]);
  return (
    <IonPage>
      <TopBar />
      <IonContent fullscreen>
        <div className="chips">
          {['', ...CATEGORIES].map((c) => (
            <button key={c || 'todo'} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>{c || 'Todo'}</button>
          ))}
        </div>
        <div className="selects">
          <select aria-label="Año" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Todos los años</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select aria-label="Género" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Todos los géneros</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="count">{items.length} producciones</div>
        <PosterGrid items={items} />
      </IonContent>
    </IonPage>
  );
}
