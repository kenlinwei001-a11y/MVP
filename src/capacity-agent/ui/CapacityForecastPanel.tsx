/**
 * 产线产能预测 Agent UI 面板
 * React组件，提供数据导入、预测执行和结果显示功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CapacityForecastAgent,
  AgentState,
  AgentMessage,
  ImportResult,
  ForecastReport,
  ForecastRequest,
  Recommendation
} from '../index';
import './capacity-panel.css';

interface CapacityForecastPanelProps {
  agent?: CapacityForecastAgent;
}

export const CapacityForecastPanel: React.FC<CapacityForecastPanelProps> = ({ agent: propAgent }) => {
  // 使用传入的agent或创建新实例
  const [agent] = useState(() => propAgent || new CapacityForecastAgent());

  // 状态
  const [agentState, setAgentState] = useState<AgentState>(agent.getState());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [productionLines, setProductionLines] = useState<any[]>([]);
  const [reports, setReports] = useState<ForecastReport[]>([]);

  // 预测配置
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [forecastDays, setForecastDays] = useState<number>(7);
  const [algorithm, setAlgorithm] = useState<'sma' | 'ema' | 'prophet' | 'linear' | 'weighted'>('weighted');

  // 订阅Agent状态
  useEffect(() => {
    const unsubscribe = agent.subscribe((state) => {
      setAgentState(state);
    });
    return unsubscribe;
  }, [agent]);

  // 刷新产线列表
  const refreshProductionLines = useCallback(() => {
    const lines = agent.getProductionLines();
    setProductionLines(lines);
    if (lines.length > 0 && !selectedLineId) {
      setSelectedLineId(lines[0].data.lineId as string);
    }
  }, [agent, selectedLineId]);

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // 导入数据
  const handleImport = async () => {
    if (selectedFiles.length === 0) return;

    const results: ImportResult[] = [];
    for (const file of selectedFiles) {
      try {
        const result = await agent.importData(file);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          entityType: 'unknown',
          imported: 0,
          failed: 0,
          errors: [{ row: 0, column: '', value: '', reason: String(error) }],
          createdIds: []
        });
      }
    }

    setImportResults(results);
    refreshProductionLines();
  };

  // 执行预测
  const handleForecast = async () => {
    if (!selectedLineId) return;

    const request: ForecastRequest = {
      lineId: selectedLineId,
      forecastDays,
      algorithm,
      confidenceLevel: 0.95
    };

    try {
      const report = await agent.executeForecast(request);
      setReports(prev => [report, ...prev]);
    } catch (error) {
      console.error('预测失败:', error);
    }
  };

  // 执行批量预测
  const handleBatchForecast = async () => {
    if (productionLines.length === 0) return;

    const requests: ForecastRequest[] = productionLines.map(line => ({
      lineId: line.data.lineId as string,
      forecastDays,
      algorithm,
      confidenceLevel: 0.95
    }));

    try {
      const batchReports = await agent.batchForecast(requests);
      setReports(prev => [...batchReports, ...prev]);
    } catch (error) {
      console.error('批量预测失败:', error);
    }
  };

  // 清空数据
  const handleClearData = () => {
    if (confirm('确定要清空所有数据吗？')) {
      agent.clearAllData();
      setImportResults([]);
      setReports([]);
      setProductionLines([]);
    }
  };

  // 获取状态文本
  const getStatusText = (status: AgentState['status']) => {
    const statusMap: Record<string, string> = {
      idle: '就绪',
      importing: '导入中',
      analyzing: '分析中',
      forecasting: '预测中',
      checking: '检查约束',
      completed: '完成',
      error: '错误'
    };
    return statusMap[status] || status;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(Math.round(num));
  };

  return (
    <div className="capacity-forecast-panel">
      {/* 头部 */}
      <div className="panel-header">
        <h1>产线产能预测 Agent</h1>
        <div className={`agent-status status-${agentState.status}`}>
          <span className="status-indicator"></span>
          <span className="status-text">状态: {getStatusText(agentState.status)}</span>
          {agentState.currentTask && (
            <span className="status-task">({agentState.currentTask})</span>
          )}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${agentState.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 数据导入区 */}
      <div className="section">
        <h2>数据导入</h2>
        <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
          支持导入产线、设备、生产记录、订单等数据（CSV格式）
        </p>
        <div className="import-controls">
          <input
            type="file"
            id="file-input"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-input" className="file-label">
            选择文件 ({selectedFiles.length})
          </label>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || agentState.status !== 'idle'}
          >
            开始导入
          </button>
          <button
            className="btn btn-secondary"
            onClick={refreshProductionLines}
          >
            刷新产线列表
          </button>
          <button
            className="btn btn-danger"
            onClick={handleClearData}
          >
            清空数据
          </button>
        </div>

        {/* 导入结果 */}
        {importResults.length > 0 && (
          <div className="import-results">
            <h3>导入结果</h3>
            {importResults.map((result, idx) => (
              <div
                key={idx}
                className={`import-result ${result.success ? 'success' : 'warning'}`}
              >
                <strong>{result.entityType}</strong>: {' '}
                成功 {result.imported} 条
                {result.failed > 0 && (
                  <span className="failed">, 失败 {result.failed} 条</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 预测控制区 */}
      <div className="section">
        <h2>预测配置</h2>
        <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
          已加载 {productionLines.length} 条产线
        </p>
        <div className="forecast-controls">
          <div className="control-group">
            <label>选择产线</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
            >
              <option value="">请选择</option>
              {productionLines.map((line) => (
                <option key={line.id} value={line.data.lineId}>
                  {line.data.lineId} - {line.data.name}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>预测天数</label>
            <input
              type="number"
              min={1}
              max={30}
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>预测算法</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
            >
              <option value="weighted">加权综合 (推荐)</option>
              <option value="sma">简单移动平均</option>
              <option value="ema">指数移动平均</option>
              <option value="linear">线性回归</option>
              <option value="prophet">季节性预测</option>
            </select>
          </div>
          <div className="control-buttons">
            <button
              className="btn btn-primary"
              onClick={handleForecast}
              disabled={!selectedLineId || agentState.status !== 'idle'}
            >
              执行预测
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBatchForecast}
              disabled={productionLines.length === 0 || agentState.status !== 'idle'}
            >
              批量预测全部产线
            </button>
          </div>
        </div>
      </div>

      {/* 消息日志 */}
      <div className="section">
        <h2>运行日志</h2>
        <div className="messages">
          {agentState.messages.length === 0 ? (
            <div className="message"><span className="content">暂无消息</span></div>
          ) : (
            agentState.messages.slice(-20).map((msg, idx) => (
              <div key={idx} className={`message message-${msg.type}`}>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <span className="content">{msg.content}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 预测报告 */}
      {reports.length > 0 && (
        <div className="section">
          <h2>预测报告</h2>
          {reports.map((report, idx) => (
            <ForecastReportView
              key={idx}
              report={report}
              formatDate={formatDate}
              formatNumber={formatNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 预测报告子组件
interface ForecastReportViewProps {
  report: ForecastReport;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
}

const ForecastReportView: React.FC<ForecastReportViewProps> = ({
  report,
  formatDate,
  formatNumber
}) => {
  return (
    <div className="forecast-report">
      <div className="report-header">
        <h3>产线 {report.request.lineId} 预测报告</h3>
        <span className="report-time">{formatDate(report.generatedAt)}</span>
      </div>

      {/* 汇总指标 */}
      <div className="report-summary">
        <div className="metric">
          <label>基线产能</label>
          <span className="metric-value">{formatNumber(report.baseline.baselineCapacity)} 件/天</span>
        </div>
        <div className="metric">
          <label>预测日均</label>
          <span className="metric-value">{formatNumber(report.forecast.summary.averageDaily)} 件/天</span>
        </div>
        <div className="metric">
          <label>预测总量</label>
          <span className="metric-value">{formatNumber(report.forecast.summary.totalPredicted)} 件</span>
        </div>
        <div className="metric">
          <label>趋势</label>
          <span className={`metric-value trend-${report.forecast.summary.trendDirection}`}>
            {report.forecast.summary.trendDirection === 'up' && '↑'}
            {report.forecast.summary.trendDirection === 'down' && '↓'}
            {report.forecast.summary.trendDirection === 'stable' && '→'}
            {' '}
            {report.forecast.summary.trendPercentage}%
          </span>
        </div>
        <div className="metric">
          <label>平均OEE</label>
          <span className="metric-value">{report.baseline.averageOEE}%</span>
        </div>
        <div className="metric">
          <label>约束检查</label>
          <span className={`metric-value constraint-${report.constraints.overallStatus}`}>
            {report.constraints.overallStatus === 'pass' && '通过'}
            {report.constraints.overallStatus === 'warning' && '警告'}
            {report.constraints.overallStatus === 'fail' && '失败'}
          </span>
        </div>
      </div>

      {/* 约束违反 */}
      {report.constraints.violations.length > 0 && (
        <div className="constraint-violations">
          <h4>约束违反 ({report.constraints.violations.length})</h4>
          {report.constraints.violations.map((v, i) => (
            <div key={i} className="violation">
              <strong>{v.message}</strong>
              {v.suggestedAction && <p>建议: {v.suggestedAction}</p>}
            </div>
          ))}
        </div>
      )}

      {/* 优化建议 */}
      {report.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>优化建议 ({report.recommendations.length})</h4>
          {report.recommendations.map((rec, i) => (
            <RecommendationView key={i} recommendation={rec} />
          ))}
        </div>
      )}

      {/* 预测明细表 */}
      <div className="predictions-table">
        <h4>预测明细</h4>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>预测产能</th>
              <th>置信下限</th>
              <th>置信上限</th>
              <th>工作日因子</th>
            </tr>
          </thead>
          <tbody>
            {report.forecast.predictions.map((pred, i) => (
              <tr key={i}>
                <td>{pred.date}</td>
                <td>{formatNumber(pred.predictedCapacity)}</td>
                <td>{formatNumber(pred.confidenceLower)}</td>
                <td>{formatNumber(pred.confidenceUpper)}</td>
                <td>{pred.factors.workdayFactor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 建议子组件
const RecommendationView: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
  const typeLabels: Record<string, string> = {
    capacity: '产能',
    schedule: '排程',
    equipment: '设备',
    order: '订单'
  };

  return (
    <div className={`recommendation priority-${recommendation.priority}`}>
      <div className="rec-header">
        <span className="rec-type">{typeLabels[recommendation.type]}</span>
        <span className="rec-priority">
          {recommendation.priority === 'high' ? '高优先级' :
           recommendation.priority === 'medium' ? '中优先级' : '低优先级'}
        </span>
      </div>
      <strong>{recommendation.title}</strong>
      <p>{recommendation.description}</p>
      <ul>
        {recommendation.actions.map((action, i) => (
          <li key={i}>{action}</li>
        ))}
      </ul>
    </div>
  );
};

export default CapacityForecastPanel;
