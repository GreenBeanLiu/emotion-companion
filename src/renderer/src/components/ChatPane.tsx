import { useEffect, useRef, useState, useCallback } from 'react'
import { createStyles } from 'antd-style'
import { Markdown } from '@lobehub/ui'
import { SendHorizontal, Copy, Check, ArrowDown, RotateCcw, Pencil, Square } from 'lucide-react'
import { api, type ConversationRow, type MessageRow, type BilibiliVideo } from '../lib/api'
import type { Character } from '../lib/characters'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateSeparator(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y === now.getFullYear() ? `${m}月${day}日` : `${y}年${m}月${day}日`
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

const EMOTION_META: Record<string, { emoji: string; color: string }> = {
  开心: { emoji: '😊', color: '#4ade80' },
  平静: { emoji: '😌', color: '#60a5fa' },
  焦虑: { emoji: '😰', color: '#fb923c' },
  悲伤: { emoji: '😢', color: '#818cf8' },
  愤怒: { emoji: '😤', color: '#f87171' },
  疲惫: { emoji: '😩', color: '#94a3b8' },
  孤独: { emoji: '🥺', color: '#c084fc' },
}

type StreamingMsg = { role: 'assistant'; content: string; streaming: true }
type DisplayMsg = MessageRow | StreamingMsg

type Props = {
  conversation: ConversationRow | null
  character: Character
  avatars: Record<string, string>
  onConversationCreated: (conv: ConversationRow) => void
  onConversationUpdated: () => void
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const useStyles = createStyles(({ token, css }) => ({
  pane: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: ${token.colorBgBase};
  `,

  /* Error banner */
  errorBanner: css`
    flex-shrink: 0;
    margin: 12px 16px 0;
    padding: 8px 14px;
    border-radius: ${token.borderRadius}px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${token.colorErrorBg};
    border: 1px solid ${token.colorErrorBorder};
    color: ${token.colorError};
    animation: slide-in-down 0.18s ease-out both;
  `,

  errorDismiss: css`
    background: none;
    border: none;
    color: ${token.colorError};
    cursor: pointer;
    opacity: 0.6;
    flex-shrink: 0;
    font-size: 14px;
    padding: 0;
    transition: opacity ${token.motionDurationFast};
    &:hover { opacity: 1; }
  `,

  /* Messages scroll container */
  messages: css`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  `,

  messagesTransition: css`
    animation: msg-in 0.18s ease-out both;
  `,

  messagesInner: css`
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding: 24px 0 36px;
    display: flex;
    flex-direction: column;
    flex: 1;
  `,

  /* Empty state */
  emptyState: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    text-align: center;
    position: relative;
  `,

  charName: css`
    font-size: 22px;
    font-weight: 600;
    color: ${token.colorText};
    margin: 0;
    letter-spacing: -0.02em;
  `,

  charTitle: css`
    font-size: 13px;
    line-height: 1.6;
    margin: 0;
    text-align: center;
    max-width: 300px;
    color: ${token.colorTextSecondary};
  `,

  tagRow: css`
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 300px;
  `,

  tag: css`
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
    letter-spacing: 0.01em;
  `,

  starterList: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 8px;
    width: 100%;
    max-width: 400px;
  `,

  starterBtn: css`
    text-align: left;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
    background: ${token.colorFillTertiary};
    color: ${token.colorTextSecondary};
    cursor: pointer;
    transition: border-color ${token.motionDurationFast},
      color ${token.motionDurationFast},
      background ${token.motionDurationFast};
    width: 100%;
    outline: none;
    font-family: ${token.fontFamily};
    line-height: 1.4;

    &:hover {
      border-color: ${token.colorBorder};
      background: ${token.colorFillSecondary};
      color: ${token.colorText};
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
  `,

  msgRow: css`
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 10px 20px 4px;
    animation: msg-in 0.2s ease-out both;

    &:hover .msg-actions {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  msgRowTight: css`
    padding-top: 2px;
    animation: none;
  `,

  msgRowUser: css`
    flex-direction: row-reverse;
  `,

  msgContent: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 100%;
    flex: 1;
    min-width: 0;
  `,

  msgContentUser: css`
    align-items: flex-end;
    max-width: 68%;
  `,

  avatarSpacer: css`
    flex-shrink: 0;
    width: 36px;
  `,

  msgSenderLabel: css`
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: ${token.colorTextDescription};
    margin-bottom: 3px;
  `,

  msgBubble: css`
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-words;
    border-radius: ${token.borderRadiusLG}px;
    font-family: ${token.fontFamily};
  `,

  msgBubbleUser: css`
    background: ${token.colorFill};
    color: ${token.colorText};
    padding: 10px 14px;
  `,

  msgBubbleAssistant: css`
    background: transparent;
    border: none;
    color: ${token.colorText};
    padding: 0;
    white-space: normal;
  `,

  dateSeparator: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px 4px;
    user-select: none;

    &::before, &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: ${token.colorBorder};
    }
  `,

  dateSeparatorText: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    white-space: nowrap;
    font-weight: 500;
    letter-spacing: 0.03em;
  `,

  msgTimestamp: css`
    font-size: 10px;
    color: ${token.colorTextQuaternary};
    user-select: none;
    line-height: 24px;
  `,

  msgActions: css`
    display: flex;
    align-items: center;
    gap: 2px;
    margin-top: 2px;
    opacity: 0;
    transform: translateY(3px);
    transition: opacity ${token.motionDurationMid}, transform ${token.motionDurationMid};
  `,

  msgActionBtn: css`
    width: 24px;
    height: 24px;
    border-radius: ${token.borderRadiusSM}px;
    border: none;
    background: transparent;
    color: ${token.colorTextTertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color ${token.motionDurationFast}, background ${token.motionDurationFast};
    outline: none;

    &:hover {
      color: ${token.colorText};
      background: ${token.colorFillSecondary};
    }
  `,

  emotionTag: css`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    opacity: 0.6;
  `,

  userAvatar: css`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    user-select: none;
    letter-spacing: 0;
  `,

  /* Typing indicator */
  typingBubble: css`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 0;
  `,

  /* Bilibili video strip */
  videoStrip: css`
    margin-top: 8px;
    margin-left: 48px;
    padding: 0 20px;
  `,

  videoHint: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    margin-bottom: 8px;
  `,

  videoScroll: css`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  `,

  videoCard: css`
    flex-shrink: 0;
    width: 160px;
    text-align: left;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    border: 1px solid ${token.colorBorder};
    background: ${token.colorBgContainer};
    cursor: pointer;
    transition: border-color ${token.motionDurationFast},
      background ${token.motionDurationFast};
    outline: none;

    &:hover {
      border-color: ${token.colorPrimaryBorder};
      background: ${token.colorBgElevated};
    }
  `,

  videoInfo: css`
    padding: 6px 8px 8px;
  `,

  videoTitle: css`
    font-size: 11px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: ${token.colorTextSecondary};
  `,

  videoMeta: css`
    font-size: 10px;
    color: ${token.colorTextTertiary};
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,

  videoNocover: css`
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    background: ${token.colorBgLayout};
    color: ${token.colorTextTertiary};
  `,

  inputArea: css`
    flex-shrink: 0;
    padding: 12px 20px 20px;
    background: ${token.colorBgBase};
  `,

  inputAreaInner: css`
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  `,

  inputBox: css`
    display: flex;
    align-items: flex-end;
    gap: 8px;
    border-radius: 16px;
    padding: 10px 14px;
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorder};
    box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
    transition: border-color ${token.motionDurationFast},
      box-shadow ${token.motionDurationFast};
  `,

  inputTextarea: css`
    flex: 1;
    resize: none;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: ${token.colorText};
    font-family: ${token.fontFamily};
    line-height: 1.6;
    max-height: 160px;
    overflow-y: auto;
    padding: 0;

    &::placeholder {
      color: ${token.colorTextTertiary};
    }

    &:disabled {
      cursor: not-allowed;
    }
  `,

  sendBtn: css`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background ${token.motionDurationFast}, color ${token.motionDurationFast}, opacity ${token.motionDurationFast};
    outline: none;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.35;
    }
  `,

  inputHint: css`
    text-align: center;
    font-size: 11px;
    color: ${token.colorTextTertiary};
    margin-top: 6px;
    user-select: none;
    letter-spacing: 0.01em;
  `,

  scrollBottomBtn: css`
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid ${token.colorBorder};
    background: ${token.colorBgElevated};
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
    transition: background ${token.motionDurationFast}, color ${token.motionDurationFast};
    outline: none;
    z-index: 10;
    animation: slide-in-down 0.15s ease-out both;

    &:hover {
      background: ${token.colorFill};
      color: ${token.colorText};
    }
  `,

  kbdKey: css`
    display: inline-flex;
    align-items: center;
    padding: 0 5px;
    border-radius: 4px;
    border: 1px solid ${token.colorBorder};
    background: ${token.colorFillTertiary};
    font-size: 10px;
    height: 16px;
    font-family: ${token.fontFamily};
    color: ${token.colorTextTertiary};
    vertical-align: middle;
    letter-spacing: 0.01em;
  `,
}))

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function ChatPane({
  conversation,
  character,
  avatars,
  onConversationCreated,
  onConversationUpdated,
}: Props) {
  const { styles, cx, theme: token } = useStyles()
  const [messages, setMessages] = useState<DisplayMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<
    Map<number, { keyword: string; videos: BilibiliVideo[] }>
  >(new Map())
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const convIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!conversation) {
      setMessages([])
      setRecommendations(new Map())
      convIdRef.current = null
      return
    }
    convIdRef.current = conversation.id
    api.msg.list(conversation.id).then((msgs) => {
      setMessages(msgs)
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant' })
      })
    })
  }, [conversation?.id])

  useEffect(() => {
    const off = api.chat.onEmotionUpdate(({ messageId, emotion }) => {
      setMessages((prev) =>
        prev.map((m) => ('id' in m && m.id === messageId ? { ...m, emotion } : m)),
      )
    })
    return off
  }, [])

  useEffect(() => {
    const off = api.chat.onBilibiliResults(({ messageId, keyword, videos }) => {
      setRecommendations((prev) => new Map(prev).set(messageId, { keyword, videos }))
    })
    return off
  }, [])

  useEffect(() => {
    const offChunk = api.chat.onChunk(({ conversationId, chunk }) => {
      if (conversationId !== convIdRef.current) return
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && 'streaming' in last) {
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }]
        }
        return [...prev, { role: 'assistant', content: chunk, streaming: true }]
      })
    })
    const offDone = api.chat.onDone(({ conversationId }) => {
      if (conversationId !== convIdRef.current) return
      api.msg.list(conversationId).then((msgs) => {
        if (conversationId === convIdRef.current) setMessages(msgs)
      })
      setSending(false)
      onConversationUpdated()
    })
    return () => {
      offChunk()
      offDone()
    }
  }, [onConversationUpdated])

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom || sending) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, sending])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setError(null)
    setSending(true)

    let convId = conversation?.id ?? null

    if (!convId) {
      const newConv = await api.conv.create(text.slice(0, 20))
      convId = newConv.id
      convIdRef.current = convId
      onConversationCreated(newConv)
    }

    const optimisticUser: DisplayMsg = {
      id: -Date.now(),
      conversation_id: convId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUser])

    const history = messages
      .filter((m): m is MessageRow => !('streaming' in m))
      .map((m) => ({ role: m.role, content: m.content }))

    const result = await api.chat.send({ conversationId: convId, content: text, history })

    if (result.error) {
      setMessages((prev) => prev.filter((m) => m !== optimisticUser))
      setError(result.error)
      setSending(false)
    } else if (result.aborted) {
      api.msg.list(convId).then(setMessages)
      setSending(false)
    }
  }, [input, sending, conversation, messages, onConversationCreated])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleRegenerate = useCallback(async (msgIndex: number) => {
    if (sending || !conversation) return
    const assistantMsg = messages[msgIndex]
    if (!assistantMsg || assistantMsg.role !== 'assistant' || !('id' in assistantMsg)) return
    let userMsgIdx = msgIndex - 1
    while (userMsgIdx >= 0 && messages[userMsgIdx].role !== 'user') userMsgIdx--
    if (userMsgIdx < 0) return
    const userMsg = messages[userMsgIdx] as MessageRow
    const userContent = userMsg.content
    await api.msg.deleteFrom(conversation.id, userMsg.id)
    const historySlice = messages.slice(0, userMsgIdx)
    setMessages(historySlice)
    setError(null)
    setSending(true)
    const history = historySlice
      .filter((m): m is MessageRow => !('streaming' in m))
      .map((m) => ({ role: m.role, content: m.content }))
    const optimistic: DisplayMsg = {
      id: -Date.now(), conversation_id: conversation.id, role: 'user',
      content: userContent, created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    const result = await api.chat.send({ conversationId: conversation.id, content: userContent, history })
    if (result.error) {
      setMessages((prev) => prev.filter((m) => m !== optimistic))
      setError(result.error)
      setSending(false)
    } else if (result.aborted) {
      api.msg.list(conversation.id).then(setMessages)
      setSending(false)
    }
  }, [sending, conversation, messages])

  const handleEdit = useCallback(async (msgIndex: number) => {
    if (sending || !conversation) return
    const userMsg = messages[msgIndex]
    if (!userMsg || userMsg.role !== 'user' || !('id' in userMsg)) return
    await api.msg.deleteFrom(conversation.id, (userMsg as MessageRow).id)
    setMessages((prev) => prev.slice(0, msgIndex))
    setInput(userMsg.content)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [sending, conversation, messages])

  const isEmpty = messages.length === 0

  return (
    <div className={styles.pane}>
      {/* Error banner */}
      {error && (
        <div className={styles.errorBanner}>
          <span style={{ flex: 1 }}>{error}</span>
          <button className={styles.errorDismiss} onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        className={styles.messages}
        ref={messagesRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200)
        }}
      >
        <div className={cx(styles.messagesInner, styles.messagesTransition)} key={conversation?.id ?? 'empty'}>
          {isEmpty && (
            <div className={styles.emptyState}>
              {/* Deep ambient glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `radial-gradient(ellipse 60% 50% at 50% 44%, ${character.color}20 0%, ${character.color}08 40%, transparent 70%)`,
                }}
              />

              {/* Avatar + glow ring wrapper */}
              <div
                style={{
                  position: 'relative',
                  width: 136,
                  height: 136,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'lobe-float 5s ease-in-out infinite',
                }}
              >
                {/* Breathing glow ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${character.color}28 0%, transparent 70%)`,
                    animation: 'lobe-breathe 4s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
                {/* Floating character avatar */}
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 28,
                    background: avatars[character.id]
                      ? 'transparent'
                      : `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}55)`,
                    border: avatars[character.id] ? 'none' : `1px solid ${character.color}28`,
                    boxShadow: `0 0 0 6px ${character.color}0a, 0 16px 48px ${character.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    position: 'relative',
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
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', alignItems: 'center' }}>
                <p className={styles.charName}>{character.name}</p>
                <p className={styles.charTitle} style={{ color: character.color + 'cc' }}>
                  {character.title}
                </p>
                <div className={styles.tagRow} style={{ marginTop: 2 }}>
                  {character.tags.map((tag) => (
                    <span
                      key={tag}
                      className={styles.tag}
                      style={{
                        background: `${character.color}15`,
                        color: character.color,
                        border: `1px solid ${character.color}30`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.starterList}>
                {character.starters.map((s) => (
                  <button
                    key={s}
                    className={styles.starterBtn}
                    style={{ borderLeftColor: character.color + '70', borderLeftWidth: 2 }}
                    onClick={() => {
                      setInput(s)
                      inputRef.current?.focus()
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const msgId = 'id' in msg ? msg.id : undefined
            const rec = msgId ? recommendations.get(msgId) : undefined
            const prevMsg = i > 0 ? messages[i - 1] : null
            const isTight = prevMsg !== null && prevMsg.role === msg.role
            const showDate = 'created_at' in msg && (
              i === 0 ||
              !('created_at' in messages[i - 1]) ||
              !isSameDay(msg.created_at, (messages[i - 1] as MessageRow).created_at)
            )
            return (
              <div key={msgId ?? `stream-${i}`}>
                {'created_at' in msg && showDate && (
                  <div className={styles.dateSeparator}>
                    <span className={styles.dateSeparatorText}>
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  msg={msg}
                  character={character}
                  avatarUrl={avatars[character.id]}
                  styles={styles}
                  cx={cx}
                  tight={isTight && !showDate}
                  isLast={i === messages.length - 1}
                  onRegenerate={msg.role === 'assistant' ? () => handleRegenerate(i) : undefined}
                  onEdit={msg.role === 'user' ? () => handleEdit(i) : undefined}
                />
                {rec && (
                  <VideoStrip keyword={rec.keyword} videos={rec.videos} styles={styles} />
                )}
              </div>
            )
          })}

          {sending && !messages.some((m) => 'streaming' in m) && (
            <div className={styles.msgRow}>
              <CharAvatar character={character} avatarUrl={avatars[character.id]} />
              <div className={styles.typingBubble}>
                {[0, 160, 320].map((delay) => (
                  <span
                    key={delay}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      display: 'inline-block',
                      backgroundColor: character.color,
                      animation: `typing-dot 1.4s ease-in-out infinite`,
                      animationDelay: `${delay}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        pointerEvents: 'none',
        background: `linear-gradient(to bottom, transparent, ${token.colorBgBase})`,
      }} />

      {showScrollBtn && (
        <button
          className={styles.scrollBottomBtn}
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          title="滚动到底部"
        >
          <ArrowDown size={14} />
        </button>
      )}
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <div className={styles.inputAreaInner}>
          <div
            className={styles.inputBox}
            style={inputFocused ? { borderColor: character.color + '60', boxShadow: `0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06), 0 0 0 3px ${character.color}1c` } : undefined}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={`和${character.name}说说你的心情…`}
              rows={1}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
              className={styles.inputTextarea}
              disabled={sending}
            />
            {sending ? (
              <button
                onClick={() => conversation && api.chat.abort(conversation.id)}
                className={styles.sendBtn}
                style={{ background: token.colorFill, color: token.colorTextSecondary }}
                title="停止生成"
              >
                <Square size={12} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={styles.sendBtn}
                style={{
                  background: input.trim() ? character.color : token.colorFillSecondary,
                  color: input.trim() ? '#ffffff' : token.colorTextTertiary,
                }}
              >
                <SendHorizontal size={14} />
              </button>
            )}
          </div>
          <p className={styles.inputHint}>
            <span className={styles.kbdKey}>Enter</span>
            {' '}发送
            <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
            <span className={styles.kbdKey}>Shift+Enter</span>
            {' '}换行
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function CharAvatar({ character, avatarUrl }: { character: Character; avatarUrl?: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 36,
        height: 36,
        borderRadius: 10,
        background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}60)`,
        border: avatarUrl ? 'none' : `1px solid ${character.color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17,
        overflow: 'hidden',
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        character.emoji
      )}
    </div>
  )
}

type StylesType = ReturnType<typeof useStyles>['styles']
type CxType = ReturnType<typeof useStyles>['cx']

function MessageBubble({
  msg,
  character,
  avatarUrl,
  styles,
  cx,
  tight,
  isLast,
  onRegenerate,
  onEdit,
}: {
  msg: DisplayMsg
  character: Character
  avatarUrl?: string
  styles: StylesType
  cx: CxType
  tight?: boolean
  isLast?: boolean
  onRegenerate?: () => void
  onEdit?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'
  const isStreaming = 'streaming' in msg
  const emotion = !isStreaming && isUser ? (msg as MessageRow).emotion : undefined
  const emotionMeta = emotion ? EMOTION_META[emotion] : undefined

  function handleCopy() {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className={cx(styles.msgRow, isUser && styles.msgRowUser, tight && styles.msgRowTight)}>
      {isUser ? (
        tight ? <div className={styles.avatarSpacer} /> : (
          <div className={styles.userAvatar}>我</div>
        )
      ) : (
        tight ? <div className={styles.avatarSpacer} /> : (
          <CharAvatar character={character} avatarUrl={avatarUrl} />
        )
      )}

      <div className={cx(styles.msgContent, isUser && styles.msgContentUser)}>
        {!isUser && !tight && (
          <span className={styles.msgSenderLabel} style={{ color: character.color + 'bb' }}>
            {character.name}
          </span>
        )}

        <div
          className={cx(
            styles.msgBubble,
            isUser ? styles.msgBubbleUser : styles.msgBubbleAssistant,
          )}
        >
          {isUser ? (
            msg.content
          ) : isStreaming ? (
            <span style={{ fontSize: 14, lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {msg.content}
              <span style={{ color: character.color, marginLeft: 1, animation: 'cursor-blink 1s step-start infinite', display: 'inline-block', lineHeight: 1 }}>▋</span>
            </span>
          ) : msg.content ? (
            <Markdown
              variant="chat"
              fontSize={14}
              style={{ margin: 0 }}
              enableLatex={false}
              enableMermaid={false}
              enableImageGallery={false}
            >
              {msg.content}
            </Markdown>
          ) : null}
        </div>

        {emotionMeta && (
          <span className={styles.emotionTag} style={{ color: emotionMeta.color }}>
            <span>{emotionMeta.emoji}</span>
            <span>{emotion}</span>
          </span>
        )}

        {!isStreaming && (
          <div className={`${styles.msgActions} msg-actions`}>
            {'created_at' in msg && (
              <span className={styles.msgTimestamp} style={{ opacity: 'inherit', marginRight: 2 }}>
                {formatTime((msg as MessageRow).created_at)}
              </span>
            )}
            <button className={styles.msgActionBtn} onClick={handleCopy} title="复制">
              {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
            </button>
            {onEdit && (
              <button className={styles.msgActionBtn} onClick={onEdit} title="编辑">
                <Pencil size={12} />
              </button>
            )}
            {onRegenerate && isLast && (
              <button className={styles.msgActionBtn} onClick={onRegenerate} title="重新生成">
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function VideoStrip({
  keyword,
  videos,
  styles,
}: {
  keyword: string
  videos: BilibiliVideo[]
  styles: StylesType
}) {
  function formatPlay(n: number): string {
    return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n)
  }

  return (
    <div className={styles.videoStrip}>
      <p className={styles.videoHint}>
        💡 为你找了一些 <span style={{ color: 'var(--ant-color-text-secondary)' }}>{keyword}</span> 的视频
      </p>
      <div className={styles.videoScroll}>
        {videos.map((v) => (
          <button
            key={v.bvid}
            className={styles.videoCard}
            onClick={() => window.open(`https://www.bilibili.com/video/${v.bvid}`, '_blank')}
          >
            {v.cover ? (
              <img src={v.cover} alt={v.title} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div className={styles.videoNocover}>暂无封面</div>
            )}
            <div className={styles.videoInfo}>
              <p className={styles.videoTitle}>{v.title}</p>
              <p className={styles.videoMeta}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                  {v.author}
                </span>
                <span>{formatPlay(v.play)}播放</span>
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
