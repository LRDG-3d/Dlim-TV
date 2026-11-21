// Detecta los archivos .zip dentro de la carpeta (URL) de una temporada, incluyendo subcarpetas.
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
  if (id) { // archive.org: API de metadatos; incluye los archivos de todas las subcarpetas
    const r = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`)
    if (!r.ok) throw new Error('No se pudo leer la carpeta')
    const j = await r.json()
    return (j.files || [])
      .filter((f) => /\.zip$/i.test(f.name))
      .map((f) => ({ name: f.name, size: +f.size || 0, url: `https://archive.org/download/${encodeURIComponent(id)}/${enc(f.name)}` }))
      .sort(natural)
  }
  // Otras carpetas: lee el listado HTML, busca .zip y entra a las subcarpetas (hasta 3 niveles, máx. 40 páginas)
  const base = new URL(url)
  if (!base.pathname.endsWith('/')) base.pathname += '/'
  const out = []; const seen = new Set(); const visited = new Set(); const queue = [[base.href, 0]]; let pages = 0
  while (queue.length && pages < 40) {
    const [u, d] = queue.shift()
    if (visited.has(u)) continue
    visited.add(u); pages++
    let doc
    try {
      const r = await fetch(u)
      if (!r.ok) throw new Error('No se pudo leer la carpeta')
      doc = new DOMParser().parseFromString(await r.text(), 'text/html')
    } catch (e) { if (pages === 1) throw e; continue }
    const here = new URL(u).pathname
    doc.querySelectorAll('a[href]').forEach((a) => {
      try {
        const l = new URL(a.getAttribute('href'), u)
        if (l.origin !== base.origin || !l.pathname.startsWith(base.pathname) || l.search) return
        if (/\.zip$/i.test(l.pathname)) {
          if (!seen.has(l.href)) { seen.add(l.href); out.push({ name: decodeURIComponent(l.pathname.slice(base.pathname.length)), size: 0, url: l.href }) }
        } else if (l.pathname.endsWith('/') && l.pathname !== here && d < 3) queue.push([l.href, d + 1])
      } catch { /* enlace inválido */ }
    })
  }
  return out.sort(natural)
}

export const epLabel = (name) => {
  const parts = name.split('/'); const base = parts.pop(); const folder = parts.join(' / ')
  const m = base.match(/S(\d+)E(\d+)/i)
  const label = m ? `Episodio ${+m[2]}` : base.replace(/\.zip$/i, '')
  return folder ? `${folder} · ${label}` : label
}
export const mb = (b) => (b ? `${(b / 1048576).toFixed(0)} MB` : '')
