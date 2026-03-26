/**
 * 约束模板引擎
 * 类型系统 → 自动生成约束模板
 *
 * 核心能力：用户不需要懂约束，系统自动推荐
 * 这是系统"智能化"的关键（不靠AI也能很强）
 */

import {
  Entity,
  Attribute,
  AttributeSemantic,
  AttributeSemanticLabels,
  RelationType,
} from '../types/ontology-schema';
import {
  ConstraintAST,
  createCapacityConstraint,
  createPrecedenceConstraint,
  createDependencyConstraint,
  parseField,
} from '../types/constraint-ast';

// ============================================
// 1. 模板规则定义
// ============================================

/**
 * 约束模板规则
 * 基于属性语义和关系类型自动生成约束
 */
export interface ConstraintTemplateRule {
  id: string;
  name: string;
  description: string;

  // 触发条件
  condition: {
    // 属性条件
    attributeType?: string[];      // 属性数据类型
    semantic?: AttributeSemantic | AttributeSemantic[];  // 语义标签
    fieldName?: string[];          // 字段名匹配

    // 关系条件
    relationType?: RelationType | RelationType[];  // 关系类型

    // 组合条件
    requireAttribute?: boolean;    // 是否需要属性
    requireRelation?: boolean;     // 是否需要关系
  };

  // 生成的约束模板
  template: {
    constraintType: 'hard' | 'soft' | 'objective';
    category: string;
    expressionTemplate: string;    // DSL模板，使用 {entity} 等占位符
    params: TemplateParam[];       // 模板参数定义
  };

  // 评分权重（用于排序推荐）
  priority: number;
}

/**
 * 模板参数定义
 */
export interface TemplateParam {
  name: string;
  type: 'entity' | 'attribute' | 'relation' | 'value';
  description: string;
  required: boolean;
  defaultValue?: string;
  // 值域限制
  domain?: {
    entityTypes?: string[];
    attributeTypes?: string[];
    relationTypes?: string[];
  };
}

/**
 * 生成的约束模板
 */
export interface GeneratedConstraintTemplate {
  templateId: string;
  name: string;
  description: string;

  // DSL 表达式（带占位符）
  expressionTemplate: string;

  // 示例（用户看到的）
  example: string;

  // 参数列表
  params: TemplateParam[];

  // 快速应用配置
  quickApply?: {
    enabled: boolean;
    defaultParams?: Record<string, string>;
  };

  // 生成的 AST（用于求解器）
  astTemplate?: ConstraintAST;

  // 约束类型信息（从规则模板中提取）
  constraintType: 'hard' | 'soft' | 'objective';
  category: string;
}

// ============================================
// 2. 内置模板规则库
// ============================================

