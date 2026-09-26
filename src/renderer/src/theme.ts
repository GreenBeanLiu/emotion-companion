import { theme } from 'antd'

const { darkAlgorithm, defaultAlgorithm } = theme

type EmotionTheme = {
  algorithm: typeof darkAlgorithm | typeof defaultAlgorithm
  token: Record<string, unknown>
  components: Record<string, unknown>
}

const sharedTokens = {
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  borderRadiusXS: 4,
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  lineHeight: 1.6,
  fontFamily:
    '"Geist Variable", Geist, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei UI", sans-serif',
  controlHeight: 36,
  controlHeightSM: 28,
  controlHeightLG: 40,
  motionDurationFast: '0.1s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',
  motionEaseOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
}

/** Blend a base color with the current character's accent color. */
function mix(base: string, accent: string, accentPct: number): string {
  return `color-mix(in srgb, ${base} ${100 - accentPct}%, ${accent} ${accentPct}%)`
}

/**
 * LobeHub light theme — exact values from @lobehub/ui generateColorNeutralPalette + gray.light
 * gray.light:  [#fff,#f8f8f8,#eeeeee,#e3e3e3,#dddddd,#cccccc,#bbbbbb,#aaaaaa,#999999,#888888,#666666,#333333,#080808]
 * gray.lightA: [0.015,0.03,0.06,0.12,0.18,0.24,0.32,0.38,0.44,0.5,0.68,0.84,0.98]
 */
const lightBase = {
  colorBgLayout: '#f8f8f8',      // gray.light[1]
  colorBgBase: '#ffffff',        // gray.light[0]
  colorBgContainer: '#ffffff',   // gray.light[0]
  colorBgElevated: '#ffffff',    // gray.light[0]
  colorBgSpotlight: '#dddddd',   // gray.light[4]
  colorBgMask: 'rgba(0,0,0,0.44)',   // gray.lightA[8]
  colorFill: 'rgba(0,0,0,0.12)',         // lightA[3]
  colorFillSecondary: 'rgba(0,0,0,0.06)',  // lightA[2]
  colorFillTertiary: 'rgba(0,0,0,0.03)',   // lightA[1]
  colorFillQuaternary: 'rgba(0,0,0,0.015)', // lightA[0]
  colorBorder: '#e3e3e3',           // gray.light[3]
  colorBorderSecondary: '#eeeeee',  // gray.light[2]
  colorText: '#080808',             // gray.light[12]
  colorTextSecondary: '#666666',    // gray.light[10]
  colorTextTertiary: '#999999',     // gray.light[8]
  colorTextQuaternary: '#bbbbbb',   // gray.light[6]
  colorTextPlaceholder: '#cccccc',  // gray.light[5]
  colorTextDescription: '#999999',
  colorTextDisabled: '#dddddd',     // gray.light[4]
  colorPrimary: '#111111',
  colorPrimaryHover: '#000000',
  colorPrimaryActive: '#333333',
  colorPrimaryBg: '#f8f8f8',
  colorPrimaryBgHover: '#eeeeee',
  colorPrimaryBorder: '#aaaaaa',
  colorPrimaryBorderHover: '#888888',
  colorPrimaryText: '#111111',
  colorPrimaryTextHover: '#000000',
  colorError: '#ef4444',
  colorErrorBg: 'rgba(239,68,68,0.08)',
  colorErrorBorder: 'rgba(239,68,68,0.20)',
  colorSuccess: '#22c55e',
  colorSuccessBg: 'rgba(34,197,94,0.08)',
  colorSuccessBorder: 'rgba(34,197,94,0.20)',
  boxShadow: '0 20px 20px -8px rgba(0,0,0,0.08)',
  boxShadowSecondary: '0 8px 16px -4px rgba(0,0,0,0.06)',
}

/**
 * LobeHub dark theme — values computed from lobe-ui source:
 * src/styles/theme/token/dark.ts + generateColorNeutralPalette(gray) + generateColorPalette(primary)
 *
 * gray.dark:  [#000000,#0d0d0d,#1a1a1a,#202020,#2d2d2d,#444444,#555555,#666666,#6f6f6f,#777777,#aaaaaa,#dddddd,#ffffff]
 * primary.dark:[#000000,#111111,#333333,#555555,#666666,#888888,#aaaaaa,#cccccc,#dddddd,#eeeeee,#ffffff,#ffffff,#ffffff]
 */
