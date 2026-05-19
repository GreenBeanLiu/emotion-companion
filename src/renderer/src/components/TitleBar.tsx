import { api } from '../lib/api'

export default function TitleBar({ onSettings }: { onSettings: () => void }) {
  return (
    <div className="drag-region h-10 flex items-center justify-between px-3 shrink-0 border-b border-[#1f1e2e]">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#f472b6] opacity-90" />
        <span className="text-[13px] font-medium text-[#9b97b4]">情感陪伴</span>
      </div>

      <div className="no-drag flex items-center gap-1">
        <button
          onClick={onSettings}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#5e5b78] hover:text-[#9b97b4] hover:bg-[#1c1b28] transition-colors"
          title="设置"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        <div className="w-px h-4 bg-[#1f1e2e] mx-1" />

        <button
          onClick={() => api.win.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#5e5b78] hover:text-[#9b97b4] hover:bg-[#1c1b28] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={() => api.win.maximize()}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#5e5b78] hover:text-[#9b97b4] hover:bg-[#1c1b28] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </button>
        <button
          onClick={() => api.win.close()}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#5e5b78] hover:text-red-400 hover:bg-[#2d1b1b] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
