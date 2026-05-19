import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Settings = {
  provider: 'claude' | 'openai'
  apiKey: string
  model: string
  tikhubKey: string
}

const MODEL_OPTIONS = {
  claude: [
    { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (推荐)' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (快速)' },
    { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 (强大)' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (推荐)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini (快速)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    provider: 'claude',
    apiKey: '',
    model: '',
    tikhubKey: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [profile, setProfile] = useState<{ summary: string; updatedAt: string } | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    api.settings.load().then(setSettings)
    api.memory.get().then(setProfile)
  }, [])

  async function handleClearMemory() {
    await api.memory.clear()
    setProfile(null)
  }

  async function handleSave() {
    setSaving(true)
    await api.settings.save(settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function patch(update: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...update }))
  }

  const models = MODEL_OPTIONS[settings.provider]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#1c1b28] border border-[#2e2c42] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2c42]">
          <h2 className="text-[14px] font-semibold text-[#e8e6f0]">设置</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5e5b78] hover:text-[#9b97b4] hover:bg-[#252336] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Provider */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#9b97b4]">AI 提供商</label>
            <div className="flex gap-2">
              {(['claude', 'openai'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => patch({ provider: p, model: '' })}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-all ${
                    settings.provider === p
                      ? 'border-[#a78bfa]/60 bg-[#a78bfa]/10 text-[#a78bfa]'
                      : 'border-[#2e2c42] text-[#5e5b78] hover:border-[#3e3c52] hover:text-[#9b97b4]'
                  }`}
                >
                  {p === 'claude' ? 'Claude (Anthropic)' : 'OpenAI'}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#9b97b4]">
              API Key
              <span className="ml-1 text-[#5e5b78] font-normal">（本地加密存储，不上传）</span>
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => patch({ apiKey: e.target.value })}
                placeholder={settings.provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
                className="flex-1 bg-[#12111a] border border-[#2e2c42] rounded-lg px-3 py-2 text-[13px] text-[#e8e6f0] placeholder:text-[#3a3852] outline-none focus:border-[#a78bfa]/40 transition-colors"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="px-3 rounded-lg border border-[#2e2c42] text-[#5e5b78] hover:text-[#9b97b4] hover:border-[#3e3c52] text-[12px] transition-colors"
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#9b97b4]">模型</label>
            <select
              value={settings.model}
              onChange={(e) => patch({ model: e.target.value })}
              className="bg-[#12111a] border border-[#2e2c42] rounded-lg px-3 py-2 text-[13px] text-[#e8e6f0] outline-none focus:border-[#a78bfa]/40 transition-colors"
            >
              <option value="">默认推荐</option>
              {models.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* TikHub Key */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#9b97b4]">
              TikHub API Key
              <span className="ml-1 text-[#5e5b78] font-normal">（B站视频推荐，选填）</span>
            </label>
            <input
              type="password"
              value={settings.tikhubKey}
              onChange={(e) => patch({ tikhubKey: e.target.value })}
              placeholder="填入后，负面情绪时自动推荐B站视频"
              className="bg-[#12111a] border border-[#2e2c42] rounded-lg px-3 py-2 text-[13px] text-[#e8e6f0] placeholder:text-[#3a3852] outline-none focus:border-[#a78bfa]/40 transition-colors"
            />
          </div>

          {/* Character note */}
          <div className="rounded-lg border border-[#2e2c42] bg-[#12111a] px-4 py-3 flex items-start gap-3">
            <span className="text-[18px] mt-0.5">🎭</span>
            <div>
              <p className="text-[12px] font-medium text-[#9b97b4]">角色设定</p>
              <p className="text-[12px] text-[#5e5b78] mt-1 leading-5">
                在顶部标题栏点击角色名称，可切换或自定义角色人设。
              </p>
            </div>
          </div>

          {/* Memory */}
          <div className="rounded-lg border border-[#2e2c42] bg-[#12111a] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">🧠</span>
                <p className="text-[12px] font-medium text-[#9b97b4]">长期记忆</p>
                {profile ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/25">
                    已记录
                  </span>
                ) : (
                  <span className="text-[10px] text-[#3a3852]">暂无</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {profile && (
                  <>
                    <button
                      onClick={() => setShowProfile((v) => !v)}
                      className="text-[11px] text-[#5e5b78] hover:text-[#9b97b4] transition-colors"
                    >
                      {showProfile ? '收起' : '查看'}
                    </button>
                    <button
                      onClick={handleClearMemory}
                      className="text-[11px] text-red-500/60 hover:text-red-400 transition-colors"
                    >
                      清除
                    </button>
                  </>
                )}
              </div>
            </div>
            {!profile && (
              <p className="text-[11px] text-[#3a3852] mt-1.5 leading-5">
                聊天过程中会自动提炼你提到的信息，下次对话时角色会记得你。
              </p>
            )}
            {profile && showProfile && (
              <pre className="mt-2.5 text-[11px] text-[#7b78a0] leading-6 whitespace-pre-wrap font-sans">
                {profile.summary}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#2e2c42]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] text-[#9b97b4] hover:text-[#e8e6f0] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-[13px] font-medium bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saved ? '已保存 ✓' : saving ? '保存中…' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}
