import { useEffect, useState } from 'react'
import { Eye, EyeOff, Brain, Palette, ExternalLink } from 'lucide-react'
import { api } from '../lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Settings = {
  provider: 'claude' | 'openai'
  apiKey: string
  model: string
  baseUrl: string
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
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  ],
}

const BASE_URL_PRESETS = [
  { label: 'OpenAI', value: 'https://api.openai.com' },
  { label: 'DeepSeek', value: 'https://api.deepseek.com' },
  { label: 'Qwen', value: 'https://dashscope.aliyuncs.com/compatible-mode' },
  { label: '月之暗面', value: 'https://api.moonshot.cn' },
]

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    provider: 'claude',
    apiKey: '',
    model: '',
    baseUrl: '',
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
  const isOpenAI = settings.provider === 'openai'

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden"
        style={{ background: '#1c1b28', border: '1px solid #2e2c42' }}
      >
        <DialogHeader className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #2e2c42' }}>
          <DialogTitle className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>设置</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto" style={{ maxHeight: '72vh' }}>

          {/* Provider */}
          <section className="flex flex-col gap-2.5">
            <FieldLabel>AI 提供商</FieldLabel>
            <div className="flex gap-2">
              {(['claude', 'openai'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => patch({ provider: p, model: '', baseUrl: '' })}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-[13px] font-medium border transition-all',
                    settings.provider === p
                      ? 'border-[#a78bfa]/50 bg-[#a78bfa]/10 text-[#a78bfa]'
                      : 'text-[#5e5b78] hover:text-[#9b97b4]',
                  )}
                  style={{ borderColor: settings.provider !== p ? '#2e2c42' : undefined }}
                >
                  {p === 'claude' ? 'Claude (Anthropic)' : 'OpenAI 兼容'}
                </button>
              ))}
            </div>
            {isOpenAI && (
              <p className="text-[11px] leading-5" style={{ color: '#5e5b78' }}>
                支持 OpenAI、DeepSeek、Qwen、月之暗面等兼容 OpenAI 协议的服务
              </p>
            )}
          </section>

          {/* Base URL (OpenAI only) */}
          {isOpenAI && (
            <section className="flex flex-col gap-2.5">
              <FieldLabel hint="不填则使用 OpenAI 官方">API Base URL</FieldLabel>
              <Input
                type="text"
                value={settings.baseUrl}
                onChange={(e) => patch({ baseUrl: e.target.value })}
                placeholder="https://api.openai.com"
                className="h-9 text-[13px] bg-[#12111a] border-[#2e2c42] focus-visible:ring-[#a78bfa]/30 text-[#e8e6f0] placeholder:text-[#3a3852]"
              />
              <div className="flex flex-wrap gap-1.5">
                {BASE_URL_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => patch({ baseUrl: preset.value })}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] border transition-all',
                      settings.baseUrl === preset.value
                        ? 'border-[#a78bfa]/40 bg-[#a78bfa]/10 text-[#a78bfa]'
                        : 'border-[#2e2c42] text-[#5e5b78] hover:border-[#3e3c52] hover:text-[#9b97b4]',
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* API Key */}
          <section className="flex flex-col gap-2.5">
            <FieldLabel hint="本地加密存储，不上传">API Key</FieldLabel>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => patch({ apiKey: e.target.value })}
                placeholder={settings.provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
                className="flex-1 h-9 text-[13px] bg-[#12111a] border-[#2e2c42] focus-visible:ring-[#a78bfa]/30 text-[#e8e6f0] placeholder:text-[#3a3852]"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="px-3 h-9 rounded-lg border text-[12px] flex items-center gap-1.5 transition-colors shrink-0"
                style={{ borderColor: '#2e2c42', color: '#5e5b78', background: '#12111a' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#9b97b4' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#5e5b78' }}
              >
                {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showKey ? '隐藏' : '显示'}</span>
              </button>
            </div>
          </section>

          {/* Model */}
          <section className="flex flex-col gap-2.5">
            <FieldLabel>模型</FieldLabel>
            <div className="flex gap-2">
              <select
                value={settings.model}
                onChange={(e) => patch({ model: e.target.value })}
                className="flex-1 h-9 rounded-lg border px-3 text-[13px] outline-none transition-colors appearance-none"
                style={{
                  background: '#12111a',
                  borderColor: '#2e2c42',
                  color: settings.model ? '#e8e6f0' : '#5e5b78',
                }}
              >
                <option value="">默认推荐</option>
                {models.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {isOpenAI && (
                <Input
                  type="text"
                  value={settings.model}
                  onChange={(e) => patch({ model: e.target.value })}
                  placeholder="或直接输入模型名"
                  className="flex-1 h-9 text-[13px] bg-[#12111a] border-[#2e2c42] focus-visible:ring-[#a78bfa]/30 text-[#e8e6f0] placeholder:text-[#3a3852]"
                />
              )}
            </div>
          </section>

          {/* TikHub Key */}
          <section className="flex flex-col gap-2.5">
            <FieldLabel hint="B站视频推荐，选填">TikHub API Key</FieldLabel>
            <Input
              type="password"
              value={settings.tikhubKey}
              onChange={(e) => patch({ tikhubKey: e.target.value })}
              placeholder="填入后，负面情绪时自动推荐B站视频"
              className="h-9 text-[13px] bg-[#12111a] border-[#2e2c42] focus-visible:ring-[#a78bfa]/30 text-[#e8e6f0] placeholder:text-[#3a3852]"
            />
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: '#2e2c42' }} />

          {/* Character note */}
          <InfoCard
            icon={<Palette size={14} style={{ color: '#a78bfa' }} />}
            title="角色设定"
          >
            在侧边栏底部点击角色名称，可切换或自定义角色人设。
          </InfoCard>

          {/* Memory */}
          <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#12111a', border: '1px solid #2e2c42' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={14} style={{ color: '#a78bfa' }} />
                <span className="text-[12px] font-medium" style={{ color: '#9b97b4' }}>长期记忆</span>
                {profile ? (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}
                  >
                    已记录
                  </span>
                ) : (
                  <span className="text-[11px]" style={{ color: '#3a3852' }}>暂无</span>
                )}
              </div>
              {profile && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowProfile((v) => !v)}
                    className="text-[11px] transition-colors"
                    style={{ color: '#5e5b78' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#9b97b4' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#5e5b78' }}
                  >
                    {showProfile ? '收起' : '查看'}
                  </button>
                  <button
                    onClick={handleClearMemory}
                    className="text-[11px] transition-colors"
                    style={{ color: 'rgba(248,113,113,0.6)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(248,113,113,0.6)' }}
                  >
                    清除
                  </button>
                </div>
              )}
            </div>
            {!profile && (
              <p className="text-[11px] leading-relaxed" style={{ color: '#3a3852' }}>
                聊天过程中会自动提炼你提到的信息，下次对话时角色会记得你。
              </p>
            )}
            {profile && showProfile && (
              <pre className="mt-1 text-[11px] leading-6 whitespace-pre-wrap font-sans" style={{ color: '#7b78a0' }}>
                {profile.summary}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: '1px solid #2e2c42' }}
        >
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-9 px-4 text-[13px]"
            style={{ color: '#9b97b4' }}
          >
            取消
          </Button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            {saved ? '已保存 ✓' : saving ? '保存中…' : '保存设置'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: '#9b97b4' }}>
      {children}
      {hint && <span className="font-normal" style={{ color: '#4a4768' }}>（{hint}）</span>}
    </label>
  )
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#12111a', border: '1px solid #2e2c42' }}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium" style={{ color: '#9b97b4' }}>{title}</p>
        <p className="text-[12px] leading-relaxed" style={{ color: '#4a4768' }}>{children}</p>
      </div>
    </div>
  )
}
