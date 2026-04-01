import React, { useState, useMemo } from 'react';
import {
  Sparkles, Plus, Search, Edit2, Trash2, Activity, Clock, CheckCircle,
  X, FileCode, BookOpen, AlertTriangle, Save, Layers, Cpu, Target, Brain,
  Command, ChevronRight, Zap, BarChart3, Code, Terminal, Box, Play, Pause,
  MoreVertical, Filter, Download, Upload
} from 'lucide-react';

// 技能配置类型 - 符合行业标准
interface Skill {
  skill_id: string;
  name: string;
  version: string;
  category: 'workflow' | 'data-analysis' | 'prediction' | 'optimization' | 'detection' | 'visualization' | 'nlp' | 'code-generation' | 'integration' | 'automation';
  domain: string[];
  description: string;
  author: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'error';
  deprecated?: boolean;
  deprecated_reason?: string;
  dependencies: string[];
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  examples: Array<{
    name: string;
    input: Record<string, any>;
    output: Record<string, any>;
    description?: string;
  }>;
  triggers: {
    description: string;
    examples: string[];
    keywords: string[];
  };
  gotchas: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    solution: string;
  }>;
  files: {
    readme?: string;
    config?: Record<string, any>;
    script?: string;
    script_lang?: 'python' | 'javascript';
    references?: string[];
  };
  installation: {
    installed: boolean;
    installed_at?: string;
    installed_version?: string;
    path?: string;
  };
}

const categoryLabels: Record<string, string> = {
  workflow: '工作流',
  'data-analysis': '数据分析',
  prediction: '预测',
  optimization: '优化',
  detection: '检测',
  visualization: '可视化',
  nlp: 'NLP',
  'code-generation': '代码生成',
  integration: '集成',
  automation: '自动化',
};

const categoryIcons: Record<string, React.ReactNode> = {
  workflow: <Layers size={12} />,
  'data-analysis': <BarChart3 size={12} />,
  prediction: <Brain size={12} />,
  optimization: <Target size={12} />,
  detection: <Activity size={12} />,
  visualization: <Box size={12} />,
  nlp: <Terminal size={12} />,
  'code-generation': <Code size={12} />,
  integration: <Zap size={12} />,
  automation: <Cpu size={12} />,
};

