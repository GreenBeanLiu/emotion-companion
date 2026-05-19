import { callSimple, type AiSettings, type ChatMessage } from './ai'

export type BilibiliVideo = {
  bvid: string
  title: string
  cover: string   // thumbnail URL (may start with //)
  author: string
  play: number
  duration: string
}

// Emotions that warrant video recommendations
const RECOMMEND_EMOTIONS = new Set(['焦虑', '悲伤', '疲惫', '孤独', '愤怒'])

export function shouldRecommend(emotion: string): boolean {
  return RECOMMEND_EMOTIONS.has(emotion)
}

// Ask AI to generate a B站 search keyword based on conversation context
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
  return keyword.trim() || (emotion === '焦虑' ? '解压放松' : '治愈系视频')
}

// Search B站 videos via TikHub aggregator API
export async function searchVideos(
  keyword: string,
  tikhubKey: string,
): Promise<BilibiliVideo[]> {
  const url = `https://api.tikhub.io/api/v1/bilibili/web/fetch_search_result?keyword=${encodeURIComponent(keyword)}&search_type=video&order_type=totalrank&page=1`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tikhubKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) return []

  const json = await res.json()

  // TikHub wraps results in data.result[]
  const items: Record<string, unknown>[] = json?.data?.result ?? []

  return items
    .filter((item) => item.bvid || item.aid)
    .slice(0, 3)
    .map((item) => ({
      bvid: String(item.bvid ?? item.aid ?? ''),
      title: String(item.title ?? '').replace(/<[^>]+>/g, ''),  // strip html tags
      cover: normalizeCover(String(item.pic ?? item.cover ?? '')),
      author: String(item.author ?? item.uploader ?? ''),
      play: Number(item.play ?? item.view ?? 0),
      duration: String(item.duration ?? ''),
    }))
}

function normalizeCover(url: string): string {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  return url
}
