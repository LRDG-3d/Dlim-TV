import { CATALOG } from '../data/catalog';

export const CATEGORIES = ['Telenovelas', 'Series', 'Comedias', 'Dramas', 'Juveniles', 'Suspenso'];
export const GENRES = [...new Set(CATALOG.flatMap((p) => p.genres))].sort();
export const YEARS = [...new Set(CATALOG.map((p) => p.year))].sort();
export const byId = (id) => CATALOG.find((p) => p.id === id);
export const inCategory = (c) => CATALOG.filter((p) => p.categories.includes(c));

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filterCatalog({ category = '', year = '', genre = '', text = '' } = {}) {
  const q = norm(text.trim());
  return CATALOG.filter((p) =>
    (!category || p.categories.includes(category)) &&
    (!year || p.year === Number(year)) &&
    (!genre || p.genres.includes(genre)) &&
    (!q || norm([p.title, p.synopsis, ...p.cast].join(' ')).includes(q))
  ).sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
}
