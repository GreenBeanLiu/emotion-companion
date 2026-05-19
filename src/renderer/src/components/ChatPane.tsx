import { useEffect, useRef, useState, useCallback } from 'react'
import { api, type ConversationRow, type MessageRow } from '../lib/api'

type StreamingMsg = { role: 'assistant'; content: string; streaming: true }
type DisplayMsg = MessageRow | StreamingMsg

type Props = {
  conversation: ConversationRow | null
  onConversationCreated: (conv: ConversationRow) => void
  onConversationUpdated: () => void
}

const WELCOME = `你好 🌸 很高兴认识你。不管你今天心情如何，我都在这里陪着你。有什么想说的吗？`

export default function ChatPane({ conversation, onConversationCreated, onConversationUpdated }: Props) {
  const [messages, setMessages] = useState<DisplayMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const convIdRef = useRef<number | null>(null)

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation) {
      setMessages([])
      convIdRef.current = null
      return
    }
    convIdRef.current = conversation.id
    api.msg.list(conversation.id).then((msgs) => {
      setMessages(msgs)
    })
  }, [conversation?.id])

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
    <div className="flex-1 flex flex-col min-w-0 bg-[#12111a]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#f472b6] opacity-80 flex items-center justify-center">
              <span className="text-2xl">🌸</span>
            </div>
            <div>
              <p className="text-[15px] font-medium text-[#e8e6f0]">情感陪伴</p>
              <p className="text-[13px] text-[#5e5b78] mt-1">随时倾听，温暖陪伴</p>
            </div>
            <div className="max-w-sm rounded-2xl bg-[#1c1b28] border border-[#2e2c42] px-5 py-4 text-[13px] text-[#9b97b4] leading-6">
              {WELCOME}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={'id' in msg ? msg.id : `stream-${i}`} msg={msg} />
        ))}

        {sending && !messages.some((m) => 'streaming' in m) && (
          <div className="flex gap-3">
            <Avatar role="assistant" />
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#1c1b28] border border-[#2e2c42]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '120ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '240ms' }} />
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
      <div className="border-t border-[#1f1e2e] px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-[#2e2c42] bg-[#1c1b28] px-4 py-2.5 focus-within:border-[#a78bfa]/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你的心情…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] text-[#e8e6f0] placeholder:text-[#5e5b78] outline-none leading-6 max-h-32 overflow-y-auto"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#a78bfa] to-[#f472b6] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[11px] text-[#3a3852] mt-2">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </div>
  )
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  if (role === 'assistant') {
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#f472b6] shrink-0 flex items-center justify-center text-[11px] mt-0.5">
        🌸
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-full bg-[#2d2459] border border-[#a78bfa]/30 shrink-0 mt-0.5" />
  )
}

function MessageBubble({ msg }: { msg: DisplayMsg }) {
  const isUser = msg.role === 'user'
  const isStreaming = 'streaming' in msg

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={msg.role} />
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-[13px] leading-6 whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-[#2d2459] border border-[#a78bfa]/20 text-[#e8e6f0] rounded-tr-sm'
            : 'bg-[#1c1b28] border border-[#2e2c42] text-[#d4d0e8] rounded-tl-sm'
        } ${isStreaming ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-[#a78bfa]' : ''}`}
      >
        {msg.content}
      </div>
    </div>
  )
}
