# Televisa Catálogo 2000-2014

App Android de catálogo de producciones de Televisa (2000-2014) con estilo de streaming oscuro (referencia: Blim TV).
**Ionic React + Capacitor** (Cordova no se usa). Favoritos con `@capacitor/preferences`.

## Termux (Android)
Sirve para editar código, `npm install`, `npm run dev` y `git push`. El APK lo compila GitHub Actions (pestaña Actions ▸ artefacto `app-debug`). No ejecutes `npm run assets` en Termux.

## Requisitos
Node.js 20+, JDK 17, Android Studio (con Android SDK) y Git.

## Clonar, instalar y ejecutar
```bash
git clone https://github.com/LRDG-3d/Dlim-TV.git
cd Dlim-TV
npm install
npm run dev            # vista previa en el navegador
```

## Crear la plataforma Android (solo la primera vez)
```bash
npm run android:init   # npx cap add android + enlaza la firma de release
npm run assets         # iconos y splash desde /assets (descarga @capacitor/assets al vuelo; usa sharp, no funciona en Termux: déjalo para GitHub Actions)
npm run sync           # build web + npx cap sync android
npm run android:open   # abre el proyecto en Android Studio
```
Haz commit de la carpeta `android/` generada. Tras cada cambio en `src/`: `npm run sync`.

## APK de depuración
- Terminal: `npm run apk:debug` → `android/app/build/outputs/apk/debug/app-debug.apk`
- Android Studio: *Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)*.

## APK firmado de lanzamiento
1. Crea la clave (guárdala fuera del repo y haz copia de seguridad):
   `keytool -genkey -v -keystore televisa-release.jks -alias televisa -keyalg RSA -keysize 2048 -validity 10000`
2. Copia `keystore.properties.example` a `keystore.properties` y rellena los datos (está en `.gitignore`).
3. `npm run apk:release` → `android/app/build/outputs/apk/release/app-release.apk`
4. Para Google Play usa AAB: `cd android && ./gradlew bundleRelease`.

## GitHub Actions
`.github/workflows/android.yml` compila el APK debug en cada push y lo sube como artefacto.
Para el release firmado añade estos *secrets* del repositorio: `KEYSTORE_BASE64` (`base64 -w0 televisa-release.jks`), `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
Tras el primer `npm install`, sube `package-lock.json` y cambia `npm install` por `npm ci` en el workflow.

## Editar el catálogo
Todo está en `src/data/catalog.js`. Copia un bloque, cambia los campos y listo.
- `cover`: imagen en `public/covers/` (ej. `"/covers/rebelde.jpg"`); si es `null` se genera una portada con degradado.
- `videoUrl`: URL de vídeo **autorizado**; si existe, la ficha muestra el reproductor.
- El catálogo empieza vacío; el archivo trae una plantilla comentada. Usa solo imágenes y vídeos de los que tengas derechos.

## Estructura
```
src/components  Hero, Carousel, Poster, PosterGrid, TopBar
src/pages       Home, Catalog, Search, Favorites, Detail
src/data        catalog.js
src/services    favorites.jsx, catalogUtils.js
src/styles      blim.css      src/theme  variables.css
assets/         icono y splash (fuente para @capacitor/assets)
scripts/        patch-android.mjs      signing.gradle  (firma de release)
```
