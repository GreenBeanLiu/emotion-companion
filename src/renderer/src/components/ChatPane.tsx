import { useEffect, useRef, useState, useCallback } from 'react'
import { SendHorizontal } from 'lucide-react'
import { api, type ConversationRow, type MessageRow, type BilibiliVideo } from '../lib/api'
import type { Character } from '../lib/characters'
import { cn } from '@/lib/utils'

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
    return () => { offChunk(); offDone() }
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
    <div className="flex-1 flex flex-col min-w-0" style={{ background: '#12111a' }}>
      {/* Error toast */}
      {error && (
        <div className="shrink-0 mx-4 mt-3 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100 shrink-0">✕</button>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center min-h-full">
            <div
              className="flex items-center justify-center text-4xl"
              style={{
                width: 88, height: 88, borderRadius: 28,
                background: `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}60)`,
                border: `1px solid ${character.color}30`,
                boxShadow: `0 12px 40px ${character.color}20`,
              }}
            >
              {character.emoji}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-lg font-bold" style={{ color: '#e8e6f0' }}>{character.name}</p>
              <p className="text-sm leading-relaxed" style={{ color: character.color + 'aa' }}>
                {character.title}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center max-w-xs">
              {character.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full font-medium"
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
            <p className="text-xs" style={{ color: '#3a3852' }}>发条消息开始聊天吧</p>
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
          <div className="flex gap-3 items-start">
            <CharAvatar character={character} />
            <div
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{ background: '#1c1b28', border: '1px solid #2e2c42', borderTopLeftRadius: 4 }}
            >
              {[0, 120, 240].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ backgroundColor: character.color, animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-3" style={{ borderTop: '1px solid #1a1927' }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all"
          style={{ background: '#1a1929', border: '1px solid #252336' }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.35)')}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#252336')}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你的心情…"
            rows={1}
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            className="flex-1 resize-none bg-transparent text-sm text-[#e8e6f0] placeholder:text-[#4a4768] outline-none leading-6 max-h-36 overflow-y-auto"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className={cn(
              'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !sending
                ? 'text-white'
                : 'text-[#4a4768] cursor-not-allowed',
            )}
            style={{
              background: input.trim() && !sending
                ? `linear-gradient(135deg, #a78bfa, #f472b6)`
                : '#252336',
            }}
          >
            <SendHorizontal size={14} />
          </button>
        </div>
        <p className="text-center text-[11px] mt-2" style={{ color: '#2e2c42' }}>
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}

function CharAvatar({ character }: { character: Character }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center text-sm mt-0.5"
      style={{
        width: 28, height: 28, borderRadius: '50%',
        background: `linear-gradient(135deg, ${character.bgGradient[0]}, ${character.color}50)`,
        border: `1px solid ${character.color}25`,
      }}
    >
      {character.emoji}
    </div>
  )
}

function UserAvatar() {
  return (
    <div
      className="shrink-0 mt-0.5"
      style={{
        width: 28, height: 28, borderRadius: '50%',
        background: '#2d2459',
        border: '1px solid rgba(167,139,250,0.25)',
      }}
    />
  )
}

function MessageBubble({ msg, character }: { msg: DisplayMsg; character: Character }) {
  const isUser = msg.role === 'user'
  const isStreaming = 'streaming' in msg
  const emotion = !isStreaming && isUser ? (msg as MessageRow).emotion : undefined
  const emotionMeta = emotion ? EMOTION_META[emotion] : undefined

  return (
    <div className={cn('flex gap-3 items-start', isUser && 'flex-row-reverse')}>
      {isUser ? <UserAvatar /> : <CharAvatar character={character} />}
      <div className={cn('flex flex-col gap-1 max-w-[72%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
            isStreaming && 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-[#a78bfa]',
          )}
          style={{
            borderRadius: 16,
            ...(isUser
              ? {
                  background: 'linear-gradient(135deg, #2d2459, #251d4a)',
                  border: '1px solid rgba(167,139,250,0.18)',
                  color: '#ede9f8',
                  borderTopRightRadius: 4,
                }
              : {
                  background: '#1c1b28',
                  border: '1px solid #252336',
                  color: '#d4d0e8',
                  borderTopLeftRadius: 4,
                }),
          }}
        >
          {msg.content}
        </div>
        {emotionMeta && (
          <span
            className="flex items-center gap-1 text-[11px] opacity-60"
            style={{ color: emotionMeta.color }}
          >
            <span>{emotionMeta.emoji}</span>
            <span>{emotion}</span>
          </span>
        )}
      </div>
    </div>
  )
}

function VideoStrip({ keyword, videos }: { keyword: string; videos: BilibiliVideo[] }) {
  function formatPlay(n: number): string {
    return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n)
  }

  return (
    <div className="mt-2 ml-9">
      <p className="text-[11px] mb-2" style={{ color: '#5e5b78' }}>
        💡 为你找了一些{' '}
        <span style={{ color: '#a78bfa' }}>{keyword}</span>
        {' '}的视频
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {videos.map((v) => (
          <button
            key={v.bvid}
            onClick={() => window.open(`https://www.bilibili.com/video/${v.bvid}`, '_blank')}
            className="shrink-0 w-40 text-left rounded-xl overflow-hidden transition-all"
            style={{ border: '1px solid #2e2c42', background: '#1c1b28' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.35)'; e.currentTarget.style.background = '#252336' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e2c42'; e.currentTarget.style.background = '#1c1b28' }}
          >
            {v.cover ? (
              <img src={v.cover} alt={v.title} className="w-full h-[90px] object-cover" />
            ) : (
              <div className="w-full h-[90px] flex items-center justify-center text-[11px]" style={{ background: '#16151f', color: '#3a3852' }}>
                暂无封面
              </div>
            )}
            <div className="px-2 py-1.5">
              <p className="text-[11px] leading-4 line-clamp-2" style={{ color: '#d4d0e8' }}>{v.title}</p>
              <p className="text-[10px] mt-1 flex items-center justify-between" style={{ color: '#5e5b78' }}>
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
