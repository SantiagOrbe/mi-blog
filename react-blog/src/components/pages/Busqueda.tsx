import { useEffect, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router"
import ArticleCard from "../ArticleCard"
import DeleteDialog from "../DeleteDialog"
import Feedback from "../Feedback"
import PageHeading from "../PageHeading"
import { articleApi, getErrorMessage } from "../../services/articleApi"
import type { Article } from "../../types/article"

interface SearchFormProps {
  initialTerm: string
  onSearch: (term: string) => void
}

function SearchForm({ initialTerm, onSearch }: SearchFormProps) {
  const [term, setTerm] = useState(initialTerm)
  const [validationError, setValidationError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTerm = term.trim()
    if (!trimmedTerm) {
      setValidationError("Escribe una palabra o frase para buscar.")
      return
    }
    setValidationError("")
    onSearch(trimmedTerm)
  }

  return (
    <>
      <form className="search-form" onSubmit={handleSubmit} role="search">
        <label className="sr-only" htmlFor="article-search">Buscar por título o contenido</label>
        <input
          id="article-search"
          type="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value)
            if (validationError) setValidationError("")
          }}
          placeholder="¿Qué tienes en mente?"
        />
        <button className="button button--primary" type="submit">Buscar</button>
      </form>
      {validationError && (
        <p className="field-error search-error" role="alert">{validationError}</p>
      )}
    </>
  )
}

interface SearchResult {
  query: string
  articles: Article[]
  error: string
}

export default function Busqueda() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q")?.trim() ?? ""
  const [result, setResult] = useState<SearchResult | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (!query) return

    let active = true
    articleApi.search(query)
      .then((articles) => {
        if (active) setResult({ query, articles, error: "" })
      })
      .catch((requestError: unknown) => {
        if (active) {
          setResult({ query, articles: [], error: getErrorMessage(requestError) })
        }
      })

    return () => {
      active = false
    }
  }, [query])

  const loading = Boolean(query) && result?.query !== query
  const currentResult = result?.query === query ? result : null
  const articles = currentResult?.articles ?? []
  const error = currentResult?.error ?? ""

  async function handleDelete() {
    if (!selectedArticle) return
    setDeleting(true)
    setDeleteError("")
    try {
      await articleApi.remove(selectedArticle._id)
      setResult((current) =>
        current?.query === query
          ? {
              ...current,
              articles: current.articles.filter(
                (article) => article._id !== selectedArticle._id,
              ),
            }
          : current,
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
        <PageHeading
          eyebrow="Encuentra una idea"
          title="Buscar artículos"
          description="Busca en los títulos y contenidos de la colección."
        />
        <SearchForm
          key={query}
          initialTerm={query}
          onSearch={(term) => setSearchParams({ q: term })}
        />

        {error && (
          <Feedback variant="error" title="No se pudo realizar la búsqueda">
            {error}
          </Feedback>
        )}
        {!error && loading && <Feedback variant="loading" title="Buscando artículos" />}
        {!error && !loading && !query && (
          <Feedback variant="empty" title="Empieza con una búsqueda">
            Escribe un término para encontrar artículos relacionados.
          </Feedback>
        )}
        {!error && !loading && query && articles.length === 0 && (
          <Feedback
            variant="empty"
            title="No encontramos coincidencias"
            action={<Link className="button button--secondary" to="/articulos">Explorar todos los artículos</Link>}
          >
            Prueba con otras palabras; buscamos en títulos y contenidos.
          </Feedback>
        )}
        {!error && !loading && articles.length > 0 && (
          <>
            <p className="results-caption">
              {articles.length} {articles.length === 1 ? "resultado" : "resultados"} para “{query}”
            </p>
            <div className="article-grid">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  index={index + 1}
                  onDelete={setSelectedArticle}
                />
              ))}
            </div>
          </>
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
