import { api } from '../lib/api'
import type { Character } from '../lib/characters'

type Props = {
  character: Character
  onSettings: () => void
  onChangeCharacter: () => void
}

export default function TitleBar({ character, onSettings, onChangeCharacter }: Props) {
  return (
    <div className="drag-region" style={{
      height: 44, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 10px',
      flexShrink: 0, borderBottom: '1px solid #1f1e2e',
    }}>
      {/* App identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: `linear-gradient(135deg, #a78bfa, #f472b6)`,
          opacity: 0.9, flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#5e5b78' }}>情感陪伴</span>
      </div>

      {/* Character switcher — center */}
      <button
        className="no-drag"
        onClick={onChangeCharacter}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${character.color}30`,
          borderRadius: 20, padding: '4px 12px 4px 8px',
          cursor: 'pointer', transition: 'all 0.15s',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.borderColor = character.color + '60'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          e.currentTarget.style.borderColor = character.color + '30'
        }}
      >
        <span style={{ fontSize: 14 }}>{character.emoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9b97b4' }}>{character.name}</span>
        <span style={{ fontSize: 10, color: '#3a3852', marginLeft: 2 }}>▾</span>
      </button>

      {/* Right controls */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconBtn onClick={onSettings} title="设置">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </IconBtn>

        <div style={{ width: 1, height: 14, background: '#1f1e2e', margin: '0 4px' }} />

        <IconBtn onClick={() => api.win.minimize()} title="最小化">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </IconBtn>
        <IconBtn onClick={() => api.win.maximize()} title="最大化">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </IconBtn>
        <IconBtn onClick={() => api.win.close()} title="关闭" hoverColor="#f87171" hoverBg="#2d1b1b">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </IconBtn>
      </div>
    </div>
  )
}

function IconBtn({
  onClick, title, children, hoverColor, hoverBg,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  hoverColor?: string
  hoverBg?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 7, border: 'none',
        background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#5e5b78', transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor ?? '#9b97b4'
        e.currentTarget.style.background = hoverBg ?? '#1c1b28'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#5e5b78'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}
