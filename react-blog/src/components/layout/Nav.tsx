import { NavLink } from "react-router"

const navigation = [
  { to: "/", label: "Inicio", end: true },
  { to: "/articulos", label: "Artículos", end: true },
  { to: "/articulos/ultimos", label: "Lo reciente", end: false },
  { to: "/buscar", label: "Buscar", end: false },
]

export default function Nav() {
  return (
    <nav className="site-nav" aria-label="Navegación principal">
      <div className="site-nav__inner">
        <ul>
          {navigation.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink className="nav-write-link" to="/crear-articulos">
          Escribir <span aria-hidden="true">+</span>
        </NavLink>
      </div>
    </nav>
  )
}
