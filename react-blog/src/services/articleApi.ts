import { Global } from "../helpers/Global"
import type { ApiResponse, Article, ArticleInput } from "../types/article"

export class ArticleApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ArticleApiError"
    this.status = status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isArticle(value: unknown): value is Article {
  if (!isRecord(value)) return false

  return (
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    typeof value.date === "string" &&
    typeof value.imagen === "string"
  )
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(`${Global.url}${path}`, init)
  } catch {
    throw new ArticleApiError(
      "No se pudo conectar con el servidor. Comprueba que la API esté disponible e inténtalo de nuevo.",
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ArticleApiError(
      "El servidor devolvió una respuesta que no se pudo leer.",
      response.status,
    )
  }

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.mensaje === "string"
        ? body.mensaje
        : "No se pudo completar la solicitud. Inténtalo de nuevo."
    throw new ArticleApiError(message, response.status)
  }

  if (!isRecord(body) || body.status !== "success") {
    throw new ArticleApiError(
      "La respuesta del servidor no tiene el formato esperado.",
      response.status,
    )
  }

  return body
}

function asArticle(value: unknown): Article {
  if (!isArticle(value)) {
    throw new ArticleApiError(
      "El servidor devolvió un artículo con datos incompletos.",
    )
  }
  return value
}

function asArticleList(value: unknown): Article[] {
  if (!Array.isArray(value) || !value.every(isArticle)) {
    throw new ArticleApiError(
      "El servidor devolvió una lista de artículos con un formato inesperado.",
    )
  }
  return value
}

function jsonRequest(method: "POST" | "PUT", data: ArticleInput): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }
}

export const articleApi = {
  async getAll(): Promise<Article[]> {
    const response = (await request("/articulos")) as ApiResponse<Article>
    return asArticleList(response.status === "success" ? response.articulos : undefined)
  },

  async getLatest(): Promise<Article[]> {
    const response = (await request("/articulos?ultimos=10")) as ApiResponse<Article>
    return asArticleList(response.status === "success" ? response.articulos : undefined)
  },

  async getById(id: string): Promise<Article> {
    const response = (await request(
      `/articulos/${encodeURIComponent(id)}`,
    )) as ApiResponse<Article>
    return asArticle(response.status === "success" ? response.articulo : undefined)
  },

  async create(data: ArticleInput): Promise<Article> {
    const response = (await request(
      "/crear",
      jsonRequest("POST", data),
    )) as ApiResponse<Article>
    return asArticle(response.status === "success" ? response.articulo : undefined)
  },

  async update(id: string, data: ArticleInput): Promise<Article> {
    const response = (await request(
      `/articulos/${encodeURIComponent(id)}`,
      jsonRequest("PUT", data),
    )) as ApiResponse<Article>
    return asArticle(response.status === "success" ? response.articulo : undefined)
  },

  async remove(id: string): Promise<Article> {
    const response = (await request(
      `/articulos/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    )) as ApiResponse<Article>
    return asArticle(response.status === "success" ? response.articulo : undefined)
  },

  async uploadImage(id: string, file: File): Promise<Article> {
    const formData = new FormData()
    formData.append("archivo", file)
    const response = (await request(
      `/subir-imagen/${encodeURIComponent(id)}`,
      { method: "POST", body: formData },
    )) as ApiResponse<Article>
    return asArticle(response.status === "success" ? response.articulo : undefined)
  },

  async search(term: string): Promise<Article[]> {
    const response = (await request(
      `/bucar/${encodeURIComponent(term)}`,
    )) as ApiResponse<Article>
    return asArticleList(response.status === "success" ? response.articulos : undefined)
  },

  imageUrl(filename: string): string {
    return `${Global.url}/imagen/${encodeURIComponent(filename)}`
  },
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado. Inténtalo de nuevo."
}

export function isValidArticleId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id)
}
