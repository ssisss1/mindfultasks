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
      className={`rounded-2xl border border-sage-100 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-sage-800">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-sage-500">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}
