import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Save, Play, Pause, RotateCcw, Trash2,
  Cpu, Settings, Zap, Shield, Database, Workflow, BarChart3,
  CheckCircle, XCircle, AlertCircle, Plus, X, ChevronRight,
  Clock, Activity, Terminal, GitBranch, Sparkles, Wrench
} from 'lucide-react';

interface AgentConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;

  // MCP配置
  mcpTools: string[];

  // Skills配置
  skills: SkillConfig[];

  // 约束规则
  constraints: Constraint[];
}

// 性能指标
interface PerformanceMetrics {
  cost: number;              // 执行成本评分（0.0-1.0）
  latency: number;           // 预期执行延迟（毫秒）
  accuracy_score: number;    // 模型准确度（0.0-1.0）
  roi: string;               // ROI描述（如 "+15%产能提升"）
}

// 输入/输出Schema
interface Schema {
  type: string;
  properties: Record<string, any>;
  required?: string[];
}

// 触发条件
interface TriggerConditions {
  description: string;       // 何时触发该技能的详细描述
  examples: string[];        // 触发示例话术（3-5个）
  keywords: string[];        // 关键词列表
}

// 注意事项/Gotchas
interface Gotcha {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution: string;
}

// 文件资源
interface SkillFiles {
  readme?: string;           // SKILL.md - 核心规则文档（Markdown格式）
  config?: Record<string, any>;  // 配置参数（JSON格式）
  script?: string;           // 确定性执行脚本代码
  script_lang?: 'python' | 'javascript';
  references?: string[];     // 参考文献/标准文件列表
  assets?: string[];         // 静态模板文件列表
}

// 安装状态
interface InstallationStatus {
  installed: boolean;
  installed_at?: string;
  installed_version?: string;
  path?: string;
}

// 技能配置（完整版）
interface SkillConfig {
  // 一、基本信息
  skill_id: string;          // 唯一标识符（snake_case_v{n} 格式）
  name: string;              // 技能中文名称
  version: string;           // 语义化版本号（如 2.1.0）
  category: 'workflow' | 'data-analysis' | 'prediction' | 'optimization' | 'detection' | 'visualization' | 'nlp' | 'code-generation' | 'integration' | 'automation';
  domain: string[];          // 所属领域标签数组
  capability_tags: string[]; // 能力标签数组
  description: string;       // 功能描述
  author: string;            // 作者/团队
  created_at: string;        // 创建时间
  updated_at: string;        // 更新时间

  // 二、性能指标
  performance: PerformanceMetrics;

  // 三、输入输出规范
  input_schema: Schema;
  output_schema: Schema;

  // 四、触发条件
  triggers: TriggerConditions;

  // 五、注意事项
  gotchas: Gotcha[];

  // 六、文件资源
  files: SkillFiles;

  // 七、安装状态
  installation: InstallationStatus;

  // 运行时配置（Agent级别）
  enabled: boolean;
  priority: number;
  agent_config?: Record<string, any>;
}

