/**
 * 本体配置器 - JSON Schema 类型定义
 * 用于：下拉框 / 表单校验 / Schema驱动UI / 低代码构建器
 *
 * 工业级 Schema 强约束 - 所有类型枚举化，不允许自由输入
 */

// ============================================
// 1. 实体类型枚举（完整枚举）
// ============================================
export const EntityTypeEnum = [
  // 核心实体类型
  'Object',           // 具体对象：设备、订单
  'Actor',            // 行为主体：操作员、系统
  'Organization',     // 组织：工厂、车间
  'Location',         // 空间：仓库、产线位置

  // 资源类实体
  'PhysicalResource', // 物理资源：设备、产线
  'Material',         // 物料：电芯、原料
  'Energy',           // 能源：电力、气体
  'Tool',             // 工具：模具

  // 业务对象
  'Order',            // 业务单据：生产订单
  'Plan',             // 计划：排产计划
  'Task',             // 任务：工序任务
  'Batch',            // 批次：批量生产

  // 时间与状态
  'Event',            // 事件：开工、停机
  'State',            // 状态：运行中、故障
  'TimeWindow',       // 时间窗口：排产时间段

  // 抽象/语义实体
  'Metric',           // 指标：良率、OEE
  'Rule',             // 规则
  'Scenario',         // 场景：仿真输入
  'Constraint',       // 约束实体
] as const;

export type EntityType = typeof EntityTypeEnum[number];

// ============================================
// 2. 属性类型枚举（完整枚举）
// ============================================
export const AttributeTypeEnum = [
  // 基础数据类型
  'string',        // 字符串
  'int',           // 整数
  'float',         // 浮点数
  'boolean',       // 布尔值

  // 数值增强类型
  'decimal',       // 高精度
  'percentage',    // 百分比
  'currency',      // 金额

  // 时间类型
  'datetime',      // 日期时间
  'duration',      // 持续时间
  'timestamp',     // 时间戳
  'interval',      // 时间区间

  // 枚举与分类
  'enum',          // 枚举
  'set',           // 多选集合
  'category',      // 分类

  // 引用类型
  'entity_ref',    // 指向实体

  // 结构化类型
  'object',        // JSON对象
  'array',         // 列表
  'map',           // 键值对

  // 工业扩展
  'unit_value',    // 带单位（kg/kWh）
  'time_series',   // 时序数据
  'distribution',  // 概率分布
  'vector',        // 向量（AI特征）
] as const;

export type AttributeType = typeof AttributeTypeEnum[number];

// ============================================
// 3. 关系类型枚举（完整枚举）
// ============================================
export const RelationTypeEnum = [
  // 结构关系
  'belongs_to',    // 从属关系
  'part_of',       // 组成关系
  'contains',      // 包含
  'hierarchy',     // 层级

  // 业务关系
  'assigned_to',   // 分配
  'produced_by',   // 生产
  'consumed_by',   // 消耗
  'depends_on',    // 依赖

  // 时序关系
  'precedes',      // 先后顺序
  'follows',       // 跟随
  'overlaps',      // 重叠
  'during',        // 在期间

  // 因果关系
  'causes',        // 导致
  'affects',       // 影响
  'drives',        // 驱动

  // 约束关系
  'restricts',     // 限制
  'bounds',        // 边界
  'excludes',      // 排斥

  // 数量关系
  'ratio',         // 比例
  'allocation',    // 分配比例
  'weighting',     // 权重
] as const;

export type RelationType = typeof RelationTypeEnum[number];

// ============================================
// 4. 约束类型与分类枚举
// ============================================
export const ConstraintTypeEnum = ['hard', 'soft', 'objective'] as const;
export type ConstraintType = typeof ConstraintTypeEnum[number];

export const ConstraintCategoryEnum = [
  'capacity',       // 产能约束
  'time',           // 时间约束
  'dependency',     // 依赖约束
  'resource',       // 资源约束
  'flow',           // 流量约束
  'optimization',   // 优化目标
  'statistical',    // 统计约束
  'temporal',       // 时态约束（新增）
  'derived',        // 派生规则（新增）
] as const;

export type ConstraintCategory = typeof ConstraintCategoryEnum[number];

// ============================================
// 5. 基数枚举（标准化）
// ============================================
export const CardinalityEnum = ['1-1', '1-n', 'n-n'] as const;
export type Cardinality = typeof CardinalityEnum[number];