const initialSkills: Skill[] = [
  {
    skill_id: 'ts_analysis_v2',
    name: '时序数据分析',
    version: '2.1.0',
    category: 'data-analysis',
    domain: ['production', 'quality', 'equipment'],
    description: '基于ARIMA、LSTM、Prophet等算法对时间序列数据进行趋势分析、季节性分解和异常检测。',
    author: 'AI Lab - Data Team',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    status: 'active',
    dependencies: ['numpy', 'pandas', 'prophet'],
    input_schema: {
      type: 'object',
      properties: {
        data: { type: 'array', description: '时间序列数据点数组' },
        timestamp_field: { type: 'string' },
        value_field: { type: 'string' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        trend: { type: 'array' },
        forecast: { type: 'array' },
        anomalies: { type: 'array' }
      }
    },
    examples: [
      {
        name: '产能趋势分析',
        input: { data: [{timestamp: '2024-01', value: 1000}], timestamp_field: 'timestamp', value_field: 'value' },
        output: { trend: [1000, 1050, 1100], forecast: [1150, 1200], anomalies: [] },
        description: '分析过去三个月的产能趋势'
      }
    ],
    triggers: {
      description: '当用户需要对历史数据进行趋势分析时触发',
      examples: ['分析过去三个月的产能趋势', '找出产量异常下降的时段'],
      keywords: ['趋势', '分析', '时序', '预测', '异常']
    },
    gotchas: [
      { id: 'g1', title: '数据频率不一致', description: '输入数据必须保持统一的时间频率', severity: 'high', solution: '在预处理阶段使用resample方法统一频率' }
    ],
    files: {
      readme: '# 时序数据分析技能',
      config: { default_algorithm: 'prophet' },
      script_lang: 'python'
    },
    installation: { installed: true, installed_at: '2024-03-15T10:00:00Z', installed_version: '2.1.0', path: '/skills/ts_analysis_v2' }
  },
  {
    skill_id: 'demand_forecast_v3',
    name: '需求预测',
    version: '3.0.2',
    category: 'prediction',
    domain: ['production', 'sales', 'supply-chain'],
    description: '综合历史订单、市场趋势、季节性因素提供多维度需求预测。',
    author: 'AI Lab - Planning Team',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-25T16:45:00Z',
    status: 'active',
    dependencies: ['ts_analysis_v2', 'scikit-learn'],
    input_schema: { type: 'object', properties: { historical_orders: { type: 'array' }, sku_list: { type: 'array' } } },
    output_schema: { type: 'object', properties: { forecasts: { type: 'array' }, confidence_levels: { type: 'object' } } },
    examples: [
      {
        name: '月度需求预测',
        input: { historical_orders: [{month: '2024-01', quantity: 1000}], sku_list: ['SKU001'] },
        output: { forecasts: [{month: '2024-04', quantity: 1200}], confidence_levels: { '80%': [1100, 1300] } }
      }
    ],
    triggers: { description: '当需要对未来需求进行预测时触发', examples: ['预测下个月的电池需求量'], keywords: ['预测', '需求', '订单'] },
    gotchas: [],
    files: { readme: '# 需求预测技能', config: {}, script_lang: 'python' },
    installation: { installed: true, installed_at: '2024-03-10T11:00:00Z', installed_version: '3.0.2', path: '/skills/demand_forecast_v3' }
  },
  {
    skill_id: 'quality_detect_v1',
    name: '质量异常检测',
    version: '1.5.0',
    category: 'detection',
    domain: ['quality', 'production'],
    description: '基于计算机视觉和统计方法实时检测产品质量异常。',
    author: 'AI Lab - Vision Team',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-03-22T09:15:00Z',
    status: 'active',
    dependencies: ['opencv', 'tensorflow'],
    input_schema: { type: 'object', properties: { image_data: { type: 'string' }, product_id: { type: 'string' } } },
    output_schema: { type: 'object', properties: { is_defective: { type: 'boolean' }, confidence: { type: 'number' } } },
    examples: [
      {
        name: '电池外观检测',
        input: { image_data: 'base64encoded...', product_id: 'CELL001' },
        output: { is_defective: false, confidence: 0.98 }
      }
    ],
    triggers: { description: '当产品经过质检工位时触发', examples: ['检测这批产品是否有缺陷'], keywords: ['质检', '缺陷', '检测'] },
    gotchas: [
      { id: 'g1', title: '光照条件影响', description: '图像质量受光照条件影响较大', severity: 'medium', solution: '确保质检工位光照强度在500-800lux之间' }
    ],
    files: { readme: '# 质量异常检测技能', config: {}, script_lang: 'python' },
    installation: { installed: true, installed_at: '2024-02-15T14:00:00Z', installed_version: '1.5.0', path: '/skills/quality_detect_v1' }
  },
  {
    skill_id: 'scheduling_opt_v2',
    name: '生产排程优化',
    version: '2.0.1',
    category: 'optimization',
    domain: ['production', 'scheduling'],
    description: '基于约束求解和启发式算法优化生产排程。',
    author: 'AI Lab - Optimization Team',
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-03-24T11:30:00Z',
    status: 'active',
    dependencies: ['ortools', 'numpy'],
    input_schema: { type: 'object', properties: { orders: { type: 'array' }, resources: { type: 'array' }, constraints: { type: 'array' } } },
    output_schema: { type: 'object', properties: { schedule: { type: 'object' }, utilization: { type: 'number' } } },
    examples: [
      {
        name: '周排程优化',
        input: { orders: [{id: 'O001', quantity: 100}], resources: [{id: 'R001', capacity: 50}] },
        output: { schedule: { 'R001': ['O001', 'O002'] }, utilization: 0.85 }
      }
    ],
    triggers: { description: '当需要生成或优化生产排程时触发', examples: ['为下周订单生成排程'], keywords: ['排程', '计划', '优化'] },
    gotchas: [],
    files: { readme: '# 生产排程优化技能', config: {}, script_lang: 'python' },
    installation: { installed: true, installed_at: '2024-03-01T09:00:00Z', installed_version: '2.0.1', path: '/skills/scheduling_opt_v2' }
  },
  {
    skill_id: 'nlp_query_v1',
    name: '自然语言查询',
    version: '1.2.0',
    category: 'nlp',
    domain: ['general', 'data-access'],
    description: '将自然语言问题转换为结构化查询并执行。',
    author: 'AI Lab - NLP Team',
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-03-23T16:00:00Z',
    status: 'inactive',
    deprecated: true,
    deprecated_reason: '已迁移到nlp_query_v2，新版本支持更多数据源',
    dependencies: ['openai', 'langchain'],
    input_schema: { type: 'object', properties: { query: { type: 'string' }, context: { type: 'object' } } },
    output_schema: { type: 'object', properties: { sql: { type: 'string' }, results: { type: 'array' } } },
    examples: [
      {
        name: '查询产量',
        input: { query: '上个月产量最高的车间', context: { user_role: 'manager' } },
        output: { sql: 'SELECT workshop, SUM(output) FROM production WHERE month=...', results: [{workshop: 'A1', output: 10000}] }
      }
    ],
    triggers: { description: '当用户用自然语言提问时触发', examples: ['查询上个月产量最高的车间'], keywords: ['查询', '多少', '最高', '最低'] },
    gotchas: [],
    files: { readme: '# 自然语言查询技能', config: {}, script_lang: 'javascript' },
    installation: { installed: false }
  }
];

const emptySkill: Skill = {
  skill_id: '',
  name: '',
  version: '1.0.0',
  category: 'data-analysis',
  domain: [],
  description: '',
  author: 'Current User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'inactive',
  dependencies: [],
  input_schema: { type: 'object', properties: {} },
  output_schema: { type: 'object', properties: {} },
  examples: [],
  triggers: { description: '', examples: [], keywords: [] },
  gotchas: [],
  files: {},
  installation: { installed: false }
};

export default function SkillConfiguration() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Skill>(emptySkill);
  const [activeTab, setActiveTab] = useState<'basic' | 'dependencies' | 'schema' | 'triggers'>('basic');

  // Filter skills by category and search
  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.skill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedCategory, searchTerm]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: skills.length };
    skills.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [skills]);

  // Stats - 仅统计配置信息，运行时数据已剥离到监控系统
  const stats = useMemo(() => {
    const active = skills.filter(s => s.status === 'active').length;
    const installed = skills.filter(s => s.installation.installed).length;
    const deprecated = skills.filter(s => s.deprecated).length;
    return { active, installed, deprecated };
  }, [skills]);

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setFormData({ ...skill });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newSkill: Skill = {
      ...emptySkill,
      skill_id: `skill_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFormData(newSkill);
    setSelectedSkill(null);
    setIsEditing(true);
    setActiveTab('basic');
  };

  const handleSave = () => {
    if (selectedSkill) {
      // Update existing
      setSkills(skills.map(s => s.skill_id === selectedSkill.skill_id
        ? { ...formData, updated_at: new Date().toISOString() }
        : s
      ));
      setSelectedSkill({ ...formData, updated_at: new Date().toISOString() });
    } else {
      // Create new
      const newSkill = { ...formData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setSkills([...skills, newSkill]);
      setSelectedSkill(newSkill);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setSkills(skills.filter(s => s.skill_id !== id));
    if (selectedSkill?.skill_id === id) {
      setSelectedSkill(null);
    }
  };

  const handleToggleStatus = (skill: Skill) => {
    const newStatus: 'active' | 'inactive' = skill.status === 'active' ? 'inactive' : 'active';
    const updated: Skill = { ...skill, status: newStatus };
    setSkills(skills.map(s => s.skill_id === skill.skill_id ? updated : s));
    if (selectedSkill?.skill_id === skill.skill_id) {
      setSelectedSkill(updated);
      setFormData(updated);
    }
  };

  return (
    <div className="h-full flex flex-col text-sm">
      {/* Header Toolbar - Palantir Style */}
      <div className="h-9 px-3 border-b border-[#334155] flex items-center justify-between bg-[#334155] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Command size={12} className="text-[#94a3b8]" />
            <span className="text-[10px] text-[#64748b]">技能中心</span>
          </div>
          <div className="h-4 w-px bg-[#475569]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 px-2 py-1 bg-[#1e293b] rounded-sm border border-[#3d5166] hover:border-[#5a6f85] transition-colors"
            >
              <Search size={12} className="text-[#94a3b8]" />
              <span className="text-xs text-[#94a3b8]">搜索技能...</span>
              <span className="text-[10px] text-[#64748b] px-1 border border-[#334155] rounded">⌘K</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-sm text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus size={12} />
            新建技能
          </button>
        </div>
      </div>

      {/* Stats Bar - Configuration Metrics Only */}
      <div className="h-8 px-3 border-b border-[#334155] flex items-center gap-6 bg-[#1e293b] text-[10px] text-[#94a3b8] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#f1f5f9] font-mono text-xs">{skills.length}</span>
          <span>技能总数</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[#f1f5f9] font-mono text-xs">{stats.active}</span>
          <span>运行中</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={10} className="text-[#3b82f6]" />
          <span className="text-[#f1f5f9] font-mono text-xs">{stats.installed}</span>
          <span>已安装</span>
        </div>
        {stats.deprecated > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle size={10} className="text-[#f59e0b]" />
            <span className="text-[#f1f5f9] font-mono text-xs">{stats.deprecated}</span>
            <span className="text-[#f59e0b]">已弃用</span>
          </div>
        )}
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Category Navigation */}
        <div className="w-44 bg-[#334155] border-r border-[#3d5166] flex flex-col shrink-0">
          <div className="h-7 px-3 border-b border-[#3d5166] flex items-center bg-[#334155]">
            <Filter size={10} className="text-[#94a3b8] mr-2" />
            <span className="text-[10px] font-semibold text-[#cbd5e1] uppercase tracking-wider">类别</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-l-2 border-[#8b5cf6]'
                  : 'text-[#cbd5e1] hover:bg-[#475569] border-l-2 border-transparent'
              }`}
            >
              <span>全部技能</span>
              <span className="font-mono text-[10px] bg-[#1e293b] px-1.5 py-0.5 rounded">{categoryCounts.all}</span>
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  selectedCategory === key
                    ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-l-2 border-[#8b5cf6]'
                    : 'text-[#cbd5e1] hover:bg-[#475569] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#94a3b8]">{categoryIcons[key]}</span>
                  <span>{label}</span>
                </div>
                <span className="font-mono text-[10px] bg-[#1e293b] px-1.5 py-0.5 rounded">{categoryCounts[key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - Skill List */}
        <div className="flex-1 flex flex-col bg-[#1e293b] min-w-0">
          {/* List Header */}
          <div className="h-8 px-3 border-b border-[#334155] flex items-center bg-[#253449] text-[10px] text-[#94a3b8] shrink-0">
            <div className="flex-1">技能ID / 名称</div>
            <div className="w-20 text-center">状态</div>
            <div className="w-24 text-center">依赖</div>
            <div className="w-8" />
          </div>

          {/* Skill List */}
          <div className="flex-1 overflow-auto">
            {filteredSkills.map((skill) => (
              <div
                key={skill.skill_id}
                onClick={() => handleSelectSkill(skill)}
                className={`px-3 py-2 border-b border-[#334155] flex items-center cursor-pointer transition-colors group ${
                  selectedSkill?.skill_id === skill.skill_id
                    ? 'bg-[#8b5cf6]/10 border-l-2 border-l-[#8b5cf6]'
                    : 'hover:bg-[#253449] border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-[#8b5cf6] font-mono">{skill.skill_id}</code>
                    <span className="text-xs text-[#f1f5f9] truncate">{skill.name}</span>
                    {skill.deprecated && (
                      <span className="px-1 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] text-[9px] rounded">已弃用</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#94a3b8]">{categoryLabels[skill.category]}</span>
                    <span className="text-[10px] text-[#64748b]">v{skill.version}</span>
                    {skill.installation.installed && (
                      <CheckCircle size={10} className="text-[#10b981]" />
                    )}
                  </div>
                </div>
                <div className="w-20 flex justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(skill); }}
                    className={`px-2 py-0.5 rounded-sm text-[10px] flex items-center gap-1 transition-colors ${
                      skill.status === 'active'
                        ? 'bg-[#10b981]/20 text-[#10b981]'
                        : 'bg-[#64748b]/20 text-[#64748b]'
                    }`}
                  >
                    {skill.status === 'active' ? <Play size={8} /> : <Pause size={8} />}
                    {skill.status === 'active' ? '运行' : '停止'}
                  </button>
                </div>
                <div className="w-24 text-center">
                  {skill.dependencies.length > 0 ? (
                    <span className="text-[10px] text-[#94a3b8] font-mono">{skill.dependencies.length} 个</span>
                  ) : (
                    <span className="text-[10px] text-[#64748b]">-</span>
                  )}
                </div>
                <div className="w-8 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(skill.skill_id); }}
                    className="p-1 hover:bg-[#ef4444]/20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} className="text-[#ef4444]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Properties/Editor */}
        <div className="w-96 bg-[#334155] border-l border-[#3d5166] flex flex-col shrink-0">
          {selectedSkill || isEditing ? (
            <>
              {/* Panel Header */}
              <div className="h-10 px-3 border-b border-[#3d5166] flex items-center justify-between bg-[#334155] shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#8b5cf6]" />
                  <span className="text-xs font-medium text-[#f1f5f9]">
                    {isEditing ? (selectedSkill ? '编辑技能' : '新建技能') : '技能详情'}
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
                    {(['basic', 'dependencies', 'schema', 'triggers'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-[10px] border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'text-[#8b5cf6] border-[#8b5cf6]'
                            : 'text-[#94a3b8] border-transparent hover:text-[#cbd5e1]'
                        }`}
                      >
                        {tab === 'basic' && '基本信息'}
                        {tab === 'dependencies' && '依赖'}
                        {tab === 'schema' && 'Schema'}
                        {tab === 'triggers' && '触发'}
                      </button>
                    ))}
                  </div>

                  {/* Edit Form */}
                  <div className="flex-1 overflow-auto p-3">
                    {activeTab === 'basic' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">技能ID</label>
                          <input
                            type="text"
                            value={formData.skill_id}
                            onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                            disabled={!!selectedSkill}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none disabled:opacity-50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">名称</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">版本</label>
                            <input
                              type="text"
                              value={formData.version}
                              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">类别</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
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
                            rows={3}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">作者</label>
                          <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'dependencies' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                            依赖项 (逗号分隔)
                          </label>
                          <input
                            type="text"
                            value={formData.dependencies.join(', ')}
                            onChange={(e) => setFormData({
                              ...formData,
                              dependencies: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                            })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
                            placeholder="skill_id1, skill_id2, package_name"
                          />
                          <p className="text-[10px] text-[#64748b] mt-1">
                            声明此技能依赖的其他技能或软件包
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="deprecated"
                            checked={formData.deprecated || false}
                            onChange={(e) => setFormData({ ...formData, deprecated: e.target.checked })}
                            className="rounded border-[#475569] bg-[#1e293b]"
                          />
                          <label htmlFor="deprecated" className="text-xs text-[#f1f5f9]">标记为已弃用</label>
                        </div>
                        {formData.deprecated && (
                          <div>
                            <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                              弃用原因 / 替代方案
                            </label>
                            <input
                              type="text"
                              value={formData.deprecated_reason || ''}
                              onChange={(e) => setFormData({ ...formData, deprecated_reason: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
                              placeholder="请说明弃用原因和推荐的替代技能"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'schema' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">输入 Schema</label>
                          <textarea
                            value={JSON.stringify(formData.input_schema, null, 2)}
                            onChange={(e) => {
                              try { setFormData({ ...formData, input_schema: JSON.parse(e.target.value) }); } catch {}
                            }}
                            rows={10}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none resize-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">输出 Schema</label>
                          <textarea
                            value={JSON.stringify(formData.output_schema, null, 2)}
                            onChange={(e) => {
                              try { setFormData({ ...formData, output_schema: JSON.parse(e.target.value) }); } catch {}
                            }}
                            rows={10}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none resize-none font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'triggers' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">触发描述</label>
                          <textarea
                            value={formData.triggers.description}
                            onChange={(e) => setFormData({ ...formData, triggers: { ...formData.triggers, description: e.target.value } })}
                            rows={2}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">关键词 (逗号分隔)</label>
                          <input
                            type="text"
                            value={formData.triggers.keywords.join(', ')}
                            onChange={(e) => setFormData({ ...formData, triggers: { ...formData.triggers, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) } })}
                            className="w-full px-2 py-1.5 bg-[#1e293b] border border-[#475569] rounded-sm text-xs text-[#f1f5f9] focus:border-[#8b5cf6] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Actions */}
                  <div className="p-3 border-t border-[#3d5166] flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => { setIsEditing(false); if (selectedSkill) setFormData(selectedSkill); }}
                      className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-sm text-xs text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Save size={12} />
                      保存
                    </button>
                  </div>
                </>
              ) : (
                // View Mode - Configuration Details
                <div className="flex-1 overflow-auto">
                  {/* Status Badge */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-[#8b5cf6] font-mono">{selectedSkill?.skill_id}</code>
                      <div className="flex items-center gap-2">
                        {selectedSkill?.deprecated && (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] flex items-center gap-1">
                            <AlertTriangle size={10} />
                            已弃用
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] flex items-center gap-1 ${
                          selectedSkill?.status === 'active'
                            ? 'bg-[#10b981]/20 text-[#10b981]'
                            : 'bg-[#64748b]/20 text-[#64748b]'
                        }`}>
                          {selectedSkill?.status === 'active' ? <Play size={10} /> : <Pause size={10} />}
                          {selectedSkill?.status === 'active' ? '运行中' : '已停止'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#f1f5f9] mt-2">{selectedSkill?.name}</h3>
                    <p className="text-xs text-[#94a3b8] mt-1">{selectedSkill?.description}</p>
                    {selectedSkill?.deprecated_reason && (
                      <p className="text-[10px] text-[#f59e0b] mt-1">{selectedSkill.deprecated_reason}</p>
                    )}
                  </div>

                  {/* Dependencies */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">依赖项</div>
                    {selectedSkill?.dependencies.length ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedSkill.dependencies.map((dep, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#1e293b] text-[#94a3b8] text-[10px] rounded font-mono">
                            {dep}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#64748b]">无依赖</span>
                    )}
                  </div>

                  {/* Examples */}
                  {selectedSkill?.examples && selectedSkill.examples.length > 0 && (
                    <div className="p-3 border-b border-[#3d5166]">
                      <div className="text-[10px] text-[#94a3b8] uppercase mb-2">示例</div>
                      <div className="space-y-2">
                        {selectedSkill.examples.map((example, idx) => (
                          <div key={idx} className="bg-[#1e293b] rounded-sm p-2">
                            <div className="text-xs text-[#f1f5f9] font-medium">{example.name}</div>
                            {example.description && (
                              <p className="text-[10px] text-[#64748b] mt-0.5">{example.description}</p>
                            )}
                            <div className="mt-1 space-y-1">
                              <div className="text-[10px]">
                                <span className="text-[#64748b]">Input:</span>
                                <code className="ml-1 text-[#8b5cf6] font-mono">{JSON.stringify(example.input).slice(0, 60)}...</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Triggers */}
                  <div className="p-3 border-b border-[#3d5166]">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">触发条件</div>
                    <p className="text-xs text-[#cbd5e1]">{selectedSkill?.triggers.description}</p>
                    {(selectedSkill?.triggers.keywords?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedSkill!.triggers.keywords.map((kw, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-[10px] rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gotchas */}
                  {selectedSkill?.gotchas && selectedSkill.gotchas.length > 0 && (
                    <div className="p-3 border-b border-[#3d5166]">
                      <div className="text-[10px] text-[#94a3b8] uppercase mb-2">注意事项</div>
                      <div className="space-y-2">
                        {selectedSkill.gotchas.map((gotcha) => (
                          <div key={gotcha.id} className="bg-[#1e293b] rounded-sm p-2 border-l-2 border-[#f59e0b]">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={10} className="text-[#f59e0b]" />
                              <span className="text-xs text-[#f1f5f9]">{gotcha.title}</span>
                              <span className={`text-[9px] px-1 rounded ${
                                gotcha.severity === 'critical' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                                gotcha.severity === 'high' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                                gotcha.severity === 'medium' ? 'bg-[#3b82f6]/20 text-[#3b82f6]' :
                                'bg-[#64748b]/20 text-[#64748b]'
                              }`}>{gotcha.severity}</span>
                            </div>
                            <p className="text-[10px] text-[#94a3b8] mt-1">{gotcha.description}</p>
                            <p className="text-[10px] text-[#10b981] mt-0.5">解决: {gotcha.solution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Installation */}
                  <div className="p-3">
                    <div className="text-[10px] text-[#94a3b8] uppercase mb-2">安装信息</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">状态</span>
                        <span className={selectedSkill?.installation.installed ? 'text-[#10b981]' : 'text-[#64748b]'}>
                          {selectedSkill?.installation.installed ? '已安装' : '未安装'}
                        </span>
                      </div>
                      {selectedSkill?.installation.installed_version && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#94a3b8]">安装版本</span>
                          <span className="text-[#f1f5f9] font-mono">{selectedSkill.installation.installed_version}</span>
                        </div>
                      )}
                      {selectedSkill?.installation.path && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#94a3b8]">路径</span>
                          <span className="text-[#f1f5f9] font-mono text-[10px]">{selectedSkill.installation.path}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">更新于</span>
                        <span className="text-[#f1f5f9] text-[10px]">{selectedSkill?.updated_at && new Date(selectedSkill.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
              <Sparkles size={32} className="mb-3 opacity-30" />
              <p className="text-xs">选择一个技能查看详情</p>
              <p className="text-[10px] mt-1">或创建新技能</p>
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
                placeholder="搜索技能..."
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
              {filteredSkills.slice(0, 8).map((skill) => (
                <button
                  key={skill.skill_id}
                  onClick={() => { handleSelectSkill(skill); setShowCommandPalette(false); setSearchTerm(''); }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[#334155] transition-colors text-left"
                >
                  <Sparkles size={14} className="text-[#8b5cf6]" />
                  <div className="flex-1">
                    <div className="text-sm text-[#f1f5f9]">{skill.name}</div>
                    <div className="text-[10px] text-[#94a3b8] font-mono">{skill.skill_id}</div>
                  </div>
                  <span className="text-[10px] text-[#64748b]">{categoryLabels[skill.category]}</span>
                </button>
              ))}
              {filteredSkills.length === 0 && (
                <div className="px-3 py-4 text-center text-[#64748b] text-xs">
                  未找到匹配的技能
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
