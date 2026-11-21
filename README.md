# Dlim TV

Catálogo de series y telenovelas de Televisa (2000–2014). React + Vite, listo para GitHub Pages.

## Comandos
```
npm install
npm run dev      # desarrollo
npm run build    # genera /dist
npm run preview  # probar el build
```

## Agregar producciones
Edita `src/data/titles.js` y agrega una línea con la función `t(...)`.

## Agregar portadas
1. Copia la imagen (ej. `rebelde.jpg`, formato vertical 2:3) a `public/images/`.
2. En `titles.js`, pon `image: 'rebelde.jpg'` en las opciones de esa producción.
Sin imagen, se muestra una portada generada.

## Publicar en GitHub Pages
- `vite.config.js` usa `base: './'` y la app usa `HashRouter`, así que funciona con cualquier nombre de repositorio.
- En GitHub: Settings → Pages → Source: **GitHub Actions**. Cada push a `main` despliega solo.
