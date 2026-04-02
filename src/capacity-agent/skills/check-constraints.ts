/**
 * 技能：检查约束
 * 验证产能预测是否满足各种约束条件
 */

import { entityStore } from '../ontology/entity-store';
import { ForecastResult } from './forecast-capacity';

export type ConstraintType = 'hard' | 'soft' | 'warning';
export type ConstraintStatus = 'satisfied' | 'violated' | 'warning';

export interface Constraint {
  id: string;
  name: string;
  type: ConstraintType;
  description: string;
  check: (context: ConstraintContext) => ConstraintResult;
}

export interface ConstraintContext {
  lineId: string;
  forecast: ForecastResult;
  baseline: number;
  orders: any[];
  equipment: any[];
}

export interface ConstraintResult {
  constraintId: string;
  status: ConstraintStatus;
  message: string;
  details?: Record<string, any>;
  suggestedAction?: string;
}

export interface ConstraintCheckResult {
  overallStatus: 'pass' | 'fail' | 'warning';
  results: ConstraintResult[];
  violations: ConstraintResult[];
  warnings: ConstraintResult[];
}

// ==================== 预定义约束规则 ====================

/**
 * 硬约束：产能不能超过理论最大产能
 */
const MaxCapacityConstraint: Constraint = {
  id: 'constraint-max-capacity',
  name: '最大产能限制',
  type: 'hard',
  description: '预测产能不能超过产线理论最大产能',
  check: (context) => {
    const productionLine = entityStore.findByCriteria('ProductionLine', { lineId: context.lineId })[0];
    if (!productionLine) {
      return {
        constraintId: 'constraint-max-capacity',
        status: 'violated',
        message: '未找到产线信息'
      };
    }

    const theoreticalCapacity = productionLine.data.theoreticalCapacity as number;
    const shiftCount = productionLine.data.shiftCount as number || 3;
    const hoursPerShift = productionLine.data.hoursPerShift as number || 8;

    // 计算理论日产能
    const dailyTheoreticalCapacity = theoreticalCapacity * hoursPerShift * shiftCount;
    const maxPredicted = Math.max(...context.forecast.predictions.map(p => p.predictedCapacity));

    if (maxPredicted > dailyTheoreticalCapacity) {
      return {
        constraintId: 'constraint-max-capacity',
        status: 'violated',
        message: `预测产能 ${maxPredicted} 超过理论最大产能 ${dailyTheoreticalCapacity}`,
        details: {
          maxPredicted,
          dailyTheoreticalCapacity,
          overage: maxPredicted - dailyTheoreticalCapacity,
          overagePercent: ((maxPredicted - dailyTheoreticalCapacity) / dailyTheoreticalCapacity * 100).toFixed(2)
        },
        suggestedAction: '调整预测参数或增加班次/工作时间'
      };
    }

    return {
      constraintId: 'constraint-max-capacity',
      status: 'satisfied',
      message: '预测产能在理论最大产能范围内',
      details: { maxPredicted, dailyTheoreticalCapacity }
    };
  }
};

/**
 * 硬约束：OEE约束
 */
const OEEConstraint: Constraint = {
  id: 'constraint-oee',
  name: 'OEE目标约束',
  type: 'hard',
  description: '预测OEE不应低于目标OEE',
  check: (context) => {
    const productionLine = entityStore.findByCriteria('ProductionLine', { lineId: context.lineId })[0];
    if (!productionLine) {
      return {
        constraintId: 'constraint-oee',
        status: 'violated',
        message: '未找到产线信息'
      };
    }

    const oeeTarget = productionLine.data.oeeTarget as number || 85;

    // 根据预测产能反推OEE
    const theoreticalCapacity = productionLine.data.theoreticalCapacity as number;
    const shiftCount = productionLine.data.shiftCount as number || 3;
    const hoursPerShift = productionLine.data.hoursPerShift as number || 8;
    const dailyTheoreticalCapacity = theoreticalCapacity * hoursPerShift * shiftCount;

    const minPredicted = Math.min(...context.forecast.predictions.map(p => p.predictedCapacity));
    const impliedOEE = (minPredicted / dailyTheoreticalCapacity) * 100;

    if (impliedOEE < oeeTarget - 10) { // 允许10%的缓冲
      return {
        constraintId: 'constraint-oee',
        status: 'violated',
        message: `预测隐含OEE ${impliedOEE.toFixed(2)}% 远低于目标OEE ${oeeTarget}%`,
        details: { impliedOEE: impliedOEE.toFixed(2), oeeTarget, gap: (oeeTarget - impliedOEE).toFixed(2) },
        suggestedAction: '检查设备状态或调整生产计划'
      };
    }

    return {
      constraintId: 'constraint-oee',
      status: 'satisfied',
      message: '预测隐含OEE在可接受范围内',
      details: { impliedOEE: impliedOEE.toFixed(2), oeeTarget }
    };
  }
};

/**
 * 软约束：订单满足率
 */
