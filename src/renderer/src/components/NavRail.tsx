import { createStyles } from 'antd-style'
import { ActionIcon } from '@lobehub/ui'
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
    padding: 10px 0 12px;
    gap: 2px;
  `,

  logo: css`
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: ${token.colorPrimary};
    flex-shrink: 0;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  /* Wrapper that adds the left-edge active indicator pip */
  activeWrap: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 18px;
      border-radius: 0 2px 2px 0;
      background: ${token.colorPrimary};
    }
  `,

  spacer: css`
    flex: 1;
  `,

  charBtn: css`
    width: 40px;
    height: 40px;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorPrimaryBorder};
    background: ${token.colorPrimaryBg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    transition: background ${token.motionDurationFast} ${token.motionEaseOut},
      border-color ${token.motionDurationFast} ${token.motionEaseOut};
    flex-shrink: 0;
    margin-bottom: 4px;
    outline: none;

    &:hover {
      background: ${token.colorPrimaryBgHover};
      border-color: ${token.colorPrimaryBorderHover};
    }
  `,
}))

type Props = {
  character: Character
  appearance: 'dark' | 'light'
  view: 'chat' | 'diary'
  onViewChange: (v: 'chat' | 'diary') => void
  onSettings: () => void
  onChangeCharacter: () => void
  onToggleTheme: () => void
}

export default function NavRail({ character, appearance, view, onViewChange, onSettings, onChangeCharacter, onToggleTheme }: Props) {
  const { styles, theme: token } = useStyles()

  // logo icon fill: inverse of logo background
  const logoIconFill = appearance === 'dark' ? '#000000' : '#ffffff'

  return (
    <nav className={styles.rail}>
      <div className={styles.logo}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 14c-2.5 0-4.5-1.8-4.5-4.5 0-1.8 1-3 2-4 .3 1 1 1.8 2 2-.2-1.5.5-3 2-4-.2 1.5.5 2.5 1 3.5.5 1 .5 2-.5 3 .8-.3 1.5-1 1.5-2 0 3-1.5 6-3.5 6z" fill={logoIconFill}/>
        </svg>
      </div>

      {/* Chat nav item */}
      <div className={view === 'chat' ? styles.activeWrap : undefined}>
        <ActionIcon
          icon={<MessageSquare size={16} />}
          title="对话"
          active={view === 'chat'}
          onClick={() => onViewChange('chat')}
          size={{ blockSize: 40, borderRadius: 8 }}
        />
      </div>

      {/* Diary nav item */}
      <div className={view === 'diary' ? styles.activeWrap : undefined}>
        <ActionIcon
          icon={<BarChart2 size={16} />}
          title="情绪日记"
          active={view === 'diary'}
          onClick={() => onViewChange('diary')}
          size={{ blockSize: 40, borderRadius: 8 }}
        />
      </div>

      <div className={styles.spacer} />

      {/* Character switcher */}
      <button
        className={styles.charBtn}
        onClick={onChangeCharacter}
        title={`切换角色 · 当前：${character.name}`}
      >
        {character.emoji}
      </button>

      {/* Theme toggle */}
      <ActionIcon
        icon={appearance === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        title={appearance === 'dark' ? '切换亮色' : '切换暗色'}
        onClick={onToggleTheme}
        size={{ blockSize: 40, borderRadius: 8 }}
      />

      {/* Settings */}
      <ActionIcon
        icon={<Settings size={16} />}
        title="设置"
        onClick={onSettings}
        size={{ blockSize: 40, borderRadius: 8 }}
      />
    </nav>
  )
}
