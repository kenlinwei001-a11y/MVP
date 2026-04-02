/**
 * 产线产能预测Agent - 本体实体定义
 * 定义所有参与产能预测的核心实体及其属性
 */

export interface PropertyDefinition {
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'reference';
  description: string;
  required?: boolean;
  default?: any;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    referenceTo?: string;
  };
}

export interface EntityDefinition {
  id: string;
  name: string;
  version: string;
  domain: string;
  description: string;
  properties: Record<string, PropertyDefinition>;
  relations: Array<{
    name: string;
    target: string;
    type: '1:1' | '1:N' | 'N:1' | 'N:N';
    description: string;
  }>;
}

// ==================== 实体定义 ====================

export const ProductionLineEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:production-line:1.0.0',
  name: 'ProductionLine',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '生产线实体，描述产线的基础产能能力',
  properties: {
    lineId: {
      type: 'string',
      description: '产线唯一标识',
      required: true,
      constraints: { pattern: '^LINE-[0-9]{3}$' }
    },
    name: {
      type: 'string',
      description: '产线名称',
      required: true
    },
    theoreticalCapacity: {
      type: 'number',
      description: '理论产能（件/小时）',
      required: true,
      constraints: { min: 0 }
    },
    cycleTimeSeconds: {
      type: 'number',
      description: '节拍时间（秒/件）',
      required: true,
      constraints: { min: 0 }
    },
    shiftCount: {
      type: 'number',
      description: '每日班次数',
      required: true,
      default: 3,
      constraints: { min: 1, max: 3 }
    },
    hoursPerShift: {
      type: 'number',
      description: '每班工作小时数',
      required: true,
      default: 8,
      constraints: { min: 1, max: 12 }
    },
    oeeTarget: {
      type: 'number',
      description: 'OEE目标值（%）',
      required: true,
      default: 85,
      constraints: { min: 0, max: 100 }
    },
    status: {
      type: 'enum',
      description: '运行状态',
      required: true,
      default: 'active',
      constraints: { enum: ['active', 'idle', 'maintenance', 'fault'] }
    },
    productType: {
      type: 'string',
      description: '生产产品类型'
    },
    baselineCapacity: {
      type: 'number',
      description: '计算出的基线产能（自动计算）'
    }
  },
  relations: [
    { name: 'contains', target: 'Equipment', type: '1:N', description: '产线包含设备' },
    { name: 'produces', target: 'Product', type: '1:N', description: '产线产出产品' },
    { name: 'hasRecords', target: 'ProductionRecord', type: '1:N', description: '产线有生产记录' },
    { name: 'belongsTo', target: 'Factory', type: 'N:1', description: '产线属于工厂' }
  ]
};

export const EquipmentEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:equipment:1.0.0',
  name: 'Equipment',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '生产设备实体，影响产线实际产能',
  properties: {
    equipmentId: {
      type: 'string',
      description: '设备唯一标识',
      required: true
    },
    name: {
      type: 'string',
      description: '设备名称',
      required: true
    },
    type: {
      type: 'enum',
      description: '设备类型',
      required: true,
      constraints: { enum: ['main', 'auxiliary', 'inspection', 'conveyor'] }
    },
    availability: {
      type: 'number',
      description: '设备可用率（%）',
      required: true,
      default: 95,
      constraints: { min: 0, max: 100 }
    },
    performance: {
      type: 'number',
      description: '性能效率（%）',
      required: true,
      default: 90,
      constraints: { min: 0, max: 100 }
    },
    qualityRate: {
      type: 'number',
      description: '良品率（%）',
      required: true,
      default: 98,
      constraints: { min: 0, max: 100 }
    },
    mtbf: {
      type: 'number',
      description: '平均故障间隔时间（小时）',
      constraints: { min: 0 }
    },
    nextMaintenance: {
      type: 'date',
      description: '下次维护日期'
    },
    status: {
      type: 'enum',
      description: '设备状态',
      default: 'running',
      constraints: { enum: ['running', 'standby', 'maintenance', 'fault'] }
    }
  },
  relations: [
    { name: 'installedIn', target: 'ProductionLine', type: 'N:1', description: '设备安装于产线' },
    { name: 'affects', target: 'CapacityForecast', type: '1:N', description: '设备影响产能预测' }
  ]
};

export const ProductionRecordEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:production-record:1.0.0',
  name: 'ProductionRecord',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '每日生产记录，用于产能基线计算',
  properties: {
    recordId: {
      type: 'string',
      description: '记录ID',
      required: true
    },
    date: {
      type: 'date',
      description: '日期',
      required: true
    },
    lineId: {
      type: 'string',
      description: '产线ID',
      required: true
    },
    plannedQty: {
      type: 'number',
      description: '计划产量',
      required: true,
      constraints: { min: 0 }
    },
    actualQty: {
      type: 'number',
      description: '实际产量',
      required: true,
      constraints: { min: 0 }
    },
    oee: {
      type: 'number',
      description: '当日OEE（%）',
      constraints: { min: 0, max: 100 }
    },
    availability: {
      type: 'number',
      description: '可用率（%）',
      constraints: { min: 0, max: 100 }
    },
    performance: {
      type: 'number',
      description: '性能率（%）',
      constraints: { min: 0, max: 100 }
    },
    qualityRate: {
      type: 'number',
      description: '良品率（%）',
      constraints: { min: 0, max: 100 }
    },
    downtimeHours: {
      type: 'number',
      description: '停机时长（小时）',
      default: 0,
      constraints: { min: 0 }
    },
    defectRate: {
      type: 'number',
      description: '不良率（%）',
      constraints: { min: 0, max: 100 }
    },
    actualHours: {
      type: 'number',
      description: '实际工作小时数',
      constraints: { min: 0, max: 24 }
    }
  },
  relations: [
    { name: 'recordedBy', target: 'ProductionLine', type: 'N:1', description: '记录归属产线' }
  ]
};

