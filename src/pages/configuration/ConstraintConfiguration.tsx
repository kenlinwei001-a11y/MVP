import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Shield, AlertCircle, CheckCircle,
  X, ChevronDown, ChevronUp, HardDrive, Feather, Target, Layers,
  Clock, User, Hash, AlertTriangle, Terminal, Save, Code,
  Command, Zap, BarChart3, Ban, Play, Pause, Filter, MoreVertical,
  FileCode, Settings, GitBranch
} from 'lucide-react';
import {
  Constraint,
  ConstraintNature,
  DynamicConstraintConfig,
  ConditionalRule,
  categoryLabels,
  categoryColors,
  natureLabels,
  natureColors,
  constraintLibrary,
  createEmptyConstraint
} from '../../shared/constraintLibrary';

// 动态约束配置表单类型（允许部分字段）
type DynamicConstraintConfigForm = Partial<DynamicConstraintConfig>;

const categoryIcons: Record<string, React.ReactNode> = {
  time: <Clock size={12} />,
  resource: <HardDrive size={12} />,
  process: <Layers size={12} />,
  cost: <BarChart3 size={12} />,
  quality: <CheckCircle size={12} />,
  safety: <Shield size={12} />,
};

// 从共享库导入约束数据和工具函数
// 约束列表在 src/shared/constraintLibrary.ts 中集中管理

