import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import TitleBar from './components/TitleBar'
import NavRail from './components/NavRail'
import ConvPanel from './components/ConvPanel'
import ChatPane from './components/ChatPane'
import DesktopLayoutContainer from './components/DesktopLayoutContainer'
import SettingsModal from './components/SettingsModal'
import CharacterPicker from './components/CharacterPicker'
import { getCharacter, DEFAULT_CHARACTER_ID, type Character } from './lib/characters'
import { api } from './lib/api'
import type { ConversationRow } from './lib/api'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloaded'; version: string }

const useStyles = createStyles(({ token, css }) => ({
  shell: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${token.colorBgLayout};
    /* Reset antd's font injection so our custom font-family from theme takes precedence */
    font-family: ${token.fontFamily};
  `,

  contentRow: css`
    display: flex;
    flex: 1;
    min-height: 0;
  `,
}))

type AppProps = {
  appearance: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function App({ appearance, onToggleTheme }: AppProps) {
  const { styles } = useStyles()

  const [activeConv, setActiveConv] = useState<ConversationRow | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)
  const [character, setCharacter] = useState<Character>(getCharacter(DEFAULT_CHARACTER_ID))
  const [convRefreshKey, setConvRefreshKey] = useState(0)
  const [update, setUpdate] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    api.settings.load().then((s) => {
      setCharacter(getCharacter(s.characterId || DEFAULT_CHARACTER_ID))
    })

    const offAvail = api.update.onAvailable(({ version }) =>
      setUpdate({ status: 'available', version }),
    )
    const offDone = api.update.onDownloaded(({ version }) =>
      setUpdate({ status: 'downloaded', version }),
    )
    return () => {
      offAvail()
      offDone()
    }
  }, [])

  function refreshConvs() {
    setConvRefreshKey((k) => k + 1)
  }

  return (
    <div className={styles.shell}>
      {/* Desktop shell: TitleBar spans full width with column-aligned zones */}
      <TitleBar
        character={character}
        convTitle={activeConv?.title ?? null}
        update={update}
        onInstall={() => api.update.install()}
        onDismissUpdate={() => setUpdate({ status: 'idle' })}
      />

      {/* Content row: NavRail | ConvPanel | ChatPane (container-within-container) */}
      <div className={styles.contentRow}>
        <NavRail
          character={character}
          appearance={appearance}
          onSettings={() => setShowSettings(true)}
          onChangeCharacter={() => setShowCharacterPicker(true)}
          onToggleTheme={onToggleTheme}
        />
        <ConvPanel
          activeId={activeConv?.id ?? null}
          refreshKey={convRefreshKey}
          onSelect={setActiveConv}
          onNew={() => setActiveConv(null)}
        />
        <DesktopLayoutContainer>
          <ChatPane
            conversation={activeConv}
            character={character}
            onConversationCreated={(conv) => {
              setActiveConv(conv)
              refreshConvs()
            }}
            onConversationUpdated={refreshConvs}
          />
        </DesktopLayoutContainer>
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