const darkBase = {
  // ── Background layers — LobeHub gray.dark ────────────────────────────────
  colorBgLayout: '#000000',
  colorBgBase: '#0d0d0d',
  colorBgContainer: '#0d0d0d',
  colorBgElevated: '#1a1a1a',
  colorBgSpotlight: '#2d2d2d',
  colorBgMask: 'rgba(0,0,0,0.44)',

  // ── Fill states — gray.darkA ─────────────────────────────────────────────
  colorFill: 'rgba(255,255,255,0.16)',
  colorFillSecondary: 'rgba(255,255,255,0.10)',
  colorFillTertiary: 'rgba(255,255,255,0.06)',
  colorFillQuaternary: 'rgba(255,255,255,0.02)',

  // ── Borders — gray.dark[2..3] ────────────────────────────────────────────
  colorBorder: '#252525',
  colorBorderSecondary: '#1e1e1e',

  // ── Text — gray.dark[6..12] ──────────────────────────────────────────────
  colorText: '#ffffff',
  colorTextSecondary: '#aaaaaa',
  colorTextTertiary: '#6f6f6f',
  colorTextQuaternary: '#555555',
  colorTextPlaceholder: '#444444',
  colorTextDescription: '#6f6f6f',
  colorTextDisabled: '#333333',

  // ── Primary accent — primary.dark (near-white) ───────────────────────────
  colorPrimary: '#eeeeee',
  colorPrimaryHover: '#ffffff',
  colorPrimaryActive: '#cccccc',
  colorPrimaryBg: '#111111',
  colorPrimaryBgHover: '#333333',
  colorPrimaryBorder: '#666666',
  colorPrimaryBorderHover: '#888888',
  colorPrimaryText: '#eeeeee',
  colorPrimaryTextHover: '#ffffff',

  // ── Semantic ─────────────────────────────────────────────────────────────
  colorError: '#f87171',
  colorErrorBg: 'rgba(248,113,113,0.10)',
  colorErrorBorder: 'rgba(248,113,113,0.25)',
  colorSuccess: '#4ade80',
  colorSuccessBg: 'rgba(74,222,128,0.08)',
  colorSuccessBorder: 'rgba(74,222,128,0.20)',

  // ── Shadow — from darkBaseToken ──────────────────────────────────────────
  boxShadow: '0 20px 20px -8px rgba(0,0,0,0.24)',
  boxShadowSecondary: '0 8px 16px -4px rgba(0,0,0,0.2)',
}

/**
 * Builds the antd theme for the given appearance, tinting the structural
 * (background/border/fill) tokens with the active character's accent color.
 * Keeps text/primary/semantic tokens untouched so contrast and readability
 * stay stable across characters — only the "room" the chat happens in
 * picks up the character's color, not the content.
 */
export function buildEmotionTheme(mode: 'dark' | 'light', accent: string): EmotionTheme {
  const base = mode === 'dark' ? darkBase : lightBase

  const tinted = {
    colorBgLayout: mix(base.colorBgLayout, accent, 5),
    colorBgBase: mix(base.colorBgBase, accent, 4),
    colorBgContainer: mix(base.colorBgContainer, accent, 4),
    colorBgElevated: mix(base.colorBgElevated, accent, 6),
    colorBgSpotlight: mix(base.colorBgSpotlight, accent, 8),
    colorFillTertiary: mix(base.colorFillTertiary, accent, 10),
    colorFillQuaternary: mix(base.colorFillQuaternary, accent, 8),
    colorBorder: mix(base.colorBorder, accent, 12),
    colorBorderSecondary: mix(base.colorBorderSecondary, accent, 10),
  }

  const token = { ...base, ...sharedTokens, ...tinted }

  return {
    algorithm: mode === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token,
    components: {
      Modal: {
        contentBg: tinted.colorBgElevated,
        headerBg: tinted.colorBgElevated,
        footerBg: tinted.colorBgElevated,
        titleFontSize: 14,
      },
      Input: {
        activeBorderColor: mode === 'dark' ? '#666666' : '#aaaaaa',
        hoverBorderColor: mode === 'dark' ? '#444444' : '#bbbbbb',
        colorBgContainer: tinted.colorBgContainer,
        colorBorder: tinted.colorBorder,
      },
      Select: {
        colorBgContainer: tinted.colorBgContainer,
        colorBorder: tinted.colorBorder,
      },
      Button: {
        defaultBorderColor: tinted.colorBorder,
        defaultBg: tinted.colorBgContainer,
        defaultColor: base.colorTextSecondary,
      },
      Tooltip: {
        colorBgSpotlight: mode === 'dark' ? '#2d2d2d' : '#333333',
        colorTextLightSolid: '#ffffff',
      },
      Scrollbar: {
        colorScrollbarThumb: mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)',
        colorScrollbarThumbHover: mode === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.30)',
      },
    },
  }
}
