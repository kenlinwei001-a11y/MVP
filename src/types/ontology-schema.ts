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
] as const;

export type ConstraintCategory = typeof ConstraintCategoryEnum[number];

// ============================================
// 5. 基数枚举（标准化）
// ============================================
export const CardinalityEnum = ['1-1', '1-n', 'n-n'] as const;
export type Cardinality = typeof CardinalityEnum[number];

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

export interface OntologySchema {
  entities: Entity[];
  relations: Relation[];
  constraints: Constraint[];
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
];
