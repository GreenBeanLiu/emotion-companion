import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import TitleBar from './components/TitleBar'
import NavRail from './components/NavRail'
import ConvPanel from './components/ConvPanel'
import ChatPane from './components/ChatPane'
import EmotionDiary from './components/EmotionDiary'
import DesktopLayoutContainer from './components/DesktopLayoutContainer'
import SettingsModal from './components/SettingsModal'
import CharacterPicker from './components/CharacterPicker'
import type { Character } from './lib/characters'
import { api } from './lib/api'
import type { ConversationRow } from './lib/api'
import { getTodayMood, type EmotionStat } from './lib/emotion'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }

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
  character: Character
  onCharacterChange: (character: Character) => void
}

export default function App({ appearance, onToggleTheme, character, onCharacterChange }: AppProps) {
  const { styles } = useStyles()

  const [view, setView] = useState<'chat' | 'diary'>('chat')
  const [activeConv, setActiveConv] = useState<ConversationRow | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)
  const [convRefreshKey, setConvRefreshKey] = useState(0)
  const [update, setUpdate] = useState<UpdateState>({ status: 'idle' })
  const [avatars, setAvatars] = useState<Record<string, string>>({})
  const [emotionStats, setEmotionStats] = useState<EmotionStat[]>([])

  function refreshMood() {
    api.stats.emotions().then(setEmotionStats)
  }

  useEffect(() => {
    api.avatar.getAll().then(setAvatars)
    refreshMood()

    const offAvail = api.update.onAvailable(({ version }) =>
      setUpdate({ status: 'available', version }),
    )
    const offDone = api.update.onDownloaded(({ version }) =>
      setUpdate({ status: 'downloaded', version }),
    )
    const offErr = api.update.onError(({ message }) =>
      setUpdate({ status: 'error', message }),
    )
    const offTitle = api.conv.onTitleUpdated(({ conversationId, title }) => {
      setActiveConv((prev) => prev?.id === conversationId ? { ...prev, title } : prev)
      setConvRefreshKey((k) => k + 1)
    })
    const offEmotion = api.chat.onEmotionUpdate(() => refreshMood())

    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'n') {
        e.preventDefault()
        setView('chat')
        setActiveConv(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      offAvail()
      offDone()
      offErr()
      offTitle()
      offEmotion()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const todayMood = getTodayMood(emotionStats)

  function refreshConvs() {
    setConvRefreshKey((k) => k + 1)
  }

  return (
    <div className={styles.shell}>
      {/* Desktop shell: TitleBar spans full width with column-aligned zones */}
      <TitleBar
        character={character}
        avatars={avatars}
        convTitle={view === 'diary' ? '情绪日记' : (activeConv?.title ?? null)}
        update={update}
        onInstall={() => api.update.install()}
        onDismissUpdate={() => setUpdate({ status: 'idle' })}
        todayMood={view === 'chat' ? todayMood : null}
        onOpenDiary={() => setView('diary')}
      />

      {/* Content row: NavRail | ConvPanel | ChatPane (container-within-container) */}
      <div className={styles.contentRow}>
        <NavRail
          character={character}
          avatars={avatars}
          appearance={appearance}
          view={view}
          onViewChange={setView}
          onSettings={() => setShowSettings(true)}
          onChangeCharacter={() => setShowCharacterPicker(true)}
          onToggleTheme={onToggleTheme}
          hasMoodData={emotionStats.length > 0}
        />
        {view === 'chat' && (
          <>
            <ConvPanel
              activeId={activeConv?.id ?? null}
              refreshKey={convRefreshKey}
              character={character}
              onSelect={setActiveConv}
              onNew={() => setActiveConv(null)}
            />
            <DesktopLayoutContainer>
              <ChatPane
                conversation={activeConv}
                character={character}
                avatars={avatars}
                onConversationCreated={(conv) => {
                  setActiveConv(conv)
                  refreshConvs()
                }}
                onConversationUpdated={refreshConvs}
              />
            </DesktopLayoutContainer>
          </>
        )}
        {view === 'diary' && (
          <div key="diary" style={{ flex: 1, minWidth: 0, animation: 'slide-in-right 0.2s ease-out both' }}>
            <EmotionDiary />
          </div>
        )}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showCharacterPicker && (
        <CharacterPicker
          currentId={character.id}
          avatars={avatars}
          onSelect={onCharacterChange}
          onAvatarsChange={setAvatars}
          onClose={() => setShowCharacterPicker(false)}
        />
      )}
    </div>
  )
}
