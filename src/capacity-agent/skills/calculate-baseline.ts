/**
 * 技能：计算产能基线
 * 基于历史生产记录计算产线的基准产能
 */

import { entityStore } from '../ontology/entity-store';

export interface BaselineResult {
  lineId: string;
  baselineCapacity: number;      // 基线产能（件/天）
  averageOEE: number;            // 平均OEE
  averageAvailability: number;   // 平均可用率
  averagePerformance: number;    // 平均性能率
  averageQuality: number;        // 平均良品率
  dataPoints: number;            // 数据点数
  confidence: number;            // 置信度
}

export interface BaselineParams {
  lineId: string;
  daysOfHistory?: number;        // 使用多少天的历史数据（默认30天）
  excludeOutliers?: boolean;     // 是否排除异常值
  outlierThreshold?: number;     // 异常值阈值（标准差倍数）
}

/**
 * 计算产线产能基线
 */
export function calculateBaseline(params: BaselineParams): BaselineResult {
  const {
    lineId,
    daysOfHistory = 30,
    excludeOutliers = true,
    outlierThreshold = 2
  } = params;

  // 获取产线的生产记录
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOfHistory);

  const records = entityStore
    .findByCriteria('ProductionRecord', { lineId })
    .filter(r => new Date(r.data.date) >= cutoffDate)
    .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());

  if (records.length === 0) {
    throw new Error(`产线 ${lineId} 没有足够的生产记录用于计算基线`);
  }

  // 提取实际产量和OEE数据
  let actualQuantities = records.map(r => r.data.actualQty as number);
  let oeeValues = records.map(r => r.data.oee as number).filter(v => v !== undefined);
  let availabilityValues = records.map(r => r.data.availability as number).filter(v => v !== undefined);
  let performanceValues = records.map(r => r.data.performance as number).filter(v => v !== undefined);
  let qualityValues = records.map(r => r.data.qualityRate as number).filter(v => v !== undefined);

  // 排除异常值
  if (excludeOutliers && actualQuantities.length > 5) {
    const mean = actualQuantities.reduce((a, b) => a + b, 0) / actualQuantities.length;
    const std = Math.sqrt(actualQuantities.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / actualQuantities.length);
    const validIndices = actualQuantities
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => Math.abs(v - mean) <= outlierThreshold * std)
      .map(({ i }) => i);

    actualQuantities = validIndices.map(i => actualQuantities[i]);
    oeeValues = validIndices.map(i => oeeValues[i]).filter(v => v !== undefined);
    availabilityValues = validIndices.map(i => availabilityValues[i]).filter(v => v !== undefined);
    performanceValues = validIndices.map(i => performanceValues[i]).filter(v => v !== undefined);
    qualityValues = validIndices.map(i => qualityValues[i]).filter(v => v !== undefined);
  }

  // 计算基线产能（使用中位数更稳健）
  const sorted = [...actualQuantities].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // 计算平均值
  const averageOEE = oeeValues.length > 0
    ? oeeValues.reduce((a, b) => a + b, 0) / oeeValues.length
    : 0;
  const averageAvailability = availabilityValues.length > 0
    ? availabilityValues.reduce((a, b) => a + b, 0) / availabilityValues.length
    : 0;
  const averagePerformance = performanceValues.length > 0
    ? performanceValues.reduce((a, b) => a + b, 0) / performanceValues.length
    : 0;
  const averageQuality = qualityValues.length > 0
    ? qualityValues.reduce((a, b) => a + b, 0) / qualityValues.length
    : 0;

  // 计算置信度（基于数据点数）
  const confidence = Math.min(records.length / daysOfHistory, 1) * 0.8 +
    (excludeOutliers ? 0.1 : 0) +
    (oeeValues.length > 0 ? 0.1 : 0);

  return {
    lineId,
    baselineCapacity: Math.round(median),
    averageOEE: Math.round(averageOEE * 100) / 100,
    averageAvailability: Math.round(averageAvailability * 100) / 100,
    averagePerformance: Math.round(averagePerformance * 100) / 100,
    averageQuality: Math.round(averageQuality * 100) / 100,
    dataPoints: records.length,
    confidence: Math.round(confidence * 100) / 100
  };
}

/**
 * 计算多个产线的基线
 */
export function calculateBaselineForLines(lineIds: string[], params?: Omit<BaselineParams, 'lineId'>): BaselineResult[] {
  return lineIds.map(lineId => calculateBaseline({ lineId, ...params }));
}
