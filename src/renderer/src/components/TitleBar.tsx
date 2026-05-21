import { api } from '../lib/api'

export default function TitleBar() {
  return (
    <div className="drag-region" style={{
      height: 42, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 12px',
      flexShrink: 0, borderBottom: '1px solid #1a1927',
      background: '#0d0c15',
    }}>
      {/* Left: spacer for symmetry */}
      <div style={{ width: 80 }} />

      {/* Center: app name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 5,
          background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#c4c0d8', letterSpacing: '0.04em' }}>
          情感陪伴
        </span>
      </div>

      {/* Right: window controls */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: 2, width: 80, justifyContent: 'flex-end' }}>
        <WinBtn onClick={() => api.win.minimize()} title="最小化">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </WinBtn>
        <WinBtn onClick={() => api.win.maximize()} title="最大化">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </WinBtn>
        <WinBtn onClick={() => api.win.close()} title="关闭" hoverColor="#f87171" hoverBg="rgba(239,68,68,0.15)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </WinBtn>
      </div>
    </div>
  )
}

function WinBtn({ onClick, title, children, hoverColor, hoverBg }: {
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
        width: 26, height: 26, borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#4a4768', transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor ?? '#9b97b4'
        e.currentTarget.style.background = hoverBg ?? 'rgba(255,255,255,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#4a4768'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}
