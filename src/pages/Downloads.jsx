import { useDownloads, isNative, fmtSpeed, fmtSize, pctOf, openFile } from '../lib/downloads.js'

const label = (x) => {
  const p = pctOf(x)
  if (x.state === 'downloading') return `${p}% · ${fmtSpeed(x.speed)}`
  if (x.state === 'queued') return 'En cola'
  if (x.state === 'paused') return `Pausado · ${p}%`
  if (x.state === 'error') return 'Error. Toca Reintentar'
  return `Completado · ${fmtSize(x.total)}`
}

export default function Downloads() {
  const dl = useDownloads()
  if (!isNative) return (
    <main className="page"><h1 className="page-title">Descargas</h1>
      <p className="empty">Las descargas dentro de la app funcionan solo en la app de Android.</p></main>
  )
  const items = Object.values(dl.map).filter((x) => x.state && x.state !== 'canceled')
  return (
    <main className="page">
      <h1 className="page-title">Descargas</h1>
      {!items.length && <p className="empty">Aún no hay descargas. Abre una producción y toca “Descargar” en un episodio.</p>}
      <div className="dl-list">
        {items.map((x) => (
          <div className="dl-item" key={x.id}>
            <b>{x.id.replace(/\.zip$/i, '')}</b>
            <small>{label(x)}</small>
            {x.state !== 'done' && <div className="dl-bar"><i style={{ width: `${pctOf(x)}%` }} /></div>}
            <div className="dl-ctl">
              {(x.state === 'downloading' || x.state === 'queued') && <button onClick={() => dl.pause(x.id)}>Pausar</button>}
              {(x.state === 'paused' || x.state === 'error') && x.url && <button onClick={() => dl.start(x.url, x.id)}>{x.state === 'error' ? 'Reintentar' : 'Reanudar'}</button>}
              {x.state === 'done' && <button onClick={() => openFile(x.id)}>Abrir</button>}
              {x.state === 'done'
                ? <button onClick={() => dl.remove(x.id)}>Eliminar</button>
                : <button onClick={() => dl.cancel(x.id)}>Cancelar</button>}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
