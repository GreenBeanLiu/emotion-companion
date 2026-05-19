import type { AiSettings, ChatMessage } from './ai'
import { getUserProfile, saveUserProfile } from './db'

// Called after every assistant reply; runs in background, never throws.
export async function extractAndUpdateProfile(
  messages: ChatMessage[],
  settings: AiSettings,
): Promise<void> {
  const userTurns = messages.filter((m) => m.role === 'user')
  if (userTurns.length === 0) return

  const existing = getUserProfile()?.summary ?? '（暂无记录）'
  const dialog = messages
    .map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`)
    .join('\n')

  const extractPrompt = `你是一个记忆助手，负责维护用户的个人档案。

当前档案：
${existing}

本次对话内容：
${dialog}

请根据对话，提取或更新用户的个人信息，输出更新后的档案。
规则：
- 只记录用户明确说过的信息，不猜测
- 可包含：姓名/昵称、年龄、性别、职业、城市、家庭情况、近期状态与烦恼、性格特点、兴趣爱好
- 每条信息单独一行，以"·"开头，简洁
- 若本次对话没有新信息，直接返回原档案内容，不做修改
- 不要输出任何解释，只输出档案内容`

  try {
    const updated = await callSimple(settings, extractPrompt)
    if (updated.trim()) {
      saveUserProfile({ summary: updated.trim(), updatedAt: new Date().toISOString() })
    }
  } catch {
    // best-effort, never surface errors to user
  }
}

async function callSimple(settings: AiSettings, prompt: string): Promise<string> {
  if (settings.provider === 'openai') {
    return callOpenAISimple(settings, prompt)
  }
  return callClaudeSimple(settings, prompt)
}

async function callClaudeSimple(settings: AiSettings, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: settings.model || 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) return ''
  const json = await res.json()
  return json.content?.[0]?.text ?? ''
}

async function callOpenAISimple(settings: AiSettings, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
    }),
  })
  if (!res.ok) return ''
  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}
