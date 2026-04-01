import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Shield, AlertCircle, CheckCircle,
  X, ChevronDown, ChevronUp, HardDrive, Feather, Target, Layers,
  Clock, User, Hash, AlertTriangle, Terminal, Save, Code,
  Command, Zap, BarChart3, Ban, Play, Pause, Filter, MoreVertical
} from 'lucide-react';

// 约束规则类型定义 - 符合行业标准
interface Constraint {
  constraint_id: string;
  name: string;
  description: string;
  category: 'time' | 'resource' | 'process' | 'cost' | 'quality' | 'safety';
  type: 'hard' | 'soft';
  expression: string;
  operator: string;
  target_field: string;
  threshold?: number | string;
  applies_to: string[];
  scope: 'global' | 'workflow' | 'step' | 'entity';
  priority: number;
  created_at: string;
  updated_at: string;
  author: string;
  version: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  weight?: number;
  conflict_resolution: string;
  fallback_action?: string;
  alert_level?: string;
  enabled: boolean;
  tags: string[];
}

const categoryLabels: Record<string, string> = {
  time: '时间',
  resource: '资源',
  process: '工艺',
  cost: '成本',
  quality: '质量',
  safety: '安全',
};

const categoryIcons: Record<string, React.ReactNode> = {
  time: <Clock size={12} />,
  resource: <HardDrive size={12} />,
  process: <Layers size={12} />,
  cost: <BarChart3 size={12} />,
  quality: <CheckCircle size={12} />,
  safety: <Shield size={12} />,
};

const categoryColors: Record<string, string> = {
  time: '#3b82f6',
  resource: '#10b981',
  process: '#f59e0b',
  cost: '#8b5cf6',
  quality: '#ec4899',
  safety: '#ef4444',
};

const initialConstraints: Constraint[] = [
  {
    constraint_id: 'delivery_deadline',
    name: '交期不可延迟',
    description: '订单交付日期必须严格满足客户要求的截止日期',
    category: 'time',
    type: 'hard',
    expression: 'delivery_date <= deadline',
    operator: '<=',
    target_field: 'delivery_date',
    applies_to: ['SalesOrder', 'WorkOrder'],
    scope: 'workflow',
    priority: 10,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z',
    author: '李明',
    version: '2.1.0',
    severity: 'critical',
    conflict_resolution: 'priority',
    fallback_action: 'block',
    alert_level: 'critical',
    enabled: true,
    tags: ['delivery', 'time-critical']
  },
  {
    constraint_id: 'minimize_setup',
    name: '最小化换线次数',
    description: '在满足交期的前提下，减少设备换线次数',
    category: 'resource',
    type: 'soft',
    expression: 'minimize(setup_count)',
    operator: 'minimize',
    target_field: 'setup_count',
    applies_to: ['ProductionLine', 'WorkCenter'],
    scope: 'workflow',
    priority: 5,
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-03-18T11:20:00Z',
    author: '王芳',
    version: '1.5.0',
    weight: 0.7,
    conflict_resolution: 'weighted',
    fallback_action: 'alert',
    alert_level: 'medium',
    enabled: true,
    tags: ['setup', 'optimization']
  },
  {
    constraint_id: 'equipment_capacity',
    name: '设备产能限制',
    description: '设备每日运行时间不得超过其最大产能限制',
    category: 'resource',
    type: 'hard',
    expression: 'daily_runtime <= max_capacity * 0.9',
    operator: '<=',
    target_field: 'daily_runtime',
    threshold: 0.9,
    applies_to: ['Equipment', 'ProductionLine'],
    scope: 'entity',
    priority: 9,
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-03-15T10:45:00Z',
    author: '张伟',
    version: '3.0.1',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['capacity', 'equipment']
  },
  {
    constraint_id: 'quality_inspection',
    name: '质检合格率',
    description: '产品质检合格率必须达到98%以上',
    category: 'quality',
    type: 'hard',
    expression: 'quality_rate >= 0.98',
    operator: '>=',
    target_field: 'quality_rate',
    threshold: 0.98,
    applies_to: ['WorkOrder', 'Product'],
    scope: 'workflow',
    priority: 8,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-03-10T16:20:00Z',
    author: '质量部',
    version: '1.2.0',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['quality', 'inspection']
  },
  {
    constraint_id: 'safety_stock',
    name: '安全库存',
    description: '原材料库存不得低于安全库存水平',
    category: 'resource',
    type: 'hard',
    expression: 'stock_level >= safety_level',
    operator: '>=',
    target_field: 'stock_level',
    applies_to: ['Material', 'Inventory'],
    scope: 'entity',
    priority: 7,
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2024-03-05T09:30:00Z',
    author: '供应链',
    version: '2.0.0',
    severity: 'medium',
    conflict_resolution: 'priority',
    fallback_action: 'alert',
    alert_level: 'medium',
    enabled: false,
    tags: ['inventory', 'stock']
  },
  {
    constraint_id: 'safety_temperature',
    name: '设备温度上限',
    description: '设备运行温度不得超过安全阈值',
    category: 'safety',
    type: 'hard',
    expression: 'temperature <= 85',
    operator: '<=',
    target_field: 'temperature',
    threshold: 85,
    applies_to: ['Equipment', 'WorkCenter'],
    scope: 'entity',
    priority: 10,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-03-22T14:00:00Z',
    author: '安全部',
    version: '1.0.5',
    severity: 'critical',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'critical',
    enabled: true,
    tags: ['temperature', 'safety']
  }
];

