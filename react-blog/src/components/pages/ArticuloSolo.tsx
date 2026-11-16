import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import DeleteDialog from "../DeleteDialog"
import Feedback from "../Feedback"
import { articleApi, getErrorMessage, isValidArticleId } from "../../services/articleApi"
import type { Article } from "../../types/article"

interface NavigationState {
  successMessage?: string
}

export default function ArticuloSolo() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as NavigationState | null
  const [article, setArticle] = useState<Article | null>(null)
  const [loadedId, setLoadedId] = useState("")
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    let active = true
    if (!isValidArticleId(id)) return

    articleApi.getById(id)
      .then((result) => {
        if (active) {
          setArticle(result)
          setError("")
          setLoadedId(id)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getErrorMessage(requestError))
          setLoadedId(id)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  const loading = isValidArticleId(id) && loadedId !== id

  async function handleDelete() {
    if (!article) return
    setDeleting(true)
    setDeleteError("")
    try {
      await articleApi.remove(article._id)
      navigate("/articulos", {
        state: { successMessage: "El artículo se borró correctamente." },
      })
    } catch (requestError) {
      setDeleteError(getErrorMessage(requestError))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <section className="page-section"><div className="content-container"><Feedback variant="loading" title="Cargando artículo" /></div></section>
  }

  if (!isValidArticleId(id) || error || !article) {
    return (
      <section className="page-section">
        <div className="content-container content-container--narrow">
          <Feedback
            variant="error"
            title="No se pudo abrir el artículo"
            action={<Link className="button button--secondary" to="/articulos">Volver a artículos</Link>}
          >
            {error || (isValidArticleId(id)
              ? "No se encontró el artículo solicitado."
              : "El identificador del artículo no es válido.")}
          </Feedback>
        </div>
      </section>
    )
  }

  const formattedDate = new Date(article.date)
  const dateLabel = Number.isNaN(formattedDate.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(formattedDate)

  return (
    <article className="page-section article-detail">
      <div className="content-container content-container--narrow">
        <Link className="back-link" to="/articulos">← Volver a artículos</Link>
        {state?.successMessage && (
          <Feedback variant="success" title="Cambios guardados">{state.successMessage}</Feedback>
        )}
        <p className="eyebrow">Publicado el {dateLabel}</p>
        <h1>{article.title}</h1>
        <div className="article-detail__actions">
          <Link className="button button--secondary" to={`/articulos/${article._id}/editar`}>Editar</Link>
          <Link className="button button--secondary" to={`/articulos/${article._id}/imagen`}>Cambiar imagen</Link>
          <button className="button button--danger-outline" type="button" onClick={() => setShowDelete(true)}>
            Borrar artículo
          </button>
        </div>
        {deleteError && <Feedback variant="error" title="No se pudo borrar">{deleteError}</Feedback>}
        {!imageFailed && (
          <figure className="article-detail__cover">
            <img
              src={articleApi.imageUrl(article.imagen)}
              alt={`Imagen de portada: ${article.title}`}
              onError={() => setImageFailed(true)}
            />
          </figure>
        )}
        {imageFailed && article.imagen !== "default.png" && (
          <Feedback variant="error" title="No se pudo cargar la imagen">
            El artículo sigue disponible; puedes volver a subir su imagen.
          </Feedback>
        )}
        <div className="article-detail__content">
          {article.content.split(/\r?\n/).map((paragraph, index) =>
            paragraph.trim() ? <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p> : null,
          )}
        </div>
        {article.imagen !== "default.png" && (
          <Link className="text-link" to={`/imagen/${encodeURIComponent(article.imagen)}`}>
            Ver imagen original <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
      {showDelete && (
        <DeleteDialog
          article={article}
          busy={deleting}
          error={deleteError}
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </article>
  )
}
