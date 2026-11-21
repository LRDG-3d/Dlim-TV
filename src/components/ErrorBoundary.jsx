import { Component } from 'react'

// Si una pantalla falla, muestra un aviso en vez de dejar la página en negro.
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error('Dlim TV:', error) }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="welcome">
        <h1>Algo salió mal</h1>
        <p>No se pudo mostrar esta sección.</p>
        <p><a className="btn primary" href="#/">Volver al inicio</a></p>
      </main>
    )
  }
}
