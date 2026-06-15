import { Notification } from 'electron'

let reminderTimeout: ReturnType<typeof setTimeout> | null = null

export function testNotification(): boolean {
  if (!Notification.isSupported()) return false
  new Notification({ title: 'pulomi', body: '提醒测试 · 通知功能正常 ✓' }).show()
  return true
}

function msUntilTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

export function rescheduleReminder(enabled: boolean, time: string): void {
  if (reminderTimeout !== null) {
    clearTimeout(reminderTimeout)
    reminderTimeout = null
  }
  if (!enabled || !time) return

  function schedule(): void {
    const ms = msUntilTime(time)
    reminderTimeout = setTimeout(() => {
      new Notification({
        title: 'pulomi',
        body: '今天感觉怎么样？来聊聊吧 💬',
      }).show()
      schedule()
    }, ms)
  }

  schedule()
}
