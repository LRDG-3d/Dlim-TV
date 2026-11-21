import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
const $ = (s) => document.querySelector(s);
const CATS = ['Telenovelas', 'Series', 'Comedias', 'Dramas', 'Juveniles', 'Suspenso'];
const VIDEO = /\.(mp4|m3u8|mkv|webm|mpd|mov|avi)(\?|#|$)/i;
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const nat = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const view = (id) => ['login', 'noadmin', 'panel'].forEach((x) => $('#' + x).classList.toggle('hide', x !== id));
const say = (el, t, c = '') => { $(el).textContent = t; $(el).className = 'msg ' + c; };
let tt; const toast = (t) => { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 2400); };

const S = { all: [], editing: null, temporadas: [], cur: 1 };

// ---------- Detección ----------
function extract(text, base) {
  const t = text.trim(); let urls = [];
  if (/^[\[{]/.test(t)) { try { const w = (v) => { if (typeof v === 'string' && /^https?:\/\//.test(v)) urls.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(w); }; w(JSON.parse(t)); } catch {} }
  if (!urls.length && /<a\s|<source|<video/i.test(t)) {
    new DOMParser().parseFromString(t, 'text/html').querySelectorAll('a[href],source[src],video[src]').forEach((e) => {
      try { urls.push(new URL(e.getAttribute('href') || e.getAttribute('src'), base || location.href).href); } catch {}
    });
  }
  if (!urls.length) urls = t.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const vids = urls.filter((u) => VIDEO.test(u));
  return [...new Set(vids.length ? vids : urls)].sort(nat);
}

// ---------- Catálogo (lista y resumen) ----------
async function load() {
  const snap = await getDocs(collection(db, 'series'));
  S.all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderStats(); renderList();
}
function renderStats() {
  const a = S.all, eps = a.reduce((s, x) => s + (x.episodes || 0), 0), tem = a.reduce((s, x) => s + (x.seasons || 0), 0);
  $('#stats').innerHTML = [['Producciones', a.length], ['Temporadas', tem], ['Episodios', eps], ['Destacadas', a.filter((x) => x.featured).length]]
    .map(([k, v]) => `<div class="stat"><b>${v}</b><small>${k}</small></div>`).join('');
  const max = Math.max(1, ...CATS.map((c) => a.filter((x) => (x.categories || []).includes(c)).length));
  $('#bars').innerHTML = CATS.map((c) => { const n = a.filter((x) => (x.categories || []).includes(c)).length;
    return `<div class="bar"><span>${c}</span><i style="width:${(n / max) * 100}%;min-width:${n ? 6 : 0}px"></i><span>${n}</span></div>`; }).join('');
}
function renderList() {
  const q = $('#q').value.toLowerCase(), fc = $('#fc').value;
  const rows = S.all.filter((x) => (!q || (x.title || '').toLowerCase().includes(q)) && (!fc || (x.categories || []).includes(fc)))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  $('#list').innerHTML = rows.length ? rows.map((x) => `
    <div class="item" data-id="${esc(x.id)}">
      <div class="thumb" style="${x.cover ? `background-image:url('${esc(x.cover)}')` : ''}"></div>
      <div class="i"><b>${esc(x.title)}</b><small>${x.year || ''} · ${esc((x.categories || []).join(', '))}</small><br><small>${x.seasons || 0} temp. · ${x.episodes || 0} episodios${x.featured ? ' · ★' : ''}</small></div>
      <div class="a"><button class="sm" data-act="edit">Editar</button><button class="sm d" data-act="del">Borrar</button></div>
    </div>`).join('') : '<div class="empty">No hay producciones. Pulsa “＋ Editor” para crear la primera.</div>';
}
$('#fc').innerHTML = '<option value="">Todas</option>' + CATS.map((c) => `<option>${c}</option>`).join('');
$('#q').oninput = renderList; $('#fc').onchange = renderList;
$('#list').onclick = async (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const id = b.closest('.item').dataset.id, x = S.all.find((y) => y.id === id);
  if (b.dataset.act === 'edit') { fill(x, id); tab('edit'); }
  if (b.dataset.act === 'del' && confirm(`¿Borrar “${x.title}” con todos sus episodios?`)) { await deleteDoc(doc(db, 'series', id)); toast('Borrada'); load(); }
};

// ---------- Editor ----------
$('#cats').innerHTML = CATS.map((c) => `<label><input type="checkbox" value="${c}">${c}</label>`).join('');
function tab(n) {
  $('#vList').classList.toggle('hide', n !== 'list'); $('#vEdit').classList.toggle('hide', n !== 'edit');
  $('#tabList').classList.toggle('act', n === 'list'); $('#tabEdit').classList.toggle('act', n === 'edit'); scrollTo(0, 0);
}
$('#tabList').onclick = () => tab('list');
$('#tabEdit').onclick = () => { if (!S.editing) fill(); tab('edit'); };
$('#btnCancel').onclick = () => { fill(); tab('list'); };

function fill(d = {}, id = null) {
  S.editing = id;
  S.temporadas = JSON.parse(JSON.stringify(d.temporadas || [])); S.cur = S.temporadas[0]?.n || 1;
  $('#formTitle').textContent = id ? `Editando: ${d.title}` : 'Nueva producción';
  $('#title').value = d.title || ''; $('#year').value = d.year || ''; $('#cover').value = d.cover || '';
  $('#genres').value = (d.genres || []).join(', '); $('#cast').value = (d.cast || []).join(', '); $('#synopsis').value = d.synopsis || '';
  $('#featured').value = d.featured ? '1' : '0';
  document.querySelectorAll('#cats input').forEach((c) => { c.checked = (d.categories || []).includes(c.value); });
  $('#collUrl').value = ''; $('#paste').value = ''; $('#found').textContent = ''; say('#fetchMsg', '');
  preview(); renderEps();
}
function preview() {
  const c = $('#cover').value.trim(), p = $('#pv');
  p.style.backgroundImage = c ? `url('${c.replace(/'/g, '%27')}')` : ''; $('#pvT').textContent = ($('#title').value || 'Título') + ($('#year').value ? ` (${$('#year').value})` : '');
}
['#title', '#year', '#cover'].forEach((s) => $(s).addEventListener('input', preview));

const curSeason = () => S.temporadas.find((t) => t.n === S.cur);
function ensureSeason() { if (!curSeason()) { S.temporadas.push({ n: S.cur, urls: [] }); S.temporadas.sort((a, b) => a.n - b.n); } return curSeason(); }
function renderEps() {
  $('#seasons').innerHTML = S.temporadas.map((t) => `<button class="chip ${t.n === S.cur ? 'on' : ''}" data-s="${t.n}">T${t.n} · ${t.urls.length}</button>`).join('') + '<button class="chip g" data-s="new">＋ Temporada</button>';
  const t = curSeason(), urls = t ? t.urls : [];
  $('#eps').innerHTML = urls.length ? urls.map((u, i) => `
    <div class="ep" data-i="${i}"><span class="n">${i + 1}</span><input value="${esc(u)}"><button data-a="up">↑</button><button data-a="dn">↓</button><a href="${esc(u)}" target="_blank" rel="noopener">▶</a><button data-a="rm">✕</button></div>`).join('')
    : `<div class="empty">Temporada ${S.cur} sin episodios. Detecta o pega enlaces arriba.</div>`;
  const all = S.temporadas.filter((x) => x.urls.length);
  $('#total').textContent = `${all.length} temp. · ${all.reduce((s, x) => s + x.urls.length, 0)} episodios`;
}
$('#seasons').onclick = (e) => {
  const b = e.target.closest('button'); if (!b) return;
  S.cur = b.dataset.s === 'new' ? Math.max(0, ...S.temporadas.map((t) => t.n)) + 1 : Number(b.dataset.s);
  if (b.dataset.s === 'new') ensureSeason(); renderEps();
};
$('#eps').onclick = (e) => {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  const t = curSeason(), i = Number(b.closest('.ep').dataset.i), u = t.urls, a = b.dataset.a;
  if (a === 'rm') u.splice(i, 1);
  if (a === 'up' && i > 0) [u[i - 1], u[i]] = [u[i], u[i - 1]];
  if (a === 'dn' && i < u.length - 1) [u[i + 1], u[i]] = [u[i], u[i + 1]];
  renderEps();
};
$('#eps').onchange = (e) => { if (e.target.tagName === 'INPUT') curSeason().urls[Number(e.target.closest('.ep').dataset.i)] = e.target.value.trim(); };
$('#btnSort').onclick = () => { const t = curSeason(); if (t) { t.urls.sort(nat); renderEps(); } };
$('#btnDedup').onclick = () => { const t = curSeason(); if (t) { t.urls = [...new Set(t.urls)]; renderEps(); } };
$('#btnDelSeason').onclick = () => {
  if (!curSeason() || !confirm(`¿Borrar la temporada ${S.cur}?`)) return;
  S.temporadas = S.temporadas.filter((t) => t.n !== S.cur); S.cur = S.temporadas[0]?.n || 1; renderEps();
};
$('#paste').oninput = () => { const n = extract($('#paste').value).length; $('#found').textContent = n ? `· ${n} detectados` : ''; };
function apply(urls) {
  const t = ensureSeason(); t.urls = $('#mode').value === 'replace' ? urls : [...t.urls, ...urls.filter((u) => !t.urls.includes(u))];
  $('#paste').value = ''; $('#found').textContent = ''; renderEps();
}
$('#btnApply').onclick = () => { const u = extract($('#paste').value); if (!u.length) return say('#fetchMsg', 'No hay enlaces para aplicar.', 'err'); apply(u); say('#fetchMsg', `${u.length} enlaces aplicados a la temporada ${S.cur}.`, 'ok'); };
$('#btnFetch').onclick = async () => {
  const u = $('#collUrl').value.trim(); if (!u) return;
  say('#fetchMsg', 'Leyendo…');
  try {
    const found = extract(await (await fetch(u)).text(), u);
    if (!found.length) return say('#fetchMsg', 'No se encontraron enlaces en esa URL.', 'err');
    apply(found); say('#fetchMsg', `Se detectaron ${found.length} episodios y se aplicaron a la temporada ${S.cur}.`, 'ok');
  } catch { say('#fetchMsg', 'Ese servidor no permite leerlo desde el navegador (CORS). Abre la URL, copia los enlaces y pégalos abajo.', 'err'); }
};

$('#btnSave').onclick = async () => {
  const title = $('#title').value.trim(); if (!title) return toast('Falta el nombre');
  const cats = [...document.querySelectorAll('#cats input:checked')].map((c) => c.value);
  if (!cats.length) return toast('Elige al menos una categoría');
  const id = S.editing || slug(title); if (!id) return toast('Nombre no válido');
  if (!S.editing && S.all.some((x) => x.id === id) && !confirm('Ya existe una producción con ese nombre. ¿Actualizarla?')) return;
  const temporadas = S.temporadas.filter((t) => t.urls.length).sort((a, b) => a.n - b.n);
  try {
    await setDoc(doc(db, 'series', id), {
      title, year: Number($('#year').value) || 0, categories: cats, genres: csv($('#genres').value),
      cover: $('#cover').value.trim() || null, synopsis: $('#synopsis').value.trim(), cast: csv($('#cast').value),
      featured: $('#featured').value === '1', temporadas, seasons: temporadas.length,
      episodes: temporadas.reduce((s, t) => s + t.urls.length, 0), updatedAt: serverTimestamp(),
    });
    toast('Guardado ✓'); fill(); await load(); tab('list');
  } catch (e) { toast('Error: ' + e.message); }
};

// ---------- Sesión ----------
const login = () => signInWithEmailAndPassword(auth, $('#email').value, $('#pass').value).catch(() => say('#loginMsg', 'Correo o contraseña incorrectos.', 'err'));
$('#btnLogin').onclick = login; $('#pass').onkeydown = (e) => { if (e.key === 'Enter') login(); };
['#btnOut1', '#btnOut2'].forEach((b) => { $(b).onclick = () => signOut(auth); });
onAuthStateChanged(auth, async (u) => {
  document.querySelector('#boot')?.remove();
  if (!u) return view('login');
  let ok = false;
  try { ok = (await getDoc(doc(db, 'admins', u.uid))).exists(); } catch {}
  if (!ok) { $('#uid').value = u.uid; return view('noadmin'); }
  $('#who').textContent = u.email; view('panel'); fill(); tab('list');
  try { await load(); } catch (e) { toast('Error al cargar: ' + e.message); }
});
