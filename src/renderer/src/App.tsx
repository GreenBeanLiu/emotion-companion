import { useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import ChatPane from './components/ChatPane'
import SettingsModal from './components/SettingsModal'
import type { ConversationRow } from './lib/api'

export default function App() {
  const [activeConv, setActiveConv] = useState<ConversationRow | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  function refreshSidebar() {
    setSidebarRefreshKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col h-full bg-[#12111a]">
      <TitleBar onSettings={() => setShowSettings(true)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          activeId={activeConv?.id ?? null}
          refreshKey={sidebarRefreshKey}
          onSelect={setActiveConv}
          onNew={() => setActiveConv(null)}
        />
        <ChatPane
          conversation={activeConv}
          onConversationCreated={(conv) => {
            setActiveConv(conv)
            refreshSidebar()
          }}
          onConversationUpdated={refreshSidebar}
        />
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
