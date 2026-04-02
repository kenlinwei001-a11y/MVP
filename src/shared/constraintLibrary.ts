// 全局共享约束库 - 锂电制造产销匹配场景
// 可被 AgentConfiguration、SkillConfiguration、ConstraintConfiguration 共享

export type ConstraintNature = 'static' | 'dynamic' | 'conditional';
export type ConstraintCategory = 'time' | 'resource' | 'process' | 'cost' | 'quality' | 'safety';
export type ConstraintType = 'hard' | 'soft';
export type ConstraintScope = 'global' | 'workflow' | 'step' | 'entity';

// 动态约束配置
export interface DynamicConstraintConfig {
  contextVariables: string[];
  calculationFormula: string;
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

// 条件规则
export interface ConditionalRule {
  condition: string;
  threshold: number | string;
  priority: number;
  description?: string;
}

// 约束规则接口
export interface Constraint {
  constraint_id: string;
  name: string;
  description: string;
  category: ConstraintCategory;
  type: ConstraintType;
  nature: ConstraintNature;
  expression: string;
  operator: string;
  target_field: string;
  threshold?: number | string;
  applies_to: string[];
  scope: ConstraintScope;
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
  dynamicConfig?: Partial<DynamicConstraintConfig>;
  conditionalRules?: ConditionalRule[];
}

// 分类标签
export const categoryLabels: Record<ConstraintCategory, string> = {
  time: '时间',
  resource: '资源',
  process: '工艺',
  cost: '成本',
  quality: '质量',
  safety: '安全',
};

// 分类颜色
export const categoryColors: Record<ConstraintCategory, string> = {
  time: '#3b82f6',
  resource: '#10b981',
  process: '#f59e0b',
  cost: '#8b5cf6',
  quality: '#ec4899',
  safety: '#ef4444',
};

// 性质标签
export const natureLabels: Record<ConstraintNature, string> = {
  static: '静态',
  dynamic: '动态',
  conditional: '条件',
};

// 性质颜色
export const natureColors: Record<ConstraintNature, string> = {
  static: '#64748b',
  dynamic: '#3b82f6',
  conditional: '#f59e0b',
};

// 类型标签
export const typeLabels: Record<ConstraintType, string> = {
  hard: '硬约束',
  soft: '软约束',
};

// 完整约束库 - 锂电制造产销匹配场景
export const constraintLibrary: Constraint[] = [
  // ==================== 时间约束 ====================
  {
    constraint_id: 'delivery_deadline',
    name: '交期不可延迟',
    description: '订单交付日期必须严格满足客户要求的截止日期，综合考虑产能、物料、工艺时间',
    category: 'time',
    type: 'hard',
    nature: 'static',
    expression: 'delivery_date <= deadline',
    operator: '<=',
    target_field: 'delivery_date',
    applies_to: ['SalesOrder', 'DeliveryPlan', 'WorkOrder'],
    scope: 'workflow',
    priority: 10,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z',
    author: '计划部',
    version: '2.1.0',
    severity: 'critical',
    conflict_resolution: 'priority',
    fallback_action: 'block',
    alert_level: 'critical',
    enabled: true,
    tags: ['delivery', 'time-critical', 'customer']
  },
  {
    constraint_id: 'lead_time_by_quantity',
    name: '订单提前期计算',
    description: '根据订单量、工艺路线、供应商条件计算实际提前期，锂电长流程需考虑化成静置时间',
    category: 'time',
    type: 'soft',
    nature: 'conditional',
    expression: 'actual_lead_time <= calculated_lead_time',
    operator: '<=',
    target_field: 'actual_lead_time',
    applies_to: ['SalesOrder', 'WorkOrder', 'ProductionPlan'],
    scope: 'workflow',
    priority: 7,
    created_at: '2024-03-25T10:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
    author: '计划部',
    version: '1.0.0',
    severity: 'medium',
    conflict_resolution: 'weighted',
    fallback_action: 'alert',
    alert_level: 'medium',
    enabled: true,
    tags: ['lead_time', 'planning', 'lithium-specific'],
    conditionalRules: [
      {
        condition: 'order_quantity <= 100',
        threshold: 'base_lead_time * 1.0 + formation_rest_time',
        priority: 5,
        description: '小批量订单：线性提前期 + 化成静置48小时'
      },
      {
        condition: 'order_quantity > 100 && order_quantity <= 1000',
        threshold: 'base_lead_time * (1 + 0.3 * log(quantity/100)) + formation_rest_time',
        priority: 6,
        description: '中批量订单：次线性增长 + 化成静置'
      },
      {
        condition: 'order_quantity > 1000',
        threshold: 'base_lead_time * (1.5 + 0.2 * (quantity-1000)/1000) + formation_rest_time',
        priority: 7,
        description: '大批量订单：接近线性增长 + 化成静置'
      },
      {
        condition: 'product_type == "LFP-280Ah"',
        threshold: 'calculated_lead_time * 1.1',
        priority: 6,
        description: '大容量LFP电池增加10%工艺时间'
      }
    ]
  },
  {
    constraint_id: 'formation_rest_time',
    name: '化成后静置时间',
    description: '电池化成后必须静置48-72小时才能进行容量测试，这是锂电制造的关键工艺要求',
    category: 'time',
    type: 'hard',
    nature: 'static',
    expression: 'rest_duration >= 48',
    operator: '>=',
    target_field: 'rest_duration',
    threshold: 48,
    applies_to: ['ProcessRoute', 'WorkOrder', 'WorkInProcess'],
    scope: 'workflow',
    priority: 9,
    created_at: '2024-03-25T11:00:00Z',
    updated_at: '2024-03-25T11:00:00Z',
    author: '工艺部',
    version: '1.0.0',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['formation', 'rest', 'lithium-specific', 'process']
  },

  // ==================== 资源约束 ====================
  {
    constraint_id: 'equipment_capacity',
    name: '设备产能限制',
    description: '设备每日运行时间不得超过其最大产能限制，需考虑班次、设备状态、良品率',
    category: 'resource',
    type: 'hard',
    nature: 'dynamic',
    expression: 'daily_output <= dynamic_max_capacity',
    operator: '<=',
    target_field: 'daily_output',
    applies_to: ['Equipment', 'ProductionLine', 'WorkCenter'],
    scope: 'entity',
    priority: 9,
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-03-15T10:45:00Z',
    author: '设备部',
    version: '3.0.1',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['capacity', 'equipment', 'oee'],
    dynamicConfig: {
      contextVariables: ['shift_type', 'equipment_health', 'operator_skill', 'yield_rate'],
      calculationFormula: 'base_capacity * shift_coefficient * health_factor * skill_factor * yield_rate',
      updateFrequency: 'daily'
    }
  },
  {
    constraint_id: 'yield_adjusted_capacity',
    name: '良品率产能折算',
    description: '实际可用产能 = 理论产能 × 良品率，锂电良品率通常需≥98.5%',
    category: 'resource',
    type: 'soft',
    nature: 'dynamic',
    expression: 'effective_capacity = nominal_capacity * yield_rate',
    operator: '=',
    target_field: 'effective_capacity',
    applies_to: ['ProductionLine', 'Equipment', 'WorkCenter'],
    scope: 'entity',
    priority: 8,
    created_at: '2024-03-25T12:00:00Z',
    updated_at: '2024-03-25T12:00:00Z',
    author: '质量部',
    version: '1.0.0',
    severity: 'high',
    conflict_resolution: 'weighted',
    fallback_action: 'alert',
    alert_level: 'medium',
    enabled: true,
    tags: ['yield', 'capacity', 'quality', 'lithium-specific'],
    dynamicConfig: {
      contextVariables: ['yield_rate', 'defect_trend', 'material_quality'],
      calculationFormula: 'nominal_capacity * yield_rate * (1 - defect_trend_penalty)',
      updateFrequency: 'hourly'
    }
  },
  {
    constraint_id: 'minimize_changeover',
    name: '最小化换型次数',
    description: '在满足交期的前提下，减少设备换线次数，LFP/NCM切换需要清洗和参数重置',
    category: 'resource',
    type: 'soft',
    nature: 'static',
    expression: 'minimize(changeover_count)',
    operator: 'minimize',
    target_field: 'changeover_count',
    applies_to: ['ProductionLine', 'WorkCenter', 'Schedule'],
    scope: 'workflow',
    priority: 6,
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-03-18T11:20:00Z',
    author: '生产部',
    version: '1.5.0',
    weight: 0.7,
    conflict_resolution: 'weighted',
    fallback_action: 'alert',
    alert_level: 'low',
    enabled: true,
    tags: ['changeover', 'optimization', 'efficiency']
  },
  {
    constraint_id: 'changeover_cleaning',
    name: '换型清洗时间',
    description: 'LFP/NCM切换时必须完成产线清洗，防止材料交叉污染',
    category: 'resource',
    type: 'hard',
    nature: 'conditional',
    expression: 'cleaning_time >= required_cleaning_time',
    operator: '>=',
    target_field: 'cleaning_time',
    applies_to: ['ProductionLine', 'WorkCenter', 'ChangeoverTask'],
    scope: 'workflow',
    priority: 8,
    created_at: '2024-03-25T13:00:00Z',
    updated_at: '2024-03-25T13:00:00Z',
    author: '工艺部',
    version: '1.0.0',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['changeover', 'cleaning', 'lithium-specific', 'contamination'],
    conditionalRules: [
      {
        condition: 'from_product == "LFP" && to_product == "NCM"',
        threshold: 6,
        priority: 9,
        description: 'LFP转NCM：6小时清洗（磷酸铁锂残留影响三元性能）'
      },
      {
        condition: 'from_product == "NCM" && to_product == "LFP"',
        threshold: 8,
        priority: 9,
        description: 'NCM转LFP：8小时清洗（镍钴锰残留影响磷酸铁锂安全性）'
      },
      {
        condition: 'from_product_type == to_product_type',
        threshold: 2,
        priority: 5,
        description: '同类型切换：2小时常规清洗'
      }
    ]
  },
  {
    constraint_id: 'main_material_kitting',
    name: '主材齐套检查',
    description: '正极/负极/电解液/隔膜必须齐套才能开工，任一缺料都无法生产',
    category: 'resource',
    type: 'hard',
    nature: 'dynamic',
    expression: 'cathode_qty >= required AND anode_qty >= required AND electrolyte_qty >= required AND separator_qty >= required',
    operator: '>=',
    target_field: 'material_availability',
    applies_to: ['WorkOrder', 'Material', 'Inventory'],
    scope: 'workflow',
    priority: 10,
    created_at: '2024-03-25T14:00:00Z',
    updated_at: '2024-03-25T14:00:00Z',
    author: '供应链',
    version: '1.0.0',
    severity: 'critical',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'critical',
    enabled: true,
    tags: ['material', 'kitting', 'lithium-specific', 'main-material'],
    dynamicConfig: {
      contextVariables: ['cathode_stock', 'anode_stock', 'electrolyte_stock', 'separator_stock', 'safety_stock_level'],
      calculationFormula: 'min(cathode_ratio, anode_ratio, electrolyte_ratio, separator_ratio) >= 1.0',
      updateFrequency: 'hourly'
    }
  },
  {
    constraint_id: 'safety_stock',
    name: '安全库存',
    description: '原材料库存不得低于安全库存水平，按物料ABC分类设置不同策略',
    category: 'resource',
    type: 'hard',
    nature: 'conditional',
    expression: 'stock_level >= calculated_safety_level',
    operator: '>=',
    target_field: 'stock_level',
    applies_to: ['Material', 'Inventory', 'Warehouse'],
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
    enabled: true,
    tags: ['inventory', 'stock', 'safety'],
    conditionalRules: [
      {
        condition: 'material_class == "A" && demand_variance > 0.3',
        threshold: 'avg_demand * 2.0',
        priority: 9,
        description: 'A类物料高波动：安全库存为平均需求2倍'
      },
      {
        condition: 'material_class == "A" && supplier_lead_time > 7',
        threshold: 'avg_demand * 2.5',
        priority: 9,
        description: 'A类物料长提前期：安全库存为平均需求2.5倍'
      },
      {
        condition: 'material_class == "B"',
        threshold: 'avg_demand * 1.5',
        priority: 7,
        description: 'B类物料：安全库存为平均需求1.5倍'
      },
      {
        condition: 'material_class == "C"',
        threshold: 'avg_demand * 1.0',
        priority: 5,
        description: 'C类物料：安全库存为平均需求1倍'
      }
    ]
  },

  // ==================== 工艺约束 ====================
  {
    constraint_id: 'composite_priority',
    name: '订单优先级权重',
    description: '基于客户等级、合同罚款条款、战略重要性的复合优先级，如特斯拉/比亚迪/蔚来权重不同',
    category: 'process',
    type: 'soft',
    nature: 'dynamic',
    expression: 'composite_priority_score >= threshold',
    operator: '>=',
    target_field: 'composite_priority_score',
    applies_to: ['SalesOrder', 'WorkOrder', 'ProductionPlan'],
    scope: 'workflow',
    priority: 8,
    created_at: '2024-03-25T10:30:00Z',
    updated_at: '2024-03-25T10:30:00Z',
    author: '销售部',
    version: '1.0.0',
    severity: 'high',
    conflict_resolution: 'weighted',
    fallback_action: 'adjust',
    alert_level: 'low',
    enabled: true,
    tags: ['priority', 'customer', 'strategy'],
    dynamicConfig: {
      contextVariables: ['customer_level', 'penalty_clause', 'strategic_score', 'order_profit', 'contract_type'],
      calculationFormula: 'customer_weight * customer_level + penalty_weight * penalty_score + strategic_weight * strategic_score + profit_weight * profit_score',
      updateFrequency: 'realtime'
    }
  },
  {
    constraint_id: 'process_sequence',
    name: '工艺顺序约束',
    description: '电池生产必须遵循：搅拌→涂布→辊压→分切→卷绕→装配→注液→化成→分容→OCV测试',
    category: 'process',
    type: 'hard',
    nature: 'static',
    expression: 'process_sequence == standard_sequence',
    operator: '==',
    target_field: 'process_sequence',
    applies_to: ['ProcessRoute', 'WorkOrder', 'WorkInProcess'],
    scope: 'workflow',
    priority: 10,
    created_at: '2024-03-25T15:00:00Z',
    updated_at: '2024-03-25T15:00:00Z',
    author: '工艺部',
    version: '1.0.0',
    severity: 'critical',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'critical',
    enabled: true,
    tags: ['process', 'sequence', 'lithium-specific', 'routing']
  },

  // ==================== 质量约束 ====================
  {
    constraint_id: 'quality_inspection',
    name: '质检合格率',
    description: '产品质检合格率必须达到98.5%以上，低于此值需停产排查',
    category: 'quality',
    type: 'hard',
    nature: 'static',
    expression: 'quality_rate >= 0.985',
    operator: '>=',
    target_field: 'quality_rate',
    threshold: 0.985,
    applies_to: ['WorkOrder', 'Product', 'QualityRecord'],
    scope: 'workflow',
    priority: 9,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-03-10T16:20:00Z',
    author: '质量部',
    version: '1.2.0',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['quality', 'inspection', 'yield', 'lithium-specific']
  },
  {
    constraint_id: 'humidity_control',
    name: '注液车间湿度控制',
    description: '注液工序环境湿度必须低于10%RH，防止电解液吸湿影响电池性能',
    category: 'quality',
    type: 'hard',
    nature: 'dynamic',
    expression: 'humidity <= 10',
    operator: '<=',
    target_field: 'humidity',
    threshold: 10,
    applies_to: ['Workshop', 'ProcessStep', 'Equipment'],
    scope: 'entity',
    priority: 9,
    created_at: '2024-03-25T16:00:00Z',
    updated_at: '2024-03-25T16:00:00Z',
    author: '质量部',
    version: '1.0.0',
    severity: 'high',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'high',
    enabled: true,
    tags: ['humidity', 'electrolyte', 'lithium-specific', 'environment'],
    dynamicConfig: {
      contextVariables: ['season', 'weather', 'dehumidifier_status', 'outdoor_humidity'],
      calculationFormula: 'base_humidity_limit * season_factor * (dehumidifier_efficiency / 100)',
      updateFrequency: 'hourly'
    }
  },
  {
    constraint_id: 'incoming_qc_time',
    name: '来料检验周期',
    description: '主材来料必须经过IQC检验，周期2-4小时，合格后才能入库',
    category: 'quality',
    type: 'hard',
    nature: 'conditional',
    expression: 'iqc_duration >= required_time',
    operator: '>=',
    target_field: 'iqc_duration',
    applies_to: ['Material', 'IncomingQC', 'Inventory'],
    scope: 'workflow',
    priority: 7,
    created_at: '2024-03-25T17:00:00Z',
    updated_at: '2024-03-25T17:00:00Z',
    author: '质量部',
    version: '1.0.0',
    severity: 'medium',
    conflict_resolution: 'priority',
    fallback_action: 'alert',
    alert_level: 'medium',
    enabled: true,
    tags: ['iqc', 'incoming', 'material', 'inspection'],
    conditionalRules: [
      {
        condition: 'material_type == "cathode" || material_type == "anode"',
        threshold: 4,
        priority: 8,
        description: '正负极材料：4小时检验（关键性能指标多）'
      },
      {
        condition: 'material_type == "electrolyte"',
        threshold: 2,
        priority: 8,
        description: '电解液：2小时检验（注意密封性检测）'
      },
      {
        condition: 'material_type == "separator"',
        threshold: 3,
        priority: 7,
        description: '隔膜：3小时检验（透气性、厚度）'
      }
    ]
  },

  // ==================== 安全约束 ====================
  {
    constraint_id: 'safety_temperature',
    name: '设备温度上限',
    description: '设备运行温度不得超过安全阈值，热压、化成、分容工序需特别注意',
    category: 'safety',
    type: 'hard',
    nature: 'dynamic',
    expression: 'temperature <= dynamic_temp_limit',
    operator: '<=',
    target_field: 'temperature',
    applies_to: ['Equipment', 'WorkCenter', 'ProcessStep'],
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
    tags: ['temperature', 'safety', 'thermal-runaway', 'lithium-specific'],
    dynamicConfig: {
      contextVariables: ['ambient_temperature', 'equipment_age', 'cooling_efficiency', 'process_type'],
      calculationFormula: 'base_temp_limit - (ambient_temp - 25) * 0.5 - equipment_age * 0.2 - process_risk_factor',
      updateFrequency: 'realtime'
    }
  },
  {
    constraint_id: 'cell_voltage_limit',
    name: '单体电压安全范围',
    description: '锂电池单体电压必须控制在2.5V-4.2V（LFP）或3.0V-4.35V（NCM）',
    category: 'safety',
    type: 'hard',
    nature: 'conditional',
    expression: 'cell_voltage >= min_voltage AND cell_voltage <= max_voltage',
    operator: '>=',
    target_field: 'cell_voltage',
    applies_to: ['Product', 'WorkInProcess', 'BatteryCell'],
    scope: 'entity',
    priority: 10,
    created_at: '2024-03-25T18:00:00Z',
    updated_at: '2024-03-25T18:00:00Z',
    author: '安全部',
    version: '1.0.0',
    severity: 'critical',
    conflict_resolution: 'abort',
    fallback_action: 'block',
    alert_level: 'critical',
    enabled: true,
    tags: ['voltage', 'safety', 'cell', 'lithium-specific'],
    conditionalRules: [
      {
        condition: 'chemistry == "LFP"',
        threshold: '2.5-4.2',
        priority: 10,
        description: '磷酸铁锂：2.5V-4.2V'
      },
      {
        condition: 'chemistry == "NCM"',
        threshold: '3.0-4.35',
        priority: 10,
        description: '三元锂：3.0V-4.35V'
      }
    ]
  },

  // ==================== 成本约束 ====================
  {
    constraint_id: 'manufacturing_cost_limit',
    name: '单位制造成本上限',
    description: '单位电池制造成本不得超过预算上限，影响毛利',
    category: 'cost',
    type: 'soft',
    nature: 'dynamic',
    expression: 'unit_cost <= cost_budget',
    operator: '<=',
    target_field: 'unit_cost',
    applies_to: ['Product', 'WorkOrder', 'CostCenter'],
    scope: 'workflow',
    priority: 6,
    created_at: '2024-03-25T19:00:00Z',
    updated_at: '2024-03-25T19:00:00Z',
    author: '财务部',
    version: '1.0.0',
    severity: 'medium',
    conflict_resolution: 'weighted',
    fallback_action: 'alert',
    alert_level: 'medium',
    enabled: true,
    tags: ['cost', 'manufacturing', 'budget', 'margin'],
    dynamicConfig: {
      contextVariables: ['material_cost', 'labor_cost', 'overhead_cost', 'yield_rate', 'energy_cost'],
      calculationFormula: '(material_cost + labor_cost + overhead_cost + energy_cost) / yield_rate',
      updateFrequency: 'daily'
    }
  }
];

// 根据类型过滤约束
export const getConstraintsByType = (type: ConstraintType): Constraint[] => {
  return constraintLibrary.filter(c => c.type === type);
};

// 根据分类过滤约束
export const getConstraintsByCategory = (category: ConstraintCategory): Constraint[] => {
  return constraintLibrary.filter(c => c.category === category);
};

// 根据适用对象过滤约束
export const getConstraintsByAppliesTo = (entityType: string): Constraint[] => {
  return constraintLibrary.filter(c => c.applies_to.includes(entityType));
};

// 根据标签过滤约束
export const getConstraintsByTag = (tag: string): Constraint[] => {
  return constraintLibrary.filter(c => c.tags.includes(tag));
};

// 获取锂电特有约束
export const getLithiumSpecificConstraints = (): Constraint[] => {
  return constraintLibrary.filter(c => c.tags.includes('lithium-specific'));
};

// 空约束模板
export const createEmptyConstraint = (): Constraint => ({
  constraint_id: `constraint_${Date.now()}`,
  name: '',
  description: '',
  category: 'time',
  type: 'hard',
  nature: 'static',
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
});

// 智能体与约束的推荐映射
export const agentConstraintMapping: Record<string, string[]> = {
  'agent_demand_forecast': ['delivery_deadline', 'lead_time_by_quantity', 'composite_priority'],
  'agent_scheduling_opt': [
    'equipment_capacity',
    'minimize_changeover',
    'changeover_cleaning',
    'formation_rest_time',
    'yield_adjusted_capacity',
    'main_material_kitting',
    'delivery_deadline'
  ],
  'agent_quality_detect': ['quality_inspection', 'humidity_control', 'safety_temperature', 'cell_voltage_limit'],
  'agent_capacity_forecast': [
    'equipment_capacity',
    'yield_adjusted_capacity',
    'changeover_cleaning',
    'formation_rest_time',
    'process_sequence'
  ],
  'agent_cost_opt': ['manufacturing_cost_limit', 'yield_adjusted_capacity', 'minimize_changeover']
};

// 技能与约束的推荐映射
export const skillConstraintMapping: Record<string, string[]> = {
  'demand_forecast_v3': ['delivery_deadline', 'lead_time_by_quantity', 'composite_priority'],
  'scheduling_opt_v2': [
    'equipment_capacity',
    'minimize_changeover',
    'changeover_cleaning',
    'formation_rest_time',
    'main_material_kitting'
  ],
  'quality_detect_v1': ['quality_inspection', 'humidity_control', 'incoming_qc_time'],
  'ts_analysis_v2': ['yield_adjusted_capacity', 'equipment_capacity'],
  'calculate_baseline': ['equipment_capacity', 'yield_adjusted_capacity'],
  'forecast_capacity': ['equipment_capacity', 'changeover_cleaning', 'formation_rest_time'],
  'check_constraints': [
    'delivery_deadline',
    'equipment_capacity',
    'main_material_kitting',
    'quality_inspection'
  ]
};
