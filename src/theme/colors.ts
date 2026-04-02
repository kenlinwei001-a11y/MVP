/**
 * 浅色主题配色方案
 * 基于用户反馈调整：提高对比度，改善可读性
 */

export const lightTheme = {
  // 背景色
  bg: {
    primary: '#f8fafc',    // 主背景 - 极浅灰蓝
    secondary: '#ffffff',  // 卡片/面板背景 - 纯白
    tertiary: '#f1f5f9',   // 输入框、hover状态 - 浅灰蓝
    quaternary: '#e2e8f0', // 更深的背景层次
  },

  // 侧边栏/导航（深蓝框体 - 保留深色导航质感）
  sidebar: {
    bg: '#1e3a5f',         // 深海蓝背景
    bgHover: '#2a4a6f',    // hover状态
    bgActive: '#3b82f6',   // 激活状态
    text: '#ffffff',       // 主要文字
    textMuted: '#94a3b8',  // 次要文字
    border: '#2a4a6f',     // 边框
  },

  // 顶部栏
  header: {
    bg: '#1e3a5f',         // 深海蓝
    text: '#ffffff',
    border: '#2a4a6f',
  },

  // 文字颜色
  text: {
    primary: '#1e293b',    // 主要文字 - 深灰蓝（对比度 8.5:1）
    secondary: '#475569',  // 次要文字 - 中灰蓝
    muted: '#64748b',      // 辅助文字
    placeholder: '#94a3b8', // placeholder
    inverse: '#ffffff',    // 深色背景上的文字
  },

  // 边框
  border: {
    default: '#e2e8f0',    // 默认边框
    hover: '#cbd5e1',      // hover状态
    focus: '#3b82f6',      // 聚焦状态
    accent: '#3b82f6',     // 强调边框
  },

  // 强调色
  accent: {
    primary: '#3b82f6',    // 主蓝色
    primaryHover: '#2563eb', // hover状态
    primaryLight: '#eff6ff', // 浅色背景
  },

  // 功能色
  status: {
    success: '#10b981',
    successBg: '#d1fae5',
    warning: '#f59e0b',
    warningBg: '#fef3c7',
    error: '#ef4444',
    errorBg: '#fee2e2',
    info: '#3b82f6',
    infoBg: '#dbeafe',
  },

  // 按钮
  button: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#f1f5f9',
    secondaryHover: '#e2e8f0',
    ghost: 'transparent',
    ghostHover: '#f1f5f9',
  },
};

// 旧深色主题（保留用于对比）
export const darkTheme = {
  bg: {
    primary: '#1e293b',
    secondary: '#334155',
    tertiary: '#253449',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
  },
  border: {
    default: '#3d5166',
    hover: '#475569',
    focus: '#3b82f6',
  },
};