// 空模板
const emptyConstraint: Constraint = {
  constraint_id: '',
  name: '',
  description: '',
  category: 'time',
  type: 'hard',
  expression: '',
  operator: '<=',
  target_field: '',
  applies_to: [],
  scope: 'workflow',
  priority: 5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: 'Current User',
  version: '1.0.0',
  severity: 'medium',
  conflict_resolution: 'priority',
  fallback_action: 'alert',
  alert_level: 'medium',
  enabled: false,
    tags: []
};

export default function ConstraintConfiguration() {
  const [constraints, setConstraints] = useState<Constraint[]>(initialConstraints);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedConstraint, setSelectedConstraint] = useState<Constraint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Constraint>(emptyConstraint);
  const [activeTab, setActiveTab] = useState<'basic' | 'expression' | 'resolution'>('basic');

  // Filter constraints by category, type, and search
  const filteredConstraints = useMemo(() => {
    return constraints.filter(c => {
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesType = selectedType === 'all' || c.type === selectedType;
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.constraint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [constraints, selectedCategory, selectedType, searchTerm]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: constraints.length };
    constraints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [constraints]);

  // Type counts
  const typeCounts = useMemo(() => {
    return {
      all: constraints.length,
      hard: constraints.filter(c => c.type === 'hard').length,
      soft: constraints.filter(c => c.type === 'soft').length
    };
  }, [constraints]);

  // Stats
  const stats = useMemo(() => {
    const active = constraints.filter(c => c.enabled).length;
    const hardCount = constraints.filter(c => c.type === 'hard').length;
    const softCount = constraints.filter(c => c.type === 'soft').length;
    return { active, hardCount, softCount };
  }, [constraints]);

  const handleSelectConstraint = (constraint: Constraint) => {
    setSelectedConstraint(constraint);
    setFormData({ ...constraint });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newConstraint: Constraint = {
      ...emptyConstraint,
      constraint_id: `constraint_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFormData(newConstraint);
    setSelectedConstraint(null);
    setIsEditing(true);
    setActiveTab('basic');
  };

  const handleSave = () => {
    if (selectedConstraint) {
      // Update existing
      setConstraints(constraints.map(c => c.constraint_id === selectedConstraint.constraint_id
        ? { ...formData, updated_at: new Date().toISOString() }
        : c
      ));
      setSelectedConstraint({ ...formData, updated_at: new Date().toISOString() });
    } else {
      // Create new
      const newConstraint = { ...formData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setConstraints([...constraints, newConstraint]);
      setSelectedConstraint(newConstraint);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setConstraints(constraints.filter(c => c.constraint_id !== id));
    if (selectedConstraint?.constraint_id === id) {
      setSelectedConstraint(null);
    }
  };

  const handleToggleActive = (constraint: Constraint) => {
    const updated = { ...constraint, enabled: !constraint.enabled };
    setConstraints(constraints.map(c => c.constraint_id === constraint.constraint_id ? updated : c));
    if (selectedConstraint?.constraint_id === constraint.constraint_id) {
      setSelectedConstraint(updated);
      setFormData(updated);
    }
  };

  // Get severity color
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-[#ef4444]';
      case 'high': return 'text-[#f59e0b]';
      case 'medium': return 'text-[#3b82f6]';
      case 'low': return 'text-[#10b981]';
      default: return 'text-[#94a3b8]';
    }
  };

  // Get violation status color
  const getViolationColor = (count: number) => {
    if (count === 0) return 'text-[#10b981]';
    if (count < 5) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  return (
    <div className="h-full flex flex-col text-sm">
      {/* Header Toolbar - Palantir Style */}
      <div className="h-9 px-3 border-b border-[#334155] flex items-center justify-between bg-[#334155] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Command size={12} className="text-[#94a3b8]" />
            <span className="text-[10px] text-[#64748b]">约束规则</span>
          </div>
          <div className="h-4 w-px bg-[#475569]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 px-2 py-1 bg-[#1e293b] rounded-sm border border-[#3d5166] hover:border-[#5a6f85] transition-colors"
            >
              <Search size={12} className="text-[#94a3b8]" />
              <span className="text-xs text-[#94a3b8]">搜索约束...</span>
              <span className="text-[10px] text-[#64748b] px-1 border border-[#334155] rounded">⌘K</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-sm text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus size={12} />
            新建约束
          </button>
        </div>
      </div>

      {/* Stats Bar - Technical Metrics */}
      <div className="h-8 px-3 border-b border-[#334155] flex items-center gap-6 bg-[#1e293b] text-[10px] text-[#94a3b8] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#f1f5f9] font-mono text-xs">{constraints.length}</span>
          <span>约束总数</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <span className="text-[#f1f5f9] font-mono text-xs">{stats.hardCount}</span>
          <span>硬约束</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[#f1f5f9] font-mono text-xs">{stats.active}</span>
          <span>运行中</span>
        </div>
        <div className="flex items-center gap-2">
          <Feather size={10} className="text-[#3b82f6]" />
          <span className="text-[#f1f5f9] font-mono text-xs">{stats.softCount}</span>
          <span>软约束</span>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Category Navigation */}
        <div className="w-44 bg-[#334155] border-r border-[#3d5166] flex flex-col shrink-0">
          <div className="h-7 px-3 border-b border-[#3d5166] flex items-center bg-[#334155]">
            <Filter size={10} className="text-[#94a3b8] mr-2" />
            <span className="text-[10px] font-semibold text-[#cbd5e1] uppercase tracking-wider">类型</span>
          </div>
          <div className="py-1 border-b border-[#3d5166]">
            <button
              onClick={() => setSelectedType('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                  : 'text-[#cbd5e1] hover:bg-[#475569] border-l-2 border-transparent'
              }`}
            >
              <span>全部约束</span>
              <span className="font-mono text-[10px] bg-[#1e293b] px-1.5 py-0.5 rounded">{typeCounts.all}</span>
            </button>
            <button
              onClick={() => setSelectedType('hard')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedType === 'hard'
                  ? 'bg-[#ef4444]/20 text-[#ef4444] border-l-2 border-[#ef4444]'
                  : 'text-[#cbd5e1] hover:bg-[#475569] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={12} />
                <span>硬约束</span>
              </div>
              <span className="font-mono text-[10px] bg-[#1e293b] px-1.5 py-0.5 rounded">{typeCounts.hard}</span>
            </button>
            <button
              onClick={() => setSelectedType('soft')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedType === 'soft'
                  ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                  : 'text-[#cbd5e1] hover:bg-[#475569] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Feather size={12} />
                <span>软约束</span>
              </div>
              <span className="font-mono text-[10px] bg-[#1e293b] px-1.5 py-0.5 rounded">{typeCounts.soft}</span>
            </button>
          </div>
          <div className="h-7 px-3 border-b border-[#3d5166] flex items-center bg-[#334155]">
            <span className="text-[10px] font-semibold text-[#cbd5e1] uppercase tracking-wider">类别</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  selectedCategory === key
                    ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                    : 'text-[#cbd5e1] hover:bg-[#475569] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: categoryColors[key] }}>{categoryIcons[key]}</span>
                  <span>{label}</span>
                </div>
                <span className="font-mono text-[10px] bg-[#1e293b] px-1.5 py-0.5 rounded">{categoryCounts[key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - Constraint List */}
        <div className="flex-1 flex flex-col bg-[#1e293b] min-w-0">
          {/* List Header */}
          <div className="h-8 px-3 border-b border-[#334155] flex items-center bg-[#253449] text-[10px] text-[#94a3b8] shrink-0">
            <div className="flex-1">约束ID / 名称</div>
            <div className="w-16 text-center">类型</div>
            <div className="w-16 text-center">严重</div>
            <div className="w-20 text-right">优先级</div>
            <div className="w-20 text-right">标签数</div>
            <div className="w-20 text-center">状态</div>
            <div className="w-8"></div>
          </div>

          {/* Constraint List */}
          <div className="flex-1 overflow-auto">
            {filteredConstraints.map((constraint) => (
              <div
                key={constraint.constraint_id}
                onClick={() => handleSelectConstraint(constraint)}
                className={`px-3 py-2 border-b border-[#334155] flex items-center cursor-pointer transition-colors ${
                  selectedConstraint?.constraint_id === constraint.constraint_id
                    ? 'bg-[#3b82f6]/10 border-l-2 border-l-[#3b82f6]'
                    : 'hover:bg-[#253449] border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-[#3b82f6] font-mono">{constraint.constraint_id}</code>
                    <span className="text-xs text-[#f1f5f9] truncate">{constraint.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#94a3b8]">{categoryLabels[constraint.category]}</span>
                    <span className="text-[10px] text-[#64748b] font-mono">{constraint.expression.substring(0, 30)}...</span>
                  </div>
                </div>
                <div className="w-16 flex justify-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                    constraint.type === 'hard'
                      ? 'bg-[#ef4444]/20 text-[#ef4444]'
                      : 'bg-[#3b82f6]/20 text-[#3b82f6]'
                  }`}>
                    {constraint.type === 'hard' ? 'HARD' : 'SOFT'}
                  </span>
                </div>
                <div className={`w-16 text-center font-mono text-[10px] uppercase ${getSeverityColor(constraint.severity)}`}>
                  {constraint.severity}
                </div>
                <div className="w-20 text-right font-mono text-xs text-[#f59e0b]">
                  {constraint.priority}
                </div>
                <div className="w-20 text-right font-mono text-xs text-[#94a3b8]">
                  {constraint.tags.length}
                </div>
                <div className="w-20 text-center">
                  {constraint.enabled ? (
                    <span className="text-[10px] text-[#10b981]">启用</span>
                  ) : (
                    <span className="text-[10px] text-[#64748b]">停用</span>
                  )}
                </div>
                <div className="w-8 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(constraint); }}
                    className={`p-1 rounded-sm transition-colors ${
                      constraint.enabled
                        ? 'text-[#10b981] hover:bg-[#10b981]/20'
                        : 'text-[#64748b] hover:bg-[#475569]'
                    }`}
                  >
                    {constraint.enabled ? <Play size={12} /> : <Pause size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Properties/Editor */}
        <div className="w-96 bg-[#334155] border-l border-[#3d5166] flex flex-col shrink-0">
          {selectedConstraint || isEditing ? (
            <>
              {/* Panel Header */}
              <div className="h-10 px-3 border-b border-[#3d5166] flex items-center justify-between bg-[#334155] shrink-0">
                <div className="flex items-center gap-2">
                  {formData.type === 'hard' ? (
                    <Shield size={14} className="text-[#ef4444]" />
                  ) : (
                    <Feather size={14} className="text-[#3b82f6]" />
                  )}
                  <span className="text-xs font-medium text-[#f1f5f9]">
                    {isEditing ? (selectedConstraint ? '编辑约束' : '新建约束') : '约束详情'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 hover:bg-[#475569] rounded-sm"
                    >
                      <Edit2 size={14} className="text-[#94a3b8]" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                // Edit Mode
                <>
                  {/* Tabs */}
                  <div className="px-3 border-b border-[#3d5166] bg-[#334155] flex items-center gap-1 shrink-0">
                    {(['basic', 'expression', 'resolution'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-[10px] border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'text-[#3b82f6] border-[#3b82f6]'
                            : 'text-[#94a3b8] border-transparent hover:text-[#cbd5e1]'
                        }`}
                      >
                        {tab === 'basic' && '基本信息'}
                        {tab === 'expression' && '表达式'}
                        {tab === 'resolution' && '冲突解决'}
                      </button>
                    ))}
                  </div>

                  {/* Edit Form */}
                  <div className="flex-1 overflow-auto p-3">
                    {activeTab === 'basic' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">约束ID</label>
                          <input
                            type="text"
                            value={formData.constraint_id}
                            onChange={(e) => setFormData({ ...formData, constraint_id: e.target.value })}
                            disabled={!!selectedConstraint}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none disabled:opacity-50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">名称</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">类型</label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'hard' | 'soft' })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                            >
                              <option value="hard">硬约束</option>
                              <option value="soft">软约束</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">类别</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                            >
                              {Object.entries(categoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">描述</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">严重等级</label>
                            <select
                              value={formData.severity}
                              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                            >
                              <option value="critical">严重</option>
                              <option value="high">高</option>
                              <option value="medium">中</option>
                              <option value="low">低</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">优先级 (1-10)</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={formData.priority}
                              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'expression' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">约束表达式</label>
                          <textarea
                            value={formData.expression}
                            onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
                            rows={4}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#10b981] font-mono focus:border-[#3b82f6] outline-none resize-none"
                            placeholder="delivery_date <= deadline"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">操作符</label>
                            <select
                              value={formData.operator}
                              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                            >
                              <option value="<=">&lt;=</option>
                              <option value="<">&lt;</option>
                              <option value=">=">&gt;=</option>
                              <option value=">">&gt;</option>
                              <option value="==">==</option>
                              <option value="minimize">minimize</option>
                              <option value="maximize">maximize</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">目标字段</label>
                            <input
                              type="text"
                              value={formData.target_field}
                              onChange={(e) => setFormData({ ...formData, target_field: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">阈值 (可选)</label>
                          <input
                            type="text"
                            value={formData.threshold || ''}
                            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'resolution' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">冲突解决策略</label>
                          <select
                            value={formData.conflict_resolution}
                            onChange={(e) => setFormData({ ...formData, conflict_resolution: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="priority">按优先级</option>
                            <option value="weighted">按权重</option>
                            <option value="abort">中止</option>
                            <option value="relax">松弛</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">回退动作</label>
                          <select
                            value={formData.fallback_action}
                            onChange={(e) => setFormData({ ...formData, fallback_action: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="block">阻断</option>
                            <option value="alert">告警</option>
                            <option value="skip">跳过</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">告警级别</label>
                          <select
                            value={formData.alert_level}
                            onChange={(e) => setFormData({ ...formData, alert_level: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="critical">严重</option>
                            <option value="high">高</option>
                            <option value="medium">中</option>
                            <option value="low">低</option>
                          </select>
                        </div>
                        {formData.type === 'soft' && (
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">权重 (0-1)</label>
                            <input
                              type="number"
                              min={0}
                              max={1}
                              step={0.1}
                              value={formData.weight || 0.5}
                              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#3b82f6] outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edit Actions */}
                  <div className="p-3 border-t border-[#3d5166] flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => { setIsEditing(false); if (selectedConstraint) setFormData(selectedConstraint); }}
                      className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] rounded-sm text-xs text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Save size={12} />
                      保存
                    </button>
                  </div>
                </>
              ) : (
                // View Mode - Runtime Metrics
                <div className="flex-1 overflow-auto">
                  {/* Status Badge */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-[#3b82f6] font-mono">{selectedConstraint?.constraint_id}</code>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] flex items-center gap-1 ${
                        selectedConstraint?.enabled
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#64748b]/20 text-[#64748b]'
                      }`}>
                        {selectedConstraint?.enabled ? <Play size={10} /> : <Pause size={10} />}
                        {selectedConstraint?.enabled ? '运行中' : '已停止'}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#f1f5f9] mt-2">{selectedConstraint?.name}</h3>
                    <p className="text-xs text-[#94a3b8] mt-1">{selectedConstraint?.description}</p>
                  </div>

                  {/* Expression */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">约束表达式</div>
                    <div className="bg-[#1e293b] rounded-sm p-2 font-mono text-xs text-[#10b981]">
                      {selectedConstraint?.expression}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px]">
                      <span className="text-[#64748b]">操作符: <span className="text-[#f1f5f9] font-mono">{selectedConstraint?.operator}</span></span>
                      <span className="text-[#64748b]">目标: <span className="text-[#f1f5f9] font-mono">{selectedConstraint?.target_field}</span></span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">标签</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedConstraint?.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#1e293b] text-[#94a3b8] text-[10px] rounded font-mono">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">配置信息</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">类型</span>
                        <span className={selectedConstraint?.type === 'hard' ? 'text-[#ef4444]' : 'text-[#3b82f6]'}>
                          {selectedConstraint?.type === 'hard' ? '硬约束' : '软约束'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">类别</span>
                        <span className="text-[#f1f5f9]">{selectedConstraint?.category && categoryLabels[selectedConstraint.category]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">优先级</span>
                        <span className="font-mono text-[#f59e0b]">{selectedConstraint?.priority}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">严重等级</span>
                        <span className={`uppercase ${getSeverityColor(selectedConstraint?.severity)}`}>{selectedConstraint?.severity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Resolution */}
                  <div className="p-3">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">冲突解决</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">解决策略</span>
                        <span className="text-[#f1f5f9]">{selectedConstraint?.conflict_resolution}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">回退动作</span>
                        <span className="text-[#f1f5f9]">{selectedConstraint?.fallback_action}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">告警级别</span>
                        <span className="text-[#f1f5f9] uppercase">{selectedConstraint?.alert_level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
              <Shield size={32} className="mb-3 opacity-30" />
              <p className="text-xs">选择一个约束查看详情</p>
              <p className="text-[10px] mt-1">或创建新约束</p>
            </div>
          )}
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center pt-32 z-50">
          <div className="bg-[#1e293b] border border-[#3d5166] rounded-sm w-full max-w-lg shadow-2xl">
            <div className="p-3 border-b border-[#334155] flex items-center gap-2">
              <Search size={16} className="text-[#94a3b8]" />
              <input
                type="text"
                autoFocus
                placeholder="搜索约束..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder:text-[#64748b]"
              />
              <button
                onClick={() => setShowCommandPalette(false)}
                className="text-[10px] text-[#64748b] px-1.5 py-0.5 border border-[#334155] rounded"
              >
                ESC
              </button>
            </div>
            <div className="max-h-64 overflow-auto py-1">
              {filteredConstraints.slice(0, 8).map((constraint) => (
                <button
                  key={constraint.constraint_id}
                  onClick={() => { handleSelectConstraint(constraint); setShowCommandPalette(false); setSearchTerm(''); }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[#334155] transition-colors text-left"
                >
                  {constraint.type === 'hard' ? (
                    <Shield size={14} className="text-[#ef4444]" />
                  ) : (
                    <Feather size={14} className="text-[#3b82f6]" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-[#f1f5f9]">{constraint.name}</div>
                    <div className="text-[10px] text-[#94a3b8] font-mono">{constraint.constraint_id}</div>
                  </div>
                  <span className="text-[10px] text-[#64748b]">{categoryLabels[constraint.category]}</span>
                </button>
              ))}
              {filteredConstraints.length === 0 && (
                <div className="px-3 py-4 text-center text-[#64748b] text-xs">
                  未找到匹配的约束
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t border-[#334155] flex items-center gap-4 text-[10px] text-[#64748b]">
              <span className="flex items-center gap-1"><span className="px-1 border border-[#334155] rounded">↑↓</span> 选择</span>
              <span className="flex items-center gap-1"><span className="px-1 border border-[#334155] rounded">↵</span> 打开</span>
              <span className="flex items-center gap-1"><span className="px-1 border border-[#334155] rounded">esc</span> 关闭</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
