import React, { useState, useMemo } from 'react';
import {
  Bot, Plus, Search, Play, Edit2, Trash2, MoreVertical,
  ChevronRight, Settings, Brain, Cpu, Layers, Target,
  Database, GitBranch, FileCode, Command, Pause, CheckCircle,
  Clock, Activity, Zap, Filter, Save, X, ArrowRight, Shield, AlertTriangle,
  BarChart3, Sparkles, Feather, HardDrive
} from 'lucide-react';
import {
  constraintLibrary,
  categoryColors as constraintCategoryColors,
  categoryLabels as constraintCategoryLabels
} from '../../shared/constraintLibrary';

// 本体域和实体数据
const ontologyDomains = [
  { id: 'dom-org', name: 'Organization', displayName: '组织资源域', icon: 'building', description: '企业组织架构、人员、班组、技能' },
  { id: 'dom-cap', name: 'Capacity', displayName: '产能设备域', icon: 'cpu', description: '产线、工位、设备、模具' },
  { id: 'dom-prod', name: 'Product', displayName: '产品工艺域', icon: 'battery', description: '产品型号、BOM、工艺路线、工序' },
  { id: 'dom-supply', name: 'SupplyChain', displayName: '供应链域', icon: 'truck', description: '供应商、物料、仓库、库位、库存' },
  { id: 'dom-mfg', name: 'Manufacturing', displayName: '生产执行域', icon: 'activity', description: '生产计划、工单、在制品' },
  { id: 'dom-quality', name: 'Quality', displayName: '质量管理域', icon: 'shield', description: '质量标准、检验记录、缺陷' },
  { id: 'dom-sales', name: 'Sales', displayName: '销售客户域', icon: 'file-code', description: '客户、销售订单、发货' },
  { id: 'dom-project', name: 'Project', displayName: '项目管理域', icon: 'git-branch', description: '研发项目、试产、技改' },
  { id: 'dom-cost', name: 'Cost', displayName: '成本财务域', icon: 'database', description: '成本中心、成本核算' },
];

const ontologyEntities = [
  // 组织资源域
  { id: 'company', name: '集团公司', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'base_cz', name: '常州基地', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'base_xm', name: '厦门基地', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'base_lz', name: '柳州基地', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'base_yc', name: '盐城基地', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'factory_a', name: '极片工厂', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'factory_b', name: '电芯工厂', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'factory_c', name: '模组PACK工厂', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'workshop_front', name: '前段车间', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'workshop_middle', name: '中段车间', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'workshop_back', name: '后段车间', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'employee', name: '员工', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'work_team', name: '生产班组', domain: 'dom-org', domainName: '组织资源域' },
  { id: 'shift', name: '班次', domain: 'dom-org', domainName: '组织资源域' },
  // 产能设备域
  { id: 'production_line', name: '生产线', domain: 'dom-cap', domainName: '产能设备域' },
  { id: 'workstation', name: '工位', domain: 'dom-cap', domainName: '产能设备域' },
  { id: 'equipment', name: '关键设备', domain: 'dom-cap', domainName: '产能设备域' },
  { id: 'mold', name: '模具', domain: 'dom-cap', domainName: '产能设备域' },
  // 产品工艺域
  { id: 'product_family', name: '产品系列', domain: 'dom-prod', domainName: '产品工艺域' },
  { id: 'product_model_lfp', name: 'LFP-280Ah', domain: 'dom-prod', domainName: '产品工艺域' },
  { id: 'product_model_ncm', name: 'NCM-150Ah', domain: 'dom-prod', domainName: '产品工艺域' },
  { id: 'process_route', name: '工艺路线', domain: 'dom-prod', domainName: '产品工艺域' },
  { id: 'process_step', name: '工序', domain: 'dom-prod', domainName: '产品工艺域' },
  { id: 'bom', name: '物料清单', domain: 'dom-prod', domainName: '产品工艺域' },
  // 供应链域
  { id: 'supplier', name: '供应商', domain: 'dom-supply', domainName: '供应链域' },
  { id: 'material_category', name: '物料分类', domain: 'dom-supply', domainName: '供应链域' },
  { id: 'material', name: '物料', domain: 'dom-supply', domainName: '供应链域' },
  { id: 'warehouse', name: '仓库', domain: 'dom-supply', domainName: '供应链域' },
  { id: 'location', name: '库位', domain: 'dom-supply', domainName: '供应链域' },
  { id: 'inventory', name: '库存', domain: 'dom-supply', domainName: '供应链域' },
  { id: 'purchase_order', name: '采购订单', domain: 'dom-supply', domainName: '供应链域' },
  // 生产执行域
  { id: 'production_plan', name: '生产计划', domain: 'dom-mfg', domainName: '生产执行域' },
  { id: 'work_order', name: '生产工单', domain: 'dom-mfg', domainName: '生产执行域' },
  { id: 'wip', name: '在制品', domain: 'dom-mfg', domainName: '生产执行域' },
  { id: 'production_record', name: '生产记录', domain: 'dom-mfg', domainName: '生产执行域' },
  { id: 'capacity_requirement', name: '产能需求', domain: 'dom-mfg', domainName: '生产执行域' },
  // 质量管理域
  { id: 'quality_standard', name: '质量标准', domain: 'dom-quality', domainName: '质量管理域' },
  { id: 'check_item', name: '检查项', domain: 'dom-quality', domainName: '质量管理域' },
  { id: 'iqc_record', name: '来料检验', domain: 'dom-quality', domainName: '质量管理域' },
  { id: 'ipqc_record', name: '过程检验', domain: 'dom-quality', domainName: '质量管理域' },
  { id: 'defect', name: '缺陷记录', domain: 'dom-quality', domainName: '质量管理域' },
  // 销售客户域
  { id: 'customer', name: '客户', domain: 'dom-sales', domainName: '销售客户域' },
  { id: 'sales_order', name: '销售订单', domain: 'dom-sales', domainName: '销售客户域' },
  { id: 'delivery', name: '发货单', domain: 'dom-sales', domainName: '销售客户域' },
  // 项目管理域
  { id: 'rd_project', name: '研发项目', domain: 'dom-project', domainName: '项目管理域' },
  { id: 'trial_production', name: '试产记录', domain: 'dom-project', domainName: '项目管理域' },
  // 成本财务域
  { id: 'cost_center', name: '成本中心', domain: 'dom-cost', domainName: '成本财务域' },
  { id: 'product_cost', name: '产品成本', domain: 'dom-cost', domainName: '成本财务域' },
];

