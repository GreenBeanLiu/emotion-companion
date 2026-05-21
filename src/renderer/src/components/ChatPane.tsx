import { useEffect, useRef, useState, useCallback } from 'react'
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
  onConversationCreated: (conv: ConversationRow) => void
  onConversationUpdated: () => void
}

export default function ChatPane({ conversation, character, onConversationCreated, onConversationUpdated }: Props) {
  const [messages, setMessages] = useState<DisplayMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Map<number, { keyword: string; videos: BilibiliVideo[] }>>(new Map())
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const convIdRef = useRef<number | null>(null)

  // Load messages when conversation changes
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
    })
  }, [conversation?.id])

  // Subscribe to emotion updates
  useEffect(() => {
    const off = api.chat.onEmotionUpdate(({ messageId, emotion }) => {
      setMessages((prev) =>
        prev.map((m) => ('id' in m && m.id === messageId ? { ...m, emotion } : m)),
      )
    })
    return off
  }, [])

  // Subscribe to B站 video recommendations
  useEffect(() => {
    const off = api.chat.onBilibiliResults(({ messageId, keyword, videos }) => {
      setRecommendations((prev) => new Map(prev).set(messageId, { keyword, videos }))
    })
    return off
  }, [])

  // Subscribe to streaming chunks
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

  // Scroll to bottom on new messages
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

    // Auto-create conversation on first message
    if (!convId) {
      const newConv = await api.conv.create(text.slice(0, 20))
      convId = newConv.id
      convIdRef.current = convId
      onConversationCreated(newConv)
    }

    // Optimistically add user message
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
    // streaming chunks/done events handle the rest
  }, [input, sending, conversation, messages, onConversationCreated])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ background: '#12111a' }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}80)`,
              border: `1px solid ${character.color}40`,
              boxShadow: `0 8px 32px ${character.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
            }}>
              {character.emoji}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e6f0', marginBottom: 6 }}>{character.name}</p>
              <p style={{ fontSize: 13, color: character.color + 'bb', lineHeight: 1.5 }}>
                {character.title}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {character.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 12, padding: '4px 12px', borderRadius: 20,
                  background: `${character.color}18`,
                  color: character.color,
                  border: `1px solid ${character.color}35`,
                  fontWeight: 500,
                }}>{tag}</span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#3a3852', marginTop: 4 }}>发条消息开始聊天吧</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const msgId = 'id' in msg ? msg.id : undefined
          const rec = msgId ? recommendations.get(msgId) : undefined
          return (
            <div key={msgId ?? `stream-${i}`}>
              <MessageBubble msg={msg} character={character} />
              {rec && <VideoStrip keyword={rec.keyword} videos={rec.videos} />}
            </div>
          )
        })}

        {sending && !messages.some((m) => 'streaming' in m) && (
          <div className="flex gap-3">
            <Avatar role="assistant" character={character} />
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#1c1b28] border border-[#2e2c42]">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: character.color, animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: character.color, animationDelay: '120ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: character.color, animationDelay: '240ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-sm rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-2.5 text-[12px] text-red-400">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ borderTop: '1px solid #1a1927', padding: '14px 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          borderRadius: 16, border: '1px solid #252336',
          background: '#1a1929', padding: '10px 14px',
          transition: 'border-color 0.15s',
        }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#252336')}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你的心情…"
            rows={1}
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            className="flex-1 resize-none bg-transparent text-[14px] text-[#e8e6f0] placeholder:text-[#4a4768] outline-none leading-6 max-h-36 overflow-y-auto"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none', flexShrink: 0,
              background: input.trim() && !sending
                ? 'linear-gradient(135deg, #a78bfa, #f472b6)'
                : '#252336',
              color: input.trim() && !sending ? 'white' : '#4a4768',
              cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#2e2c42', marginTop: 8 }}>
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}

function Avatar({ role, character }: { role: 'user' | 'assistant'; character: Character }) {
  if (role === 'assistant') {
    return (
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        background: `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}60)`,
        border: `1px solid ${character.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}>
        {character.emoji}
      </div>
    )
  }
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
      background: '#2d2459', border: '1px solid rgba(167,139,250,0.3)',
    }} />
  )
}

function MessageBubble({ msg, character }: { msg: DisplayMsg; character: Character }) {
  const isUser = msg.role === 'user'
  const isStreaming = 'streaming' in msg
  const emotion = !isStreaming && isUser ? (msg as MessageRow).emotion : undefined
  const emotionMeta = emotion ? EMOTION_META[emotion] : undefined

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={msg.role} character={character} />
      <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div style={{
          padding: '10px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.65,
          whiteSpace: 'pre-wrap', wordBreak: 'break-words', maxWidth: '100%',
          ...(isUser
            ? { background: 'linear-gradient(135deg, #2d2459, #251d4a)', border: '1px solid rgba(167,139,250,0.2)', color: '#ede9f8', borderTopRightRadius: 4 }
            : { background: '#1c1b28', border: '1px solid #252336', color: '#d4d0e8', borderTopLeftRadius: 4 }
          ),
        }} className={isStreaming ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-[#a78bfa]' : ''}
        >
          {msg.content}
        </div>
        {emotionMeta && (
          <span style={{ color: emotionMeta.color }} className="text-[11px] flex items-center gap-1 opacity-70">
            <span>{emotionMeta.emoji}</span>
            <span>{emotion}</span>
          </span>
        )}
      </div>
    </div>
  )
}

function VideoStrip({ keyword, videos }: { keyword: string; videos: BilibiliVideo[] }) {
  function openVideo(bvid: string) {
    // Use Electron shell to open in default browser
    window.open(`https://www.bilibili.com/video/${bvid}`, '_blank')
  }

  function formatPlay(n: number): string {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
    return String(n)
  }

  return (
    <div className="mt-2 ml-9">
      <p className="text-[11px] text-[#5e5b78] mb-2">
        💡 为你找了一些 <span className="text-[#a78bfa]">{keyword}</span> 的视频
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {videos.map((v) => (
          <button
            key={v.bvid}
            onClick={() => openVideo(v.bvid)}
            className="shrink-0 w-40 text-left rounded-xl overflow-hidden border border-[#2e2c42] bg-[#1c1b28] hover:border-[#a78bfa]/40 hover:bg-[#252336] transition-all"
          >
            {v.cover ? (
              <img src={v.cover} alt={v.title} className="w-full h-[90px] object-cover" />
            ) : (
              <div className="w-full h-[90px] bg-[#16151f] flex items-center justify-center text-[#3a3852] text-[11px]">
                暂无封面
              </div>
            )}
            <div className="px-2 py-1.5">
              <p className="text-[11px] text-[#d4d0e8] leading-4 line-clamp-2">{v.title}</p>
              <p className="text-[10px] text-[#5e5b78] mt-1 flex items-center justify-between">
                <span className="truncate max-w-[70%]">{v.author}</span>
                <span>{formatPlay(v.play)}播放</span>
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
