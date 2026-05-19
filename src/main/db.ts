// Pure-JS storage using electron-store (JSON file, no native compilation)
import Store from 'electron-store'

export type ConversationRow = {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export type MessageRow = {
  id: number
  conversation_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
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

export function listMessages(conversationId: number): MessageRow[] {
  return store
    .get('messages', [])
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
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