const domainColors: Record<string, string> = {
  'dom-org': '#3b82f6',
  'dom-cap': '#10b981',
  'dom-prod': '#f59e0b',
  'dom-supply': '#8b5cf6',
  'dom-mfg': '#06b6d4',
  'dom-quality': '#ec4899',
  'dom-sales': '#14b8a6',
  'dom-project': '#f97316',
  'dom-cost': '#6366f1',
};

// 技能库数据
const skillLibrary = [
  { skill_id: 'ts_analysis_v2', name: '时序数据分析', category: 'data-analysis', description: '基于ARIMA、LSTM、Prophet等算法对时间序列数据进行趋势分析', status: 'active' },
  { skill_id: 'demand_forecast_v3', name: '需求预测', category: 'prediction', description: '综合历史订单、市场趋势、季节性因素提供多维度需求预测', status: 'active' },
  { skill_id: 'quality_detect_v1', name: '质量异常检测', category: 'detection', description: '基于计算机视觉和统计方法实时检测产品质量异常', status: 'active' },
  { skill_id: 'scheduling_opt_v2', name: '生产排程优化', category: 'optimization', description: '基于约束求解和启发式算法优化生产排程', status: 'active' },
  { skill_id: 'calculate_baseline', name: '产能基线计算', category: 'data-analysis', description: '基于历史生产记录计算产线基准产能', status: 'active' },
  { skill_id: 'forecast_capacity', name: '产能预测', category: 'prediction', description: '使用多种算法预测未来产能', status: 'active' },
  { skill_id: 'check_constraints', name: '约束检查', category: 'detection', description: '验证产能预测是否满足各种约束条件', status: 'active' },
];

const skillCategoryColors: Record<string, string> = {
  'data-analysis': '#3b82f6',
  prediction: '#8b5cf6',
  detection: '#f59e0b',
  optimization: '#10b981',
  workflow: '#06b6d4',
  nlp: '#ec4899',
};

const skillCategoryLabels: Record<string, string> = {
  'data-analysis': '数据分析',
  prediction: '预测',
  detection: '检测',
  optimization: '优化',
  workflow: '工作流',
  nlp: 'NLP',
};

// 智能体配置类型 - 符合行业标准
interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;
  created_at: string;
  updated_at: string;
  author: string;
  model: string;
  deprecated?: boolean;
  deprecated_reason?: string;

  // 运行时状态（仅活跃标记）
  active: boolean;

  // 记忆配置
  memory?: {
    type: 'short-term' | 'long-term' | 'hybrid';
    storage: 'local' | 'redis' | 'db';
    context_window: number;
    retention_policy?: string;
  };

  // 协作配置
  collaboration?: {
    can_delegate: boolean;
    parent_agent?: string;
    sub_agents?: string[];
  };

  // 安全防护
  guardrails?: {
    max_execution_time: number;
    max_token_usage: number;
    forbidden_operations: string[];
  };

  // 7步配置
  steps: {
    intent: IntentConfig;
    ontology: OntologyConfig;
    binding: BindingConfig;
    skill: SkillConfig;
    constraint: ConstraintConfig;
    simulation: SimulationConfig;
    result: ResultConfig;
  };
}

interface IntentConfig {
  system_prompt: string;
  model: string;
}

interface OntologyConfig {
  target_entities: string[];
}

interface BindingConfig {
  mappings: Array<{
    entity: string;
    datasource: string;
    query: string;
  }>;
}

interface SkillConfig {
  selected_skills: string[];
  skill_params: Record<string, any>;
}

interface ConstraintConfig {
  hard_constraints: string[];
  soft_constraints: string[];
}

interface SimulationConfig {
  strategy_count: number;
  engine: 'DES' | 'SD';
}

interface ResultConfig {
  output_schema: Record<string, any>;
}

