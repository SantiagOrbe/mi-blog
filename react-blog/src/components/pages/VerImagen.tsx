import { useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import Feedback from "../Feedback"
import PageHeading from "../PageHeading"
import { articleApi } from "../../services/articleApi"

interface NavigationState {
  successMessage?: string
}

export default function VerImagen() {
  const { fichero = "" } = useParams()
  const location = useLocation()
  const state = location.state as NavigationState | null
  const [failed, setFailed] = useState(false)

  if (!fichero || fichero.includes("/") || fichero.includes("\\")) {
    return (
      <section className="page-section">
        <div className="content-container content-container--narrow">
          <Feedback variant="error" title="Nombre de imagen no válido">
            Comprueba el enlace e inténtalo de nuevo.
          </Feedback>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="content-container content-container--narrow">
        <PageHeading
          eyebrow="Biblioteca visual"
          title="Imagen del artículo"
          description={`Archivo: ${fichero}`}
          action={<Link className="button button--secondary" to="/articulos">Volver a artículos</Link>}
        />
        {state?.successMessage && (
          <Feedback variant="success" title="Imagen actualizada">
            {state.successMessage}
          </Feedback>
        )}
        {failed ? (
          <Feedback variant="error" title="No se pudo cargar la imagen">
            Puede que el archivo ya no esté disponible. Comprueba el artículo e inténtalo de nuevo.
          </Feedback>
        ) : (
          <figure className="image-viewer">
            <img
              src={articleApi.imageUrl(fichero)}
              alt={`Imagen del archivo ${fichero}`}
              onError={() => setFailed(true)}
            />
            <figcaption>{fichero}</figcaption>
          </figure>
        )}
      </div>
    </section>
  )
}
