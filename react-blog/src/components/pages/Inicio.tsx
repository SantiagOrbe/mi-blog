import { Link } from "react-router"

export default function Inicio() {
  return (
    <section className="home-hero">
      <div className="content-container home-hero__inner">
        <div className="home-hero__copy">
          <p className="eyebrow">Un espacio para las ideas</p>
          <h1>Las buenas historias encuentran su <em>margen.</em></h1>
          <p className="home-hero__description">
            Un blog personal para escribir, descubrir y volver a esas ideas que merecen quedarse.
          </p>
          <div className="home-hero__actions">
            <Link className="button button--primary" to="/articulos">
              Explorar artículos <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" to="/crear-articulos">Escribir una historia</Link>
          </div>
        </div>
        <div className="home-hero__art" aria-hidden="true">
          <div className="home-hero__sun" />
          <div className="home-hero__sheet home-hero__sheet--back" />
          <div className="home-hero__sheet home-hero__sheet--front">
            <span>IDEAS</span>
            <span>QUE</span>
            <strong>PERDURAN</strong>
            <i />
          </div>
          <span className="home-hero__annotation">DESDE EL PRIMER BORRADOR</span>
        </div>
      </div>
      <div className="home-hero__footer content-container">
        <span>01 — Leer sin prisa</span>
        <Link to="/articulos/ultimos">Descubre lo más reciente <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  )
}
