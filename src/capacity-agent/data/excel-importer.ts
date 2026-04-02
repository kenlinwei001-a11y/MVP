/**
 * 数据导入模块
 * 支持Excel/CSV文件导入，自动创建本体节点和关系
 */

import { entityStore } from '../ontology/entity-store';
import { getEntityDefinition } from '../ontology/entity-definitions';

export interface ImportConfig {
  sheetName?: string;
  entityType: string;
  mappings: ColumnMapping[];
  skipRows?: number;
  headerRow?: number;
}

export interface ColumnMapping {
  column: string;           // Excel列名
  property: string;         // 实体属性名
  required?: boolean;
  transform?: (value: any) => any;
  defaultValue?: any;
}

export interface ImportResult {
  success: boolean;
  entityType: string;
  imported: number;
  failed: number;
  errors: ImportError[];
  createdIds: string[];
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  reason: string;
}

/**
 * 解析CSV内容
 */
export function parseCSV(content: string, delimiter: string = ','): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  });
}

/**
 * 解析Excel文件（简化版，实际使用时可集成xlsx库）
 * 返回按sheet组织的数据
 */
export function parseExcel(file: File): Promise<Record<string, string[][]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // 这里简化处理，实际应该使用 xlsx 库解析
        // 为了演示，假设文件内容可以按某种格式解析
        const data = e.target?.result as ArrayBuffer;

        // 临时方案：如果是CSV格式，当作单sheet处理
        const text = new TextDecoder().decode(data);
        if (text.includes('\n')) {
          const rows = parseCSV(text);
          resolve({ 'Sheet1': rows });
        } else {
          reject(new Error('暂不支持此Excel格式，请先转换为CSV'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 导入数据并创建实体
 */
export function importData(
  data: string[][],
  config: ImportConfig
): ImportResult {
  const result: ImportResult = {
    success: true,
    entityType: config.entityType,
    imported: 0,
    failed: 0,
    errors: [],
    createdIds: []
  };

  const headerRow = config.headerRow ?? 0;
  const skipRows = config.skipRows ?? 1;
  const startRow = headerRow + skipRows;

  if (data.length < startRow) {
    result.success = false;
    result.errors.push({
      row: 0,
      column: '',
      value: '',
      reason: '数据行数不足'
    });
    return result;
  }

  const headers = data[headerRow];
  const columnIndexMap = new Map<string, number>();
  headers.forEach((h, i) => columnIndexMap.set(h.trim(), i));

  // 验证必需的列映射
  for (const mapping of config.mappings) {
    if (mapping.required && !columnIndexMap.has(mapping.column)) {
      result.success = false;
      result.errors.push({
        row: headerRow,
        column: mapping.column,
        value: '',
        reason: `缺少必需的列: ${mapping.column}`
      });
    }
  }

  if (!result.success) {
    return result;
  }

  // 处理数据行
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (row.every(cell => !cell || !cell.trim())) continue; // 跳过空行

    const entityData: Record<string, any> = {};
    let hasError = false;

    for (const mapping of config.mappings) {
      const colIndex = columnIndexMap.get(mapping.column);

      if (colIndex === undefined) {
        if (mapping.required) {
          result.errors.push({
            row: i + 1,
            column: mapping.column,
            value: '',
            reason: '必需列缺失'
          });
          hasError = true;
        } else if (mapping.defaultValue !== undefined) {
          entityData[mapping.property] = mapping.defaultValue;
        }
        continue;
      }

      let value = row[colIndex]?.trim();

      // 转换值
      if (value && mapping.transform) {
        try {
          value = mapping.transform(value);
        } catch (e) {
          result.errors.push({
            row: i + 1,
            column: mapping.column,
            value,
            reason: `转换失败: ${e}`
          });
          hasError = true;
          continue;
        }
      }

      // 验证必填
      if (mapping.required && (!value || value === '')) {
        result.errors.push({
          row: i + 1,
          column: mapping.column,
          value,
          reason: '必填项为空'
        });
        hasError = true;
        continue;
      }

      if (value !== undefined && value !== '') {
        entityData[mapping.property] = value;
      } else if (mapping.defaultValue !== undefined) {
        entityData[mapping.property] = mapping.defaultValue;
      }
    }

    if (hasError) {
      result.failed++;
      continue;
    }

    try {
      // 检查重复（基于lineId等唯一字段）
      const uniqueField = getUniqueField(config.entityType);
      if (uniqueField && entityData[uniqueField]) {
        const existing = entityStore.findByCriteria(config.entityType, {
          [uniqueField]: entityData[uniqueField]
        });
        if (existing.length > 0) {
          // 更新现有实体
          entityStore.update(existing[0].id, entityData);
          result.createdIds.push(existing[0].id);
        } else {
          // 创建新实体
          const instance = entityStore.create(config.entityType, entityData);
          result.createdIds.push(instance.id);
        }
      } else {
        const instance = entityStore.create(config.entityType, entityData);
        result.createdIds.push(instance.id);
      }
      result.imported++;
    } catch (e) {
      result.errors.push({
        row: i + 1,
        column: '',
        value: '',
        reason: `创建实体失败: ${e}`
      });
      result.failed++;
    }
  }

  result.success = result.failed === 0;
  return result;
}

/**
 * 获取实体类型的唯一字段
 */
function getUniqueField(entityType: string): string | undefined {
  const uniqueFields: Record<string, string> = {
    'ProductionLine': 'lineId',
    'Equipment': 'equipmentId',
    'ProductionRecord': 'recordId',
    'Order': 'orderId',
    'CapacityForecast': 'forecastId',
    'CapacityRequirement': 'requirementId'
  };
  return uniqueFields[entityType];
}

// ==================== 预定义导入配置 ====================

/**
 * 产线导入配置
 */
export const ProductionLineImportConfig: ImportConfig = {
  entityType: 'ProductionLine',
  mappings: [
    { column: '产线ID', property: 'lineId', required: true },
    { column: '产线名称', property: 'name', required: true },
    { column: '理论产能', property: 'theoreticalCapacity', required: true, transform: (v) => parseFloat(v) },
    { column: '节拍时间', property: 'cycleTimeSeconds', required: true, transform: (v) => parseFloat(v) },
    { column: '班次', property: 'shiftCount', transform: (v) => parseInt(v) || 3, defaultValue: 3 },
    { column: '每班小时', property: 'hoursPerShift', transform: (v) => parseInt(v) || 8, defaultValue: 8 },
    { column: 'OEE目标', property: 'oeeTarget', transform: (v) => parseFloat(v) || 85, defaultValue: 85 },
    { column: '产品类型', property: 'productType' },
    { column: '状态', property: 'status', defaultValue: 'active' }
  ]
};

/**
 * 设备导入配置
 */
export const EquipmentImportConfig: ImportConfig = {
  entityType: 'Equipment',
  mappings: [
    { column: '设备ID', property: 'equipmentId', required: true },
    { column: '设备名称', property: 'name', required: true },
    { column: '产线ID', property: 'lineId', required: true },
    { column: '类型', property: 'type', required: true },
    { column: '可用率', property: 'availability', transform: (v) => parseFloat(v) || 95, defaultValue: 95 },
    { column: '性能率', property: 'performance', transform: (v) => parseFloat(v) || 90, defaultValue: 90 },
    { column: '良品率', property: 'qualityRate', transform: (v) => parseFloat(v) || 98, defaultValue: 98 },
    { column: 'MTBF', property: 'mtbf', transform: (v) => parseFloat(v) },
    { column: '下次维护', property: 'nextMaintenance' },
    { column: '状态', property: 'status', defaultValue: 'running' }
  ]
};

/**
 * 生产记录导入配置
 */
export const ProductionRecordImportConfig: ImportConfig = {
  entityType: 'ProductionRecord',
  mappings: [
    { column: '记录ID', property: 'recordId', required: true },
    { column: '日期', property: 'date', required: true },
    { column: '产线ID', property: 'lineId', required: true },
    { column: '计划产量', property: 'plannedQty', required: true, transform: (v) => parseFloat(v) },
    { column: '实际产量', property: 'actualQty', required: true, transform: (v) => parseFloat(v) },
    { column: 'OEE', property: 'oee', transform: (v) => parseFloat(v) },
    { column: '可用率', property: 'availability', transform: (v) => parseFloat(v) },
    { column: '性能率', property: 'performance', transform: (v) => parseFloat(v) },
    { column: '良品率', property: 'qualityRate', transform: (v) => parseFloat(v) },
    { column: '停机时间', property: 'downtimeHours', transform: (v) => parseFloat(v) || 0, defaultValue: 0 },
    { column: '不良率', property: 'defectRate', transform: (v) => parseFloat(v) },
    { column: '实际工时', property: 'actualHours', transform: (v) => parseFloat(v) }
  ]
};

/**
 * 订单导入配置
 */
export const OrderImportConfig: ImportConfig = {
  entityType: 'Order',
  mappings: [
    { column: '订单编号', property: 'orderId', required: true },
    { column: '产品型号', property: 'productModel', required: true },
    { column: '数量', property: 'quantity', required: true, transform: (v) => parseInt(v) },
    { column: '交付日期', property: 'deliveryDate', required: true },
    { column: '优先级', property: 'priority', defaultValue: 'normal' },
    { column: '分配产线', property: 'assignedLine' },
    { column: '状态', property: 'status', defaultValue: 'pending' }
  ]
};

/**
 * 根据文件名自动选择导入配置
 */
export function getImportConfigByFilename(filename: string): ImportConfig | null {
  const lowerName = filename.toLowerCase();

  if (lowerName.includes('产线') || lowerName.includes('line')) {
    return ProductionLineImportConfig;
  }
  if (lowerName.includes('设备') || lowerName.includes('equipment')) {
    return EquipmentImportConfig;
  }
  if (lowerName.includes('记录') || lowerName.includes('record') || lowerName.includes('history')) {
    return ProductionRecordImportConfig;
  }
  if (lowerName.includes('订单') || lowerName.includes('order')) {
    return OrderImportConfig;
  }

  return null;
}
