# Palantir 工业风格 UI 改造方案

## 一、核心设计原则

### 1. 高密度信息展示
- 减少留白，一屏展示更多数据
- 紧凑的表格和列表（padding: 4-8px）
- 多面板分割布局（类似IDE）

### 2. 深色主题
- 主背景: `#0f1419` (接近纯黑)
- 次级背景: `#141b26`
- 面板背景: `#1a2332`
- 边框: `#2d3d52`

### 3. 专业工具感
- 等宽字体显示数据
- 状态指示器（彩色圆点）
- 命令行风格的日志输出
- 快捷键提示

## 二、具体改造清单

### Phase 1: 全局样式改造

#### 1.1 颜色系统替换
```typescript
// 替换所有文件中的颜色值
// 当前: bg-gray-50 → 目标: bg-[#0f1419]
// 当前: bg-white → 目标: bg-[#141b26]
// 当前: border-gray-200 → 目标: border-[#2d3d52]
// 当前: text-gray-900 → 目标: text-[#e2e8f0]
// 当前: text-gray-500 → 目标: text-[#64748b]
```

#### 1.2 间距压缩
```typescript
// 卡片 padding: p-5 → p-3
// 表格 cell padding: py-3 → py-1.5
// 标题 margin: mb-6 → mb-3
// 栅格间距: gap-4 → gap-2
```

#### 1.3 边框扁平化
```typescript
// 圆角: rounded-xl → rounded-sm
// 圆角: rounded-lg → rounded-sm
// 阴影: shadow-md → 移除（使用边框分隔）
```

### Phase 2: 布局重构

#### 2.1 统一三栏布局
```
┌─────────────────────────────────────────────────┐
│  Header (紧凑 40px)                              │
├──────────┬───────────────────────────┬──────────┤
│          │                           │          │
│  Left    │        Center             │  Right   │
│  Panel   │        (主内容)           │  Panel   │
│  (导航)   │                           │  (属性)  │
│          │                           │          │
├──────────┴───────────────────────────┴──────────┤
│  Status Bar (底部状态栏 24px)                    │
└─────────────────────────────────────────────────┘
```

#### 2.2 各页面改造重点

**Dashboard → 控制面板**
- 移除大标题和描述文字
- 状态卡片改为横向紧凑排列
- 搜索框放在顶部工具栏

**Configuration → 配置中心**
- 左侧固定导航面板
- 中间主要内容区
- 右侧可选属性面板
- 表格数据紧凑显示

**Chat → 对话界面**
- 左侧历史会话列表（窄栏）
- 中间对话区域
- 右侧上下文信息

### Phase 3: 组件改造

#### 3.1 表格组件
```typescript
// 当前
<tr className="py-3 px-4">

// 目标
<tr className="py-1.5 px-2 text-xs border-b border-[#2d3d52]">
  // 交替行背景
  <td className="font-mono text-[#64748b]">{code}</td>
  <td className="text-[#e2e8f0]">{name}</td>
  <td className="text-right">
    <span className={statusColor}>{value}</span>
  </td>
</tr>
```

#### 3.2 卡片组件
```typescript
// 当前 - 宽松卡片
<div className="bg-white rounded-xl p-5 shadow-md">

// 目标 - 紧凑面板
<div className="bg-[#141b26] border border-[#2d3d52] rounded-sm p-3">
  <div className="text-[10px] text-[#64748b] uppercase">Label</div>
  <div className="text-sm font-mono text-[#e2e8f0]">{value}</div>
</div>
```

#### 3.3 按钮组件
```typescript
// 当前
<button className="px-4 py-2 bg-blue-500 rounded-lg">

// 目标
<button className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] rounded-sm text-xs">
```

### Phase 4: 字体系统

#### 4.1 等宽字体用于数据
```typescript
// 安装字体
npm install @fontsource/jetbrains-mono

// 使用
<div className="font-mono text-xs">
  {data.code}
</div>
```

#### 4.2 字号层级
```
标题:   text-sm (14px)    font-semibold
正文:   text-xs (12px)    normal
辅助:   text-[10px]       uppercase
数据:   text-xs           font-mono
```

## 三、改造优先级

### P0 - 立即改造
1. 全局背景色改为深色
2. 所有卡片/面板改为紧凑样式
3. 表格数据密度提升

### P1 - 本周完成
1. 三栏布局统一
2. 字体系统调整
3. 状态指示器添加

### P2 - 后续优化
1. 动画效果（更快速）
2. 快捷键系统
3. 主题切换（保留浅色选项）

## 四、参考组件

已创建示例文件：
- `src/components/IndustrialLayout.tsx` - 完整布局示例
- `src/styles/palantir-theme.ts` - 主题配置

运行示例查看效果：
```tsx
import IndustrialLayout from './components/IndustrialLayout';

function App() {
  return <IndustrialLayout />;
}
```