interface Constraint {
  id: string;
  name: string;
  type: 'threshold' | 'range' | 'formula' | 'business_rule';
  condition: string;
  action: 'alert' | 'block' | 'log' | 'notify';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const availableMCPTools = [
  { id: 'mcp-1', name: '数据聚合引擎', description: '整合多源异构数据', icon: Database },
  { id: 'mcp-2', name: '约束求解器', description: '求解复杂约束条件', icon: Wrench },
  { id: 'mcp-3', name: 'What-if模拟器', description: '场景推演与模拟', icon: BarChart3 },
  { id: 'mcp-4', name: '异常检测器', description: '识别数据异常模式', icon: AlertCircle },
  { id: 'mcp-5', name: '排程优化器', description: '优化生产排程方案', icon: Clock },
  { id: 'mcp-6', name: '预测分析引擎', description: '时间序列预测分析', icon: Activity },
  { id: 'mcp-7', name: '知识图谱查询', description: '本体关系推理查询', icon: GitBranch },
  { id: 'mcp-8', name: 'LLM推理服务', description: '大语言模型推理', icon: Sparkles },
];

const availableSkills: SkillConfig[] = [
  {
    skill_id: 'ts_analysis_v2',
    name: '时序数据分析',
    version: '2.1.0',
    category: 'data-analysis',
    domain: ['production', 'quality', 'equipment'],
    capability_tags: ['time-series', 'trend-analysis', 'seasonality', 'anomaly-detection'],
    description: '基于ARIMA、LSTM、Prophet等算法对时间序列数据进行趋势分析、季节性分解和异常检测。支持多变量时间序列分析和预测。',
    author: 'AI Lab - Data Team',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    performance: { cost: 0.65, latency: 2500, accuracy_score: 0.89, roi: '+23%异常识别准确率' },
    input_schema: {
      type: 'object',
      properties: {
        data: { type: 'array', description: '时间序列数据点数组' },
        timestamp_field: { type: 'string', description: '时间戳字段名' },
        value_field: { type: 'string', description: '数值字段名' },
        frequency: { type: 'string', enum: ['hourly', 'daily', 'weekly'], description: '数据频率' },
        forecast_horizon: { type: 'number', description: '预测步数' }
      },
      required: ['data', 'timestamp_field', 'value_field']
    },
    output_schema: {
      type: 'object',
      properties: {
        trend: { type: 'array', description: '趋势分量' },
        seasonal: { type: 'array', description: '季节性分量' },
        residual: { type: 'array', description: '残差分量' },
        forecast: { type: 'array', description: '预测结果' },
        anomalies: { type: 'array', description: '检测到的异常点' },
        confidence_interval: { type: 'object', description: '置信区间' }
      }
    },
    triggers: {
      description: '当用户需要对历史数据进行趋势分析、发现数据模式或检测异常时触发。适用于产能分析、质量趋势监控、设备状态分析等场景。',
      examples: ['分析过去三个月的产能趋势', '找出产量异常下降的时段', '预测下个月的需求波动', '这个指标为什么突然飙升？', '帮我看看质量数据有没有周期性规律'],
      keywords: ['趋势', '分析', '时序', '预测', '异常', '波动', '周期', '季节', 'ARIMA', 'LSTM']
    },
    gotchas: [
      { id: 'g1', title: '数据频率不一致', description: '输入数据必须保持统一的时间频率，混用小时级和日级数据会导致分析结果失真', severity: 'high', solution: '在数据预处理阶段使用resample方法统一频率，缺失值使用前向填充或插值处理' },
      { id: 'g2', title: '历史数据不足', description: 'LSTM模型需要至少2个完整周期的历史数据才能有效学习模式', severity: 'medium', solution: '当数据量不足时自动降级使用简单指数平滑或移动平均算法' },
      { id: 'g3', title: '异常点影响预测', description: '输入数据中的异常值会显著影响预测结果的准确性', severity: 'medium', solution: '启用自动异常值清洗选项，或使用对异常值鲁棒的算法（如Prophet）' }
    ],
    files: {
      readme: `# 时序数据分析技能\n\n## 描述\n基于ARIMA、LSTM、Prophet等算法对时间序列数据进行趋势分析、季节性分解和异常检测。\n\n## 使用场景\n1. 产能趋势分析\n2. 质量指标监控\n3. 设备状态预测\n4. 库存水平预测\n\n## Gotchas\n- 数据频率必须一致\n- 需要足够的历史数据\n- 注意异常值处理`,
      config: { default_algorithm: 'prophet', max_forecast_horizon: 90, confidence_level: 0.95, seasonality_mode: 'multiplicative' },
      script_lang: 'python',
      references: ['时序分析白皮书_v2.pdf', 'Prophet算法论文.pdf'],
      assets: ['模板_趋势报告.xlsx', '模板_异常分析.pptx']
    },
    installation: { installed: true, installed_at: '2024-03-15T10:00:00Z', installed_version: '2.1.0', path: '/skills/ts_analysis_v2' },
    enabled: true,
    priority: 1
  },
  {
    skill_id: 'demand_forecast_v3',
    name: '需求预测',
    version: '3.0.2',
    category: 'prediction',
    domain: ['production', 'sales', 'supply-chain'],
    capability_tags: ['forecasting', 'demand-planning', 'inventory', 'multi-variable'],
    description: '综合历史订单、市场趋势、季节性因素和促销活动，提供多维度需求预测。支持SKU级和产品族级预测。',
    author: 'AI Lab - Planning Team',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-03-25T16:45:00Z',
    performance: { cost: 0.78, latency: 4500, accuracy_score: 0.92, roi: '+18%库存周转率提升' },
    input_schema: {
      type: 'object',
      properties: {
        historical_orders: { type: 'array', description: '历史订单数据' },
        sku_list: { type: 'array', description: '需要预测的SKU列表' },
        forecast_periods: { type: 'number', description: '预测周期数' },
        external_factors: { type: 'object', description: '外部因素（促销、节假日等）' }
      },
      required: ['historical_orders', 'sku_list', 'forecast_periods']
    },
    output_schema: {
      type: 'object',
      properties: {
        forecasts: { type: 'array', description: '各SKU预测结果' },
        confidence_levels: { type: 'object', description: '各置信度下的预测区间' },
        recommended_safety_stock: { type: 'array', description: '建议安全库存' }
      }
    },
    triggers: {
      description: '当需要对未来需求进行预测以指导生产和采购决策时触发。适用于月度生产计划、采购计划制定、库存策略优化等场景。',
      examples: ['预测下个月的电池需求量', '帮我做未来三个月的销售预测', '双十一期间A产品的需求会是多少', '基于历史数据预测明年Q1的订单量', '计算下个月需要准备多少原材料'],
      keywords: ['预测', '需求', '订单', '销量', '库存', '生产计划', '采购', 'forecast']
    },
    gotchas: [
      { id: 'g1', title: '新产品冷启动问题', description: '对于历史数据不足的新产品，预测准确率会显著下降', severity: 'high', solution: '使用相似产品类比法或启用新产品专用的冷启动模型' },
      { id: 'g2', title: '促销活动影响', description: '未提前输入促销计划会导致预测结果偏离实际', severity: 'high', solution: '确保在预测前输入所有已知的促销和营销活动信息' }
    ],
    files: {
      readme: `# 需求预测技能\n\n## 描述\n综合历史订单、市场趋势、季节性因素提供多维度需求预测。\n\n## 使用场景\n1. 月度生产计划制定\n2. 原材料采购决策\n3. 安全库存计算\n4. 促销效果评估`,
      config: { models: ['lgbm', 'prophet', 'arima'], ensemble_method: 'weighted_average', default_forecast_periods: 30 },
      script_lang: 'python',
      references: ['需求预测算法白皮书.pdf'],
      assets: ['预测报告模板.pptx']
    },
    installation: { installed: true, installed_at: '2024-03-10T11:00:00Z', installed_version: '3.0.2', path: '/skills/demand_forecast_v3' },
    enabled: true,
    priority: 2
  },
  {
    skill_id: 'scheduling_optimizer_v1',
    name: '排程优化',
    version: '1.5.0',
    category: 'optimization',
    domain: ['production', 'planning'],
    capability_tags: ['scheduling', 'constraint-solving', 'genetic-algorithm', 'resource-allocation'],
    description: '基于约束满足问题（CSP）和遗传算法，优化生产排程方案。考虑设备产能、人员班次、物料齐套等复杂约束。',
    author: 'AI Lab - Optimization Team',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-03-18T09:20:00Z',
    performance: { cost: 0.85, latency: 8000, accuracy_score: 0.95, roi: '+12%设备利用率提升' },
    input_schema: {
      type: 'object',
      properties: {
        orders: { type: 'array', description: '待排程订单列表' },
        resources: { type: 'array', description: '可用资源（设备、人员）' },
        constraints: { type: 'array', description: '约束条件' },
        objectives: { type: 'array', description: '优化目标' }
      },
      required: ['orders', 'resources']
    },
    output_schema: {
      type: 'object',
      properties: {
        schedule: { type: 'array', description: '排程方案' },
        utilization: { type: 'number', description: '资源利用率' },
        makespan: { type: 'number', description: '总工期' },
        violations: { type: 'array', description: '约束违反情况' }
      }
    },
    triggers: {
      description: '当需要制定或优化生产排程方案时触发。适用于日/周/月排程计划制定、紧急插单处理、资源瓶颈分析等场景。',
      examples: ['帮我排一下下周的生产计划', '有个急单插入，怎么调整现有排程', '计算最优的设备分配方案', '这批订单最快什么时候能完成', '帮我优化一下产线的人员排班'],
      keywords: ['排程', '计划', '调度', '优化', '产能', '资源', '分配', 'schedule', 'plan']
    },
    gotchas: [
      { id: 'g1', title: '约束条件过多导致无解', description: '过于严格的约束可能导致无可行解', severity: 'high', solution: '设置约束优先级，允许低优先级约束被适度违反' }
    ],
    files: {
      readme: `# 排程优化技能\n\n## 描述\n基于约束满足和遗传算法优化生产排程方案。\n\n## 使用场景\n1. 生产计划排程\n2. 资源分配优化\n3. 紧急插单处理\n4. 瓶颈分析`,
      config: { algorithm: 'genetic', population_size: 100, max_iterations: 1000, timeout_ms: 30000 },
      script_lang: 'python',
      references: ['约束求解白皮书.pdf'],
      assets: ['排程报告模板.xlsx']
    },
    installation: { installed: true, installed_at: '2024-03-12T14:00:00Z', installed_version: '1.5.0', path: '/skills/scheduling_optimizer_v1' },
    enabled: true,
    priority: 3
  }
];

const constraintTemplates = [
  { name: '准确率阈值', type: 'threshold', condition: 'accuracy >= ${threshold}', description: '模型准确率必须达到设定阈值' },
  { name: '执行时间限制', type: 'range', condition: 'execution_time <= ${max_time}', description: '执行时间不能超过限制' },
  { name: '数据新鲜度', type: 'business_rule', condition: 'data_freshness <= ${hours}h', description: '输入数据必须足够新鲜' },
  { name: '结果置信度', type: 'formula', condition: 'confidence >= ${min_confidence}', description: '输出结果置信度要求' },
];

interface AgentEditorProps {
  agentId?: string;
  isCreating?: boolean;
  onNavigate: (page: string) => void;
  onSave?: (agent: AgentConfig) => void;
}

export default function AgentEditor({ agentId, isCreating = false, onNavigate, onSave }: AgentEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'mcp' | 'skills' | 'constraints'>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [viewingSkill, setViewingSkill] = useState<SkillConfig | null>(null);

  const [agent, setAgent] = useState<AgentConfig>({
    id: agentId || `agent-${Date.now()}`,
    name: isCreating ? '' : '电池需求预测智能体',
    code: isCreating ? '' : 'DemandForecastingAgent',
    description: isCreating ? '' : '基于历史订单数据、市场趋势和季节性因素，智能预测锂电池未来需求',
    icon: 'trending',
    status: 'draft',
    version: '1.0.0',
    mcpTools: isCreating ? [] : ['mcp-1', 'mcp-3', 'mcp-6'],
    skills: isCreating ? [] : [
      { ...availableSkills[0], skill_id: `${availableSkills[0].skill_id}_1`, priority: 1, enabled: true },
      { ...availableSkills[1], skill_id: `${availableSkills[1].skill_id}_1`, priority: 2, enabled: true },
    ],
    constraints: isCreating ? [] : [
      { id: 'c-1', name: '最低准确率要求', type: 'threshold', condition: 'accuracy >= 0.90', action: 'alert', enabled: true, severity: 'high' },
    ],
  });

  const handleSave = () => {
    if (onSave) {
      onSave(agent);
    }
    setHasChanges(false);
    // 显示保存成功提示
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      onNavigate('settings');
    }
  };

