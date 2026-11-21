import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, configured } from '../firebase.js'
import { useTitles } from '../hooks/useTitles.jsx'
import { years, genres } from '../data/titles.js'

const empty = { id: '', title: '', type: 'Telenovela', year: 2004, episodes: '', genres: [], synopsis: '', cast: '', cover: '', featured: false, popular: false, seasons: [] }
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// Solo se aceptan enlaces http(s) cuyo archivo termine en .zip
const isZip = (u) => { try { const x = new URL(u); return x.protocol.startsWith('http') && x.pathname.toLowerCase().endsWith('.zip') } catch { return false } }

// Reduce la portada a 500 px y la guarda como JPG en texto (así no hace falta Firebase Storage).
function resize(file) {
  return new Promise((ok, fail) => {
    const img = new Image(); const url = URL.createObjectURL(file)
    img.onload = () => {
      const w = Math.min(500, img.width); const c = document.createElement('canvas')
      c.width = w; c.height = Math.round(img.height * (w / img.width))
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => fail(new Error('No se pudo leer la imagen.')); img.src = url
  })
}

export default function Admin() {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    if (!auth) return undefined
    const off = onAuthStateChanged(auth, (u) => setUser(u))
    return () => { if (typeof off === 'function') off() }
  }, [])
  if (!configured) return (
    <main className="page admin"><h1 className="page-title">Panel de administración</h1>
      <p className="empty">Firebase aún no está configurado. Pega tu configuración en <code>src/firebase.js</code> (mira el tutorial).</p></main>
  )
  if (user === undefined) return <main className="page"><p className="empty">Cargando…</p></main>
  return user ? <Panel /> : <Login />
}

function Login() {
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [err, setErr] = useState('')
  const go = async (e) => {
    e.preventDefault(); setErr('')
    try { await signInWithEmailAndPassword(auth, email, pass) } catch { setErr('Correo o contraseña incorrectos.') }
  }
  return (
    <main className="page admin"><h1 className="page-title">Administrador</h1>
      <form className="afield-box" onSubmit={go}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} required />
        <button className="btn primary">Entrar</button>
        {err && <p className="aerr">{err}</p>}
      </form></main>
  )
}

