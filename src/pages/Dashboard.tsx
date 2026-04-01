import React, { useState } from 'react';
import {
  Home, MessageSquare, Database, Settings,
  Brain, BarChart3, Activity, Terminal,
  Search, ChevronRight, Bell, User
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: '控制面板', active: true },
  { id: 'chat', icon: MessageSquare, label: '对话', count: 12 },
  { id: 'configuration', icon: Database, label: '配置' },
  { id: 'settings', icon: Settings, label: '设置' },
];

const stats = [
  { id: 'data_sources', label: '数据源', value: 12, change: '+2', status: 'normal' },
  { id: 'ontologies', label: '本体链', value: 8, change: '+1', status: 'normal' },
  { id: 'tasks', label: '分析任务', value: 156, change: '+23', status: 'warning' },
  { id: 'agents', label: '智能体', value: 6, change: '+1', status: 'normal' },
];

const activities = [
  { id: 1, type: 'info', message: '智能体 "产能分析" 完成排程计算', time: '2分钟前' },
  { id: 2, type: 'warning', message: '约束 "设备产能" 触发告警', time: '15分钟前' },
  { id: 3, type: 'success', message: '订单 SO-2024-001 排程完成', time: '32分钟前' },
  { id: 4, type: 'info', message: '本体 "生产线" 已更新', time: '1小时前' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [inputText, setInputText] = useState('');

  return (
    <div className="h-screen bg-[#1e293b] text-[#ffffff] flex text-sm overflow-hidden">
      {/* Sidebar */}
      <aside className="w-48 bg-[#334155] border-r border-[#3d5166] flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-10 px-3 flex items-center gap-2 border-b border-[#3d5166]">
          <div className="w-5 h-5 bg-[#3b82f6] rounded-sm flex items-center justify-center">
            <Brain size={12} className="text-white" />
          </div>
          <span className="font-semibold text-[#ffffff]">Decision Copilot</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors text-xs ${
                item.active
                  ? 'bg-[#3b82f6]/20 border-l-2 border-[#3b82f6] text-[#ffffff]'
                  : 'text-[#cbd5e1] hover:bg-[#475569] hover:text-[#ffffff] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon size={14} />
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span className="text-[10px] bg-[#1e293b] text-[#94a3b8] px-1.5 py-0.5 rounded-sm">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="h-10 px-3 border-t border-[#3d5166] flex items-center gap-2">
          <div className="w-6 h-6 bg-[#3b82f6]/20 rounded-sm flex items-center justify-center">
            <User size={12} className="text-[#3b82f6]" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#f1f5f9]">管理员</div>
            <div className="text-[10px] text-[#94a3b8]">admin@factory.com</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-10 bg-[#334155] border-b border-[#3d5166] px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94a3b8]">控制面板</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-[#475569] rounded-sm relative">
              <Bell size={14} className="text-[#cbd5e1]" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Search */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#334155] border border-[#3d5166] rounded-sm">
              <Search size={14} className="text-[#94a3b8]" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="询问生产、排产、异常分析..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder:text-[#64748b]"
              />
              <span className="text-[10px] text-[#64748b] px-1.5 py-0.5 border border-[#334155] rounded">⌘K</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                onClick={() => onNavigate('configuration')}
                className="bg-[#253449] border border-[#3d5166] rounded-sm p-3 cursor-pointer hover:border-[#5a6f85] transition-colors"
              >
                <div className="text-[10px] text-[#94a3b8] uppercase mb-1">{stat.label}</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-semibold text-[#f1f5f9]">{stat.value}</span>
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Left: Modules */}
            <div className="col-span-2 space-y-3">
              <div className="bg-[#253449] border border-[#3d5166] rounded-sm">
                <div className="h-8 px-3 border-b border-[#3d5166] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#cbd5e1] uppercase">功能模块</span>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  {[
                    { name: '智能体', icon: Brain, desc: '6 个Agent', color: 'text-[#3b82f6]' },
                    { name: '本体配置', icon: Database, desc: '8 个本体', color: 'text-[#10b981]' },
                    { name: 'MCP工具', icon: BarChart3, desc: '12 个工具', color: 'text-[#f59e0b]' },
                    { name: '业务技能', icon: Activity, desc: '23 个技能', color: 'text-[#8b5cf6]' },
                    { name: '约束规则', icon: Terminal, desc: '15 条规则', color: 'text-[#ec4899]' },
                    { name: '数据分析', icon: BarChart3, desc: '查看报表', color: 'text-[#06b6d4]' },
                  ].map((mod) => (
                    <button
                      key={mod.name}
                      onClick={() => onNavigate('configuration')}
                      className="p-3 bg-[#334155] border border-[#475569] rounded-sm hover:border-[#64748b] transition-colors text-left"
                    >
                      <mod.icon size={16} className={mod.color} />
                      <div className="mt-2 text-xs text-[#f1f5f9]">{mod.name}</div>
                      <div className="text-[10px] text-[#94a3b8]">{mod.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#253449] border border-[#3d5166] rounded-sm">
                <div className="h-8 px-3 border-b border-[#3d5166] flex items-center">
                  <span className="text-xs font-semibold text-[#cbd5e1] uppercase">快速操作</span>
                </div>
                <div className="p-2 flex gap-2">
                  {['运行产能分析', '生成排程方案', '检查约束冲突', '导出报表'].map((action) => (
                    <button
                      key={action}
                      className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs rounded-sm"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Activity */}
            <div className="bg-[#253449] border border-[#3d5166] rounded-sm">
              <div className="h-8 px-3 border-b border-[#3d5166] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#cbd5e1] uppercase">活动日志</span>
                <span className="text-[10px] text-[#94a3b8]">查看全部</span>
              </div>
              <div className="p-0">
                {activities.map((act, i) => (
                  <div
                    key={act.id}
                    className={`px-3 py-2 ${i !== activities.length - 1 ? 'border-b border-[#3d5166]' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        act.type === 'success' ? 'bg-[#10b981]' :
                        act.type === 'warning' ? 'bg-[#f59e0b]' :
                        'bg-[#3b82f6]'
                      }`} />
                      <div className="flex-1">
                        <div className="text-xs text-[#f1f5f9]">{act.message}</div>
                        <div className="text-[10px] text-[#94a3b8]">{act.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <footer className="h-6 bg-[#334155] border-t border-[#3d5166] flex items-center px-3 justify-between text-[10px] text-[#cbd5e1]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>系统正常</span>
            </div>
            <div className="h-3 w-px bg-[#3d5166]" />
            <span>v2.1.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span>12 个数据源</span>
            <span>6 个智能体运行中</span>
            <span>最后更新: 刚刚</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
