import { useState } from 'react'
import { CHARACTERS, getCharacter, type Character } from '../lib/characters'
import { api } from '../lib/api'

type Props = {
  currentId: string
  onSelect: (character: Character) => void
  onClose: () => void
}

export default function CharacterPicker({ currentId, onSelect, onClose }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
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
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 680,
        background: '#0f0e17', border: '1px solid #1f1e2e',
        borderRadius: 20, overflow: 'hidden',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1f1e2e',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8e6f0', margin: 0 }}>选择角色</h2>
            <p style={{ fontSize: 12, color: '#5e5b78', margin: '4px 0 0' }}>
              选一个喜欢的角色来陪你聊天
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: '#5e5b78', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Character grid */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {!showCustomInput ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 10,
              }}>
                {presetChars.map((char) => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    active={currentId === char.id}
                    hovered={hovered === char.id}
                    onMouseEnter={() => setHovered(char.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleSelect(char)}
                  />
                ))}
              </div>

              {/* Custom character option */}
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => handleSelect(customChar)}
                  onMouseEnter={() => setHovered('custom')}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: currentId === 'custom' ? 'rgba(167,139,250,0.08)' : hovered === 'custom' ? '#16151f' : 'transparent',
                    border: `1px dashed ${currentId === 'custom' ? 'rgba(167,139,250,0.4)' : '#2e2c42'}`,
                    borderRadius: 12, padding: '12px 16px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{customChar.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa' }}>{customChar.name}</div>
                    <div style={{ fontSize: 12, color: '#5e5b78', marginTop: 2 }}>{customChar.title}</div>
                  </div>
                  {currentId === 'custom' && (
                    <span style={{ marginLeft: 'auto', fontSize: 14, color: '#a78bfa' }}>✓</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Custom prompt editor */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setShowCustomInput(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', color: '#9b97b4',
                  cursor: 'pointer', fontSize: 13, padding: 0,
                }}
              >
                ‹ 返回角色列表
              </button>
              <div>
                <label style={{ fontSize: 13, color: '#9b97b4', display: 'block', marginBottom: 8 }}>
                  自定义角色设定
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="描述你想要的角色…
例如：你是一个温柔的姐姐，说话轻声细语，喜欢用比喻，擅长在别人难过时讲故事来安慰…"
                  rows={8}
                  style={{
                    width: '100%', background: '#12111a',
                    border: '1px solid #2e2c42', borderRadius: 10,
                    padding: '12px 14px', fontSize: 13, color: '#e8e6f0',
                    resize: 'none', outline: 'none', lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: 11, color: '#3a3852', marginTop: 6 }}>
                  提示：越具体越好，可以描述说话方式、口头禅、性格特点
                </p>
              </div>
              <button
                onClick={handleCustomSave}
                disabled={!customPrompt.trim()}
                style={{
                  padding: '12px 0', borderRadius: 12, border: 'none',
                  background: customPrompt.trim()
                    ? 'linear-gradient(to right, #a78bfa, #f472b6)'
                    : '#2e2c42',
                  color: customPrompt.trim() ? 'white' : '#5e5b78',
                  fontSize: 14, fontWeight: 700, cursor: customPrompt.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                使用这个角色
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CharacterCard({
  character, active, hovered, onMouseEnter, onMouseLeave, onClick,
}: {
  character: Character
  active: boolean
  hovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        textAlign: 'left', cursor: 'pointer',
        background: active
          ? `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.bgGradient[1]})`
          : hovered ? '#16151f' : '#0f0e17',
        border: `1px solid ${active ? character.color + '50' : hovered ? '#2e2c42' : '#1f1e2e'}`,
        borderRadius: 14, padding: '14px 14px 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'all 0.15s', position: 'relative',
      }}
    >
      {active && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 18, height: 18, borderRadius: '50%',
          background: character.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: '#0f0e17', fontWeight: 700,
        }}>✓</div>
      )}

      {/* Avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}30)`,
        border: `1px solid ${character.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>
        {character.emoji}
      </div>

      {/* Name & title */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e6f0' }}>{character.name}</div>
        <div style={{ fontSize: 11, color: '#5e5b78', marginTop: 2, lineHeight: 1.4 }}>
          {character.title}
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {character.tags.map((tag) => (
          <span key={tag} style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 5,
            background: `${character.color}18`,
            color: character.color,
            border: `1px solid ${character.color}30`,
          }}>{tag}</span>
        ))}
      </div>
    </button>
  )
}