// 示例智能体数据
const initialAgents: Agent[] = [
  {
    id: 'agent_001',
    name: '电池需求预测智能体',
    description: '基于历史订单数据、市场趋势和季节性因素，智能预测锂电池未来需求',
    status: 'active',
    version: '2.1.0',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    author: 'AI Lab',
    model: 'gemini-1.5-pro',
    active: true,
    memory: {
      type: 'hybrid',
      storage: 'redis',
      context_window: 128000,
      retention_policy: '30d',
    },
    guardrails: {
      max_execution_time: 30000,
      max_token_usage: 100000,
      forbidden_operations: ['delete', 'modify_schema'],
    },
    steps: {
      intent: {
        system_prompt: '你是一位专业的生产计划分析师...',
        model: 'gemini-1.5-pro',
      },
      ontology: {
        target_entities: ['sales_order', 'material', 'production_line'],
      },
      binding: {
        mappings: [
          { entity: 'SalesOrder', datasource: 'ERP_Sales_DB', query: 'SELECT * FROM sales_orders' },
        ],
      },
      skill: {
        selected_skills: ['ts_analysis_v2', 'demand_forecast_v3'],
        skill_params: {},
      },
      constraint: {
        hard_constraints: ['delivery_deadline', 'equipment_capacity'],
        soft_constraints: ['minimize_setup'],
      },
      simulation: {
        strategy_count: 3,
        engine: 'DES',
      },
      result: {
        output_schema: {
          best_strategy: 'string',
          confidence_score: 'number',
        },
      },
    },
  },
  {
    id: 'agent_002',
    name: '产能排程优化智能体',
    description: '综合考虑设备产能、人员排班、物料齐套等因素，生成最优生产排程方案',
    status: 'draft',
    version: '1.3.0',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-25T11:20:00Z',
    author: 'Planning Team',
    model: 'gpt-4-turbo',
    active: false,
    steps: {
      intent: { system_prompt: '...', model: 'gpt-4-turbo' },
      ontology: { target_entities: ['work_order', 'equipment', 'work_team'] },
      binding: { mappings: [] },
      skill: { selected_skills: ['scheduling_opt_v2', 'ts_analysis_v2'], skill_params: {} },
      constraint: { hard_constraints: ['delivery_deadline'], soft_constraints: ['minimize_setup'] },
      simulation: { strategy_count: 5, engine: 'DES' },
      result: { output_schema: {} },
    },
  },
  {
    id: 'agent_003',
    name: '异常检测与告警智能体',
    description: '实时监测生产数据，自动识别设备异常、质量波动等风险并触发告警',
    status: 'active',
    version: '1.8.0',
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-03-22T16:45:00Z',
    author: 'Data Team',
    model: 'claude-3-sonnet',
    active: true,
    memory: {
      type: 'short-term',
      storage: 'local',
      context_window: 200000,
    },
    collaboration: {
      can_delegate: true,
      sub_agents: ['agent_001'],
    },
    guardrails: {
      max_execution_time: 10000,
      max_token_usage: 50000,
      forbidden_operations: ['shutdown_system'],
    },
    steps: {
      intent: { system_prompt: '...', model: 'claude-3-sonnet' },
      ontology: { target_entities: ['equipment', 'defect', 'quality_standard'] },
      binding: { mappings: [] },
      skill: { selected_skills: ['quality_detect_v1'], skill_params: {} },
      constraint: { hard_constraints: ['quality_inspection'], soft_constraints: [] },
      simulation: { strategy_count: 0, engine: 'SD' },
      result: { output_schema: {} },
    },
  },
  {
    id: 'agent_004',
    name: '质检报告生成智能体 - 旧版',
    description: '自动生成质检报告，分析质检数据趋势，识别质量风险',
    status: 'inactive',
    version: '1.2.0',
    deprecated: true,
    deprecated_reason: '已迁移到 agent_quality_v2，新版本支持更多报告模板',
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-03-15T09:30:00Z',
    author: 'Quality Team',
    model: 'gpt-4o',
    active: false,
    steps: {
      intent: { system_prompt: '...', model: 'gpt-4o' },
      ontology: { target_entities: ['quality_standard', 'check_item', 'iqc_record'] },
      binding: { mappings: [] },
      skill: { selected_skills: ['nlp_query_v1'], skill_params: {} },
      constraint: { hard_constraints: [], soft_constraints: [] },
      simulation: { strategy_count: 0, engine: 'SD' },
      result: { output_schema: {} },
    },
  },
  {
    id: 'agent_capacity_forecast',
    name: '产线产能预测智能体',
    description: '基于历史生产记录、设备状态和订单需求，智能预测产线未来产能，支持多种预测算法和约束检查',
    status: 'active',
    version: '1.0.0',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
    author: 'Capacity Team',
    model: 'claude-3-sonnet',
    active: true,
    memory: {
      type: 'hybrid',
      storage: 'local',
      context_window: 64000,
      retention_policy: '90d',
    },
    guardrails: {
      max_execution_time: 120000,
      max_token_usage: 50000,
      forbidden_operations: ['delete_production_data', 'modify_baseline'],
    },
    steps: {
      intent: {
        system_prompt: '你是一位专业的产能规划分析师，擅长基于历史生产数据预测未来产能。你的任务是分析产线的历史表现，考虑设备状态、订单需求等因素，生成准确的产能预测报告。',
        model: 'claude-3-sonnet',
      },
      ontology: {
        target_entities: ['production_line', 'equipment', 'production_record', 'sales_order', 'work_order', 'capacity_requirement'],
      },
      binding: {
        mappings: [
          { entity: 'ProductionLine', datasource: 'local_storage', query: 'entityStore.findByType("ProductionLine")' },
          { entity: 'ProductionRecord', datasource: 'local_storage', query: 'entityStore.findByType("ProductionRecord")' },
          { entity: 'Equipment', datasource: 'local_storage', query: 'entityStore.findByType("Equipment")' },
          { entity: 'Order', datasource: 'local_storage', query: 'entityStore.findByType("Order")' },
        ],
      },
      skill: {
        selected_skills: ['calculate_baseline', 'forecast_capacity', 'check_constraints'],
        skill_params: {
          forecast_algorithms: ['sma', 'ema', 'linear', 'prophet', 'weighted'],
          default_algorithm: 'weighted',
          confidence_level: 0.95,
          history_days: 30,
        },
      },
      constraint: {
        hard_constraints: ['max_capacity_limit', 'oee_target'],
        soft_constraints: ['order_fulfillment', 'capacity_variance'],
      },
      simulation: {
        strategy_count: 3,
        engine: 'DES',
      },
      result: {
        output_schema: {
          baseline_capacity: 'number',
          predicted_capacity: 'number',
          confidence_interval: 'object',
          trend_direction: 'string',
          risk_level: 'string',
          recommendations: 'array',
        },
      },
    },
  },
];

// 7步配置步骤
const configSteps = [
  { id: 'intent', label: '意图解析', icon: Brain },
  { id: 'ontology', label: '本体解析', icon: Layers },
  { id: 'binding', label: '数据绑定', icon: Database },
  { id: 'skill', label: '技能选择', icon: Cpu },
  { id: 'constraint', label: '约束注入', icon: Target },
  { id: 'simulation', label: '仿真推演', icon: GitBranch },
  { id: 'result', label: '结果结构化', icon: FileCode },
];

