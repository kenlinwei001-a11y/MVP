/**
 * 产线产能预测页面
 */
import React, { useEffect } from 'react';
import { loadSampleData, capacityAgent } from '../capacity-agent';
import { CapacityForecastPanel } from '../capacity-agent/ui/CapacityForecastPanel';

export const CapacityForecastPage: React.FC = () => {
  useEffect(() => {
    // 加载示例数据
    const hasData = capacityAgent.getProductionLines().length > 0;
    if (!hasData) {
      loadSampleData();
      console.log('示例数据已加载');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <CapacityForecastPanel agent={capacityAgent} />
    </div>
  );
};

export default CapacityForecastPage;
