import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import { Tooltip } from 'antd'
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { api, type ConversationRow } from '../lib/api'
import { ScrollArea } from '@/components/ui/scroll-area'

const useStyles = createStyles(({ token, css }) => ({
  panel: css`
    width: 240px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: ${token.colorBgLayout};
    border-right: 1px solid ${token.colorBorderSecondary};
  `,

  header: css`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 0 16px;
    flex-shrink: 0;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,

  headerLabel: css`
    font-size: 11px;
    font-weight: 600;
    color: ${token.colorTextQuaternary};
    letter-spacing: 0.07em;
    text-transform: uppercase;
    user-select: none;
  `,

  newBtn: css`
    width: 26px;
    height: 26px;
    border-radius: ${token.borderRadiusSM}px;
    border: none;
    background: transparent;
    color: ${token.colorTextQuaternary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background ${token.motionDurationFast} ${token.motionEaseOut},
      color ${token.motionDurationFast} ${token.motionEaseOut};
    outline: none;

    &:hover {
      background: ${token.colorPrimaryBg};
      color: ${token.colorPrimary};
    }
  `,

  list: css`
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px;
  `,

  emptyHint: css`
    font-size: 12px;
    color: ${token.colorTextDisabled};
    text-align: center;
    margin-top: 40px;
    line-height: 1.7;
    padding: 0 16px;
    user-select: none;
  `,

  itemWrap: css`
    position: relative;
  `,

  item: css`
    width: 100%;
    text-align: left;
    padding: 8px 32px 8px 12px;
    border-radius: ${token.borderRadius}px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background ${token.motionDurationFast} ${token.motionEaseOut};
    display: block;
    outline: none;

    &:hover {
      background: ${token.colorFill};
    }
  `,

  itemActive: css`
    background: ${token.colorPrimaryBg} !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px ${token.colorBorderSecondary};

    .item-title {
      color: ${token.colorText};
      font-weight: 500;
    }
  `,

  itemTitle: css`
    font-size: 13px;
    font-weight: 400;
    color: ${token.colorTextSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  itemMeta: css`
    font-size: 11px;
    color: ${token.colorTextDisabled};
    margin-top: 2px;
  `,

  moreBtn: css`
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: ${token.colorTextTertiary};
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background ${token.motionDurationFast}, color ${token.motionDurationFast};
    outline: none;

    &:hover {
      background: ${token.colorFillSecondary};
      color: ${token.colorTextSecondary};
    }
  `,

  contextMenu: css`
    position: absolute;
    right: 6px;
    top: 38px;
    z-index: 50;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    box-shadow: ${token.boxShadow}, 0 0 0 1px ${token.colorBorder};
    background: ${token.colorBgElevated};
  `,

  deleteBtn: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 12px;
    width: 100%;
    border: none;
    background: transparent;
    color: ${token.colorError};
    cursor: pointer;
    white-space: nowrap;
    transition: background ${token.motionDurationFast};
    outline: none;

    &:hover {
      background: ${token.colorErrorBg};
    }
  `,
}))

type Props = {
  activeId: number | null
  refreshKey: number
  onSelect: (conv: ConversationRow) => void
  onNew: () => void
}

export default function ConvPanel({ activeId, refreshKey, onSelect, onNew }: Props) {
  const { styles, cx } = useStyles()
  const [convs, setConvs] = useState<ConversationRow[]>([])
  const [menuId, setMenuId] = useState<number | null>(null)

  useEffect(() => {
    api.conv.list().then(setConvs)
  }, [refreshKey])

  useEffect(() => {
    function handleClick() {
      setMenuId(null)
    }
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
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>对话</span>
        <Tooltip title="新对话" placement="right">
          <button className={styles.newBtn} onClick={onNew}>
            <SquarePen size={13} />
          </button>
        </Tooltip>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {convs.length === 0 && (
          <p className={styles.emptyHint}>
            还没有对话
            <br />
            点击上方按钮开始
          </p>
        )}
        <div className={styles.list}>
          {convs.map((conv) => (
            <div key={conv.id} className={cx(styles.itemWrap, 'group')}>
              <button
                onClick={() => onSelect(conv)}
                className={cx(styles.item, activeId === conv.id && styles.itemActive)}
              >
                <p className={cx(styles.itemTitle, 'item-title')}>{conv.title}</p>
                <p className={styles.itemMeta}>{conv.message_count ?? 0} 条消息</p>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuId(menuId === conv.id ? null : conv.id)
                }}
                className={cx(styles.moreBtn, 'hidden group-hover:flex')}
              >
                <MoreVertical size={11} />
              </button>

              {menuId === conv.id && (
                <div className={styles.contextMenu}>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={11} />
                    删除对话
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
