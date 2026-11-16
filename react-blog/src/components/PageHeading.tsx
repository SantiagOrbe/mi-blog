import type { ReactNode } from "react"

interface PageHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: PageHeadingProps) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-heading__description">{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </div>
  )
}
