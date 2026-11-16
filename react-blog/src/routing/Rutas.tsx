import { BrowserRouter, Route, Routes } from "react-router"
import Footer from "../components/layout/Footer"
import Header from "../components/layout/Header"
import Nav from "../components/layout/Nav"
import ArticuloSolo from "../components/pages/ArticuloSolo"
import Articulos from "../components/pages/Articulos"
import Busqueda from "../components/pages/Busqueda"
import Crear from "../components/pages/Crear"
import EditarArticulo from "../components/pages/EditarArticulo"
import Inicio from "../components/pages/Inicio"
import SubirImagen from "../components/pages/SubirImagen"
import UltimosArticulos from "../components/pages/UltimosArticulos"
import VerImagen from "../components/pages/VerImagen"
import Feedback from "../components/Feedback"
import { Link } from "react-router"

function NotFound() {
  return (
    <section className="page-section">
      <div className="content-container content-container--narrow">
        <Feedback
          variant="error"
          title="No encontramos esta página"
          action={<Link className="button button--primary" to="/">Ir al inicio</Link>}
        >
          Puede que el enlace haya cambiado o ya no esté disponible.
        </Feedback>
      </div>
    </section>
  )
}

export default function Rutas() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <Nav />
        <main className="main-content" id="contenido">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/articulos" element={<Articulos />} />
            <Route path="/articulos/ultimos" element={<UltimosArticulos />} />
            <Route path="/articulos/:id/editar" element={<EditarArticulo />} />
            <Route path="/articulos/:id/imagen" element={<SubirImagen />} />
            <Route path="/articulos/:id" element={<ArticuloSolo />} />
            <Route path="/crear-articulos" element={<Crear />} />
            <Route path="/buscar" element={<Busqueda />} />
            <Route path="/imagen/:fichero" element={<VerImagen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