// ============================================
// 6. Action 类型枚举（状态变化事件）
// ============================================
export const ActionTypeEnum = [
  // 状态转换
  'state_transition',    // 状态转换
  'create',              // 创建
  'update',              // 更新
  'delete',              // 删除

  // 业务操作
  'assign',              // 分配
  'schedule',            // 排程
  'start',               // 开始
  'complete',            // 完成
  'cancel',              // 取消
  'hold',                // 暂停
  'resume',              // 恢复

  // 质量相关
  'inspect',             // 检验
  'reject',              // 拒收
  'rework',              // 返工
  'scrap',               // 报废

  // 物料相关
  'consume',             // 消耗
  'produce',             // 产出
  'transfer',            // 转移
  'receive',             // 接收
  'ship',                // 发货
] as const;

export type ActionType = typeof ActionTypeEnum[number];

// ============================================
// 7. 时态约束类型枚举
// ============================================
export const TemporalConstraintTypeEnum = [
  // 时间窗口
  'time_window',         // 必须在时间窗口内
  'deadline',            // 截止时间
  'release_time',        // 最早开始时间

  // 持续时间
  'min_duration',        // 最短持续时间
  'max_duration',        // 最长持续时间
  'exact_duration',      // 精确持续时间

  // 时间间隔
  'min_gap',             // 最小间隔
  'max_gap',             // 最大间隔
  'exact_gap',           // 精确间隔

  // 时序关系
  'before',              // 必须在...之前
  'after',               // 必须在...之后
  'meets',               // 紧接着（无间隔）
  'overlaps_with',       // 必须重叠
  'contains',            // 包含关系

  // 周期性
  'periodic',            // 周期性约束
  'recurring',           // 重复约束
] as const;

export type TemporalConstraintType = typeof TemporalConstraintTypeEnum[number];

// ============================================
// 8. 派生规则类型枚举
// ============================================
export const DerivedRuleTypeEnum = [
  // 派生属性
  'calculated_property', // 计算属性（如 OEE = 实际/理论）
  'aggregated_property', // 聚合属性（如总产量 = SUM(批次产量)）
  'inferred_property',   // 推断属性（基于规则推理）

  // 派生关系
  'transitive_link',     // 传递关系（如 A->B, B->C => A->C）
  'inferred_link',       // 推断关系（基于规则生成）

  // 触发规则
  'event_trigger',       // 事件触发器
  'condition_action',    // 条件-动作规则
] as const;

export type DerivedRuleType = typeof DerivedRuleTypeEnum[number];

// ============================================
// 6. Schema 类型定义（用于 TypeScript）
// ============================================

export interface Attribute {
  name: string;
  type: AttributeType;
  required?: boolean;
  unit?: string;
  enum_values?: string[];
  semantic?: string;  // 语义标签：resource_capacity, time_point 等
}

export interface Entity {
  name: string;
  type: EntityType;
  attributes: Attribute[];
}

export interface Relation {
  name: string;
  type: RelationType;
  from: string;
  to: string;
  cardinality: Cardinality;
  properties?: {
    weight?: number;
    priority?: number;
    confidence?: number;
  };
}

export interface Constraint {
  name: string;
  type: ConstraintType;
  category: ConstraintCategory;
  expression: string;  // DSL 表达式
  priority?: number;
  enabled?: boolean;
}

// ============================================
// 9. 时态约束接口
// ============================================
export interface TemporalConstraint {
  id: string;
  name: string;
  type: TemporalConstraintType;
  targetEntity: string;        // 目标实体ID
  referenceEntity?: string;    // 参考实体ID（用于相对时间约束）

  // 时间参数
  timeParameters: {
    duration?: number;         // 持续时间（分钟）
    minDuration?: number;
    maxDuration?: number;
    gap?: number;              // 间隔时间
    minGap?: number;
    maxGap?: number;
    timeWindow?: {
      start: string;           // ISO 时间或相对时间表达式
      end: string;
    };
    periodic?: {
      interval: number;        // 周期间隔
      unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
    };
  };

  // 业务规则
  businessRule?: string;       // 自然语言描述
  violationAction?: 'block' | 'warn' | 'auto_adjust' | 'notify';
  enabled: boolean;
}

// ============================================
// 10. 派生属性接口
// ============================================
export interface DerivedProperty {
  id: string;
  name: string;
  entityId: string;            // 所属实体
  type: DerivedRuleType;

