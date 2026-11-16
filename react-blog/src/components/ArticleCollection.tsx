import { useEffect, useState } from "react"
import { Link } from "react-router"
import ArticleCard from "./ArticleCard"
import DeleteDialog from "./DeleteDialog"
import Feedback from "./Feedback"
import type { Article } from "../types/article"
import { articleApi, getErrorMessage } from "../services/articleApi"

interface ArticleCollectionProps {
  title: string
  description: string
  eyebrow?: string
  loadArticles: () => Promise<Article[]>
  emptyTitle?: string
  emptyMessage?: string
}

export default function ArticleCollection({
  title,
  description,
  eyebrow,
  loadArticles,
  emptyTitle = "Todavía no hay artículos",
  emptyMessage = "Cuando publiques algo, aparecerá aquí.",
}: ArticleCollectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true

    loadArticles()
      .then((result) => {
        if (active) setArticles(result)
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadArticles, refresh])

  async function handleDelete() {
    if (!selectedArticle) return
    setDeleting(true)
    setDeleteError("")
    try {
      await articleApi.remove(selectedArticle._id)
      setArticles((current) =>
        current.filter((article) => article._id !== selectedArticle._id),
      )
      setSelectedArticle(null)
    } catch (requestError) {
      setDeleteError(getErrorMessage(requestError))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="page-section">
      <div className="content-container">
        <div className="page-heading">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            <p className="page-heading__description">{description}</p>
          </div>
          <Link className="button button--primary" to="/crear-articulos">
            Escribir artículo <span aria-hidden="true">+</span>
          </Link>
        </div>

        {loading && (
          <Feedback variant="loading" title="Cargando artículos">
            Estamos preparando la colección.
          </Feedback>
        )}

        {!loading && error && (
          <Feedback
            variant="error"
            title="No se pudieron cargar los artículos"
            action={
              <button
                className="button button--secondary"
                type="button"
                  onClick={() => {
                    setLoading(true)
                    setError("")
                    setRefresh((value) => value + 1)
                  }}
              >
                Intentar de nuevo
              </button>
            }
          >
            {error}
          </Feedback>
        )}

        {!loading && !error && articles.length === 0 && (
          <Feedback
            variant="empty"
            title={emptyTitle}
            action={
              <Link className="button button--primary" to="/crear-articulos">
                Crear el primer artículo
              </Link>
            }
          >
            {emptyMessage}
          </Feedback>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="article-grid">
            {articles.map((article, index) => (
              <ArticleCard
                key={article._id}
                article={article}
                index={index + 1}
                onDelete={(selected) => {
                  setDeleteError("")
                  setSelectedArticle(selected)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <DeleteDialog
          article={selectedArticle}
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            setSelectedArticle(null)
            setDeleteError("")
          }}
          onConfirm={handleDelete}
        />
      )}
    </section>
  )
}
