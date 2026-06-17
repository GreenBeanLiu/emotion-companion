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
    '"Geist Variable", Geist, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei UI", sans-serif',
  controlHeight: 36,
  controlHeightSM: 28,
  controlHeightLG: 40,
  motionDurationFast: '0.1s',
  motionDurationMid: '0.18s',
  motionDurationSlow: '0.26s',
  motionEaseOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
}

/**
 * LobeHub light theme — exact values from @lobehub/ui generateColorNeutralPalette + gray.light
 * gray.light:  [#fff,#f8f8f8,#eeeeee,#e3e3e3,#dddddd,#cccccc,#bbbbbb,#aaaaaa,#999999,#888888,#666666,#333333,#080808]
 * gray.lightA: [0.015,0.03,0.06,0.12,0.18,0.24,0.32,0.38,0.44,0.5,0.68,0.84,0.98]
 */
export const emotionLightTheme = {
  algorithm: defaultAlgorithm,
  token: {
    ...sharedTokens,
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
  },
  components: {
    Modal: { contentBg: '#ffffff', headerBg: '#ffffff', footerBg: '#ffffff', titleFontSize: 14 },
    Input: { activeBorderColor: '#aaaaaa', hoverBorderColor: '#bbbbbb', colorBgContainer: '#ffffff', colorBorder: '#e3e3e3' },
    Select: { colorBgContainer: '#ffffff', colorBorder: '#e3e3e3' },
    Button: { defaultBorderColor: '#e3e3e3', defaultBg: '#ffffff', defaultColor: '#666666' },
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
    colorBgMask: 'rgba(0,0,0,0.44)',

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

    ...sharedTokens,

    // ── Shadow — from darkBaseToken ──────────────────────────────────────────
    boxShadow: '0 20px 20px -8px rgba(0,0,0,0.24)',
    boxShadowSecondary: '0 8px 16px -4px rgba(0,0,0,0.2)',
  },
  components: {
    Modal: {
      contentBg: '#141414',
      headerBg: '#141414',
      footerBg: '#141414',
      titleFontSize: 14,
    },
    Input: {
      activeBorderColor: '#666666',
      hoverBorderColor: '#444444',
      colorBgContainer: '#141414',
      colorBorder: '#252525',
    },
    Select: {
      colorBgContainer: '#141414',
      colorBorder: '#252525',
    },
    Button: {
      defaultBorderColor: '#252525',
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
