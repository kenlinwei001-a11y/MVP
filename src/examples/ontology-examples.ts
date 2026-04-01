/**
 * 本体配置器 - 时态约束、派生规则、Action 定义示例
 *
 * 展示如何使用新添加的三大核心功能
 */

import type {
  TemporalConstraint,
  DerivedProperty,
  DerivedLink,
  ActionDefinition,
} from '../types/ontology-schema';

import {
  createTemporalTimeWindow,
  createTemporalDuration,
  createTemporalGap,
  createDerivedCalculation,
  createDerivedAggregation,
  createActionStateTransition,
} from '../engine/constraint-template-engine';

// 导入 AST 类型
import type {
  TemporalConstraintNode,
  DerivedPropertyNode,
  ActionTriggerNode,
} from '../types/constraint-ast';

// 工具函数可以从 constraint-ast 导入
// import {
//   createBinaryOp,
//   createField,
//   createLiteral,
// } from '../types/constraint-ast';

// ============================================
// 示例 1: 时态约束 (Temporal Constraints)
// ============================================

/**
 * 示例 1.1: 时间窗口约束
 * 场景：搅拌工序必须在白班时间 (08:00-18:00) 执行
 */
export const exampleTimeWindowConstraint: TemporalConstraint = {
  id: 'temporal_001',
  name: '搅拌工序白班时间窗口',
  type: 'time_window',
  targetEntity: 'mixing_process',
  timeParameters: {
    timeWindow: {
      start: '08:00',
      end: '18:00',
    },
  },
  businessRule: '搅拌工序必须在白班时间内执行，确保质量人员在场',
  violationAction: 'block',
  enabled: true,
};

/**
 * 示例 1.2: 持续时间约束
 * 场景：化成工序必须持续 45-60 分钟
 */
export const exampleDurationConstraint: TemporalConstraint = {
  id: 'temporal_002',
  name: '化成工序持续时间',
  type: 'min_duration',
  targetEntity: 'formation_process',
  timeParameters: {
    minDuration: 45,
    maxDuration: 60,
  },
  businessRule: '化成时间不足会影响电芯性能，过长则浪费产能',
  violationAction: 'warn',
  enabled: true,
};

/**
 * 示例 1.3: 时间间隔约束
 * 场景：涂布后必须在 30 分钟内进行辊压（防止极片吸水）
 */
export const exampleTimeGapConstraint: TemporalConstraint = {
  id: 'temporal_003',
  name: '涂布-辊压最大间隔',
  type: 'max_gap',
  targetEntity: 'calendering_process',
  referenceEntity: 'coating_process',
  timeParameters: {
    maxGap: 30,
  },
  businessRule: '涂布后极片暴露时间过长会吸收水分，影响电池性能',
  violationAction: 'auto_adjust',
  enabled: true,
};

/**
 * 示例 1.4: 周期性约束
 * 场景：设备必须每 8 小时进行一次维护检查
 */
export const examplePeriodicConstraint: TemporalConstraint = {
  id: 'temporal_004',
  name: '设备定期维护',
  type: 'periodic',
  targetEntity: 'mixing_equipment',
  timeParameters: {
    periodic: {
      interval: 8,
      unit: 'hour',
    },
  },
  businessRule: '每8小时必须停机检查设备运行状态',
  violationAction: 'notify',
  enabled: true,
};

// ============================================
// 示例 2: 派生规则 (Derived Rules)
// ============================================

/**
 * 示例 2.1: 计算属性派生
 * 场景：OEE = 实际产量 / 理论产能 × 100%
 */
export const exampleOEEDerivedProperty: DerivedProperty = {
  id: 'derived_001',
  name: '设备OEE',
  entityId: 'mixing_equipment',
  type: 'calculated_property',
  calculation: {
    formula: '(actual_output / theoretical_capacity) * 100',
    dependencies: ['actual_output', 'theoretical_capacity'],
  },
  refreshStrategy: {
    mode: 'realtime',
    eventTriggers: ['production_completed', 'shift_end'],
  },
  output: {
    dataType: 'percentage',
    format: '0.00%',
    validation: '>= 0 AND <= 100',
  },
  enabled: true,
};

/**
 * 示例 2.2: 聚合属性派生
 * 场景：当日总产量 = SUM(所有批次的产量)
 */
export const exampleTotalOutputDerivedProperty: DerivedProperty = {
  id: 'derived_002',
  name: '当日总产量',
  entityId: 'production_line',
  type: 'aggregated_property',
  calculation: {
    formula: 'SUM(batch.output_quantity)',
    dependencies: ['batch.output_quantity'],
    aggregation: {
      function: 'SUM',
      targetEntity: 'batch',
      filter: 'DATE(complete_time) = CURRENT_DATE',
      groupBy: ['production_line_id'],
    },
  },
  refreshStrategy: {
    mode: 'scheduled',
    cron: '0 */1 * * *', // 每小时更新
  },
  output: {
    dataType: 'float',
    unit: 'pcs',
  },
  enabled: true,
};

