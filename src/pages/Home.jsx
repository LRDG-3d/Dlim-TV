import Hero from '../components/Hero.jsx'
import Row from '../components/Row.jsx'
import Spinner from '../components/Spinner.jsx'
import { useTitles } from '../hooks/useTitles.jsx'

export default function Home() {
  const { titles, loading } = useTitles()
  const range = (a, b) => titles.filter((x) => x.year >= a && x.year <= b)
  const featured = titles.filter((x) => x.featured)
  if (!titles.length && loading) return <main className="welcome"><Spinner /></main>
  if (!titles.length) return (
    <main className="welcome">
      <h1>Bienvenido a Dlim TV</h1>
      <p>Tu catálogo está vacío. Agrega producciones desde el panel en <code>/#/admin</code>.</p>
    </main>
  )
  return (
    <main>
      {featured.length > 0 && <Hero items={featured} />}
      <div className={featured.length ? 'rows' : 'rows flat'}>
        <Row title="Producciones destacadas" items={featured} />
        <Row title="Lo más popular" ranked items={titles.filter((x) => x.popular).slice(0, 10)} />
        <Row title="Telenovelas" items={titles.filter((x) => x.type === 'Telenovela')} />
        <Row title="Series" items={titles.filter((x) => x.type === 'Serie')} />
        <Row title="Del 2000 al 2004" items={range(2000, 2004)} />
        <Row title="Del 2005 al 2009" items={range(2005, 2009)} />
        <Row title="Del 2010 al 2014" items={range(2010, 2014)} />
      </div>
    </main>
  )
}
