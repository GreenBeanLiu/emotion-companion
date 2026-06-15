import { useEffect, useState } from 'react'
import { createStyles } from 'antd-style'
import { Input, Select, Button, Segmented, Switch, Tabs } from 'antd'
import { X, Eye, EyeOff, Brain, Bell } from 'lucide-react'
import { api } from '../lib/api'

type Settings = {
  provider: 'claude' | 'openai'
  apiKey: string
  model: string
  baseUrl: string
  tikhubKey: string
  reminderEnabled: boolean
  reminderTime: string
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

const useStyles = createStyles(({ token, css }) => ({
  overlay: css`
    position: fixed;
    top: 0;
    left: 64px;
    right: 0;
    bottom: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    background: ${token.colorBgBase};
    border-left: 1px solid ${token.colorBorderSecondary};
  `,

  header: css`
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,

  headerTitle: css`
    font-size: 15px;
    font-weight: 600;
    color: ${token.colorText};
  `,

  closeBtn: css`
    width: 28px;
    height: 28px;
    border-radius: ${token.borderRadiusSM}px;
    border: none;
    background: transparent;
    color: ${token.colorTextTertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background ${token.motionDurationFast}, color ${token.motionDurationFast};
    outline: none;

    &:hover {
      background: ${token.colorFill};
      color: ${token.colorText};
    }
  `,

  body: css`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  `,

  tabContent: css`
    flex: 1;
    overflow-y: auto;
    padding: 28px 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    /* center the form content with max-width */
    align-items: center;
  `,

  form: css`
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,

  section: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  label: css`
    font-size: 13px;
    font-weight: 500;
    color: ${token.colorText};
    display: flex;
    align-items: center;
    gap: 6px;
  `,

  labelHint: css`
    font-size: 12px;
    font-weight: 400;
    color: ${token.colorTextTertiary};
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

  card: css`
    border-radius: ${token.borderRadiusLG}px;
    padding: 16px 18px;
    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorderSecondary};
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,

  cardHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,

  cardLeft: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,

  cardLabel: css`
    font-size: 13px;
    font-weight: 500;
    color: ${token.colorText};
  `,

  cardBadge: css`
    font-size: 10px;
    padding: 1px 8px;
    border-radius: 20px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    border: 1px solid ${token.colorPrimaryBorder};
  `,

  cardActions: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  cardAction: css`
    font-size: 12px;
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

  cardActionDanger: css`
    &:hover {
      color: ${token.colorError} !important;
    }
  `,

  cardHint: css`
    font-size: 12px;
    line-height: 1.7;
    color: ${token.colorTextSecondary};
    margin: 0;
  `,

  cardContent: css`
    font-size: 12px;
    line-height: 1.7;
    white-space: pre-wrap;
    font-family: ${token.fontFamily};
    color: ${token.colorTextSecondary};
  `,

  footer: css`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 24px;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
}))

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { styles, cx } = useStyles()
  const [settings, setSettings] = useState<Settings>({
    provider: 'claude',
    apiKey: '',
    model: '',
    baseUrl: '',
    tikhubKey: '',
    reminderEnabled: false,
    reminderTime: '20:00',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [profile, setProfile] = useState<{ summary: string; updatedAt: string } | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [version, setVersion] = useState('')
  const [notifResult, setNotifResult] = useState<'idle' | 'ok' | 'fail'>('idle')

  useEffect(() => {
    api.settings.load().then(setSettings)
    api.memory.get().then(setProfile)
    api.app.version().then(setVersion).catch(() => {})
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

  async function handleTestNotification() {
    const result = await api.notification.test()
    setNotifResult(result.ok ? 'ok' : 'fail')
    setTimeout(() => setNotifResult('idle'), 3000)
  }

  function patch(update: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...update }))
  }

  const isOpenAI = settings.provider === 'openai'
  const models = MODEL_OPTIONS[settings.provider]

  const aiTab = (
    <div className={styles.tabContent}>
      <div className={styles.form}>
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
            <p style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              支持 OpenAI、DeepSeek、Qwen、月之暗面等兼容 OpenAI 协议的服务
            </p>
          )}
        </div>

        {/* Base URL */}
        {isOpenAI && (
          <div className={styles.section}>
            <span className={styles.label}>
              API Base URL
              <span className={styles.labelHint}>不填则使用 OpenAI 官方</span>
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
                  className={cx(styles.presetBtn, settings.baseUrl === p.value && styles.presetBtnActive)}
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
            <span className={styles.labelHint}>本地加密存储，不上传</span>
          </span>
          <Input
            type={showKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => patch({ apiKey: e.target.value })}
            placeholder={settings.provider === 'claude' ? 'sk-ant-…' : 'sk-…'}
            suffix={
              <button
                onClick={() => setShowKey((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--ant-color-text-tertiary)', padding: 0 }}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            }
          />
        </div>

        {/* Model */}
        <div className={styles.section}>
          <span className={styles.label}>模型</span>
          <Select
            style={{ width: '100%' }}
            value={settings.model || undefined}
            onChange={(v) => patch({ model: v })}
            placeholder="默认推荐"
            options={models.map((m) => ({ label: m.label, value: m.value }))}
            allowClear
          />
          {isOpenAI && (
            <Input
              value={settings.model}
              onChange={(e) => patch({ model: e.target.value })}
              placeholder="或直接输入自定义模型名"
            />
          )}
        </div>

        {/* TikHub */}
        <div className={styles.section}>
          <span className={styles.label}>
            TikHub API Key
            <span className={styles.labelHint}>B站视频推荐，选填</span>
          </span>
          <Input.Password
            value={settings.tikhubKey}
            onChange={(e) => patch({ tikhubKey: e.target.value })}
            placeholder="填入后，负面情绪时自动推荐B站视频"
          />
        </div>
      </div>
    </div>
  )

  const profileTab = (
    <div className={styles.tabContent}>
      <div className={styles.form}>
        {/* Memory */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLeft}>
              <Brain size={15} color="var(--ant-color-text-tertiary)" />
              <span className={styles.cardLabel}>长期记忆</span>
              {profile ? (
                <span className={styles.cardBadge}>已记录</span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>暂无</span>
              )}
            </div>
            {profile && (
              <div className={styles.cardActions}>
                <button className={styles.cardAction} onClick={() => setShowProfile((v) => !v)}>
                  {showProfile ? '收起' : '查看'}
                </button>
                <button className={cx(styles.cardAction, styles.cardActionDanger)} onClick={handleClearMemory}>
                  清除
                </button>
              </div>
            )}
          </div>
          {!profile && (
            <p className={styles.cardHint}>
              聊天过程中会自动提炼你提到的信息，下次对话时角色会记得你。
            </p>
          )}
          {profile && showProfile && (
            <pre className={styles.cardContent}>{profile.summary}</pre>
          )}
        </div>

        {/* Daily reminder */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLeft}>
              <Bell size={15} color="var(--ant-color-text-tertiary)" />
              <span className={styles.cardLabel}>每日提醒</span>
            </div>
            <Switch
              size="small"
              checked={settings.reminderEnabled}
              onChange={(v) => patch({ reminderEnabled: v })}
            />
          </div>
          {settings.reminderEnabled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--ant-color-text-secondary)' }}>提醒时间</span>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => patch({ reminderTime: e.target.value })}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--ant-color-border)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: 13,
                  color: 'var(--ant-color-text)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              />
              <button
                onClick={handleTestNotification}
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--ant-color-border)',
                  background: 'transparent',
                  color: notifResult === 'ok'
                    ? 'var(--ant-color-success)'
                    : notifResult === 'fail'
                      ? 'var(--ant-color-error)'
                      : 'var(--ant-color-text-tertiary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {notifResult === 'ok' ? '✓ 通知正常' : notifResult === 'fail' ? '✗ 不支持' : '测试通知'}
              </button>
            </div>
          ) : (
            <p className={styles.cardHint}>开启后，每天固定时间收到来聊聊的提醒。</p>
          )}
        </div>

        {/* Character */}
        <div className={styles.card}>
          <div className={styles.cardLeft}>
            <span style={{ fontSize: 15 }}>🎭</span>
            <span className={styles.cardLabel}>角色设定</span>
          </div>
          <p className={styles.cardHint}>
            点击左侧导航栏底部的角色头像，可切换角色或上传自定义头像。
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>设置</span>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className={styles.body}>
        <Tabs
          defaultActiveKey="ai"
          size="small"
          style={{ padding: '0 24px', flexShrink: 0 }}
          tabBarStyle={{ marginBottom: 0 }}
          items={[
            { key: 'ai', label: 'AI 配置', children: aiTab },
            { key: 'profile', label: '个性化', children: profileTab },
          ]}
        />
      </div>

      <div className={styles.footer}>
        {version && (
          <span style={{ fontSize: 11, color: 'var(--ant-color-text-tertiary)', marginRight: 'auto' }}>
            v{version}
          </span>
        )}
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" loading={saving} onClick={handleSave}>
          {saved ? '已保存 ✓' : '保存设置'}
        </Button>
      </div>
    </div>
  )
}
