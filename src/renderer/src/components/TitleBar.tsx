import { createStyles } from 'antd-style'
import { Tooltip } from 'antd'
import { api } from '../lib/api'
import type { Character } from '../lib/characters'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloaded'; version: string }

type Props = {
  character: Character
  convTitle: string | null
  update: UpdateState
  onInstall: () => void
  onDismissUpdate: () => void
}

const useStyles = createStyles(({ token, css }) => ({
  bar: css`
    height: 40px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
    -webkit-app-region: drag;
    user-select: none;
  `,

  railOffset: css`
    width: 64px;
    flex-shrink: 0;
  `,

  charCtx: css`
    width: 240px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 10px 0 16px;
    height: 100%;
    border-right: 1px solid ${token.colorBorderSecondary};
  `,

  charName: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextTertiary};
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  centerZone: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    min-width: 0;
  `,

  convTitle: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextQuaternary};
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  appLabel: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextDisabled};
  `,

  rightZone: css`
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 8px;
    -webkit-app-region: no-drag;
  `,

  updateBadge: css`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px 3px 6px;
    border-radius: ${token.borderRadiusSM}px;
    font-size: 11px;
    margin-right: 4px;
    cursor: pointer;
    transition: opacity ${token.motionDurationFast};

    &:hover {
      opacity: 0.85;
    }
  `,

  updateDot: css`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  `,

  dismissBtn: css`
    background: none;
    border: none;
    color: ${token.colorTextQuaternary};
    cursor: pointer;
    font-size: 13px;
    padding: 0;
    line-height: 1;
    margin-left: 2px;
    -webkit-app-region: no-drag;

    &:hover {
      color: ${token.colorTextSecondary};
    }
  `,

  winBtn: css`
    width: 26px;
    height: 26px;
    border-radius: ${token.borderRadiusSM}px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${token.colorTextDisabled};
    transition: background ${token.motionDurationFast}, color ${token.motionDurationFast};
    outline: none;

    &:hover {
      background: ${token.colorFillSecondary};
      color: ${token.colorTextSecondary};
    }
  `,

  winBtnClose: css`
    &:hover {
      background: ${token.colorErrorBg};
      color: ${token.colorError};
    }
  `,
}))

export default function TitleBar({ character, convTitle, update, onInstall, onDismissUpdate }: Props) {
  const { styles, cx } = useStyles()

  const isDownloaded = update.status === 'downloaded'
  const isAvailable = update.status === 'available'

  return (
    <div className={styles.bar}>
      {/* Spacer aligned with NavRail */}
      <div className={styles.railOffset} />

      {/* Character context — aligned with ConvPanel column */}
      <div className={styles.charCtx}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{character.emoji}</span>
        <span className={styles.charName}>{character.name}</span>
      </div>

      {/* Center: conversation title */}
      <div className={styles.centerZone}>
        {convTitle ? (
          <span className={styles.convTitle}>{convTitle}</span>
        ) : (
          <span className={styles.appLabel}>pulomi</span>
        )}
      </div>

      {/* Right: update badge + window controls */}
      <div className={styles.rightZone}>
        {update.status !== 'idle' && (
          <div
            className={styles.updateBadge}
            style={{
              background: isDownloaded ? 'rgba(74,222,128,0.07)' : 'rgba(212,136,85,0.07)',
              border: `1px solid ${isDownloaded ? 'rgba(74,222,128,0.20)' : 'rgba(212,136,85,0.18)'}`,
              color: isDownloaded ? '#4ade80' : '#d48855',
            }}
            onClick={isDownloaded ? onInstall : undefined}
          >
            <span
              className={styles.updateDot}
              style={{ background: isDownloaded ? '#4ade80' : '#d48855' }}
            />
            <span>
              {isAvailable ? `v${update.version} 下载中` : `v${update.version} 就绪，点击重启`}
            </span>
            {isAvailable && (
              <button
                className={styles.dismissBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onDismissUpdate()
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        <Tooltip title="最小化" placement="bottom">
          <button className={styles.winBtn} onClick={() => api.win.minimize()}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </Tooltip>

        <Tooltip title="最大化" placement="bottom">
          <button className={styles.winBtn} onClick={() => api.win.maximize()}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        </Tooltip>

        <Tooltip title="关闭" placement="bottom">
          <button
            className={cx(styles.winBtn, styles.winBtnClose)}
            onClick={() => api.win.close()}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