  // 计算定义
  calculation: {
    formula: string;           // 计算公式（DSL）
    dependencies: string[];    // 依赖的属性ID列表
    aggregation?: {
      function: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT' | 'STDEV';
      targetEntity: string;    // 聚合目标实体
      filter?: string;         // 过滤条件
      groupBy?: string[];      // 分组字段
    };
    inferenceRule?: {          // 推理规则
      conditions: string[];    // 条件表达式
      conclusion: string;      // 结论
      confidence: number;      // 置信度 0-1
    };
  };

  // 刷新策略
  refreshStrategy: {
    mode: 'realtime' | 'on_demand' | 'scheduled';
    cron?: string;             // 定时表达式
    eventTriggers?: string[];  // 触发事件列表
  };

  // 输出定义
  output: {
    dataType: AttributeType;
    unit?: string;
    format?: string;
    validation?: string;       // 验证规则
  };

  enabled: boolean;
}

// ============================================
// 11. 派生关系接口
// ============================================
export interface DerivedLink {
  id: string;
  name: string;
  type: RelationType;
  sourceEntity: string;
  targetEntity: string;

  derivation: {
    type: DerivedRuleType;
    // 传递闭包规则
    transitiveRule?: {
      intermediateEntity: string;
      intermediateRelation: string;
    };
    // 推断规则
    inferenceRule?: {
      conditions: string[];
      confidence: number;
    };
    // 聚合规则
    aggregationRule?: {
      sourceRelation: string;
      aggregateFunction: 'ANY' | 'ALL' | 'MOST';
    };
  };

  // 有效时间
  validTime?: {
    start: string;
    end?: string;
  };

  enabled: boolean;
}

// ============================================
// 12. Action 定义接口
// ============================================
export interface ActionDefinition {
  id: string;
  name: string;
  type: ActionType;

  // 触发条件
  trigger: {
    mode: 'manual' | 'automatic' | 'scheduled' | 'event_driven';
    conditions?: string[];     // 触发条件表达式
    cron?: string;             // 定时触发
    eventTypes?: string[];     // 监听的事件类型
  };

  // 前置条件
  preconditions: {
    expressions: string[];     // 必须满足的条件
    failureAction: 'block' | 'warn' | 'log';
  };

  // 状态转换定义
  stateTransition?: {
    fromState: string;
    toState: string;
    entityType: string;
  };

  // 执行操作
  operations: {
    type: 'update_property' | 'create_link' | 'delete_link' | 'create_entity' | 'call_service' | 'emit_event';
    target: string;            // 操作目标
    parameters: Record<string, any>;
    order: number;             // 执行顺序
  }[];

  // 后置效果
  postEffects: {
    propertyUpdates?: {
      propertyId: string;
      valueExpression: string;
    }[];
    eventsToEmit?: {
      eventType: string;
      payload: Record<string, any>;
    }[];
  };

  // 补偿操作（用于回滚）
  compensation?: {
    condition: string;         // 补偿触发条件
    operations: string[];      // 补偿操作
  };

  enabled: boolean;
}

// ============================================
// 13. 完整的 Schema 定义
// ============================================
export interface OntologySchema {
  entities: Entity[];
  relations: Relation[];
  constraints: Constraint[];
  temporalConstraints?: TemporalConstraint[];  // 时态约束
  derivedProperties?: DerivedProperty[];       // 派生属性
  derivedLinks?: DerivedLink[];                // 派生关系
  actions?: ActionDefinition[];                // Action 定义
}

// ============================================
// 7. 属性语义标签（用于模板引擎）
// ============================================
export const AttributeSemanticLabels = {
  // 资源相关
  RESOURCE_CAPACITY: 'resource_capacity',
  RESOURCE_QUANTITY: 'resource_quantity',
  RESOURCE_USAGE: 'resource_usage',

  // 时间相关
  TIME_START: 'time_start',
  TIME_END: 'time_end',
  TIME_DURATION: 'time_duration',
  TIME_POINT: 'time_point',

  // 业务相关
  ORDER_QUANTITY: 'order_quantity',
  ORDER_PRIORITY: 'order_priority',

  // 质量相关
  QUALITY_METRIC: 'quality_metric',
  QUALITY_THRESHOLD: 'quality_threshold',
} as const;

