import { useEffect, useRef, useState, useCallback } from 'react'
import { createStyles } from 'antd-style'
import { theme } from 'antd'
import { SendHorizontal, User } from 'lucide-react'
import { api, type ConversationRow, type MessageRow, type BilibiliVideo } from '../lib/api'
import type { Character } from '../lib/characters'

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
  `,

  messagesInner: css`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 12px 0 40px;
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
    min-height: 58vh;
    position: relative;
  `,

  charName: css`
    font-size: 20px;
    font-weight: 700;
    color: ${token.colorText};
    margin: 0;
    letter-spacing: -0.02em;
  `,

  charTitle: css`
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    text-align: center;
    max-width: 240px;
  `,

  tagRow: css`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 280px;
  `,

  tag: css`
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 20px;
    font-weight: 500;
  `,

  starterList: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
    max-width: 380px;
  `,

  starterBtn: css`
    text-align: left;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
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
    }
  `,

  msgRow: css`
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 16px 20px 4px;
  `,

  msgRowTight: css`
    padding-top: 4px;
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
    max-width: 72%;
  `,

  avatarSpacer: css`
    flex-shrink: 0;
    width: 32px;
  `,

  msgSenderLabel: css`
    font-size: 12px;
    line-height: 1;
    color: ${token.colorTextDescription};
    margin-bottom: 6px;
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
    border: 1px solid ${token.colorBorder};
    color: ${token.colorText};
  `,

  msgBubbleAssistant: css`
    background: transparent;
    border: none;
    color: ${token.colorText};
    padding: 0;
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
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${token.colorFillSecondary};
    border: 1px solid ${token.colorBorderSecondary};
    color: ${token.colorTextTertiary};
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
    margin-left: 38px;
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
    color: ${token.colorTextDisabled};
  `,

  inputArea: css`
    flex-shrink: 0;
    padding: 10px 20px 16px;
    border-top: 1px solid ${token.colorBorder};
    background: ${token.colorBgBase};
  `,

  inputAreaInner: css`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  `,

  inputBox: css`
    display: flex;
    align-items: flex-end;
    gap: 8px;
    border-radius: ${token.borderRadiusLG}px;
    padding: 10px 14px;
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorder};
    box-shadow: ${token.boxShadowSecondary};
    transition: border-color ${token.motionDurationFast},
      box-shadow ${token.motionDurationFast};

    &:focus-within {
      border-color: ${token.colorPrimaryBorder};
    }
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
    width: 30px;
    height: 30px;
    border-radius: ${token.borderRadiusSM}px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity ${token.motionDurationFast};
    color: white;
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
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<
    Map<number, { keyword: string; videos: BilibiliVideo[] }>
  >(new Map())
  const bottomRef = useRef<HTMLDivElement>(null)
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
    api.msg.list(conversation.id).then(setMessages)
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
      setSending(false)
      onConversationUpdated()
    })
    return () => {
      offChunk()
      offDone()
    }
  }, [onConversationUpdated])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    }
  }, [input, sending, conversation, messages, onConversationCreated])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
      <div className={styles.messages}>
        <div className={styles.messagesInner}>
          {isEmpty && (
            <div className={styles.emptyState}>
              {/* Deep ambient glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `radial-gradient(ellipse 55% 45% at 50% 44%, ${character.color}18 0%, transparent 68%)`,
                }}
              />

              {/* Breathing glow ring */}
              <div
                style={{
                  position: 'absolute',
                  width: 148,
                  height: 148,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${character.color}22 0%, transparent 70%)`,
                  animation: 'lobe-breathe 4s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />

              {/* Floating character avatar */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 32,
                  background: avatars[character.id]
                    ? 'transparent'
                    : `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}55)`,
                  border: avatars[character.id] ? 'none' : `1px solid ${character.color}28`,
                  boxShadow: `0 0 0 6px ${character.color}0a, 0 16px 48px ${character.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 38,
                  position: 'relative',
                  animation: 'lobe-float 5s ease-in-out infinite',
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', alignItems: 'center' }}>
                <p className={styles.charName}>{character.name}</p>
                <p className={styles.charTitle} style={{ color: character.color + 'cc' }}>
                  {character.title}
                </p>
              </div>

              <div className={styles.tagRow} style={{ position: 'relative' }}>
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

              <div className={styles.starterList} style={{ position: 'relative' }}>
                {['今天心情有点低落…', '最近压力好大', '想分享一件开心的事', '感觉很孤独'].map(
                  (s) => (
                    <button
                      key={s}
                      className={styles.starterBtn}
                      onClick={() => {
                        setInput(s)
                        inputRef.current?.focus()
                      }}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const msgId = 'id' in msg ? msg.id : undefined
            const rec = msgId ? recommendations.get(msgId) : undefined
            const prevMsg = i > 0 ? messages[i - 1] : null
            const isTight = prevMsg !== null && prevMsg.role === msg.role
            return (
              <div key={msgId ?? `stream-${i}`}>
                <MessageBubble msg={msg} character={character} avatarUrl={avatars[character.id]} styles={styles} cx={cx} tight={isTight} />
                {rec && (
                  <VideoStrip keyword={rec.keyword} videos={rec.videos} styles={styles} />
                )}
              </div>
            )
          })}

          {sending && !messages.some((m) => 'streaming' in m) && (
            <div className={styles.msgRow}>
              <CharAvatar character={character} />
              <div className={styles.typingBubble}>
                {[0, 120, 240].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: '#aaaaaa', animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <div className={styles.inputAreaInner}>
          <div className={styles.inputBox}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="说说你的心情…"
              rows={1}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
              className={styles.inputTextarea}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className={styles.sendBtn}
              style={{
                background: input.trim() && !sending ? token.colorPrimary : token.colorFillTertiary,
                color: input.trim() && !sending ? token.colorBgLayout : token.colorTextQuaternary,
              }}
            >
              <SendHorizontal size={14} />
            </button>
          </div>
          <p className={styles.inputHint}>Enter 发送 · Shift+Enter 换行</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function CharAvatar({ character, avatarUrl }: { character: Character; avatarUrl?: string }) {
  const { token } = theme.useToken()
  return (
    <div
      style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: avatarUrl ? 'transparent' : token.colorFillSecondary,
        border: avatarUrl ? 'none' : `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
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
}: {
  msg: DisplayMsg
  character: Character
  avatarUrl?: string
  styles: StylesType
  cx: CxType
  tight?: boolean
}) {
  const isUser = msg.role === 'user'
  const isStreaming = 'streaming' in msg
  const emotion = !isStreaming && isUser ? (msg as MessageRow).emotion : undefined
  const emotionMeta = emotion ? EMOTION_META[emotion] : undefined

  return (
    <div className={cx(styles.msgRow, isUser && styles.msgRowUser, tight && styles.msgRowTight)}>
      {isUser ? (
        tight ? <div className={styles.avatarSpacer} /> : (
          <div className={styles.userAvatar}>
            <User size={12} strokeWidth={2.5} />
          </div>
        )
      ) : (
        tight ? <div className={styles.avatarSpacer} /> : (
          <CharAvatar character={character} avatarUrl={avatarUrl} />
        )
      )}

      <div className={cx(styles.msgContent, isUser && styles.msgContentUser)}>
        {!isUser && !tight && (
          <span className={styles.msgSenderLabel} style={{ color: character.color + 'bb' }}>
            {avatarUrl ? '' : character.emoji + ' '}{character.name}
          </span>
        )}

        <div
          className={cx(
            styles.msgBubble,
            isUser ? styles.msgBubbleUser : styles.msgBubbleAssistant,
            /* streaming cursor via Tailwind — kept as utility class */
            isStreaming
              ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-[#aaaaaa]'
              : '',
          )}
        >
          {msg.content}
        </div>

        {emotionMeta && (
          <span className={styles.emotionTag} style={{ color: emotionMeta.color }}>
            <span>{emotionMeta.emoji}</span>
            <span>{emotion}</span>
          </span>
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
