import ArticleCollection from "../ArticleCollection"
import { articleApi } from "../../services/articleApi"

export default function UltimosArticulos() {
  return (
    <ArticleCollection
      eyebrow="Lo más reciente"
      title="Últimos artículos"
      description="Diez ideas recientes, listas para volver a leer."
      loadArticles={articleApi.getLatest}
      emptyTitle="Aún no hay publicaciones recientes"
      emptyMessage="Cuando haya artículos, los más nuevos aparecerán aquí."
    />
  )
}
