import { useEffect, useState } from 'react'
import { api, type ConversationRow } from '../lib/api'
import type { Character } from '../lib/characters'

type Props = {
  activeId: number | null
  refreshKey: number
  onSelect: (conv: ConversationRow) => void
  onNew: () => void
  onSettings: () => void
  onChangeCharacter: () => void
  character: Character
}

export default function Sidebar({ activeId, refreshKey, onSelect, onNew, onSettings, onChangeCharacter, character }: Props) {
  const [convs, setConvs] = useState<ConversationRow[]>([])
  const [menuId, setMenuId] = useState<number | null>(null)

  useEffect(() => {
    api.conv.list().then(setConvs)
  }, [refreshKey])

  async function handleDelete(id: number) {
    await api.conv.delete(id)
    setConvs((list) => list.filter((c) => c.id !== id))
    setMenuId(null)
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#0d0c15]" style={{ borderRight: '1px solid #1a1927' }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#c4c0d8', letterSpacing: '0.02em' }}>
            情感陪伴
          </span>
        </div>

        <button
          onClick={onNew}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 7, padding: '9px 0', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.2))',
            color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            outline: '1px solid rgba(167,139,250,0.25)', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.35), rgba(244,114,182,0.35))'
            e.currentTarget.style.color = '#e9d5ff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.2))'
            e.currentTarget.style.color = '#c4b5fd'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新对话
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-0.5">
        {convs.length > 0 && (
          <p style={{ fontSize: 10, fontWeight: 600, color: '#3a3852', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px 6px' }}>
            历史对话
          </p>
        )}
        {convs.length === 0 && (
          <p style={{ fontSize: 12, color: '#3a3852', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            还没有对话记录
          </p>
        )}
        {convs.map((conv) => (
          <div key={conv.id} className="relative group">
            <button
              onClick={() => onSelect(conv)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 10px',
                borderRadius: 10, cursor: 'pointer', border: 'none',
                background: activeId === conv.id ? 'rgba(167,139,250,0.12)' : 'transparent',
                borderLeft: activeId === conv.id ? '2px solid #a78bfa' : '2px solid transparent',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => {
                if (activeId !== conv.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                if (activeId !== conv.id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <p style={{
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                color: activeId === conv.id ? '#e8e6f0' : '#9b97b4',
              }}>
                {conv.title}
              </p>
              <p style={{ fontSize: 11, color: '#4a4768', marginTop: 2 }}>
                {conv.message_count ?? 0} 条消息
              </p>
            </button>

            <button
              onClick={() => setMenuId(menuId === conv.id ? null : conv.id)}
              style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                width: 24, height: 24, borderRadius: 6, border: 'none',
                background: 'transparent', color: '#5e5b78', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.12s',
              }}
              className="group-hover:!opacity-100"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuId === conv.id && (
              <div style={{
                position: 'absolute', right: 4, top: 36, zIndex: 50,
                background: '#1c1b28', border: '1px solid #2e2c42',
                borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                <button
                  onClick={() => handleDelete(conv.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', fontSize: 12, color: '#f87171',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap', width: '100%', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                  </svg>
                  删除对话
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom: character + settings */}
      <div style={{ padding: '12px', borderTop: '1px solid #1a1927', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Character switcher */}
        <button
          onClick={onChangeCharacter}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 12, border: '1px solid rgba(167,139,250,0.15)',
            background: 'rgba(167,139,250,0.06)', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(167,139,250,0.12)'
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(167,139,250,0.06)'
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{character.emoji}</span>
          <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#c4c0d8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {character.name}
            </p>
            <p style={{ fontSize: 10, color: '#5e5b78', marginTop: 1 }}>点击切换角色</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5e5b78" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Settings */}
        <button
          onClick={onSettings}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 12, border: '1px solid transparent',
            background: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = '#2e2c42'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: '#1c1b28',
            border: '1px solid #2e2c42', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b97b4" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#9b97b4' }}>设置</p>
            <p style={{ fontSize: 10, color: '#4a4768', marginTop: 1 }}>API Key · 模型选择</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
