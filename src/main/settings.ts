import { safeStorage, app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import type { AiProvider } from './ai'

type SettingsData = {
  provider: AiProvider
  apiKey: string
  model: string
  baseUrl: string
  characterId: string
  systemPrompt: string
  customSystemPrompt: string
  tikhubKey: string
  reminderEnabled: boolean
  reminderTime: string
}

const DEFAULTS: SettingsData = {
  provider: 'claude',
  apiKey: '',
  model: '',
  baseUrl: '',
  characterId: 'doraemon',
  systemPrompt: '',
  customSystemPrompt: '',
  tikhubKey: '',
  reminderEnabled: false,
  reminderTime: '20:00',
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function readRaw(): Record<string, unknown> {
  const p = settingsPath()
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return {}
  }
}

function writeRaw(data: Record<string, unknown>): void {
  writeFileSync(settingsPath(), JSON.stringify(data, null, 2), 'utf-8')
}

export function loadSettings(): SettingsData {
  const raw = readRaw()
  let apiKey = ''

  if (raw.apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
    try {
      apiKey = safeStorage.decryptString(Buffer.from(raw.apiKeyEncrypted as string, 'base64'))
    } catch {
      apiKey = ''
    }
  } else if (typeof raw.apiKey === 'string') {
    apiKey = raw.apiKey
  }

  return {
    provider: (raw.provider as AiProvider) ?? DEFAULTS.provider,
    apiKey,
    model: (raw.model as string) ?? DEFAULTS.model,
    baseUrl: (raw.baseUrl as string) ?? DEFAULTS.baseUrl,
    characterId: (raw.characterId as string) ?? DEFAULTS.characterId,
    systemPrompt: (raw.systemPrompt as string) ?? DEFAULTS.systemPrompt,
    customSystemPrompt: (raw.customSystemPrompt as string) ?? DEFAULTS.customSystemPrompt,
    tikhubKey: (raw.tikhubKey as string) ?? DEFAULTS.tikhubKey,
    reminderEnabled: (raw.reminderEnabled as boolean) ?? DEFAULTS.reminderEnabled,
    reminderTime: (raw.reminderTime as string) ?? DEFAULTS.reminderTime,
  }
}

export function saveSettings(settings: SettingsData): void {
  const raw = readRaw()

  if (safeStorage.isEncryptionAvailable() && settings.apiKey) {
    raw.apiKeyEncrypted = safeStorage.encryptString(settings.apiKey).toString('base64')
    delete raw.apiKey
  } else {
    raw.apiKey = settings.apiKey
    delete raw.apiKeyEncrypted
  }

  raw.provider = settings.provider
  raw.model = settings.model
  raw.baseUrl = settings.baseUrl
  raw.characterId = settings.characterId
  raw.systemPrompt = settings.systemPrompt
  raw.customSystemPrompt = settings.customSystemPrompt
  raw.tikhubKey = settings.tikhubKey
  raw.reminderEnabled = settings.reminderEnabled
  raw.reminderTime = settings.reminderTime

  writeRaw(raw)
}
