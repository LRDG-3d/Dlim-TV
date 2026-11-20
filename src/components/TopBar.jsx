import { IonHeader, IonToolbar } from '@ionic/react';

export default function TopBar() {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar><div className="blim-logo">TELEVISA<span>.</span>CATÁLOGO</div></IonToolbar>
    </IonHeader>
  );
}
