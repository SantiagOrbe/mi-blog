import { useState } from "react"
import { Link, useNavigate } from "react-router"
import ArticleForm from "../ArticleForm"
import PageHeading from "../PageHeading"
import { articleApi, getErrorMessage } from "../../services/articleApi"
import type { Article } from "../../types/article"

export default function Crear() {
  const navigate = useNavigate()
  const [createdArticle, setCreatedArticle] = useState<Article | null>(null)

  return (
    <section className="page-section">
      <div className="content-container content-container--narrow">
        <PageHeading
          eyebrow="Tu próxima historia"
          title="Crear artículo"
          description="Empieza con una idea. Siempre puedes editarla más adelante."
        />
        <ArticleForm
          locked={Boolean(createdArticle)}
          lockedMessage="Selecciona una imagen para completar la publicación. Si la subida vuelve a fallar, podrás reintentarlo sin crear otro artículo."
          submitLabel={createdArticle ? "Reintentar subida de imagen" : "Publicar artículo"}
          onSubmit={async (data, image) => {
            const article = createdArticle ?? await articleApi.create(data)
            if (!createdArticle) setCreatedArticle(article)

            try {
              const published = await articleApi.uploadImage(article._id, image)
              navigate(`/articulos/${published._id}`, {
                state: { successMessage: "Tu artículo y su imagen se publicaron correctamente." },
              })
            } catch (error) {
              throw new Error(
                `El artículo ya se creó, pero no se pudo subir la imagen. ${getErrorMessage(error)} Selecciona una imagen válida y reintenta; no se creará otro artículo.`,
                { cause: error },
              )
            }
          }}
        />
        <p className="form-note">
          ¿Aún no quieres publicarlo? <Link to="/articulos">Vuelve a la colección</Link>.
        </p>
      </div>
    </section>
  )
}
