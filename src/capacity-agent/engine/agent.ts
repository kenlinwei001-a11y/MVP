/**
 * 产线产能预测 Agent
 * 主控制器，协调本体、技能和约束进行产能预测
 */

import { entityStore, EntityInstance } from '../ontology/entity-store';
import { calculateBaseline, BaselineResult } from '../skills/calculate-baseline';
import { forecastCapacity, ForecastResult, ForecastParams } from '../skills/forecast-capacity';
import { checkConstraints, ConstraintCheckResult, Constraint } from '../skills/check-constraints';
import { importData, ImportConfig, ImportResult } from '../data/excel-importer';

export type AgentStatus = 'idle' | 'importing' | 'analyzing' | 'forecasting' | 'checking' | 'completed' | 'error';

export interface AgentState {
  status: AgentStatus;
  currentTask?: string;
  progress: number;
  messages: AgentMessage[];
}

export interface AgentMessage {
  type: 'info' | 'warning' | 'error' | 'success';
  content: string;
  timestamp: string;
}

export interface ForecastRequest {
  lineId: string;
  forecastDays: number;
  algorithm?: 'sma' | 'ema' | 'prophet' | 'linear' | 'weighted';
  confidenceLevel?: number;
}

export interface ForecastReport {
  request: ForecastRequest;
  baseline: BaselineResult;
  forecast: ForecastResult;
  constraints: ConstraintCheckResult;
  recommendations: Recommendation[];
  generatedAt: string;
}

export interface Recommendation {
  type: 'capacity' | 'schedule' | 'equipment' | 'order';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
}

/**
 * CapacityForecastAgent - 产能预测Agent主类
 */
export class CapacityForecastAgent {
  private state: AgentState;
  private listeners: Set<(state: AgentState) => void>;

  constructor() {
    this.state = {
      status: 'idle',
      progress: 0,
      messages: []
    };
    this.listeners = new Set();
  }

  /**
   * 获取当前状态
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: AgentState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 更新状态
   */
  private updateState(updates: Partial<AgentState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * 添加消息
   */
  private log(type: AgentMessage['type'], content: string) {
    const message: AgentMessage = {
      type,
      content,
      timestamp: new Date().toISOString()
    };
    this.updateState({
      messages: [...this.state.messages, message]
    });
  }

  /**
   * 导入数据文件
   */
  async importData(file: File, config?: ImportConfig): Promise<ImportResult> {
    this.updateState({ status: 'importing', currentTask: '导入数据中...', progress: 10 });
    this.log('info', `开始导入文件: ${file.name}`);

    try {
      // 如果没有提供配置，尝试根据文件名自动识别
      const importConfig = config || this.detectImportConfig(file.name);
      if (!importConfig) {
        throw new Error(`无法识别文件类型: ${file.name}，请提供导入配置`);
      }

      // 读取文件内容
      const content = await this.readFile(file);
      this.updateState({ progress: 30 });

      // 解析CSV数据
      const data = this.parseCSV(content);
      this.updateState({ progress: 50 });

      // 导入数据
      const result = importData(data, importConfig);
      this.updateState({ progress: 90 });

      if (result.success) {
        this.log('success', `成功导入 ${result.imported} 条${importConfig.entityType}数据`);

        // 自动创建关系
        await this.autoCreateRelations(importConfig.entityType, result.createdIds);
      } else {
        this.log('warning', `导入完成，但有 ${result.failed} 条记录失败`);
      }

      this.updateState({ status: 'idle', progress: 100 });
      return result;
    } catch (error) {
      this.updateState({ status: 'error' });
      this.log('error', `导入失败: ${error}`);
      throw error;
    }
  }

  /**
   * 读取文件内容
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  /**
   * 解析CSV
   */
  private parseCSV(content: string): string[][] {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => line.split(',').map(cell => cell.trim()));
  }

  /**
   * 检测导入配置
   */
  private detectImportConfig(filename: string): ImportConfig | null {
    const { getImportConfigByFilename } = require('../data/excel-importer');
    return getImportConfigByFilename(filename);
  }

