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

  // 触发配置
  triggers: TriggerConfig[];

  // 执行参数
  parameters: Parameter[];
}

interface SkillConfig {
  id: string;
  name: string;
  type: 'analysis' | 'prediction' | 'optimization' | 'detection';
  enabled: boolean;
  priority: number;
  config: Record<string, any>;
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

interface TriggerConfig {
  id: string;
  type: 'schedule' | 'event' | 'manual' | 'condition';
  config: Record<string, any>;
  enabled: boolean;
}

interface Parameter {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
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

const availableSkills = [
  { id: 'skill-1', name: '时序数据分析', type: 'analysis', description: 'ARIMA/LSTM等时间序列分析' },
  { id: 'skill-2', name: '异常检测', type: 'detection', description: '基于统计和机器学习的异常识别' },
  { id: 'skill-3', name: '需求预测', type: 'prediction', description: '多维度需求预测模型' },
  { id: 'skill-4', name: '排程优化', type: 'optimization', description: '约束满足和遗传算法优化' },
  { id: 'skill-5', name: '视觉检测', type: 'detection', description: '计算机视觉缺陷检测' },
  { id: 'skill-6', name: '能耗分析', type: 'analysis', description: '用电模式分析和优化' },
  { id: 'skill-7', name: '供应链评估', type: 'analysis', description: '供应商风险评估模型' },
  { id: 'skill-8', name: '质量预测', type: 'prediction', description: '产品质量预测模型' },
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
  const [activeTab, setActiveTab] = useState<'basic' | 'mcp' | 'skills' | 'constraints' | 'triggers' | 'params'>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

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
      { id: 'skill-1', name: '时序数据分析', type: 'analysis', enabled: true, priority: 1, config: { model: 'LSTM' } },
      { id: 'skill-3', name: '需求预测', type: 'prediction', enabled: true, priority: 2, config: { horizon: 30 } },
    ],
    constraints: isCreating ? [] : [
      { id: 'c-1', name: '最低准确率要求', type: 'threshold', condition: 'accuracy >= 0.90', action: 'alert', enabled: true, severity: 'high' },
    ],
    triggers: isCreating ? [] : [
      { id: 't-1', type: 'schedule', config: { cron: '0 8 * * 1' }, enabled: true },
      { id: 't-2', type: 'condition', config: { condition: 'deviation > 0.15' }, enabled: true },
    ],
    parameters: isCreating ? [] : [
      { id: 'p-1', key: 'forecast_horizon', value: 30, type: 'number', description: '预测周期(天)' },
      { id: 'p-2', key: 'confidence_level', value: 0.95, type: 'number', description: '置信水平' },
      { id: 'p-3', key: 'enable_seasonality', value: true, type: 'boolean', description: '启用季节性调整' },
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

  const addSkill = (skillTemplate: typeof availableSkills[0]) => {
    const newSkill: SkillConfig = {
      id: `${skillTemplate.id}-${Date.now()}`,
      name: skillTemplate.name,
      type: skillTemplate.type as any,
      enabled: true,
      priority: agent.skills.length + 1,
      config: {},
    };
    setAgent(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setHasChanges(true);
  };

  const removeSkill = (skillId: string) => {
    setAgent(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== skillId) }));
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

  const addTrigger = (type: TriggerConfig['type']) => {
    const newTrigger: TriggerConfig = {
      id: `t-${Date.now()}`,
      type,
      config: type === 'schedule' ? { cron: '0 0 * * *' } :
              type === 'event' ? { event: 'data_update' } :
              type === 'condition' ? { condition: 'value > threshold' } : {},
      enabled: true,
    };
    setAgent(prev => ({ ...prev, triggers: [...prev.triggers, newTrigger] }));
    setHasChanges(true);
  };

  const removeTrigger = (triggerId: string) => {
    setAgent(prev => ({ ...prev, triggers: prev.triggers.filter(t => t.id !== triggerId) }));
    setHasChanges(true);
  };

  const addParameter = () => {
    const newParam: Parameter = {
      id: `p-${Date.now()}`,
      key: `param_${agent.parameters.length + 1}`,
      value: '',
      type: 'string',
      description: '',
    };
    setAgent(prev => ({ ...prev, parameters: [...prev.parameters, newParam] }));
    setHasChanges(true);
  };

