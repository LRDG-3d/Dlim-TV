// Detecta los archivos .zip dentro de la carpeta (URL) de una temporada.
const natural = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })
const enc = (n) => n.split('/').map(encodeURIComponent).join('/')

export function archiveId(url) {
  try {
    const u = new URL(url)
    if (!/(^|\.)archive\.org$/.test(u.hostname)) return null
    const m = u.pathname.match(/^\/(?:download|details)\/([^/]+)/)
    return m ? decodeURIComponent(m[1]) : null
  } catch { return null }
}

export async function listZips(url) {
  const id = archiveId(url)
  if (id) { // archive.org: API de metadatos (permite consultas desde el navegador)
    const r = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`)
    if (!r.ok) throw new Error('No se pudo leer la carpeta')
    const j = await r.json()
    return (j.files || [])
      .filter((f) => /\.zip$/i.test(f.name) && !f.name.includes('/'))
      .map((f) => ({ name: f.name, size: +f.size || 0, url: `https://archive.org/download/${encodeURIComponent(id)}/${enc(f.name)}` }))
      .sort(natural)
  }
  // Otras carpetas: lee el listado HTML y busca enlaces .zip (si el servidor lo permite)
  const r = await fetch(url)
  if (!r.ok) throw new Error('No se pudo leer la carpeta')
  const doc = new DOMParser().parseFromString(await r.text(), 'text/html')
  const seen = new Set(); const out = []
  doc.querySelectorAll('a[href]').forEach((a) => {
    try {
      const u = new URL(a.getAttribute('href'), url)
      if (/\.zip$/i.test(u.pathname) && !seen.has(u.href)) {
        seen.add(u.href); out.push({ name: decodeURIComponent(u.pathname.split('/').pop()), size: 0, url: u.href })
      }
    } catch { /* enlace inválido */ }
  })
  return out.sort(natural)
}

export const epLabel = (name) => {
  const m = name.match(/S(\d+)E(\d+)/i)
  return m ? `Episodio ${+m[2]}` : name.replace(/\.zip$/i, '')
}
export const mb = (b) => (b ? `${(b / 1048576).toFixed(0)} MB` : '')
