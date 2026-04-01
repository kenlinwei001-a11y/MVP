/**
 * Constraint DSL 语法树定义
 * 用于：DSL解析 / 转换为 OR-Tools / CP-SAT / MILP / 做冲突检测
 *
 * 可计算、可解释、可验证
 */

// ============================================
// 1. AST 节点类型枚举
// ============================================

export const ASTNodeTypeEnum = [
  'Literal',           // 字面量
  'Field',             // 字段引用
  'BinaryOp',          // 二元运算
  'UnaryOp',           // 一元运算
  'Comparison',        // 比较运算
  'Aggregation',       // 聚合运算
  'Condition',         // 条件
  'IfThen',            // 条件分支
  'TimeRelation',      // 时间关系
  'TemporalConstraint', // 时态约束（新增）
  'DerivedProperty',   // 派生属性（新增）
  'ActionTrigger',     // Action 触发器（新增）
  'LogicalOp',         // 逻辑运算
  'FunctionCall',      // 函数调用
] as const;

export type ASTNodeType = typeof ASTNodeTypeEnum[number];

// ============================================
// 2. 运算符枚举
// ============================================

// 算术运算符
export const BinaryOperatorEnum = [
  'ADD',    // +
  'SUB',    // -
  'MUL',    // *
  'DIV',    // /
  'MOD',    // %
  'POW',    // ^
] as const;

export type BinaryOperator = typeof BinaryOperatorEnum[number];

// 比较运算符
export const ComparisonOperatorEnum = [
  'EQ',     // ==
  'NE',     // !=
  'LT',     // <
  'LE',     // <=
  'GT',     // >
  'GE',     // >=
] as const;

export type ComparisonOperator = typeof ComparisonOperatorEnum[number];

// 逻辑运算符
export const LogicalOperatorEnum = [
  'AND',    // &&
  'OR',     // ||
  'NOT',    // !
] as const;

export type LogicalOperator = typeof LogicalOperatorEnum[number];

// 聚合函数
export const AggregationFunctionEnum = [
  'SUM',    // 求和
  'AVG',    // 平均值
  'MAX',    // 最大值
  'MIN',    // 最小值
  'COUNT',  // 计数
  'STD',    // 标准差
] as const;

export type AggregationFunction = typeof AggregationFunctionEnum[number];

// 时间关系
export const TimeRelationEnum = [
  'BEFORE',      // 在之前
  'AFTER',       // 在之后
  'OVERLAP',     // 重叠
  'MEETS',       // 相接
  'DURING',      // 在期间
  'STARTS',      // 同时开始
  'FINISHES',    // 同时结束
  'EQUALS',      // 相等
] as const;

export type TimeRelation = typeof TimeRelationEnum[number];

// ============================================
// 2.1 时态约束类型（新增）
// ============================================

export const TemporalConstraintTypeEnum = [
  'TIME_WINDOW',       // 时间窗口
  'DEADLINE',          // 截止时间
  'RELEASE_TIME',      // 释放时间
  'MIN_DURATION',      // 最短持续时间
  'MAX_DURATION',      // 最长持续时间
  'EXACT_DURATION',    // 精确持续时间
  'MIN_GAP',           // 最小间隔
  'MAX_GAP',           // 最大间隔
  'PERIODIC',          // 周期性
] as const;

export type TemporalConstraintType = typeof TemporalConstraintTypeEnum[number];

// 派生规则类型
export const DerivedRuleTypeEnum = [
  'CALCULATED',        // 计算属性
  'AGGREGATED',        // 聚合属性
  'INFERRED',          // 推断属性
  'TRANSITIVE',        // 传递关系
  'EVENT_TRIGGERED',   // 事件触发
] as const;

export type DerivedRuleType = typeof DerivedRuleTypeEnum[number];

// Action 触发模式
export const ActionTriggerModeEnum = [
  'MANUAL',            // 手动触发
  'AUTOMATIC',         // 自动触发
  'SCHEDULED',         // 定时触发
  'EVENT_DRIVEN',      // 事件驱动
] as const;

export type ActionTriggerMode = typeof ActionTriggerModeEnum[number];

