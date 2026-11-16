import { Link } from "react-router"

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Margen, inicio">
        <span className="brand-mark" aria-hidden="true">M</span>
        <span className="brand-copy">
          <span className="brand-name">margen</span>
          <span className="brand-tagline">un blog para las ideas</span>
        </span>
      </Link>
      <Link className="header-note" to="/crear-articulos">
        Una página en blanco te espera <span aria-hidden="true">↗</span>
      </Link>
    </header>
  )
}
