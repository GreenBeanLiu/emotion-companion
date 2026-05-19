import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import ChatPane from './components/ChatPane'
import SettingsModal from './components/SettingsModal'
import CharacterPicker from './components/CharacterPicker'
import { getCharacter, DEFAULT_CHARACTER_ID, type Character } from './lib/characters'
import { api } from './lib/api'
import type { ConversationRow } from './lib/api'

export default function App() {
  const [activeConv, setActiveConv] = useState<ConversationRow | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)
  const [character, setCharacter] = useState<Character>(getCharacter(DEFAULT_CHARACTER_ID))
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  useEffect(() => {
    api.settings.load().then((s) => {
      setCharacter(getCharacter(s.characterId || DEFAULT_CHARACTER_ID))
    })
  }, [])

  function refreshSidebar() {
    setSidebarRefreshKey((k) => k + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#12111a' }}>
      <TitleBar
        character={character}
        onSettings={() => setShowSettings(true)}
        onChangeCharacter={() => setShowCharacterPicker(true)}
      />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar
          activeId={activeConv?.id ?? null}
          refreshKey={sidebarRefreshKey}
          onSelect={setActiveConv}
          onNew={() => setActiveConv(null)}
          character={character}
        />
        <ChatPane
          conversation={activeConv}
          character={character}
          onConversationCreated={(conv) => {
            setActiveConv(conv)
            refreshSidebar()
          }}
          onConversationUpdated={refreshSidebar}
        />
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showCharacterPicker && (
        <CharacterPicker
          currentId={character.id}
          onSelect={setCharacter}
          onClose={() => setShowCharacterPicker(false)}
        />
      )}
    </div>
  )
}
