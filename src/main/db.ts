// Pure-JS storage using electron-store (JSON file, no native compilation)
import Store from 'electron-store'

export type ConversationRow = {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count?: number
  summary?: string      // one-line AI-generated recap of this conversation
}

export type MessageRow = {
  id: number
  conversation_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
  emotion?: string
}

export type UserProfile = {
  summary: string
  updatedAt: string
}

type StoreSchema = {
  conversations: ConversationRow[]
  messages: MessageRow[]
  nextId: number
  userProfile?: UserProfile
}

const store = new Store<StoreSchema>({
  name: 'conversations',
  defaults: { conversations: [], messages: [], nextId: 1 },
})

function nextId(): number {
  const id = store.get('nextId', 1)
  store.set('nextId', id + 1)
  return id
}

function now(): string {
  return new Date().toISOString()
}

// ── Conversation CRUD ──────────────────────────────────────────────

export function createConversation(title = '新对话'): ConversationRow {
  const conv: ConversationRow = {
    id: nextId(),
    title,
    created_at: now(),
    updated_at: now(),
    message_count: 0,
  }
  const list = store.get('conversations', [])
  store.set('conversations', [conv, ...list])
  return conv
}

export function listConversations(): ConversationRow[] {
  const convs = store.get('conversations', [])
  const msgs = store.get('messages', [])
  return convs
    .map((c) => ({
      ...c,
      message_count: msgs.filter((m) => m.conversation_id === c.id).length,
    }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 100)
}

export function updateConversationTitle(id: number, title: string): void {
  const list = store.get('conversations', [])
  store.set(
    'conversations',
    list.map((c) => (c.id === id ? { ...c, title } : c)),
  )
}

export function updateConversationSummary(id: number, summary: string): void {
  const list = store.get('conversations', [])
  store.set(
    'conversations',
    list.map((c) => (c.id === id ? { ...c, summary } : c)),
  )
}

export function deleteConversation(id: number): void {
  store.set(
    'conversations',
    store.get('conversations', []).filter((c) => c.id !== id),
  )
  store.set(
    'messages',
    store.get('messages', []).filter((m) => m.conversation_id !== id),
  )
}

// ── Message CRUD ───────────────────────────────────────────────────

export function addMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
): MessageRow {
  const msg: MessageRow = {
    id: nextId(),
    conversation_id: conversationId,
    role,
    content,
    created_at: now(),
  }
  store.set('messages', [...store.get('messages', []), msg])

  // Touch updated_at on the conversation
  const convs = store.get('conversations', [])
  store.set(
    'conversations',
    convs.map((c) => (c.id === conversationId ? { ...c, updated_at: now() } : c)),
  )

  return msg
}

export function deleteMessagesFrom(conversationId: number, fromMessageId: number): void {
  const msgs = store.get('messages', [])
  const sorted = msgs
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const idx = sorted.findIndex((m) => m.id === fromMessageId)
  if (idx < 0) return
  const idsToDelete = new Set(sorted.slice(idx).map((m) => m.id))
  store.set('messages', msgs.filter((m) => !idsToDelete.has(m.id)))
}

export function updateMessageEmotion(id: number, emotion: string): void {
  store.set(
    'messages',
    store.get('messages', []).map((m) => (m.id === id ? { ...m, emotion } : m)),
  )
}

export function listMessages(conversationId: number): MessageRow[] {
  return store
    .get('messages', [])
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

// ── Emotion stats ─────────────────────────────────────────────

export type EmotionStat = {
  date: string   // YYYY-MM-DD
  emotion: string
  count: number
}

export function getEmotionStats(): EmotionStat[] {
  const messages = store.get('messages', [])
  const byDate: Record<string, Record<string, number>> = {}

  for (const msg of messages) {
    if (!msg.emotion || msg.role !== 'user') continue
    const date = msg.created_at.slice(0, 10)
    if (!byDate[date]) byDate[date] = {}
    byDate[date][msg.emotion] = (byDate[date][msg.emotion] || 0) + 1
  }

  return Object.entries(byDate)
    .flatMap(([date, emotions]) =>
      Object.entries(emotions).map(([emotion, count]) => ({ date, emotion, count })),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ── User profile (long-term memory) ───────────────────────────────

export function getUserProfile(): UserProfile | null {
  return store.get('userProfile') ?? null
}

export function saveUserProfile(profile: UserProfile): void {
  store.set('userProfile', profile)
}

export function clearUserProfile(): void {
  store.delete('userProfile')
}