export const OrderEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:order:1.0.0',
  name: 'Order',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '生产订单，用于需求预测',
  properties: {
    orderId: {
      type: 'string',
      description: '订单编号',
      required: true
    },
    productModel: {
      type: 'string',
      description: '产品型号',
      required: true
    },
    quantity: {
      type: 'number',
      description: '订单数量',
      required: true,
      constraints: { min: 1 }
    },
    deliveryDate: {
      type: 'date',
      description: '交付日期',
      required: true
    },
    priority: {
      type: 'enum',
      description: '优先级',
      default: 'normal',
      constraints: { enum: ['high', 'normal', 'low'] }
    },
    assignedLine: {
      type: 'string',
      description: '分配产线ID'
    },
    status: {
      type: 'enum',
      description: '订单状态',
      default: 'pending',
      constraints: { enum: ['pending', 'in_progress', 'completed', 'cancelled'] }
    }
  },
  relations: [
    { name: 'assignedTo', target: 'ProductionLine', type: 'N:1', description: '订单分配至产线' },
    { name: 'generates', target: 'CapacityRequirement', type: '1:1', description: '订单产生产能需求' }
  ]
};

export const CapacityForecastEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:capacity-forecast:1.0.0',
  name: 'CapacityForecast',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '产能预测结果',
  properties: {
    forecastId: {
      type: 'string',
      description: '预测ID',
      required: true
    },
    lineId: {
      type: 'string',
      description: '产线ID',
      required: true
    },
    forecastDate: {
      type: 'date',
      description: '预测目标日期',
      required: true
    },
    predictedCapacity: {
      type: 'number',
      description: '预测产能（件）',
      required: true
    },
    confidenceLower: {
      type: 'number',
      description: '置信区间下限',
      required: true
    },
    confidenceUpper: {
      type: 'number',
      description: '置信区间上限',
      required: true
    },
    confidenceLevel: {
      type: 'number',
      description: '置信水平',
      default: 0.95
    },
    algorithm: {
      type: 'enum',
      description: '使用算法',
      constraints: { enum: ['sma', 'ema', 'prophet', 'linear'] }
    },
    demand: {
      type: 'number',
      description: '需求产能'
    },
    gap: {
      type: 'number',
      description: '产能缺口（负数表示不足）'
    },
    riskLevel: {
      type: 'enum',
      description: '风险等级',
      constraints: { enum: ['low', 'medium', 'high', 'critical'] }
    }
  },
  relations: [
    { name: 'forecastFor', target: 'ProductionLine', type: 'N:1', description: '预测针对产线' }
  ]
};

export const CapacityRequirementEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:capacity-requirement:1.0.0',
  name: 'CapacityRequirement',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '产能需求',
  properties: {
    requirementId: {
      type: 'string',
      description: '需求ID',
      required: true
    },
    lineId: {
      type: 'string',
      description: '产线ID',
      required: true
    },
    periodStart: {
      type: 'date',
      description: '需求开始日期',
      required: true
    },
    periodEnd: {
      type: 'date',
      description: '需求结束日期',
      required: true
    },
    requiredCapacity: {
      type: 'number',
      description: '需求产能（件）',
      required: true
    },
    fulfillmentStatus: {
      type: 'enum',
      description: '满足状态',
      default: 'unknown',
      constraints: { enum: ['satisfied', 'at_risk', 'shortage', 'unknown'] }
    }
  },
  relations: [
    { name: 'requiredBy', target: 'Order', type: 'N:1', description: '需求由订单产生' },
    { name: 'forLine', target: 'ProductionLine', type: 'N:1', description: '需求针对产线' }
  ]
};

export const WorkCalendarEntity: EntityDefinition = {
  id: 'urn:ontology:manufacturing:work-calendar:1.0.0',
  name: 'WorkCalendar',
  version: '1.0.0',
  domain: 'manufacturing',
  description: '工作日历',
  properties: {
    date: {
      type: 'date',
      description: '日期',
      required: true
    },
    isWorkday: {
      type: 'boolean',
      description: '是否工作日',
      default: true
    },
    shiftCount: {
      type: 'number',
      description: '当日班次数',
      default: 3
    },
    note: {
      type: 'string',
      description: '备注（如节假日）'
    }
  },
  relations: []
};

// ==================== 实体注册表 ====================

export const EntityRegistry: Record<string, EntityDefinition> = {
  'ProductionLine': ProductionLineEntity,
  'Equipment': EquipmentEntity,
  'ProductionRecord': ProductionRecordEntity,
  'Order': OrderEntity,
  'CapacityForecast': CapacityForecastEntity,
  'CapacityRequirement': CapacityRequirementEntity,
  'WorkCalendar': WorkCalendarEntity
};

export function getEntityDefinition(name: string): EntityDefinition | undefined {
  return EntityRegistry[name];
}

export function getAllEntityDefinitions(): EntityDefinition[] {
  return Object.values(EntityRegistry);
}
