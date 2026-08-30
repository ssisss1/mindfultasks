interface QuoteCardProps {
  text: string
  author: string
}

export function QuoteCard({ text, author }: QuoteCardProps) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-sage-400">
        A thought to sit with
      </p>
      <blockquote className="mt-2 text-sm leading-relaxed text-sage-700">
        “{text}”
      </blockquote>
      <p className="mt-2 text-xs text-sage-500">— {author}</p>
    </div>
  )
}
