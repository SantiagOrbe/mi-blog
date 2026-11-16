import { Link } from "react-router"

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link className="footer-brand" to="/">margen<span>.</span></Link>
        <p>Un rincón para escribir, leer y pensar.</p>
        <Link to="/articulos">Volver a la colección <span aria-hidden="true">↑</span></Link>
      </div>
    </footer>
  )
}