// ============================================
// 3. AST 节点接口定义
// ============================================

// 基础节点接口
export interface ASTNode {
  type: ASTNodeType;
}

// 字面量节点 - 常量值
export interface LiteralNode extends ASTNode {
  type: 'Literal';
  value: number | string | boolean;
  dataType?: 'int' | 'float' | 'string' | 'boolean' | 'datetime';
}

// 字段引用节点 - 引用实体属性
export interface FieldNode extends ASTNode {
  type: 'Field';
  entity: string;           // 实体名称
  field: string;            // 字段名
  path?: string[];          // 嵌套路径（如 order.product.name）
}

// 二元运算节点
export interface BinaryOpNode extends ASTNode {
  type: 'BinaryOp';
  operator: BinaryOperator;
  left: ASTNode;
  right: ASTNode;
}

// 一元运算节点
export interface UnaryOpNode extends ASTNode {
  type: 'UnaryOp';
  operator: 'NEG' | 'NOT';
  operand: ASTNode;
}

// 比较运算节点
export interface ComparisonNode extends ASTNode {
  type: 'Comparison';
  operator: ComparisonOperator;
  left: ASTNode;
  right: ASTNode;
}

// 聚合运算节点（关键）
export interface AggregationNode extends ASTNode {
  type: 'Aggregation';
  func: AggregationFunction;
  target: FieldNode;           // 聚合目标字段
  filter?: ConditionNode;      // 可选过滤条件
  groupBy?: FieldNode[];       // 可选分组字段
}

// 条件节点
export interface ConditionNode extends ASTNode {
  type: 'Condition';
  field: FieldNode;
  operator: ComparisonOperator;
  value: LiteralNode | FieldNode;
}

// 条件分支节点
export interface IfThenNode extends ASTNode {
  type: 'IfThen';
  condition: ASTNode;          // 条件表达式
  then: ASTNode;               // 条件为真时的约束
  else?: ASTNode;              // 条件为假时的约束（可选）
}

// 时间关系节点
export interface TimeRelationNode extends ASTNode {
  type: 'TimeRelation';
  relation: TimeRelation;
  left: FieldNode;             // 左时间字段（如 task1.end_time）
  right: FieldNode;            // 右时间字段（如 task2.start_time）
  offset?: LiteralNode;        // 可选偏移量
}

// ============================================
// 3.1 时态约束节点（新增）
// ============================================

// 时态约束 AST 节点
export interface TemporalConstraintNode extends ASTNode {
  type: 'TemporalConstraint';
  constraintType: TemporalConstraintType;
  targetEntity: FieldNode;     // 目标实体时间字段
  referenceEntity?: FieldNode; // 参考实体时间字段（相对约束）
  parameters: {
    duration?: number;         // 持续时间（分钟）
    minDuration?: number;
    maxDuration?: number;
    gap?: number;              // 间隔时间
    minGap?: number;
    maxGap?: number;
    timeWindow?: {
      start: string;
      end: string;
    };
    periodic?: {
      interval: number;
      unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
    };
  };
  violationAction: 'block' | 'warn' | 'auto_adjust' | 'notify';
}

// ============================================
// 3.2 派生属性节点（新增）
// ============================================

// 派生属性 AST 节点
export interface DerivedPropertyNode extends ASTNode {
  type: 'DerivedProperty';
  ruleType: DerivedRuleType;
  targetProperty: FieldNode;   // 目标属性
  formula: ASTNode | AggregationDerivedNode | InferenceRuleNode;  // 计算公式（支持多种类型）
  dependencies: FieldNode[];   // 依赖属性列表
  refreshStrategy: {
    mode: 'realtime' | 'on_demand' | 'scheduled';
    cron?: string;
    eventTriggers?: string[];
  };
}

// 聚合计算节点（不继承 ASTNode，作为辅助类型使用）
export interface AggregationDerivedNode {
  type: 'AggregationDerived';
  func: AggregationFunction;
  target: FieldNode;
  filter?: ConditionNode;
  groupBy?: FieldNode[];
}

