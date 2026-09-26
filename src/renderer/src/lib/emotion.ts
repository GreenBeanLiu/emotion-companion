export type EmotionStat = { date: string; emotion: string; count: number }

export const EMOTION_META: Record<string, { emoji: string; color: string; label: string }> = {
  开心: { emoji: '😊', color: '#4ade80', label: '开心' },
  平静: { emoji: '😌', color: '#60a5fa', label: '平静' },
  焦虑: { emoji: '😰', color: '#fb923c', label: '焦虑' },
  悲伤: { emoji: '😢', color: '#818cf8', label: '悲伤' },
  愤怒: { emoji: '😤', color: '#f87171', label: '愤怒' },
  疲惫: { emoji: '😩', color: '#94a3b8', label: '疲惫' },
  孤独: { emoji: '🥺', color: '#c084fc', label: '孤独' },
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Dominant emotion recorded today, or null if nothing logged yet. */
export function getTodayMood(stats: EmotionStat[]): { emotion: string; count: number } | null {
  const today = todayKey()
  const counts: Record<string, number> = {}
  for (const s of stats) {
    if (s.date !== today) continue
    counts[s.emotion] = (counts[s.emotion] || 0) + s.count
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return null
  return { emotion: sorted[0][0], count: sorted[0][1] }
}
