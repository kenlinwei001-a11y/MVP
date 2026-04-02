/**
 * 技能：产能预测
 * 使用多种算法预测未来产能
 */

import { entityStore } from '../ontology/entity-store';
import { calculateBaseline } from './calculate-baseline';

export type ForecastAlgorithm = 'sma' | 'ema' | 'prophet' | 'linear' | 'weighted';

export interface ForecastParams {
  lineId: string;
  forecastDays: number;           // 预测天数
  algorithm?: ForecastAlgorithm;  // 预测算法
  confidenceLevel?: number;       // 置信水平（默认0.95）
  seasonality?: number;           // 周期性（天数，可选）
}

export interface ForecastResult {
  forecastId: string;
  lineId: string;
  algorithm: ForecastAlgorithm;
  forecastDate: string;
  predictions: DailyPrediction[];
  summary: ForecastSummary;
}

export interface DailyPrediction {
  date: string;
  predictedCapacity: number;
  confidenceLower: number;
  confidenceUpper: number;
  factors: PredictionFactors;
}

export interface PredictionFactors {
  baselineWeight: number;         // 基线权重
  trendWeight: number;            // 趋势权重
  seasonalWeight: number;         // 季节性权重
  workdayFactor: number;          // 工作日因子
}

export interface ForecastSummary {
  totalPredicted: number;         // 总预测产能
  averageDaily: number;           // 日均产能
  confidenceInterval: [number, number]; // 整体置信区间
  trendDirection: 'up' | 'down' | 'stable'; // 趋势方向
  trendPercentage: number;        // 趋势百分比
}

/**
 * 主预测函数
 */
export function forecastCapacity(params: ForecastParams): ForecastResult {
  const {
    lineId,
    forecastDays,
    algorithm = 'weighted',
    confidenceLevel = 0.95,
    seasonality = 7
  } = params;

  // 获取历史数据
  const historicalRecords = getHistoricalRecords(lineId, 60);
  if (historicalRecords.length < 7) {
    throw new Error(`产线 ${lineId} 历史数据不足，至少需要7天的数据`);
  }

  // 计算基线
  const baseline = calculateBaseline({ lineId, daysOfHistory: 30 });

  // 根据算法选择预测方法
  let predictions: DailyPrediction[];
  switch (algorithm) {
    case 'sma':
      predictions = smaForecast(historicalRecords, baseline, forecastDays, confidenceLevel);
      break;
    case 'ema':
      predictions = emaForecast(historicalRecords, baseline, forecastDays, confidenceLevel);
      break;
    case 'linear':
      predictions = linearForecast(historicalRecords, baseline, forecastDays, confidenceLevel);
      break;
    case 'prophet':
      predictions = prophetForecast(historicalRecords, baseline, forecastDays, confidenceLevel, seasonality);
      break;
    case 'weighted':
    default:
      predictions = weightedForecast(historicalRecords, baseline, forecastDays, confidenceLevel, seasonality);
  }

  // 生成预测汇总
  const summary = generateSummary(predictions, historicalRecords);

  // 创建预测结果实体
  const forecastId = `FC-${lineId}-${Date.now()}`;
  entityStore.create('CapacityForecast', {
    forecastId,
    lineId,
    forecastDate: new Date().toISOString(),
    predictedCapacity: Math.round(summary.averageDaily),
    confidenceLower: Math.round(summary.confidenceInterval[0]),
    confidenceUpper: Math.round(summary.confidenceInterval[1]),
    confidenceLevel,
    algorithm,
    riskLevel: calculateRiskLevel(summary, baseline)
  });

  return {
    forecastId,
    lineId,
    algorithm,
    forecastDate: new Date().toISOString(),
    predictions,
    summary
  };
}

/**
 * 获取历史生产记录
 */
function getHistoricalRecords(lineId: string, days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return entityStore
    .findByCriteria('ProductionRecord', { lineId })
    .filter(r => new Date(r.data.date) >= cutoffDate)
    .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime())
    .map(r => ({
      date: r.data.date as string,
      actualQty: r.data.actualQty as number,
      oee: r.data.oee as number || 0,
      plannedQty: r.data.plannedQty as number
    }));
}

/**
 * 简单移动平均预测
 */