// 推理规则节点（不继承 ASTNode，作为辅助类型使用）
export interface InferenceRuleNode {
  type: 'InferenceRule';
  conditions: ASTNode[];       // 条件列表
  conclusion: ASTNode;         // 结论
  confidence: number;          // 置信度
}

// ============================================
// 3.3 Action 触发器节点（新增）
// ============================================

// Action 触发器 AST 节点
export interface ActionTriggerNode extends ASTNode {
  type: 'ActionTrigger';
  actionType: string;          // Action 类型
  triggerMode: ActionTriggerMode;
  conditions: ASTNode[];       // 触发条件
  preconditions: ASTNode[];    // 前置条件
  operations: ActionOperationNode[];
  postEffects: ActionEffectNode[];
}

// Action 操作节点（不继承 ASTNode，作为辅助类型使用）
export interface ActionOperationNode {
  type: 'ActionOperation';
  operationType: 'update_property' | 'create_link' | 'delete_link' | 'create_entity' | 'call_service' | 'emit_event';
  target: string;
  parameters: Record<string, ASTNode>;
  order: number;
}

// Action 效果节点（不继承 ASTNode，作为辅助类型使用）
export interface ActionEffectNode {
  type: 'ActionEffect';
  effectType: 'property_update' | 'event_emit' | 'state_transition';
  target: FieldNode | string;
  value?: ASTNode;
}

// 逻辑运算节点
export interface LogicalOpNode extends ASTNode {
  type: 'LogicalOp';
  operator: LogicalOperator;
  operands: ASTNode[];         // 多操作数
}

// 函数调用节点
export interface FunctionCallNode extends ASTNode {
  type: 'FunctionCall';
  name: string;                // 函数名
  arguments: ASTNode[];        // 参数列表
}

// ============================================
// 4. 约束 AST 顶层结构
// ============================================

export interface ConstraintAST {
  type: 'ConstraintAST';
  id: string;
  name: string;
  constraintType: 'hard' | 'soft' | 'objective';
  category: string;
  operator: ComparisonOperator;
  left: ASTNode;
  right: ASTNode;
  description?: string;
  priority?: number;
}

// ============================================
// 5. DSL → 求解器映射接口（关键）
// ============================================

export interface SolverMapping {
  // 求解器类型
  solverType: 'linear' | 'cp_sat' | 'milp' | 'csp';

  // 约束转换
  constraintMapping: {
    type: string;
    lhs: string;           // 左侧表达式
    rhs: string;           // 右侧表达式
    operator: string;      // 求解器运算符
  };

  // 变量定义
  variables: SolverVariable[];

  // 原始 DSL
  originalDsl: string;

  // AST 引用
  ast: ConstraintAST;
}

export interface SolverVariable {
  name: string;
  type: 'integer' | 'float' | 'boolean' | 'interval';
  lowerBound?: number;
  upperBound?: number;
  domain?: number[];       // 离散域
}

// ============================================
// 6. DSL 表达式转 AST 的工具函数
// ============================================

/**
 * 解析简单字段引用
 * 例："order.quantity" → FieldNode
 */
export function parseField(path: string): FieldNode {
  const parts = path.split('.');
  return {
    type: 'Field',
    entity: parts[0],
    field: parts[1] || parts[0],
    path: parts.slice(2),
  };
}

/**
 * 创建字面量节点
 */
export function createLiteral(
  value: number | string | boolean,
  dataType?: 'int' | 'float' | 'string' | 'boolean'
): LiteralNode {
  return {
    type: 'Literal',
    value,
    dataType,
  };
}

/**
 * 创建比较节点
 */
export function createComparison(
  operator: ComparisonOperator,
  left: ASTNode,
  right: ASTNode
): ComparisonNode {
  return {
    type: 'Comparison',
    operator,
    left,
    right,
  };
}

/**
 * 创建聚合节点
 */
export function createAggregation(
  func: AggregationFunction,
  target: FieldNode,
  filter?: ConditionNode
): AggregationNode {
  return {
    type: 'Aggregation',
    func,
    target,
    filter,
  };
}

/**
 * 创建时间关系节点
 */
