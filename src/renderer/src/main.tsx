import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'antd-style'
import { buildEmotionTheme } from './theme'
import { getCharacter, DEFAULT_CHARACTER_ID, type Character } from './lib/characters'
import { api } from './lib/api'
import App from './App'
import './index.css'

function applyAppearance(a: 'dark' | 'light') {
  document.documentElement.setAttribute('data-appearance', a)
  document.documentElement.style.colorScheme = a
}

function Root() {
  const [appearance, setAppearance] = useState<'dark' | 'light'>(() => {
    const saved = (localStorage.getItem('emotion-theme') ?? 'dark') as 'dark' | 'light'
    applyAppearance(saved)
    return saved
  })
  const [character, setCharacter] = useState<Character>(getCharacter(DEFAULT_CHARACTER_ID))

  useEffect(() => {
    api.settings.load().then((s) => {
      setCharacter(getCharacter(s.characterId || DEFAULT_CHARACTER_ID))
    })
  }, [])

  function toggleAppearance() {
    setAppearance((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('emotion-theme', next)
      applyAppearance(next)
      return next
    })
  }

  const theme = useMemo(
    () => buildEmotionTheme(appearance, character.color),
    [appearance, character.color],
  )

  return (
    <ThemeProvider appearance={appearance} theme={theme}>
      <App
        appearance={appearance}
        onToggleTheme={toggleAppearance}
        character={character}
        onCharacterChange={setCharacter}
      />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