const BUILT_IN_RULES: ConstraintTemplateRule[] = [
  // ==========================================
  // Rule 1: 数值 + resource_capacity → 产能约束
  // ==========================================
  {
    id: 'capacity_001',
    name: '产能约束',
    description: '基于资源容量限制订单/任务总量',
    condition: {
      attributeType: ['float', 'int', 'decimal'],
      semantic: AttributeSemanticLabels.RESOURCE_CAPACITY,
    },
    template: {
      constraintType: 'hard',
      category: 'capacity',
      expressionTemplate: 'SUM({order}.quantity) <= {line}.capacity',
      params: [
        {
          name: 'order',
          type: 'entity',
          description: '订单实体',
          required: true,
          domain: { entityTypes: ['Order', 'Task', 'Batch'] },
        },
        {
          name: 'line',
          type: 'entity',
          description: '产线/资源实体',
          required: true,
          domain: { entityTypes: ['PhysicalResource', 'Object'] },
        },
        {
          name: 'order.quantity',
          type: 'attribute',
          description: '订单数量字段',
          required: true,
          defaultValue: 'quantity',
        },
        {
          name: 'line.capacity',
          type: 'attribute',
          description: '产线产能字段',
          required: true,
          defaultValue: 'capacity',
        },
      ],
    },
    priority: 100,
  },

  // ==========================================
  // Rule 2: 时间字段 → 时间顺序约束
  // ==========================================
  {
    id: 'time_001',
    name: '时间顺序约束',
    description: '基于开始/结束时间定义任务顺序',
    condition: {
      attributeType: ['datetime', 'timestamp'],
      semantic: [AttributeSemanticLabels.TIME_START, AttributeSemanticLabels.TIME_END],
    },
    template: {
      constraintType: 'hard',
      category: 'time',
      expressionTemplate: '{task1}.end_time <= {task2}.start_time',
      params: [
        {
          name: 'task1',
          type: 'entity',
          description: '前置任务',
          required: true,
          domain: { entityTypes: ['Task', 'Event', 'Plan'] },
        },
        {
          name: 'task2',
          type: 'entity',
          description: '后置任务',
          required: true,
          domain: { entityTypes: ['Task', 'Event', 'Plan'] },
        },
        {
          name: 'offset',
          type: 'value',
          description: '时间偏移量（小时）',
          required: false,
          defaultValue: '0',
        },
      ],
    },
    priority: 95,
  },

  // ==========================================
  // Rule 3: 关系 + depends_on → 依赖约束
  // ==========================================
  {
    id: 'dependency_001',
    name: '任务依赖约束',
    description: '基于 depends_on 关系自动生成时间依赖',
    condition: {
      relationType: 'depends_on',
    },
    template: {
      constraintType: 'hard',
      category: 'dependency',
      expressionTemplate: '{taskA}.start_time >= {taskB}.end_time',
      params: [
        {
          name: 'taskA',
          type: 'entity',
          description: '依赖任务（后执行）',
          required: true,
        },
        {
          name: 'taskB',
          type: 'entity',
          description: '被依赖任务（先执行）',
          required: true,
        },
      ],
    },
    priority: 90,
  },

  // ==========================================
  // Rule 4: 资源数量 → 资源平衡约束
  // ==========================================
  {
    id: 'resource_001',
    name: '资源平衡约束',
    description: '资源消耗量不超过可用量',
    condition: {
      attributeType: ['float', 'int'],
      semantic: AttributeSemanticLabels.RESOURCE_QUANTITY,
    },
    template: {
      constraintType: 'hard',
      category: 'resource',
      expressionTemplate: '{task}.resource_usage <= {resource}.available',
      params: [
        {
          name: 'task',
          type: 'entity',
          description: '任务实体',
          required: true,
        },
        {
          name: 'resource',
          type: 'entity',
          description: '资源实体',
          required: true,
        },
      ],
    },
    priority: 85,
  },

  // ==========================================
  // Rule 5: 订单数量 → 需求满足约束
  // ==========================================
  {
    id: 'demand_001',
    name: '需求满足约束',
    description: '生产总量满足订单需求',
    condition: {
      attributeType: ['float', 'int'],
      semantic: AttributeSemanticLabels.ORDER_QUANTITY,
    },
    template: {
      constraintType: 'hard',
      category: 'flow',
      expressionTemplate: 'SUM({production}.quantity) >= {order}.quantity',
      params: [
        {
          name: 'production',
          type: 'entity',
          description: '生产批次实体',
          required: true,
        },
        {
          name: 'order',
          type: 'entity',
          description: '订单实体',
          required: true,
        },
      ],
    },
    priority: 80,
  },

  // ==========================================
  // Rule 6: 优化目标 - 最大化产量
  // ==========================================
  {
    id: 'optimization_001',
    name: '最大化产量',
    description: '优化目标：最大化总产量',
    condition: {
      attributeType: ['float', 'int'],
      semantic: AttributeSemanticLabels.RESOURCE_QUANTITY,
    },
    template: {
      constraintType: 'objective',
      category: 'optimization',
      expressionTemplate: 'MAXIMIZE SUM({production}.quantity)',
      params: [
        {
          name: 'production',
          type: 'entity',
          description: '生产实体',
          required: true,
        },
      ],
    },
    priority: 70,
  },

  // ==========================================
  // Rule 7: 优化目标 - 最小化成本
  // ==========================================
  {
    id: 'optimization_002',
    name: '最小化成本',
    description: '优化目标：最小化总成本',
    condition: {
      attributeType: ['currency', 'float'],
    },
    template: {
      constraintType: 'objective',
      category: 'optimization',
      expressionTemplate: 'MINIMIZE SUM({task}.cost)',
      params: [
        {
          name: 'task',
          type: 'entity',
          description: '任务/操作实体',
          required: true,
        },
      ],
    },
    priority: 70,
  },

  // ==========================================
  // Rule 8: 质量指标 → 统计约束
  // ==========================================
  {
    id: 'quality_001',
    name: '质量指标约束',
    description: '质量指标不低于阈值',
    condition: {
      attributeType: ['percentage', 'float'],
      semantic: AttributeSemanticLabels.QUALITY_METRIC,
    },
    template: {
      constraintType: 'soft',
      category: 'statistical',
      expressionTemplate: 'AVG({batch}.quality_score) >= {threshold}',
      params: [
        {
          name: 'batch',
          type: 'entity',
          description: '批次实体',
          required: true,
        },
        {
          name: 'threshold',
          type: 'value',
          description: '质量阈值',
          required: true,
          defaultValue: '0.95',
        },
      ],
    },
    priority: 60,
  },

  // ==========================================
  // Rule 9: 时间窗口 → 不重叠约束
  // ==========================================
  {
    id: 'time_002',
    name: '时间不重叠约束',
    description: '同一资源的任务时间不重叠',
    condition: {
      attributeType: ['datetime', 'timestamp'],
      semantic: AttributeSemanticLabels.TIME_DURATION,
    },
    template: {
      constraintType: 'hard',
      category: 'time',
      expressionTemplate: 'NO_OVERLAP({task}.start_time, {task}.end_time) WHERE {task}.resource_id = SAME',
      params: [
        {
          name: 'task',
          type: 'entity',
          description: '任务实体',
          required: true,
        },
      ],
    },
    priority: 88,
  },

  // ==========================================
  // Rule 10: 物料流动 → 流量守恒
  // ==========================================
  {
    id: 'flow_001',
    name: '物料流量守恒',
    description: '工序间物料数量守恒',
    condition: {
      relationType: 'produced_by',
    },
    template: {
      constraintType: 'hard',
      category: 'flow',
      expressionTemplate: '{process}.input_quantity = {process}.output_quantity * (1 - {process}.loss_rate)',
      params: [
        {
          name: 'process',
          type: 'entity',
          description: '工序实体',
          required: true,
        },
      ],
    },
    priority: 75,
  },
];

