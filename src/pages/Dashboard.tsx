import React, { useState } from 'react';
import {
  Home, MessageSquare, Database, Settings,
  Sparkles, AlertCircle, Calendar, Zap, Target,
  Upload, ChevronRight, CheckCircle, Brain,
  GitBranch, BarChart3, Clock, FileText
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    { icon: AlertCircle, text: '为什么产线A产能下降？', tag: '异常分析', color: 'bg-red-50 text-red-600 border-red-100' },
    { icon: Calendar, text: '当前订单能否按期完成？', tag: '排产推演', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { icon: Zap, text: '如果减少换型时间会怎样？', tag: 'What-if', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    { icon: Target, text: '如何提升OTIF？', tag: '优化建议', color: 'bg-green-50 text-green-600 border-green-100' },
  ];

  const recentAnalyses = [
    { title: '产能分析报告', time: '2小时前', type: '异常分析', status: 'completed' },
    { title: '排产可行性分析', time: '昨天', type: '排产推演', status: 'completed' },
    { title: 'What-if推演', time: '3天前', type: '模拟分析', status: 'completed' },
  ];

  const systemMetrics = [
    { label: '已连接数据源', value: '12', icon: Database, trend: '+2' },
    { label: '活跃本体链', value: '8', icon: GitBranch, trend: '+1' },
    { label: '执行分析任务', value: '156', icon: BarChart3, trend: '+23' },
    { label: '平均响应时间', value: '1.2s', icon: Clock, trend: '-0.3' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部导航 */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="text-white" size={18} />
          </div>
          <div>
            <span className="text-base font-semibold text-gray-900">Decision Copilot</span>
            <span className="text-xs text-gray-500 ml-2 font-mono">v2.1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs text-green-700">系统正常</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            数据源已连接
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
          <nav className="p-3 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">主菜单</div>
            {[
              { icon: Home, label: '首页', active: true, page: 'dashboard' },
              { icon: MessageSquare, label: '对话中心', page: 'chat' },
              { icon: Database, label: '数据管理', page: 'database' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  item.active
                    ? 'bg-white text-blue-600 border border-gray-200 shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:border hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1"></div>

          <div className="p-3 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">系统</div>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 hover:border hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <Settings size={18} />
              <span className="text-sm font-medium">系统配置</span>
            </button>
          </div>
        </aside>

        {/* 中间主内容 */}
        <main className="flex-1 max-w-3xl mx-auto p-6 overflow-y-auto">
          {/* 输入区域 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">欢迎回来</h1>
                <p className="text-sm text-gray-500">有什么生产问题需要我帮您分析？</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                className="w-full bg-transparent resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                placeholder="输入您的问题或拖拽文件到这里..."
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">分析产能异常 · 推演排产方案 · 模拟参数调整</span>
                <button className="w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                  <Upload className="text-white" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 快捷问题 */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-blue-500" />
              推荐问题
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickQuestions.map((q, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate('chat')}
                  className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border ${q.color}`}>
                      <q.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate group-hover:text-blue-600 transition-colors">{q.text}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">{q.tag}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近分析 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-500" />
              最近分析
            </h2>
            <div className="space-y-2">
              {recentAnalyses.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate('chat')}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* 右侧面板 */}
        <aside className="w-72 bg-gray-50 border-l border-gray-200 p-5 overflow-y-auto hidden xl:block flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            系统指标
          </h2>
          <div className="space-y-3 mb-6">
            {systemMetrics.map((metric, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <metric.icon size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{metric.label}</span>
                  </div>
                  <span className={`text-xs font-medium ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                    {metric.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* MCP工具状态 */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">MCP工具状态</h3>
            <div className="space-y-2">
              {[
                { name: '数据聚合引擎', status: '运行中', color: 'green' },
                { name: '约束求解器', status: '运行中', color: 'green' },
                { name: 'What-if模拟器', status: '运行中', color: 'green' },
                { name: '异常检测器', status: '待机', color: 'yellow' },
              ].map((tool, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">{tool.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    tool.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {tool.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">快捷操作</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('settings')}
                className="w-full text-left px-3 py-2.5 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm"
              >
                <Settings size={14} className="inline mr-2" />
                配置MCP工具
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full text-left px-3 py-2.5 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm"
              >
                <GitBranch size={14} className="inline mr-2" />
                管理本体库
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full text-left px-3 py-2.5 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm"
              >
                <Sparkles size={14} className="inline mr-2" />
                配置智能体
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
