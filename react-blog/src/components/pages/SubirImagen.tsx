import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router"
import Feedback from "../Feedback"
import PageHeading from "../PageHeading"
import { articleApi, getErrorMessage, isValidArticleId } from "../../services/articleApi"
import type { Article } from "../../types/article"

const allowedExtensions = /\.(png|jpe?g)$/i

export default function SubirImagen() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loadedId, setLoadedId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!file) {
      setError("Selecciona una imagen antes de continuar.")
      return
    }
    if (!allowedExtensions.test(file.name)) {
      setError("El archivo debe ser PNG, JPG o JPEG.")
      return
    }
    if (file.type && !["image/png", "image/jpeg"].includes(file.type)) {
      setError("El archivo debe ser una imagen PNG, JPG o JPEG válida.")
      return
    }

    setSubmitting(true)
    try {
      const updatedArticle = await articleApi.uploadImage(id, file)
      navigate(`/imagen/${encodeURIComponent(updatedArticle.imagen)}`, {
        state: { successMessage: "La imagen se subió correctamente." },
      })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <div className="content-container content-container--narrow">
        <PageHeading
          eyebrow="Imagen de portada"
          title="Añadir una imagen"
          description="Elige una imagen JPG o PNG para acompañar tu artículo."
        />
        {loading && <Feedback variant="loading" title="Buscando artículo" />}
        {!loading && (!isValidArticleId(id) || error || !article) && (
          <Feedback
            variant="error"
            title="No se pudo abrir el artículo"
            action={<Link className="button button--secondary" to="/articulos">Volver a artículos</Link>}
          >
            {error || "El identificador del artículo no es válido."}
          </Feedback>
        )}
        {!loading && article && (
          <form className="article-form" onSubmit={handleSubmit} noValidate>
            <div className="upload-context">
              <span className="upload-context__label">Artículo</span>
              <strong>{article.title}</strong>
            </div>
            {error && <Feedback variant="error" title="No se pudo subir la imagen">{error}</Feedback>}
            <div className="form-field">
              <label htmlFor="article-image">Archivo de imagen</label>
              <input
                id="article-image"
                name="archivo"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setError("")
                }}
              />
              <p className="field-hint">Formatos admitidos: PNG, JPG y JPEG.</p>
            </div>
            {file && (
              <p className="selected-file">
                Archivo seleccionado: <strong>{file.name}</strong>
              </p>
            )}
            <div className="form-actions">
              <button className="button button--primary" type="submit" disabled={submitting}>
                {submitting ? "Subiendo…" : "Subir imagen"}
              </button>
              <Link className="button button--secondary" to={`/articulos/${article._id}`}>
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
