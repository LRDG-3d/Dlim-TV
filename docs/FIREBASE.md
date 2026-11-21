# Integrar Firebase en Dlim TV (paso a paso)

Todo se hace desde el navegador del teléfono; no necesitas instalar nada de Firebase.

## 1. Crear el proyecto
1. Entra a https://console.firebase.google.com con tu cuenta de Google ▸ **Crear un proyecto** (desactiva Analytics, no hace falta).
2. En **Configuración del proyecto (engranaje) ▸ Tus apps** pulsa **</> Web**, ponle nombre "Dlim TV" y registra la app (sin Hosting).
3. Copia el bloque `firebaseConfig` que te muestra. Son identificadores públicos, no secretos.

## 2. Activar Authentication
**Compilación ▸ Authentication ▸ Comenzar ▸ Correo electrónico/contraseña ▸ Habilitar.**
Luego en la pestaña **Users ▸ Agregar usuario** crea tu correo y contraseña de administrador y **copia su UID**.

## 3. Crear Firestore y las reglas
1. **Compilación ▸ Firestore Database ▸ Crear base de datos** (modo producción, la región que prefieras).
2. Pestaña **Reglas**: borra todo, pega el contenido de `firestore.rules` y pulsa **Publicar**.
3. Pestaña **Datos ▸ Iniciar colección**: ID de colección `admins`, ID del documento = **tu UID**, añade cualquier campo (por ejemplo `rol` = `admin`) y guarda.

Con estas reglas cualquiera puede leer el catálogo, pero solo tu usuario puede escribir.

## 4. Pegar la configuración
Pega tu `firebaseConfig` en **dos archivos** (mismo contenido):
- `src/firebaseConfig.js` (la app)
- `docs/admin/firebase-config.js` (el panel)

Si ves `export const firebaseConfig = {...}` ya está en el formato correcto: solo reemplaza los valores `PEGA_AQUI`.

## 5. Publicar el panel de administrador (GitHub Pages)
1. Sube los cambios: `git add . && git commit -m "Firebase" && git push`.
2. En GitHub: repositorio ▸ **Settings ▸ Pages ▸ Source: Deploy from a branch ▸ main ▸ carpeta /docs ▸ Save**.
3. Tu panel quedará en `https://LRDG-3d.github.io/Dlim-TV/admin/`.
4. En Firebase: **Authentication ▸ Settings ▸ Dominios autorizados ▸ Agregar dominio** `lrdg-3d.github.io`. Sin esto el login falla.

## 6. Publicar una serie
1. Abre el panel, entra con tu correo y contraseña.
2. Llena nombre, año, categorías, géneros, carátula (URL de imagen), sinopsis y reparto.
3. Indica el número de **temporada** y pega la **URL de la colección** y pulsa **Detectar**; o pega los enlaces uno por línea. El contador muestra los episodios y se guardan en orden numérico.
4. **Guardar.** La app lo muestra la próxima vez que se abra (o al instante si está abierta con internet).
5. Para añadir otra temporada, edita la serie, cambia el número de temporada y pega sus enlaces.

Notas:
- "Detectar" lee la URL desde el navegador; si ese servidor bloquea el acceso (CORS) verás un aviso: abre la URL, copia los enlaces y pégalos.
- Entiende: .mp4, .m3u8, .webm, .mkv, .mpd y listas en texto, HTML o JSON.
- Publica solo enlaces de contenido del que tengas derechos o autorización.

## 7. Compilar la app
`npm install` (ahora incluye `firebase`), luego `git push` y descarga el APK desde GitHub Actions como antes.
