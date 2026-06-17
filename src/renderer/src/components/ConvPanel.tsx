import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import { Tooltip } from 'antd'
import { SquarePen, Trash2, MoreVertical, MessageSquarePlus, Search, Pencil, X } from 'lucide-react'
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

function dateBucket(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days < 1) return '今天'
  if (days < 2) return '昨天'
  if (days < 7) return '本周'
  if (days < 30) return '本月'
  return '更早'
}

const BUCKET_ORDER = ['今天', '昨天', '本周', '本月', '更早']

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
    font-size: 13px;
    font-weight: 600;
    color: ${token.colorText};
    user-select: none;
    letter-spacing: -0.01em;
  `,

  newBtn: css`
    width: 30px;
    height: 30px;
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
    padding: 4px;
  `,

  searchWrap: css`
    padding: 7px 8px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${token.colorTextTertiary};
  `,

  searchInner: css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    background: ${token.colorFillTertiary};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusSM}px;
    padding: 4px 8px;
    transition: border-color ${token.motionDurationFast}, background ${token.motionDurationFast};

    &:focus-within {
      border-color: ${token.colorBorder};
      background: ${token.colorFillSecondary};
    }
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
    margin-top: 56px;
    padding: 0 20px;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  `,

  itemWrap: css`
    position: relative;
  `,

  item: css`
    width: 100%;
    text-align: left;
    padding: 8px 28px 8px 12px;
    border-radius: ${token.borderRadius}px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background ${token.motionDurationFast} ${token.motionEaseOut};
    display: block;
    outline: none;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,

  itemActive: css`
    background: ${token.colorFill} !important;

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
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
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
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
    box-shadow: ${token.boxShadow}, 0 0 0 1px ${token.colorBorder};
    background: ${token.colorBgElevated};
  `,

  menuBtn: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 12px;
    width: 100%;
    border: none;
    background: transparent;
    color: ${token.colorTextSecondary};
    cursor: pointer;
    white-space: nowrap;
    transition: background ${token.motionDurationFast};
    outline: none;
    font-family: ${token.fontFamily};

    &:hover {
      background: ${token.colorFillTertiary};
    }
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
    font-family: ${token.fontFamily};

    &:hover {
      background: ${token.colorErrorBg};
    }
  `,

  renameInput: css`
    flex: 1;
    border: none;
    background: ${token.colorFillTertiary};
    border-radius: ${token.borderRadiusSM}px;
    padding: 2px 6px;
    font-size: 13px;
    color: ${token.colorText};
    font-family: ${token.fontFamily};
    outline: 2px solid ${token.colorPrimaryBorder};
    min-width: 0;
  `,

  groupLabel: css`
    font-size: 10px;
    font-weight: 600;
    color: ${token.colorTextTertiary};
    padding: 10px 12px 3px;
    user-select: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
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
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    api.conv.list().then(setConvs)
  }, [refreshKey])

  useEffect(() => {
    function handleClick() { setMenuId(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const isSearching = search.trim() !== ''
  const filteredConvs = isSearching
    ? convs.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : convs

  const grouped: { bucket: string; items: ConversationRow[] }[] = isSearching
    ? [{ bucket: '', items: filteredConvs }]
    : BUCKET_ORDER.reduce<{ bucket: string; items: ConversationRow[] }[]>((acc, bucket) => {
        const items = filteredConvs.filter((c) => dateBucket(c.updated_at) === bucket)
        if (items.length > 0) acc.push({ bucket, items })
        return acc
      }, [])

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    await api.conv.delete(id)
    setConvs((list) => list.filter((c) => c.id !== id))
    setMenuId(null)
  }

  function startRename(e: React.MouseEvent, conv: ConversationRow) {
    e.stopPropagation()
    setMenuId(null)
    setRenamingId(conv.id)
    setRenameValue(conv.title)
  }

  async function commitRename(id: number) {
    const title = renameValue.trim()
    if (title && title !== convs.find((c) => c.id === id)?.title) {
      await api.conv.rename(id, title)
      setConvs((list) => list.map((c) => c.id === id ? { ...c, title } : c))
    }
    setRenamingId(null)
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>对话</span>
        <Tooltip title="新对话 (Ctrl+N)" placement="bottom">
          <button className={styles.newBtn} onClick={onNew}>
            <SquarePen size={13} />
          </button>
        </Tooltip>
      </div>

      {convs.length > 0 && (
        <div className={styles.searchWrap}>
          <div className={styles.searchInner}>
            <Search size={12} style={{ flexShrink: 0 }} />
            <input
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索对话"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                <X size={11} style={{ color: 'var(--ant-color-text-tertiary)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        {convs.length === 0 && (
          <div className={styles.emptyHint}>
            <MessageSquarePlus size={22} strokeWidth={1.5} style={{ marginBottom: 10, opacity: 0.45 }} />
            <div>还没有对话</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>点击右上角开始</div>
          </div>
        )}
        {isSearching && filteredConvs.length === 0 && convs.length > 0 && (
          <div className={styles.emptyHint}>
            <div style={{ opacity: 0.4, marginBottom: 8, fontSize: 18 }}>🔍</div>
            <div>没有找到相关对话</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>换个关键词试试</div>
          </div>
        )}
        <div className={styles.list}>
          {grouped.map(({ bucket, items }, gi) => (
            <div key={bucket}>
              {bucket && <div className={styles.groupLabel} style={gi === 0 ? { paddingTop: 4 } : undefined}>{bucket}</div>}
              {items.map((conv) => (
                <div key={conv.id} className={cx(styles.itemWrap, 'group')}>
                  {renamingId === conv.id ? (
                    <div style={{ padding: '6px 12px' }}>
                      <input
                        autoFocus
                        className={styles.renameInput}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(conv.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelect(conv)}
                      onDoubleClick={(e) => startRename(e, conv)}
                      className={cx(styles.item, activeId === conv.id && styles.itemActive)}
                      style={activeId === conv.id ? { borderLeft: `3px solid ${character.color}`, paddingLeft: 9 } : undefined}
                    >
                      <p className={cx(styles.itemTitle, 'item-title')}>{conv.title}</p>
                      <p className={styles.itemMeta}>
                        {conv.summary ?? relativeTime(conv.updated_at)}
                      </p>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuId(menuId === conv.id ? null : conv.id)
                    }}
                    className={cx(styles.moreBtn, 'hidden group-hover:flex')}
                  >
                    <MoreVertical size={12} />
                  </button>

                  {menuId === conv.id && (
                    <div className={styles.contextMenu}>
                      <button
                        onClick={(e) => startRename(e, conv)}
                        className={styles.menuBtn}
                      >
                        <Pencil size={11} />
                        重命名
                      </button>
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
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
