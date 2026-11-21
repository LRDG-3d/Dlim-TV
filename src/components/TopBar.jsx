import { IonHeader, IonToolbar } from '@ionic/react';

export default function TopBar() {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar><div className="blim-logo"><span className="g">DLIM</span><em>TV</em></div></IonToolbar>
    </IonHeader>
  );
}
