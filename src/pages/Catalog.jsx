import { useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import TopBar from '../components/TopBar';
import PosterGrid from '../components/PosterGrid';
import { CATEGORIES, genresOf, yearsOf, filterCatalog } from '../services/catalogUtils';
import { useCatalog } from '../services/catalogStore';

export default function Catalog() {
  const { items: all } = useCatalog();
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const items = useMemo(() => filterCatalog(all, { category, year, genre }), [all, category, year, genre]);
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
            {yearsOf(all).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select aria-label="Género" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Todos los géneros</option>
            {genresOf(all).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="count">{items.length} producciones</div>
        <PosterGrid items={items} />
      </IonContent>
    </IonPage>
  );
}
