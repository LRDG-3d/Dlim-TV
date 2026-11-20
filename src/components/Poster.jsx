import { IonRouterLink } from '@ionic/react';
import { coverStyle } from './Cover';

export default function Poster({ item }) {
  return (
    <IonRouterLink routerLink={`/detalle/${item.id}`} className="poster" style={coverStyle(item)}>
      <span className="poster-year">{item.year}</span>
      <span className="poster-title">{item.title}</span>
    </IonRouterLink>
  );
}
