import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
const $ = (s) => document.querySelector(s);
const CATS = ['Telenovelas', 'Series', 'Comedias', 'Dramas', 'Juveniles', 'Suspenso'];
const VIDEO = /\.(mp4|m3u8|mkv|webm|mpd|mov|avi)(\?|#|$)/i;
const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const show = (id) => ['login', 'noadmin', 'panel'].forEach((x) => $('#' + x).classList.toggle('hide', x !== id));
const say = (el, t, c = '') => { $(el).textContent = t; $(el).className = 'msg ' + c; };

$('#cats').innerHTML = CATS.map((c) => `<label><input type="checkbox" value="${c}">${c}</label>`).join('');

// ---- Detección de episodios ----
function extract(text, base) {
  const t = text.trim(); let urls = [];
  if (/^[\[{]/.test(t)) {
    try { const walk = (v) => { if (typeof v === 'string' && /^https?:\/\//.test(v)) urls.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); }; walk(JSON.parse(t)); } catch {}
  }
  if (!urls.length && /<a\s|<source|<video/i.test(t)) {
    new DOMParser().parseFromString(t, 'text/html').querySelectorAll('a[href],source[src],video[src]').forEach((e) => {
      try { urls.push(new URL(e.getAttribute('href') || e.getAttribute('src'), base || location.href).href); } catch {}
    });
  }
  if (!urls.length) urls = t.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const vids = urls.filter((u) => VIDEO.test(u));
  return [...new Set(vids.length ? vids : urls)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
const refresh = () => { $('#n').textContent = extract($('#urls').value).length; };
$('#urls').addEventListener('input', refresh);
$('#btnFetch').onclick = async () => {
  const u = $('#collUrl').value.trim(); if (!u) return;
  say('#fetchMsg', 'Leyendo…');
  try {
    const r = await fetch(u); const found = extract(await r.text(), u);
    $('#urls').value = found.join('\n'); refresh();
    say('#fetchMsg', found.length ? `Se detectaron ${found.length} enlaces.` : 'No se encontraron enlaces en esa URL.', found.length ? 'ok' : 'err');
  } catch { say('#fetchMsg', 'Ese servidor no permite leerlo desde el navegador (CORS). Abre la URL, copia los enlaces y pégalos abajo.', 'err'); }
};

// ---- Formulario ----
let editing = null;
function fill(d = {}, id = null) {
  editing = id;
  $('#formTitle').textContent = id ? `Editando: ${d.title}` : 'Nueva producción';
  $('#title').value = d.title || ''; $('#year').value = d.year || ''; $('#season').value = (d.seasons || 0) + (id ? 0 : 1) || 1;
  document.querySelectorAll('#cats input').forEach((c) => { c.checked = (d.categories || []).includes(c.value); });
  $('#genres').value = (d.genres || []).join(', '); $('#cover').value = d.cover || ''; $('#synopsis').value = d.synopsis || '';
  $('#cast').value = (d.cast || []).join(', '); $('#featured').checked = !!d.featured;
  $('#collUrl').value = ''; $('#urls').value = ''; refresh(); say('#fetchMsg', ''); say('#saveMsg', '');
  $('#btnDel').classList.toggle('hide', !id);
}
$('#btnNew').onclick = () => fill();

$('#btnSave').onclick = async () => {
  const title = $('#title').value.trim(); if (!title) return say('#saveMsg', 'Falta el nombre.', 'err');
  const id = editing || slug(title), ref = doc(db, 'series', id);
  try {
    const prev = (await getDoc(ref)).data() || {};
    const urls = extract($('#urls').value), n = Number($('#season').value) || 1;
    let temporadas = prev.temporadas || [];
    if (urls.length) temporadas = [...temporadas.filter((t) => t.n !== n), { n, urls }].sort((a, b) => a.n - b.n);
    await setDoc(ref, {
      title, year: Number($('#year').value) || 0,
      categories: [...document.querySelectorAll('#cats input:checked')].map((c) => c.value),
      genres: csv($('#genres').value), cover: $('#cover').value.trim() || null, synopsis: $('#synopsis').value.trim(),
      cast: csv($('#cast').value), featured: $('#featured').checked, temporadas,
      seasons: temporadas.length, episodes: temporadas.reduce((s, t) => s + t.urls.length, 0), updatedAt: serverTimestamp(),
    }, { merge: true });
    say('#saveMsg', 'Guardado.', 'ok'); fill(); load();
  } catch (e) { say('#saveMsg', 'Error: ' + e.message, 'err'); }
};
$('#btnDel').onclick = async () => {
  if (!editing || !confirm('¿Borrar esta producción?')) return;
  await deleteDoc(doc(db, 'series', editing)); fill(); load();
};

async function load() {
  const snap = await getDocs(collection(db, 'series'));
  $('#list').innerHTML = '';
  snap.docs.sort((a, b) => (a.data().title || '').localeCompare(b.data().title || '')).forEach((d) => {
    const x = d.data(), el = document.createElement('div'); el.className = 'item';
    el.innerHTML = `<div><b></b><small>${x.year || ''} · ${x.seasons || 0} temp. · ${x.episodes || 0} episodios</small></div><button class="g">Editar</button>`;
    el.querySelector('b').textContent = x.title; el.querySelector('button').onclick = () => { fill(x, d.id); scrollTo(0, 0); };
    $('#list').append(el);
  });
}

// ---- Sesión ----
$('#btnLogin').onclick = () => signInWithEmailAndPassword(auth, $('#email').value, $('#pass').value).catch(() => say('#loginMsg', 'Correo o contraseña incorrectos.', 'err'));
['#btnOut1', '#btnOut2'].forEach((b) => { $(b).onclick = () => signOut(auth); });
onAuthStateChanged(auth, async (u) => {
  document.querySelector('#boot')?.remove();
  if (!u) return show('login');
  const ok = (await getDoc(doc(db, 'admins', u.uid))).exists();
  if (!ok) { $('#uid').textContent = u.uid; return show('noadmin'); }
  show('panel'); fill(); load();
});
