import { useEffect, useMemo, useState } from 'react'
import { createStyles, cx } from 'antd-style'
import { api } from '../lib/api'

type EmotionStat = { date: string; emotion: string; count: number }

const EMOTION_META: Record<string, { emoji: string; color: string; label: string }> = {
  开心: { emoji: '😊', color: '#4ade80', label: '开心' },
  平静: { emoji: '😌', color: '#60a5fa', label: '平静' },
  焦虑: { emoji: '😰', color: '#fb923c', label: '焦虑' },
  悲伤: { emoji: '😢', color: '#818cf8', label: '悲伤' },
  愤怒: { emoji: '😤', color: '#f87171', label: '愤怒' },
  疲惫: { emoji: '😩', color: '#94a3b8', label: '疲惫' },
  孤独: { emoji: '🥺', color: '#c084fc', label: '孤独' },
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const WEEKS = 13 // ~3 months

function getDayGrid(): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // start from Sunday of the week that was WEEKS ago
  const startDay = new Date(today)
  startDay.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7)
  const days: Date[] = []
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(startDay)
    d.setDate(startDay.getDate() + i)
    days.push(d)
  }
  return days
}

function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

// Dominant emotion per day (highest count)
function buildDayMap(stats: EmotionStat[]): Record<string, { emotion: string; total: number }> {
  const byDate: Record<string, Record<string, number>> = {}
  for (const s of stats) {
    if (!byDate[s.date]) byDate[s.date] = {}
    byDate[s.date][s.emotion] = (byDate[s.date][s.emotion] || 0) + s.count
  }
  const result: Record<string, { emotion: string; total: number }> = {}
  for (const [date, emotions] of Object.entries(byDate)) {
    const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1])
    result[date] = {
      emotion: sorted[0][0],
      total: Object.values(emotions).reduce((a, b) => a + b, 0),
    }
  }
  return result
}

function buildDistribution(stats: EmotionStat[]): Array<{ emotion: string; count: number }> {
  const totals: Record<string, number> = {}
  for (const s of stats) {
    totals[s.emotion] = (totals[s.emotion] || 0) + s.count
  }
  return Object.entries(totals)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
}