  const updateParameter = (paramId: string, updates: Partial<Parameter>) => {
    setAgent(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => p.id === paramId ? { ...p, ...updates } : p)
    }));
    setHasChanges(true);
  };

  const removeParameter = (paramId: string) => {
    setAgent(prev => ({ ...prev, parameters: prev.parameters.filter(p => p.id !== paramId) }));
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
              { id: 'triggers', label: '触发配置', icon: Zap, badge: agent.triggers.length },
              { id: 'params', label: '执行参数', icon: Terminal, badge: agent.parameters.length },
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
                      .filter(s => !agent.skills.some(as => as.name === s.name))
                      .map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => addSkill(skill)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                        >
                          <Plus size={14} />
                          {skill.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Configured Skills */}
                <div className="space-y-3">
                  {agent.skills.map((skill, index) => (
                    <div key={skill.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {skill.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={skill.enabled}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  skills: prev.skills.map(s =>
                                    s.id === skill.id ? { ...s, enabled: e.target.checked } : s
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="rounded"
                            />
                            启用
                          </label>
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Skill Config */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">优先级</label>
                            <input
                              type="number"
                              value={skill.priority}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  skills: prev.skills.map(s =>
                                    s.id === skill.id ? { ...s, priority: parseInt(e.target.value) } : s
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">配置 (JSON)</label>
                            <input
                              type="text"
                              value={JSON.stringify(skill.config)}
                              onChange={(e) => {
                                try {
                                  const config = JSON.parse(e.target.value);
                                  setAgent(prev => ({
                                    ...prev,
                                    skills: prev.skills.map(s =>
                                      s.id === skill.id ? { ...s, config } : s
                                    )
                                  }));
                                  setHasChanges(true);
                                } catch {}
                              }}
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                            />
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

            {/* Triggers Tab */}
            {activeTab === 'triggers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">触发配置</h3>
                    <p className="text-sm text-gray-500">配置智能体的触发条件和执行时机</p>
                  </div>
                </div>

                {/* Add Trigger Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => addTrigger('schedule')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    <Clock size={16} />
                    定时触发
                  </button>
                  <button
                    onClick={() => addTrigger('event')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    <Zap size={16} />
                    事件触发
                  </button>
                  <button
                    onClick={() => addTrigger('condition')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    <Activity size={16} />
                    条件触发
                  </button>
                  <button
                    onClick={() => addTrigger('manual')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    <Terminal size={16} />
                    手动触发
                  </button>
                </div>

                {/* Configured Triggers */}
                <div className="space-y-3">
                  {agent.triggers.map((trigger) => (
                    <div key={trigger.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {trigger.type === 'schedule' && <Clock size={18} className="text-blue-500" />}
                          {trigger.type === 'event' && <Zap size={18} className="text-yellow-500" />}
                          {trigger.type === 'condition' && <Activity size={18} className="text-green-500" />}
                          {trigger.type === 'manual' && <Terminal size={18} className="text-gray-500" />}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {trigger.type === 'schedule' && '定时触发'}
                              {trigger.type === 'event' && '事件触发'}
                              {trigger.type === 'condition' && '条件触发'}
                              {trigger.type === 'manual' && '手动触发'}
                            </h4>
                            <span className="text-xs text-gray-500">{trigger.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={trigger.enabled}
                              onChange={(e) => {
                                setAgent(prev => ({
                                  ...prev,
                                  triggers: prev.triggers.map(t =>
                                    t.id === trigger.id ? { ...t, enabled: e.target.checked } : t
                                  )
                                }));
                                setHasChanges(true);
                              }}
                              className="rounded"
                            />
                            启用
                          </label>
                          <button
                            onClick={() => removeTrigger(trigger.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">配置</label>
                        {trigger.type === 'schedule' && (
                          <input
                            type="text"
                            value={trigger.config.cron || ''}
                            onChange={(e) => {
                              setAgent(prev => ({
                                ...prev,
                                triggers: prev.triggers.map(t =>
                                  t.id === trigger.id ? { ...t, config: { ...t.config, cron: e.target.value } } : t
                                )
                              }));
                              setHasChanges(true);
                            }}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="0 8 * * 1 (Cron表达式)"
                          />
                        )}
                        {trigger.type === 'event' && (
                          <input
                            type="text"
                            value={trigger.config.event || ''}
                            onChange={(e) => {
                              setAgent(prev => ({
                                ...prev,
                                triggers: prev.triggers.map(t =>
                                  t.id === trigger.id ? { ...t, config: { ...t.config, event: e.target.value } } : t
                                )
                              }));
                              setHasChanges(true);
                            }}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="事件名称"
                          />
                        )}
                        {trigger.type === 'condition' && (
                          <input
                            type="text"
                            value={trigger.config.condition || ''}
                            onChange={(e) => {
                              setAgent(prev => ({
                                ...prev,
                                triggers: prev.triggers.map(t =>
                                  t.id === trigger.id ? { ...t, config: { ...t.config, condition: e.target.value } } : t
                                )
                              }));
                              setHasChanges(true);
                            }}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="condition > threshold"
                          />
                        )}
                        {trigger.type === 'manual' && (
                          <p className="text-sm text-gray-500 mt-1">通过API或界面手动调用</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {agent.triggers.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Zap size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">请添加触发配置</p>
                  </div>
                )}
              </div>
            )}

            {/* Parameters Tab */}
            {activeTab === 'params' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">执行参数</h3>
                    <p className="text-sm text-gray-500">配置智能体运行时的参数和变量</p>
                  </div>
                  <button
                    onClick={addParameter}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    添加参数
                  </button>
                </div>

                <div className="space-y-3">
                  {agent.parameters.map((param) => (
                    <div key={param.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                          <label className="text-xs text-gray-500">参数名</label>
                          <input
                            type="text"
                            value={param.key}
                            onChange={(e) => updateParameter(param.id, { key: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500">类型</label>
                          <select
                            value={param.type}
                            onChange={(e) => updateParameter(param.id, { type: e.target.value as any })}
                            className="w-full mt-1 px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="string">字符串</option>
                            <option value="number">数字</option>
                            <option value="boolean">布尔</option>
                            <option value="array">数组</option>
                            <option value="object">对象</option>
                          </select>
                        </div>
                        <div className="col-span-4">
                          <label className="text-xs text-gray-500">值</label>
                          <input
                            type="text"
                            value={typeof param.value === 'object' ? JSON.stringify(param.value) : String(param.value)}
                            onChange={(e) => {
                              let value: any = e.target.value;
                              if (param.type === 'number') value = parseFloat(value) || 0;
                              if (param.type === 'boolean') value = value === 'true';
                              updateParameter(param.id, { value });
                            }}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500">描述</label>
                          <input
                            type="text"
                            value={param.description}
                            onChange={(e) => updateParameter(param.id, { description: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-1 flex items-end justify-end">
                          <button
                            onClick={() => removeParameter(param.id)}
                            className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {agent.parameters.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Terminal size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">请添加执行参数</p>
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
    </div>
  );
}
