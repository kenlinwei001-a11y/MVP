import React, { useState } from 'react';
import {
  PanelLeft, PanelRight, Maximize2, Minimize2,
  Activity, Database, GitBranch, Settings, Search,
  Filter, Download, RefreshCw, Grid, List, Terminal,
  ChevronRight, ChevronDown, MoreHorizontal, X,
  Play, Pause, AlertCircle, CheckCircle, Clock
} from 'lucide-react';

// 工业风格高密度布局示例
export default function IndustrialLayout() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>('order_001');

  return (
    <div className="h-screen bg-[#0f1419] text-[#e2e8f0] font-sans overflow-hidden flex flex-col text-sm">
      {/* Top Bar - 紧凑标题栏 */}
      <header className="h-10 bg-[#141b26] border-b border-[#2d3d52] flex items-center px-3 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#3b82f6] rounded-sm flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
            <span className="font-semibold text-[#e2e8f0]">Decision Copilot</span>
          </div>
          <div className="h-4 w-px bg-[#2d3d52]" />
          <nav className="flex items-center gap-1">
            {['决策中心', '配置', '监控', '分析'].map((item, i) => (
              <button
                key={item}
                className={`px-3 py-1 rounded-sm transition-colors ${
                  i === 0 ? 'bg-[#2d3d52] text-[#e2e8f0]' : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1a2332]'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-[#1a2332] rounded-sm border border-[#2d3d52]">
            <Search size={12} className="text-[#64748b]" />
            <input
              type="text"
              placeholder="搜索..."
              className="bg-transparent border-none outline-none text-xs w-32 text-[#e2e8f0] placeholder:text-[#475569]"
            />
            <span className="text-[10px] text-[#475569] px-1 border border-[#2d3d52] rounded">⌘K</span>
          </div>
          <button className="p-1.5 hover:bg-[#243447] rounded-sm">
            <Settings size={14} className="text-[#94a3b8]" />
          </button>
        </div>
      </header>

      {/* Main Content - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 导航/对象列表 */}
        {leftPanelOpen && (
          <aside className="w-56 bg-[#141b26] border-r border-[#2d3d52] flex flex-col shrink-0">
            {/* Panel Header */}
            <div className="h-8 px-3 border-b border-[#2d3d52] flex items-center justify-between bg-[#1a2332]">
              <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">对象浏览器</span>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-[#243447] rounded">
                  <Filter size={10} className="text-[#64748b]" />
                </button>
                <button className="p-1 hover:bg-[#243447] rounded">
                  <RefreshCw size={10} className="text-[#64748b]" />
                </button>
              </div>
            </div>

            {/* Object Tree */}
            <div className="flex-1 overflow-auto py-1">
              {[
                { id: 'orders', label: '销售订单', count: 156, icon: Database, expanded: true, children: [
                  { id: 'order_001', label: 'SO-2024-001', status: 'active' },
                  { id: 'order_002', label: 'SO-2024-002', status: 'warning' },
                  { id: 'order_003', label: 'SO-2024-003', status: 'pending' },
                ]},
                { id: 'lines', label: '生产线', count: 12, icon: GitBranch, expanded: false },
                { id: 'materials', label: '物料', count: 893, icon: Grid, expanded: false },
              ].map((group) => (
                <div key={group.id}>
                  <button className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2332] group">
                    <ChevronDown size={12} className="text-[#64748b]" />
                    <group.icon size={12} className="text-[#3b82f6]" />
                    <span className="flex-1 text-left text-[#e2e8f0]">{group.label}</span>
                    <span className="text-[10px] text-[#64748b] bg-[#243447] px-1.5 py-0.5 rounded">
                      {group.count}
                    </span>
                  </button>
                  {group.expanded && group.children?.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedNode(child.id)}
                      className={`w-full px-3 py-1.5 pl-8 flex items-center gap-2 text-xs ${
                        selectedNode === child.id
                          ? 'bg-[#3b82f6]/20 border-l-2 border-[#3b82f6]'
                          : 'hover:bg-[#1a2332] border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        child.status === 'active' ? 'bg-[#10b981]' :
                        child.status === 'warning' ? 'bg-[#f59e0b]' :
                        'bg-[#64748b]'
                      }`} />
                      <span className={selectedNode === child.id ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'}>
                        {child.label}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Panel Footer */}
            <div className="h-8 px-3 border-t border-[#2d3d52] flex items-center justify-between text-[10px] text-[#64748b]">
              <span>3 个类型</span>
              <span>1,061 个对象</span>
            </div>
          </aside>
        )}

        {/* Center Panel - 主内容区 */}
        <main className="flex-1 flex flex-col bg-[#0f1419] min-w-0">
          {/* Toolbar */}
          <div className="h-9 px-3 border-b border-[#2d3d52] flex items-center justify-between bg-[#141b26]">
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-[#243447] rounded-sm" onClick={() => setLeftPanelOpen(!leftPanelOpen)}>
                <PanelLeft size={14} className={leftPanelOpen ? 'text-[#3b82f6]' : 'text-[#64748b]'} />
              </button>
              <div className="h-4 w-px bg-[#2d3d52] mx-1" />
              <span className="text-xs text-[#94a3b8]">SO-2024-001</span>
              <ChevronRight size={12} className="text-[#475569]" />
              <span className="text-xs text-[#e2e8f0]">详情</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-xs text-[#94a3b8] hover:bg-[#243447] rounded-sm flex items-center gap-1">
                <Play size={12} />
                运行
              </button>
              <button className="px-2 py-1 text-xs text-[#94a3b8] hover:bg-[#243447] rounded-sm flex items-center gap-1">
                <Download size={12} />
                导出
              </button>
              <button className="p-1.5 hover:bg-[#243447] rounded-sm" onClick={() => setRightPanelOpen(!rightPanelOpen)}>
                <PanelRight size={14} className={rightPanelOpen ? 'text-[#3b82f6]' : 'text-[#64748b]'} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Data Grid */}
            <div className="flex-1 overflow-auto p-3">
              {/* Info Cards - 紧凑排列 */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: '订单号', value: 'SO-2024-001', color: 'text-[#e2e8f0]' },
                  { label: '客户', value: '宁德时代', color: 'text-[#3b82f6]' },
                  { label: '交期', value: '2024-04-15', color: 'text-[#10b981]' },
                  { label: '状态', value: '生产中', color: 'text-[#f59e0b]' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#141b26] border border-[#2d3d52] rounded-sm p-2">
                    <div className="text-[10px] text-[#64748b] uppercase">{item.label}</div>
                    <div className={`text-sm font-mono ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="bg-[#141b26] border border-[#2d3d52] rounded-sm">
                <table className="w-full text-xs">
                  <thead className="bg-[#1a2332] text-[#94a3b8]">
                    <tr>
                      {['物料编码', '物料名称', '数量', '单位', '库存', '缺料', '预计齐套'].map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left font-medium border-b border-[#2d3d52]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: 'MAT-001', name: '磷酸铁锂', qty: 1000, unit: 'kg', stock: 800, shortage: 200, eta: '04-10' },
                      { code: 'MAT-002', name: '电解液', qty: 500, unit: 'L', stock: 600, shortage: 0, eta: '已齐套' },
                      { code: 'MAT-003', name: '隔膜', qty: 2000, unit: 'm²', stock: 1500, shortage: 500, eta: '04-12' },
                    ].map((row, i) => (
                      <tr key={row.code} className={i % 2 === 0 ? 'bg-[#141b26]' : 'bg-[#1a2332]/50'}>
                        <td className="px-2 py-1.5 font-mono text-[#64748b]">{row.code}</td>
                        <td className="px-2 py-1.5 text-[#e2e8f0]">{row.name}</td>
                        <td className="px-2 py-1.5 text-right font-mono">{row.qty}</td>
                        <td className="px-2 py-1.5 text-[#94a3b8]">{row.unit}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#10b981]">{row.stock}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#ef4444]">{row.shortage || '-'}</td>
                        <td className="px-2 py-1.5 text-[#f59e0b]">{row.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Log Output */}
              <div className="mt-3 bg-[#0a0d12] border border-[#2d3d52] rounded-sm">
                <div className="h-7 px-2 border-b border-[#2d3d52] flex items-center justify-between bg-[#141b26]">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-[#64748b]" />
                    <span className="text-[10px] text-[#94a3b8] uppercase">系统日志</span>
                  </div>
                  <button className="text-[10px] text-[#64748b] hover:text-[#e2e8f0]">清除</button>
                </div>
                <div className="p-2 font-mono text-[10px] space-y-0.5 max-h-24 overflow-auto">
                  <div className="text-[#64748b]">[14:32:01] INFO: 开始分析订单 SO-2024-001</div>
                  <div className="text-[#3b82f6]">[14:32:02] DEBUG: 加载物料清单...</div>
                  <div className="text-[#f59e0b]">[14:32:03] WARN: 物料 MAT-003 库存不足</div>
                  <div className="text-[#10b981]">[14:32:04] INFO: 分析完成，生成排程方案</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - 属性/详情 */}
        {rightPanelOpen && (
          <aside className="w-64 bg-[#141b26] border-l border-[#2d3d52] flex flex-col shrink-0">
            <div className="h-8 px-3 border-b border-[#2d3d52] flex items-center justify-between bg-[#1a2332]">
              <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">属性</span>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-[#64748b] uppercase mb-1">基本信息</div>
                  <div className="space-y-1.5">
                    {[
                      { label: '创建时间', value: '2024-03-15 09:23' },
                      { label: '最后更新', value: '2024-03-20 14:56' },
                      { label: '负责人', value: '张三' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-[#64748b]">{item.label}</span>
                        <span className="text-[#e2e8f0]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#2d3d52] pt-3">
                  <div className="text-[10px] text-[#64748b] uppercase mb-1">约束检查</div>
                  <div className="space-y-1.5">
                    {[
                      { label: '交期约束', status: 'passed', icon: CheckCircle },
                      { label: '产能约束', status: 'warning', icon: AlertCircle },
                      { label: '物料齐套', status: 'failed', icon: X },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs">
                        <item.icon size={12} className={
                          item.status === 'passed' ? 'text-[#10b981]' :
                          item.status === 'warning' ? 'text-[#f59e0b]' :
                          'text-[#ef4444]'
                        } />
                        <span className="text-[#e2e8f0] flex-1">{item.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          item.status === 'passed' ? 'bg-[#10b981]/20 text-[#10b981]' :
                          item.status === 'warning' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                          'bg-[#ef4444]/20 text-[#ef4444]'
                        }`}>
                          {item.status === 'passed' ? '通过' : item.status === 'warning' ? '警告' : '失败'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-[#141b26] border-t border-[#2d3d52] flex items-center px-3 justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#64748b]">系统正常</span>
          </div>
          <div className="h-3 w-px bg-[#2d3d52]" />
          <span className="text-[#64748b]">v2.1.0</span>
        </div>
        <div className="flex items-center gap-3 text-[#64748b]">
          <span>1,061 个对象</span>
          <span>3 个活动会话</span>
          <span>最后更新: 14:32:05</span>
        </div>
      </footer>
    </div>
  );
}
