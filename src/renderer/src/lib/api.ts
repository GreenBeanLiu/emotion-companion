// Type-safe wrapper around window.api (exposed by preload)
declare global {
  interface Window {
    api: {
      win: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
      settings: {
        load: () => Promise<{
          provider: 'claude' | 'openai'
          apiKey: string
          model: string
          baseUrl: string
          characterId: string
          systemPrompt: string
          customSystemPrompt: string
          tikhubKey: string
        }>
        save: (s: {
          provider: 'claude' | 'openai'
          apiKey: string
          model: string
          baseUrl: string
          characterId: string
          systemPrompt: string
          customSystemPrompt: string
          tikhubKey: string
        }) => Promise<{ ok: boolean }>
      }
      conv: {
        list: () => Promise<ConversationRow[]>
        create: (title?: string) => Promise<ConversationRow>
        rename: (id: number, title: string) => Promise<{ ok: boolean }>
        delete: (id: number) => Promise<{ ok: boolean }>
      }
      msg: {
        list: (conversationId: number) => Promise<MessageRow[]>
      }
      memory: {
        get: () => Promise<{ summary: string; updatedAt: string } | null>
        clear: () => Promise<{ ok: boolean }>
      }
      chat: {
        send: (payload: {
          conversationId: number
          content: string
          history: { role: 'user' | 'assistant'; content: string }[]
        }) => Promise<{ userMessageId?: number; assistantMessageId?: number; error?: string; aborted?: boolean }>
        abort: (conversationId: number) => Promise<{ ok: boolean }>
        onChunk: (cb: (data: { conversationId: number; chunk: string }) => void) => () => void
        onDone: (cb: (data: { conversationId: number }) => void) => () => void
        onEmotionUpdate: (cb: (data: { messageId: number; emotion: string }) => void) => () => void
        onBilibiliResults: (cb: (data: {
          messageId: number
          keyword: string
          videos: BilibiliVideo[]
        }) => void) => () => void
      }
      stats: {
        emotions: () => Promise<Array<{ date: string; emotion: string; count: number }>>
      }
      update: {
        onAvailable: (cb: (data: { version: string }) => void) => () => void
        onDownloaded: (cb: (data: { version: string }) => void) => () => void
        install: () => void
      }
    }
  }
}

export type ConversationRow = {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count?: number
  summary?: string
}

export type BilibiliVideo = {
  bvid: string
  title: string
  cover: string
  author: string
  play: number
  duration: string
}

export type MessageRow = {
  id: number
  conversation_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
  emotion?: string
}

export const api = window.api
