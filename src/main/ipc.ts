import { ipcMain, BrowserWindow } from 'electron'
import {
  createConversation,
  listConversations,
  updateConversationTitle,
  deleteConversation,
  addMessage,
  listMessages,
  updateMessageEmotion,
  getUserProfile,
  clearUserProfile,
} from './db'
import { streamChat } from './ai'
import { loadSettings, saveSettings } from './settings'
import { extractAndUpdateProfile } from './memory'
import { detectEmotion } from './emotion'

const activeAbortControllers = new Map<number, AbortController>()

export function registerIpcHandlers(): void {
  // ── Settings ────────────────────────────────────────────────────
  ipcMain.handle('settings:load', () => loadSettings())
  ipcMain.handle('settings:save', (_e, settings) => {
    saveSettings(settings)
    return { ok: true }
  })

  // ── Memory ───────────────────────────────────────────────────────
  ipcMain.handle('memory:get', () => getUserProfile())
  ipcMain.handle('memory:clear', () => {
    clearUserProfile()
    return { ok: true }
  })

  // ── Conversations ────────────────────────────────────────────────
  ipcMain.handle('conv:list', () => listConversations())
  ipcMain.handle('conv:create', (_e, title?: string) => createConversation(title))
  ipcMain.handle('conv:rename', (_e, id: number, title: string) => {
    updateConversationTitle(id, title)
    return { ok: true }
  })
  ipcMain.handle('conv:delete', (_e, id: number) => {
    deleteConversation(id)
    return { ok: true }
  })

  // ── Messages ─────────────────────────────────────────────────────
  ipcMain.handle('msg:list', (_e, conversationId: number) => listMessages(conversationId))

  // ── Chat (streaming) ─────────────────────────────────────────────
  ipcMain.handle('chat:send', async (event, payload: {
    conversationId: number
    content: string
    history: { role: 'user' | 'assistant'; content: string }[]
  }) => {
    const { conversationId, content, history } = payload
    const settings = loadSettings()

    if (!settings.apiKey) {
      return { error: '请先在设置中填写 API Key' }
    }

    // Inject long-term memory into system prompt
    const profile = getUserProfile()
    if (profile?.summary) {
      settings.systemPrompt = `${settings.systemPrompt}\n\n[关于这位用户的已知信息]\n${profile.summary}`
    }

    // Save user message
    const userMsg = addMessage(conversationId, 'user', content)

    const win = BrowserWindow.fromWebContents(event.sender)
    const ac = new AbortController()
    activeAbortControllers.set(conversationId, ac)

    let fullReply = ''

    try {
      fullReply = await streamChat(
        settings,
        [...history, { role: 'user', content }],
        (chunk) => {
          win?.webContents.send('chat:chunk', { conversationId, chunk })
        },
        ac.signal,
      )
    } catch (err: unknown) {
      activeAbortControllers.delete(conversationId)
      if ((err as Error).name === 'AbortError') {
        return { userMessageId: userMsg.id, aborted: true }
      }
      return { error: (err as Error).message ?? '请求失败' }
    }

    activeAbortControllers.delete(conversationId)
    const assistantMsg = addMessage(conversationId, 'assistant', fullReply)

    win?.webContents.send('chat:done', { conversationId })

    // Background tasks — fire and forget
    const fullHistory = [
      ...history,
      { role: 'user' as const, content },
      { role: 'assistant' as const, content: fullReply },
    ]
    extractAndUpdateProfile(fullHistory, settings).catch(() => {})

    detectEmotion(content, settings).then((emotion) => {
      if (!emotion) return
      updateMessageEmotion(userMsg.id, emotion)
      win?.webContents.send('emotion:update', { messageId: userMsg.id, emotion })
    }).catch(() => {})

    return { userMessageId: userMsg.id, assistantMessageId: assistantMsg.id }
  })

  ipcMain.handle('chat:abort', (_e, conversationId: number) => {
    const ac = activeAbortControllers.get(conversationId)
    if (ac) {
      ac.abort()
      activeAbortControllers.delete(conversationId)
    }
    return { ok: true }
  })
}
