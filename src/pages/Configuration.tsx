import React, { useState } from 'react';
import {
  ChevronLeft, Bot, Database, Cpu, Sparkles, Shield,
  Plus, Search, MoreVertical, Play, Pause, Edit2, Trash2,
  Settings, ChevronRight, Box, Wrench, FileCode
} from 'lucide-react';

// 子配置组件
import AgentConfiguration from './configuration/AgentConfiguration';
import OntologyConfiguration from './configuration/OntologyConfiguration';
import MCPConfiguration from './configuration/MCPConfiguration';
import SkillConfiguration from './configuration/SkillConfiguration';
import ConstraintConfiguration from './configuration/ConstraintConfiguration';

interface ConfigurationProps {
  onNavigate: (page: string) => void;
}

type ConfigTab = 'agent' | 'ontology' | 'mcp' | 'skill' | 'constraint';

const configTabs = [
  { id: 'agent' as ConfigTab, label: '智能体', icon: Bot, description: 'AI Agent 配置' },
  { id: 'ontology' as ConfigTab, label: '本体', icon: Database, description: '领域本体建模' },
  { id: 'mcp' as ConfigTab, label: 'MCP工具', icon: Cpu, description: '模型上下文协议' },
  { id: 'skill' as ConfigTab, label: '业务技能', icon: Sparkles, description: '技能能力中心' },
  { id: 'constraint' as ConfigTab, label: '约束规则', icon: Shield, description: '硬约束/软约束' },
];

export default function Configuration({ onNavigate }: ConfigurationProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('agent');

  return (
    <div className="h-screen bg-[#1e293b] text-[#ffffff] flex flex-col text-sm overflow-hidden">
      {/* Header - 紧凑工具栏 */}
      <header className="h-10 bg-[#334155] border-b border-[#3d5166] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-1.5 hover:bg-[#475569] rounded-sm transition-colors"
            >
              <ChevronLeft size={16} className="text-[#cbd5e1]" />
            </button>
            <div className="w-5 h-5 bg-[#3b82f6] rounded-sm flex items-center justify-center">
              <Settings size={12} className="text-white" />
            </div>
            <span className="font-semibold text-[#ffffff]">配置中心</span>
          </div>
          <div className="h-4 w-px bg-[#3d5166]" />
          <div className="flex items-center gap-1">
            {['智能体', '本体', 'MCP工具', '技能', '约束'].map((item, i) => {
              const tabIds = ['agent', 'ontology', 'mcp', 'skill', 'constraint'];
              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(tabIds[i] as ConfigTab)}
                  className={`px-3 py-1 rounded-sm transition-colors text-xs ${
                    activeTab === tabIds[i]
                      ? 'bg-[#3b82f6] text-white'
                      : 'text-[#cbd5e1] hover:text-[#ffffff] hover:bg-[#475569]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-[#1e293b] rounded-sm border border-[#3d5166]">
            <Search size={12} className="text-[#94a3b8]" />
            <input
              type="text"
              placeholder="搜索配置..."
              className="bg-transparent border-none outline-none text-xs w-32 text-[#f1f5f9] placeholder:text-[#64748b]"
            />
            <span className="text-[10px] text-[#64748b] px-1 border border-[#334155] rounded">⌘K</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 导航 */}
        <aside className="w-48 bg-[#334155] border-r border-[#3d5166] flex flex-col shrink-0">
          <div className="h-8 px-3 border-b border-[#3d5166] flex items-center bg-[#334155]">
            <span className="text-[10px] font-semibold text-[#cbd5e1] uppercase tracking-wider">配置项</span>
          </div>
          <nav className="flex-1 overflow-auto py-1">
            {configTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors text-xs ${
                  activeTab === tab.id
                    ? 'bg-[#3b82f6]/20 border-l-2 border-[#3b82f6] text-[#ffffff]'
                    : 'text-[#cbd5e1] hover:bg-[#475569] hover:text-[#ffffff] border-l-2 border-transparent'
                }`}
              >
                <tab.icon size={14} />
                <div className="flex-1">
                  <div className="font-medium">{tab.label}</div>
                </div>
                <ChevronRight size={12} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </nav>
          <div className="h-8 px-3 border-t border-[#3d5166] flex items-center justify-between text-[10px] text-[#94a3b8]">
            <span>5 个类别</span>
            <span>v2.1.0</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-[#1e293b]">
          {activeTab === 'agent' && <AgentConfiguration />}
          {activeTab === 'ontology' && <OntologyConfiguration onNavigate={onNavigate} />}
          {activeTab === 'mcp' && <MCPConfiguration />}
          {activeTab === 'skill' && <SkillConfiguration />}
          {activeTab === 'constraint' && <ConstraintConfiguration />}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-[#334155] border-t border-[#3d5166] flex items-center px-3 justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-[#cbd5e1]">系统正常</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#94a3b8]">
          <span>配置中心</span>
          <span>最后更新: 刚刚</span>
        </div>
      </footer>
    </div>
  );
}
