# 本体配置器 - 工业级类型系统

## 新增功能概览

基于新的定义，实现了三大核心模块：

### 1. JSON Schema 类型定义 (`ontology-schema.ts`)

**用途**：下拉框 / 表单校验 / Schema驱动UI / 低代码构建器

**核心特性**：
- ✅ **完整枚举**：所有类型（Entity/Attribute/Relation/Constraint）均枚举化
- ✅ **语义标签**：属性支持语义标记（如 `resource_capacity`、`time_start`）
- ✅ **UI选项数据**：提供与 BlueprintJS 兼容的下拉选项格式
- ✅ **强类型约束**：TypeScript 类型 + 运行时枚举双重保护

**关键类型**：
```typescript
EntityType    // 18种实体类型（核心/资源/业务/时间/抽象）
AttributeType // 20种属性类型（基础/数值/时间/枚举/引用/结构化/工业扩展）
RelationType  // 19种关系类型（结构/业务/时序/因果/约束/数量）
ConstraintCategory // 7种约束分类（产能/时间/依赖/资源/流量/优化/统计）
```

---

### 2. Constraint DSL AST (`constraint-ast.ts`)

**用途**：DSL解析 / 转换为 OR-Tools / CP-SAT / MILP / 冲突检测

**核心特性**：
- ✅ **完整AST节点类型**：Literal、Field、BinaryOp、Comparison、Aggregation、IfThen、TimeRelation
- ✅ **求解器映射**：自动生成 Linear/CP-SAT/MILP 格式的约束
- ✅ **快捷构建函数**：`createCapacityConstraint()`、`createPrecedenceConstraint()` 等
- ✅ **可计算/可解释/可验证**

**AST 结构示例**：
```typescript
{
  type: "ConstraintAST",
  operator: "LE",
  left: {
    type: "Aggregation",
    func: "SUM",
    target: { type: "Field", entity: "order", field: "quantity" }
  },
  right: { type: "Field", entity: "line", field: "capacity" }
}
```

**求解器映射输出**：
```typescript
{
  solverType: "linear",
  constraintMapping: {
    type: "linear_constraint",
    lhs: "sum(order.quantity)",
    rhs: "line.capacity",
    operator: "LE"
  },
  variables: [...]
}
```

---

### 3. 约束模板引擎 (`constraint-template-engine.ts`)

**用途**：基于类型系统自动生成约束模板

**核心特性**：
- ✅ **规则驱动**：10+ 内置规则（产能/时间/依赖/资源/质量/优化等）
- ✅ **语义识别**：根据属性语义自动匹配规则
- ✅ **智能推荐**：无需用户懂约束，系统自动推荐
- ✅ **一键应用**：点击即可生成 DSL + AST

**内置规则**：
| 规则ID | 触发条件 | 生成约束 |
|--------|---------|---------|
| capacity_001 | float + resource_capacity | SUM(order.quantity) <= line.capacity |
| time_001 | datetime + time_start/time_end | task1.end_time <= task2.start_time |
| dependency_001 | relation: depends_on | A.start_time >= B.end_time |
| optimization_001 | float + resource_quantity | MAXIMIZE SUM(production.quantity) |

**使用方式**：
```typescript
// 分析实体，获取推荐
const templates = recommendConstraints(entity);

// 应用模板
applyRecommendedTemplate(template);
// → 自动生成 Constraint + AST + SolverMapping
```

---

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ 实体编辑器    │  │ 关系编辑器    │  │ 约束配置器        │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      智能模板引擎                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  输入: Entity + Attributes                           │  │
│  │  处理: 语义分析 → 规则匹配 → 模板生成                  │  │
│  │  输出: GeneratedConstraintTemplate[]                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DSL → AST 转换                          │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │   DSL 文本   │ →  │   AST 节点   │ →  │  求解器映射     │  │
│  │  (用户可读)  │    │  (可解释)    │    │ (OR-Tools/CP-SAT)│ │
│  └─────────────┘    └─────────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      求解器接口                              │
│         OR-Tools / CP-SAT / MILP / 自定义求解器               │
└─────────────────────────────────────────────────────────────┘
```

---

## 文件清单

| 文件 | 说明 |
|------|------|
| `ontology-schema.ts` | JSON Schema 类型定义 + UI选项 |
| `constraint-ast.ts` | DSL AST 节点类型 + 求解器映射 |
| `constraint-template-engine.ts` | 约束模板引擎 + 内置规则库 |

---

## 工业级差异点

相比普通配置器，本系统实现了 **Palantir 级别** 的三大能力：

### 1️⃣ Schema 强约束
- 所有类型枚举化
- 不允许自由输入
- TypeScript 编译时 + 运行时双重检查

### 2️⃣ DSL → AST → Solver 标准化
- **可计算**：可直接对接求解器
- **可解释**：AST 可视化，用户理解约束含义
- **可验证**：静态检查语法和引用

### 3️⃣ 模板自动生成（核心壁垒）
- 用户不需要懂约束
- 系统自动推荐（基于语义分析）
- 一键生成完整求解链路

---

## 使用示例

### 示例 1：配置产线实体

```typescript
const productionLine: Entity = {
  name: "AssemblyLine-A",
  type: "PhysicalResource",
  attributes: [
    { name: "capacity", type: "float", semantic: "resource_capacity" },
    { name: "start_time", type: "datetime", semantic: "time_start" },
    { name: "end_time", type: "datetime", semantic: "time_end" }
  ]
};

// 系统自动推荐：
// ✅ 产能约束（基于 capacity）
// ✅ 时间顺序约束（基于 start_time / end_time）
```

### 示例 2：创建 DSL 约束

```typescript
// 用户点击推荐的"产能约束"模板
// 系统自动生成：

// 1. DSL 表达式
const dsl = "SUM(order.quantity) <= line.capacity";

// 2. AST
const ast = createCapacityConstraint('order', 'quantity', 'line', 'capacity');

// 3. 求解器映射
const mapping = generateSolverMapping(ast, 'linear');
// → { solverType: "linear", variables: [...], constraintMapping: {...} }
```

---

## 扩展指南

### 添加新的约束模板规则

```typescript
constraintTemplateEngine.addRule({
  id: 'my_custom_rule',
  name: '自定义约束',
  condition: {
    attributeType: ['float'],
    semantic: 'my_semantic_tag'
  },
  template: {
    constraintType: 'hard',
    category: 'custom',
    expressionTemplate: '{entity}.value <= {threshold}',
    params: [...]
  },
  priority: 80
});
```

### 添加新的 AST 节点类型

在 `constraint-ast.ts` 中：
1. 定义新的节点接口（继承 `ASTNode`）
2. 添加到 `ASTNodeTypeEnum`
3. 添加构建函数
4. 更新 `nodeToExpression()` 转换函数