export function createTimeRelation(
  relation: TimeRelation,
  left: string,
  right: string,
  offset?: number
): TimeRelationNode {
  return {
    type: 'TimeRelation',
    relation,
    left: parseField(left),
    right: parseField(right),
    offset: offset !== undefined ? createLiteral(offset, 'float') : undefined,
  };
}

/**
 * 创建二元运算节点
 */
export function createBinaryOp(
  operator: BinaryOperator,
  left: ASTNode,
  right: ASTNode
): BinaryOpNode {
  return {
    type: 'BinaryOp',
    operator,
    left,
    right,
  };
}

/**
 * 创建字段引用节点（快捷函数）
 */
export function createField(entity: string, field: string): FieldNode {
  return {
    type: 'Field',
    entity,
    field,
    path: [],
  };
}

// ============================================
// 6.1 时态约束工厂函数（新增）
// ============================================

/**
 * 创建时间窗口约束
 * 例：任务必须在 [08:00, 18:00] 之间执行
 */
export function createTimeWindowConstraint(
  entityField: string,
  startTime: string,
  endTime: string,
  violationAction: 'block' | 'warn' | 'auto_adjust' | 'notify' = 'block'
): TemporalConstraintNode {
  return {
    type: 'TemporalConstraint',
    constraintType: 'TIME_WINDOW',
    targetEntity: parseField(entityField),
    parameters: {
      timeWindow: { start: startTime, end: endTime },
    },
    violationAction,
  };
}

/**
 * 创建持续时间约束
 * 例：任务持续时间必须在 [min, max] 之间
 */
export function createDurationConstraint(
  entityField: string,
  minDuration?: number,
  maxDuration?: number,
  exactDuration?: number,
  violationAction: 'block' | 'warn' | 'auto_adjust' | 'notify' = 'block'
): TemporalConstraintNode {
  let constraintType: TemporalConstraintType = 'EXACT_DURATION';
  if (minDuration !== undefined && maxDuration !== undefined) {
    constraintType = 'MIN_DURATION'; // 实际使用时会同时检查 min 和 max
  } else if (minDuration !== undefined) {
    constraintType = 'MIN_DURATION';
  } else if (maxDuration !== undefined) {
    constraintType = 'MAX_DURATION';
  }

  return {
    type: 'TemporalConstraint',
    constraintType,
    targetEntity: parseField(entityField),
    parameters: {
      minDuration,
      maxDuration,
      duration: exactDuration,
    },
    violationAction,
  };
}

/**
 * 创建时间间隔约束
 * 例：任务A结束后，任务B必须在 [min, max] 分钟后开始
 */
export function createTimeGapConstraint(
  sourceField: string,
  targetField: string,
  minGap?: number,
  maxGap?: number,
  violationAction: 'block' | 'warn' | 'auto_adjust' | 'notify' = 'block'
): TemporalConstraintNode {
  return {
    type: 'TemporalConstraint',
    constraintType: minGap !== undefined ? 'MIN_GAP' : 'MAX_GAP',
    targetEntity: parseField(targetField),
    referenceEntity: parseField(sourceField),
    parameters: {
      minGap,
      maxGap,
    },
    violationAction,
  };
}

/**
 * 创建周期性约束
 * 例：设备必须每 8 小时维护一次
 */
export function createPeriodicConstraint(
  entityField: string,
  interval: number,
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month',
  violationAction: 'block' | 'warn' | 'auto_adjust' | 'notify' = 'block'
): TemporalConstraintNode {
  return {
    type: 'TemporalConstraint',
    constraintType: 'PERIODIC',
    targetEntity: parseField(entityField),
    parameters: {
      periodic: { interval, unit },
    },
    violationAction,
  };
}

// ============================================
// 6.2 派生规则工厂函数（新增）
// ============================================

/**
 * 创建计算属性派生规则
 * 例：OEE = 实际产量 / 理论产能 * 100
 */
