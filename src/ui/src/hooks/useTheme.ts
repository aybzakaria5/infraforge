import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('infraforge-theme')
    return (stored === 'light' ? 'light' : 'dark') as Theme
  })

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    localStorage.setItem('infraforge-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
