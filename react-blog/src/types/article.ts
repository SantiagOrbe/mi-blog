export interface Article {
  _id: string
  title: string
  content: string
  date: string
  imagen: string
}

export interface ApiSuccess<T> {
  status: "success"
  mensaje?: string
  articulo?: T
  articulos?: T[]
}

export interface ApiFailure {
  status: "error"
  mensaje: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export interface ArticleInput {
  title: string
  content: string
}
