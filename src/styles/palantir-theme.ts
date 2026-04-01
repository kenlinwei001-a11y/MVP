// Palantir 工业风格主题配置 - 高对比度配色方案
export const industrialTheme = {
  // 背景层级 - 增加层次感和对比度
  bg: {
    primary: '#1e293b',      // 主背景 (slate-800) - 蓝灰
    secondary: '#334155',    // 次级背景 (slate-700) - 侧边栏
    tertiary: '#475569',     // 高亮区域
    card: '#253449',         // 卡片背景 - 提亮增加对比
    panel: '#1a2332',        // 面板背景
    input: '#0f172a',        // 输入框背景 - 更深
    hover: '#2d3d52',        // 悬停背景
    active: '#3d4f6f',       // 激活背景
  },

  // 边框 - 增加可见度
  border: {
    primary: '#3d5166',      // 主边框 - 提亮
    secondary: '#334155',    // 次级边框
    tertiary: '#2d3d52',     // 弱边框
    accent: '#5a6f85',       // 强调边框
  },

  // 文字 - 全面提亮增加可读性
  text: {
    primary: '#ffffff',      // 主文字 - 纯白
    secondary: '#f1f5f9',    // 次要文字 - 接近白(slate-100)
    tertiary: '#cbd5e1',     // 辅助文字 - 提亮(slate-300)
    muted: '#94a3b8',        // 淡化文字 - 原slate-500太暗
    disabled: '#64748b',     // 禁用文字(slate-500)
    code: '#10b981',         // 代码/表达式颜色
  },

  // 强调色 - 工业蓝橙
  accent: {
    primary: '#3b82f6',      // 工业蓝
    success: '#22c55e',      // 数据绿
    warning: '#f59e0b',      // 警示橙
    danger: '#ef4444',       // 告警红
    info: '#06b6d4',         // 信息青
  },

  // 数据可视化色板
  data: {
    blue: '#3b82f6',
    cyan: '#06b6d4',
    green: '#22c55e',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
  },

  // 卡片背景
  card: {
    bg: '#253449',           // 卡片背景 - 提亮
    border: '#3d5166',       // 卡片边框 - 提亮
    hover: '#2d3d52',        // 卡片悬停
  },

  // 表格
  table: {
    header: '#334155',       // 表头背景 - 提亮
    rowEven: '#1e293b',      // 偶数行
    rowOdd: '#253449',       // 奇数行 - 增加与偶数行对比
    hover: '#2d3d52',        // 悬停行
  },

  // 字体
  font: {
    mono: '"JetBrains Mono", "Fira Code", monospace',
    sans: '"Inter", -apple-system, sans-serif',
  },

  // 间距 - 紧凑
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // 边框半径 - 扁平
  radius: {
    sm: '2px',
    md: '4px',
    lg: '6px',
  },
};

// CSS 类名快捷方式 - 高对比度版本
export const themeClasses = {
  // 背景
  bgPrimary: 'bg-[#1e293b]',
  bgSecondary: 'bg-[#334155]',
  bgTertiary: 'bg-[#475569]',
  bgCard: 'bg-[#253449]',
  bgPanel: 'bg-[#1a2332]',
  bgInput: 'bg-[#0f172a]',
  bgHover: 'hover:bg-[#2d3d52]',

  // 边框
  border: 'border-[#3d5166]',
  borderSecondary: 'border-[#334155]',
  borderTertiary: 'border-[#2d3d52]',

  // 文字 - 高对比度
  textPrimary: 'text-[#ffffff]',
  textSecondary: 'text-[#f1f5f9]',
  textTertiary: 'text-[#cbd5e1]',
  textMuted: 'text-[#94a3b8]',
  textDisabled: 'text-[#64748b]',

  // 卡片
  card: 'bg-[#253449] border border-[#3d5166]',
  cardHover: 'hover:border-[#5a6f85]',
};

export default industrialTheme;