export default function ConstraintConfiguration() {
  const [constraints, setConstraints] = useState<Constraint[]>(constraintLibrary);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedConstraint, setSelectedConstraint] = useState<Constraint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Constraint>(createEmptyConstraint());
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
    const newConstraint = createEmptyConstraint();
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
      default: return 'text-[#64748b]';
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
      <div className="h-9 px-3 border-b border-[#e2e8f0] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Command size={12} className="text-[#64748b]" />
            <span className="text-[10px] text-[#64748b]">约束规则</span>
          </div>
          <div className="h-4 w-px bg-[#475569]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 px-2 py-1 bg-[#f8fafc] rounded-sm border border-[#e2e8f0] hover:border-[#5a6f85] transition-colors"
            >
              <Search size={12} className="text-[#64748b]" />
              <span className="text-xs text-[#64748b]">搜索约束...</span>
              <span className="text-[10px] text-[#64748b] px-1 border border-[#e2e8f0] rounded">⌘K</span>
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
      <div className="h-8 px-3 border-b border-[#e2e8f0] flex items-center gap-6 bg-[#f8fafc] text-[10px] text-[#64748b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#1e293b] font-mono text-xs">{constraints.length}</span>
          <span>约束总数</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <span className="text-[#1e293b] font-mono text-xs">{stats.hardCount}</span>
          <span>硬约束</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[#1e293b] font-mono text-xs">{stats.active}</span>
          <span>运行中</span>
        </div>
        <div className="flex items-center gap-2">
          <Feather size={10} className="text-[#3b82f6]" />
          <span className="text-[#1e293b] font-mono text-xs">{stats.softCount}</span>
          <span>软约束</span>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Category Navigation */}
        <div className="w-44 bg-white border-r border-[#e2e8f0] flex flex-col shrink-0">
          <div className="h-7 px-3 border-b border-[#e2e8f0] flex items-center bg-white">
            <Filter size={10} className="text-[#64748b] mr-2" />
            <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">类型</span>
          </div>
          <div className="py-1 border-b border-[#e2e8f0]">
            <button
              onClick={() => setSelectedType('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <span>全部约束</span>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{typeCounts.all}</span>
            </button>
            <button
              onClick={() => setSelectedType('hard')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedType === 'hard'
                  ? 'bg-[#ef4444]/20 text-[#ef4444] border-l-2 border-[#ef4444]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={12} />
                <span>硬约束</span>
              </div>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{typeCounts.hard}</span>
            </button>
            <button
              onClick={() => setSelectedType('soft')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedType === 'soft'
                  ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Feather size={12} />
                <span>软约束</span>
              </div>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{typeCounts.soft}</span>
            </button>
          </div>
          <div className="h-7 px-3 border-b border-[#e2e8f0] flex items-center bg-white">
            <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">类别</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  selectedCategory === key
                    ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                    : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: categoryColors[key as Constraint['category']] }}>{categoryIcons[key]}</span>
                  <span>{label}</span>
                </div>
                <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{categoryCounts[key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - Constraint List */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] min-w-0">
          {/* List Header */}
          <div className="h-8 px-3 border-b border-[#e2e8f0] flex items-center bg-white text-[10px] text-[#64748b] shrink-0">
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
                className={`px-3 py-2 border-b border-[#e2e8f0] flex items-center cursor-pointer transition-colors ${
                  selectedConstraint?.constraint_id === constraint.constraint_id
                    ? 'bg-[#3b82f6]/5 border-l-2 border-l-[#3b82f6]'
                    : 'hover:bg-white border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-[#3b82f6] font-mono">{constraint.constraint_id}</code>
                    <span className="text-xs text-[#1e293b] truncate">{constraint.name}</span>
                    {/* Nature Tag */}
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-medium shrink-0"
                      style={{
                        backgroundColor: `${natureColors[constraint.nature || 'static']}15`,
                        color: natureColors[constraint.nature || 'static']
                      }}
                    >
                      {natureLabels[constraint.nature || 'static']}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#64748b]">{categoryLabels[constraint.category]}</span>
                    <span className="text-[10px] text-[#64748b] font-mono">{constraint.expression.substring(0, 30)}...</span>
                  </div>
                </div>
                <div className="w-16 flex justify-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                    constraint.type === 'hard'
                      ? 'bg-[#ef4444]/10 text-[#ef4444]'
                      : 'bg-[#3b82f6]/10 text-[#3b82f6]'
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
                <div className="w-20 text-right font-mono text-xs text-[#64748b]">
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
                        ? 'text-[#10b981] hover:bg-[#10b981]/10'
                        : 'text-[#64748b] hover:bg-[#f1f5f9]'
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
        <div className="w-96 bg-white border-l border-[#e2e8f0] flex flex-col shrink-0">
          {selectedConstraint || isEditing ? (
            <>
              {/* Panel Header */}
              <div className="h-10 px-3 border-b border-[#e2e8f0] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  {formData.type === 'hard' ? (
                    <Shield size={14} className="text-[#ef4444]" />
                  ) : (
                    <Feather size={14} className="text-[#3b82f6]" />
                  )}
                  <span className="text-xs font-medium text-[#1e293b]">
                    {isEditing ? (selectedConstraint ? '编辑约束' : '新建约束') : '约束详情'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 hover:bg-[#f1f5f9] rounded-sm"
                    >
                      <Edit2 size={14} className="text-[#64748b]" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                // Edit Mode
                <>
                  {/* Tabs */}
                  <div className="px-3 border-b border-[#e2e8f0] bg-white flex items-center gap-1 shrink-0">
                    {(['basic', 'expression', 'resolution'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-[10px] border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'text-[#3b82f6] border-[#3b82f6]'
                            : 'text-[#64748b] border-transparent hover:text-[#475569]'
                        }`}
                      >
                        {tab === 'basic' && '基本信息'}
                        {tab === 'expression' && '表达式'}
                        {tab === 'resolution' && '冲突解决'}
                      </button>
                    ))}
                  </div>

                  {/* Edit Form */}
                  <div className="flex-1 overflow-auto p-3 bg-white">
                    {activeTab === 'basic' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">约束ID</label>
                          <input
                            type="text"
                            value={formData.constraint_id}
                            onChange={(e) => setFormData({ ...formData, constraint_id: e.target.value })}
                            disabled={!!selectedConstraint}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none disabled:opacity-50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">名称</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">类型</label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'hard' | 'soft' })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                            >
                              <option value="hard">硬约束</option>
                              <option value="soft">软约束</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">类别</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                            >
                              {Object.entries(categoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">性质</label>
                            <select
                              value={formData.nature || 'static'}
                              onChange={(e) => setFormData({ ...formData, nature: e.target.value as ConstraintNature })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                              style={{ color: natureColors[formData.nature || 'static'] }}
                            >
                              <option value="static" style={{ color: natureColors.static }}>静态</option>
                              <option value="dynamic" style={{ color: natureColors.dynamic }}>动态</option>
                              <option value="conditional" style={{ color: natureColors.conditional }}>条件</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">描述</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">严重等级</label>
                            <select
                              value={formData.severity}
                              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                            >
                              <option value="critical">严重</option>
                              <option value="high">高</option>
                              <option value="medium">中</option>
                              <option value="low">低</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">优先级 (1-10)</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={formData.priority}
                              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                            />
                          </div>
                        </div>

                        {/* Dynamic Configuration Section */}
                        {formData.nature === 'dynamic' && (
                          <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                            <div className="flex items-center gap-2 mb-3">
                              <Zap size={14} className="text-[#f59e0b]" />
                              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">动态配置</span>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] text-[#64748b] uppercase block mb-1">更新频率</label>
                                <select
                                  value={formData.dynamicConfig?.updateFrequency || 'realtime'}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    dynamicConfig: {
                                      ...formData.dynamicConfig,
                                      updateFrequency: e.target.value as 'realtime' | 'hourly' | 'daily' | 'weekly'
                                    }
                                  })}
                                  className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                                >
                                  <option value="realtime">实时</option>
                                  <option value="hourly">每小时</option>
                                  <option value="daily">每天</option>
                                  <option value="weekly">每周</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-[#64748b] uppercase block mb-1">上下文变量 (逗号分隔)</label>
                                <input
                                  type="text"
                                  value={formData.dynamicConfig?.contextVariables?.join(', ') || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    dynamicConfig: {
                                      ...formData.dynamicConfig,
                                      contextVariables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                                    }
                                  })}
                                  placeholder="current_load, resource_availability"
                                  className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-[#64748b] uppercase block mb-1">计算公式</label>
                                <textarea
                                  value={formData.dynamicConfig?.calculationFormula || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    dynamicConfig: {
                                      ...formData.dynamicConfig,
                                      calculationFormula: e.target.value
                                    }
                                  })}
                                  rows={3}
                                  placeholder="base_capacity * load_factor + buffer"
                                  className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#334155] rounded-sm text-xs text-[#10b981] font-mono focus:border-[#3b82f6] outline-none resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Conditional Rules Section */}
                        {formData.nature === 'conditional' && (
                          <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} className="text-[#8b5cf6]" />
                                <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">条件规则</span>
                              </div>
                              <button
                                onClick={() => {
                                  const newRule: ConditionalRule = {
                                    condition: 'context.priority == "urgent"',
                                    threshold: 0.9,
                                    priority: 10,
                                    description: '高优先级订单'
                                  };
                                  setFormData({
                                    ...formData,
                                    conditionalRules: [...(formData.conditionalRules || []), newRule]
                                  });
                                }}
                                className="px-2 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-sm text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <Plus size={10} />
                                添加规则
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(formData.conditionalRules || []).map((rule, idx) => (
                                <div key={idx} className="border border-[#e2e8f0] rounded-md p-3 bg-[#f8fafc]">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="w-5 h-5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                                    <button
                                      onClick={() => {
                                        const updated = (formData.conditionalRules || []).filter((_, i) => i !== idx);
                                        setFormData({ ...formData, conditionalRules: updated });
                                      }}
                                      className="p-1 hover:bg-[#ef4444]/10 text-[#64748b] hover:text-[#ef4444] rounded transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">描述</label>
                                      <input
                                        type="text"
                                        value={rule.description || ''}
                                        onChange={(e) => {
                                          const updated = [...(formData.conditionalRules || [])];
                                          updated[idx] = { ...rule, description: e.target.value };
                                          setFormData({ ...formData, conditionalRules: updated });
                                        }}
                                        className="w-full px-2 py-1 bg-white border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">条件</label>
                                        <input
                                          type="text"
                                          value={rule.condition}
                                          onChange={(e) => {
                                            const updated = [...(formData.conditionalRules || [])];
                                            updated[idx] = { ...rule, condition: e.target.value };
                                            setFormData({ ...formData, conditionalRules: updated });
                                          }}
                                          placeholder="context.priority == 'urgent'"
                                          className="w-full px-2 py-1 bg-[#1e293b] border border-[#334155] rounded-sm text-xs text-[#3b82f6] font-mono focus:border-[#3b82f6] outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">阈值</label>
                                        <input
                                          type="text"
                                          value={rule.threshold}
                                          onChange={(e) => {
                                            const updated = [...(formData.conditionalRules || [])];
                                            updated[idx] = { ...rule, threshold: e.target.value };
                                            setFormData({ ...formData, conditionalRules: updated });
                                          }}
                                          className="w-full px-2 py-1 bg-white border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none font-mono"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">优先级权重</label>
                                      <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={rule.priority}
                                        onChange={(e) => {
                                          const updated = [...(formData.conditionalRules || [])];
                                          updated[idx] = { ...rule, priority: parseInt(e.target.value) || 1 };
                                          setFormData({ ...formData, conditionalRules: updated });
                                        }}
                                        className="w-full px-2 py-1 bg-white border border-[#e2e8f0] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {(formData.conditionalRules || []).length === 0 && (
                                <div className="text-center py-4 text-[#94a3b8] text-xs">
                                  暂无规则，点击上方按钮添加
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'expression' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">约束表达式</label>
                          <textarea
                            value={formData.expression}
                            onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
                            rows={4}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#10b981] font-mono focus:border-[#3b82f6] outline-none resize-none"
                            placeholder="delivery_date <= deadline"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">操作符</label>
                            <select
                              value={formData.operator}
                              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
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
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">目标字段</label>
                            <input
                              type="text"
                              value={formData.target_field}
                              onChange={(e) => setFormData({ ...formData, target_field: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">阈值 (可选)</label>
                          <input
                            type="text"
                            value={formData.threshold || ''}
                            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'resolution' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">冲突解决策略</label>
                          <select
                            value={formData.conflict_resolution}
                            onChange={(e) => setFormData({ ...formData, conflict_resolution: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="priority">按优先级</option>
                            <option value="weighted">按权重</option>
                            <option value="abort">中止</option>
                            <option value="relax">松弛</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">回退动作</label>
                          <select
                            value={formData.fallback_action}
                            onChange={(e) => setFormData({ ...formData, fallback_action: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="block">阻断</option>
                            <option value="alert">告警</option>
                            <option value="skip">跳过</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">告警级别</label>
                          <select
                            value={formData.alert_level}
                            onChange={(e) => setFormData({ ...formData, alert_level: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="critical">严重</option>
                            <option value="high">高</option>
                            <option value="medium">中</option>
                            <option value="low">低</option>
                          </select>
                        </div>
                        {formData.type === 'soft' && (
                          <div>
                            <label className="text-[10px] text-[#64748b] uppercase block mb-1">权重 (0-1)</label>
                            <input
                              type="number"
                              min={0}
                              max={1}
                              step={0.1}
                              value={formData.weight || 0.5}
                              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                              className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edit Actions */}
                  <div className="p-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => { setIsEditing(false); if (selectedConstraint) setFormData(selectedConstraint); }}
                      className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#1e293b] transition-colors"
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
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {/* Header Card */}
                  <div className="bg-gradient-to-br from-[#f8fafc] to-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedConstraint?.type === 'hard' ? 'bg-[#ef4444]/10' : 'bg-[#3b82f6]/10'
                        }`}>
                          {selectedConstraint?.type === 'hard' ? (
                            <Shield size={16} className="text-[#ef4444]" />
                          ) : (
                            <Feather size={16} className="text-[#3b82f6]" />
                          )}
                        </div>
                        <div>
                          <code className="text-[10px] text-[#3b82f6] font-mono">{selectedConstraint?.constraint_id}</code>
                          <h3 className="text-sm font-semibold text-[#1e293b]">{selectedConstraint?.name}</h3>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 ${
                        selectedConstraint?.enabled
                          ? 'bg-[#10b981]/10 text-[#10b981]'
                          : 'bg-[#64748b]/10 text-[#64748b]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedConstraint?.enabled ? 'bg-[#10b981] animate-pulse' : 'bg-[#64748b]'}`} />
                        {selectedConstraint?.enabled ? '运行中' : '已停止'}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] leading-relaxed">{selectedConstraint?.description}</p>
                  </div>

                  {/* Expression Card */}
                  <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
                    <div className="px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2">
                      <FileCode size={12} className="text-[#64748b]" />
                      <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">约束表达式</span>
                    </div>
                    <div className="p-3">
                      <div className="bg-[#1e293b] rounded-md p-3 font-mono text-xs text-[#10b981] overflow-x-auto">
                        {selectedConstraint?.expression}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-[#f8fafc] rounded-md p-2">
                          <span className="text-[10px] text-[#94a3b8] block mb-1">操作符</span>
                          <code className="text-xs text-[#1e293b] font-mono font-semibold">{selectedConstraint?.operator}</code>
                        </div>
                        <div className="bg-[#f8fafc] rounded-md p-2">
                          <span className="text-[10px] text-[#94a3b8] block mb-1">目标字段</span>
                          <code className="text-xs text-[#1e293b] font-mono font-semibold">{selectedConstraint?.target_field}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedConstraint?.tags && selectedConstraint.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConstraint.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-[#f1f5f9] text-[#475569] text-[10px] rounded-full font-medium border border-[#e2e8f0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Configuration Grid */}
                  <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
                    <div className="px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2">
                      <Settings size={12} className="text-[#64748b]" />
                      <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">配置信息</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#94a3b8] uppercase">类型</span>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                          selectedConstraint?.type === 'hard'
                            ? 'bg-[#ef4444]/10 text-[#ef4444]'
                            : 'bg-[#3b82f6]/10 text-[#3b82f6]'
                        }`}>
                          {selectedConstraint?.type === 'hard' ? <Shield size={12} /> : <Feather size={12} />}
                          {selectedConstraint?.type === 'hard' ? '硬约束' : '软约束'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#94a3b8] uppercase">类别</span>
                        <span className="block text-xs text-[#1e293b] font-medium">{selectedConstraint?.category && categoryLabels[selectedConstraint.category]}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#94a3b8] uppercase">性质</span>
                        <span
                          className="inline-block px-2 py-1 rounded-md text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${natureColors[selectedConstraint?.nature || 'static']}15`,
                            color: natureColors[selectedConstraint?.nature || 'static']
                          }}
                        >
                          {natureLabels[selectedConstraint?.nature || 'static']}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#94a3b8] uppercase">优先级</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-[#f59e0b]">{selectedConstraint?.priority}</span>
                          <span className="text-[10px] text-[#94a3b8]">/ 100</span>
                        </div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-[10px] text-[#94a3b8] uppercase">严重等级</span>
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${
                          selectedConstraint?.severity === 'critical' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                          selectedConstraint?.severity === 'high' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                          selectedConstraint?.severity === 'medium' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                          'bg-[#10b981]/10 text-[#10b981]'
                        }`}>{selectedConstraint?.severity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic/Conditional Config */}
                  {selectedConstraint?.nature === 'dynamic' && selectedConstraint.dynamicConfig && (
                    <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
                      <div className="px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2">
                        <Zap size={12} className="text-[#f59e0b]" />
                        <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">动态配置</span>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#f8fafc] rounded-md p-2">
                            <span className="text-[10px] text-[#94a3b8] block mb-1">更新频率</span>
                            <span className="text-xs text-[#1e293b] font-medium">{selectedConstraint.dynamicConfig.updateFrequency}</span>
                          </div>
                          <div className="bg-[#f8fafc] rounded-md p-2">
                            <span className="text-[10px] text-[#94a3b8] block mb-1">上下文变量</span>
                            <code className="text-[10px] text-[#3b82f6] font-mono">{selectedConstraint.dynamicConfig.contextVariables?.join(', ') || '-'}</code>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">计算公式</span>
                          <code className="block text-[10px] text-[#10b981] font-mono bg-[#1e293b] px-3 py-2 rounded-md overflow-x-auto">
                            {selectedConstraint.dynamicConfig.calculationFormula}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedConstraint?.nature === 'conditional' && selectedConstraint.conditionalRules && (
                    <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
                      <div className="px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2">
                        <GitBranch size={12} className="text-[#8b5cf6]" />
                        <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">条件规则</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {selectedConstraint.conditionalRules.map((rule, idx) => (
                          <div key={idx} className="border border-[#e2e8f0] rounded-md p-3 bg-[#f8fafc]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                              <span className="text-xs text-[#475569] font-medium">{rule.description}</span>
                            </div>
                            <code className="text-[10px] text-[#3b82f6] font-mono bg-white px-2 py-1 rounded block border border-[#e2e8f0]">
                              IF {rule.condition} → 阈值: {rule.threshold}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conflict Resolution */}
                  <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
                    <div className="px-3 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2">
                      <AlertTriangle size={12} className="text-[#f59e0b]" />
                      <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">冲突解决</span>
                    </div>
                    <div className="p-3 grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">解决策略</span>
                        <span className="text-xs text-[#1e293b] font-medium bg-[#f8fafc] px-2 py-1 rounded-md inline-block">{selectedConstraint?.conflict_resolution}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">回退动作</span>
                        <span className="text-xs text-[#1e293b] font-medium bg-[#f8fafc] px-2 py-1 rounded-md inline-block">{selectedConstraint?.fallback_action}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">告警级别</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md inline-block uppercase ${
                          selectedConstraint?.alert_level === 'critical' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                          selectedConstraint?.alert_level === 'high' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                          selectedConstraint?.alert_level === 'medium' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                          'bg-[#10b981]/10 text-[#10b981]'
                        }`}>{selectedConstraint?.alert_level}</span>
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
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-sm w-full max-w-lg shadow-2xl">
            <div className="p-3 border-b border-[#e2e8f0] flex items-center gap-2">
              <Search size={16} className="text-[#64748b]" />
              <input
                type="text"
                autoFocus
                placeholder="搜索约束..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1e293b] placeholder:text-[#64748b]"
              />
              <button
                onClick={() => setShowCommandPalette(false)}
                className="text-[10px] text-[#64748b] px-1.5 py-0.5 border border-[#e2e8f0] rounded"
              >
                ESC
              </button>
            </div>
            <div className="max-h-64 overflow-auto py-1">
              {filteredConstraints.slice(0, 8).map((constraint) => (
                <button
                  key={constraint.constraint_id}
                  onClick={() => { handleSelectConstraint(constraint); setShowCommandPalette(false); setSearchTerm(''); }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white transition-colors text-left"
                >
                  {constraint.type === 'hard' ? (
                    <Shield size={14} className="text-[#ef4444]" />
                  ) : (
                    <Feather size={14} className="text-[#3b82f6]" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-[#1e293b]">{constraint.name}</div>
                    <div className="text-[10px] text-[#64748b] font-mono">{constraint.constraint_id}</div>
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
            <div className="px-3 py-2 border-t border-[#e2e8f0] flex items-center gap-4 text-[10px] text-[#64748b]">
              <span className="flex items-center gap-1"><span className="px-1 border border-[#e2e8f0] rounded">↑↓</span> 选择</span>
              <span className="flex items-center gap-1"><span className="px-1 border border-[#e2e8f0] rounded">↵</span> 打开</span>
              <span className="flex items-center gap-1"><span className="px-1 border border-[#e2e8f0] rounded">esc</span> 关闭</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
