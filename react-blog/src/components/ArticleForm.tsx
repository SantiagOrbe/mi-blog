import { useState, type FormEvent } from "react"
import type { ArticleInput } from "../types/article"
import { articleApi } from "../services/articleApi"
import Feedback from "./Feedback"

interface ArticleFormProps {
  initialValue?: ArticleInput
  currentImage?: string
  locked?: boolean
  lockedMessage?: string
  submitLabel: string
  onSubmit: (data: ArticleInput, image: File) => Promise<void>
}

const allowedImageExtensions = /\.(png|jpe?g)$/i
const allowedImageTypes = new Set(["image/png", "image/jpeg"])

export default function ArticleForm({
  initialValue,
  currentImage,
  locked = false,
  lockedMessage,
  submitLabel,
  onSubmit,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? "")
  const [content, setContent] = useState(initialValue?.content ?? "")
  const [image, setImage] = useState<File | null>(null)
  const [errors, setErrors] = useState<{
    title?: string
    content?: string
    image?: string
  }>({})
  const [requestError, setRequestError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: { title?: string; content?: string; image?: string } = {}
    if (!title.trim()) nextErrors.title = "Escribe un título para continuar."
    if (!content.trim()) nextErrors.content = "Añade el contenido del artículo."
    if (!image) {
      nextErrors.image = "Selecciona una imagen para continuar."
    } else if (!allowedImageExtensions.test(image.name)) {
      nextErrors.image = "El archivo debe ser PNG, JPG o JPEG."
    } else if (image.type && !allowedImageTypes.has(image.type)) {
      nextErrors.image = "Selecciona una imagen PNG, JPG o JPEG válida."
    }

    setErrors(nextErrors)
    setRequestError("")
    if (Object.keys(nextErrors).length > 0 || !image) return

    setSubmitting(true)
    try {
      await onSubmit(
        { title: title.trim(), content: content.trim() },
        image,
      )
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación. Inténtalo de nuevo.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="article-form" onSubmit={handleSubmit} noValidate>
      {lockedMessage && (
        <Feedback variant="success" title="El artículo ya está guardado">
          {lockedMessage}
        </Feedback>
      )}
      {requestError && (
        <Feedback variant="error" title="No se pudo completar la operación">
          {requestError}
        </Feedback>
      )}
      <div className="form-field">
        <label htmlFor="article-title">Título</label>
        <input
          id="article-title"
          name="title"
          type="text"
          value={title}
          disabled={locked}
          onChange={(event) => {
            setTitle(event.target.value)
            if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
          }}
          placeholder="Un título claro y evocador"
          autoComplete="off"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "article-title-error" : "article-title-hint"}
          required
        />
        {errors.title ? (
          <p className="field-error" id="article-title-error">{errors.title}</p>
        ) : (
          <p className="field-hint" id="article-title-hint">Elige un título fácil de recordar.</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="article-content">Contenido</label>
        <textarea
          id="article-content"
          name="content"
          value={content}
          disabled={locked}
          onChange={(event) => {
            setContent(event.target.value)
            if (errors.content) setErrors((current) => ({ ...current, content: undefined }))
          }}
          placeholder="Desarrolla tu idea con calma…"
          rows={12}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "article-content-error" : "article-content-hint"}
          required
        />
        {errors.content ? (
          <p className="field-error" id="article-content-error">{errors.content}</p>
        ) : (
          <p className="field-hint" id="article-content-hint">El contenido no puede quedar vacío.</p>
        )}
      </div>

      {currentImage && (
        <div className="current-image">
          {currentImage !== "default.png" && (
            <img
              src={articleApi.imageUrl(currentImage)}
              alt="Imagen actual del artículo"
            />
          )}
          <p>
            Imagen actual: <strong>{currentImage}</strong>. Selecciona una imagen nueva para guardar.
          </p>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="article-image">Imagen <span className="required-mark">(obligatoria)</span></label>
        <input
          id="article-image"
          name="archivo"
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          required
          aria-invalid={Boolean(errors.image)}
          aria-describedby={errors.image ? "article-image-error" : "article-image-hint"}
          onChange={(event) => {
            setImage(event.target.files?.[0] ?? null)
            setRequestError("")
            if (errors.image) {
              setErrors((current) => ({ ...current, image: undefined }))
            }
          }}
        />
        {errors.image ? (
          <p className="field-error" id="article-image-error">{errors.image}</p>
        ) : (
          <p className="field-hint" id="article-image-hint">
            Elige una imagen PNG, JPG o JPEG.
            {image ? ` Seleccionada: ${image.name}` : ""}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? "Guardando y subiendo imagen…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