export function createCalculatedProperty(
  targetProperty: string,
  formula: ASTNode,
  dependencies: string[],
  refreshMode: 'realtime' | 'on_demand' | 'scheduled' = 'realtime',
  cron?: string
): DerivedPropertyNode {
  return {
    type: 'DerivedProperty',
    ruleType: 'CALCULATED',
    targetProperty: parseField(targetProperty),
    formula,
    dependencies: dependencies.map(parseField),
    refreshStrategy: {
      mode: refreshMode,
      cron,
    },
  };
}

/**
 * 创建聚合属性派生规则
 * 例：总产量 = SUM(批次.产量)
 */
export function createAggregatedProperty(
  targetProperty: string,
  func: AggregationFunction,
  sourceField: string,
  filter?: ConditionNode,
  groupBy?: string[],
  refreshMode: 'realtime' | 'on_demand' | 'scheduled' = 'on_demand'
): DerivedPropertyNode {
  const aggNode: AggregationDerivedNode = {
    type: 'AggregationDerived',
    func,
    target: parseField(sourceField),
    filter,
    groupBy: groupBy?.map(parseField),
  };

  return {
    type: 'DerivedProperty',
    ruleType: 'AGGREGATED',
    targetProperty: parseField(targetProperty),
    formula: aggNode,
    dependencies: [parseField(sourceField)],
    refreshStrategy: {
      mode: refreshMode,
    },
  };
}

/**
 * 创建推理规则
 * 例：IF 温度 > 80°C AND 压力 > 5bar THEN 状态 = '危险'
 */
export function createInferenceRule(
  conditions: ASTNode[],
  conclusion: ASTNode,
  confidence: number = 1.0
): InferenceRuleNode {
  return {
    type: 'InferenceRule',
    conditions,
    conclusion,
    confidence,
  };
}

// ============================================
// 6.3 Action 工厂函数（新增）
// ============================================

/**
 * 创建 Action 触发器
 * 例：当订单优先级为高时，自动分配给最快产线
 */
export function createActionTrigger(
  actionType: string,
  triggerMode: ActionTriggerMode,
  conditions: ASTNode[],
  operations: ActionOperationNode[],
  preconditions: ASTNode[] = [],
  postEffects: ActionEffectNode[] = []
): ActionTriggerNode {
  return {
    type: 'ActionTrigger',
    actionType,
    triggerMode,
    conditions,
    preconditions,
    operations,
    postEffects,
  };
}

/**
 * 创建 Action 操作
 */
export function createActionOperation(
  operationType: ActionOperationNode['operationType'],
  target: string,
  parameters: Record<string, ASTNode>,
  order: number = 0
): ActionOperationNode {
  return {
    type: 'ActionOperation',
    operationType,
    target,
    parameters,
    order,
  };
}

/**
 * 创建状态转换 Action
 * 例：设备从 '空闲' 转换为 '运行中'
 */
export function createStateTransitionAction(
  entity: string,
  fromState: string,
  toState: string,
  triggerConditions: ASTNode[]
): ActionTriggerNode {
  const operation = createActionOperation(
    'update_property',
    `${entity}.state`,
    { value: createLiteral(toState, 'string') },
    0
  );

  const effect: ActionEffectNode = {
    type: 'ActionEffect',
    effectType: 'state_transition',
    target: entity,
    value: createLiteral(toState, 'string'),
  };

  return createActionTrigger(
    'state_transition',
    'EVENT_DRIVEN',
    triggerConditions,
    [operation],
    [],
    [effect]
  );
}

// ============================================
// 7. 常见 DSL 模式（快速构建）
// ============================================

/**
 * 产能约束：SUM(orders.quantity) <= line.capacity
 */
export function createCapacityConstraint(
  orderEntity: string,
  quantityField: string,
  lineEntity: string,
  capacityField: string
): ConstraintAST {
  const orderField = parseField(`${orderEntity}.${quantityField}`);
  const lineCapacity = parseField(`${lineEntity}.${capacityField}`);

  return {
    type: 'ConstraintAST',
    id: `capacity_${Date.now()}`,
    name: '产能约束',
    constraintType: 'hard',
    category: 'capacity',
    operator: 'LE',
    left: createAggregation('SUM', orderField),
    right: lineCapacity,
  };
}

