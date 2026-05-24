import { useState } from 'react'
import { createStyles } from 'antd-style'
import { Modal, Button } from 'antd'
import { ChevronLeft, Check } from 'lucide-react'
import { CHARACTERS, getCharacter, type Character } from '../lib/characters'
import { api } from '../lib/api'

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const useStyles = createStyles(({ token, css }) => ({
  body: css`
    overflow-y: auto;
    max-height: 68vh;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,

  grid: css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  `,

  card: css`
    text-align: left;
    border-radius: ${token.borderRadiusLG}px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
    transition: border-color ${token.motionDurationFast}, background ${token.motionDurationFast};
    position: relative;
    outline: none;
    font-family: ${token.fontFamily};

    &:hover {
      border-color: ${token.colorBorder};
      background: ${token.colorFill};
    }
  `,

  cardActive: css`
    border-color: var(--char-color-border) !important;
    background: var(--char-color-bg) !important;
  `,

  cardCheckmark: css`
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  cardEmoji: css`
    width: 48px;
    height: 48px;
    border-radius: ${token.borderRadius}px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  `,

  cardName: css`
    font-size: 14px;
    font-weight: 700;
    color: ${token.colorText};
  `,

  cardTitle: css`
    font-size: 11px;
    line-height: 1.5;
    color: ${token.colorTextTertiary};
    margin-top: 2px;
  `,

  tagRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  `,

  tag: css`
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
  `,

  customCard: css`
    width: 100%;
    text-align: left;
    border-radius: ${token.borderRadiusLG}px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    border: 1px dashed ${token.colorBorder};
    background: transparent;
    transition: all ${token.motionDurationFast};
    outline: none;
    font-family: ${token.fontFamily};

    &:hover {
      background: ${token.colorFill};
      border-color: ${token.colorPrimaryBorder};
    }
  `,

  customCardActive: css`
    border-color: ${token.colorPrimaryBorder} !important;
    background: ${token.colorPrimaryBg} !important;
  `,

  customName: css`
    font-size: 13px;
    font-weight: 600;
    color: ${token.colorPrimary};
  `,

  customTitle: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    margin-top: 2px;
  `,

  /* Custom prompt editor */
  backBtn: css`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    background: none;
    border: none;
    cursor: pointer;
    color: ${token.colorTextSecondary};
    transition: color ${token.motionDurationFast};
    padding: 0;
    outline: none;
    font-family: ${token.fontFamily};
    width: fit-content;

    &:hover {
      color: ${token.colorText};
    }
  `,

  promptSection: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  promptLabel: css`
    font-size: 13px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,

  promptTextarea: css`
    width: 100%;
    border-radius: ${token.borderRadius}px;
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorder};
    color: ${token.colorText};
    font-family: ${token.fontFamily};
    outline: none;
    transition: border-color ${token.motionDurationFast};

    &:focus {
      border-color: ${token.colorPrimaryBorder};
    }

    &::placeholder {
      color: ${token.colorTextQuaternary};
    }
  `,

  promptHint: css`
    font-size: 11px;
    color: ${token.colorTextDisabled};
  `,

  footer: css`
    padding: 16px 24px;
    border-top: 1px solid ${token.colorBorderSecondary};
    display: flex;
    justify-content: flex-end;
  `,
}))

/* ─── Component ─────────────────────────────────────────────────────────── */

type Props = {
  currentId: string
  onSelect: (character: Character) => void
  onClose: () => void
}

export default function CharacterPicker({ currentId, onSelect, onClose }: Props) {
  const { styles, cx } = useStyles()
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const presetChars = CHARACTERS.filter((c) => c.id !== 'custom')
  const customChar = CHARACTERS.find((c) => c.id === 'custom')!

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

  return (
    <Modal
      open
      onCancel={onClose}
      title={showCustomInput ? '自定义角色' : '选择角色'}
      footer={null}
      width={600}
      centered
      styles={{ body: { padding: 0 }, header: { padding: '18px 24px 14px', margin: 0 } }}
    >
      {!showCustomInput ? (
        <>
          <div className={styles.body}>
            {/* Preset grid */}
            <div className={styles.grid}>
              {presetChars.map((char) => {
                const isActive = currentId === char.id
                return (
                  <button
                    key={char.id}
                    className={cx(styles.card, isActive && styles.cardActive)}
                    style={
                      isActive
                        ? ({
                            '--char-color-border': char.color + '55',
                            '--char-color-bg': char.bgGradient[0] + '40',
                          } as React.CSSProperties)
                        : undefined
                    }
                    onClick={() => handleSelect(char)}
                  >
                    {isActive && (
                      <div
                        className={styles.cardCheckmark}
                        style={{ background: char.color }}
                      >
                        <Check size={10} color="#0f0e17" strokeWidth={3} />
                      </div>
                    )}
                    <div
                      className={styles.cardEmoji}
                      style={{
                        background: `linear-gradient(135deg, ${char.bgGradient[0]}, ${char.color}25)`,
                        border: `1px solid ${char.color}25`,
                      }}
                    >
                      {char.emoji}
                    </div>
                    <div>
                      <p className={styles.cardName}>{char.name}</p>
                      <p className={styles.cardTitle}>{char.title}</p>
                    </div>
                    <div className={styles.tagRow}>
                      {char.tags.map((tag) => (
                        <span
                          key={tag}
                          className={styles.tag}
                          style={{
                            background: `${char.color}18`,
                            color: char.color,
                            border: `1px solid ${char.color}28`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Custom character option */}
            <button
              className={cx(styles.customCard, currentId === 'custom' && styles.customCardActive)}
              onClick={() => handleSelect(customChar)}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>{customChar.emoji}</span>
              <div style={{ flex: 1 }}>
                <p className={styles.customName}>{customChar.name}</p>
                <p className={styles.customTitle}>{customChar.title}</p>
              </div>
              {currentId === 'custom' && <Check size={15} color="#d48855" />}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.body}>
            <button className={styles.backBtn} onClick={() => setShowCustomInput(false)}>
              <ChevronLeft size={14} />
              返回角色列表
            </button>
            <div className={styles.promptSection}>
              <span className={styles.promptLabel}>自定义角色设定</span>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={8}
                className={styles.promptTextarea}
                placeholder={`描述你想要的角色…\n例如：你是一个温柔的姐姐，说话轻声细语，喜欢用比喻，擅长在别人难过时讲故事来安慰…`}
              />
              <p className={styles.promptHint}>提示：越具体越好，可以描述说话方式、口头禅、性格特点</p>
            </div>
          </div>
          <div className={styles.footer}>
            <Button
              type="primary"
              disabled={!customPrompt.trim()}
              onClick={handleCustomSave}
            >
              使用这个角色
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
