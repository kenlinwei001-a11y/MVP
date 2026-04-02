/**
 * 产线产能预测 Agent - 统一导出
 */

// 本体层
export {
  ProductionLineEntity,
  EquipmentEntity,
  ProductionRecordEntity,
  OrderEntity,
  CapacityForecastEntity,
  CapacityRequirementEntity,
  WorkCalendarEntity,
  EntityRegistry,
  getEntityDefinition,
  getAllEntityDefinitions
} from './ontology/entity-definitions';

export type {
  EntityDefinition,
  PropertyDefinition
} from './ontology/entity-definitions';

export {
  EntityStore,
  entityStore
} from './ontology/entity-store';

export type {
  EntityInstance,
  EntityRelation
} from './ontology/entity-store';

// 技能层
export {
  calculateBaseline,
  calculateBaselineForLines
} from './skills/calculate-baseline';

export type {
  BaselineResult,
  BaselineParams
} from './skills/calculate-baseline';

export {
  forecastCapacity
} from './skills/forecast-capacity';

export type {
  ForecastAlgorithm,
  ForecastParams,
  ForecastResult,
  DailyPrediction,
  ForecastSummary
} from './skills/forecast-capacity';

export {
  checkConstraints,
  createConstraint,
  getDefaultConstraints
} from './skills/check-constraints';

export type {
  Constraint,
  ConstraintType,
  ConstraintStatus,
  ConstraintContext,
  ConstraintResult,
  ConstraintCheckResult
} from './skills/check-constraints';

// 数据层
export {
  importData,
  parseCSV,
  parseExcel,
  ProductionLineImportConfig,
  EquipmentImportConfig,
  ProductionRecordImportConfig,
  OrderImportConfig,
  getImportConfigByFilename
} from './data/excel-importer';

export type {
  ImportConfig,
  ImportResult,
  ImportError,
  ColumnMapping
} from './data/excel-importer';

export {
  loadSampleData,
  generateCSVTemplate,
  downloadCSVTemplate
} from './data/sample-data';

// Agent层
export {
  CapacityForecastAgent,
  capacityAgent
} from './engine/agent';

export type {
  AgentStatus,
  AgentState,
  AgentMessage,
  ForecastRequest,
  ForecastReport,
  Recommendation
} from './engine/agent';

// 版本信息
export const VERSION = '1.0.0';
export const AGENT_NAME = '产线产能预测Agent';
