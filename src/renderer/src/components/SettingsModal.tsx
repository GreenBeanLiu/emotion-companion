import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Settings = {
  provider: 'claude' | 'openai'
  apiKey: string
  model: string
  systemPrompt: string
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

const DEFAULT_SYSTEM = `你是一个温暖、善解人意的情感陪伴伙伴。你会认真倾听用户的感受，给予关怀和支持，帮助他们疏解情绪、找到内心平静。
你的说话风格亲切自然，像一个真正的朋友，而不是生硬的机器人。`

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    provider: 'claude',
    apiKey: '',
    model: '',
    systemPrompt: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    api.settings.load().then(setSettings)
  }, [])

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

          {/* System prompt */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#9b97b4]">
              AI 角色设定
              <span className="ml-1 text-[#5e5b78] font-normal">（可自定义人设）</span>
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => patch({ systemPrompt: e.target.value })}
              placeholder={DEFAULT_SYSTEM}
              rows={4}
              className="bg-[#12111a] border border-[#2e2c42] rounded-lg px-3 py-2 text-[13px] text-[#e8e6f0] placeholder:text-[#3a3852] outline-none focus:border-[#a78bfa]/40 resize-none leading-6 transition-colors"
            />
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
