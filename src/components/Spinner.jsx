// Aro de carga azul celeste. Usar <Spinner small /> dentro de botones o textos.
export default function Spinner({ small = false, label = '' }) {
  if (small) return <span className="spinner sm" role="status" aria-label="Cargando" />
  return (
    <div className="loading-box">
      <span className="spinner" role="status" aria-label="Cargando" />
      {label && <p>{label}</p>}
    </div>
  )
}