  const toggleMcpTool = (toolId: string) => {
    setAgent(prev => ({
      ...prev,
      mcpTools: prev.mcpTools.includes(toolId)
        ? prev.mcpTools.filter(id => id !== toolId)
        : [...prev.mcpTools, toolId]
    }));
    setHasChanges(true);
  };

  const addSkill = (skillTemplate: SkillConfig) => {
    const newSkill: SkillConfig = {
      ...skillTemplate,
      skill_id: `${skillTemplate.skill_id}_${Date.now()}`,
      priority: agent.skills.length + 1,
      enabled: true,
    };
    setAgent(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setHasChanges(true);
  };

  const removeSkill = (skillId: string) => {
    setAgent(prev => ({ ...prev, skills: prev.skills.filter(s => s.skill_id !== skillId) }));
    setHasChanges(true);
  };

  const addConstraint = (template: typeof constraintTemplates[0]) => {
    const newConstraint: Constraint = {
      id: `c-${Date.now()}`,
      name: template.name,
      type: template.type as any,
      condition: template.condition,
      action: 'alert',
      enabled: true,
      severity: 'medium',
    };
    setAgent(prev => ({ ...prev, constraints: [...prev.constraints, newConstraint] }));
    setHasChanges(true);
  };

  const removeConstraint = (constraintId: string) => {
    setAgent(prev => ({ ...prev, constraints: prev.constraints.filter(c => c.id !== constraintId) }));
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Cpu className="text-white" size={18} />
          </div>
          <div>
            <span className="text-base font-semibold text-gray-900">
              {isCreating ? '创建智能体' : '编辑智能体'}
            </span>
            <span className="text-xs text-gray-500 ml-2 font-mono">{agent.code}</span>
          </div>
          {hasChanges && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              未保存
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Save size={16} />
            <span>保存</span>
          </button>
          {!isCreating && (
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
              <Play size={16} />
              <span>运行</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tabs */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <nav className="p-3 space-y-1">
            {[
              { id: 'basic', label: '基本信息', icon: Settings },
              { id: 'mcp', label: 'MCP工具', icon: Database, badge: agent.mcpTools.length },
              { id: 'skills', label: '业务技能', icon: Sparkles, badge: agent.skills.length },
              { id: 'constraints', label: '约束规则', icon: Shield, badge: agent.constraints.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        智能体名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={agent.name}
                        onChange={(e) => { setAgent(prev => ({ ...prev, name: e.target.value })); setHasChanges(true); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入智能体名称"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        代码标识 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={agent.code}
                        onChange={(e) => { setAgent(prev => ({ ...prev, code: e.target.value })); setHasChanges(true); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="AgentCodeName"
                      />
                      <p className="text-xs text-gray-500 mt-1">唯一标识符，用于API调用和日志追踪</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <textarea
                        value={agent.description}
                        onChange={(e) => { setAgent(prev => ({ ...prev, description: e.target.value })); setHasChanges(true); }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="描述智能体的功能和用途"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                        <select
                          value={agent.status}
                          onChange={(e) => { setAgent(prev => ({ ...prev, status: e.target.value as any })); setHasChanges(true); }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">草稿</option>
                          <option value="active">运行中</option>
                          <option value="inactive">已停用</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">版本</label>
                        <input
                          type="text"
                          value={agent.version}
                          onChange={(e) => { setAgent(prev => ({ ...prev, version: e.target.value })); setHasChanges(true); }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1.0.0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MCP Tools Tab */}
            {activeTab === 'mcp' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">MCP工具配置</h3>
                    <p className="text-sm text-gray-500">选择智能体可以调用的MCP工具</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {availableMCPTools.map((tool) => {
                    const isSelected = agent.mcpTools.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        onClick={() => toggleMcpTool(tool.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <tool.icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{tool.name}</h4>
                              {isSelected && <CheckCircle size={16} className="text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {agent.mcpTools.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Database size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">请选择至少一个MCP工具</p>
                  </div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">业务技能配置</h3>
                    <p className="text-sm text-gray-500">配置智能体具备的业务技能和能力</p>
                  </div>
                </div>

                {/* Available Skills to Add */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">可添加的技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills
                      .filter(s => !agent.skills.some(as => as.skill_id.startsWith(s.skill_id)))
                      .map(skill => (
                        <button
                          key={skill.skill_id}
                          onClick={() => addSkill(skill)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                          title={skill.description}
                        >
                          <Plus size={14} />
                          {skill.name}
                          <span className="text-xs text-gray-400">v{skill.version}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Configured Skills */}
                <div className="space-y-3">
                  {agent.skills.map((skill, index) => (
                    <div key={skill.skill_id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                {skill.category}
                              </span>
                              <span className="text-xs text-gray-400">v{skill.version}</span>
                              {skill.installation.installed && (
                                <span className="text-xs text-green-500 flex items-center gap-0.5">
                                  <CheckCircle size={10} /> 已安装
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingSkill(skill)}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            查看详情
                          </button>
                          <label className="flex items-center gap-2 text-sm px-2">
                            <input
                              type="checkbox"
                              checked={skill.enabled}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  skills: prev.skills.map(s =>
                                    s.skill_id === skill.skill_id ? { ...s, enabled: e.target.checked } : s
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="rounded"
                            />
                            启用
                          </label>
                          <button
                            onClick={() => removeSkill(skill.skill_id)}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Skill Summary */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 line-clamp-1 flex-1 mr-4">{skill.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Activity size={12} />
                              准确率: {(skill.performance.accuracy_score * 100).toFixed(0)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              延迟: {skill.performance.latency}ms
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {agent.skills.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Sparkles size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">请添加业务技能</p>
                  </div>
                )}
              </div>
            )}

            {/* Constraints Tab */}
            {activeTab === 'constraints' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">约束规则配置</h3>
                    <p className="text-sm text-gray-500">设置智能体执行时的约束条件和边界规则</p>
                  </div>
                </div>

                {/* Constraint Templates */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">快速添加约束模板</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {constraintTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => addConstraint(template)}
                        className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Plus size={14} className="text-blue-500" />
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configured Constraints */}
                <div className="space-y-3">
                  {agent.constraints.map((constraint) => (
                    <div key={constraint.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Shield size={18} className="text-blue-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">{constraint.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {constraint.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={constraint.enabled}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  constraints: prev.constraints.map(c =>
                                    c.id === constraint.id ? { ...c, enabled: e.target.checked } : c
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="rounded"
                            />
                            启用
                          </label>
                          <button
                            onClick={() => removeConstraint(constraint.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500">条件表达式</label>
                          <input
                            type="text"
                            value={constraint.condition}
                            onChange={(e) => {
                              setAgent(prev => ({
                                ...prev,
                                constraints: prev.constraints.map(c =>
                                  c.id === constraint.id ? { ...c, condition: e.target.value } : c
                                )
                              }));
                              setHasChanges(true);
                            }}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">触发动作</label>
                            <select
                              value={constraint.action}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  constraints: prev.constraints.map(c =>
                                    c.id === constraint.id ? { ...c, action: e.target.value as any } : c
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="w-full mt-1 px-2 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="alert">告警</option>
                              <option value="block">阻断</option>
                              <option value="log">记录日志</option>
                              <option value="notify">通知</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">严重等级</label>
                            <select
                              value={constraint.severity}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  constraints: prev.constraints.map(c =>
                                    c.id === constraint.id ? { ...c, severity: e.target.value as any } : c
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="w-full mt-1 px-2 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="low">低</option>
                              <option value="medium">中</option>
                              <option value="high">高</option>
                              <option value="critical">严重</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {agent.constraints.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Shield size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">请添加约束规则</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Unsaved Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-yellow-500" />
              <h3 className="text-lg font-semibold">未保存的更改</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              您有未保存的更改，确定要离开吗？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  onNavigate('settings');
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                放弃更改
              </button>
              <button
                onClick={() => {
                  handleSave();
                  setShowUnsavedWarning(false);
                  onNavigate('settings');
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                保存并离开
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {viewingSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{viewingSkill.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">{viewingSkill.skill_id}</code>
                    <span>v{viewingSkill.version}</span>
                    <span className="text-gray-300">|</span>
                    <span>{viewingSkill.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingSkill(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 一、基本信息 */}
                  <section className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings size={16} className="text-blue-500" />
                      基本信息
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">功能描述</span>
                        <p className="text-gray-900 mt-1">{viewingSkill.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">作者/团队</span>
                        <p className="text-gray-900 mt-1">{viewingSkill.author}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">领域标签</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewingSkill.domain.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">能力标签</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewingSkill.capability_tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">创建时间</span>
                        <p className="text-gray-900 mt-1">{new Date(viewingSkill.created_at).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">更新时间</span>
                        <p className="text-gray-900 mt-1">{new Date(viewingSkill.updated_at).toLocaleDateString('zh-CN')}</p>
                      </div>
                    </div>
                  </section>

                  {/* 四、触发条件 */}
                  <section className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-yellow-500" />
                      触发条件
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">{viewingSkill.triggers.description}</p>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500 uppercase">触发示例</span>
                        <ul className="mt-2 space-y-1.5">
                          {viewingSkill.triggers.examples.map((example, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-blue-500 mt-0.5">•</span>
                              "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase">关键词</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {viewingSkill.triggers.keywords.map(kw => (
                            <span key={kw} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 五、注意事项/Gotchas */}
                  <section className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-500" />
                      注意事项 / Gotchas
                    </h3>
                    <div className="space-y-3">
                      {viewingSkill.gotchas.map(gotcha => (
                        <div key={gotcha.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              gotcha.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              gotcha.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              gotcha.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {gotcha.severity.toUpperCase()}
                            </span>
                            <h4 className="font-medium text-gray-900">{gotcha.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{gotcha.description}</p>
                          <div className="flex items-start gap-2 text-sm bg-green-50 p-2 rounded">
                            <span className="text-green-600 font-medium">解决方案:</span>
                            <span className="text-green-700">{gotcha.solution}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 六、文件资源 */}
                  <section className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Database size={16} className="text-purple-500" />
                      文件资源
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {viewingSkill.files.readme && (
                        <div className="col-span-2">
                          <span className="text-gray-500">README (SKILL.md)</span>
                          <div className="mt-1 p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {viewingSkill.files.readme}
                          </div>
                        </div>
                      )}
                      {viewingSkill.files.config && (
                        <div>
                          <span className="text-gray-500">配置参数</span>
                          <pre className="mt-1 p-2 bg-gray-200 rounded text-xs font-mono overflow-x-auto">
                            {JSON.stringify(viewingSkill.files.config, null, 2)}
                          </pre>
                        </div>
                      )}
                      {viewingSkill.files.script_lang && (
                        <div>
                          <span className="text-gray-500">脚本语言</span>
                          <p className="text-gray-900 mt-1">{viewingSkill.files.script_lang}</p>
                        </div>
                      )}
                      {viewingSkill.files.references && viewingSkill.files.references.length > 0 && (
                        <div>
                          <span className="text-gray-500">参考文献</span>
                          <ul className="mt-1 space-y-1">
                            {viewingSkill.files.references.map((ref, idx) => (
                              <li key={idx} className="text-blue-600 text-xs">{ref}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {viewingSkill.files.assets && viewingSkill.files.assets.length > 0 && (
                        <div>
                          <span className="text-gray-500">静态资源</span>
                          <ul className="mt-1 space-y-1">
                            {viewingSkill.files.assets.map((asset, idx) => (
                              <li key={idx} className="text-gray-700 text-xs">{asset}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column - Performance & Schema */}
                <div className="space-y-6">
                  {/* 二、性能指标 */}
                  <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 size={16} className="text-blue-500" />
                      性能指标
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">执行成本</span>
                          <span className="font-medium">{(viewingSkill.performance.cost * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${viewingSkill.performance.cost * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">准确率</span>
                          <span className="font-medium">{(viewingSkill.performance.accuracy_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${viewingSkill.performance.accuracy_score * 100}%` }} />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">执行延迟</span>
                          <span className="font-medium">{viewingSkill.performance.latency}ms</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">ROI</span>
                          <span className="font-medium text-green-600">{viewingSkill.performance.roi}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 三、输入输出规范 */}
                  <section className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Terminal size={16} className="text-green-500" />
                      输入输出规范
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase">输入参数</span>
                        <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto">
                          {JSON.stringify(viewingSkill.input_schema, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase">输出参数</span>
                        <pre className="mt-2 p-3 bg-gray-900 text-blue-400 text-xs rounded-lg overflow-x-auto">
                          {JSON.stringify(viewingSkill.output_schema, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </section>

                  {/* 七、安装状态 */}
                  <section className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      安装状态
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${viewingSkill.installation.installed ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={viewingSkill.installation.installed ? 'text-green-600' : 'text-gray-500'}>
                          {viewingSkill.installation.installed ? '已安装' : '未安装'}
                        </span>
                      </div>
                      {viewingSkill.installation.installed && (
                        <>
                          <div>
                            <span className="text-gray-500">安装版本</span>
                            <p className="text-gray-900">{viewingSkill.installation.installed_version}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">安装时间</span>
                            <p className="text-gray-900">{viewingSkill.installation.installed_at && new Date(viewingSkill.installation.installed_at).toLocaleDateString('zh-CN')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">安装路径</span>
                            <code className="block mt-1 text-xs bg-gray-200 px-2 py-1 rounded">{viewingSkill.installation.path}</code>
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
