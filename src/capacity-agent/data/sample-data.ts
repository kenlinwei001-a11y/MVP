/**
 * 示例数据
 * 用于演示和测试产能预测Agent
 */

import { entityStore } from '../ontology/entity-store';

/**
 * 加载示例数据
 */
export function loadSampleData(): void {
  // 清空现有数据
  entityStore.clear();

  // 1. 创建产线
  const line1 = entityStore.create('ProductionLine', {
    lineId: 'LINE-001',
    name: 'A产线-电子产品组装',
    theoreticalCapacity: 100, // 件/小时
    cycleTimeSeconds: 36, // 秒/件
    shiftCount: 3,
    hoursPerShift: 8,
    oeeTarget: 85,
    status: 'active',
    productType: '电子控制板',
    baselineCapacity: 0
  });

  const line2 = entityStore.create('ProductionLine', {
    lineId: 'LINE-002',
    name: 'B产线-精密加工',
    theoreticalCapacity: 80,
    cycleTimeSeconds: 45,
    shiftCount: 2,
    hoursPerShift: 8,
    oeeTarget: 88,
    status: 'active',
    productType: '精密零件',
    baselineCapacity: 0
  });

  // 2. 创建设备
  const equip1 = entityStore.create('Equipment', {
    equipmentId: 'EQ-001',
    name: '贴片机A1',
    lineId: 'LINE-001',
    type: 'main',
    availability: 95,
    performance: 92,
    qualityRate: 98.5,
    mtbf: 120,
    nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
    status: 'running'
  });
  entityStore.createRelation(equip1.id, line1.id, 'installedIn');

  const equip2 = entityStore.create('Equipment', {
    equipmentId: 'EQ-002',
    name: '回流焊炉',
    lineId: 'LINE-001',
    type: 'main',
    availability: 96,
    performance: 94,
    qualityRate: 99,
    mtbf: 150,
    nextMaintenance: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'running'
  });
  entityStore.createRelation(equip2.id, line1.id, 'installedIn');

  const equip3 = entityStore.create('Equipment', {
    equipmentId: 'EQ-101',
    name: 'CNC加工中心',
    lineId: 'LINE-002',
    type: 'main',
    availability: 92,
    performance: 88,
    qualityRate: 97,
    mtbf: 100,
    nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'running'
  });
  entityStore.createRelation(equip3.id, line2.id, 'installedIn');

  // 3. 创建历史生产记录（30天）
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // LINE-001 历史数据
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseCapacity = 100 * 8 * 3 * 0.82; // 理论产能 * 班次 * 小时 * 实际OEE
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
    const actualQty = isWeekend ? 0 : Math.round(baseCapacity * randomFactor);

    if (!isWeekend) {
      const oee = 78 + Math.random() * 10;
      const availability = 93 + Math.random() * 6;
      const performance = 85 + Math.random() * 10;
      const qualityRate = 97 + Math.random() * 2;

      const record = entityStore.create('ProductionRecord', {
        recordId: `REC-L1-${date.toISOString().split('T')[0]}`,
        date: date.toISOString().split('T')[0],
        lineId: 'LINE-001',
        plannedQty: Math.round(100 * 8 * 3 * 0.85),
        actualQty: actualQty,
        oee: parseFloat(oee.toFixed(2)),
        availability: parseFloat(availability.toFixed(2)),
        performance: parseFloat(performance.toFixed(2)),
        qualityRate: parseFloat(qualityRate.toFixed(2)),
        downtimeHours: Math.random() * 2,
        defectRate: parseFloat((100 - qualityRate).toFixed(2)),
        actualHours: 24 - Math.random() * 3
      });
      entityStore.createRelation(record.id, line1.id, 'recordedBy');
    }

    // LINE-002 历史数据
    const baseCapacity2 = 80 * 8 * 2 * 0.85;
    const actualQty2 = isWeekend ? 0 : Math.round(baseCapacity2 * randomFactor);

    if (!isWeekend) {
      const oee2 = 80 + Math.random() * 12;
      const availability2 = 90 + Math.random() * 8;
      const performance2 = 86 + Math.random() * 12;
      const qualityRate2 = 96 + Math.random() * 3;

      const record2 = entityStore.create('ProductionRecord', {
        recordId: `REC-L2-${date.toISOString().split('T')[0]}`,
        date: date.toISOString().split('T')[0],
        lineId: 'LINE-002',
        plannedQty: Math.round(80 * 8 * 2 * 0.88),
        actualQty: actualQty2,
        oee: parseFloat(oee2.toFixed(2)),
        availability: parseFloat(availability2.toFixed(2)),
        performance: parseFloat(performance2.toFixed(2)),
        qualityRate: parseFloat(qualityRate2.toFixed(2)),
        downtimeHours: Math.random() * 3,
        defectRate: parseFloat((100 - qualityRate2).toFixed(2)),
        actualHours: 16 - Math.random() * 2
      });
      entityStore.createRelation(record2.id, line2.id, 'recordedBy');
    }
  }

  // 4. 创建订单
  const order1 = entityStore.create('Order', {
    orderId: 'ORD-2024-001',
    productModel: 'ECB-100A',
    quantity: 5000,
    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    assignedLine: 'LINE-001',
    status: 'pending'
  });
  entityStore.createRelation(order1.id, line1.id, 'assignedTo');

  const order2 = entityStore.create('Order', {
    orderId: 'ORD-2024-002',
    productModel: 'PC-200B',
    quantity: 3000,
    deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'normal',
    assignedLine: 'LINE-002',
    status: 'pending'
  });
  entityStore.createRelation(order2.id, line2.id, 'assignedTo');

  const order3 = entityStore.create('Order', {
    orderId: 'ORD-2024-003',
    productModel: 'ECB-100C',
    quantity: 8000,
    deliveryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    assignedLine: 'LINE-001',
    status: 'pending'
  });
  entityStore.createRelation(order3.id, line1.id, 'assignedTo');
}