/**
 * 示例 2.3: 推断属性派生
 * 场景：根据温度和压力推断设备状态
 */
export const exampleInferredStatusProperty: DerivedProperty = {
  id: 'derived_003',
  name: '设备健康状态',
  entityId: 'mixing_equipment',
  type: 'inferred_property',
  calculation: {
    formula: 'IF temperature > 80 AND vibration > 5 THEN "warning" ELSE "normal"',
    dependencies: ['temperature', 'vibration'],
    inferenceRule: {
      conditions: [
        'temperature > 80',
        'vibration > 5',
      ],
      conclusion: 'status = "warning"',
      confidence: 0.85,
    },
  },
  refreshStrategy: {
    mode: 'realtime',
    eventTriggers: ['sensor_update'],
  },
  output: {
    dataType: 'enum',
    format: 'normal|warning|critical',
  },
  enabled: true,
};

/**
 * 示例 2.4: 传递关系派生
 * 场景：如果 A 是 B 的供应商，B 是 C 的供应商，则 A 是 C 的间接供应商
 */
export const exampleTransitiveDerivedLink: DerivedLink = {
  id: 'derived_link_001',
  name: '间接供应关系',
  type: 'depends_on',
  sourceEntity: 'supplier_a',
  targetEntity: 'supplier_c',
  derivation: {
    type: 'transitive_link',
    transitiveRule: {
      intermediateEntity: 'supplier_b',
      intermediateRelation: 'supplies',
    },
  },
  enabled: true,
};

// ============================================
// 示例 3: Action 定义 (Action Definitions)
// ============================================

/**
 * 示例 3.1: 状态转换 Action
 * 场景：当订单优先级为高时，自动分配给最快产线并启动
 */
export const exampleHighPriorityOrderAction: ActionDefinition = {
  id: 'action_001',
  name: '高优先级订单自动分配',
  type: 'assign',
  trigger: {
    mode: 'automatic',
    conditions: ['order.priority == "high"', 'order.status == "pending"'],
  },
  preconditions: {
    expressions: ['production_line.available_capacity >= order.quantity'],
    failureAction: 'warn',
  },
  stateTransition: {
    fromState: 'pending',
    toState: 'assigned',
    entityType: 'Order',
  },
  operations: [
    {
      type: 'update_property',
      target: 'order.assigned_line',
      parameters: { value: 'SELECT_FASTEST_AVAILABLE_LINE()' },
      order: 1,
    },
    {
      type: 'update_property',
      target: 'order.status',
      parameters: { value: '"assigned"' },
      order: 2,
    },
    {
      type: 'emit_event',
      target: 'order_assigned',
      parameters: { order_id: 'order.id', line_id: 'order.assigned_line' },
      order: 3,
    },
  ],
  postEffects: {
    propertyUpdates: [
      { propertyId: 'production_line.available_capacity', valueExpression: 'capacity - order.quantity' },
    ],
    eventsToEmit: [
      { eventType: 'capacity_changed', payload: { line_id: 'order.assigned_line' } },
    ],
  },
  enabled: true,
};

/**
 * 示例 3.2: 质量检验 Action
 * 场景：当质检不合格时，自动触发返工流程
 */
export const exampleQualityRejectAction: ActionDefinition = {
  id: 'action_002',
  name: '质检不合格自动返工',
  type: 'reject',
  trigger: {
    mode: 'event_driven',
    eventTypes: ['qc_inspection_completed'],
    conditions: ['qc_result.status == "fail"'],
  },
  preconditions: {
    expressions: ['batch.rework_count < 3'],
    failureAction: 'block',
  },
  stateTransition: {
    fromState: 'qc_failed',
    toState: 'rework',
    entityType: 'Batch',
  },
  operations: [
    {
      type: 'create_entity',
      target: 'rework_task',
      parameters: {
        batch_id: 'batch.id',
        rework_reason: 'qc_result.failure_reason',
        priority: '"high"',
      },
      order: 1,
    },
    {
      type: 'update_property',
      target: 'batch.rework_count',
      parameters: { value: 'batch.rework_count + 1' },
      order: 2,
    },
    {
      type: 'create_link',
      target: 'batch-rework_task',
      parameters: { relation: '"requires_rework"' },
      order: 3,
    },
  ],
  postEffects: {
    propertyUpdates: [
      { propertyId: 'batch.status', valueExpression: '"rework"' },
    ],
    eventsToEmit: [
      { eventType: 'rework_triggered', payload: { batch_id: 'batch.id', reason: 'qc_result.failure_reason' } },
    ],
  },
  compensation: {
    condition: 'rework_task.creation_failed',
    operations: ['RESTORE(batch.status)', 'DECREMENT(batch.rework_count)'],
  },
  enabled: true,
};

