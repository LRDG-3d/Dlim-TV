// Personalización: color principal, fondo, tamaño de portadas, animaciones y efecto vidrio.
export const ACCENTS = [['Rojo', '#ff2e63'], ['Celeste', '#38bdf8'], ['Verde', '#22c55e'], ['Morado', '#a855f7'], ['Naranja', '#fb923c'], ['Rosa', '#ec4899'], ['Dorado', '#facc15']]
export const BGS = [['Negro', '#000000'], ['Grafito', '#111111'], ['Azul noche', '#050b14'], ['Vino', '#0e0508'], ['Bosque', '#050f0a']]
export const DEFAULTS = { accent: '#ff2e63', bg: '#000000', size: 1, anim: true, glass: true }
const KEY = 'dlim:theme'

export function loadTheme() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { ...DEFAULTS } }
}
export function saveTheme(t) { try { localStorage.setItem(KEY, JSON.stringify(t)) } catch { /* sin almacenamiento */ } }

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (h, a) => '#' + rgb(h).map((v) => Math.round(v + (255 - v) * a).toString(16).padStart(2, '0')).join('')

export function applyTheme(t) {
  const r = document.documentElement
  const s = r.style
  s.setProperty('--ac', t.accent); s.setProperty('--ac-rgb', rgb(t.accent).join(','))
  s.setProperty('--bg', t.bg); s.setProperty('--bg-rgb', rgb(t.bg).join(','))
  s.setProperty('--bg2', mix(t.bg, 0.08)); s.setProperty('--bg3', mix(t.bg, 0.14))
  s.setProperty('--cs', String(t.size))
  r.classList.toggle('noanim', !t.anim)
  r.classList.toggle('noglass', !t.glass)
  const m = document.querySelector('meta[name=theme-color]')
  if (m) m.setAttribute('content', t.bg)
}
