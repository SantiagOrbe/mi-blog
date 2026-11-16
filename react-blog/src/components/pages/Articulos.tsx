import ArticleCollection from "../ArticleCollection"
import { articleApi } from "../../services/articleApi"

export default function Articulos() {
  return (
    <ArticleCollection
      eyebrow="La colección"
      title="Todos los artículos"
      description="Un archivo vivo de ideas, notas e historias."
      loadArticles={articleApi.getAll}
    />
  )
}