// ============================================
// 3. 模板引擎核心类
// ============================================

export class ConstraintTemplateEngine {
  private rules: ConstraintTemplateRule[] = [...BUILT_IN_RULES];

  // ==========================================
  // 规则管理
  // ==========================================

  /**
   * 添加自定义规则
   */
  addRule(rule: ConstraintTemplateRule): void {
    this.rules.push(rule);
    // 按优先级排序
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 移除规则
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  /**
   * 获取所有规则
   */
  getRules(): ConstraintTemplateRule[] {
    return [...this.rules];
  }

  // ==========================================
  // 模板生成
  // ==========================================

  /**
   * 基于实体属性分析，生成推荐约束模板
   */
  generateTemplates(entity: Entity): GeneratedConstraintTemplate[] {
    const templates: GeneratedConstraintTemplate[] = [];

    for (const rule of this.rules) {
      // 检查属性匹配
      if (rule.condition.attributeType || rule.condition.semantic) {
        for (const attr of entity.attributes) {
          if (this.matchesAttributeCondition(attr, rule.condition)) {
            const template = this.generateTemplateFromRule(rule, entity, attr);
            if (template && !templates.find(t => t.templateId === template.templateId)) {
              templates.push(template);
            }
          }
        }
      }
    }

    // 按优先级排序
    return templates.sort((a, b) => {
      const ruleA = this.rules.find(r => r.id === a.templateId);
      const ruleB = this.rules.find(r => r.id === b.templateId);
      return (ruleB?.priority || 0) - (ruleA?.priority || 0);
    });
  }

  /**
   * 基于关系生成约束模板
   */
  generateTemplatesForRelation(
    fromEntity: Entity,
    toEntity: Entity,
    relationType: RelationType
  ): GeneratedConstraintTemplate[] {
    const templates: GeneratedConstraintTemplate[] = [];

    for (const rule of this.rules) {
      if (rule.condition.relationType) {
        const relationTypes = Array.isArray(rule.condition.relationType)
          ? rule.condition.relationType
          : [rule.condition.relationType];

        if (relationTypes.includes(relationType)) {
          const template = this.generateTemplateFromRuleForRelation(
            rule,
            fromEntity,
            toEntity,
            relationType
          );
          if (template) {
            templates.push(template);
          }
        }
      }
    }

    return templates;
  }

  /**
   * 批量生成所有实体的推荐约束
   */
  generateAllTemplates(entities: Entity[]): Map<string, GeneratedConstraintTemplate[]> {
    const result = new Map<string, GeneratedConstraintTemplate[]>();

    for (const entity of entities) {
      const templates = this.generateTemplates(entity);
      if (templates.length > 0) {
        result.set(entity.name, templates);
      }
    }

    return result;
  }

  // ==========================================
  // 私有方法
  // ==========================================

  /**
   * 检查属性是否匹配条件
   */
  private matchesAttributeCondition(
    attr: Attribute,
    condition: ConstraintTemplateRule['condition']
  ): boolean {
    // 检查属性类型
    if (condition.attributeType) {
      if (!condition.attributeType.includes(attr.type)) {
        return false;
      }
    }

    // 检查语义标签
    if (condition.semantic && attr.semantic) {
      const semantics = Array.isArray(condition.semantic)
        ? condition.semantic
        : [condition.semantic];
      if (!semantics.includes(attr.semantic as AttributeSemantic)) {
        return false;
      }
    }

    // 检查字段名
    if (condition.fieldName) {
      if (!condition.fieldName.includes(attr.name)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 从规则生成模板（属性触发）
   */
  private generateTemplateFromRule(
    rule: ConstraintTemplateRule,
    entity: Entity,
    attr: Attribute
  ): GeneratedConstraintTemplate | null {
    // 构建示例表达式
    const example = this.buildExampleExpression(
      rule.template.expressionTemplate,
      entity,
      attr
    );

    // 生成AST模板
    let astTemplate: ConstraintAST | undefined;
    try {
      astTemplate = this.buildAstTemplate(rule, entity, attr);
    } catch (e) {
      console.warn(`Failed to build AST for rule ${rule.id}:`, e);
    }

    return {
      templateId: rule.id,
      name: rule.name,
      description: rule.description,
      expressionTemplate: rule.template.expressionTemplate,
      example,
      params: rule.template.params,
      quickApply: {
        enabled: true,
        defaultParams: this.buildDefaultParams(rule, entity, attr),
      },
      astTemplate,
      constraintType: rule.template.constraintType,
      category: rule.template.category,
    };
  }

  /**
   * 从规则生成模板（关系触发）
   */
  private generateTemplateFromRuleForRelation(
    rule: ConstraintTemplateRule,
    fromEntity: Entity,
    toEntity: Entity,
    relationType: RelationType
  ): GeneratedConstraintTemplate | null {
    const example = rule.template.expressionTemplate
      .replace(/{taskA}/g, fromEntity.name)
      .replace(/{taskB}/g, toEntity.name)
      .replace(/{task}/g, fromEntity.name);

    return {
      templateId: rule.id,
      name: rule.name,
      description: rule.description,
      expressionTemplate: rule.template.expressionTemplate,
      example,
      params: rule.template.params,
      quickApply: {
        enabled: true,
      },
      constraintType: rule.template.constraintType,
      category: rule.template.category,
    };
  }

  /**
   * 构建示例表达式
   */
  private buildExampleExpression(
    template: string,
    entity: Entity,
    attr: Attribute
  ): string {
    return template
      .replace(/{entity}/g, entity.name.toLowerCase())
      .replace(/{line}/g, 'production_line')
      .replace(/{order}/g, 'production_order')
      .replace(/{task}/g, 'task')
      .replace(/{task1}/g, 'task_1')
      .replace(/{task2}/g, 'task_2')
      .replace(/{batch}/g, 'batch')
      .replace(/{resource}/g, 'resource')
      .replace(/{production}/g, 'production_batch')
      .replace(/{process}/g, 'process')
      .replace(/{line}\.capacity/g, 'production_line.capacity')
      .replace(/{order}\.quantity/g, 'production_order.quantity')
      .replace(/{task}\.start_time/g, 'task.start_time')
      .replace(/{task}\.end_time/g, 'task.end_time')
      .replace(/{attr}/g, attr.name);
  }

  /**
   * 构建默认参数
   */
  private buildDefaultParams(
    rule: ConstraintTemplateRule,
    entity: Entity,
    attr: Attribute
  ): Record<string, string> {
    const defaults: Record<string, string> = {};

    for (const param of rule.template.params) {
      if (param.defaultValue) {
        defaults[param.name] = param.defaultValue;
      } else if (param.name.includes('.')) {
        defaults[param.name] = attr.name;
      } else if (param.type === 'entity') {
        defaults[param.name] = entity.name.toLowerCase();
      }
    }

    return defaults;
  }

  /**
   * 构建AST模板
   */
  private buildAstTemplate(
    rule: ConstraintTemplateRule,
    entity: Entity,
    attr: Attribute
  ): ConstraintAST {
    switch (rule.id) {
      case 'capacity_001':
        return createCapacityConstraint(
          'order',
          'quantity',
          entity.name.toLowerCase(),
          attr.name
        );
      case 'time_001':
        return createPrecedenceConstraint('task_1', 'task_2', 0);
      case 'dependency_001':
        return createDependencyConstraint('task_a', 'task_b');
      default:
        throw new Error(`AST template not implemented for rule ${rule.id}`);
    }
  }
}

// ============================================
// 4. 快捷使用函数
// ============================================

let defaultEngine: ConstraintTemplateEngine | null = null;

/**
 * 获取默认模板引擎实例
 */
export function getTemplateEngine(): ConstraintTemplateEngine {
  if (!defaultEngine) {
    defaultEngine = new ConstraintTemplateEngine();
  }
  return defaultEngine;
}

/**
 * 分析实体并返回推荐的约束模板
 */
export function recommendConstraints(entity: Entity): GeneratedConstraintTemplate[] {
  return getTemplateEngine().generateTemplates(entity);
}

/**
 * 基于关系推荐约束
 */
export function recommendConstraintsForRelation(
  fromEntity: Entity,
  toEntity: Entity,
  relationType: RelationType
): GeneratedConstraintTemplate[] {
  return getTemplateEngine().generateTemplatesForRelation(fromEntity, toEntity, relationType);
}

// ============================================
// 5. 导出单例
// ============================================

export const constraintTemplateEngine = getTemplateEngine();
