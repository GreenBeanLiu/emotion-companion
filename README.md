# emotion-companion（pulomi）

桌面陪伴应用。Electron + React，带情绪状态、记忆、虚拟形象，接 B 站。

包名是 `pulomi`，仓库名是 `emotion-companion`。

## 跑起来

```bash
pnpm install
pnpm dev            # electron-vite dev
pnpm build
pnpm package        # electron-builder --win --publish always
```

**只发 Windows 产物**。`build/installer.nsh` 是 NSIS 安装器脚本。

## 结构

```
src/main/
  ai.ts          模型调用
  emotion.ts     情绪状态机
  memory.ts      记忆
  avatar.ts      形象
  bilibili.ts    B 站接入
  db.ts          本地库
  ipc.ts         主进程 ↔ 渲染层
src/renderer/    @lobehub/ui + radix-ui + tailwind
```

## 注意

`package` 脚本带 `--publish always`，会真的推 GitHub release。

`components.json` 是 shadcn/ui 的配置 —— 加组件用它的 CLI，别手抄。
