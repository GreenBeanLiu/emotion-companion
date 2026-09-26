import { createStyles } from 'antd-style'
import { ActionIcon } from '@lobehub/ui'
import { Tooltip } from 'antd'
import { MessageSquare, BarChart2, Settings, Sun, Moon } from 'lucide-react'
import type { Character } from '../lib/characters'

const useStyles = createStyles(({ token, css }) => ({
  rail: css`
    width: 64px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${token.colorBgLayout};
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: 6px 0 8px;
    gap: 0;
  `,

  iconBtn: css`
    flex-shrink: 0;
    margin-bottom: 4px;
    color: ${token.colorTextSecondary};
  `,

  spacer: css`
    flex: 1;
  `,

  charBtnWrap: css`
    position: relative;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  charGlow: css`
    position: absolute;
    inset: -6px;
    border-radius: 14px;
    pointer-events: none;
  `,

  charBtn: css`
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    transition: transform ${token.motionDurationFast} ${token.motionEaseOut};
    flex-shrink: 0;
    outline: none;
    border: none;
    background: transparent;
    overflow: hidden;

    &:hover {
      transform: scale(1.05);
    }
  `,

  diaryIconWrap: css`
    position: relative;
    flex-shrink: 0;
    margin-bottom: 4px;
  `,

  diaryDot: css`
    position: absolute;
    top: 2px;
    right: 2px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 1.5px solid ${token.colorBgLayout};
    pointer-events: none;
  `,
}))

type Props = {
  character: Character
  avatars: Record<string, string>
  appearance: 'dark' | 'light'
  view: 'chat' | 'diary'
  onViewChange: (v: 'chat' | 'diary') => void
  onSettings: () => void
  onChangeCharacter: () => void
  onToggleTheme: () => void
  hasMoodData: boolean
}

export default function NavRail({ character, avatars, appearance, view, onViewChange, onSettings, onChangeCharacter, onToggleTheme, hasMoodData }: Props) {
  const { styles } = useStyles()

  return (
    <nav className={styles.rail}>
      <Tooltip title={`切换角色 · ${character.name}`} placement="right">
        <div className={styles.charBtnWrap}>
          <div
            className={styles.charGlow}
            style={{
              background: `radial-gradient(circle, ${character.color}30 0%, transparent 72%)`,
            }}
          />
          <button
            className={styles.charBtn}
            onClick={onChangeCharacter}
            style={{
              background: avatars[character.id] ? 'transparent' : `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}60)`,
              border: `1px solid ${character.color}45`,
              boxShadow: `0 0 0 4px ${character.color}0a`,
            }}
          >
            {avatars[character.id] ? (
              <img
                src={avatars[character.id]}
                alt={character.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              character.emoji
            )}
          </button>
        </div>
      </Tooltip>

      <ActionIcon
        className={styles.iconBtn}
        icon={<MessageSquare size={16} color={view === 'chat' ? character.color : undefined} />}
        title="对话"
        active={view === 'chat'}
        onClick={() => onViewChange('chat')}
        size={{ blockSize: 36, borderRadius: 8 }}
      />

      <div className={styles.diaryIconWrap}>
        <ActionIcon
          icon={<BarChart2 size={16} color={view === 'diary' || hasMoodData ? character.color : undefined} />}
          title="情绪日记"
          active={view === 'diary'}
          onClick={() => onViewChange('diary')}
          size={{ blockSize: 36, borderRadius: 8 }}
        />
        {hasMoodData && view !== 'diary' && (
          <span className={styles.diaryDot} style={{ background: character.color }} />
        )}
      </div>

      <div className={styles.spacer} />

      <ActionIcon
        className={styles.iconBtn}
        icon={appearance === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        title={appearance === 'dark' ? '切换亮色' : '切换暗色'}
        onClick={onToggleTheme}
        size={{ blockSize: 36, borderRadius: 8 }}
      />

      <ActionIcon
        className={styles.iconBtn}
        icon={<Settings size={15} />}
        title="设置"
        onClick={onSettings}
        size={{ blockSize: 36, borderRadius: 8 }}
      />
    </nav>
  )
}
