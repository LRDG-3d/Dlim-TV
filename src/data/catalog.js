/**
 * CATÁLOGO EDITABLE (vacío). Para añadir una producción, agrega un objeto al arreglo:
 *
 * {
 *   id: 'mi-produccion',                 // único, sin espacios ni acentos
 *   title: 'Título',
 *   year: 2005,                          // entre 2000 y 2014
 *   categories: ['Telenovelas'],         // Telenovelas | Series | Comedias | Dramas | Juveniles | Suspenso
 *   genres: ['Drama', 'Romance'],
 *   seasons: 1,
 *   episodes: 100,
 *   synopsis: 'Sinopsis...',
 *   cast: ['Actor 1', 'Actor 2'],
 *   colors: ['#7a1f2b', '#2b0d14'],      // degradado si no hay portada
 *   featured: false,                     // true = aparece en el destacado de Inicio
 *   cover: null,                         // o '/covers/archivo.jpg' (imagen en public/covers)
 *   videoUrl: null                       // o URL de vídeo autorizado
 * }
 */
export const CATALOG = [];
