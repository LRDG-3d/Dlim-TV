// Lee un JSON de episodios (ej. exportado de TheTVDB) y lo agrupa por temporada.
// Campos que reconoce por episodio: episodeNumber (n.º), title, firstAired, runtimeMinutes, network,
// episodeCode, isSeasonFinale y, opcional, synopsis / description / overview / summary.
export function parseEpisodes(json) {
  const arr = Array.isArray(json) ? json : json && json.episodes
  if (!Array.isArray(arr)) throw new Error('El JSON debe tener una lista "episodes".')
  const defSeason = Number(json && json.season && json.season.seasonNumber) || 1
  const seasons = new Map()
  let total = 0
  for (const e of arr) {
    const n = Number(e.episodeNumber ?? e.number ?? e.episode)
    if (!Number.isFinite(n)) continue
    const sn = Number(e.seasonNumber ?? defSeason) || defSeason
    const ep = {
      n,
      code: String(e.episodeCode || ''),
      title: String(e.title ?? e.name ?? '').trim(),
      aired: String(e.firstAired || e.aired || e.airDate || ''),
      runtime: Number(e.runtimeMinutes ?? e.runtime) || 0,
      network: String(e.network || ''),
      synopsis: String(e.synopsis ?? e.description ?? e.overview ?? e.summary ?? '').trim(),
      finale: !!e.isSeasonFinale,
    }
    if (!seasons.has(sn)) seasons.set(sn, [])
    seasons.get(sn).push(ep)
    total++
  }
  if (!total) throw new Error('No se encontraron episodios válidos en el JSON.')
  seasons.forEach((l) => l.sort((a, b) => a.n - b.n))
  const first = (json && json.season && json.season.firstAired) || (arr[0] && arr[0].firstAired) || ''
  return { series: (json && json.series && json.series.title) || '', firstAired: String(first), seasons, total }
}
