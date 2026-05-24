import { createStyles } from 'antd-style'
import { ActionIcon } from '@lobehub/ui'
import { MessageSquare, Settings } from 'lucide-react'
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
    background: linear-gradient(135deg, #d48855, #c05438);
    flex-shrink: 0;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(212,136,85,0.28);
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
  onSettings: () => void
  onChangeCharacter: () => void
}

export default function NavRail({ character, onSettings, onChangeCharacter }: Props) {
  const { styles } = useStyles()

  return (
    <nav className={styles.rail}>
      <div className={styles.logo} />

      {/* Primary nav item — active state + left-edge indicator */}
      <div className={styles.activeWrap}>
        <ActionIcon
          icon={<MessageSquare size={16} />}
          title="对话"
          active
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
