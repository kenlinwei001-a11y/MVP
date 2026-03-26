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
  'Literal',      // 字面量
  'Field',        // 字段引用
  'BinaryOp',     // 二元运算
  'UnaryOp',      // 一元运算
  'Comparison',   // 比较运算
  'Aggregation',  // 聚合运算
  'Condition',    // 条件
  'IfThen',       // 条件分支
  'TimeRelation', // 时间关系
  'LogicalOp',    // 逻辑运算
  'FunctionCall', // 函数调用
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