export type AttributeSemantic = typeof AttributeSemanticLabels[keyof typeof AttributeSemanticLabels];

// ============================================
// 8. UI 选择器数据（保持与现有代码兼容）
// ============================================

export const ENTITY_TYPE_OPTIONS = [
  {
    category: '核心实体',
    options: [
      { value: 'Object', label: 'Object (对象)', desc: '具体对象：设备、订单' },
      { value: 'Actor', label: 'Actor (行为主体)', desc: '操作员、系统' },
      { value: 'Organization', label: 'Organization (组织)', desc: '工厂、车间' },
      { value: 'Location', label: 'Location (空间)', desc: '仓库、产线位置' },
    ],
  },
  {
    category: '资源类实体',
    options: [
      { value: 'PhysicalResource', label: 'PhysicalResource (物理资源)', desc: '设备、产线' },
      { value: 'Material', label: 'Material (物料)', desc: '电芯、原料' },
      { value: 'Energy', label: 'Energy (能源)', desc: '电力、气体' },
      { value: 'Tool', label: 'Tool (工具)', desc: '模具' },
    ],
  },
  {
    category: '业务对象',
    options: [
      { value: 'Order', label: 'Order (业务单据)', desc: '生产订单' },
      { value: 'Plan', label: 'Plan (计划)', desc: '排产计划' },
      { value: 'Task', label: 'Task (任务)', desc: '工序任务' },
      { value: 'Batch', label: 'Batch (批次)', desc: '批量生产' },
    ],
  },
  {
    category: '时间与状态',
    options: [
      { value: 'Event', label: 'Event (事件)', desc: '开工、停机' },
      { value: 'State', label: 'State (状态)', desc: '运行中、故障' },
      { value: 'TimeWindow', label: 'TimeWindow (时间窗口)', desc: '排产时间段' },
    ],
  },
  {
    category: '抽象/语义实体',
    options: [
      { value: 'Metric', label: 'Metric (指标)', desc: '良率、OEE' },
      { value: 'Rule', label: 'Rule (规则)', desc: '业务规则' },
      { value: 'Scenario', label: 'Scenario (场景)', desc: '仿真输入' },
      { value: 'Constraint', label: 'Constraint (约束)', desc: '约束实体' },
    ],
  },
];

export const ATTRIBUTE_TYPE_OPTIONS = [
  {
    category: '基础数据类型',
    options: [
      { value: 'string', label: 'string (字符串)', desc: '文本' },
      { value: 'int', label: 'int (整数)', desc: '整数' },
      { value: 'float', label: 'float (浮点数)', desc: '浮点数' },
      { value: 'boolean', label: 'boolean (布尔)', desc: '是/否' },
    ],
  },
  {
    category: '数值增强类型',
    options: [
      { value: 'decimal', label: 'decimal (高精度)', desc: '高精度数值' },
      { value: 'percentage', label: 'percentage (百分比)', desc: '百分比' },
      { value: 'currency', label: 'currency (金额)', desc: '货币金额' },
    ],
  },
  {
    category: '时间类型',
    options: [
      { value: 'datetime', label: 'datetime (日期时间)', desc: '时间点' },
      { value: 'duration', label: 'duration (持续时间)', desc: '时长' },
      { value: 'timestamp', label: 'timestamp (时间戳)', desc: 'Unix时间戳' },
      { value: 'interval', label: 'interval (时间区间)', desc: '时间段' },
    ],
  },
  {
    category: '枚举与分类',
    options: [
      { value: 'enum', label: 'enum (枚举)', desc: '枚举值' },
      { value: 'set', label: 'set (集合)', desc: '多选集合' },
      { value: 'category', label: 'category (分类)', desc: '分类标签' },
    ],
  },
  {
    category: '引用类型',
    options: [
      { value: 'entity_ref', label: 'entity_ref (实体引用)', desc: '指向实体' },
    ],
  },
  {
    category: '结构化类型',
    options: [
      { value: 'object', label: 'object (对象)', desc: 'JSON对象' },
      { value: 'array', label: 'array (数组)', desc: '列表' },
      { value: 'map', label: 'map (映射)', desc: '键值对' },
    ],
  },
  {
    category: '工业扩展',
    options: [
      { value: 'unit_value', label: 'unit_value (带单位值)', desc: 'kg/kWh等' },
      { value: 'time_series', label: 'time_series (时序数据)', desc: '时间序列' },
      { value: 'distribution', label: 'distribution (分布)', desc: '概率分布' },
      { value: 'vector', label: 'vector (向量)', desc: 'AI特征向量' },
    ],
  },
];