/**
 * 生成CSV模板数据
 */
export function generateCSVTemplate(entityType: string): string {
  const templates: Record<string, string> = {
    ProductionLine: `产线ID,产线名称,理论产能,节拍时间,班次,每班小时,OEE目标,产品类型,状态
LINE-001,A产线-电子产品组装,100,36,3,8,85,电子控制板,active
LINE-002,B产线-精密加工,80,45,2,8,88,精密零件,active`,

    Equipment: `设备ID,设备名称,产线ID,类型,可用率,性能率,良品率,MTBF,下次维护,状态
EQ-001,贴片机A1,LINE-001,main,95,92,98.5,120,2026-04-15,running
EQ-002,回流焊炉,LINE-001,main,96,94,99,150,2026-04-20,running
EQ-101,CNC加工中心,LINE-002,main,92,88,97,100,2026-04-10,running`,

    ProductionRecord: `记录ID,日期,产线ID,计划产量,实际产量,OEE,可用率,性能率,良品率,停机时间,不良率,实际工时
REC-001,2026-03-01,LINE-001,2040,1800,82,95,90,98.5,1.5,1.5,22.5
REC-002,2026-03-02,LINE-001,2040,1950,88,96,93,99,1,1,23
REC-003,2026-03-03,LINE-002,1126,1000,83,93,90,97,2,3,14`,

    Order: `订单编号,产品型号,数量,交付日期,优先级,分配产线,状态
ORD-2024-001,ECB-100A,5000,2026-04-10,high,LINE-001,pending
ORD-2024-002,PC-200B,3000,2026-04-15,normal,LINE-002,pending
ORD-2024-003,ECB-100C,8000,2026-04-20,high,LINE-001,pending`
  };

  return templates[entityType] || '';
}

/**
 * 下载CSV模板
 */
export function downloadCSVTemplate(entityType: string): void {
  const csv = generateCSVTemplate(entityType);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${entityType}_template.csv`;
  link.click();
}