const useStyles = createStyles(({ token, css }) => ({
  page: css`
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    background: ${token.colorBgBase};
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 32px 48px;
  `,

  inner: css`
    width: 100%;
    max-width: 680px;
    display: flex;
    flex-direction: column;
    gap: 36px;
  `,

  heading: css`
    font-size: 18px;
    font-weight: 600;
    color: ${token.colorText};
    margin: 0;
    letter-spacing: -0.025em;
  `,

  subtext: css`
    font-size: 13px;
    color: ${token.colorTextTertiary};
    margin: 4px 0 0;
  `,

  section: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  sectionTitle: css`
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: ${token.colorTextQuaternary};
  `,

  calendarWrap: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
  `,

  weekdayRow: css`
    display: grid;
    grid-template-columns: 20px repeat(${WEEKS}, 14px);
    gap: 3px;
    align-items: center;
  `,

  weekdayLabel: css`
    font-size: 10px;
    color: ${token.colorTextQuaternary};
    text-align: center;
    line-height: 14px;
  `,

  calendarGrid: css`
    display: grid;
    grid-template-rows: repeat(7, 14px);
    grid-template-columns: 20px repeat(${WEEKS}, 14px);
    grid-auto-flow: column;
    gap: 3px;
    align-items: center;
  `,

  dayCell: css`
    width: 14px;
    height: 14px;
    border-radius: 3px;
    cursor: default;
    transition: transform ${token.motionDurationFast};

    &:hover {
      transform: scale(1.3);
    }
  `,

  dayCellEmpty: css`
    background: ${token.colorFillTertiary};
  `,

  monthLabel: css`
    font-size: 10px;
    color: ${token.colorTextQuaternary};
    line-height: 14px;
    text-align: left;
    white-space: nowrap;
  `,

  legend: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
  `,

  legendItem: css`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,

  legendDot: css`
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  `,

  distList: css`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,

  distRow: css`
    display: flex;
    align-items: center;
    gap: 10px;
  `,

  distLabel: css`
    width: 60px;
    font-size: 13px;
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  `,

  distBar: css`
    height: 8px;
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  `,

  distCount: css`
    font-size: 12px;
    color: ${token.colorTextQuaternary};
    flex-shrink: 0;
    width: 28px;
    text-align: right;
  `,

  statRow: css`
    display: flex;
    gap: 16px;
  `,

  statCard: css`
    flex: 1;
    border-radius: ${token.borderRadiusLG}px;
    padding: 16px 20px;
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorder};
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  statValue: css`
    font-size: 24px;
    font-weight: 600;
    color: ${token.colorText};
    line-height: 1.2;
    letter-spacing: -0.03em;
  `,

  statLabel: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,

  empty: css`
    padding: 60px 0;
    text-align: center;
    color: ${token.colorTextTertiary};
    font-size: 14px;
    line-height: 2;
  `,
}))

export default function EmotionDiary() {
  const { styles } = useStyles()
  const [stats, setStats] = useState<EmotionStat[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.stats.emotions().then((data) => {
      setStats(data)
      setLoaded(true)
    })
  }, [])

  const days = useMemo(() => getDayGrid(), [])
  const dayMap = useMemo(() => buildDayMap(stats), [stats])
  const distribution = useMemo(() => buildDistribution(stats), [stats])
  const maxCount = distribution[0]?.count ?? 1

  const totalDays = Object.keys(dayMap).length
  const totalSessions = stats.reduce((a, b) => a + b.count, 0)
  const dominantAll = distribution[0]?.emotion
  const dominantMeta = dominantAll ? EMOTION_META[dominantAll] : null

  // Month labels: find first day of each month in the grid
  const monthLabels: Record<number, string> = {}
  const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  days.forEach((d, i) => {
    const col = Math.floor(i / 7)  // column index in grid
    if (d.getDate() === 1 || (i === 0)) {
      monthLabels[col] = MONTHS[d.getMonth()]
    }
  })

  if (!loaded) return null

  const hasData = stats.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div>
          <h2 className={styles.heading}>情绪日记</h2>
          <p className={styles.subtext}>记录每次对话中感知到的情绪，帮助你了解自己的情感变化</p>
        </div>

        {!hasData ? (
          <div className={styles.empty}>
            暂无情绪记录<br />
            开始聊天，AI 会自动感知你的情绪
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className={styles.statRow}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{totalDays}</span>
                <span className={styles.statLabel}>有情绪记录的天数</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{totalSessions}</span>
                <span className={styles.statLabel}>累计情绪标记次数</span>
              </div>
              {dominantMeta && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{dominantMeta.emoji}</span>
                  <span className={styles.statLabel}>最常出现的情绪：{dominantAll}</span>
                </div>
              )}
            </div>

            {/* Calendar heatmap */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>近 3 个月</span>
              <div className={styles.calendarWrap}>
                {/* Month label row */}
                <div className={styles.weekdayRow}>
                  <span />
                  {Array.from({ length: WEEKS }, (_, col) => (
                    <span key={col} className={styles.monthLabel}>
                      {monthLabels[col] ?? ''}
                    </span>
                  ))}
                </div>

                {/* Day grid */}
                <div className={styles.calendarGrid}>
                  {/* Weekday labels in column 0 */}
                  {WEEKDAYS.map((wd, row) => (
                    <span
                      key={`wd-${row}`}
                      className={styles.weekdayLabel}
                      style={{ gridRow: row + 1, gridColumn: 1 }}
                    >
                      {row % 2 === 0 ? wd : ''}
                    </span>
                  ))}

                  {/* Day cells */}
                  {days.map((d, i) => {
                    const key = toKey(d)
                    const info = dayMap[key]
                    const col = Math.floor(i / 7) + 2  // +2 because col 1 is weekday label
                    const row = i % 7 + 1
                    const meta = info ? EMOTION_META[info.emotion] : null
                    const isFuture = d > new Date()

                    return (
                      <div
                        key={key}
                        className={cx(styles.dayCell, !meta && !isFuture && styles.dayCellEmpty)}
                        title={info ? `${key}\n${info.emotion} (${info.total}次)` : key}
                        style={{
                          gridColumn: col,
                          gridRow: row,
                          background: isFuture
                            ? 'transparent'
                            : meta
                            ? `${meta.color}cc`
                            : undefined,
                          opacity: isFuture ? 0 : 1,
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className={styles.legend}>
                {Object.entries(EMOTION_META).map(([key, meta]) => (
                  <div key={key} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: meta.color }} />
                    {meta.emoji} {meta.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion distribution */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>情绪分布</span>
              <div className={styles.distList}>
                {distribution.map(({ emotion, count }) => {
                  const meta = EMOTION_META[emotion]
                  if (!meta) return null
                  return (
                    <div key={emotion} className={styles.distRow}>
                      <span className={styles.distLabel}>
                        {meta.emoji} {meta.label}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          className={styles.distBar}
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            background: meta.color,
                            opacity: 0.75,
                          }}
                        />
                      </div>
                      <span className={styles.distCount}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