export const RELATION_TYPE_OPTIONS = [
  {
    category: '结构关系',
    options: [
      { value: 'belongs_to', label: 'belongs_to (从属)', desc: '从属关系' },
      { value: 'part_of', label: 'part_of (组成)', desc: '组成关系' },
      { value: 'contains', label: 'contains (包含)', desc: '包含关系' },
      { value: 'hierarchy', label: 'hierarchy (层级)', desc: '层级关系' },
    ],
  },
  {
    category: '业务关系',
    options: [
      { value: 'assigned_to', label: 'assigned_to (分配)', desc: '分配至' },
      { value: 'produced_by', label: 'produced_by (生产)', desc: '被生产' },
      { value: 'consumed_by', label: 'consumed_by (消耗)', desc: '被消耗' },
      { value: 'depends_on', label: 'depends_on (依赖)', desc: '依赖' },
    ],
  },
  {
    category: '时序关系',
    options: [
      { value: 'precedes', label: 'precedes (先于)', desc: '先后顺序' },
      { value: 'follows', label: 'follows (跟随)', desc: '跟随' },
      { value: 'overlaps', label: 'overlaps (重叠)', desc: '重叠' },
      { value: 'during', label: 'during (期间)', desc: '在期间' },
    ],
  },
  {
    category: '因果关系',
    options: [
      { value: 'causes', label: 'causes (导致)', desc: '导致' },
      { value: 'affects', label: 'affects (影响)', desc: '影响' },
      { value: 'drives', label: 'drives (驱动)', desc: '驱动' },
    ],
  },
  {
    category: '约束关系',
    options: [
      { value: 'restricts', label: 'restricts (限制)', desc: '限制' },
      { value: 'bounds', label: 'bounds (边界)', desc: '边界' },
      { value: 'excludes', label: 'excludes (排斥)', desc: '排斥' },
    ],
  },
  {
    category: '数量关系',
    options: [
      { value: 'ratio', label: 'ratio (比例)', desc: '比例' },
      { value: 'allocation', label: 'allocation (分配比例)', desc: '分配比例' },
      { value: 'weighting', label: 'weighting (权重)', desc: '权重' },
    ],
  },
];

export const CONSTRAINT_TYPE_OPTIONS = [
  { value: 'hard', label: 'hard (硬约束)', desc: '必须满足' },
  { value: 'soft', label: 'soft (软约束)', desc: '尽量满足' },
  { value: 'objective', label: 'objective (优化目标)', desc: '最大化/最小化' },
];

export const CONSTRAINT_CATEGORY_OPTIONS = [
  { value: 'capacity', label: 'capacity (产能约束)', desc: '产能限制' },
  { value: 'time', label: 'time (时间约束)', desc: '时间顺序' },
  { value: 'dependency', label: 'dependency (依赖约束)', desc: '任务依赖' },
  { value: 'resource', label: 'resource (资源约束)', desc: '资源限制' },
  { value: 'flow', label: 'flow (流量约束)', desc: '物料流量' },
  { value: 'optimization', label: 'optimization (优化目标)', desc: '优化方向' },
  { value: 'statistical', label: 'statistical (统计约束)', desc: '统计指标' },
  { value: 'temporal', label: 'temporal (时态约束)', desc: '时间窗口/时序' },
  { value: 'derived', label: 'derived (派生规则)', desc: '计算/推断规则' },
];

