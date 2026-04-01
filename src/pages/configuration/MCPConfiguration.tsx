import React, { useState, useMemo } from 'react';
import {
  Cpu, Plus, Search, Edit2, Trash2, Database, CheckCircle,
  X, Terminal, Settings, Globe, Lock, Save, ChevronLeft,
  Activity, Clock, Zap, Command, Filter, MoreHorizontal
} from 'lucide-react';

// MCP工具配置类型 - 符合行业标准
interface MCPTool {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'data' | 'analysis' | 'optimization' | 'simulation' | 'integration';
  deprecated?: boolean;
  deprecated_reason?: string;
  dependencies: string[];
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  output_schema: {
    type: string;
    properties: Record<string, any>;
  };
  examples: Array<{
    name: string;
    input: Record<string, any>;
    output: Record<string, any>;
    description?: string;
  }>;
  auth?: {
    type: 'apikey' | 'oauth' | 'none';
    endpoint?: string;
  };
  config: {
    timeout: number;
    retries: number;
    rate_limit?: number;
  };
  created_at: string;
  updated_at: string;
  author: string;
  status: 'active' | 'inactive' | 'beta';
}

const categoryLabels: Record<string, string> = {
  data: '数据',
  analysis: '分析',
  optimization: '优化',
  simulation: '仿真',
  integration: '集成'
};

const categoryColors: Record<string, string> = {
  data: '#3b82f6',
  analysis: '#8b5cf6',
  optimization: '#10b981',
  simulation: '#f59e0b',
  integration: '#06b6d4'
};

// 示例MCP工具数据
const initialMCPTools: MCPTool[] = [
  {
    id: 'mcp_data_aggregation',
    name: '数据聚合引擎',
    description: '整合多源异构数据，支持ERP、MES、WMS等系统数据统一查询',
    version: '2.0.1',
    category: 'data',
    dependencies: ['mcp_erp_connector'],
    input_schema: { type: 'object', properties: { sources: { type: 'array' }, query: { type: 'string' } }, required: ['sources', 'query'] },
    output_schema: { type: 'object', properties: { data: { type: 'array' }, metadata: { type: 'object' } } },
    examples: [{ name: '聚合查询', input: { sources: ['ERP', 'MES'], query: 'SELECT * FROM orders' }, output: { data: [], metadata: {} } }],
    auth: { type: 'apikey', endpoint: 'https://api.factory.com/v1/data' },
    config: { timeout: 30000, retries: 3, rate_limit: 100 },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    author: 'Data Platform Team',
    status: 'active'
  },
  {
    id: 'mcp_constraint_solver',
    name: '约束求解器',
    description: '基于Google OR-Tools的约束满足问题求解器',
    version: '1.5.0',
    category: 'optimization',
    dependencies: [],
    input_schema: { type: 'object', properties: { variables: { type: 'array' }, constraints: { type: 'array' } }, required: ['variables', 'constraints'] },
    output_schema: { type: 'object', properties: { solution: { type: 'object' }, status: { type: 'string' }, solve_time: { type: 'number' } } },
    examples: [{ name: '排程求解', input: { variables: [], constraints: [] }, output: { solution: {}, status: 'optimal', solve_time: 1.2 } }],
    config: { timeout: 60000, retries: 1 },
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-18T11:20:00Z',
    author: 'Optimization Lab',
    status: 'active'
  },
  {
    id: 'mcp_what_if',
    name: 'What-if模拟器',
    description: '场景推演与模拟，支持多方案对比分析',
    version: '1.2.0',
    category: 'simulation',
    dependencies: ['mcp_data_aggregation'],
    input_schema: { type: 'object', properties: { baseline: { type: 'object' }, scenarios: { type: 'array' } }, required: ['baseline', 'scenarios'] },
    output_schema: { type: 'object', properties: { comparisons: { type: 'array' }, recommendations: { type: 'array' } } },
    examples: [{ name: '场景对比', input: { baseline: {}, scenarios: [] }, output: { comparisons: [], recommendations: [] } }],
    config: { timeout: 120000, retries: 2 },
    created_at: '2024-02-15T14:00:00Z',
    updated_at: '2024-03-15T10:45:00Z',
    author: 'Simulation Team',
    status: 'beta'
  },
  {
    id: 'mcp_ts_analysis',
    name: '时序分析引擎',
    description: 'ARIMA、LSTM、Prophet时间序列预测',
    version: '3.1.0',
    category: 'analysis',
    dependencies: [],
    input_schema: { type: 'object', properties: { data: { type: 'array' }, model: { type: 'string' } }, required: ['data'] },
    output_schema: { type: 'object', properties: { forecast: { type: 'array' }, confidence: { type: 'number' } } },
    examples: [{ name: '趋势预测', input: { data: [], model: 'prophet' }, output: { forecast: [], confidence: 0.95 } }],
    auth: { type: 'oauth', endpoint: 'https://ml.factory.com/auth' },
    config: { timeout: 45000, retries: 2, rate_limit: 50 },
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-03-22T16:30:00Z',
    author: 'AI Lab',
    status: 'active'
  },
  {
    id: 'mcp_erp_connector',
    name: 'ERP连接器',
    description: 'SAP/Oracle ERP系统数据同步 - 旧版API，建议使用mcp_erp_connector_v2',
    version: '2.3.0',
    category: 'integration',
    deprecated: true,
    deprecated_reason: '已迁移到mcp_erp_connector_v2，新版本支持OAuth2认证',
    dependencies: [],
    input_schema: { type: 'object', properties: { table: { type: 'string' }, filters: { type: 'object' } }, required: ['table'] },
    output_schema: { type: 'object', properties: { records: { type: 'array' }, count: { type: 'number' } } },
    examples: [{ name: '数据同步', input: { table: 'orders', filters: {} }, output: { records: [], count: 0 } }],
    auth: { type: 'apikey', endpoint: 'https://erp.internal.com/api' },
    config: { timeout: 60000, retries: 3 },
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2024-03-19T09:15:00Z',
    author: 'Integration Team',
    status: 'inactive'
  }
];