function Panel() {
  const { remote } = useTitles()
  const [f, setF] = useState(empty); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const toggleGenre = (g) => set('genres', f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g])
  const setSeason = (i, k, v) => set('seasons', f.seasons.map((s, n) => (n === i ? { ...s, [k]: v } : s)))

  async function save(e) {
    e.preventDefault(); setMsg(''); setErr('')
    const y = +f.year
    if (!f.title.trim()) return setErr('Escribe el nombre.')
    if (!(y >= 2000 && y <= 2014)) return setErr('El año debe estar entre 2000 y 2014.')
    if (!f.genres.length) return setErr('Elige al menos un género.')
    const bad = f.seasons.find((s) => !isZip(s.zip))
    if (bad) return setErr(`La temporada ${bad.number} necesita una URL que termine en .zip`)
    const id = f.id || `${slug(f.title)}-${y}`
    const data = {
      title: f.title.trim(), type: f.type, year: y, episodes: +f.episodes || 0, genres: f.genres, synopsis: f.synopsis.trim(),
      cast: String(f.cast).split(',').map((x) => x.trim()).filter(Boolean), cover: f.cover || '', featured: f.featured, popular: f.popular,
      seasons: f.seasons.map((s) => ({ number: +s.number, zip: s.zip.trim() })), updatedAt: serverTimestamp(),
    }
    try {
      setBusy(true)
      const espera = new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 15000))
      await Promise.race([setDoc(doc(db, 'titles', id), data), espera])
      setMsg('✓ Guardado'); setF(empty)
    } catch (x) {
      if (x.code === 'permission-denied') setErr('Sin permiso: revisa las reglas de Firestore y que el UID sea el tuyo.')
      else if (x.message === 'timeout' || x.code === 'unavailable') setErr('Firestore no responde. Revisa que la base de datos esté creada en Firebase (Build → Firestore Database), que no la bloquee un bloqueador de anuncios y tu conexión.')
      else setErr(`${x.code || 'Error'}: ${x.message}`)
    }
    finally { setBusy(false) }
  }
  const edit = (t) => { setF({ ...empty, ...t, cast: t.cast.join(', '), seasons: Array.isArray(t.seasons) ? t.seasons : [] }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const remove = async (t) => { if (window.confirm(`¿Eliminar "${t.title}"?`)) { try { await deleteDoc(doc(db, 'titles', t.id)) } catch { setErr('No se pudo eliminar.') } } }
  const cover = async (e) => { const file = e.target.files[0]; if (file) { try { set('cover', await resize(file)) } catch (x) { setErr(x.message) } } }

  return (
    <main className="page admin">
      <div className="admin-top"><h1 className="page-title">{f.id ? 'Editar producción' : 'Nueva producción'}</h1>
        <button className="btn" onClick={() => signOut(auth)}>Cerrar sesión</button></div>
      <form onSubmit={save} className="aform">
        <label>Nombre<input value={f.title} onChange={(e) => set('title', e.target.value)} required /></label>
        <div className="arow">
          <label>Tipo<select value={f.type} onChange={(e) => set('type', e.target.value)}><option>Telenovela</option><option>Serie</option></select></label>
          <label>Año<select value={f.year} onChange={(e) => set('year', e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select></label>
          <label>Episodios<input type="number" min="0" value={f.episodes} onChange={(e) => set('episodes', e.target.value)} /></label>
        </div>
        <fieldset><legend>Género</legend>
          {genres.map((g) => <label key={g} className={f.genres.includes(g) ? 'chip on' : 'chip'}><input type="checkbox" checked={f.genres.includes(g)} onChange={() => toggleGenre(g)} />{g}</label>)}
        </fieldset>
        <label>Sinopsis<textarea rows="3" value={f.synopsis} onChange={(e) => set('synopsis', e.target.value)} /></label>
        <label>Reparto (separado por comas)<input value={f.cast} onChange={(e) => set('cast', e.target.value)} /></label>
        <label>Carátula (imagen)<input type="file" accept="image/*" onChange={cover} /></label>
        {f.cover && <img className="apreview" src={f.cover} alt="Vista previa" />}
        <div className="arow">
          <label className="chip"><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />Destacada (banner)</label>
          <label className="chip"><input type="checkbox" checked={f.popular} onChange={(e) => set('popular', e.target.checked)} />Popular</label>
        </div>
        <fieldset><legend>Temporadas</legend>
          {f.seasons.map((s, i) => (
            <div className="season-row" key={i}>
              <input type="number" min="1" value={s.number} onChange={(e) => setSeason(i, 'number', e.target.value)} aria-label="Número de temporada" />
              <input type="url" placeholder="https://…/temporada1.zip" value={s.zip} onChange={(e) => setSeason(i, 'zip', e.target.value)} className={s.zip && !isZip(s.zip) ? 'bad' : ''} />
              <button type="button" className="btn" onClick={() => set('seasons', f.seasons.filter((_, n) => n !== i))} aria-label="Quitar">✕</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => set('seasons', [...f.seasons, { number: f.seasons.length + 1, zip: '' }])}>+ Añadir temporada</button>
          <small>Un solo enlace por temporada, directo a un archivo .zip con todos los episodios.</small>
        </fieldset>
        {err && <p className="aerr">{err}</p>}{msg && <p className="aok">{msg}</p>}
        <div className="arow"><button className="btn primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
          {f.id && <button type="button" className="btn" onClick={() => setF(empty)}>Cancelar edición</button>}</div>
      </form>
      <h2 className="alist-title">Producciones guardadas ({remote.length})</h2>
      <ul className="alist">{remote.map((t) => (
        <li key={t.id}><span>{t.title} <small>{t.year} · {t.type}</small></span>
          <span><button className="btn" onClick={() => edit(t)}>Editar</button> <button className="btn" onClick={() => remove(t)}>Eliminar</button></span></li>
      ))}</ul>
    </main>
  )
}
