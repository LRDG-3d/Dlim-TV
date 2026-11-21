import Hero from '../components/Hero.jsx'
import Row from '../components/Row.jsx'
import { titles } from '../data/titles.js'

const range = (a, b) => titles.filter((x) => x.year >= a && x.year <= b)

export default function Home() {
  const featured = titles.filter((x) => x.featured)
  return (
    <main>
      <Hero items={featured} />
      <div className="rows">
        <Row title="Producciones destacadas" items={featured} />
        <Row title="Lo más popular" items={titles.filter((x) => x.popular)} />
        <Row title="Telenovelas" items={titles.filter((x) => x.type === 'Telenovela')} />
        <Row title="Series" items={titles.filter((x) => x.type === 'Serie')} />
        <Row title="Del 2000 al 2004" items={range(2000, 2004)} />
        <Row title="Del 2005 al 2009" items={range(2005, 2009)} />
        <Row title="Del 2010 al 2014" items={range(2010, 2014)} />
      </div>
    </main>
  )
}
