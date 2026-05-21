import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import ChatPane from './components/ChatPane'
import SettingsModal from './components/SettingsModal'
import CharacterPicker from './components/CharacterPicker'
import { getCharacter, DEFAULT_CHARACTER_ID, type Character } from './lib/characters'
import { api } from './lib/api'
import type { ConversationRow } from './lib/api'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloaded'; version: string }

export default function App() {
  const [activeConv, setActiveConv] = useState<ConversationRow | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)
  const [character, setCharacter] = useState<Character>(getCharacter(DEFAULT_CHARACTER_ID))
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  const [update, setUpdate] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    api.settings.load().then((s) => {
      setCharacter(getCharacter(s.characterId || DEFAULT_CHARACTER_ID))
    })

    const offAvail = api.update.onAvailable(({ version }) =>
      setUpdate({ status: 'available', version })
    )
    const offDone = api.update.onDownloaded(({ version }) =>
      setUpdate({ status: 'downloaded', version })
    )
    return () => { offAvail(); offDone() }
  }, [])

  function refreshSidebar() {
    setSidebarRefreshKey((k) => k + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#12111a' }}>
      <TitleBar />

      {update.status !== 'idle' && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 16px', flexShrink: 0, fontSize: 12,
            background: update.status === 'downloaded' ? 'rgba(74,222,128,0.08)' : 'rgba(167,139,250,0.07)',
            borderBottom: `1px solid ${update.status === 'downloaded' ? 'rgba(74,222,128,0.2)' : 'rgba(167,139,250,0.15)'}`,
            color: update.status === 'downloaded' ? '#4ade80' : '#a78bfa',
          }}
        >
          <span>
            {update.status === 'available'
              ? `✦ 新版本 v${update.version} 正在后台下载…`
              : `✦ v${update.version} 已就绪`}
          </span>
          {update.status === 'downloaded' && (
            <button
              onClick={() => api.update.install()}
              style={{
                padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)',
                color: '#4ade80', cursor: 'pointer',
              }}
            >
              重启安装
            </button>
          )}
          {update.status === 'available' && (
            <button
              onClick={() => setUpdate({ status: 'idle' })}
              style={{ background: 'none', border: 'none', color: '#5e5b78', cursor: 'pointer', fontSize: 14 }}
            >
              ×
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar
          activeId={activeConv?.id ?? null}
          refreshKey={sidebarRefreshKey}
          onSelect={setActiveConv}
          onNew={() => setActiveConv(null)}
          onSettings={() => setShowSettings(true)}
          onChangeCharacter={() => setShowCharacterPicker(true)}
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