/**
 * 时间顺序约束：task1.end_time <= task2.start_time
 */
export function createPrecedenceConstraint(
  task1: string,
  task2: string,
  offset: number = 0
): ConstraintAST {
  const endTime = parseField(`${task1}.end_time`);
  const startTime = parseField(`${task2}.start_time`);

  return {
    type: 'ConstraintAST',
    id: `precedence_${Date.now()}`,
    name: '时间顺序约束',
    constraintType: 'hard',
    category: 'time',
    operator: 'LE',
    left: endTime,
    right: offset === 0
      ? startTime
      : {
          type: 'BinaryOp',
          operator: 'ADD',
          left: startTime,
          right: createLiteral(offset, 'float'),
        } as BinaryOpNode,
  };
}

/**
 * 依赖约束（基于 depends_on 关系）
 */
export function createDependencyConstraint(
  taskA: string,
  taskB: string
): ConstraintAST {
  return createPrecedenceConstraint(taskB, taskA, 0);
}

// ============================================
// 8. 求解器映射生成
// ============================================

/**
 * 将 AST 转换为求解器映射
 * 支持：linear, cp_sat, milp
 */
export function generateSolverMapping(
  ast: ConstraintAST,
  solverType: 'linear' | 'cp_sat' | 'milp' = 'linear'
): SolverMapping {
  // 提取变量
  const variables: SolverVariable[] = [];
  extractVariables(ast.left, variables);
  extractVariables(ast.right, variables);

  // 转换约束表达式
  const constraintMapping = {
    type: getConstraintType(ast),
    lhs: nodeToExpression(ast.left),
    rhs: nodeToExpression(ast.right),
    operator: ast.operator,
  };

  return {
    solverType,
    constraintMapping,
    variables,
    originalDsl: astToDsl(ast),
    ast,
  };
}

// 递归提取变量
function extractVariables(node: ASTNode, variables: SolverVariable[]): void {
  if (node.type === 'Field') {
    const field = node as FieldNode;
    const varName = `${field.entity}.${field.field}`;
    if (!variables.find(v => v.name === varName)) {
      variables.push({
        name: varName,
        type: 'float',  // 默认类型
      });
    }
  }

  // 递归处理子节点
  if ('left' in node && node.left && typeof node.left === 'object' && 'type' in node.left) extractVariables(node.left as ASTNode, variables);
  if ('right' in node && node.right && typeof node.right === 'object' && 'type' in node.right) extractVariables(node.right as ASTNode, variables);
  if ('operand' in node && node.operand && typeof node.operand === 'object' && 'type' in node.operand) extractVariables(node.operand as ASTNode, variables);
  if ('operands' in node && node.operands) {
    (node.operands as ASTNode[]).forEach((op) => extractVariables(op, variables));
  }
  if ('target' in node && node.target && typeof node.target === 'object' && 'type' in node.target) extractVariables(node.target as ASTNode, variables);
}

// 节点转表达式字符串
function nodeToExpression(node: ASTNode): string {
  switch (node.type) {
    case 'Literal':
      return String((node as LiteralNode).value);
    case 'Field':
      const field = node as FieldNode;
      return `${field.entity}.${field.field}`;
    case 'BinaryOp':
      const binOp = node as BinaryOpNode;
      return `(${nodeToExpression(binOp.left)} ${binOp.operator} ${nodeToExpression(binOp.right)})`;
    case 'Aggregation':
      const agg = node as AggregationNode;
      return `${agg.func}(${nodeToExpression(agg.target)})`;
    default:
      return '';
  }
}

// AST 转 DSL 字符串
function astToDsl(ast: ConstraintAST): string {
  return `${nodeToExpression(ast.left)} ${ast.operator} ${nodeToExpression(ast.right)}`;
}

// 获取约束类型
function getConstraintType(ast: ConstraintAST): string {
  switch (ast.category) {
    case 'capacity':
      return 'linear_constraint';
    case 'time':
      return 'temporal_constraint';
    case 'dependency':
      return 'precedence_constraint';
    default:
      return 'general_constraint';
  }
}
