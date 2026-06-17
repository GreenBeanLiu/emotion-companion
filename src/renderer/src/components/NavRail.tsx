import { createStyles } from 'antd-style'
import { ActionIcon } from '@lobehub/ui'
import { Tooltip } from 'antd'
import { MessageSquare, BarChart2, Settings, Sun, Moon } from 'lucide-react'
import type { Character } from '../lib/characters'

const useStyles = createStyles(({ token, css }) => ({
  rail: css`
    width: 56px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${token.colorBgLayout};
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: 6px 0 8px;
    gap: 0;
  `,

  logo: css`
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: ${token.colorPrimary};
    flex-shrink: 0;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  activeWrap: css`
    position: relative;
    width: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  spacer: css`
    flex: 1;
  `,

  charBtn: css`
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: filter ${token.motionDurationFast} ${token.motionEaseOut},
      transform ${token.motionDurationFast} ${token.motionEaseOut};
    flex-shrink: 0;
    margin-bottom: 4px;
    outline: none;
    border: none;
    background: transparent;

    &:hover {
      filter: brightness(1.1);
    }
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
}

export default function NavRail({ character, avatars, appearance, view, onViewChange, onSettings, onChangeCharacter, onToggleTheme }: Props) {
  const { styles, theme: token } = useStyles()

  const logoIconFill = appearance === 'dark' ? '#000000' : '#ffffff'

  return (
    <nav className={styles.rail}>
      <div className={styles.logo}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 14c-2.5 0-4.5-1.8-4.5-4.5 0-1.8 1-3 2-4 .3 1 1 1.8 2 2-.2-1.5.5-3 2-4-.2 1.5.5 2.5 1 3.5.5 1 .5 2-.5 3 .8-.3 1.5-1 1.5-2 0 3-1.5 6-3.5 6z" fill={logoIconFill}/>
        </svg>
      </div>

      <div className={styles.activeWrap}>
        {view === 'chat' && (
          <span style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: 3, height: 20, borderRadius: '0 2px 2px 0',
            background: character.color,
          }} />
        )}
        <ActionIcon
          icon={<MessageSquare size={16} />}
          title="对话"
          active={view === 'chat'}
          onClick={() => onViewChange('chat')}
          size={{ blockSize: 34, borderRadius: 8 }}
        />
      </div>

      <div className={styles.activeWrap}>
        {view === 'diary' && (
          <span style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: 3, height: 20, borderRadius: '0 2px 2px 0',
            background: character.color,
          }} />
        )}
        <ActionIcon
          icon={<BarChart2 size={16} />}
          title="情绪日记"
          active={view === 'diary'}
          onClick={() => onViewChange('diary')}
          size={{ blockSize: 34, borderRadius: 8 }}
        />
      </div>

      <div className={styles.spacer} />

      <Tooltip title={`切换角色 · ${character.name}`} placement="right">
      <button
        className={styles.charBtn}
        onClick={onChangeCharacter}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: avatars[character.id] ? 'transparent' : `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}60)`,
            border: `1px solid ${character.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            overflow: 'hidden',
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
        </div>
      </button>
      </Tooltip>

      <ActionIcon
        icon={appearance === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        title={appearance === 'dark' ? '切换亮色' : '切换暗色'}
        onClick={onToggleTheme}
        size={{ blockSize: 34, borderRadius: 8 }}
      />

      <ActionIcon
        icon={<Settings size={15} />}
        title="设置"
        onClick={onSettings}
        size={{ blockSize: 34, borderRadius: 8 }}
      />
    </nav>
  )
}
