import Poster from './Poster';

export default function Carousel({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="row">
      <h2>{title}</h2>
      <div className="row-track">{items.map((p) => <Poster key={p.id} item={p} />)}</div>
    </section>
  );
}
