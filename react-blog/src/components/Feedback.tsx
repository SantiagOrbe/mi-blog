import type { ReactNode } from "react"

interface FeedbackProps {
  variant: "loading" | "error" | "success" | "empty"
  title: string
  children?: ReactNode
  action?: ReactNode
}

export default function Feedback({
  variant,
  title,
  children,
  action,
}: FeedbackProps) {
  return (
    <section
      className={`feedback feedback--${variant}`}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-busy={variant === "loading"}
    >
      {variant === "loading" && <span className="loading-spinner" aria-hidden="true" />}
      <div>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
        {action && <div className="feedback__action">{action}</div>}
      </div>
    </section>
  )
}
