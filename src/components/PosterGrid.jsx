import Poster from './Poster';

export default function PosterGrid({ items, empty = 'No hay producciones con esos filtros.' }) {
  if (!items.length) return <div className="empty">{empty}</div>;
  return <div className="grid">{items.map((p) => <Poster key={p.id} item={p} />)}</div>;
}
