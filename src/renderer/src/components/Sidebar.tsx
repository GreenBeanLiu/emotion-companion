import { useEffect, useState } from 'react'
import { MessageSquarePlus, Settings, ChevronRight, Trash2, MoreVertical } from 'lucide-react'
import { api, type ConversationRow } from '../lib/api'
import type { Character } from '../lib/characters'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    function handleClick() { setMenuId(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    await api.conv.delete(id)
    setConvs((list) => list.filter((c) => c.id !== id))
    setMenuId(null)
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col" style={{ background: '#0d0c15', borderRight: '1px solid #1a1927' }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-6 h-6 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)' }} />
          <span className="text-sm font-bold tracking-wide" style={{ color: '#c4c0d8' }}>情感陪伴</span>
        </div>
        <Button
          onClick={onNew}
          variant="outline"
          className="w-full justify-center gap-2 font-semibold h-9"
          style={{
            background: 'rgba(167,139,250,0.08)',
            borderColor: 'rgba(167,139,250,0.2)',
            color: '#c4b5fd',
          }}
        >
          <MessageSquarePlus size={14} />
          新对话
        </Button>
      </div>

      <Separator style={{ background: '#1a1927' }} />

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2 py-2">
        {convs.length > 0 && (
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5" style={{ color: '#3a3852' }}>
            历史对话
          </p>
        )}
        {convs.length === 0 && (
          <p className="text-xs text-center mt-8 leading-relaxed" style={{ color: '#3a3852' }}>
            还没有对话记录
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {convs.map((conv) => (
            <div key={conv.id} className="relative group">
              <button
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm border-l-2',
                  activeId === conv.id
                    ? 'border-l-[#a78bfa]'
                    : 'border-l-transparent hover:border-l-[#2e2c42]'
                )}
                style={{
                  background: activeId === conv.id ? 'rgba(167,139,250,0.1)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeId !== conv.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (activeId !== conv.id) e.currentTarget.style.background = 'transparent'
                }}
              >
                <p className="truncate font-medium text-[13px]" style={{ color: activeId === conv.id ? '#e8e6f0' : '#9b97b4' }}>
                  {conv.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: '#4a4768' }}>
                  {conv.message_count ?? 0} 条消息
                </p>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setMenuId(menuId === conv.id ? null : conv.id) }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                style={{ color: '#5e5b78' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#9b97b4'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#5e5b78'; e.currentTarget.style.background = 'transparent' }}
              >
                <MoreVertical size={12} />
              </button>

              {menuId === conv.id && (
                <div className="absolute right-2 top-10 z-50 rounded-xl overflow-hidden shadow-2xl" style={{ background: '#1c1b28', border: '1px solid #2a2840' }}>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs w-full transition-colors whitespace-nowrap"
                    style={{ color: '#f87171' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={12} />
                    删除对话
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom */}
      <Separator style={{ background: '#1a1927' }} />
      <div className="p-3 flex flex-col gap-1.5">
        {/* Character switcher */}
        <button
          onClick={onChangeCharacter}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left"
          style={{ border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(167,139,250,0.05)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.05)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)' }}
        >
          <span className="text-xl leading-none">{character.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: '#c4c0d8' }}>{character.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#4a4768' }}>点击切换角色</p>
          </div>
          <ChevronRight size={13} style={{ color: '#4a4768', flexShrink: 0 }} />
        </button>

        {/* Settings */}
        <button
          onClick={onSettings}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = '#2a2840' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1c1b28', border: '1px solid #2a2840' }}>
            <Settings size={14} style={{ color: '#9b97b4' }} />
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#9b97b4' }}>设置</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#4a4768' }}>API Key · 模型</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