const OrderFulfillmentConstraint: Constraint = {
  id: 'constraint-order-fulfillment',
  name: '订单满足率约束',
  type: 'soft',
  description: '预测产能应能满足已分配订单的需求',
  check: (context) => {
    const totalPredictedCapacity = context.forecast.predictions.reduce((sum, p) => sum + p.predictedCapacity, 0);

    // 计算订单总需求
    const totalOrderDemand = context.orders
      .filter(o => o.data.assignedLine === context.lineId && o.data.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.data.quantity as number), 0);

    if (totalOrderDemand === 0) {
      return {
        constraintId: 'constraint-order-fulfillment',
        status: 'satisfied',
        message: '无已分配订单',
        details: { totalPredictedCapacity }
      };
    }

    const fulfillmentRate = totalPredictedCapacity / totalOrderDemand;

    if (fulfillmentRate < 0.9) {
      return {
        constraintId: 'constraint-order-fulfillment',
        status: 'violated',
        message: `预测产能仅能满足 ${(fulfillmentRate * 100).toFixed(2)}% 的订单需求`,
        details: {
          totalPredictedCapacity,
          totalOrderDemand,
          fulfillmentRate: (fulfillmentRate * 100).toFixed(2),
          gap: totalOrderDemand - totalPredictedCapacity
        },
        suggestedAction: '考虑加班、增加班次或外包部分订单'
      };
    }

    return {
      constraintId: 'constraint-order-fulfillment',
      status: 'satisfied',
      message: `预测产能能满足 ${(fulfillmentRate * 100).toFixed(2)}% 的订单需求`,
      details: { totalPredictedCapacity, totalOrderDemand, fulfillmentRate: (fulfillmentRate * 100).toFixed(2) }
    };
  }
};

/**
 * 警告约束：设备维护
 */
const EquipmentMaintenanceConstraint: Constraint = {
  id: 'constraint-equipment-maintenance',
  name: '设备维护警告',
  type: 'warning',
  description: '检查预测期间是否有计划内维护',
  check: (context) => {
    const equipmentInLine = context.equipment.filter(e => e.data.lineId === context.lineId);

    const upcomingMaintenance = equipmentInLine.filter(e => {
      const nextMaintenance = e.data.nextMaintenance;
      if (!nextMaintenance) return false;
      const maintenanceDate = new Date(nextMaintenance as string);
      const forecastEndDate = new Date();
      forecastEndDate.setDate(forecastEndDate.getDate() + context.forecast.predictions.length);
      return maintenanceDate <= forecastEndDate;
    });

    if (upcomingMaintenance.length > 0) {
      return {
        constraintId: 'constraint-equipment-maintenance',
        status: 'warning',
        message: `预测期间有 ${upcomingMaintenance.length} 台设备计划维护`,
        details: {
          equipmentCount: upcomingMaintenance.length,
          equipment: upcomingMaintenance.map(e => ({
            name: e.data.name,
            nextMaintenance: e.data.nextMaintenance
          }))
        },
        suggestedAction: '在预测中考虑维护时间的影响'
      };
    }

    return {
      constraintId: 'constraint-equipment-maintenance',
      status: 'satisfied',
      message: '预测期间无计划内维护',
      details: { equipmentCount: equipmentInLine.length }
    };
  }
};

/**
 * 软约束：产能波动
 */
const CapacityVarianceConstraint: Constraint = {
  id: 'constraint-capacity-variance',
  name: '产能波动约束',
  type: 'soft',
  description: '产能预测波动不应过大',
  check: (context) => {
    const capacities = context.forecast.predictions.map(p => p.predictedCapacity);
    const avg = capacities.reduce((a, b) => a + b, 0) / capacities.length;
    const variance = capacities.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / capacities.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 0; // 变异系数

    if (cv > 0.3) { // 变异系数超过30%
      return {
        constraintId: 'constraint-capacity-variance',
        status: 'violated',
        message: `产能预测波动过大 (变异系数: ${(cv * 100).toFixed(2)}%)`,
        details: {
          averageCapacity: Math.round(avg),
          stdDev: Math.round(stdDev),
          cv: (cv * 100).toFixed(2)
        },
        suggestedAction: '检查预测参数或历史数据异常'
      };
    }

    return {
      constraintId: 'constraint-capacity-variance',
      status: 'satisfied',
      message: '产能预测波动在正常范围内',
      details: { cv: (cv * 100).toFixed(2) }
    };
  }
};

// ==================== 约束管理器 ====================

const defaultConstraints: Constraint[] = [
  MaxCapacityConstraint,
  OEEConstraint,
  OrderFulfillmentConstraint,
  EquipmentMaintenanceConstraint,
  CapacityVarianceConstraint
];

/**
 * 执行约束检查
 */
export function checkConstraints(
  lineId: string,
  forecast: ForecastResult,
  baseline: number,
  customConstraints?: Constraint[]
): ConstraintCheckResult {
  const constraints = customConstraints || defaultConstraints;

  // 准备上下文
  const orders = entityStore.findByType('Order');
  const equipment = entityStore.findByType('Equipment');

  const context: ConstraintContext = {
    lineId,
    forecast,
    baseline,
    orders,
    equipment
  };

  // 执行所有约束检查
  const results = constraints.map(constraint => constraint.check(context));

  // 分类结果
  const violations = results.filter(r => r.status === 'violated');
  const warnings = results.filter(r => r.status === 'warning');

  // 确定总体状态
  let overallStatus: 'pass' | 'fail' | 'warning';
  if (violations.length > 0) {
    overallStatus = 'fail';
  } else if (warnings.length > 0) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'pass';
  }

  return {
    overallStatus,
    results,
    violations,
    warnings
  };
}

/**
 * 获取默认约束列表
 */
export function getDefaultConstraints(): Constraint[] {
  return [...defaultConstraints];
}

/**
 * 注册自定义约束
 */
export function createConstraint(
  id: string,
  name: string,
  type: ConstraintType,
  description: string,
  checkFn: (context: ConstraintContext) => ConstraintResult
): Constraint {
  return {
    id,
    name,
    type,
    description,
    check: checkFn
  };
}
