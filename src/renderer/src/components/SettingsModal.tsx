import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import { Modal, Input, Select, Button, Segmented, Divider } from 'antd'
import { Eye, EyeOff, Brain, Palette } from 'lucide-react'
import { api } from '../lib/api'

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

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const useStyles = createStyles(({ token, css }) => ({
  body: css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-height: 68vh;
    overflow-y: auto;
    padding: 20px 24px;
  `,

  section: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  label: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    gap: 6px;
  `,

  labelHint: css`
    font-weight: 400;
    color: ${token.colorTextQuaternary};
  `,

  presetRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  `,

  presetBtn: css`
    padding: 3px 10px;
    border-radius: ${token.borderRadiusSM}px;
    font-size: 11px;
    border: 1px solid ${token.colorBorder};
    background: transparent;
    color: ${token.colorTextTertiary};
    cursor: pointer;
    transition: all ${token.motionDurationFast};
    outline: none;
    font-family: ${token.fontFamily};

    &:hover {
      border-color: ${token.colorPrimaryBorder};
      color: ${token.colorTextSecondary};
    }
  `,

  presetBtnActive: css`
    border-color: ${token.colorPrimaryBorder} !important;
    background: ${token.colorPrimaryBg} !important;
    color: ${token.colorPrimary} !important;
  `,

  infoCard: css`
    border-radius: ${token.borderRadius}px;
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorderSecondary};
  `,

  infoCardIcon: css`
    margin-top: 1px;
    flex-shrink: 0;
  `,

  infoCardTitle: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
    margin-bottom: 4px;
  `,

  infoCardText: css`
    font-size: 12px;
    line-height: 1.6;
    color: ${token.colorTextQuaternary};
  `,

  memoryCard: css`
    border-radius: ${token.borderRadius}px;
    padding: 14px 16px;
    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorderSecondary};
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  memoryHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,

  memoryLeft: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,

  memoryLabel: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,

  memoryBadge: css`
    font-size: 10px;
    padding: 1px 8px;
    border-radius: 20px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    border: 1px solid ${token.colorPrimaryBorder};
  `,

  memoryActions: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  memoryAction: css`
    font-size: 11px;
    background: none;
    border: none;
    cursor: pointer;
    color: ${token.colorTextTertiary};
    transition: color ${token.motionDurationFast};
    padding: 0;
    outline: none;
    font-family: ${token.fontFamily};

    &:hover {
      color: ${token.colorTextSecondary};
    }
  `,

  memoryActionDanger: css`
    &:hover {
      color: ${token.colorError} !important;
    }
  `,

  memoryEmpty: css`
    font-size: 11px;
    line-height: 1.7;
    color: ${token.colorTextDisabled};
  `,

  memoryContent: css`
    font-size: 11px;
    line-height: 1.7;
    white-space: pre-wrap;
    font-family: ${token.fontFamily};
    color: ${token.colorTextTertiary};
  `,

  footer: css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 24px;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
}))

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { styles, cx } = useStyles()
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
    const existing = await api.settings.load()
    await api.settings.save({ ...existing, ...settings })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function patch(update: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...update }))
  }

  const isOpenAI = settings.provider === 'openai'
  const models = MODEL_OPTIONS[settings.provider]

  return (
    <Modal
      open
      onCancel={onClose}
      title="设置"
      footer={null}
      width={480}
      centered
      styles={{ body: { padding: 0 }, header: { padding: '18px 24px 14px', margin: 0 } }}
    >
      <div className={styles.body}>

        {/* Provider */}
        <div className={styles.section}>
          <span className={styles.label}>AI 提供商</span>
          <Segmented
            value={settings.provider}
            onChange={(v) => patch({ provider: v as 'claude' | 'openai', model: '', baseUrl: '' })}
            options={[
              { label: 'Claude (Anthropic)', value: 'claude' },
              { label: 'OpenAI 兼容', value: 'openai' },
            ]}
            block
          />
          {isOpenAI && (
            <p style={{ fontSize: 11, color: '#5e5b78', lineHeight: 1.6, marginTop: 2 }}>
              支持 OpenAI、DeepSeek、Qwen、月之暗面等兼容 OpenAI 协议的服务
            </p>
          )}
        </div>

        {/* Base URL (OpenAI only) */}
        {isOpenAI && (
          <div className={styles.section}>
            <span className={styles.label}>
              API Base URL
              <span className={styles.labelHint}>（不填则使用 OpenAI 官方）</span>
            </span>
            <Input
              value={settings.baseUrl}
              onChange={(e) => patch({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com"
            />
            <div className={styles.presetRow}>
              {BASE_URL_PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={cx(
                    styles.presetBtn,
                    settings.baseUrl === p.value && styles.presetBtnActive,
                  )}
                  onClick={() => patch({ baseUrl: p.value })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* API Key */}
        <div className={styles.section}>
          <span className={styles.label}>
            API Key
            <span className={styles.labelHint}>（本地加密存储，不上传）</span>
          </span>
          <Input
            type={showKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => patch({ apiKey: e.target.value })}
            placeholder={settings.provider === 'claude' ? 'sk-ant-…' : 'sk-…'}
            suffix={
              <button
                onClick={() => setShowKey((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5e5b78', padding: 0 }}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            }
          />
        </div>

        {/* Model */}
        <div className={styles.section}>
          <span className={styles.label}>模型</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Select
              style={{ flex: 1 }}
              value={settings.model || undefined}
              onChange={(v) => patch({ model: v })}
              placeholder="默认推荐"
              options={models.map((m) => ({ label: m.label, value: m.value }))}
              allowClear
            />
            {isOpenAI && (
              <Input
                style={{ flex: 1 }}
                value={settings.model}
                onChange={(e) => patch({ model: e.target.value })}
                placeholder="或直接输入模型名"
              />
            )}
          </div>
        </div>

        {/* TikHub Key */}
        <div className={styles.section}>
          <span className={styles.label}>
            TikHub API Key
            <span className={styles.labelHint}>（B站视频推荐，选填）</span>
          </span>
          <Input.Password
            value={settings.tikhubKey}
            onChange={(e) => patch({ tikhubKey: e.target.value })}
            placeholder="填入后，负面情绪时自动推荐B站视频"
          />
        </div>

        <Divider style={{ margin: '0' }} />

        {/* Character info */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>
            <Palette size={14} color="#d48855" />
          </div>
          <div>
            <p className={styles.infoCardTitle}>角色设定</p>
            <p className={styles.infoCardText}>
              点击左侧导航栏底部的角色头像，可切换或自定义角色人设。
            </p>
          </div>
        </div>

        {/* Memory */}
        <div className={styles.memoryCard}>
          <div className={styles.memoryHeader}>
            <div className={styles.memoryLeft}>
              <Brain size={14} color="#d48855" />
              <span className={styles.memoryLabel}>长期记忆</span>
              {profile ? (
                <span className={styles.memoryBadge}>已记录</span>
              ) : (
                <span style={{ fontSize: 11, color: '#3a3852' }}>暂无</span>
              )}
            </div>
            {profile && (
              <div className={styles.memoryActions}>
                <button
                  className={styles.memoryAction}
                  onClick={() => setShowProfile((v) => !v)}
                >
                  {showProfile ? '收起' : '查看'}
                </button>
                <button
                  className={cx(styles.memoryAction, styles.memoryActionDanger)}
                  onClick={handleClearMemory}
                >
                  清除
                </button>
              </div>
            )}
          </div>
          {!profile && (
            <p className={styles.memoryEmpty}>
              聊天过程中会自动提炼你提到的信息，下次对话时角色会记得你。
            </p>
          )}
          {profile && showProfile && (
            <pre className={styles.memoryContent}>{profile.summary}</pre>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" loading={saving} onClick={handleSave}>
          {saved ? '已保存 ✓' : '保存设置'}
        </Button>
      </div>
    </Modal>
  )
}
