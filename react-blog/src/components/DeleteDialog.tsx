import { useEffect, useRef } from "react"
import type { KeyboardEvent } from "react"
import type { Article } from "../types/article"

interface DeleteDialogProps {
  article: Article
  busy: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteDialog({
  article,
  busy,
  error,
  onCancel,
  onConfirm,
}: DeleteDialogProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const cancelButton = dialog?.querySelector<HTMLButtonElement>("[data-dialog-cancel]")
    cancelButton?.focus()

    return () => previousFocus?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && !busy) {
      event.preventDefault()
      onCancel()
    }

    if (event.key === "Tab") {
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
      if (!buttons?.length) return
      const firstButton = buttons[0]
      const lastButton = buttons[buttons.length - 1]

      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault()
        lastButton.focus()
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault()
        firstButton.focus()
      }
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <p className="eyebrow">Acción permanente</p>
        <h2 id="delete-dialog-title">¿Borrar este artículo?</h2>
        <p id="delete-dialog-description">
          Se eliminará <strong>“{article.title}”</strong>. Esta acción no se puede deshacer.
        </p>
        {error && <p className="dialog-inline-error" role="alert">{error}</p>}
        <div className="confirm-dialog__actions">
          <button
            className="button button--secondary"
            type="button"
            data-dialog-cancel
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            className="button button--danger"
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Borrando…" : "Sí, borrar"}
          </button>
        </div>
      </section>
    </div>
  )
}