const emptyAgent: Agent = {
  id: '',
  name: '',
  description: '',
  status: 'draft',
  version: '1.0.0',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: 'Current User',
  model: 'gemini-1.5-pro',
  active: false,
  memory: {
    type: 'short-term',
    storage: 'local',
    context_window: 32000,
  },
  guardrails: {
    max_execution_time: 60000,
    max_token_usage: 100000,
    forbidden_operations: [],
  },
  steps: {
    intent: { system_prompt: '', model: 'gemini-1.5-pro' },
    ontology: { target_entities: [] },
    binding: { mappings: [] },
    skill: { selected_skills: [], skill_params: {} },
    constraint: { hard_constraints: [], soft_constraints: [] },
    simulation: { strategy_count: 0, engine: 'DES' },
    result: { output_schema: {} },
  },
};

export default function AgentConfiguration() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Agent>(emptyAgent);
  const [currentStep, setCurrentStep] = useState(0);

  // Filter agents by status and search
  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [agents, selectedStatus, searchTerm]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
      draft: agents.filter(a => a.status === 'draft').length,
    };
  }, [agents]);

  // Stats - 仅配置信息
  const stats = useMemo(() => {
    const active = agents.filter(a => a.active).length;
    const withMemory = agents.filter(a => a.memory).length;
    const withGuardrails = agents.filter(a => a.guardrails).length;
    const deprecated = agents.filter(a => a.deprecated).length;
    return { active, withMemory, withGuardrails, deprecated };
  }, [agents]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({ ...agent });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newAgent: Agent = {
      ...emptyAgent,
      id: `agent_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFormData(newAgent);
    setSelectedAgent(null);
    setIsEditing(true);
    setCurrentStep(0);
  };

  const handleSave = () => {
    if (selectedAgent) {
      setAgents(agents.map(a => a.id === selectedAgent.id
        ? { ...formData, updated_at: new Date().toISOString() }
        : a
      ));
      setSelectedAgent({ ...formData, updated_at: new Date().toISOString() });
    } else {
      const newAgent = { ...formData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setAgents([...agents, newAgent]);
      setSelectedAgent(newAgent);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setAgents(agents.filter(a => a.id !== id));
    if (selectedAgent?.id === id) {
      setSelectedAgent(null);
    }
  };

  const handleToggleStatus = (agent: Agent) => {
    const newStatus: 'active' | 'inactive' = agent.status === 'active' ? 'inactive' : 'active';
    const updated: Agent = { ...agent, status: newStatus, active: newStatus === 'active' };
    setAgents(agents.map(a => a.id === agent.id ? updated : a));
    if (selectedAgent?.id === agent.id) {
      setSelectedAgent(updated);
      setFormData(updated);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[#10b981]';
      case 'draft': return 'text-[#f59e0b]';
      case 'inactive': return 'text-[#64748b]';
      default: return 'text-[#64748b]';
    }
  };

  // Get success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.98) return 'text-[#10b981]';
    if (rate >= 0.90) return 'text-[#3b82f6]';
    return 'text-[#f59e0b]';
  };

  // Get latency color
  const getLatencyColor = (latency: number) => {
    if (latency === 0) return 'text-[#64748b]';
    if (latency < 1000) return 'text-[#10b981]';
    if (latency < 3000) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  return (
    <div className="h-full flex flex-col text-sm">
      {/* Header Toolbar - Palantir Style */}
      <div className="h-9 px-3 border-b border-[#e2e8f0] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Command size={12} className="text-[#64748b]" />
            <span className="text-[10px] text-[#64748b]">智能体配置</span>
          </div>
          <div className="h-4 w-px bg-[#475569]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-2 px-2 py-1 bg-[#f8fafc] rounded-sm border border-[#e2e8f0] hover:border-[#5a6f85] transition-colors"
            >
              <Search size={12} className="text-[#64748b]" />
              <span className="text-xs text-[#64748b]">搜索智能体...</span>
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
            新建智能体
          </button>
        </div>
      </div>

      {/* Stats Bar - Configuration Metrics */}
      <div className="h-8 px-3 border-b border-[#e2e8f0] flex items-center gap-6 bg-[#f8fafc] text-[10px] text-[#64748b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#1e293b] font-mono text-xs">{agents.length}</span>
          <span>智能体总数</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[#1e293b] font-mono text-xs">{stats.active}</span>
          <span>运行中</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain size={10} className="text-[#8b5cf6]" />
          <span className="text-[#1e293b] font-mono text-xs">{stats.withMemory}</span>
          <span>配置记忆</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={10} className="text-[#10b981]" />
          <span className="text-[#1e293b] font-mono text-xs">{stats.withGuardrails}</span>
          <span>配置防护</span>
        </div>
        {stats.deprecated > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle size={10} className="text-[#f59e0b]" />
            <span className="text-[#1e293b] font-mono text-xs">{stats.deprecated}</span>
            <span className="text-[#f59e0b]">已弃用</span>
          </div>
        )}
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Status Navigation */}
        <div className="w-44 bg-white border-r border-[#e2e8f0] flex flex-col shrink-0">
          <div className="h-7 px-3 border-b border-[#e2e8f0] flex items-center bg-white">
            <Filter size={10} className="text-[#64748b] mr-2" />
            <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">状态</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-l-2 border-[#3b82f6]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <span>全部智能体</span>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{statusCounts.all}</span>
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedStatus === 'active'
                  ? 'bg-[#10b981]/20 text-[#10b981] border-l-2 border-[#10b981]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play size={12} />
                <span>运行中</span>
              </div>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{statusCounts.active}</span>
            </button>
            <button
              onClick={() => setSelectedStatus('inactive')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedStatus === 'inactive'
                  ? 'bg-[#64748b]/20 text-[#64748b] border-l-2 border-[#64748b]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Pause size={12} />
                <span>已停止</span>
              </div>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{statusCounts.inactive}</span>
            </button>
            <button
              onClick={() => setSelectedStatus('draft')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                selectedStatus === 'draft'
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-l-2 border-[#f59e0b]'
                  : 'text-[#475569] hover:bg-[#f1f5f9] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Edit2 size={12} />
                <span>草稿</span>
              </div>
              <span className="font-mono text-[10px] bg-[#f8fafc] px-1.5 py-0.5 rounded">{statusCounts.draft}</span>
            </button>
          </div>
        </div>

        {/* Center Panel - Agent List */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] min-w-0">
          {/* List Header */}
          <div className="h-8 px-3 border-b border-[#e2e8f0] flex items-center bg-white text-[10px] text-[#64748b] shrink-0">
            <div className="flex-1">智能体ID / 名称</div>
            <div className="w-16 text-center">状态</div>
            <div className="w-20 text-right">上下文</div>
            <div className="w-20 text-center">防护</div>
            <div className="w-20 text-center">协作</div>
            <div className="w-28 text-center">配置进度</div>
            <div className="w-8" />
          </div>

          {/* Agent List */}
          <div className="flex-1 overflow-auto">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleSelectAgent(agent)}
                className={`px-3 py-2 border-b border-[#e2e8f0] flex items-center cursor-pointer transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-[#3b82f6]/10 border-l-2 border-l-[#3b82f6]'
                    : 'hover:bg-white border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-[#3b82f6] font-mono">{agent.id}</code>
                    <span className="text-xs text-[#1e293b] truncate">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#64748b]">{agent.model}</span>
                    <span className="text-[10px] text-[#64748b]">v{agent.version}</span>
                  </div>
                </div>
                <div className="w-16 flex justify-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                    agent.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' :
                    agent.status === 'draft' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    'bg-[#64748b]/20 text-[#64748b]'
                  }`}>
                    {agent.status === 'active' ? '运行' : agent.status === 'draft' ? '草稿' : '停止'}
                  </span>
                </div>
                <div className="w-20 text-right font-mono text-xs text-[#64748b]">
                  {agent.memory ? `${(agent.memory.context_window / 1000).toFixed(0)}k` : '-'}
                </div>
                <div className="w-20 text-center">
                  {agent.guardrails ? (
                    <Shield size={12} className="text-[#10b981] mx-auto" />
                  ) : (
                    <span className="text-[10px] text-[#64748b]">-</span>
                  )}
                </div>
                <div className="w-20 text-center">
                  {agent.collaboration?.can_delegate ? (
                    <span className="text-[10px] text-[#3b82f6]">可委派</span>
                  ) : (
                    <span className="text-[10px] text-[#64748b]">-</span>
                  )}
                </div>
                <div className="w-28 flex items-center justify-center gap-0.5">
                  {configSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isConfigured = idx < 6; // Mock progress
                    return (
                      <div
                        key={step.id}
                        className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                          isConfigured ? 'bg-[#10b981]/20' : 'bg-white'
                        }`}
                        title={step.label}
                      >
                        <StepIcon size={8} className={isConfigured ? 'text-[#10b981]' : 'text-[#64748b]'} />
                      </div>
                    );
                  })}
                </div>
                <div className="w-8 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(agent); }}
                    className={`p-1 rounded-sm transition-colors ${
                      agent.status === 'active'
                        ? 'text-[#10b981] hover:bg-[#10b981]/20'
                        : 'text-[#64748b] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    {agent.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Properties/Editor */}
        <div className="w-96 bg-white border-l border-[#e2e8f0] flex flex-col shrink-0">
          {selectedAgent || isEditing ? (
            <>
              {/* Panel Header */}
              <div className="h-10 px-3 border-b border-[#e2e8f0] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-[#3b82f6]" />
                  <span className="text-xs font-medium text-[#1e293b]">
                    {isEditing ? (selectedAgent ? '编辑智能体' : '新建智能体') : '智能体详情'}
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
                  <button
                    onClick={() => selectedAgent && handleDelete(selectedAgent.id)}
                    className="p-1.5 hover:bg-[#ef4444]/20 rounded-sm"
                  >
                    <Trash2 size={14} className="text-[#ef4444]" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                // Edit Mode - 7 Step Wizard in Panel
                <>
                  {/* Compact Stepper */}
                  <div className="px-3 py-2 border-b border-[#e2e8f0] bg-white shrink-0">
                    <div className="flex items-center justify-between">
                      {configSteps.map((step, idx) => {
                        const StepIcon = step.icon;
                        return (
                          <button
                            key={step.id}
                            onClick={() => setCurrentStep(idx)}
                            className={`w-7 h-7 rounded-sm flex items-center justify-center transition-colors ${
                              idx === currentStep
                                ? 'bg-[#3b82f6] text-white'
                                : idx < currentStep
                                ? 'bg-[#10b981]/20 text-[#10b981]'
                                : 'bg-[#f8fafc] text-[#64748b]'
                            }`}
                            title={step.label}
                          >
                            <StepIcon size={12} />
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-center mt-1 text-[10px] text-[#64748b]">
                      {configSteps[currentStep].label}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 overflow-auto p-3">
                    {currentStep === 0 && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">智能体ID</label>
                          <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            disabled={!!selectedAgent}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none disabled:opacity-50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">名称</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">描述</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">系统提示词</label>
                          <textarea
                            value={formData.steps.intent.system_prompt}
                            onChange={(e) => setFormData({
                              ...formData,
                              steps: { ...formData.steps, intent: { ...formData.steps.intent, system_prompt: e.target.value } }
                            })}
                            rows={6}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none resize-none"
                            placeholder="定义智能体的角色和行为..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748b] uppercase block mb-1">模型</label>
                          <select
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#1e293b] focus:border-[#3b82f6] outline-none"
                          >
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                            <option value="gpt-4o">GPT-4o</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-3">
                        <div className="text-xs text-[#64748b]">从本体库选择目标实体</div>
                        <div className="space-y-2 max-h-80 overflow-auto">
                          {ontologyDomains.map(domain => (
                            <div key={domain.id} className="bg-[#f8fafc] rounded-sm overflow-hidden">
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                                style={{ backgroundColor: `${domainColors[domain.id]}20` }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: domainColors[domain.id] }}
                                />
                                <span className="text-xs font-medium text-[#1e293b]">{domain.displayName}</span>
                                <span className="text-[10px] text-[#64748b]">
                                  ({ontologyEntities.filter(e => e.domain === domain.id).length} 实体)
                                </span>
                              </div>
                              <div className="p-2 space-y-1">
                                {ontologyEntities
                                  .filter(entity => entity.domain === domain.id)
                                  .map(entity => {
                                    const isSelected = formData.steps.ontology.target_entities.includes(entity.id);
                                    return (
                                      <label
                                        key={entity.id}
                                        className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/50'
                                            : 'bg-white hover:bg-[#f1f5f9]'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const entities = e.target.checked
                                              ? [...formData.steps.ontology.target_entities, entity.id]
                                              : formData.steps.ontology.target_entities.filter(id => id !== entity.id);
                                            setFormData({
                                              ...formData,
                                              steps: {
                                                ...formData.steps,
                                                ontology: { ...formData.steps.ontology, target_entities: entities }
                                              }
                                            });
                                          }}
                                          className="rounded"
                                        />
                                        <span className="text-xs text-[#1e293b]">{entity.name}</span>
                                        <code className="text-[9px] text-[#64748b] font-mono ml-auto">{entity.id}</code>
                                      </label>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                        </div>
                        {formData.steps.ontology.target_entities.length > 0 && (
                          <div className="pt-2 border-t border-[#cbd5e1]">
                            <div className="text-[10px] text-[#64748b] mb-1">
                              已选择 {formData.steps.ontology.target_entities.length} 个实体
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {formData.steps.ontology.target_entities.map(entityId => {
                                const entity = ontologyEntities.find(e => e.id === entityId);
                                return entity ? (
                                  <span
                                    key={entityId}
                                    className="text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1"
                                    style={{
                                      backgroundColor: `${domainColors[entity.domain]}30`,
                                      color: domainColors[entity.domain]
                                    }}
                                  >
                                    {entity.name}
                                    <button
                                      onClick={() => {
                                        const entities = formData.steps.ontology.target_entities.filter(id => id !== entityId);
                                        setFormData({
                                          ...formData,
                                          steps: {
                                            ...formData.steps,
                                            ontology: { ...formData.steps.ontology, target_entities: entities }
                                          }
                                        });
                                      }}
                                      className="hover:text-white"
                                    >
                                      <X size={10} />
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-3">
                        <div className="text-xs text-[#64748b]">数据绑定配置</div>
                        <div className="bg-[#f8fafc] rounded-sm p-3">
                          <div className="text-[10px] text-[#64748b] mb-2">实体 → 数据源映射</div>
                          {formData.steps.binding.mappings.map((mapping, idx) => (
                            <div key={idx} className="text-xs text-[#1e293b] font-mono mb-1">
                              {mapping.entity}: {mapping.datasource}
                            </div>
                          ))}
                          {formData.steps.binding.mappings.length === 0 && (
                            <div className="text-xs text-[#64748b]">暂无绑定配置</div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-3">
                        <div className="text-xs text-[#64748b]">从技能库选择技能</div>
                        <div className="space-y-1 max-h-64 overflow-auto">
                          {skillLibrary.map(skill => {
                            const isSelected = formData.steps.skill.selected_skills.includes(skill.skill_id);
                            return (
                              <label
                                key={skill.skill_id}
                                className={`flex items-start gap-2 p-2 rounded-sm cursor-pointer transition-colors ${
                                  isSelected ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/50' : 'bg-[#f8fafc] hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const selected = e.target.checked
                                      ? [...formData.steps.skill.selected_skills, skill.skill_id]
                                      : formData.steps.skill.selected_skills.filter(s => s !== skill.skill_id);
                                    setFormData({
                                      ...formData,
                                      steps: { ...formData.steps, skill: { ...formData.steps.skill, selected_skills: selected } }
                                    });
                                  }}
                                  className="mt-0.5 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#1e293b] font-medium">{skill.name}</span>
                                    <span
                                      className="text-[9px] px-1.5 py-0.5 rounded-sm"
                                      style={{ backgroundColor: `${skillCategoryColors[skill.category]}30`, color: skillCategoryColors[skill.category] }}
                                    >
                                      {skillCategoryLabels[skill.category]}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#64748b] mt-0.5">{skill.description}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {formData.steps.skill.selected_skills.length > 0 && (
                          <div className="pt-2 border-t border-[#cbd5e1]">
                            <div className="text-[10px] text-[#64748b] mb-1">已选择 {formData.steps.skill.selected_skills.length} 个技能</div>
                            <div className="flex flex-wrap gap-1">
                              {formData.steps.skill.selected_skills.map(skillId => {
                                const skill = skillLibrary.find(s => s.skill_id === skillId);
                                return skill ? (
                                  <span key={skillId} className="text-[10px] px-2 py-0.5 bg-[#3b82f6]/30 text-[#3b82f6] rounded-sm flex items-center gap-1">
                                    {skill.name}
                                    <button
                                      onClick={() => {
                                        const selected = formData.steps.skill.selected_skills.filter(s => s !== skillId);
                                        setFormData({
                                          ...formData,
                                          steps: { ...formData.steps, skill: { ...formData.steps.skill, selected_skills: selected } }
                                        });
                                      }}
                                      className="hover:text-white"
                                    >
                                      <X size={10} />
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-3">
                        <div className="text-xs text-[#64748b]">从约束库选择约束规则</div>
                        <div className="space-y-2">
                          <div className="text-[10px] text-[#64748b] uppercase">硬约束</div>
                          <div className="space-y-1 max-h-32 overflow-auto">
                            {constraintLibrary.filter(c => c.type === 'hard').map(constraint => {
                              const isSelected = formData.steps.constraint.hard_constraints.includes(constraint.constraint_id);
                              return (
                                <label
                                  key={constraint.constraint_id}
                                  className={`flex items-start gap-2 p-2 rounded-sm cursor-pointer transition-colors ${
                                    isSelected ? 'bg-[#ef4444]/20 border border-[#ef4444]/50' : 'bg-[#f8fafc] hover:bg-white'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const selected = e.target.checked
                                        ? [...formData.steps.constraint.hard_constraints, constraint.constraint_id]
                                        : formData.steps.constraint.hard_constraints.filter(c => c !== constraint.constraint_id);
                                      setFormData({
                                        ...formData,
                                        steps: { ...formData.steps, constraint: { ...formData.steps.constraint, hard_constraints: selected } }
                                      });
                                    }}
                                    className="mt-0.5 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-[#1e293b] font-medium">{constraint.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#ef4444]/30 text-[#ef4444]">硬约束</span>
                                      <span
                                        className="text-[9px] px-1.5 py-0.5 rounded-sm"
                                        style={{ backgroundColor: `${constraintCategoryColors[constraint.category]}30`, color: constraintCategoryColors[constraint.category] }}
                                      >
                                        {constraintCategoryLabels[constraint.category]}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-[#64748b] mt-0.5">{constraint.description}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-[#cbd5e1]">
                          <div className="text-[10px] text-[#64748b] uppercase">软约束</div>
                          <div className="space-y-1 max-h-32 overflow-auto">
                            {constraintLibrary.filter(c => c.type === 'soft').map(constraint => {
                              const isSelected = formData.steps.constraint.soft_constraints.includes(constraint.constraint_id);
                              return (
                                <label
                                  key={constraint.constraint_id}
                                  className={`flex items-start gap-2 p-2 rounded-sm cursor-pointer transition-colors ${
                                    isSelected ? 'bg-[#f59e0b]/20 border border-[#f59e0b]/50' : 'bg-[#f8fafc] hover:bg-white'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const selected = e.target.checked
                                        ? [...formData.steps.constraint.soft_constraints, constraint.constraint_id]
                                        : formData.steps.constraint.soft_constraints.filter(c => c !== constraint.constraint_id);
                                      setFormData({
                                        ...formData,
                                        steps: { ...formData.steps, constraint: { ...formData.steps.constraint, soft_constraints: selected } }
                                      });
                                    }}
                                    className="mt-0.5 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-[#1e293b] font-medium">{constraint.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#f59e0b]/30 text-[#f59e0b]">软约束</span>
                                      <span
                                        className="text-[9px] px-1.5 py-0.5 rounded-sm"
                                        style={{ backgroundColor: `${constraintCategoryColors[constraint.category]}30`, color: constraintCategoryColors[constraint.category] }}
                                      >
                                        {constraintCategoryLabels[constraint.category]}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-[#64748b] mt-0.5">{constraint.description}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        {(formData.steps.constraint.hard_constraints.length > 0 || formData.steps.constraint.soft_constraints.length > 0) && (
                          <div className="pt-2 border-t border-[#cbd5e1]">
                            <div className="text-[10px] text-[#64748b] mb-1">
                              已选择 {formData.steps.constraint.hard_constraints.length} 个硬约束, {formData.steps.constraint.soft_constraints.length} 个软约束
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep >= 5 && currentStep <= 6 && (
                      <div className="flex flex-col items-center justify-center h-32 text-[#64748b]">
                        <Settings size={24} className="mb-2 opacity-50" />
                        <span className="text-xs">{configSteps[currentStep].label}配置</span>
                        <span className="text-[10px] mt-1">在此面板中配置详细参数</span>
                      </div>
                    )}
                  </div>

                  {/* Edit Actions */}
                  <div className="p-3 border-t border-[#e2e8f0] flex items-center justify-between shrink-0">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#1e293b] transition-colors disabled:opacity-50"
                    >
                      上一步
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setIsEditing(false); if (selectedAgent) setFormData(selectedAgent); }}
                        className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#1e293b] transition-colors"
                      >
                        取消
                      </button>
                      {currentStep < configSteps.length - 1 ? (
                        <button
                          onClick={() => setCurrentStep(currentStep + 1)}
                          className="px-3 py-1.5 bg-white hover:bg-[#f1f5f9] rounded-sm text-xs text-white flex items-center gap-1 transition-colors"
                        >
                          下一步
                          <ArrowRight size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] rounded-sm text-xs text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Save size={12} />
                          保存
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // View Mode - Runtime Metrics
                <div className="flex-1 overflow-auto">
                  {/* Status Badge */}
                  <div className="p-3 border-b border-[#e2e8f0]">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-[#3b82f6] font-mono">{selectedAgent?.id}</code>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] flex items-center gap-1 ${
                        selectedAgent?.status === 'active'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : selectedAgent?.status === 'draft'
                          ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                          : 'bg-[#64748b]/20 text-[#64748b]'
                      }`}>
                        {selectedAgent?.status === 'active' ? <Play size={10} /> : selectedAgent?.status === 'draft' ? <Edit2 size={10} /> : <Pause size={10} />}
                        {selectedAgent?.status === 'active' ? '运行中' : selectedAgent?.status === 'draft' ? '草稿' : '已停止'}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#1e293b] mt-2">{selectedAgent?.name}</h3>
                    <p className="text-xs text-[#64748b] mt-1">{selectedAgent?.description}</p>
                  </div>

                  {/* Memory Configuration */}
                  {selectedAgent?.memory && (
                    <div className="p-3 border-b border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] uppercase mb-2">记忆配置</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">类型</span>
                          <span className="text-[#1e293b] font-mono">{selectedAgent.memory.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">存储</span>
                          <span className="text-[#1e293b] font-mono">{selectedAgent.memory.storage}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">上下文窗口</span>
                          <span className="text-[#1e293b] font-mono">{(selectedAgent.memory.context_window / 1000).toFixed(0)}k tokens</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guardrails */}
                  {selectedAgent?.guardrails && (
                    <div className="p-3 border-b border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] uppercase mb-2">安全防护</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">最大执行时间</span>
                          <span className="text-[#1e293b] font-mono">{selectedAgent.guardrails.max_execution_time / 1000}s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">最大Token</span>
                          <span className="text-[#1e293b] font-mono">{(selectedAgent.guardrails.max_token_usage / 1000).toFixed(0)}k</span>
                        </div>
                        {selectedAgent.guardrails.forbidden_operations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedAgent.guardrails.forbidden_operations.map((op, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-[#ef4444]/20 text-[#ef4444] text-[9px] rounded">{op}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 7-Step Configuration */}
                  <div className="p-3 border-b border-[#e2e8f0]">
                    <div className="text-[10px] text-[#64748b] uppercase mb-2">配置进度</div>
                    <div className="grid grid-cols-7 gap-1">
                      {configSteps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isConfigured = idx < 6; // Mock progress
                        return (
                          <div
                            key={step.id}
                            className={`h-8 rounded-sm flex flex-col items-center justify-center ${
                              isConfigured ? 'bg-[#10b981]/10' : 'bg-[#f8fafc]'
                            }`}
                            title={step.label}
                          >
                            <StepIcon size={10} className={isConfigured ? 'text-[#10b981]' : 'text-[#64748b]'} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="p-3 border-b border-[#e2e8f0]">
                    <div className="text-[10px] text-[#64748b] uppercase mb-2">配置信息</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">模型</span>
                        <span className="text-[#1e293b] font-mono">{selectedAgent?.model}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">版本</span>
                        <span className="text-[#1e293b] font-mono">v{selectedAgent?.version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">实体数</span>
                        <span className="text-[#1e293b] font-mono">{selectedAgent?.steps.ontology.target_entities.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">技能数</span>
                        <span className="text-[#1e293b] font-mono">{selectedAgent?.steps.skill.selected_skills.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">硬约束</span>
                        <span className="text-[#1e293b] font-mono">{selectedAgent?.steps.constraint.hard_constraints.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">软约束</span>
                        <span className="text-[#1e293b] font-mono">{selectedAgent?.steps.constraint.soft_constraints.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Entities */}
                  {(selectedAgent?.steps.ontology.target_entities?.length || 0) > 0 && (
                    <div className="p-3 border-b border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] uppercase mb-2">已选本体实体</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent?.steps.ontology.target_entities?.map(entityId => {
                          const entity = ontologyEntities.find(e => e.id === entityId);
                          return entity ? (
                            <span
                              key={entityId}
                              className="text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1"
                              style={{
                                backgroundColor: `${domainColors[entity.domain]}30`,
                                color: domainColors[entity.domain]
                              }}
                            >
                              {entity.name}
                            </span>
                          ) : (
                            <span key={entityId} className="text-[10px] px-2 py-0.5 bg-white text-[#64748b] rounded-sm">{entityId}</span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Skills */}
                  {(selectedAgent?.steps.skill.selected_skills?.length || 0) > 0 && (
                    <div className="p-3 border-b border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] uppercase mb-2">已选技能</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent?.steps.skill.selected_skills?.map(skillId => {
                          const skill = skillLibrary.find(s => s.skill_id === skillId);
                          return skill ? (
                            <span
                              key={skillId}
                              className="text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1"
                              style={{ backgroundColor: `${skillCategoryColors[skill.category]}20`, color: skillCategoryColors[skill.category] }}
                            >
                              {skill.name}
                            </span>
                          ) : (
                            <span key={skillId} className="text-[10px] px-2 py-0.5 bg-white text-[#64748b] rounded-sm">{skillId}</span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Constraints */}
                  {((selectedAgent?.steps.constraint.hard_constraints?.length || 0) > 0 || (selectedAgent?.steps.constraint.soft_constraints?.length || 0) > 0) && (
                    <div className="p-3 border-b border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] uppercase mb-2">已选约束</div>
                      <div className="space-y-1">
                        {selectedAgent?.steps.constraint.hard_constraints?.map(constraintId => {
                          const constraint = constraintLibrary.find(c => c.constraint_id === constraintId);
                          return constraint ? (
                            <div key={constraintId} className="flex items-center gap-2">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#ef4444]/20 text-[#ef4444]">硬</span>
                              <span className="text-[11px] text-[#1e293b]">{constraint.name}</span>
                            </div>
                          ) : null;
                        })}
                        {selectedAgent?.steps.constraint.soft_constraints?.map(constraintId => {
                          const constraint = constraintLibrary.find(c => c.constraint_id === constraintId);
                          return constraint ? (
                            <div key={constraintId} className="flex items-center gap-2">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#f59e0b]/20 text-[#f59e0b]">软</span>
                              <span className="text-[11px] text-[#1e293b]">{constraint.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Author & Dates */}
                  <div className="p-3">
                    <div className="text-[10px] text-[#64748b] uppercase mb-2">元数据</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">作者</span>
                        <span className="text-[#1e293b]">{selectedAgent?.author}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">创建时间</span>
                        <span className="text-[#1e293b] text-[10px]">{selectedAgent?.created_at && new Date(selectedAgent.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">更新时间</span>
                        <span className="text-[#1e293b] text-[10px]">{selectedAgent?.updated_at && new Date(selectedAgent.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
              <Bot size={32} className="mb-3 opacity-30" />
              <p className="text-xs">选择一个智能体查看详情</p>
              <p className="text-[10px] mt-1">或创建新智能体</p>
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
                placeholder="搜索智能体..."
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
              {filteredAgents.slice(0, 8).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => { handleSelectAgent(agent); setShowCommandPalette(false); setSearchTerm(''); }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white transition-colors text-left"
                >
                  <Bot size={14} className="text-[#3b82f6]" />
                  <div className="flex-1">
                    <div className="text-sm text-[#1e293b]">{agent.name}</div>
                    <div className="text-[10px] text-[#64748b] font-mono">{agent.id}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                    agent.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' :
                    agent.status === 'draft' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    'bg-[#64748b]/20 text-[#64748b]'
                  }`}>
                    {agent.status}
                  </span>
                </button>
              ))}
              {filteredAgents.length === 0 && (
                <div className="px-3 py-4 text-center text-[#64748b] text-xs">
                  未找到匹配的智能体
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