/**
 * 示例 3.3: 定时维护 Action
 * 场景：设备运行满 8 小时，自动创建维护任务
 */
export const exampleScheduledMaintenanceAction: ActionDefinition = {
  id: 'action_003',
  name: '设备定期维护',
  type: 'schedule',
  trigger: {
    mode: 'scheduled',
    cron: '0 */8 * * *', // 每8小时检查一次
    conditions: ['equipment.runtime_hours >= 8'],
  },
  preconditions: {
    expressions: ['equipment.status == "running" OR equipment.status == "idle"'],
    failureAction: 'log',
  },
  stateTransition: {
    fromState: 'running',
    toState: 'maintenance',
    entityType: 'PhysicalResource',
  },
  operations: [
    {
      type: 'update_property',
      target: 'equipment.status',
      parameters: { value: '"maintenance_required"' },
      order: 1,
    },
    {
      type: 'create_entity',
      target: 'maintenance_task',
      parameters: {
        equipment_id: 'equipment.id',
        task_type: '"routine"',
        priority: '"medium"',
      },
      order: 2,
    },
    {
      type: 'call_service',
      target: 'notify_maintenance_team',
      parameters: { equipment_id: 'equipment.id', location: 'equipment.location' },
      order: 3,
    },
  ],
  postEffects: {
    propertyUpdates: [
      { propertyId: 'equipment.last_maintenance_time', valueExpression: 'NOW()' },
    ],
    eventsToEmit: [
      { eventType: 'maintenance_scheduled', payload: { equipment_id: 'equipment.id' } },
    ],
  },
  enabled: true,
};

// ============================================
// 示例 4: 使用工厂函数快速创建
// ============================================

/**
 * 使用工厂函数创建时态约束
 */
export function createExampleTemporalConstraints(): TemporalConstraintNode[] {
  // 时间窗口约束：工序必须在白班执行
  const timeWindowConstraint = createTemporalTimeWindow(
    'mixing_process',
    'start_time',
    '08:00',
    '18:00'
  );

  // 持续时间约束：化成必须持续 45-60 分钟
  const durationConstraint = createTemporalDuration(
    'formation_process',
    'duration',
    { minDuration: 45, maxDuration: 60 }
  );

  // 时间间隔约束：涂布后 30 分钟内必须辊压
  const gapConstraint = createTemporalGap(
    'coating_process',
    'calendering_process',
    'end_time',
    'start_time',
    { maxGap: 30 }
  );

  return [timeWindowConstraint, durationConstraint, gapConstraint];
}

/**
 * 使用工厂函数创建派生属性
 */
export function createExampleDerivedProperties(): DerivedPropertyNode[] {
  // OEE 计算
  const oeeProperty = createDerivedCalculation(
    'mixing_equipment',
    'oee',
    // 这里应该传入 ASTNode 类型的 formula
    {} as any, // 简化示例，实际使用时传入正确的 AST
    ['actual_output', 'theoretical_capacity']
  );

  // 总产量聚合
  const totalOutputProperty = createDerivedAggregation(
    'production_line',
    'total_output',
    'SUM',
    'batch',
    'output_quantity'
  );

  return [oeeProperty, totalOutputProperty];
}

/**
 * 使用工厂函数创建 Action
 */
export function createExampleActions(): ActionTriggerNode[] {
  // 状态转换 Action：订单从 pending 转为 assigned
  const stateTransitionAction = createActionStateTransition(
    'order',
    'pending',
    'assigned',
    [] // 条件列表
  );

  return [stateTransitionAction];
}

// ============================================
// 导出所有示例
// ============================================
export const ontologyExamples = {
  temporalConstraints: [
    exampleTimeWindowConstraint,
    exampleDurationConstraint,
    exampleTimeGapConstraint,
    examplePeriodicConstraint,
  ],
  derivedProperties: [
    exampleOEEDerivedProperty,
    exampleTotalOutputDerivedProperty,
    exampleInferredStatusProperty,
  ],
  derivedLinks: [
    exampleTransitiveDerivedLink,
  ],
  actions: [
    exampleHighPriorityOrderAction,
    exampleQualityRejectAction,
    exampleScheduledMaintenanceAction,
  ],
};

export default ontologyExamples;
