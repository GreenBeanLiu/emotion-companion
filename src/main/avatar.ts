import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

type AvatarStore = Record<string, string>  // characterId → dataUrl

function avatarPath(): string {
  return join(app.getPath('userData'), 'avatars.json')
}

function readStore(): AvatarStore {
  const p = avatarPath()
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return {}
  }
}

function writeStore(store: AvatarStore): void {
  writeFileSync(avatarPath(), JSON.stringify(store), 'utf-8')
}

export function getAvatars(): AvatarStore {
  return readStore()
}

export function setAvatar(characterId: string, dataUrl: string): void {
  const store = readStore()
  store[characterId] = dataUrl
  writeStore(store)
}

export function clearAvatar(characterId: string): void {
  const store = readStore()
  delete store[characterId]
  writeStore(store)
}
