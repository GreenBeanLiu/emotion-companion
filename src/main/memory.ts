import { callSimple, type AiSettings, type ChatMessage } from './ai'
import { getUserProfile, saveUserProfile } from './db'

// Generate a one-line recap of a conversation for cross-session memory injection
export async function summarizeConversation(
  messages: ChatMessage[],
  settings: AiSettings,
): Promise<string> {
  const userMsgs = messages.filter((m) => m.role === 'user')
  if (userMsgs.length < 2) return ''

  const dialog = messages
    .map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content.slice(0, 300)}`)
    .join('\n')
    .slice(0, 3000)

  const prompt = `请用一句话（不超过40字）概括以下对话的核心内容。从第三人称视角，描述用户的状态/心情和谈话的主要收获或结论。直接输出摘要，不要任何前缀或解释。

对话：
${dialog}`

  const result = await callSimple(settings, prompt)
  return result.trim().slice(0, 80)
}

export async function extractAndUpdateProfile(
  messages: ChatMessage[],
  settings: AiSettings,
): Promise<void> {
  if (messages.filter((m) => m.role === 'user').length === 0) return

  const existing = getUserProfile()?.summary ?? '（暂无记录）'
  const dialog = messages
    .map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`)
    .join('\n')

  const prompt = `你是一个记忆助手，负责维护用户的个人档案。

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

  const updated = await callSimple(settings, prompt)
  if (updated.trim()) {
    saveUserProfile({ summary: updated.trim(), updatedAt: new Date().toISOString() })
  }
}
