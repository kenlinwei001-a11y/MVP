import React, { useState } from 'react';
import {
  ChevronLeft, Play, Pause, RotateCcw, Save,
  Settings, BarChart3, Clock, TrendingUp, AlertTriangle,
  ChevronRight, CheckCircle, XCircle, Info
} from 'lucide-react';

interface SimulationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: string;
}

export default function Simulator({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const [steps, setSteps] = useState<SimulationStep[]>([
    { id: '1', name: '加载基础数据', status: 'completed', progress: 100 },
    { id: '2', name: '构建约束模型', status: 'completed', progress: 100 },
    { id: '3', name: '执行What-if推演', status: 'pending', progress: 0 },
    { id: '4', name: '生成优化建议', status: 'pending', progress: 0 },
  ]);

  const runSimulation = () => {
    setIsRunning(true);
    setShowResults(false);

    // 模拟执行过程
    let step = 2;
    const interval = setInterval(() => {
      if (step >= steps.length) {
        clearInterval(interval);
        setIsRunning(false);
        setShowResults(true);
        return;
      }

      setSteps(prev => prev.map((s, i) =>
        i === step ? { ...s, status: 'running', progress: 50 } : s
      ));

      setTimeout(() => {
        setSteps(prev => prev.map((s, i) =>
          i === step ? { ...s, status: 'completed', progress: 100 } : s
        ));
        step++;
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部导航 */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <BarChart3 className="text-white" size={18} />
          </div>
          <div>
            <span className="text-base font-semibold text-gray-900">场景推演</span>
            <span className="text-xs text-gray-500 ml-2 font-mono">v2.1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            <span>{isRunning ? '运行中...' : '开始推演'}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧参数面板 */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">推演参数</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">换型时间 (分钟)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">设备利用率 (%)</label>
              <input
                type="number"
                defaultValue={85}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">订单优先级</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>按交期</option>
                <option>按重要性</option>
                <option>按利润</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">排产策略</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>贪心算法</option>
                <option>遗传算法</option>
                <option>模拟退火</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">推演场景</h4>
            <div className="space-y-2">
              {['换型时间减少50%', '增加夜班产能', '优先级重新排序'].map((scenario, i) => (
                <label key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">{scenario}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* 中间主内容 */}
        <main className="flex-1 max-w-3xl mx-auto p-6 overflow-y-auto">
          {/* 推演进度 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">推演进度</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'running' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle size={18} /> :
                     step.status === 'running' ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> :
                     <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'
                      }`}>{step.name}</span>
                      <span className="text-xs text-gray-500">{step.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'running' ? 'bg-blue-500' :
                          'bg-gray-200'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 推演结果 */}
          {showResults && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">推演结果</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-xs text-green-600 mb-1">产能提升</p>
                  <p className="text-2xl font-bold text-green-700">+12.5%</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">交期达成率</p>
                  <p className="text-2xl font-bold text-blue-700">94.2%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-xs text-purple-600 mb-1">设备利用率</p>
                  <p className="text-2xl font-bold text-purple-700">87.8%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">优化建议</h4>
                {[
                  '建议将换型时间从30分钟缩短至15分钟，可提升产能12.5%',
                  '调整订单优先级排序，采用按交期优先策略',
                  '3号产线存在瓶颈，建议增加设备或调整班次',
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Info size={16} className="text-blue-500 mt-0.5" />
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', progress: 0 })));
                    setShowResults(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  重新推演
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  <Save size={16} />
                  保存方案
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 右侧历史记录 */}
        <aside className="w-72 bg-gray-50 border-l border-gray-200 p-5 overflow-y-auto hidden xl:block flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">历史推演</h3>
          <div className="space-y-3">
            {[
              { name: '换型时间优化', date: '今天 14:30', result: '成功' },
              { name: '产能瓶颈分析', date: '昨天 10:15', result: '成功' },
              { name: '夜班排程测试', date: '3天前', result: '失败' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow cursor-pointer">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{item.date}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.result === '成功' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{item.result}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
