import { Link } from "react-router"
import type { Article } from "../types/article"
import { articleApi } from "../services/articleApi"

interface ArticleCardProps {
  article: Article
  index?: number
  onDelete: (article: Article) => void
}

function formatDate(date: string): string {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parsedDate)
}

export default function ArticleCard({
  article,
  index,
  onDelete,
}: ArticleCardProps) {
  const excerpt =
    article.content.length > 180
      ? `${article.content.slice(0, 180).trimEnd()}…`
      : article.content

  return (
    <article className="article-card">
      {article.imagen !== "default.png" ? (
        <Link
          to={`/articulos/${article._id}`}
          className="article-card__image-link"
          aria-label={`Leer ${article.title}`}
          tabIndex={-1}
        >
          <img
            className="article-card__image"
            src={articleApi.imageUrl(article.imagen)}
            alt=""
            loading="lazy"
          />
        </Link>
      ) : (
        <div className="article-card__image article-card__image--placeholder" aria-hidden="true">
          <span>{index ? String(index).padStart(2, "0") : "B"}</span>
        </div>
      )}
      <div className="article-card__body">
        <p className="article-card__date">{formatDate(article.date)}</p>
        <h2>
          <Link to={`/articulos/${article._id}`}>{article.title}</Link>
        </h2>
        <p className="article-card__excerpt">{excerpt}</p>
        <div className="article-card__actions">
          <Link className="text-link" to={`/articulos/${article._id}`}>
            Leer artículo <span aria-hidden="true">→</span>
          </Link>
          <div className="article-card__manage">
            <Link
              className="button button--quiet button--small"
              to={`/articulos/${article._id}/editar`}
              aria-label={`Editar ${article.title}`}
            >
              Editar
            </Link>
            <button
              className="button button--quiet button--small"
              type="button"
              onClick={() => onDelete(article)}
              aria-label={`Borrar ${article.title}`}
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
