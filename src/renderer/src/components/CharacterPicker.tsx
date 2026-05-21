import { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import { CHARACTERS, getCharacter, type Character } from '../lib/characters'
import { api } from '../lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Props = {
  currentId: string
  onSelect: (character: Character) => void
  onClose: () => void
}

export default function CharacterPicker({ currentId, onSelect, onClose }: Props) {
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  async function handleSelect(character: Character) {
    if (character.id === 'custom') {
      setShowCustomInput(true)
      return
    }
    await api.settings.save({
      ...(await api.settings.load()),
      characterId: character.id,
      systemPrompt: character.systemPrompt,
    })
    onSelect(character)
    onClose()
  }

  async function handleCustomSave() {
    const character = getCharacter('custom')
    await api.settings.save({
      ...(await api.settings.load()),
      characterId: 'custom',
      systemPrompt: customPrompt,
      customSystemPrompt: customPrompt,
    })
    onSelect({ ...character, systemPrompt: customPrompt })
    onClose()
  }

  const presetChars = CHARACTERS.filter((c) => c.id !== 'custom')
  const customChar = CHARACTERS.find((c) => c.id === 'custom')!

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden"
        style={{ background: '#0f0e17', border: '1px solid #1f1e2e' }}
      >
        <DialogHeader className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #1f1e2e' }}>
          <DialogTitle className="text-base font-bold" style={{ color: '#e8e6f0' }}>
            {showCustomInput ? '自定义角色' : '选择角色'}
          </DialogTitle>
          <DialogDescription className="text-[12px] mt-0.5" style={{ color: '#5e5b78' }}>
            {showCustomInput ? '描述你想要的角色人设' : '选一个喜欢的角色来陪你聊天'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] p-6">
          {!showCustomInput ? (
            <div className="flex flex-col gap-3">
              {/* Character grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {presetChars.map((char) => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    active={currentId === char.id}
                    onClick={() => handleSelect(char)}
                  />
                ))}
              </div>

              {/* Custom option */}
              <button
                onClick={() => handleSelect(customChar)}
                className="w-full text-left rounded-xl p-3.5 flex items-center gap-3 transition-all"
                style={{
                  background: currentId === 'custom' ? 'rgba(167,139,250,0.08)' : 'transparent',
                  border: `1px dashed ${currentId === 'custom' ? 'rgba(167,139,250,0.4)' : '#2e2c42'}`,
                }}
                onMouseEnter={(e) => { if (currentId !== 'custom') e.currentTarget.style.background = '#16151f' }}
                onMouseLeave={(e) => { if (currentId !== 'custom') e.currentTarget.style.background = 'transparent' }}
              >
                <span className="text-2xl leading-none">{customChar.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#a78bfa' }}>{customChar.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#5e5b78' }}>{customChar.title}</p>
                </div>
                {currentId === 'custom' && <Check size={15} style={{ color: '#a78bfa', flexShrink: 0 }} />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowCustomInput(false)}
                className="flex items-center gap-1.5 text-[13px] transition-colors w-fit"
                style={{ color: '#9b97b4' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#e8e6f0' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9b97b4' }}
              >
                <ChevronLeft size={14} />
                返回角色列表
              </button>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium" style={{ color: '#9b97b4' }}>
                  自定义角色设定
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`描述你想要的角色…\n例如：你是一个温柔的姐姐，说话轻声细语，喜欢用比喻，擅长在别人难过时讲故事来安慰…`}
                  rows={8}
                  className="w-full rounded-xl p-4 text-[13px] leading-relaxed resize-none outline-none transition-colors"
                  style={{
                    background: '#12111a',
                    border: '1px solid #2e2c42',
                    color: '#e8e6f0',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2e2c42' }}
                />
                <p className="text-[11px]" style={{ color: '#3a3852' }}>
                  提示：越具体越好，可以描述说话方式、口头禅、性格特点
                </p>
              </div>
              <button
                onClick={handleCustomSave}
                disabled={!customPrompt.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(to right, #a78bfa, #f472b6)' }}
              >
                使用这个角色
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CharacterCard({
  character, active, onClick,
}: {
  character: Character
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl p-3.5 flex flex-col gap-2.5 transition-all relative"
      style={{
        background: active
          ? `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.bgGradient[1]})`
          : '#0f0e17',
        border: `1px solid ${active ? character.color + '45' : '#1f1e2e'}`,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#16151f'
          e.currentTarget.style.borderColor = '#2e2c42'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#0f0e17'
          e.currentTarget.style.borderColor = '#1f1e2e'
        }
      }}
    >
      {active && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: character.color }}
        >
          <Check size={10} color="#0f0e17" strokeWidth={3} />
        </div>
      )}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{
          background: `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}25)`,
          border: `1px solid ${character.color}25`,
        }}
      >
        {character.emoji}
      </div>

      <div>
        <p className="text-[14px] font-bold" style={{ color: '#e8e6f0' }}>{character.name}</p>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#5e5b78' }}>{character.title}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {character.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-md"
            style={{
              background: `${character.color}18`,
              color: character.color,
              border: `1px solid ${character.color}28`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}