function smaForecast(
  historical: any[],
  baseline: any,
  forecastDays: number,
  confidenceLevel: number
): DailyPrediction[] {
  const windowSize = Math.min(7, historical.length);
  const recentValues = historical.slice(-windowSize).map(h => h.actualQty);
  const average = recentValues.reduce((a, b) => a + b, 0) / windowSize;
  const stdDev = Math.sqrt(recentValues.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / windowSize);

  const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;
  const margin = zScore * stdDev;

  const predictions: DailyPrediction[] = [];
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const isWorkday = date.getDay() !== 0 && date.getDay() !== 6;

    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedCapacity: Math.round(average * (isWorkday ? 1 : 0)),
      confidenceLower: Math.round(Math.max(0, average - margin) * (isWorkday ? 1 : 0)),
      confidenceUpper: Math.round((average + margin) * (isWorkday ? 1 : 0)),
      factors: {
        baselineWeight: 0.7,
        trendWeight: 0.1,
        seasonalWeight: 0.2,
        workdayFactor: isWorkday ? 1 : 0
      }
    });
  }

  return predictions;
}

/**
 * 指数移动平均预测
 */
function emaForecast(
  historical: any[],
  baseline: any,
  forecastDays: number,
  confidenceLevel: number
): DailyPrediction[] {
  const alpha = 0.3; // 平滑因子
  const values = historical.map(h => h.actualQty);

  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }

  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - ema, 2), 0) / values.length);
  const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;
  const margin = zScore * stdDev;

  const predictions: DailyPrediction[] = [];
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const isWorkday = date.getDay() !== 0 && date.getDay() !== 6;

    // EMA 预测趋势延续
    const trendFactor = 1 + (i * 0.005); // 轻微增长趋势

    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedCapacity: Math.round(ema * trendFactor * (isWorkday ? 1 : 0)),
      confidenceLower: Math.round(Math.max(0, ema - margin) * (isWorkday ? 1 : 0)),
      confidenceUpper: Math.round((ema + margin) * trendFactor * (isWorkday ? 1 : 0)),
      factors: {
        baselineWeight: 0.5,
        trendWeight: 0.3,
        seasonalWeight: 0.2,
        workdayFactor: isWorkday ? 1 : 0
      }
    });
  }

  return predictions;
}

/**
 * 线性回归预测
 */
function linearForecast(
  historical: any[],
  baseline: any,
  forecastDays: number,
  confidenceLevel: number
): DailyPrediction[] {
  const n = historical.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historical.map(h => h.actualQty);

  // 计算线性回归系数
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 计算标准误差
  const predictions_y = x.map(xi => slope * xi + intercept);
  const residuals = y.map((yi, i) => yi - predictions_y[i]);
  const stdError = Math.sqrt(residuals.reduce((sq, r) => sq + r * r, 0) / (n - 2));

  const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;

  const predictions: DailyPrediction[] = [];
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const isWorkday = date.getDay() !== 0 && date.getDay() !== 6;

    const x_new = n + i - 1;
    const predicted = slope * x_new + intercept;
    const margin = zScore * stdError * Math.sqrt(1 + 1/n + Math.pow(x_new - sumX/n, 2) / (sumXX - sumX*sumX/n));

    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedCapacity: Math.round(predicted * (isWorkday ? 1 : 0)),
      confidenceLower: Math.round(Math.max(0, predicted - margin) * (isWorkday ? 1 : 0)),
      confidenceUpper: Math.round((predicted + margin) * (isWorkday ? 1 : 0)),
      factors: {
        baselineWeight: 0.3,
        trendWeight: 0.5,
        seasonalWeight: 0.2,
        workdayFactor: isWorkday ? 1 : 0
      }
    });
  }

  return predictions;
}

/**
 * Prophet风格预测（简化版，支持季节性）
 */
