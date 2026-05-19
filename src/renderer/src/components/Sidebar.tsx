import { useEffect, useState } from 'react'
import { api, type ConversationRow } from '../lib/api'

type Props = {
  activeId: number | null
  refreshKey: number
  onSelect: (conv: ConversationRow) => void
  onNew: () => void
}

export default function Sidebar({ activeId, refreshKey, onSelect, onNew }: Props) {
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
    <aside className="w-56 shrink-0 flex flex-col border-r border-[#1f1e2e] bg-[#0f0e17]">
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#9b97b4] border border-[#2e2c42] hover:border-[#a78bfa]/40 hover:text-[#a78bfa] hover:bg-[#1c1b28] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新对话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5">
        {convs.length === 0 && (
          <p className="text-center text-[12px] text-[#5e5b78] mt-6 px-4">还没有对话记录</p>
        )}
        {convs.map((conv) => (
          <div key={conv.id} className="relative group">
            <button
              onClick={() => onSelect(conv)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors truncate ${
                activeId === conv.id
                  ? 'bg-[#1c1b28] text-[#e8e6f0]'
                  : 'text-[#9b97b4] hover:bg-[#16151f] hover:text-[#e8e6f0]'
              }`}
            >
              <p className="truncate">{conv.title}</p>
              <p className="text-[11px] text-[#5e5b78] mt-0.5">{conv.message_count ?? 0} 条消息</p>
            </button>

            <button
              onClick={() => setMenuId(menuId === conv.id ? null : conv.id)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-[#5e5b78] hover:text-[#9b97b4] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuId === conv.id && (
              <div className="absolute right-1 top-8 z-50 bg-[#1c1b28] border border-[#2e2c42] rounded-lg shadow-xl overflow-hidden">
                <button
                  onClick={() => handleDelete(conv.id)}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] text-red-400 hover:bg-[#2d1b1b] w-full whitespace-nowrap transition-colors"
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
    </aside>
  )
}