  /**
   * 自动创建本体关系
   */
  private async autoCreateRelations(entityType: string, entityIds: string[]): Promise<void> {
    this.log('info', `自动创建${entityType}的关系...`);

    for (const entityId of entityIds) {
      const entity = entityStore.get(entityId);
      if (!entity) continue;

      switch (entityType) {
        case 'Equipment':
          // 设备 -> 产线
          const lineId = entity.data.lineId;
          if (lineId) {
            const lines = entityStore.findByCriteria('ProductionLine', { lineId });
            if (lines.length > 0) {
              entityStore.createRelation(entityId, lines[0].id, 'installedIn');
            }
          }
          break;

        case 'ProductionRecord':
          // 生产记录 -> 产线
          const recordLineId = entity.data.lineId;
          if (recordLineId) {
            const lines = entityStore.findByCriteria('ProductionLine', { lineId: recordLineId });
            if (lines.length > 0) {
              entityStore.createRelation(entityId, lines[0].id, 'recordedBy');
            }
          }
          break;

        case 'Order':
          // 订单 -> 产线
          const assignedLine = entity.data.assignedLine;
          if (assignedLine) {
            const lines = entityStore.findByCriteria('ProductionLine', { lineId: assignedLine });
            if (lines.length > 0) {
              entityStore.createRelation(entityId, lines[0].id, 'assignedTo');
              // 创建产能需求
              await this.createCapacityRequirement(entity);
            }
          }
          break;
      }
    }
  }