function prophetForecast(
  historical: any[],
  baseline: any,
  forecastDays: number,
  confidenceLevel: number,
  seasonality: number
): DailyPrediction[] {
  // 先计算线性趋势
  const n = historical.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historical.map(h => h.actualQty);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 计算季节性因子
  const seasonalFactors: number[] = [];
  for (let day = 0; day < seasonality; day++) {
    const dayValues = y.filter((_, i) => i % seasonality === day);
    const dayAvg = dayValues.reduce((a, b) => a + b, 0) / (dayValues.length || 1);
    const overallAvg = sumY / n;
    seasonalFactors.push(dayAvg / overallAvg);
  }

  const stdDev = Math.sqrt(y.reduce((sq, n) => sq + Math.pow(n - (slope * n + intercept), 2), 0) / n);
  const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;
  const margin = zScore * stdDev;

  const predictions: DailyPrediction[] = [];
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWorkday = dayOfWeek !== 0 && dayOfWeek !== 6;

    const x_new = n + i - 1;
    const trend = slope * x_new + intercept;
    const seasonal = seasonalFactors[x_new % seasonality] || 1;

    const predicted = trend * seasonal * (isWorkday ? 1 : 0.3);

    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedCapacity: Math.round(predicted),
      confidenceLower: Math.round(Math.max(0, predicted - margin)),
      confidenceUpper: Math.round(predicted + margin),
      factors: {
        baselineWeight: 0.2,
        trendWeight: 0.4,
        seasonalWeight: 0.3,
        workdayFactor: isWorkday ? 1 : 0.3
      }
    });
  }

  return predictions;
}

/**
 * 加权综合预测（组合多种算法）
 */
function weightedForecast(
  historical: any[],
  baseline: any,
  forecastDays: number,
  confidenceLevel: number,
  seasonality: number
): DailyPrediction[] {
  // 运行多种算法
  const sma = smaForecast(historical, baseline, forecastDays, confidenceLevel);
  const ema = emaForecast(historical, baseline, forecastDays, confidenceLevel);
  const linear = linearForecast(historical, baseline, forecastDays, confidenceLevel);

  // 加权组合
  const weights = { sma: 0.2, ema: 0.3, linear: 0.5 };

  const predictions: DailyPrediction[] = [];
  for (let i = 0; i < forecastDays; i++) {
    const predictedCapacity = Math.round(
      sma[i].predictedCapacity * weights.sma +
      ema[i].predictedCapacity * weights.ema +
      linear[i].predictedCapacity * weights.linear
    );

    const confidenceLower = Math.round(
      sma[i].confidenceLower * weights.sma +
      ema[i].confidenceLower * weights.ema +
      linear[i].confidenceLower * weights.linear
    );

    const confidenceUpper = Math.round(
      sma[i].confidenceUpper * weights.sma +
      ema[i].confidenceUpper * weights.ema +
      linear[i].confidenceUpper * weights.linear
    );

    predictions.push({
      date: sma[i].date,
      predictedCapacity,
      confidenceLower,
      confidenceUpper,
      factors: {
        baselineWeight: 0.3,
        trendWeight: 0.4,
        seasonalWeight: 0.2,
        workdayFactor: sma[i].factors.workdayFactor
      }
    });
  }

  return predictions;
}

/**
 * 生成预测汇总
 */
function generateSummary(predictions: DailyPrediction[], historical: any[]): ForecastSummary {
  const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedCapacity, 0);
  const averageDaily = totalPredicted / predictions.length;

  const allLower = predictions.map(p => p.confidenceLower);
  const allUpper = predictions.map(p => p.confidenceUpper);
  const confidenceInterval: [number, number] = [
    allLower.reduce((a, b) => a + b, 0) / allLower.length,
    allUpper.reduce((a, b) => a + b, 0) / allUpper.length
  ];

  // 计算趋势
  const recentAvg = historical.slice(-7).reduce((sum, h) => sum + h.actualQty, 0) / 7;
  const trendDiff = averageDaily - recentAvg;
  const trendPercentage = (trendDiff / recentAvg) * 100;

  let trendDirection: 'up' | 'down' | 'stable';
  if (Math.abs(trendPercentage) < 2) {
    trendDirection = 'stable';
  } else if (trendPercentage > 0) {
    trendDirection = 'up';
  } else {
    trendDirection = 'down';
  }

  return {
    totalPredicted: Math.round(totalPredicted),
    averageDaily: Math.round(averageDaily),
    confidenceInterval,
    trendDirection,
    trendPercentage: Math.round(trendPercentage * 100) / 100
  };
}

/**
 * 计算风险等级
 */
function calculateRiskLevel(summary: ForecastSummary, baseline: any): string {
  if (summary.trendDirection === 'down' && summary.trendPercentage < -10) {
    return 'critical';
  } else if (summary.trendDirection === 'down' && summary.trendPercentage < -5) {
    return 'high';
  } else if (summary.trendDirection === 'stable' && summary.confidenceInterval[1] - summary.confidenceInterval[0] > summary.averageDaily * 0.3) {
    return 'medium';
  }
  return 'low';
}
