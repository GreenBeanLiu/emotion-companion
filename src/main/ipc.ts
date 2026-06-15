import { ipcMain, BrowserWindow } from 'electron'
import {
  createConversation,
  listConversations,
  updateConversationTitle,
  updateConversationSummary,
  deleteConversation,
  addMessage,
  listMessages,
  updateMessageEmotion,
  getUserProfile,
  clearUserProfile,
  getEmotionStats,
} from './db'
import { streamChat } from './ai'
import { loadSettings, saveSettings } from './settings'
import { rescheduleReminder } from './notification'
import { getAvatars, setAvatar, clearAvatar } from './avatar'
import { extractAndUpdateProfile, summarizeConversation } from './memory'
import { detectEmotion } from './emotion'
import { shouldRecommend, generateKeyword, searchVideos } from './bilibili'

const activeAbortControllers = new Map<number, AbortController>()

export function registerIpcHandlers(): void {
  // ── Settings ────────────────────────────────────────────────────
  ipcMain.handle('settings:load', () => loadSettings())
  ipcMain.handle('settings:save', (_e, settings) => {
    saveSettings(settings)
    rescheduleReminder(settings.reminderEnabled, settings.reminderTime)
    return { ok: true }
  })

  // ── Memory ───────────────────────────────────────────────────────
  ipcMain.handle('memory:get', () => getUserProfile())
  ipcMain.handle('memory:clear', () => {
    clearUserProfile()
    return { ok: true }
  })

  // ── Stats ─────────────────────────────────────────────────────────
  ipcMain.handle('stats:emotions', () => getEmotionStats())

  // ── Avatars ───────────────────────────────────────────────────────
  ipcMain.handle('avatar:getAll', () => getAvatars())
  ipcMain.handle('avatar:set', (_e, characterId: string, dataUrl: string) => {
    setAvatar(characterId, dataUrl)
    return { ok: true }
  })
  ipcMain.handle('avatar:clear', (_e, characterId: string) => {
    clearAvatar(characterId)
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

    // Inject recent conversation summaries for cross-session continuity
    const recentSummaries = listConversations()
      .filter((c) => c.id !== conversationId && c.summary)
      .slice(0, 4)
    if (recentSummaries.length > 0) {
      const lines = recentSummaries
        .map((c) => `• ${c.updated_at.slice(0, 10)} 「${c.title}」：${c.summary}`)
        .join('\n')
      settings.systemPrompt = `${settings.systemPrompt}\n\n[与该用户的历史对话摘要]\n${lines}`
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

    // Generate/update conversation summary once there are enough exchanges
    const allMsgs = listMessages(conversationId)
    if (allMsgs.filter((m) => m.role === 'user').length >= 2) {
      summarizeConversation(fullHistory, settings)
        .then((summary) => { if (summary) updateConversationSummary(conversationId, summary) })
        .catch(() => {})
    }

    detectEmotion(content, settings).then(async (emotion) => {
      if (!emotion) return
      updateMessageEmotion(userMsg.id, emotion)
      win?.webContents.send('emotion:update', { messageId: userMsg.id, emotion })

      // B站 recommendation for negative emotions
      if (shouldRecommend(emotion) && settings.tikhubKey) {
        const keyword = await generateKeyword(fullHistory, emotion, settings)
        const videos = await searchVideos(keyword, settings.tikhubKey)
        if (videos.length > 0) {
          win?.webContents.send('bilibili:results', { messageId: userMsg.id, keyword, videos })
        }
      }
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