// ============================================
// 14. UI 选择器 - Action 类型
// ============================================
export const ACTION_TYPE_OPTIONS = [
  {
    category: '生命周期',
    options: [
      { value: 'create', label: 'create (创建)', desc: '创建新实体' },
      { value: 'update', label: 'update (更新)', desc: '更新属性' },
      { value: 'delete', label: 'delete (删除)', desc: '删除实体' },
      { value: 'state_transition', label: 'state_transition (状态转换)', desc: '状态变更' },
    ],
  },
  {
    category: '业务操作',
    options: [
      { value: 'assign', label: 'assign (分配)', desc: '分配资源/任务' },
      { value: 'schedule', label: 'schedule (排程)', desc: '安排计划' },
      { value: 'start', label: 'start (开始)', desc: '开始执行' },
      { value: 'complete', label: 'complete (完成)', desc: '标记完成' },
      { value: 'cancel', label: 'cancel (取消)', desc: '取消操作' },
      { value: 'hold', label: 'hold (暂停)', desc: '暂停执行' },
      { value: 'resume', label: 'resume (恢复)', desc: '恢复执行' },
    ],
  },
  {
    category: '质量管理',
    options: [
      { value: 'inspect', label: 'inspect (检验)', desc: '质量检验' },
      { value: 'reject', label: 'reject (拒收)', desc: '拒收不合格品' },
      { value: 'rework', label: 'rework (返工)', desc: '返工处理' },
      { value: 'scrap', label: 'scrap (报废)', desc: '报废处理' },
    ],
  },
  {
    category: '物料管理',
    options: [
      { value: 'consume', label: 'consume (消耗)', desc: '物料消耗' },
      { value: 'produce', label: 'produce (产出)', desc: '产品产出' },
      { value: 'transfer', label: 'transfer (转移)', desc: '物料转移' },
      { value: 'receive', label: 'receive (接收)', desc: '物料接收' },
      { value: 'ship', label: 'ship (发货)', desc: '产品发货' },
    ],
  },
];

// ============================================
// 15. UI 选择器 - 时态约束类型
// ============================================
export const TEMPORAL_CONSTRAINT_OPTIONS = [
  {
    category: '时间窗口',
    options: [
      { value: 'time_window', label: 'time_window (时间窗口)', desc: '必须在指定时间窗口内' },
      { value: 'deadline', label: 'deadline (截止时间)', desc: '必须在截止时间前完成' },
      { value: 'release_time', label: 'release_time (释放时间)', desc: '最早开始时间' },
    ],
  },
  {
    category: '持续时间',
    options: [
      { value: 'min_duration', label: 'min_duration (最短持续)', desc: '最短持续时间' },
      { value: 'max_duration', label: 'max_duration (最长持续)', desc: '最长持续时间' },
      { value: 'exact_duration', label: 'exact_duration (精确持续)', desc: '精确持续时间' },
    ],
  },
  {
    category: '时间间隔',
    options: [
      { value: 'min_gap', label: 'min_gap (最小间隔)', desc: '两任务间最小间隔' },
      { value: 'max_gap', label: 'max_gap (最大间隔)', desc: '两任务间最大间隔' },
      { value: 'exact_gap', label: 'exact_gap (精确间隔)', desc: '两任务间精确间隔' },
    ],
  },
  {
    category: '时序关系',
    options: [
      { value: 'before', label: 'before (在之前)', desc: '必须在参考时间之前' },
      { value: 'after', label: 'after (在之后)', desc: '必须在参考时间之后' },
      { value: 'meets', label: 'meets (紧接着)', desc: '无间隔紧接着' },
      { value: 'overlaps_with', label: 'overlaps_with (重叠)', desc: '必须重叠' },
      { value: 'contains', label: 'contains (包含)', desc: '时间包含关系' },
    ],
  },
  {
    category: '周期性',
    options: [
      { value: 'periodic', label: 'periodic (周期性)', desc: '周期性约束' },
      { value: 'recurring', label: 'recurring (重复)', desc: '重复约束' },
    ],
  },
];

// ============================================
// 16. UI 选择器 - 派生规则类型
// ============================================
export const DERIVED_RULE_OPTIONS = [
  {
    category: '派生属性',
    options: [
      { value: 'calculated_property', label: 'calculated_property (计算属性)', desc: '基于公式计算（如 OEE）' },
      { value: 'aggregated_property', label: 'aggregated_property (聚合属性)', desc: '聚合计算（如总产量）' },
      { value: 'inferred_property', label: 'inferred_property (推断属性)', desc: '基于规则推理' },
    ],
  },
  {
    category: '派生关系',
    options: [
      { value: 'transitive_link', label: 'transitive_link (传递关系)', desc: '传递闭包（如 A→B→C ⇒ A→C）' },
      { value: 'inferred_link', label: 'inferred_link (推断关系)', desc: '基于规则生成关系' },
    ],
  },
  {
    category: '触发规则',
    options: [
      { value: 'event_trigger', label: 'event_trigger (事件触发)', desc: '事件驱动规则' },
      { value: 'condition_action', label: 'condition_action (条件动作)', desc: '条件-动作规则' },
    ],
  },
];