const emptyTool: MCPTool = {
  id: '',
  name: '',
  description: '',
  version: '1.0.0',
  category: 'data',
  dependencies: [],
  input_schema: { type: 'object', properties: {}, required: [] },
  output_schema: { type: 'object', properties: {} },
  examples: [],
  auth: { type: 'none' },
  config: { timeout: 30000, retries: 3 },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: 'Current User',
  status: 'active'
};

export default function MCPConfiguration() {
  const [tools, setTools] = useState<MCPTool[]>(initialMCPTools);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(tools[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<MCPTool>(emptyTool);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // 筛选工具
  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, selectedCategory]);

  // 统计 - 仅配置信息
  const stats = useMemo(() => ({
    total: tools.length,
    active: tools.filter(t => t.status === 'active').length,
    beta: tools.filter(t => t.status === 'beta').length,
    deprecated: tools.filter(t => t.deprecated).length
  }), [tools]);

  const handleSelectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (selectedTool) {
      setEditData({ ...selectedTool });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (isEditing && editData.id) {
      setTools(tools.map(t => t.id === editData.id ? { ...editData, updated_at: new Date().toISOString() } : t));
      setSelectedTool(editData);
      setIsEditing(false);
    }
  };

  const handleDelete = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
    if (selectedTool?.id === id) {
      setSelectedTool(null);
    }
  };

  const handleCreate = () => {
    const newTool: MCPTool = {
      ...emptyTool,
      id: `mcp_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditData(newTool);
    setIsEditing(true);
    setSelectedTool(null);
  };

  // 格式化数字
  const formatNumber = (n: number) => n.toLocaleString();
  const formatLatency = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
  const formatPercent = (p: number) => `${(p * 100).toFixed(1)}%`;

  return (
    <div className="h-full flex flex-col text-sm bg-[#1e293b]">
      {/* Toolbar - Palantir风格紧凑工具栏 */}
      <div className="h-9 px-3 border-b border-[#334155] flex items-center justify-between bg-[#334155] shrink-0">
        <div className="flex items-center gap-3">
          {/* Command Palette 风格搜索 */}
          <div
            className="flex items-center gap-2 px-2 py-1 bg-[#1e293b] rounded-sm border border-[#3d5166] cursor-text min-w-[280px]"
            onClick={() => setShowCommandPalette(true)}
          >
            <Command size={12} className="text-[#64748b]" />
            <span className="text-xs text-[#64748b]">
              {searchTerm || '> 搜索或使用命令...'}
            </span>
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[10px] text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              清除
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-sm text-xs flex items-center gap-1.5"
          >
            <Plus size={12} />
            新建工具
          </button>
        </div>
      </div>

      {/* Stats Bar - 数据指标 */}
      <div className="h-8 px-3 border-b border-[#334155] flex items-center gap-6 bg-[#1e293b] text-[10px] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#f1f5f9] font-mono text-xs">{stats.total}</span>
          <span className="text-[#94a3b8]">工具</span>
        </div>
        <div className="h-3 w-px bg-[#334155]" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[#f1f5f9] font-mono">{stats.active}</span>
          <span className="text-[#94a3b8]">运行中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[#f1f5f9] font-mono">{stats.beta}</span>
          <span className="text-[#94a3b8]">Beta</span>
        </div>
        {stats.deprecated > 0 && (
          <>
            <div className="h-3 w-px bg-[#334155]" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
              <span className="text-[#f1f5f9] font-mono">{stats.deprecated}</span>
              <span className="text-[#ef4444]">已弃用</span>
            </div>
          </>
        )}
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 分类导航 */}
        <div className="w-44 bg-[#334155] border-r border-[#3d5166] flex flex-col shrink-0">
          <div className="h-8 px-3 border-b border-[#3d5166] flex items-center">
            <span className="text-[10px] font-semibold text-[#cbd5e1] uppercase tracking-wider">分类</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#3b82f6]/20 text-[#ffffff]'
                  : 'text-[#cbd5e1] hover:bg-[#475569] hover:text-[#ffffff]'
              }`}
            >
              <span>全部</span>
              <span className="text-[10px] text-[#94a3b8] font-mono">{tools.length}</span>
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  selectedCategory === key
                    ? 'bg-[#3b82f6]/20 text-[#ffffff]'
                    : 'text-[#cbd5e1] hover:bg-[#475569] hover:text-[#ffffff]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColors[key] }} />
                  <span>{label}</span>
                </div>
                <span className="text-[10px] text-[#94a3b8] font-mono">
                  {tools.filter(t => t.category === key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - 工具列表 (紧凑表格) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e293b]">
          {/* 表头 */}
          <div className="h-8 px-3 border-b border-[#334155] flex items-center bg-[#253449] text-[10px] text-[#94a3b8] shrink-0">
            <div className="w-8" />
            <div className="flex-1 min-w-0">工具ID / 名称</div>
            <div className="w-20 text-center">状态</div>
            <div className="w-24 text-right">依赖</div>
            <div className="w-20 text-right">认证</div>
            <div className="w-20 text-right">限流</div>
            <div className="w-8" />
          </div>

          {/* 列表 */}
          <div className="flex-1 overflow-auto">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleSelectTool(tool)}
                className={`h-9 px-3 flex items-center border-b border-[#334155] cursor-pointer transition-colors ${
                  selectedTool?.id === tool.id
                    ? 'bg-[#3b82f6]/10 border-l-2 border-l-[#3b82f6]'
                    : 'hover:bg-[#253449] border-l-2 border-l-transparent'
                }`}
              >
                {/* 图标 */}
                <div className="w-8 flex items-center">
                  <div
                    className="w-5 h-5 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: `${categoryColors[tool.category]}20` }}
                  >
                    <Cpu size={10} style={{ color: categoryColors[tool.category] }} />
                  </div>
                </div>

                {/* ID和名称 */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-baseline gap-2">
                    <code className="text-[10px] text-[#64748b] font-mono truncate">{tool.id}</code>
                    <span className="text-xs text-[#f1f5f9] truncate">{tool.name}</span>
                  </div>
                </div>

                {/* 状态 */}
                <div className="w-20 flex justify-center">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                    tool.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' :
                    tool.status === 'beta' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    'bg-[#64748b]/20 text-[#64748b]'
                  }`}>
                    {tool.status === 'active' ? '运行中' : tool.status === 'beta' ? 'Beta' : '已停用'}
                  </span>
                </div>

                {/* 依赖 */}
                <div className="w-24 text-right">
                  <span className="text-xs text-[#94a3b8] font-mono">
                    {tool.dependencies.length > 0 ? `${tool.dependencies.length} 个` : '-'}
                  </span>
                </div>

                {/* 认证 */}
                <div className="w-20 text-right">
                  <span className={`text-xs font-mono ${
                    tool.auth?.type === 'none' ? 'text-[#64748b]' : 'text-[#3b82f6]'
                  }`}>
                    {tool.auth?.type || 'none'}
                  </span>
                </div>

                {/* 限流 */}
                <div className="w-20 text-right">
                  <span className="text-xs text-[#94a3b8] font-mono">
                    {tool.config.rate_limit || '-'}
                  </span>
                </div>

                {/* 操作 */}
                <div className="w-8 flex items-center justify-end opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tool.id);
                    }}
                    className="p-1 hover:bg-[#ef4444]/20 rounded-sm"
                  >
                    <Trash2 size={12} className="text-[#ef4444]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="h-7 px-3 border-t border-[#334155] flex items-center justify-between bg-[#253449] text-[10px] text-[#94a3b8] shrink-0">
            <span>显示 {filteredTools.length} 个工具</span>
            <span className="font-mono">{selectedTool ? `选中: ${selectedTool.id}` : '未选择'}</span>
          </div>
        </div>

        {/* Right Panel - 详情/编辑面板 */}
        <div className="w-96 bg-[#334155] border-l border-[#3d5166] flex flex-col shrink-0">
          {!selectedTool && !isEditing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
              <Cpu size={48} className="mb-4 opacity-30" />
              <p className="text-xs">选择工具查看详情</p>
              <p className="text-[10px] mt-1">或点击新建创建工具</p>
            </div>
          ) : (
            <>
              {/* 面板头部 */}
              <div className="h-10 px-3 border-b border-[#3d5166] flex items-center justify-between bg-[#334155] shrink-0">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Edit2 size={14} className="text-[#3b82f6]" />
                  ) : (
                    <Settings size={14} className="text-[#94a3b8]" />
                  )}
                  <span className="text-xs font-medium text-[#f1f5f9]">
                    {isEditing ? '编辑工具' : '工具详情'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing && selectedTool && (
                    <button
                      onClick={handleEdit}
                      className="px-2 py-1 text-[10px] text-[#cbd5e1] hover:text-[#ffffff] hover:bg-[#475569] rounded-sm"
                    >
                      编辑
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-2 py-1 text-[10px] text-[#94a3b8] hover:text-[#f1f5f9]"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-2 py-1 text-[10px] bg-[#3b82f6] text-white rounded-sm"
                      >
                        保存
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 面板内容 */}
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {/* 基本信息 */}
                <div className="space-y-2">
                  <label className="text-[10px] text-[#94a3b8] uppercase">工具ID</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.id}
                      onChange={(e) => setEditData({ ...editData, id: e.target.value })}
                      disabled={!!selectedTool}
                      className="w-full px-2 py-1.5 bg-[#0f172a] border border-[#334155] rounded-sm text-xs text-[#f1f5f9] font-mono outline-none focus:border-[#3b82f6]"
                    />
                  ) : (
                    <code className="block text-xs text-[#64748b] font-mono">{selectedTool?.id}</code>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-[#94a3b8] uppercase">名称</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-2 py-1.5 bg-[#0f172a] border border-[#334155] rounded-sm text-xs text-[#f1f5f9] outline-none focus:border-[#3b82f6]"
                    />
                  ) : (
                    <p className="text-xs text-[#f1f5f9]">{selectedTool?.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-[#94a3b8] uppercase">描述</label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1.5 bg-[#0f172a] border border-[#334155] rounded-sm text-xs text-[#f1f5f9] outline-none focus:border-[#3b82f6] resize-none"
                    />
                  ) : (
                    <p className="text-xs text-[#cbd5e1]">{selectedTool?.description}</p>
                  )}
                </div>

                {/* 依赖项 */}
                <div className="border border-[#3d5166] rounded-sm p-3 bg-[#253449]">
                  <h4 className="text-[10px] text-[#94a3b8] uppercase mb-2">依赖项</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.dependencies.join(', ')}
                      onChange={(e) => setEditData({ ...editData, dependencies: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                      className="w-full px-2 py-1.5 bg-[#0f172a] border border-[#334155] rounded-sm text-xs text-[#f1f5f9] outline-none focus:border-[#3b82f6]"
                      placeholder="tool_id1, tool_id2, package_name"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedTool?.dependencies.length ? (
                        selectedTool.dependencies.map((dep, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#1e293b] text-[#94a3b8] text-[10px] rounded font-mono">{dep}</span>
                        ))
                      ) : (
                        <span className="text-[10px] text-[#64748b]">无依赖</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 配置参数 */}
                <div className="border border-[#3d5166] rounded-sm p-3 bg-[#253449]">
                  <h4 className="text-[10px] text-[#94a3b8] uppercase mb-2">运行配置</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94a3b8]">超时</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.config.timeout}
                          onChange={(e) => setEditData({ ...editData, config: { ...editData.config, timeout: parseInt(e.target.value) } })}
                          className="w-20 px-2 py-1 bg-[#0f172a] border border-[#334155] rounded-sm text-xs text-[#f1f5f9] font-mono text-right outline-none"
                        />
                      ) : (
                        <span className="text-xs font-mono text-[#f1f5f9]">{selectedTool?.config.timeout}ms</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94a3b8]">重试次数</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.config.retries}
                          onChange={(e) => setEditData({ ...editData, config: { ...editData.config, retries: parseInt(e.target.value) } })}
                          className="w-20 px-2 py-1 bg-[#0f172a] border border-[#334155] rounded-sm text-xs text-[#f1f5f9] font-mono text-right outline-none"
                        />
                      ) : (
                        <span className="text-xs font-mono text-[#f1f5f9]">{selectedTool?.config.retries}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Schema 预览 */}
                {!isEditing && selectedTool && (
                  <div className="border border-[#3d5166] rounded-sm p-3 bg-[#253449]">
                    <h4 className="text-[10px] text-[#94a3b8] uppercase mb-2">输入 Schema</h4>
                    <pre className="text-[10px] text-[#cbd5e1] font-mono overflow-x-auto">
                      {JSON.stringify(selectedTool.input_schema, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="w-[500px] bg-[#334155] rounded-sm shadow-2xl border border-[#3d5166]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3d5166]">
              <Command size={14} className="text-[#64748b]" />
              <input
                type="text"
                autoFocus
                placeholder="搜索工具或使用命令 (>create, >filter, >sort)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs text-[#f1f5f9]"
              />
              <span className="text-[10px] text-[#64748b] px-1.5 py-0.5 bg-[#1e293b] rounded">ESC</span>
            </div>
            <div className="max-h-[300px] overflow-auto py-1">
              {filteredTools.slice(0, 5).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    handleSelectTool(tool);
                    setShowCommandPalette(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[#3b82f6]/20 text-left"
                >
                  <Cpu size={14} className="text-[#64748b]" />
                  <div className="flex-1">
                    <div className="text-xs text-[#f1f5f9]">{tool.name}</div>
                    <code className="text-[10px] text-[#64748b]">{tool.id}</code>
                  </div>
                </button>
              ))}
              {filteredTools.length === 0 && (
                <div className="px-3 py-4 text-center text-[#64748b] text-xs">
                  未找到匹配的工具
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t border-[#3d5166] flex items-center gap-4 text-[10px] text-[#64748b]">
              <span>↑↓ 导航</span>
              <span>↵ 选择</span>
              <span className="ml-auto">{filteredTools.length} 个结果</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
