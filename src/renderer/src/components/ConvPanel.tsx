import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import { Tooltip } from 'antd'
import { SquarePen, Trash2, MoreVertical, MessageSquarePlus, Search } from 'lucide-react'
import { api, type ConversationRow } from '../lib/api'
import type { Character } from '../lib/characters'
import { ScrollArea } from '@/components/ui/scroll-area'

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const useStyles = createStyles(({ token, css }) => ({
  panel: css`
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: ${token.colorBgLayout};
    border-right: 1px solid ${token.colorBorderSecondary};
  `,

  header: css`
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 0 16px;
    flex-shrink: 0;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,

  headerLabel: css`
    font-size: 14px;
    font-weight: 600;
    color: ${token.colorText};
    user-select: none;
  `,

  newBtn: css`
    width: 28px;
    height: 28px;
    border-radius: ${token.borderRadiusSM}px;
    border: none;
    background: transparent;
    color: ${token.colorTextTertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background ${token.motionDurationFast} ${token.motionEaseOut},
      color ${token.motionDurationFast} ${token.motionEaseOut};
    outline: none;

    &:hover {
      background: ${token.colorFill};
      color: ${token.colorText};
    }
  `,

  list: css`
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 6px;
  `,

  searchWrap: css`
    padding: 6px 8px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${token.colorTextTertiary};
  `,

  searchInput: css`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    color: ${token.colorText};
    font-family: ${token.fontFamily};

    &::placeholder {
      color: ${token.colorTextTertiary};
    }
  `,

  emptyHint: css`
    font-size: 13px;
    color: ${token.colorTextTertiary};
    text-align: center;
    margin-top: 48px;
    padding: 0 20px;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  itemWrap: css`
    position: relative;
  `,

  item: css`
    width: 100%;
    text-align: left;
    padding: 8px 36px 8px 12px;
    border-radius: ${token.borderRadius}px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background ${token.motionDurationFast} ${token.motionEaseOut};
    display: block;
    outline: none;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,

  itemActive: css`
    background: ${token.colorFillSecondary} !important;

    .item-title {
      color: ${token.colorText} !important;
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
    line-height: 1.4;
  `,

  itemMeta: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  `,

  moreBtn: css`
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 4px;
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
    right: 4px;
    top: calc(100% - 4px);
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
  character: Character
  onSelect: (conv: ConversationRow) => void
  onNew: () => void
}

export default function ConvPanel({ activeId, refreshKey, character, onSelect, onNew }: Props) {
  const { styles, cx } = useStyles()
  const [convs, setConvs] = useState<ConversationRow[]>([])
  const [menuId, setMenuId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.conv.list().then(setConvs)
  }, [refreshKey])

  useEffect(() => {
    function handleClick() { setMenuId(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const filteredConvs = search.trim()
    ? convs.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : convs

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

      {convs.length > 0 && (
        <div className={styles.searchWrap}>
          <Search size={12} />
          <input
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索对话"
          />
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        {convs.length === 0 && (
          <div className={styles.emptyHint}>
            <MessageSquarePlus size={22} strokeWidth={1.5} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div>还没有对话</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>点击右上角开始</div>
          </div>
        )}
        <div className={styles.list}>
          {filteredConvs.map((conv) => (
            <div key={conv.id} className={cx(styles.itemWrap, 'group')}>
              <button
                onClick={() => onSelect(conv)}
                className={cx(styles.item, activeId === conv.id && styles.itemActive)}
                style={activeId === conv.id ? { borderLeft: `2px solid ${character.color}80`, paddingLeft: 10 } : undefined}
              >
                <p className={cx(styles.itemTitle, 'item-title')}>{conv.title}</p>
                <p className={styles.itemMeta}>
                  {relativeTime(conv.updated_at)}
                  {conv.message_count ? ` · ${conv.message_count} 条` : ''}
                </p>
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
