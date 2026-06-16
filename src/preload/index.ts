import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 暴露给渲染层的 API（通过 contextBridge 隔离，安全）
const api = {
  // 窗口控制
  win: {
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
    close: () => ipcRenderer.send('win:close'),
  },

  // 设置
  settings: {
    load: () => ipcRenderer.invoke('settings:load'),
    save: (s: unknown) => ipcRenderer.invoke('settings:save', s),
  },

  // 对话列表
  conv: {
    list: () => ipcRenderer.invoke('conv:list'),
    create: (title?: string) => ipcRenderer.invoke('conv:create', title),
    rename: (id: number, title: string) => ipcRenderer.invoke('conv:rename', id, title),
    delete: (id: number) => ipcRenderer.invoke('conv:delete', id),
    onTitleUpdated: (cb: (data: { conversationId: number; title: string }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('conv:title-updated', handler)
      return () => ipcRenderer.off('conv:title-updated', handler)
    },
  },

  // 消息
  msg: {
    list: (conversationId: number) => ipcRenderer.invoke('msg:list', conversationId),
    deleteFrom: (conversationId: number, fromMessageId: number) =>
      ipcRenderer.invoke('msg:deleteFrom', conversationId, fromMessageId),
  },

  // 长期记忆
  memory: {
    get: () => ipcRenderer.invoke('memory:get'),
    clear: () => ipcRenderer.invoke('memory:clear'),
  },

  // 聊天（流式）
  chat: {
    send: (payload: {
      conversationId: number
      content: string
      history: { role: 'user' | 'assistant'; content: string }[]
    }) => ipcRenderer.invoke('chat:send', payload),
    abort: (conversationId: number) => ipcRenderer.invoke('chat:abort', conversationId),
    onChunk: (cb: (data: { conversationId: number; chunk: string }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('chat:chunk', handler)
      return () => ipcRenderer.off('chat:chunk', handler)
    },
    onDone: (cb: (data: { conversationId: number }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('chat:done', handler)
      return () => ipcRenderer.off('chat:done', handler)
    },
    onEmotionUpdate: (cb: (data: { messageId: number; emotion: string }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('emotion:update', handler)
      return () => ipcRenderer.off('emotion:update', handler)
    },
    onBilibiliResults: (cb: (data: {
      messageId: number
      keyword: string
      videos: { bvid: string; title: string; cover: string; author: string; play: number; duration: string }[]
    }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('bilibili:results', handler)
      return () => ipcRenderer.off('bilibili:results', handler)
    },
  },

  stats: {
    emotions: () => ipcRenderer.invoke('stats:emotions'),
  },

  avatar: {
    getAll: () => ipcRenderer.invoke('avatar:getAll'),
    set: (characterId: string, dataUrl: string) => ipcRenderer.invoke('avatar:set', characterId, dataUrl),
    clear: (characterId: string) => ipcRenderer.invoke('avatar:clear', characterId),
  },

  update: {
    onAvailable: (cb: (data: { version: string }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('update:available', handler)
      return () => ipcRenderer.off('update:available', handler)
    },
    onDownloaded: (cb: (data: { version: string }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('update:downloaded', handler)
      return () => ipcRenderer.off('update:downloaded', handler)
    },
    onError: (cb: (data: { message: string }) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as never)
      ipcRenderer.on('update:error', handler)
      return () => ipcRenderer.off('update:error', handler)
    },
    install: () => ipcRenderer.send('update:install'),
  },

  app: {
    version: () => ipcRenderer.invoke('app:version'),
  },

  notification: {
    test: () => ipcRenderer.invoke('notification:test'),
  },
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
