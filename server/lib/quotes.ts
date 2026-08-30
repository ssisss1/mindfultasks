/** Offline fallback used when the external quote API is unreachable. */
export const FALLBACK_QUOTES: { text: string; author: string }[] = [
  { text: 'Smile, breathe and go slowly.', author: 'Thich Nhat Hanh' },
  { text: 'The little things? The little moments? They aren’t little.', author: 'Jon Kabat-Zinn' },
  { text: 'You should sit in meditation for twenty minutes a day, unless you’re too busy; then you should sit for an hour.', author: 'Zen proverb' },
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
  { text: 'Quiet the mind and the soul will speak.', author: 'Ma Jaya Sati Bhagavati' },
  { text: 'Within you there is a stillness and a sanctuary to which you can retreat at any time.', author: 'Hermann Hesse' },
  { text: 'The present moment is the only time over which we have dominion.', author: 'Thich Nhat Hanh' },
  { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'Breath is the bridge which connects life to consciousness.', author: 'Thich Nhat Hanh' },
  { text: 'Do every act of your life as though it were the very last act of your life.', author: 'Marcus Aurelius' },
  { text: 'Wherever you are, be there totally.', author: 'Eckhart Tolle' },
]

export function randomFallbackQuote() {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
}
