# 产线产能预测 Agent

基于本体论的产线产能预测智能Agent，支持多算法预测、约束检查和数据导入。

## 架构设计

```
capacity-agent/
├── ontology/           # 本体层 - 实体定义与存储
│   ├── entity-definitions.ts   # 实体定义（产线、设备、订单等）
│   └── entity-store.ts         # 实体存储管理
├── skills/             # 技能层 - 原子化业务能力
│   ├── calculate-baseline.ts   # 计算产能基线
│   ├── forecast-capacity.ts    # 产能预测算法
│   └── check-constraints.ts    # 约束检查
├── data/               # 数据层 - 数据导入导出
│   ├── excel-importer.ts       # Excel/CSV导入
│   └── sample-data.ts          # 示例数据
├── engine/             # 引擎层 - Agent核心
│   └── agent.ts                # 主Agent控制器
├── ui/                 # 展示层 - UI组件
│   ├── CapacityForecastPanel.tsx  # React面板
│   └── capacity-panel.css         # 样式
└── index.ts            # 统一导出
```

## 核心实体

| 实体 | 说明 | 关键属性 |
|------|------|----------|
| ProductionLine | 产线 | lineId, theoreticalCapacity, oeeTarget |
| Equipment | 设备 | equipmentId, availability, performance, qualityRate |
| ProductionRecord | 生产记录 | date, actualQty, oee, availability |
| Order | 订单 | orderId, quantity, deliveryDate, assignedLine |
| CapacityForecast | 产能预测 | forecastDate, predictedCapacity, confidenceInterval |
| CapacityRequirement | 产能需求 | periodStart, periodEnd, requiredCapacity |

## 技能（原子化能力）

### 1. 计算产能基线 (calculate-baseline)
基于历史生产记录计算产线基准产能：
```typescript
calculateBaseline({
  lineId: 'LINE-001',
  daysOfHistory: 30,
  excludeOutliers: true
});
```

### 2. 产能预测 (forecast-capacity)
支持多种预测算法：
- **SMA** - 简单移动平均
- **EMA** - 指数移动平均
- **Linear** - 线性回归
- **Prophet** - 季节性预测
- **Weighted** - 加权综合（默认）

```typescript
forecastCapacity({
  lineId: 'LINE-001',
  forecastDays: 7,
  algorithm: 'weighted',
  confidenceLevel: 0.95
});
```

### 3. 约束检查 (check-constraints)
验证预测是否满足约束：
- 最大产能限制（硬约束）
- OEE目标约束（硬约束）
- 订单满足率（软约束）
- 设备维护警告（警告）
- 产能波动约束（软约束）

## 快速开始

### 1. 加载示例数据
```typescript
import { loadSampleData } from './data/sample-data';
loadSampleData();
```

### 2. 使用Agent执行预测
```typescript
import { capacityAgent } from './index';

// 执行预测
const report = await capacityAgent.executeForecast({
  lineId: 'LINE-001',
  forecastDays: 7,
  algorithm: 'weighted'
});

console.log(report.forecast.summary);
console.log(report.constraints);
console.log(report.recommendations);
```

### 3. 批量预测
```typescript
const reports = await capacityAgent.batchForecast([
  { lineId: 'LINE-001', forecastDays: 7 },
  { lineId: 'LINE-002', forecastDays: 7 }
]);
```

### 4. 导入数据
```typescript
// 导入CSV文件
const fileInput = document.getElementById('file');
const file = fileInput.files[0];
const result = await capacityAgent.importData(file);

console.log(`导入成功: ${result.imported} 条`);
```

## 数据导入格式

### 产线数据 (ProductionLine)
```csv
产线ID,产线名称,理论产能,节拍时间,班次,每班小时,OEE目标,产品类型
LINE-001,A产线,100,36,3,8,85,电子产品
```

### 设备数据 (Equipment)
```csv
设备ID,设备名称,产线ID,类型,可用率,性能率,良品率
EQ-001,贴片机,LINE-001,main,95,92,98.5
```

### 生产记录 (ProductionRecord)
```csv
记录ID,日期,产线ID,计划产量,实际产量,OEE,可用率,性能率,良品率
REC-001,2026-03-01,LINE-001,2000,1800,82,95,90,98.5
```

### 订单数据 (Order)
```csv
订单编号,产品型号,数量,交付日期,优先级,分配产线
ORD-001,ECB-100A,5000,2026-04-10,high,LINE-001
```

## 约束规则

### 硬约束（必须满足）
1. **最大产能限制** - 预测产能不能超过理论最大产能
2. **OEE目标约束** - 预测OEE不能低于目标值太多

### 软约束（建议满足）
1. **订单满足率** - 预测产能应能满足订单需求
2. **产能波动** - 产能预测波动不应过大（变异系数<30%）

### 警告
1. **设备维护** - 预测期间是否有计划内维护

## React组件使用

```tsx
import { CapacityForecastPanel } from './capacity-agent/ui/CapacityForecastPanel';

function App() {
  return (
    <div>
      <CapacityForecastPanel />
    </div>
  );
}
```

## 扩展开发

### 添加自定义约束
```typescript
import { createConstraint } from './skills/check-constraints';

const myConstraint = createConstraint(
  'custom-constraint',
  '自定义约束',
  'soft',
  '自定义约束描述',
  (context) => {
    // 检查逻辑
    return {
      constraintId: 'custom-constraint',
      status: 'satisfied',
      message: '检查通过'
    };
  }
);
```

### 添加新预测算法
在 `forecast-capacity.ts` 中添加新的预测函数：
```typescript
function myAlgorithm(historical, baseline, forecastDays): DailyPrediction[] {
  // 实现预测逻辑
  return predictions;
}
```

## API 文档

详见各模块的类型定义和导出接口。
