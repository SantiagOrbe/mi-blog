import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import ArticleForm from "../ArticleForm"
import Feedback from "../Feedback"
import PageHeading from "../PageHeading"
import { articleApi, getErrorMessage, isValidArticleId } from "../../services/articleApi"
import type { Article } from "../../types/article"

export default function EditarArticulo() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [loadedId, setLoadedId] = useState("")
  const [error, setError] = useState("")
  const [savedArticle, setSavedArticle] = useState<Article | null>(null)

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

  return (
    <section className="page-section">
      <div className="content-container content-container--narrow">
        <PageHeading
          eyebrow="Edición"
          title="Editar artículo"
          description="Ajusta el título o el contenido y guarda tus cambios."
        />
        {loading && <Feedback variant="loading" title="Cargando artículo" />}
        {!loading && (!isValidArticleId(id) || error) && (
          <Feedback
            variant="error"
            title="No se pudo abrir el artículo"
            action={<Link className="button button--secondary" to="/articulos">Volver a artículos</Link>}
          >
            {error || "El identificador del artículo no es válido."}
          </Feedback>
        )}
        {!loading && article && (
          <ArticleForm
            key={article._id}
            initialValue={{ title: article.title, content: article.content }}
            currentImage={article.imagen}
            locked={Boolean(savedArticle)}
            lockedMessage="Los cambios ya están guardados. Sube la imagen seleccionada para terminar; si falla, podrás reintentarlo."
            submitLabel={savedArticle ? "Reintentar subida de imagen" : "Guardar cambios"}
            onSubmit={async (data, image) => {
              const updated = savedArticle ?? await articleApi.update(article._id, data)
              if (!savedArticle) setSavedArticle(updated)

              try {
                const updatedWithImage = await articleApi.uploadImage(updated._id, image)
                navigate(`/articulos/${updatedWithImage._id}`, {
                  state: { successMessage: "Los cambios y la imagen se guardaron correctamente." },
                })
              } catch (requestError) {
                throw new Error(
                  `Los cambios de texto ya están guardados, pero no se pudo subir la imagen. ${getErrorMessage(requestError)} Selecciona otra imagen o reintenta la subida.`,
                  { cause: requestError },
                )
              }
            }}
          />
        )}
      </div>
    </section>
  )
}
