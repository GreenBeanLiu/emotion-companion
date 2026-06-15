import { theme } from 'antd'

const { darkAlgorithm, defaultAlgorithm } = theme

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
    'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei UI", sans-serif',
  controlHeight: 36,
  controlHeightSM: 28,
  controlHeightLG: 44,
  motionDurationFast: '0.12s',
  motionDurationMid: '0.20s',
  motionDurationSlow: '0.30s',
  motionEaseOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
}

/**
 * LobeHub light theme — gray.light + primary.light from lobe-ui source
 * gray.light:  [#ffffff,#f9f9f9,#f0f0f0,#e8e8e8,#e0e0e0,#d0d0d0,#a8a8a8,#888888,#6a6a6a,#555555,#333333,#1a1a1a,#000000]
 * primary.light:[#ffffff,#f9f9f9,#f0f0f0,#e0e0e0,#c8c8c8,#aaaaaa,#888888,#555555,#333333,#111111,#000000,#000000,#000000]
 */
export const emotionLightTheme = {
  algorithm: defaultAlgorithm,
  token: {
    ...sharedTokens,
    colorBgLayout: '#f3f4f6',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgSpotlight: '#1f2937',
    colorBgMask: 'rgba(0,0,0,0.25)',
    colorFill: 'rgba(0,0,0,0.09)',
    colorFillSecondary: 'rgba(0,0,0,0.05)',
    colorFillTertiary: 'rgba(0,0,0,0.03)',
    colorFillQuaternary: 'rgba(0,0,0,0.015)',
    colorBorder: '#d1d5db',
    colorBorderSecondary: '#e5e7eb',
    colorText: '#000000',
    colorTextSecondary: '#555555',
    colorTextTertiary: '#888888',
    colorTextQuaternary: '#a8a8a8',
    colorTextPlaceholder: '#c0c0c0',
    colorTextDescription: '#888888',
    colorTextDisabled: '#d0d0d0',
    colorPrimary: '#111111',
    colorPrimaryHover: '#000000',
    colorPrimaryActive: '#333333',
    colorPrimaryBg: '#ffffff',
    colorPrimaryBgHover: '#f0f2f5',
    colorPrimaryBorder: '#9ca3af',
    colorPrimaryBorderHover: '#6b7280',
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
  },
  components: {
    Modal: { contentBg: '#ffffff', headerBg: '#ffffff', footerBg: '#ffffff', titleFontSize: 14 },
    Input: { activeBorderColor: '#aaaaaa', hoverBorderColor: '#c0c0c0', colorBgContainer: '#ffffff', colorBorder: '#e0e0e0' },
    Select: { colorBgContainer: '#ffffff', colorBorder: '#e0e0e0' },
    Button: { defaultBorderColor: '#e0e0e0', defaultBg: '#ffffff', defaultColor: '#555555' },
    Tooltip: { colorBgSpotlight: '#333333', colorTextLightSolid: '#ffffff' },
    Scrollbar: { colorScrollbarThumb: 'rgba(0,0,0,0.18)', colorScrollbarThumbHover: 'rgba(0,0,0,0.30)' },
  },
}

/**
 * LobeHub dark theme — values computed from lobe-ui source:
 * src/styles/theme/token/dark.ts + generateColorNeutralPalette(gray) + generateColorPalette(primary)
 *
 * gray.dark:  [#000000,#0d0d0d,#1a1a1a,#202020,#2d2d2d,#444444,#555555,#666666,#6f6f6f,#777777,#aaaaaa,#dddddd,#ffffff]
 * primary.dark:[#000000,#111111,#333333,#555555,#666666,#888888,#aaaaaa,#cccccc,#dddddd,#eeeeee,#ffffff,#ffffff,#ffffff]
 */
export const emotionTheme = {
  algorithm: darkAlgorithm,
  token: {
    // ── Background layers — LobeHub gray.dark ────────────────────────────────
    // colorBgLayout  = gray.dark[0]
    colorBgLayout: '#000000',
    // colorBgContainer = gray.dark[1]
    colorBgBase: '#0d0d0d',
    colorBgContainer: '#0d0d0d',
    // colorBgElevated = gray.dark[2]
    colorBgElevated: '#1a1a1a',
    // colorBgSpotlight = gray.dark[4]
    colorBgSpotlight: '#2d2d2d',
    colorBgMask: 'rgba(0,0,0,0.72)',

    // ── Fill states — gray.darkA ─────────────────────────────────────────────
    // colorFill = gray.darkA[3]
    colorFill: 'rgba(255,255,255,0.16)',
    // colorFillSecondary = gray.darkA[2]
    colorFillSecondary: 'rgba(255,255,255,0.10)',
    // colorFillTertiary = gray.darkA[1]
    colorFillTertiary: 'rgba(255,255,255,0.06)',
    // colorFillQuaternary = gray.darkA[0]
    colorFillQuaternary: 'rgba(255,255,255,0.02)',

    // ── Borders — gray.dark[2..3] ────────────────────────────────────────────
    colorBorder: '#202020',
    colorBorderSecondary: '#1a1a1a',

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

    ...sharedTokens,

    // ── Shadow — from darkBaseToken ──────────────────────────────────────────
    boxShadow: '0 20px 20px -8px rgba(0,0,0,0.24)',
    boxShadowSecondary: '0 8px 16px -4px rgba(0,0,0,0.2)',
  },
  components: {
    Modal: {
      contentBg: '#0d0d0d',
      headerBg: '#0d0d0d',
      footerBg: '#0d0d0d',
      titleFontSize: 14,
    },
    Input: {
      activeBorderColor: '#666666',
      hoverBorderColor: '#444444',
      colorBgContainer: '#0d0d0d',
      colorBorder: '#202020',
    },
    Select: {
      colorBgContainer: '#0d0d0d',
      colorBorder: '#202020',
    },
    Button: {
      defaultBorderColor: '#202020',
      defaultBg: '#0d0d0d',
      defaultColor: '#aaaaaa',
    },
    Tooltip: {
      colorBgSpotlight: '#2d2d2d',
      colorTextLightSolid: '#ffffff',
    },
    Scrollbar: {
      colorScrollbarThumb: 'rgba(255,255,255,0.16)',
      colorScrollbarThumbHover: 'rgba(255,255,255,0.28)',
    },
  },
}