  /**
   * 创建产能需求
   */
  private async createCapacityRequirement(order: EntityInstance): Promise<void> {
    const quantity = order.data.quantity as number;
    const deliveryDate = new Date(order.data.deliveryDate as string);
    const assignedLine = order.data.assignedLine as string;

    // 假设从今天开始到交付日期的期间
    const today = new Date();
    const daysDiff = Math.max(1, Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    entityStore.create('CapacityRequirement', {
      requirementId: `REQ-${order.data.orderId}`,
      lineId: assignedLine,
      periodStart: today.toISOString().split('T')[0],
      periodEnd: order.data.deliveryDate,
      requiredCapacity: quantity,
      fulfillmentStatus: 'unknown'
    });
  }

  /**
   * 执行完整预测流程
   */
  async executeForecast(request: ForecastRequest): Promise<ForecastReport> {
    const startTime = Date.now();

    try {
      // 1. 计算基线
      this.updateState({ status: 'analyzing', currentTask: '计算产能基线...', progress: 0 });
      const baseline = await this.calculateBaseline(request.lineId);
      this.updateState({ progress: 25 });

      // 2. 执行预测
      this.updateState({ status: 'forecasting', currentTask: '执行产能预测...' });
      const forecast = await this.runForecast(request);
      this.updateState({ progress: 60 });

      // 3. 检查约束
      this.updateState({ status: 'checking', currentTask: '检查约束条件...' });
      const constraints = await this.checkConstraints(request.lineId, forecast, baseline);
      this.updateState({ progress: 80 });

      // 4. 生成建议
      this.updateState({ currentTask: '生成优化建议...' });
      const recommendations = this.generateRecommendations(baseline, forecast, constraints);
      this.updateState({ progress: 100 });

      const report: ForecastReport = {
        request,
        baseline,
        forecast,
        constraints,
        recommendations,
        generatedAt: new Date().toISOString()
      };

      this.updateState({ status: 'completed' });
      this.log('success', `预测完成，耗时 ${Date.now() - startTime}ms`);

      return report;
    } catch (error) {
      this.updateState({ status: 'error' });
      this.log('error', `预测失败: ${error}`);
      throw error;
    }
  }

  /**
   * 计算产能基线
   */
  private async calculateBaseline(lineId: string): Promise<BaselineResult> {
    this.log('info', `计算产线 ${lineId} 的产能基线...`);

    try {
      const result = calculateBaseline({
        lineId,
        daysOfHistory: 30,
        excludeOutliers: true
      });

      this.log('success', `基线计算完成: ${result.baselineCapacity} 件/天`);
      return result;
    } catch (error) {
      this.log('error', `基线计算失败: ${error}`);
      throw error;
    }
  }

  /**
   * 执行预测
   */
  private async runForecast(request: ForecastRequest): Promise<ForecastResult> {
    this.log('info', `使用 ${request.algorithm || 'weighted'} 算法进行预测...`);

    const params: ForecastParams = {
      lineId: request.lineId,
      forecastDays: request.forecastDays,
      algorithm: request.algorithm || 'weighted',
      confidenceLevel: request.confidenceLevel || 0.95
    };

    const result = forecastCapacity(params);
    this.log('success', `预测完成: 日均产能 ${Math.round(result.summary.averageDaily)}`);

    return result;
  }

  /**
   * 检查约束
   */
  private async checkConstraints(
    lineId: string,
    forecast: ForecastResult,
    baseline: BaselineResult
  ): Promise<ConstraintCheckResult> {
    this.log('info', '检查约束条件...');

    const result = checkConstraints(lineId, forecast, baseline.baselineCapacity);

    if (result.overallStatus === 'fail') {
      this.log('warning', `发现 ${result.violations.length} 个约束违反`);
    } else if (result.overallStatus === 'warning') {
      this.log('warning', `发现 ${result.warnings.length} 个警告`);
    } else {
      this.log('success', '所有约束检查通过');
    }

    return result;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    baseline: BaselineResult,
    forecast: ForecastResult,
    constraints: ConstraintCheckResult
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 基于趋势的建议
    if (forecast.summary.trendDirection === 'down') {
      recommendations.push({
        type: 'capacity',
        priority: 'high',
        title: '产能下降趋势',
        description: `预测显示产能将下降 ${Math.abs(forecast.summary.trendPercentage)}%，建议调查原因`,
        actions: [
          '检查设备维护计划',
          '分析历史数据异常点',
          '评估人员配置'
        ]
      });
    }

    // 基于约束违反的建议
    for (const violation of constraints.violations) {
      if (violation.constraintId === 'constraint-max-capacity') {
        recommendations.push({
          type: 'schedule',
          priority: 'high',
          title: '产能不足',
          description: violation.message,
          actions: [
            violation.suggestedAction || '调整生产计划',
            '考虑加班或增加班次',
            '评估订单优先级'
          ]
        });
      }

      if (violation.constraintId === 'constraint-order-fulfillment') {
        recommendations.push({
          type: 'order',
          priority: 'high',
          title: '订单满足率不足',
          description: violation.message,
          actions: [
            violation.suggestedAction || '调整订单分配',
            '与客户协商交期',
            '寻找外协资源'
          ]
        });
      }
    }

    // 基于警告的建议
    for (const warning of constraints.warnings) {
      if (warning.constraintId === 'constraint-equipment-maintenance') {
        recommendations.push({
          type: 'equipment',
          priority: 'medium',
          title: '设备维护提醒',
          description: warning.message,
          actions: [
            warning.suggestedAction || '在预测中考虑维护时间',
            '提前准备备件',
            '安排替代产能'
          ]
        });
      }
    }

    // 基于置信区间的建议
    const confidenceRange = forecast.summary.confidenceInterval[1] - forecast.summary.confidenceInterval[0];
    const avgCapacity = forecast.summary.averageDaily;
    if (confidenceRange / avgCapacity > 0.3) {
      recommendations.push({
        type: 'capacity',
        priority: 'medium',
        title: '预测不确定性较高',
        description: '置信区间范围较大，预测结果可能存在较大偏差',
        actions: [
          '增加历史数据量',
          '检查数据质量',
          '使用更短周期的预测'
        ]
      });
    }

    return recommendations;
  }

  /**
   * 批量预测多条产线
   */
  async batchForecast(requests: ForecastRequest[]): Promise<ForecastReport[]> {
    this.log('info', `开始批量预测 ${requests.length} 条产线`);

    const reports: ForecastReport[] = [];
    for (let i = 0; i < requests.length; i++) {
      this.updateState({
        currentTask: `预测产线 ${requests[i].lineId} (${i + 1}/${requests.length})...`,
        progress: Math.round((i / requests.length) * 100)
      });

      try {
        const report = await this.executeForecast(requests[i]);
        reports.push(report);
      } catch (error) {
        this.log('error', `产线 ${requests[i].lineId} 预测失败: ${error}`);
      }
    }

    this.updateState({ progress: 100 });
    return reports;
  }

  /**
   * 获取产线列表
   */
  getProductionLines(): EntityInstance[] {
    return entityStore.findByType('ProductionLine');
  }

  /**
   * 获取预测历史
   */
  getForecastHistory(lineId?: string): EntityInstance[] {
    const forecasts = entityStore.findByType('CapacityForecast');
    if (lineId) {
      return forecasts.filter(f => f.data.lineId === lineId);
    }
    return forecasts;
  }

  /**
   * 清空所有数据
   */
  clearAllData(): void {
    entityStore.clear();
    this.log('info', '已清空所有数据');
  }

  /**
   * 导出数据
   */
  exportData() {
    return entityStore.export();
  }
}

// 全局Agent实例
export const capacityAgent = new CapacityForecastAgent();
