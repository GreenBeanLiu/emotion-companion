import { callSimple, type AiSettings } from './ai'

export const EMOTIONS = ['开心', '平静', '焦虑', '悲伤', '愤怒', '疲惫', '孤独'] as const
export type Emotion = (typeof EMOTIONS)[number]

export const EMOTION_META: Record<Emotion, { emoji: string; color: string }> = {
  开心: { emoji: '😊', color: '#4ade80' },
  平静: { emoji: '😌', color: '#60a5fa' },
  焦虑: { emoji: '😰', color: '#fb923c' },
  悲伤: { emoji: '😢', color: '#818cf8' },
  愤怒: { emoji: '😤', color: '#f87171' },
  疲惫: { emoji: '😩', color: '#94a3b8' },
  孤独: { emoji: '🥺', color: '#c084fc' },
}

export async function detectEmotion(
  text: string,
  settings: AiSettings,
): Promise<Emotion | null> {
  const prompt = `判断下面这句话表达的情绪，从以下选项中选一个词回复，只回复这一个词，不要有任何其他内容：
开心、平静、焦虑、悲伤、愤怒、疲惫、孤独

用户说："${text}"`

  const result = await callSimple(settings, prompt)
  return EMOTIONS.find((e) => result.trim().includes(e)) ?? null
}
