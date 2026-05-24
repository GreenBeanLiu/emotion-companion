import { theme } from 'antd'

const { darkAlgorithm } = theme

export const emotionTheme = {
  algorithm: darkAlgorithm,
  token: {
    // ── Background layers — warm charcoal (ebony with amber undertone) ──────
    colorBgLayout: '#0c0905',      // deepest: window chrome, nav rail
    colorBgBase: '#110d08',         // content areas
    colorBgContainer: '#1a1610',    // elevated surfaces, cards
    colorBgElevated: '#221d13',     // modals, popovers
    colorBgSpotlight: '#0c0905',
    colorBgMask: 'rgba(0,0,0,0.72)',

    // ── Fill states (interactive) ────────────────────────────────────────────
    colorFill: 'rgba(255,244,230,0.04)',
    colorFillSecondary: 'rgba(255,244,230,0.06)',
    colorFillTertiary: 'rgba(255,244,230,0.10)',
    colorFillQuaternary: 'rgba(255,244,230,0.02)',

    // ── Borders — warm-tinted ────────────────────────────────────────────────
    colorBorderSecondary: '#1e1912',
    colorBorder: '#2c2418',

    // ── Text — warm cream hierarchy ──────────────────────────────────────────
    colorText: '#ede8de',
    colorTextSecondary: '#a89888',
    colorTextTertiary: '#6a5e50',
    colorTextQuaternary: '#4e4438',
    colorTextPlaceholder: '#4e4438',
    colorTextDescription: '#6a5e50',
    colorTextDisabled: '#382c22',

    // ── Primary accent — warm amber (candlelight) ────────────────────────────
    colorPrimary: '#d48855',
    colorPrimaryHover: '#e8a070',
    colorPrimaryActive: '#bc7040',
    colorPrimaryBg: 'rgba(212,136,85,0.10)',
    colorPrimaryBgHover: 'rgba(212,136,85,0.15)',
    colorPrimaryBorder: 'rgba(212,136,85,0.22)',
    colorPrimaryBorderHover: 'rgba(212,136,85,0.42)',
    colorPrimaryText: '#d48855',
    colorPrimaryTextHover: '#e8a070',

    // ── Semantic ─────────────────────────────────────────────────────────────
    colorError: '#e07272',
    colorErrorBg: 'rgba(224,114,114,0.10)',
    colorErrorBorder: 'rgba(224,114,114,0.25)',
    colorSuccess: '#6db87a',
    colorSuccessBg: 'rgba(109,184,122,0.08)',
    colorSuccessBorder: 'rgba(109,184,122,0.20)',

    // ── Geometry ─────────────────────────────────────────────────────────────
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // ── Typography ───────────────────────────────────────────────────────────
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    lineHeight: 1.6,
    fontFamily:
      '"Segoe UI Variable", "Microsoft YaHei UI", "PingFang SC", -apple-system, "Segoe UI", sans-serif',

    // ── Motion ───────────────────────────────────────────────────────────────
    motionDurationFast: '0.12s',
    motionDurationMid: '0.20s',
    motionDurationSlow: '0.30s',
    motionEaseOut: 'cubic-bezier(0.23, 1, 0.32, 1)',

    // ── Control ──────────────────────────────────────────────────────────────
    controlHeight: 32,
    controlHeightSM: 26,
    controlHeightLG: 40,
  },
  components: {
    Modal: {
      contentBg: '#1a1610',
      headerBg: '#1a1610',
      footerBg: '#1a1610',
      titleFontSize: 14,
    },
    Input: {
      activeBorderColor: 'rgba(212,136,85,0.52)',
      hoverBorderColor: '#3a3020',
      colorBgContainer: '#110d08',
      colorBorder: '#2c2418',
    },
    Select: {
      colorBgContainer: '#110d08',
      colorBorder: '#2c2418',
    },
    Button: {
      defaultBorderColor: '#2c2418',
      defaultBg: '#1a1610',
      defaultColor: '#a89888',
    },
    Tooltip: {
      colorBgSpotlight: '#221d13',
      colorTextLightSolid: '#ede8de',
    },
    Scrollbar: {
      colorScrollbarThumb: '#2c2418',
      colorScrollbarThumbHover: '#6a5e50',
    },
  },
}
