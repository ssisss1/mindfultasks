import type { ReactNode } from 'react'

interface CardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <section
      className={`border border-term-line bg-term-panel shadow-term ${className}`}
    >
      <header className="flex items-center gap-2 border-b border-term-line bg-term-raised px-4 py-2">
        <span aria-hidden className="text-term-green">
          &#9632;
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-term-green text-glow">
          {title}
        </h2>
      </header>
      <div className="p-4 sm:p-6">
        {subtitle && (
          <p className="mb-4 text-xs text-term-muted">{`// ${subtitle}`}</p>
        )}
        {children}
      </div>
    </section>
  )
}
