import { useCallback, useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, setupIonicReact, useIonRouter } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { home, grid, search, heart } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { FavoritesProvider } from './services/favorites';
import { CatalogProvider } from './services/catalogStore';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Detail from './pages/Detail';
import SplashIntro from './components/SplashIntro';

setupIonicReact({ mode: 'md' });

function Shell() {
  const router = useIonRouter();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0a0a14' }).catch(() => {});
    SplashScreen.hide().catch(() => {});
    const sub = CapApp.addListener('backButton', () => {
      if (router.canGoBack()) router.goBack(); else CapApp.exitApp();
    });
    return () => { sub.then((h) => h.remove()); };
  }, [router]);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/inicio" component={Home} />
        <Route exact path="/catalogo" component={Catalog} />
        <Route exact path="/buscar" component={Search} />
        <Route exact path="/mi-lista" component={Favorites} />
        <Route exact path="/detalle/:id" component={Detail} />
        <Route exact path="/"><Redirect to="/inicio" /></Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom" className="blim-tabs">
        <IonTabButton tab="inicio" href="/inicio"><IonIcon icon={home} /><IonLabel>Inicio</IonLabel></IonTabButton>
        <IonTabButton tab="catalogo" href="/catalogo"><IonIcon icon={grid} /><IonLabel>Catálogo</IonLabel></IonTabButton>
        <IonTabButton tab="buscar" href="/buscar"><IonIcon icon={search} /><IonLabel>Buscar</IonLabel></IonTabButton>
        <IonTabButton tab="mi-lista" href="/mi-lista"><IonIcon icon={heart} /><IonLabel>Mi lista</IonLabel></IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

export default function App() {
  const [intro, setIntro] = useState(true);
  const done = useCallback(() => setIntro(false), []);
  return (
    <IonApp>
      {intro && <SplashIntro onDone={done} />}
      <CatalogProvider>
        <FavoritesProvider>
          <IonReactRouter><Shell /></IonReactRouter>
        </FavoritesProvider>
      </CatalogProvider>
    </IonApp>
  );
}
