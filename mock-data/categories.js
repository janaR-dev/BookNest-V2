
 const categories = [
  { key: 'fiction', label: 'Fiction', blurb: 'Novels to lose an afternoon in' },
  { key: 'mystery', label: 'Mystery & Thriller', blurb: 'Quiet crimes, sharp turns' },
  { key: 'scifi', label: 'Sci-Fi & Fantasy', blurb: 'Other worlds, close to home' },
  { key: 'history', label: 'History & Ideas', blurb: 'How we got here' },
  { key: 'business', label: 'Business & Work', blurb: 'Better ways to build' },
  { key: 'poetry', label: 'Poetry & Essays', blurb: 'Short forms, long echoes' },
]

const categoryLabel = (key) => categories.find((c) => c.key === key)?.label ?? key
