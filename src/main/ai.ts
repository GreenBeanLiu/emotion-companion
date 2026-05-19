import { net } from 'electron'

export type AiProvider = 'claude' | 'openai'

export type AiSettings = {
  provider: AiProvider
  apiKey: string
  model: string
  systemPrompt: string   // resolved system prompt (character prompt or custom)
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const DEFAULT_SYSTEM = `你是一个温暖、善解人意的情感陪伴伙伴。你会认真倾听用户的感受，给予关怀和支持，帮助他们疏解情绪、找到内心平静。
你的说话风格亲切自然，像一个真正的朋友，而不是生硬的机器人。你不会给出千篇一律的建议，而是根据用户的具体情况给出有温度的回应。`

async function callClaude(
  settings: AiSettings,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: settings.model || 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: settings.systemPrompt || DEFAULT_SYSTEM,
      stream: true,
      messages,
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error ${response.status}: ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]' || !data) continue
      try {
        const json = JSON.parse(data)
        const text = json.delta?.text ?? ''
        if (text) {
          full += text
          onChunk(text)
        }
      } catch {
        // skip malformed lines
      }
    }
  }
  return full
}

async function callOpenAI(
  settings: AiSettings,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o',
      stream: true,
      messages: [
        { role: 'system', content: settings.systemPrompt || DEFAULT_SYSTEM },
        ...messages,
      ],
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]' || !data) continue
      try {
        const json = JSON.parse(data)
        const text = json.choices?.[0]?.delta?.content ?? ''
        if (text) {
          full += text
          onChunk(text)
        }
      } catch {
        // skip malformed lines
      }
    }
  }
  return full
}

export async function streamChat(
  settings: AiSettings,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal: AbortSignal
): Promise<string> {
  if (settings.provider === 'openai') {
    return callOpenAI(settings, messages, onChunk, signal)
  }
  return callClaude(settings, messages, onChunk, signal)
}