// ============================================
// 17. 数据库表结构定义 - 本体存储模型
// ============================================

/**
 * 1. 对象定义表 - ontology_objects
 * 存储本体的核心对象/实体定义
 */
export interface OntologyObject {
  id: string;                    // 主键，使用 BigSerial 对应 string
  name: string;                  // 对象名称
  description: string;           // 对象描述
  version: number;               // 版本号
  type: EntityType;              // 实体类型
  namespace?: string;            // 命名空间
  created_at: string;            // ISO 8601 时间戳
  updated_at: string;            // ISO 8601 时间戳
  created_by?: string;           // 创建者
  status: 'active' | 'deprecated' | 'draft';  // 对象状态
  parent_id?: string;            // 父对象ID，支持继承
  metadata?: Record<string, any>;
}

/**
 * 2. 属性定义表 - ontology_properties
 * 存储对象属性的元数据
 */
export interface OntologyProperty {
  id: string;                    // 主键
  object_id: string;             // 所属对象ID（外键）
  name: string;                  // 属性名
  type: AttributeType;           // 属性类型
  description?: string;          // 属性描述
  required: boolean;             // 是否必填
  default_value?: any;           // 默认值
  unit?: string;                 // 单位
  enum_values?: string[];        // 枚举值列表
  min_value?: number;            // 最小值（数值类型）
  max_value?: number;            // 最大值（数值类型）
  regex_pattern?: string;        // 正则验证模式
  semantic_tag?: string;         // 语义标签
  is_unique: boolean;            // 是否唯一
  is_indexed: boolean;           // 是否建立索引
  order: number;                 // 显示顺序
  created_at: string;
  updated_at: string;
}

/**
 * 3. 关系定义表 - ontology_relations
 * 存储对象之间的关系定义
 */
export interface OntologyRelation {
  id: string;                    // 主键
  source_object: string;         // 源对象ID（外键）
  target_object: string;         // 目标对象ID（外键）
  relation_type: RelationType;   // 关系类型
  name?: string;                 // 关系名称
  description?: string;          // 关系描述
  cardinality: Cardinality;      // 基数约束
  properties?: Record<string, any>;  // 关系属性
  is_directed: boolean;          // 是否有向
  weight?: number;               // 关系权重
  bidirectional_name?: string;   // 反向关系名称
  constraints?: string[];        // 约束条件ID列表
  created_at: string;
  updated_at: string;
}

/**
 * 4. 动作定义表 - ontology_actions
 * 存储可执行的动作/操作定义
 */
