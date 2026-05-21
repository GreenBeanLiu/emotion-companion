import { callSimple, type AiSettings, type ChatMessage } from './ai'

export type BilibiliVideo = {
  bvid: string
  title: string
  cover: string
  author: string
  play: number
  duration: string
}

const RECOMMEND_EMOTIONS = new Set(['焦虑', '悲伤', '疲惫', '孤独', '愤怒'])

export function shouldRecommend(emotion: string): boolean {
  return RECOMMEND_EMOTIONS.has(emotion)
}

export async function generateKeyword(
  messages: ChatMessage[],
  emotion: string,
  aiSettings: AiSettings,
): Promise<string> {
  const recentDialog = messages
    .slice(-6)
    .map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`)
    .join('\n')

  const prompt = `根据以下对话内容和用户情绪，生成一个适合在B站搜索的关键词，帮用户找到合适的视频。
只输出关键词，不超过8个字，不加引号，不要任何解释。

用户情绪：${emotion}
对话内容：
${recentDialog}`

  const keyword = await callSimple(aiSettings, prompt)
  return keyword.trim() || '解压放松'
}

export async function searchVideos(
  keyword: string,
  tikhubKey: string,
): Promise<BilibiliVideo[]> {
  const url =
    `https://api.tikhub.io/api/v1/bilibili/web/fetch_general_search` +
    `?keyword=${encodeURIComponent(keyword)}&order=totalrank&page=1&page_size=5`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tikhubKey}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  if (!res.ok) return []

  const json = await res.json()
  const items: Record<string, unknown>[] = json?.data?.data?.result ?? []

  return items
    .filter((item) => item.type === 'video' && item.bvid)
    .slice(0, 3)
    .map((item) => ({
      bvid: String(item.bvid),
      title: String(item.title ?? '').replace(/<[^>]+>/g, ''),
      cover: normalizeCover(String(item.pic ?? '')),
      author: String(item.author ?? ''),
      play: Number(item.play ?? 0),
      duration: String(item.duration ?? ''),
    }))
}

function normalizeCover(url: string): string {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  return url
}
