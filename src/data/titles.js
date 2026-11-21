// Para agregar una producción, añade un objeto aquí. No hay que tocar el diseño.
// image: nombre de archivo dentro de public/images (ej. 'rebelde.jpg'). Si es null se muestra una portada generada.
// Nota: episodios y reparto son referenciales; verifícalos antes de publicar.
const t = (id, title, year, type, genres, episodes, synopsis, cast = [], o = {}) => ({
  id, title, year, type, genres, episodes, synopsis, cast, seasons: o.seasons || null,
  image: o.image || null, featured: !!o.featured, popular: !!o.popular,
})

// Catálogo vacío: agrega tus producciones aquí. Ejemplo:
// t('rebelde', 'Rebelde', 2004, 'Telenovela', ['Juvenil', 'Drama'], 440,
//   'Sinopsis...', ['Actor 1', 'Actor 2'], { featured: true, popular: true, image: 'rebelde.jpg' }),
export const titles = [
]

export const years = Array.from({ length: 15 }, (_, i) => 2000 + i)
export const genres = ['Comedia', 'Drama', 'Juvenil', 'Romance', 'Suspenso']
export const types = ['Telenovela', 'Serie']