export interface OntologyAction {
  id: string;                    // 主键
  name: string;                  // 动作名称
  description?: string;          // 动作描述
  type: ActionType;              // 动作类型
  input_schema: Record<string, any>;   // 输入参数Schema (JSONB)
  output_schema: Record<string, any>;  // 输出参数Schema (JSONB)
  preconditions?: string[];      // 前置条件表达式
  postconditions?: string[];     // 后置条件表达式
  effects?: string[];            // 副作用描述
  target_objects?: string[];     // 适用目标对象类型
  required_permissions?: string[];  // 所需权限
  timeout?: number;              // 超时时间(毫秒)
  retry_policy?: {
    max_retries: number;
    backoff: 'fixed' | 'exponential';
    interval: number;
  };
  implementation?: {
    type: 'native' | 'service' | 'script';
    reference: string;           // 实现引用
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 5. 视图定义表 - ontology_views
 * 存储预定义的查询视图
 */
export interface OntologyView {
  id: string;                    // 主键
  name: string;                  // 视图名称
  description?: string;          // 视图描述
  query: string;                 // 查询语句/DSL
  query_type: 'sql' | 'cypher' | 'dsl' | 'graphql';  // 查询语言类型
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    default_value?: any;
  }>;                            // 查询参数定义
  result_schema?: Record<string, any>;  // 返回结果Schema
  source_objects?: string[];     // 涉及的对象类型
  refresh_mode: 'realtime' | 'manual' | 'scheduled';  // 刷新模式
  refresh_interval?: number;     // 刷新间隔(秒)
  cache_enabled: boolean;        // 是否启用缓存
  cache_ttl?: number;            // 缓存有效期(秒)
  access_control?: string[];     // 访问控制角色
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * 6. 版本管理表 - ontology_versions
 * 存储本体的版本历史
 */
export interface OntologyVersion {
  id: string;                    // 主键
  version_number: string;        // 语义化版本号 (如 1.2.0)
  name?: string;                 // 版本名称/标签
  description: string;           // 版本描述/变更说明
  status: 'draft' | 'published' | 'archived' | 'deprecated';
  based_on?: string;             // 基于哪个版本
  snapshot: {
    objects: OntologyObject[];   // 对象快照
    properties: OntologyProperty[];
    relations: OntologyRelation[];
    actions: OntologyAction[];
    views: OntologyView[];
  };                             // 完整快照
  change_summary: {
    added: string[];             // 新增项ID列表
    modified: string[];          // 修改项ID列表
    removed: string[];           // 删除项ID列表
  };
  published_at?: string;         // 发布时间
  published_by?: string;         // 发布者
  rollback_target?: boolean;     // 是否可作为回滚目标
  created_at: string;
}

/**
 * 7. 变更日志表 - ontology_change_log
 * 记录所有变更操作审计日志
 */
export interface OntologyChangeLog {
  id: string;                    // 主键
  version_id: string;            // 所属版本
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'ROLLBACK';
  entity_type: 'object' | 'property' | 'relation' | 'action' | 'view' | 'schema';
  entity_id: string;             // 被操作实体ID
  entity_name: string;           // 实体名称
  previous_state?: Record<string, any>;  // 变更前状态
  current_state?: Record<string, any>;   // 变更后状态
  diff_summary: string;          // 差异摘要
  performed_by: string;          // 操作者
  performed_at: string;          // 操作时间
  client_info?: {                // 客户端信息
    ip?: string;
    user_agent?: string;
    session_id?: string;
  };
  reason?: string;               // 变更原因
  approved_by?: string;          // 审批人（如需要）
}

/**
 * 8. 标签管理表 - ontology_tags
 * 支持对本体元素打标签分类
 */
export interface OntologyTag {
  id: string;                    // 主键
  name: string;                  // 标签名称
  color?: string;                // 标签颜色
  description?: string;          // 标签描述
  category?: string;             // 标签分类
  created_at: string;
  created_by?: string;
}

/**
 * 标签关联表 - 多对多关系
 */
export interface OntologyTagAssignment {
  id: string;
  tag_id: string;                // 标签ID
  entity_type: 'object' | 'property' | 'relation' | 'action' | 'view';
  entity_id: string;             // 实体ID
  assigned_at: string;
  assigned_by?: string;
}

/**
 * 9. 依赖关系表 - ontology_dependencies
 * 记录本体元素之间的依赖关系
 */
export interface OntologyDependency {
  id: string;                    // 主键
  source_id: string;             // 源实体ID
  source_type: 'object' | 'property' | 'relation' | 'action' | 'view';
  target_id: string;             // 目标实体ID（被依赖）
  target_type: 'object' | 'property' | 'relation' | 'action' | 'view';
  dependency_type: 'uses' | 'extends' | 'implements' | 'references' | 'contains';
  is_mandatory: boolean;         // 是否强制依赖
  description?: string;
  created_at: string;
}

/**
 * 10. 发布日志表 - ontology_publish_log
 * 记录发布历史和状态
 */
export interface OntologyPublishLog {
  id: string;                    // 主键
  version_id: string;            // 发布的版本ID
  environment: 'development' | 'staging' | 'production';  // 目标环境
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';
  started_at: string;            // 开始时间
  completed_at?: string;         // 完成时间
  published_by: string;          // 发布人
  validation_results?: {         // 验证结果
    passed: boolean;
    warnings: string[];
    errors: string[];
  };
  deployment_log?: string;       // 部署日志
  rollback_reason?: string;      // 回滚原因（如适用）
  rollback_target_version?: string;  // 回滚到哪个版本
}

/**
 * 完整的数据库Schema定义
 */
export interface OntologyDatabaseSchema {
  objects: OntologyObject[];
  properties: OntologyProperty[];
  relations: OntologyRelation[];
  actions: OntologyAction[];
  views: OntologyView[];
  versions: OntologyVersion[];
  change_logs: OntologyChangeLog[];
  tags: OntologyTag[];
  tag_assignments: OntologyTagAssignment[];
  dependencies: OntologyDependency[];
  publish_logs: OntologyPublishLog[];
}
