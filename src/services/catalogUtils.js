export const CATEGORIES = ['Telenovelas', 'Series', 'Comedias', 'Dramas', 'Juveniles', 'Suspenso'];
export const byId = (items, id) => items.find((p) => p.id === id);
export const inCategory = (items, c) => items.filter((p) => p.categories.includes(c));
export const genresOf = (items) => [...new Set(items.flatMap((p) => p.genres))].sort();
export const yearsOf = (items) => [...new Set(items.map((p) => p.year))].sort();

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filterCatalog(items, { category = '', year = '', genre = '', text = '' } = {}) {
  const q = norm(text.trim());
  return items.filter((p) =>
    (!category || p.categories.includes(category)) &&
    (!year || p.year === Number(year)) &&
    (!genre || p.genres.includes(genre)) &&
    (!q || norm([p.title, p.synopsis, ...p.cast].join(' ')).includes(q))
  ).sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
}
