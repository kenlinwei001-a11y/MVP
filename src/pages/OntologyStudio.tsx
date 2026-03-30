import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Button,
  InputGroup,
  Card,
  Tabs,
  Tab,
  FormGroup,
  HTMLSelect,
  Checkbox,
  Tag,
  Divider,
  Dialog,
  Collapse,
} from '@blueprintjs/core';
import {
  ChevronLeft,
  Search,
  Plus,
  Database,
  Battery,
  Factory,
  Truck,
  Activity,
  Settings,
  Save,
  Play,
  GitBranch,
  Layers,
  Box,
  AlertTriangle,
  CheckCircle,
  Trash2,
  ChevronRight,
  ChevronDown,
  Braces,
  X,
  Shield,
  Target,
  Zap,
  Cpu,
  FileCode,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';

// --- 导入新的工业级 Schema 和 DSL 类型 ---
import {
  EntityTypeEnum,
  AttributeTypeEnum,
  RelationTypeEnum,
  ConstraintTypeEnum,
  ConstraintCategoryEnum,
  CardinalityEnum,
  AttributeSemanticLabels,
  ENTITY_TYPE_OPTIONS,
  ATTRIBUTE_TYPE_OPTIONS,
  RELATION_TYPE_OPTIONS,
  CONSTRAINT_TYPE_OPTIONS,
  CONSTRAINT_CATEGORY_OPTIONS,
  type Entity,
  type Attribute,
  type Relation,
  type Constraint as SchemaConstraint,
} from '../types/ontology-schema';

import {
  ASTNodeTypeEnum,
  BinaryOperatorEnum,
  ComparisonOperatorEnum,
  LogicalOperatorEnum,
  AggregationFunctionEnum,
  TimeRelationEnum,
  createLiteral,
  createComparison,
  createAggregation,
  createTimeRelation,
  createCapacityConstraint,
  createPrecedenceConstraint,
  createDependencyConstraint,
  generateSolverMapping,
  type ConstraintAST,
  type SolverMapping,
  type SolverVariable,
} from '../types/constraint-ast';

import {
  constraintTemplateEngine,
  recommendConstraints,
  recommendConstraintsForRelation,
  type ConstraintTemplateRule,
  type GeneratedConstraintTemplate,
} from '../engine/constraint-template-engine';

// --- 工业级本体建模类型体系 ---

// 1. 实体类型（Entity Types）
type EntityType =
  // 核心实体类型
  | 'Object'           // 具体对象：设备、订单
  | 'Actor'            // 行为主体：操作员、系统
  | 'Organization'     // 组织：工厂、车间
  | 'Location'         // 空间：仓库、产线位置
  // 资源类实体
  | 'PhysicalResource' // 物理资源：设备、产线
  | 'Material'         // 物料：电芯、原料
  | 'Energy'           // 能源：电力、气体
  | 'Tool'             // 工具：模具
  // 业务对象
  | 'Order'            // 业务单据：生产订单
  | 'Plan'             // 计划：排产计划
  | 'Task'             // 任务：工序任务
  | 'Batch'            // 批次：批量生产
  // 时间与状态
  | 'Event'            // 事件：开工、停机
  | 'State'            // 状态：运行中、故障
  | 'TimeWindow'       // 时间窗口：排产时间段
  // 抽象/语义实体
  | 'Constraint'       // 约束实体
  | 'Metric'           // 指标：良率、OEE
  | 'Rule'             // 规则
  | 'Scenario'         // 场景：仿真输入
  // 组合与结构
  | 'Composite'        // 组合对象
  | 'HierarchyNode'    // 层级节点（BOM）
  | 'GraphNode'        // 图结构节点
  | 'Object_Type'      // 兼容旧数据
  | 'Relation_Type'    // 兼容旧数据
  | 'Attribute_Type';  // 兼容旧数据

// 2. 关系类型（Relation Types）
type RelationType =
  // 结构关系
  | 'belongs_to'    // 从属关系
  | 'part_of'       // 组成关系
  | 'contains'      // 包含
  | 'hierarchy'     // 层级
  // 业务关系
  | 'assigned_to'   // 分配
  | 'produced_by'   // 生产
  | 'consumed_by'   // 消耗
  | 'depends_on'    // 依赖
  // 时序关系
  | 'precedes'      // 先后顺序
  | 'follows'       // 跟随
  | 'overlaps'      // 重叠
  | 'during'        // 在期间
  // 因果关系
  | 'causes'        // 导致
  | 'affects'       // 影响
  | 'drives'        // 驱动
  // 约束关系
  | 'restricts'     // 限制
  | 'bounds'        // 边界
  | 'excludes'      // 排斥
  // 数量关系
  | 'ratio'         // 比例
  | 'allocation'    // 分配比例
  | 'weighting';    // 权重

// 3. 属性类型（Attribute Types）
type AttributeType =
  // 基础数据类型
  | 'string'        // 字符串
  | 'int'           // 整数
  | 'float'         // 浮点数
  | 'boolean'       // 布尔值
  // 数值增强类型
  | 'decimal'       // 高精度
  | 'percentage'    // 百分比
  | 'currency'      // 金额
  | 'range'         // 区间
  // 时间类型
  | 'datetime'      // 时间点
  | 'duration'      // 持续时间
  | 'timestamp'     // 时间戳
  | 'interval'      // 时间区间
  // 枚举与分类
  | 'enum'          // 枚举
  | 'set'           // 多选
  | 'category'      // 分类
  // 引用类型
  | 'entity_ref'    // 指向实体
  | 'relation_ref'  // 指向关系
  | 'external_ref'  // 外部系统ID
  // 结构化类型
  | 'object'        // JSON对象
  | 'array'         // 列表
  | 'map'           // 键值对
  // 工业扩展
  | 'unit_value'    // 带单位（kg/kWh）
  | 'time_series'   // 时序数据
  | 'distribution'  // 概率分布
  | 'vector'        // 向量（AI特征）
  | 'computed';     // 计算属性

// 4. 约束类型（Constraint Types）
// 使用标准化的约束分类（与 ConstraintCategoryEnum 保持一致）
type ConstraintCategory =
  | 'capacity'       // 产能约束
  | 'time'           // 时间约束
  | 'dependency'     // 依赖约束
  | 'resource'       // 资源约束
  | 'flow'           // 流量约束
  | 'optimization'   // 优化目标
  | 'statistical'    // 统计约束
  // 保留旧分类以兼容已有数据
  | 'equality'
  | 'inequality'
  | 'conditional'
  | 'availability'
  | 'exclusivity'
  | 'precedence'
  | 'deadline'
  | 'no_overlap'
  | 'flow_balance'
  | 'allocation'
  | 'quota'
  | 'minimize'
  | 'maximize'
  | 'balance'
  | 'avg_limit'
  | 'variance'
  | 'distribution';

// --- Types ---

interface OntologyEntity {
  id: string;
  type: EntityType;
  displayName: string;
  icon: string;
  status: 'verified' | 'draft' | 'conflict';
  properties: Property[];
  x?: number;
  y?: number;
}

interface Property {
  key: string;
  type: AttributeType;
  value?: string | number;
  unit?: string;
  formula?: string;
  isRequired: boolean;
}

interface OntologyLink {
  id: string;
  source: string;
  target: string;
  relation: RelationType | string;
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:M';
  // 关系属性
  properties?: {
    weight?: number;        // 权重
    priority?: number;      // 优先级
    strength?: number;      // 关系强度
    confidence?: number;    // 置信度
    capacity?: number;      // 关系容量
    startTime?: string;     // 开始时间
    endTime?: string;       // 结束时间
    duration?: string;      // 持续时间
    frequency?: string;     // 频率
    active?: boolean;       // 是否激活
    mutable?: boolean;      // 是否可变
    reversible?: boolean;   // 是否可逆
  };
}

type ConstraintType = 'hard' | 'soft' | 'objective';
type ConstraintStatus = 'active' | 'inactive' | 'error';

interface Constraint {
  id: string;
  name: string;
  type: ConstraintType;
  category?: ConstraintCategory;  // 约束分类（可选，兼容旧数据）
  expression: string;
  description: string;
  entityId: string;
  priority: number;
  status: ConstraintStatus;
  group: string;
  references: string[];
}

interface ValidationResult {
  type: 'syntax' | 'reference' | 'type' | 'conflict' | 'logic';
  severity: 'error' | 'warning' | 'info';
  message: string;
  constraintId?: string;
}

interface ValidationResult {
  type: 'syntax' | 'reference' | 'type' | 'conflict' | 'logic';
  severity: 'error' | 'warning' | 'info';
  message: string;
  constraintId?: string;
}

interface OntologyDomain {
  id: string;
  name: string;
  displayName: string;
  path: string;
  status: 'verified' | 'draft' | 'conflict';
  entities: OntologyEntity[];
  children?: OntologyDomain[];
}

// --- Mock Data ---

const initialDomains: OntologyDomain[] = [
  {
    id: 'dom-raw',
    name: 'RawMaterials',
    displayName: '原材料管理',
    path: 'RawMaterials',
    status: 'verified',
    entities: [
      {
        id: 'cathode_active',
        type: 'Object_Type',
        displayName: '正极活性物质',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'material_type', type: 'string', value: 'NMC811', isRequired: true },
          { key: 'purity', type: 'float', value: 99.5, unit: '%', isRequired: true },
          { key: 'particle_size_d50', type: 'float', value: 12.5, unit: 'μm', isRequired: true },
          { key: 'surface_area', type: 'float', value: 0.25, unit: 'm²/g', isRequired: false },
          { key: 'tap_density', type: 'float', value: 2.2, unit: 'g/cm³', isRequired: false },
          { key: 'moisture_content', type: 'float', value: 0.02, unit: '%', isRequired: true },
          { key: 'batch_no', type: 'string', value: 'CAT-20240326-001', isRequired: true },
        ],
      },
      {
        id: 'anode_graphite',
        type: 'Object_Type',
        displayName: '人造石墨负极',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'grade', type: 'string', value: 'AG-18', isRequired: true },
          { key: 'd50_particle_size', type: 'float', value: 18.0, unit: 'μm', isRequired: true },
          { key: 'first_efficiency', type: 'float', value: 94.5, unit: '%', isRequired: true },
          { key: 'capacity', type: 'float', value: 350, unit: 'mAh/g', isRequired: true },
          { key: 'surface_area', type: 'float', value: 1.8, unit: 'm²/g', isRequired: false },
        ],
      },
      {
        id: 'electrolyte',
        type: 'Object_Type',
        displayName: '电解液',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'formula', type: 'string', value: 'LiPF6/EC:DMC:EMC', isRequired: true },
          { key: 'concentration', type: 'float', value: 1.0, unit: 'mol/L', isRequired: true },
          { key: 'water_content', type: 'float', value: 10, unit: 'ppm', isRequired: true },
          { key: 'hf_content', type: 'float', value: 50, unit: 'ppm', isRequired: true },
          { key: 'density', type: 'float', value: 1.2, unit: 'g/cm³', isRequired: false },
        ],
      },
      {
        id: 'separator',
        type: 'Object_Type',
        displayName: '隔膜',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'material', type: 'string', value: 'PE', isRequired: true },
          { key: 'thickness', type: 'float', value: 12, unit: 'μm', isRequired: true },
          { key: 'porosity', type: 'float', value: 40, unit: '%', isRequired: true },
          { key: 'tensile_strength_md', type: 'float', value: 150, unit: 'MPa', isRequired: false },
          { key: 'tensile_strength_td', type: 'float', value: 120, unit: 'MPa', isRequired: false },
        ],
      },
      {
        id: 'conductive_additive',
        type: 'Object_Type',
        displayName: '导电剂',
        icon: 'box',
        status: 'draft',
        properties: [
          { key: 'type', type: 'string', value: 'CNT', isRequired: true },
          { key: 'carbon_content', type: 'float', value: 4.5, unit: '%', isRequired: true },
          { key: 'solid_content', type: 'float', value: 4.0, unit: '%', isRequired: true },
        ],
      },
      {
        id: 'binder',
        type: 'Object_Type',
        displayName: '粘结剂',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'type', type: 'string', value: 'PVDF', isRequired: true },
          { key: 'molecular_weight', type: 'float', value: 900000, unit: 'g/mol', isRequired: false },
          { key: 'solid_content', type: 'float', value: 8.0, unit: '%', isRequired: true },
        ],
      },
      {
        id: 'current_collector',
        type: 'Object_Type',
        displayName: '集流体',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'type', type: 'string', value: 'Al_Foil', isRequired: true },
          { key: 'thickness', type: 'float', value: 12, unit: 'μm', isRequired: true },
          { key: 'width', type: 'float', value: 400, unit: 'mm', isRequired: true },
          { key: 'purity', type: 'float', value: 99.5, unit: '%', isRequired: true },
        ],
      },
    ],
    children: [
      {
        id: 'dom-raw-inventory',
        name: 'RawInventory',
        displayName: '原料仓储',
        path: 'RawMaterials/RawInventory',
        status: 'verified',
        entities: [
          {
            id: 'raw_warehouse',
            type: 'Object_Type',
            displayName: '原料仓库',
            icon: 'box',
            status: 'verified',
            properties: [
              { key: 'warehouse_code', type: 'string', value: 'RW-01', isRequired: true },
              { key: 'storage_capacity', type: 'float', value: 5000, unit: 'tons', isRequired: true },
              { key: 'temperature_control', type: 'string', value: '25±2°C', isRequired: true },
              { key: 'humidity_control', type: 'string', value: '≤60%RH', isRequired: true },
            ],
          },
          {
            id: 'raw_inventory',
            type: 'Object_Type',
            displayName: '原料库存',
            icon: 'box',
            status: 'verified',
            properties: [
              { key: 'material_id', type: 'string', value: 'CAT-NMC811', isRequired: true },
              { key: 'batch_no', type: 'string', value: 'B20240326', isRequired: true },
              { key: 'quantity', type: 'float', value: 5000, unit: 'kg', isRequired: true },
              { key: 'storage_location', type: 'string', value: 'A-01-02', isRequired: true },
              { key: 'expiry_date', type: 'string', value: '2025-03-26', isRequired: true },
              { key: 'quality_status', type: 'string', value: '合格', isRequired: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dom-process',
    name: 'Process',
    displayName: '工艺过程',
    path: 'Process',
    status: 'verified',
    entities: [
      {
        id: 'mixing_process',
        type: 'Object_Type',
        displayName: '搅拌工序',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'MX-001', isRequired: true },
          { key: 'mixing_time', type: 'float', value: 180, unit: 'min', isRequired: true },
          { key: 'vacuum_degree', type: 'float', value: -0.095, unit: 'MPa', isRequired: true },
          { key: 'temperature', type: 'float', value: 25, unit: '°C', isRequired: true },
          { key: 'viscosity', type: 'float', value: 5000, unit: 'mPa·s', isRequired: true },
          { key: 'solid_content', type: 'float', value: 72, unit: '%', isRequired: true },
        ],
      },
      {
        id: 'coating_process',
        type: 'Object_Type',
        displayName: '涂布工序',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'CT-001', isRequired: true },
          { key: 'coating_speed', type: 'float', value: 50, unit: 'm/min', isRequired: true },
          { key: 'coating_weight', type: 'float', value: 25, unit: 'mg/cm²', isRequired: true },
          { key: 'oven_temperature', type: 'string', value: '120/130/140', unit: '°C', isRequired: true },
          { key: 'thickness', type: 'float', value: 150, unit: 'μm', isRequired: true },
        ],
      },
      {
        id: 'calendering_process',
        type: 'Object_Type',
        displayName: '辊压工序',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'CL-001', isRequired: true },
          { key: 'roll_pressure', type: 'float', value: 300, unit: 'tons', isRequired: true },
          { key: 'line_speed', type: 'float', value: 30, unit: 'm/min', isRequired: true },
          { key: 'thickness_after', type: 'float', value: 120, unit: 'μm', isRequired: true },
          { key: 'density', type: 'float', value: 3.4, unit: 'g/cm³', isRequired: true },
        ],
      },
      {
        id: 'slitting_process',
        type: 'Object_Type',
        displayName: '分切工序',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'SL-001', isRequired: true },
          { key: 'slitting_width', type: 'float', value: 65, unit: 'mm', isRequired: true },
          { key: 'edge_trim_width', type: 'float', value: 2, unit: 'mm', isRequired: true },
          { key: 'tension', type: 'float', value: 150, unit: 'N', isRequired: true },
        ],
      },
      {
        id: 'winding_process',
        type: 'Object_Type',
        displayName: '卷绕工序',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'WD-001', isRequired: true },
          { key: 'winding_tension', type: 'float', value: 25, unit: 'N', isRequired: true },
          { key: 'alignment_precision', type: 'float', value: 0.3, unit: 'mm', isRequired: true },
          { key: 'electrode_length', type: 'float', value: 5000, unit: 'mm', isRequired: true },
        ],
      },
      {
        id: 'electrolyte_filling',
        type: 'Object_Type',
        displayName: '注液工序',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'EF-001', isRequired: true },
          { key: 'electrolyte_volume', type: 'float', value: 4.5, unit: 'g', isRequired: true },
          { key: 'filling_precision', type: 'float', value: 0.5, unit: '%', isRequired: true },
          { key: 'vacuum_level', type: 'float', value: -0.098, unit: 'MPa', isRequired: true },
        ],
      },
      {
        id: 'formation_process',
        type: 'Object_Type',
        displayName: '化成工序',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'FM-001', isRequired: true },
          { key: 'formation_protocol', type: 'string', value: '0.05C-3.0V-4.2V', isRequired: true },
          { key: 'temperature', type: 'float', value: 45, unit: '°C', isRequired: true },
          { key: 'capacity_retention', type: 'float', value: 85, unit: '%', isRequired: true },
          { key: 'sei_quality', type: 'string', value: '合格', isRequired: true },
        ],
      },
      {
        id: 'aging_process',
        type: 'Object_Type',
        displayName: '老化工序',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'process_code', type: 'string', value: 'AG-001', isRequired: true },
          { key: 'aging_temperature', type: 'float', value: 45, unit: '°C', isRequired: true },
          { key: 'aging_time', type: 'float', value: 72, unit: 'h', isRequired: true },
          { key: 'voltage_drop_threshold', type: 'float', value: 50, unit: 'mV', isRequired: true },
        ],
      },
    ],
    children: [],
  },
  {
    id: 'dom-equipment',
    name: 'Equipment',
    displayName: '生产设备',
    path: 'Equipment',
    status: 'verified',
    entities: [
      {
        id: 'mixing_equipment',
        type: 'Object_Type',
        displayName: '真空搅拌机',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'equipment_id', type: 'string', value: 'MX-001-A', isRequired: true },
          { key: 'capacity', type: 'float', value: 500, unit: 'L', isRequired: true },
          { key: 'power', type: 'float', value: 75, unit: 'kW', isRequired: true },
          { key: 'max_speed', type: 'float', value: 2000, unit: 'rpm', isRequired: true },
          { key: 'status', type: 'string', value: '运行中', isRequired: true },
          { key: 'oee', type: 'float', value: 85, unit: '%', isRequired: true },
        ],
      },
      {
        id: 'coating_machine',
        type: 'Object_Type',
        displayName: '涂布机',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'equipment_id', type: 'string', value: 'CT-001-A', isRequired: true },
          { key: 'max_speed', type: 'float', value: 80, unit: 'm/min', isRequired: true },
          { key: 'max_width', type: 'float', value: 700, unit: 'mm', isRequired: true },
          { key: 'coating_precision', type: 'float', value: 1.0, unit: '%', isRequired: true },
          { key: 'status', type: 'string', value: '运行中', isRequired: true },
        ],
      },
      {
        id: 'winding_machine',
        type: 'Object_Type',
        displayName: '卷绕机',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'equipment_id', type: 'string', value: 'WD-001-A', isRequired: true },
          { key: 'production_rate', type: 'float', value: 12, unit: 'ppm', isRequired: true },
          { key: 'alignment_precision', type: 'float', value: 0.2, unit: 'mm', isRequired: true },
          { key: 'defect_rate', type: 'float', value: 0.1, unit: '%', isRequired: true },
        ],
      },
      {
        id: 'formation_equipment',
        type: 'Object_Type',
        displayName: '化成柜',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'equipment_id', type: 'string', value: 'FM-001-A', isRequired: true },
          { key: 'channel_count', type: 'int', value: 512, unit: 'channels', isRequired: true },
          { key: 'current_range', type: 'string', value: '0.1-10', unit: 'A', isRequired: true },
          { key: 'voltage_precision', type: 'float', value: 0.05, unit: '%FS', isRequired: true },
        ],
      },
      {
        id: 'testing_equipment',
        type: 'Object_Type',
        displayName: '检测设备',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'equipment_id', type: 'string', value: 'TE-001-A', isRequired: true },
          { key: 'test_type', type: 'string', value: '内阻测试', isRequired: true },
          { key: 'accuracy', type: 'float', value: 0.1, unit: '%', isRequired: true },
          { key: 'throughput', type: 'int', value: 3600, unit: 'pcs/h', isRequired: true },
        ],
      },
    ],
    children: [
      {
        id: 'dom-maintenance',
        name: 'Maintenance',
        displayName: '设备维保',
        path: 'Equipment/Maintenance',
        status: 'verified',
        entities: [
          {
            id: 'maintenance_record',
            type: 'Object_Type',
            displayName: '维保记录',
            icon: 'box',
            status: 'verified',
            properties: [
              { key: 'record_id', type: 'string', value: 'MR-20240326-001', isRequired: true },
              { key: 'equipment_id', type: 'string', value: 'MX-001-A', isRequired: true },
              { key: 'maintenance_type', type: 'string', value: '预防性维护', isRequired: true },
              { key: 'duration', type: 'float', value: 4, unit: 'h', isRequired: true },
              { key: 'next_due_date', type: 'string', value: '2024-04-26', isRequired: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dom-product',
    name: 'Product',
    displayName: '产品管理',
    path: 'Product',
    status: 'verified',
    entities: [
      {
        id: 'cell_prismatic',
        type: 'Object_Type',
        displayName: '方形电芯',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'cell_model', type: 'string', value: 'LFP-100Ah', isRequired: true },
          { key: 'nominal_capacity', type: 'float', value: 100, unit: 'Ah', isRequired: true },
          { key: 'nominal_voltage', type: 'float', value: 3.2, unit: 'V', isRequired: true },
          { key: 'energy_density', type: 'float', value: 160, unit: 'Wh/kg', isRequired: true },
          { key: 'cycle_life', type: 'int', value: 3500, unit: 'cycles', isRequired: true },
          { key: 'dimensions', type: 'string', value: '148*26*91', unit: 'mm', isRequired: true },
          { key: 'weight', type: 'float', value: 2.1, unit: 'kg', isRequired: true },
        ],
      },
      {
        id: 'cell_cylindrical',
        type: 'Object_Type',
        displayName: '圆柱电芯',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'cell_model', type: 'string', value: '21700-5000mAh', isRequired: true },
          { key: 'nominal_capacity', type: 'float', value: 5.0, unit: 'Ah', isRequired: true },
          { key: 'nominal_voltage', type: 'float', value: 3.6, unit: 'V', isRequired: true },
          { key: 'energy_density', type: 'float', value: 260, unit: 'Wh/kg', isRequired: true },
          { key: 'max_discharge_rate', type: 'float', value: 3, unit: 'C', isRequired: true },
        ],
      },
      {
        id: 'battery_module',
        type: 'Object_Type',
        displayName: '电池模组',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'module_model', type: 'string', value: 'LFP-1P16S', isRequired: true },
          { key: 'configuration', type: 'string', value: '1P16S', isRequired: true },
          { key: 'module_voltage', type: 'float', value: 51.2, unit: 'V', isRequired: true },
          { key: 'module_capacity', type: 'float', value: 100, unit: 'Ah', isRequired: true },
          { key: 'module_energy', type: 'float', value: 5.12, unit: 'kWh', isRequired: true },
          { key: 'cell_count', type: 'int', value: 16, unit: 'pcs', isRequired: true },
        ],
      },
      {
        id: 'battery_pack',
        type: 'Object_Type',
        displayName: '电池Pack',
        icon: 'battery',
        status: 'verified',
        properties: [
          { key: 'pack_model', type: 'string', value: 'BESS-100kWh', isRequired: true },
          { key: 'pack_energy', type: 'float', value: 100, unit: 'kWh', isRequired: true },
          { key: 'pack_voltage', type: 'float', value: 614.4, unit: 'V', isRequired: true },
          { key: 'module_count', type: 'int', value: 20, unit: 'pcs', isRequired: true },
          { key: 'bms_type', type: 'string', value: 'Distributed', isRequired: true },
          { key: 'cooling_method', type: 'string', value: 'Liquid_Cooling', isRequired: true },
        ],
      },
    ],
    children: [],
  },
  {
    id: 'dom-quality',
    name: 'Quality',
    displayName: '质量管理',
    path: 'Quality',
    status: 'verified',
    entities: [
      {
        id: 'qc_inspection',
        type: 'Object_Type',
        displayName: '来料检验',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'inspection_id', type: 'string', value: 'IQC-20240326-001', isRequired: true },
          { key: 'material_id', type: 'string', value: 'CAT-NMC811', isRequired: true },
          { key: 'batch_no', type: 'string', value: 'B20240326', isRequired: true },
          { key: 'inspection_items', type: 'string', value: '外观/粒度/比表', isRequired: true },
          { key: 'result', type: 'string', value: '合格', isRequired: true },
          { key: 'inspector', type: 'string', value: '张三', isRequired: true },
        ],
      },
      {
        id: 'ipqc_check',
        type: 'Object_Type',
        displayName: '过程检验',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'check_id', type: 'string', value: 'IPQC-20240326-001', isRequired: true },
          { key: 'process_name', type: 'string', value: '涂布', isRequired: true },
          { key: 'check_item', type: 'string', value: '涂布重量', isRequired: true },
          { key: 'spec_range', type: 'string', value: '25±0.5', unit: 'mg/cm²', isRequired: true },
          { key: 'measured_value', type: 'float', value: 25.1, unit: 'mg/cm²', isRequired: true },
          { key: 'result', type: 'string', value: '合格', isRequired: true },
        ],
      },
      {
        id: 'oqc_inspection',
        type: 'Object_Type',
        displayName: '出货检验',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'inspection_id', type: 'string', value: 'OQC-20240326-001', isRequired: true },
          { key: 'cell_batch', type: 'string', value: 'CB20240326', isRequired: true },
          { key: 'sample_size', type: 'int', value: 32, unit: 'pcs', isRequired: true },
          { key: 'capacity_test', type: 'string', value: '合格', isRequired: true },
          { key: 'ir_test', type: 'string', value: '合格', isRequired: true },
          { key: 'appearance_check', type: 'string', value: '合格', isRequired: true },
        ],
      },
      {
        id: 'defect_record',
        type: 'Object_Type',
        displayName: '缺陷记录',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'defect_id', type: 'string', value: 'DF-20240326-001', isRequired: true },
          { key: 'defect_type', type: 'string', value: '极片褶皱', isRequired: true },
          { key: 'severity', type: 'string', value: '轻微', isRequired: true },
          { key: 'occurrence_process', type: 'string', value: '涂布', isRequired: true },
          { key: 'root_cause', type: 'string', value: '张力不均', isRequired: false },
          { key: 'corrective_action', type: 'string', value: '调整张力参数', isRequired: false },
        ],
      },
      {
        id: 'test_data',
        type: 'Object_Type',
        displayName: '测试数据',
        icon: 'layers',
        status: 'verified',
        properties: [
          { key: 'test_id', type: 'string', value: 'TEST-20240326-001', isRequired: true },
          { key: 'cell_id', type: 'string', value: 'CELL-20240326-0001', isRequired: true },
          { key: 'capacity_0_2C', type: 'float', value: 100.5, unit: 'Ah', isRequired: true },
          { key: 'internal_resistance', type: 'float', value: 0.8, unit: 'mΩ', isRequired: true },
          { key: 'voltage', type: 'float', value: 3.65, unit: 'V', isRequired: true },
          { key: 'k_value', type: 'float', value: 0.08, unit: 'mV/h', isRequired: true },
        ],
      },
    ],
    children: [],
  },
  {
    id: 'dom-warehouse',
    name: 'Warehouse',
    displayName: '仓储物流',
    path: 'Warehouse',
    status: 'verified',
    entities: [
      {
        id: 'finished_goods_wh',
        type: 'Object_Type',
        displayName: '成品仓库',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'warehouse_code', type: 'string', value: 'FG-01', isRequired: true },
          { key: 'warehouse_type', type: 'string', value: '常温库', isRequired: true },
          { key: 'capacity', type: 'int', value: 100000, unit: 'pcs', isRequired: true },
          { key: 'current_stock', type: 'int', value: 85000, unit: 'pcs', isRequired: true },
          { key: 'safety_stock', type: 'int', value: 20000, unit: 'pcs', isRequired: true },
        ],
      },
      {
        id: 'wip_inventory',
        type: 'Object_Type',
        displayName: '在制品库存',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'wip_id', type: 'string', value: 'WIP-20240326-001', isRequired: true },
          { key: 'process_stage', type: 'string', value: '卷绕完成', isRequired: true },
          { key: 'quantity', type: 'int', value: 5000, unit: 'pcs', isRequired: true },
          { key: 'waiting_time', type: 'float', value: 2, unit: 'h', isRequired: true },
        ],
      },
      {
        id: 'material_transfer',
        type: 'Object_Type',
        displayName: '物料流转',
        icon: 'truck',
        status: 'verified',
        properties: [
          { key: 'transfer_id', type: 'string', value: 'MT-20240326-001', isRequired: true },
          { key: 'from_location', type: 'string', value: '涂布车间', isRequired: true },
          { key: 'to_location', type: 'string', value: '辊压车间', isRequired: true },
          { key: 'material_type', type: 'string', value: '正极极片', isRequired: true },
          { key: 'transfer_qty', type: 'float', value: 1000, unit: 'kg', isRequired: true },
          { key: 'transfer_time', type: 'string', value: '2024-03-26 10:00', isRequired: true },
        ],
      },
    ],
    children: [],
  },
  {
    id: 'dom-order',
    name: 'Order',
    displayName: '销售订单',
    path: 'Order',
    status: 'verified',
    entities: [
      {
        id: 'customer_order',
        type: 'Object_Type',
        displayName: '客户订单',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'order_no', type: 'string', value: 'SO-20240326-001', isRequired: true },
          { key: 'customer_name', type: 'string', value: '某新能源汽车有限公司', isRequired: true },
          { key: 'product_model', type: 'string', value: 'LFP-100Ah', isRequired: true },
          { key: 'order_qty', type: 'int', value: 10000, unit: 'pcs', isRequired: true },
          { key: 'delivery_date', type: 'string', value: '2024-04-15', isRequired: true },
          { key: 'priority', type: 'string', value: '高', isRequired: true },
          { key: 'order_status', type: 'string', value: '生产中', isRequired: true },
        ],
      },
      {
        id: 'delivery_plan',
        type: 'Object_Type',
        displayName: '交付计划',
        icon: 'truck',
        status: 'verified',
        properties: [
          { key: 'plan_id', type: 'string', value: 'DP-20240326-001', isRequired: true },
          { key: 'order_no', type: 'string', value: 'SO-20240326-001', isRequired: true },
          { key: 'planned_qty', type: 'int', value: 5000, unit: 'pcs', isRequired: true },
          { key: 'planned_date', type: 'string', value: '2024-04-10', isRequired: true },
          { key: 'delivery_method', type: 'string', value: '汽运', isRequired: true },
        ],
      },
      {
        id: 'customer_info',
        type: 'Object_Type',
        displayName: '客户信息',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'customer_code', type: 'string', value: 'CUST-001', isRequired: true },
          { key: 'customer_name', type: 'string', value: '某新能源汽车有限公司', isRequired: true },
          { key: 'customer_grade', type: 'string', value: 'A级', isRequired: true },
          { key: 'credit_limit', type: 'float', value: 10000000, unit: 'CNY', isRequired: true },
          { key: 'payment_terms', type: 'string', value: '月结30天', isRequired: true },
        ],
      },
    ],
    children: [],
  },
  {
    id: 'dom-supply',
    name: 'SupplyChain',
    displayName: '供应链',
    path: 'SupplyChain',
    status: 'verified',
    entities: [
      {
        id: 'supplier',
        type: 'Object_Type',
        displayName: '供应商',
        icon: 'truck',
        status: 'verified',
        properties: [
          { key: 'supplier_code', type: 'string', value: 'SUP-001', isRequired: true },
          { key: 'supplier_name', type: 'string', value: '某正极材料有限公司', isRequired: true },
          { key: 'material_category', type: 'string', value: '正极材料', isRequired: true },
          { key: 'qualification_status', type: 'string', value: '合格供应商', isRequired: true },
          { key: 'assessment_score', type: 'float', value: 95, unit: '分', isRequired: true },
        ],
      },
      {
        id: 'purchase_order',
        type: 'Object_Type',
        displayName: '采购订单',
        icon: 'box',
        status: 'verified',
        properties: [
          { key: 'po_no', type: 'string', value: 'PO-20240326-001', isRequired: true },
          { key: 'supplier_code', type: 'string', value: 'SUP-001', isRequired: true },
          { key: 'material_id', type: 'string', value: 'CAT-NMC811', isRequired: true },
          { key: 'po_qty', type: 'float', value: 10000, unit: 'kg', isRequired: true },
          { key: 'delivery_date', type: 'string', value: '2024-04-05', isRequired: true },
          { key: 'unit_price', type: 'float', value: 150, unit: 'CNY/kg', isRequired: true },
          { key: 'total_amount', type: 'computed', formula: 'po_qty * unit_price', unit: 'CNY', isRequired: true },
        ],
      },
      {
        id: 'vendor_contract',
        type: 'Object_Type',
        displayName: '供应商合同',
        icon: 'truck',
        status: 'verified',
        properties: [
          { key: 'contract_no', type: 'string', value: 'VC-2024-001', isRequired: true },
          { key: 'supplier_code', type: 'string', value: 'SUP-001', isRequired: true },
          { key: 'contract_value', type: 'computed', formula: 'sum(orders.value)', unit: 'USD', isRequired: true },
          { key: 'start_date', type: 'string', value: '2024-01-01', isRequired: true },
          { key: 'end_date', type: 'string', value: '2024-12-31', isRequired: true },
        ],
      },
    ],
    children: [],
  },
];

const initialLinks: OntologyLink[] = [
  // ==================== 原材料 -> 工序 (consumed_by) ====================
  // 正极材料 -> 搅拌
  { id: 'link_001', source: 'cathode_active', target: 'mixing_process', relation: 'consumed_by', cardinality: 'N:1' },
  { id: 'link_002', source: 'conductive_additive', target: 'mixing_process', relation: 'consumed_by', cardinality: 'N:1' },
  { id: 'link_003', source: 'binder', target: 'mixing_process', relation: 'consumed_by', cardinality: 'N:1' },
  // 负极材料 -> 搅拌
  { id: 'link_004', source: 'anode_graphite', target: 'mixing_process', relation: 'consumed_by', cardinality: 'N:1' },
  // 其他材料 -> 工序
  { id: 'link_005', source: 'electrolyte', target: 'electrolyte_filling', relation: 'consumed_by', cardinality: 'N:1' },
  { id: 'link_006', source: 'separator', target: 'winding_process', relation: 'consumed_by', cardinality: 'N:1' },
  { id: 'link_007', source: 'current_collector', target: 'coating_process', relation: 'consumed_by', cardinality: 'N:1' },

  // ==================== 工序流程 (precedes) ====================
  { id: 'link_010', source: 'mixing_process', target: 'coating_process', relation: 'precedes', cardinality: '1:1' },
  { id: 'link_011', source: 'coating_process', target: 'calendering_process', relation: 'precedes', cardinality: '1:1' },
  { id: 'link_012', source: 'calendering_process', target: 'slitting_process', relation: 'precedes', cardinality: '1:1' },
  { id: 'link_013', source: 'slitting_process', target: 'winding_process', relation: 'precedes', cardinality: '1:1' },
  { id: 'link_014', source: 'winding_process', target: 'electrolyte_filling', relation: 'precedes', cardinality: '1:1' },
  { id: 'link_015', source: 'electrolyte_filling', target: 'formation_process', relation: 'precedes', cardinality: '1:1' },
  { id: 'link_016', source: 'formation_process', target: 'aging_process', relation: 'precedes', cardinality: '1:1' },

  // ==================== 设备 -> 工序 (assigned_to) ====================
  { id: 'link_020', source: 'mixing_equipment', target: 'mixing_process', relation: 'assigned_to', cardinality: '1:N' },
  { id: 'link_021', source: 'coating_machine', target: 'coating_process', relation: 'assigned_to', cardinality: '1:N' },
  { id: 'link_022', source: 'winding_machine', target: 'winding_process', relation: 'assigned_to', cardinality: '1:N' },
  { id: 'link_023', source: 'formation_equipment', target: 'formation_process', relation: 'assigned_to', cardinality: '1:N' },
  { id: 'link_024', source: 'testing_equipment', target: 'qc_inspection', relation: 'assigned_to', cardinality: '1:N' },

  // ==================== 仓储关系 (contains/stored_in) ====================
  { id: 'link_030', source: 'raw_warehouse', target: 'cathode_active', relation: 'contains', cardinality: '1:N' },
  { id: 'link_031', source: 'raw_warehouse', target: 'anode_graphite', relation: 'contains', cardinality: '1:N' },
  { id: 'link_032', source: 'raw_warehouse', target: 'electrolyte', relation: 'contains', cardinality: '1:N' },
  { id: 'link_033', source: 'raw_warehouse', target: 'separator', relation: 'contains', cardinality: '1:N' },
  { id: 'link_034', source: 'wip_inventory', target: 'cell_prismatic', relation: 'contains', cardinality: '1:N' },
  { id: 'link_035', source: 'finished_goods_wh', target: 'battery_module', relation: 'contains', cardinality: '1:N' },
  { id: 'link_036', source: 'finished_goods_wh', target: 'battery_pack', relation: 'contains', cardinality: '1:N' },

  // ==================== 质量检验 (inspects/result) ====================
  { id: 'link_040', source: 'qc_inspection', target: 'cell_prismatic', relation: 'inspects', cardinality: '1:N' },
  { id: 'link_041', source: 'ipqc_check', target: 'coating_process', relation: 'monitors', cardinality: '1:N' },
  { id: 'link_042', source: 'oqc_inspection', target: 'battery_pack', relation: 'validates', cardinality: '1:N' },
  { id: 'link_043', source: 'test_data', target: 'qc_inspection', relation: 'generated_by', cardinality: 'N:1' },
  { id: 'link_044', source: 'defect_record', target: 'qc_inspection', relation: 'belongs_to', cardinality: 'N:1' },

  // ==================== 产品结构 (part_of/composes) ====================
  { id: 'link_050', source: 'cell_cylindrical', target: 'battery_module', relation: 'part_of', cardinality: 'N:1' },
  { id: 'link_051', source: 'cell_prismatic', target: 'battery_module', relation: 'part_of', cardinality: 'N:1' },
  { id: 'link_052', source: 'battery_module', target: 'battery_pack', relation: 'part_of', cardinality: 'N:1' },

  // ==================== 供应链关系 (supplies/orders) ====================
  { id: 'link_060', source: 'supplier', target: 'cathode_active', relation: 'supplies', cardinality: '1:N' },
  { id: 'link_061', source: 'supplier', target: 'anode_graphite', relation: 'supplies', cardinality: '1:N' },
  { id: 'link_062', source: 'purchase_order', target: 'supplier', relation: 'placed_to', cardinality: 'N:1' },
  { id: 'link_063', source: 'purchase_order', target: 'raw_warehouse', relation: 'delivers_to', cardinality: '1:1' },
  { id: 'link_064', source: 'customer_order', target: 'battery_pack', relation: 'orders', cardinality: '1:N' },
  { id: 'link_065', source: 'customer_order', target: 'customer_info', relation: 'placed_by', cardinality: 'N:1' },
  { id: 'link_066', source: 'delivery_plan', target: 'customer_order', relation: 'fulfills', cardinality: '1:N' },
  { id: 'link_067', source: 'material_transfer', target: 'wip_inventory', relation: 'moves_to', cardinality: '1:1' },

  // ==================== 维保关系 (maintains) ====================
  { id: 'link_070', source: 'maintenance_record', target: 'mixing_equipment', relation: 'maintains', cardinality: 'N:1' },
  { id: 'link_071', source: 'maintenance_record', target: 'coating_machine', relation: 'maintains', cardinality: 'N:1' },
  { id: 'link_072', source: 'vendor_contract', target: 'supplier', relation: 'contracts', cardinality: '1:1' },
];

// 约束模板库
const constraintTemplates = [
  {
    id: 'tmpl-capacity',
    name: '产能限制',
    description: '限制生产总量不超过产能上限',
    type: 'hard' as ConstraintType,
    expression: 'SUM(order.quantity) <= productionLine.capacity',
    group: '产能约束',
  },
  {
    id: 'tmpl-due-date',
    name: '交期约束',
    description: '订单必须在交期前完成',
    type: 'hard' as ConstraintType,
    expression: 'order.completion_time <= order.due_date',
    group: '交期约束',
  },
  {
    id: 'tmpl-resource',
    name: '资源独占',
    description: '同一资源同一时间只能被一个任务使用',
    type: 'hard' as ConstraintType,
    expression: 'NO_OVERLAP(resource.time_windows)',
    group: '设备约束',
  },
  {
    id: 'tmpl-batch',
    name: '最小批量',
    description: '生产批量必须满足最小批量要求',
    type: 'soft' as ConstraintType,
    expression: 'batch.size >= entity.min_batch_size',
    group: '工艺约束',
  },
  {
    id: 'tmpl-utilization',
    name: '最大利用率',
    description: '设备利用率不应超过上限',
    type: 'objective' as ConstraintType,
    expression: 'MAXIMIZE(resource.utilization) WHERE resource.utilization <= 0.95',
    group: '优化目标',
  },
];

// 初始约束数据
const initialConstraints: Constraint[] = [
  {
    id: 'cons-1',
    name: 'capacity_limit',
    type: 'hard',
    expression: 'SUM(order.quantity) <= line.capacity',
    description: '产能限制约束',
    entityId: 'cell_001',
    priority: 1,
    status: 'active',
    group: '产能约束',
    references: ['energy_density', 'capacity'],
  },
  {
    id: 'cons-2',
    name: 'quality_threshold',
    type: 'soft',
    expression: 'cell.energy_density >= 250',
    description: '能量密度阈值',
    entityId: 'cell_001',
    priority: 2,
    status: 'active',
    group: '质量约束',
    references: ['energy_density'],
  },
];

// --- Components ---

const StatusDot: React.FC<{ status: 'verified' | 'draft' | 'conflict' }> = ({ status }) => {
  const colorMap = {
    verified: 'var(--palantir-success)',
    draft: 'var(--palantir-warning)',
    conflict: 'var(--palantir-danger)',
  };
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: colorMap[status],
        display: 'inline-block',
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  );
};

// 连线配置组件
interface EdgeInspectorProps {
  edgeId: string;
  links: OntologyLink[];
  setLinks: React.Dispatch<React.SetStateAction<OntologyLink[]>>;
  domains: OntologyDomain[];
  onClose: () => void;
}

const EdgeInspector: React.FC<EdgeInspectorProps> = ({ edgeId, links, setLinks, domains, onClose }) => {
  const link = links.find(l => l.id === edgeId);
  if (!link) return null;

  const sourceEntity = domains.flatMap(d => d.entities).find(e => e.id === link.source);
  const targetEntity = domains.flatMap(d => d.entities).find(e => e.id === link.target);

  const updateLink = (updates: Partial<OntologyLink>) => {
    setLinks(prev => prev.map(l => l.id === edgeId ? { ...l, ...updates } : l));
  };

  const deleteLink = () => {
    setLinks(prev => prev.filter(l => l.id !== edgeId));
    onClose();
  };

  return (
    <>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--palantir-border)',
        background: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            关系连线
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{link.relation}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            ID: {link.id}
          </div>
        </div>
        <Button minimal icon={<X size={18} />} onClick={onClose} />
      </div>

      <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
        {/* 源节点和目标节点信息 */}
        <Card style={{ marginBottom: 16, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
            连接信息
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              padding: '6px 10px',
              background: '#E3F2FD',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              color: '#1565C0',
              flex: 1,
            }}>
              {sourceEntity?.displayName || link.source}
            </div>
            <GitBranch size={16} color="#106BA3" style={{ transform: 'rotate(90deg)' }} />
            <div style={{
              padding: '6px 10px',
              background: '#E8F5E9',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              color: '#2E7D32',
              flex: 1,
            }}>
              {targetEntity?.displayName || link.target}
            </div>
          </div>
        </Card>

        {/* 关系类型配置 */}
        <FormGroup label="关系名称" style={{ marginBottom: 16 }}>
          <InputGroup
            value={link.relation}
            onChange={(e) => updateLink({ relation: e.target.value })}
            fill
          />
        </FormGroup>

        <FormGroup label="关系类型" style={{ marginBottom: 16 }}>
          <HTMLSelect
            value={link.cardinality}
            onChange={(e) => updateLink({ cardinality: e.target.value as any })}
            fill
          >
            <option value="1:1">一对一 (1:1)</option>
            <option value="1:N">一对多 (1:N)</option>
            <option value="N:1">多对一 (N:1)</option>
            <option value="N:M">多对多 (N:M)</option>
          </HTMLSelect>
        </FormGroup>

        {/* 常用关系类型快速选择 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            常用关系
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['COMPONENTS_OF', 'USES', 'PRODUCES', 'DEPENDS_ON', 'REFERENCES', 'CONTAINS', 'BELONGS_TO', 'TRANSFORMS_TO'].map(rel => (
              <Tag
                key={rel}
                minimal
                interactive
                onClick={() => updateLink({ relation: rel })}
                style={{ cursor: 'pointer' }}
              >
                {rel}
              </Tag>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 删除按钮 */}
        <Button
          fill
          intent="danger"
          minimal
          icon={<Trash2 size={14} />}
          onClick={deleteLink}
        >
          删除此连线
        </Button>
      </div>
    </>
  );
};

// 节点卡片组件 - Handle放在框的边缘
const OntologyNodeCard: React.FC<{ data: OntologyEntity }> = ({ data }) => {
  return (
    <div className="ontology-node" style={{ position: 'relative' }}>
      {/* 左侧连接点 - 在框的左边缘 */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 10,
          height: 10,
          background: 'var(--accent)',
          border: '2px solid #fff',
        }}
      />

      <div className="ontology-node-header">
        <StatusDot status={data.status} />
        {data.icon === 'battery' && <Battery size={14} />}
        {data.icon === 'layers' && <Layers size={14} />}
        {data.icon === 'box' && <Box size={14} />}
        {data.icon === 'truck' && <Truck size={14} />}
        <span style={{ fontWeight: 600, fontSize: 12 }}>{data.displayName}</span>
      </div>
      <div className="ontology-node-content">
        {data.properties.slice(0, 3).map((prop) => (
          <div key={prop.key} className="property-row">
            <span className="property-key">{prop.key}</span>
            <span className="property-value">
              {prop.value !== undefined ? prop.value : '—'}
              {prop.unit && <span style={{ marginLeft: 2, color: 'var(--text-tertiary)' }}>{prop.unit}</span>}
            </span>
          </div>
        ))}
        {data.properties.length > 3 && (
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', paddingTop: 4 }}>
            +{data.properties.length - 3} 更多
          </div>
        )}
      </div>

      {/* 右侧连接点 - 在框的右边缘 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 10,
          height: 10,
          background: 'var(--accent)',
          border: '2px solid #fff',
        }}
      />
    </div>
  );
};

const nodeTypes = {
  ontologyNode: OntologyNodeCard,
};

// --- Main Component ---

export default function OntologyStudio({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [domains, setDomains] = useState<OntologyDomain[]>(initialDomains);
  const [links, setLinks] = useState<OntologyLink[]>(initialLinks);
  const [constraints, setConstraints] = useState<Constraint[]>(initialConstraints);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<OntologyEntity | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'logic' | 'data' | 'perms'>('general');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['dom-1']));

  // 当前选中的domain路径
  const [selectedDomainPath, setSelectedDomainPath] = useState<string>('Manufacturing');

  // React Flow States
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // 添加实体弹窗状态
  const [showAddEntityDialog, setShowAddEntityDialog] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState<'Object_Type' | 'Relation_Type' | 'Attribute_Type'>('Object_Type');

  // 约束相关状态
  const [selectedConstraint, setSelectedConstraint] = useState<Constraint | null>(null);
  const [dslMode, setDslMode] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- 智能约束模板推荐状态 ---
  const [recommendedTemplates, setRecommendedTemplates] = useState<GeneratedConstraintTemplate[]>([]);
  const [showRecommendedTemplates, setShowRecommendedTemplates] = useState(false);
  const [generatedAST, setGeneratedAST] = useState<ConstraintAST | null>(null);
  const [solverMapping, setSolverMapping] = useState<SolverMapping | null>(null);
  const [showASTPanel, setShowASTPanel] = useState(false);

  // Initialize canvas from domain data
  useEffect(() => {
    const allEntities = domains.flatMap((d) => [
      ...d.entities,
      ...(d.children?.flatMap((c) => c.entities) || []),
      ...(d.children?.flatMap((c) => c.children?.flatMap((gc) => gc.entities) || []) || []),
    ]);

    const flowNodes: Node[] = allEntities.map((entity, idx) => ({
      id: entity.id,
      type: 'ontologyNode',
      position: { x: entity.x || 100 + idx * 250, y: entity.y || 100 + (idx % 2) * 200 },
      data: entity,
    }));

    const flowEdges: Edge[] = links.map((link) => {
      const isSelected = selectedEdgeId === link.id;
      return {
        id: link.id,
        source: link.source,
        target: link.target,
        label: link.relation,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: isSelected ? 'var(--accent)' : '#86868B' },
        style: {
          stroke: isSelected ? 'var(--accent)' : '#86868B',
          strokeWidth: isSelected ? 3 : 1.5,
        },
        labelStyle: { fill: isSelected ? 'var(--accent)' : '#5C7080', fontSize: 10, fontWeight: isSelected ? 600 : 400 },
        labelBgStyle: { fill: '#FFFFFF', stroke: isSelected ? 'var(--accent)' : '#86868B', strokeWidth: isSelected ? 2 : 1, rx: 2 },
        labelBgPadding: [4, 6],
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [domains, links, selectedEdgeId]);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEntity(node.data as OntologyEntity);
    setSelectedEdgeId(null); // 清除选中的线段
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setSelectedEntity(null);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newLink: OntologyLink = {
          id: `link_${Date.now()}`,
          source: connection.source,
          target: connection.target,
          relation: 'RELATED_TO',
          cardinality: '1:N',
        };
        setLinks((prev) => [...prev, newLink]);
        setEdges((eds) => addEdge({
          ...connection,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#86868B' },
          style: { stroke: '#86868B', strokeWidth: 1.5 },
        }, eds));
      }
    },
    [setEdges]
  );

  // Tree rendering logic
  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 根据路径找到domain
  const findDomainByPath = (path: string, domainList: OntologyDomain[] = domains): OntologyDomain | null => {
    for (const domain of domainList) {
      if (domain.path === path) return domain;
      if (domain.children) {
        const found = findDomainByPath(path, domain.children);
        if (found) return found;
      }
    }
    return null;
  };

  // 添加实体到指定domain
  const addEntityToDomain = (domainPath: string, entity: OntologyEntity) => {
    setDomains((prev) => {
      const newDomains = JSON.parse(JSON.stringify(prev)) as OntologyDomain[];

      const findAndAdd = (domainList: OntologyDomain[]): boolean => {
        for (const domain of domainList) {
          if (domain.path === domainPath) {
            domain.entities.push(entity);
            return true;
          }
          if (domain.children && findAndAdd(domain.children)) {
            return true;
          }
        }
        return false;
      };

      findAndAdd(newDomains);
      return newDomains;
    });
  };

  // 处理添加实体
  const handleAddEntity = () => {
    if (!newEntityName.trim()) return;

    const newEntity: OntologyEntity = {
      id: `entity_${Date.now()}`,
      type: newEntityType,
      displayName: newEntityName,
      icon: newEntityType === 'Object_Type' ? 'box' : newEntityType === 'Relation_Type' ? 'layers' : 'battery',
      status: 'draft',
      properties: [],
    };

    addEntityToDomain(selectedDomainPath, newEntity);
    setShowAddEntityDialog(false);
    setNewEntityName('');
  };

  // ============ 约束操作方法 ============

  const addConstraint = () => {
    if (!selectedEntity) return;
    const newConstraint: Constraint = {
      id: `cons-${Date.now()}`,
      name: 'new_constraint',
      type: 'hard',
      expression: '',
      description: '',
      entityId: selectedEntity.id,
      priority: 1,
      status: 'active',
      group: '未分组',
      references: [],
    };
    setConstraints([...constraints, newConstraint]);
    setSelectedConstraint(newConstraint);
  };

  const deleteConstraint = (constraintId: string) => {
    setConstraints(constraints.filter(c => c.id !== constraintId));
    if (selectedConstraint?.id === constraintId) {
      setSelectedConstraint(null);
    }
  };

  const updateConstraint = (constraintId: string, updates: Partial<Constraint>) => {
    setConstraints(constraints.map(c => c.id === constraintId ? { ...c, ...updates } : c));
    if (selectedConstraint?.id === constraintId) {
      setSelectedConstraint({ ...selectedConstraint, ...updates });
    }
  };

  const updateEntity = (entityId: string, updates: Partial<OntologyEntity>) => {
    setDomains(domains.map(domain => ({
      ...domain,
      entities: domain.entities.map(e => e.id === entityId ? { ...e, ...updates } : e),
      children: domain.children?.map(child => ({
        ...child,
        entities: child.entities.map(e => e.id === entityId ? { ...e, ...updates } : e),
        children: child.children?.map(grandchild => ({
          ...grandchild,
          entities: grandchild.entities.map(e => e.id === entityId ? { ...e, ...updates } : e),
        })),
      })),
    })));
    if (selectedEntity?.id === entityId) {
      setSelectedEntity({ ...selectedEntity, ...updates });
    }
  };

  const applyTemplate = (template: typeof constraintTemplates[0]) => {
    if (!selectedEntity) return;
    const newConstraint: Constraint = {
      id: `cons-${Date.now()}`,
      name: template.name,
      type: template.type,
      expression: template.expression,
      description: template.description,
      entityId: selectedEntity.id,
      priority: 1,
      status: 'active',
      group: template.group,
      references: [],
    };
    setConstraints([...constraints, newConstraint]);
    setSelectedConstraint(newConstraint);
  };

  // --- 智能约束模板推荐功能 ---

  /**
   * 根据当前选中的实体，智能推荐约束模板
   */
  const generateRecommendedConstraints = useCallback(() => {
    if (!selectedEntity) {
      setRecommendedTemplates([]);
      return;
    }

    // 转换 OntologyEntity 为 Entity 格式
    const entityForEngine: Entity = {
      name: selectedEntity.displayName,
      type: selectedEntity.type as any,
      attributes: selectedEntity.properties.map(p => ({
        name: p.key,
        type: p.type as any,
        required: p.isRequired,
        unit: p.unit,
        semantic: inferSemanticFromProperty(p),
      })),
    };

    const templates = recommendConstraints(entityForEngine);
    setRecommendedTemplates(templates);
    setShowRecommendedTemplates(templates.length > 0);
  }, [selectedEntity]);

  // 当选中实体变化时，触发智能约束推荐
  useEffect(() => {
    generateRecommendedConstraints();
  }, [selectedEntity, generateRecommendedConstraints]);

  /**
   * 从属性推断语义标签
   */
  const inferSemanticFromProperty = (prop: Property): string | undefined => {
    const name = prop.key.toLowerCase();
    const type = prop.type;

    // 容量相关
    if (name.includes('capacity') && (type === 'float' || type === 'int')) {
      return AttributeSemanticLabels.RESOURCE_CAPACITY;
    }

    // 时间相关
    if (name.includes('start_time') || name === 'starttime') {
      return AttributeSemanticLabels.TIME_START;
    }
    if (name.includes('end_time') || name === 'endtime') {
      return AttributeSemanticLabels.TIME_END;
    }
    if (name.includes('duration')) {
      return AttributeSemanticLabels.TIME_DURATION;
    }

    // 数量相关
    if ((name.includes('quantity') || name.includes('qty')) && (type === 'float' || type === 'int')) {
      return AttributeSemanticLabels.ORDER_QUANTITY;
    }

    // 质量相关
    if (name.includes('quality') || name.includes('oee') || name.includes('yield')) {
      return AttributeSemanticLabels.QUALITY_METRIC;
    }

    return undefined;
  };

  /**
   * 应用智能推荐的模板
   */
  const applyRecommendedTemplate = (template: GeneratedConstraintTemplate, params?: Record<string, string>) => {
    if (!selectedEntity) return;

    // 构建实际表达式
    let expression = template.expressionTemplate;
    const defaultParams = params || template.quickApply?.defaultParams || {};

    // 替换参数
    Object.entries(defaultParams).forEach(([key, value]) => {
      expression = expression.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    // 生成 AST
    let ast: ConstraintAST | undefined;
    if (template.astTemplate) {
      ast = { ...template.astTemplate, id: `cons-${Date.now()}` };
      setGeneratedAST(ast);

      // 生成求解器映射
      const mapping = generateSolverMapping(ast, 'linear');
      setSolverMapping(mapping);
    }

    const newConstraint: Constraint = {
      id: `cons-${Date.now()}`,
      name: template.name,
      type: template.constraintType,
      category: template.category as any,
      expression: expression,
      description: `${template.description}\n\n[自动生成] 模板: ${template.templateId}`,
      entityId: selectedEntity.id,
      priority: 1,
      status: 'active',
      group: template.category,
      references: [],
    };

    setConstraints([...constraints, newConstraint]);
    setSelectedConstraint(newConstraint);
    setShowASTPanel(!!ast);
  };

  /**
   * 验证约束并显示 AST
   */
  const validateConstraintWithAST = (constraint: Constraint) => {
    try {
      // 尝试从约束表达式生成 AST（简化版本）
      // 实际项目中应该使用完整的 DSL 解析器
      if (constraint.expression.includes('<=') && constraint.expression.includes('SUM')) {
        const ast = createCapacityConstraint('order', 'quantity', 'line', 'capacity');
        setGeneratedAST(ast);
        setSolverMapping(generateSolverMapping(ast, 'linear'));
        setShowASTPanel(true);
      }
    } catch (e) {
      console.warn('Failed to generate AST:', e);
    }

    validateConstraints();
  };

  const validateConstraints = () => {
    const results: ValidationResult[] = [];

    // 语法检查
    constraints.forEach(cons => {
      if (!cons.expression || cons.expression.trim() === '') {
        results.push({
          type: 'syntax',
          severity: 'error',
          message: `约束 "${cons.name}" 表达式为空`,
          constraintId: cons.id,
        });
      }
    });

    // 冲突检测
    const hardConstraints = constraints.filter(c => c.type === 'hard' && c.status === 'active');
    if (hardConstraints.length >= 2) {
      results.push({
        type: 'conflict',
        severity: 'warning',
        message: `检测到 ${hardConstraints.length} 个硬约束，可能存在冲突风险`,
      });
    }

    if (results.length === 0) {
      results.push({
        type: 'logic',
        severity: 'info',
        message: '所有约束校验通过',
      });
    }

    setValidationResults(results);
    setShowValidationPanel(true);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setShowValidationPanel(true);
    }, 1500);
  };

  const getConstraintIcon = (type: ConstraintType) => {
    switch (type) {
      case 'hard': return Shield;
      case 'soft': return AlertTriangle;
      case 'objective': return Target;
    }
  };

  const getConstraintColor = (type: ConstraintType) => {
    switch (type) {
      case 'hard': return '#ef4444';
      case 'soft': return '#f59e0b';
      case 'objective': return '#10b981';
    }
  };

  const renderDomain = (domain: OntologyDomain, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(domain.id);
    const hasChildren = domain.children && domain.children.length > 0;
    const isSelected = selectedDomainPath === domain.path;

    return (
      <div key={domain.id} style={{ marginLeft: level * 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 12,
            backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
            borderLeft: isSelected ? '3px solid #106BA3' : '3px solid transparent',
          }}
          onClick={() => {
            toggleExpand(domain.id);
            setSelectedDomainPath(domain.path);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} style={{ marginRight: 4 }} /> : <ChevronRight size={14} style={{ marginRight: 4 }} />
          ) : (
            <span style={{ width: 18 }} />
          )}
          <span style={{ fontWeight: hasChildren ? 600 : 400, flex: 1 }}>{domain.displayName}</span>
          <StatusDot status={domain.status} />
        </div>

        {isExpanded && (
          <>
            {domain.entities.map((entity) => (
              <div
                key={entity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px 4px 32px',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: selectedNodeId === entity.id ? 'var(--accent-light)' : 'transparent',
                }}
                onClick={() => {
                  setSelectedNodeId(entity.id);
                  setSelectedEntity(entity);
                }}
              >
                <span style={{ width: 18 }} />
                {entity.icon === 'battery' && <Battery size={12} style={{ marginRight: 6 }} />}
                {entity.icon === 'layers' && <Layers size={12} style={{ marginRight: 6 }} />}
                {entity.icon === 'box' && <Box size={12} style={{ marginRight: 6 }} />}
                {entity.icon === 'truck' && <Truck size={12} style={{ marginRight: 6 }} />}
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{entity.displayName}</span>
                <StatusDot status={entity.status} />
              </div>
            ))}
            {domain.children?.map((child) => renderDomain(child, level + 1))}
          </>
        )}
      </div>
    );
  };

  // 获取当前选中的domain名称
  const selectedDomain = findDomainByPath(selectedDomainPath);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--palantir-bg-page)' }}>
      {/* Header */}
      <header style={{
        height: 48,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--palantir-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button minimal icon={<ChevronLeft size={18} />} onClick={() => onNavigate('settings')} />
          <div style={{
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #106BA3, #0A4A73)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GitBranch size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>本体配置器</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>锂电行业本体管理系统 v2.1.0</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button minimal icon={<Activity size={16} />} text="验证" onClick={validateConstraints} />
          <Button minimal icon={<Play size={16} />} text="模拟推演" onClick={runSimulation} loading={isSimulating} />
          <Divider />
          <Button intent="primary" icon={<Save size={14} />} text="保存更改" />
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Resource Navigator */}
        <div style={{
          width: 280,
          background: '#FFFFFF',
          borderRight: '1px solid var(--palantir-border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--palantir-border)' }}>
            <InputGroup
              leftIcon={<Search size={14} />}
              placeholder="搜索实体或属性..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fill
             
            />
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
            {domains.map((domain) => renderDomain(domain))}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid var(--palantir-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>
              当前选中: {selectedDomain?.displayName || '未选择'}
            </div>
            <Button
              fill
             
              icon={<Plus size={14} />}
              text="添加实体"
              onClick={() => setShowAddEntityDialog(true)}
            />
          </div>
        </div>

        {/* Center: Graph Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background color="#E1E8ED" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeColor="#106BA3"
              nodeColor="#F5F8FA"
              maskColor="rgba(245, 248, 250, 0.9)"
            />
          </ReactFlow>

          {/* Canvas Overlay Info */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            borderRadius: 2,
            border: '1px solid var(--palantir-border)',
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}>
            节点: {nodes.length} | 关系: {edges.length} | 选中: {selectedNodeId || '无'}
          </div>
        </div>

        {/* Right: Inspector Panel */}
        <div style={{
          width: 350,
          background: '#FFFFFF',
          borderLeft: '1px solid var(--palantir-border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {selectedEdgeId ? (
            <EdgeInspector
              edgeId={selectedEdgeId}
              links={links}
              setLinks={setLinks}
              domains={domains}
              onClose={() => setSelectedEdgeId(null)}
            />
          ) : selectedEntity ? (
            <>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--palantir-border)',
                background: '#F8F9FA',
              }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  {selectedEntity.type === 'Object_Type' ? '对象类型' :
                   selectedEntity.type === 'Relation_Type' ? '关系类型' : '属性类型'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {selectedEntity.type === 'Object_Type' && `${selectedEntity.displayName}`}
                  {selectedEntity.type === 'Relation_Type' && `${selectedEntity.displayName}`}
                  {selectedEntity.type === 'Attribute_Type' && `${selectedEntity.displayName}`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  ID: {selectedEntity.id}
                </div>
              </div>

              <Tabs
                selectedTabId={activeTab}
                onChange={(id) => setActiveTab(id as any)}
                className="flex flex-col flex-1"
              >
                <Tab id="general" title="通用" panel={
                  <div style={{ padding: 16 }}>
                    <FormGroup label="显示名称" labelFor="displayName">
                      <InputGroup
                        id="displayName"
                        defaultValue={selectedEntity.displayName}
                        fill
                      />
                    </FormGroup>

                    <FormGroup label="实体类型">
                      <HTMLSelect
                        fill
                        value={selectedEntity.type}
                        onChange={(e) => {
                          const newType = e.target.value as EntityType;
                          updateEntity(selectedEntity.id, { type: newType });
                        }}
                      >
                        {ENTITY_TYPE_OPTIONS.map(group => (
                          <optgroup key={group.category} label={group.category}>
                            {group.options.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </HTMLSelect>
                      <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-tertiary)' }}>
                        {ENTITY_TYPE_OPTIONS.flatMap(g => g.options).find(o => o.value === selectedEntity.type)?.desc}
                      </div>
                    </FormGroup>

                    <FormGroup label="状态">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Tag
                          intent={selectedEntity.status === 'verified' ? 'success' : 'none'}
                          minimal={selectedEntity.status !== 'verified'}
                        >
                          已验证
                        </Tag>
                        <Tag
                          intent={selectedEntity.status === 'draft' ? 'warning' : 'none'}
                          minimal={selectedEntity.status !== 'draft'}
                        >
                          草稿
                        </Tag>
                        <Tag
                          intent={selectedEntity.status === 'conflict' ? 'danger' : 'none'}
                          minimal={selectedEntity.status !== 'conflict'}
                        >
                          冲突
                        </Tag>
                      </div>
                    </FormGroup>

                    <Divider />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        属性 ({selectedEntity.properties.length})
                      </span>
                      <Button small minimal icon={<Plus size={14} />} />
                    </div>

                    {selectedEntity.properties.map((prop, idx) => (
                      <Card key={idx} style={{ padding: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 500 }}>{prop.key}</span>
                          <Tag minimal className="bp5-small">
                            {ATTRIBUTE_TYPE_OPTIONS.flatMap(g => g.options).find(o => o.value === prop.type)?.label || prop.type}
                          </Tag>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {prop.value !== undefined ? prop.value : '—'} {prop.unit}
                        </div>
                      </Card>
                    ))}
                  </div>
                } />

                <Tab id="logic" title="逻辑" panel={
                  <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
                    {/* 约束配置区域 */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary)',
                        marginBottom: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>约束定义 (DSL)</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                           
                            minimal
                            icon={<Shield size={14} />}
                            text="校验"
                            onClick={validateConstraints}
                          />
                          <Button
                           
                            minimal
                            icon={<Plus size={14} />}
                            text="添加约束"
                            onClick={addConstraint}
                          />
                        </div>
                      </div>

                      {/* 当前实体相关的约束列表 */}
                      <div style={{ marginBottom: 16 }}>
                        {constraints
                          .filter(c => c.entityId === selectedEntity.id)
                          .map(constraint => {
                            const Icon = getConstraintIcon(constraint.type);
                            const isSelected = selectedConstraint?.id === constraint.id;
                            return (
                              <div
                                key={constraint.id}
                                onClick={() => setSelectedConstraint(constraint)}
                                style={{
                                  padding: 10,
                                  marginBottom: 8,
                                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--palantir-border)'}`,
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  background: isSelected ? 'rgba(16, 107, 163, 0.05)' : '#fff',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <Icon size={14} color={getConstraintColor(constraint.type)} />
                                  <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{constraint.name}</span>
                                  <Tag
                                    minimal
                                    intent={constraint.type === 'hard' ? 'danger' : constraint.type === 'soft' ? 'warning' : 'success'}
                                    style={{ fontSize: 10 }}
                                  >
                                    {constraint.type === 'hard' ? '硬' : constraint.type === 'soft' ? '软' : '目标'}
                                  </Tag>
                                  <Button
                                   
                                    minimal
                                    icon={<Trash2 size={12} />}
                                    onClick={(e) => { e.stopPropagation(); deleteConstraint(constraint.id); }}
                                  />
                                </div>
                                <div style={{
                                  fontSize: 11,
                                  color: 'var(--text-secondary)',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {constraint.expression || '(无表达式)'}
                                </div>
                              </div>
                            );
                          })}

                        {constraints.filter(c => c.entityId === selectedEntity.id).length === 0 && (
                          <div style={{
                            padding: 20,
                            textAlign: 'center',
                            color: 'var(--text-tertiary)',
                            fontSize: 12,
                            border: '1px dashed var(--palantir-border)',
                            borderRadius: 2
                          }}>
                            暂无约束，点击上方"添加约束"按钮创建
                          </div>
                        )}
                      </div>

                      {/* 约束编辑器 */}
                      {selectedConstraint && selectedConstraint.entityId === selectedEntity.id && (
                        <Card style={{ marginBottom: 16, background: '#F8F9FA' }}>
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>约束名称</div>
                            <InputGroup
                             
                              value={selectedConstraint.name}
                              onChange={(e) => updateConstraint(selectedConstraint.id, { name: e.target.value })}
                              fill
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>类型</div>
                              <HTMLSelect
                                value={selectedConstraint.type}
                                onChange={(e) => updateConstraint(selectedConstraint.id, { type: e.target.value as ConstraintType })}
                                fill
                                className="bp5-small"
                              >
                                <option value="hard">硬约束</option>
                                <option value="soft">软约束</option>
                                <option value="objective">优化目标</option>
                              </HTMLSelect>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>分组</div>
                              <InputGroup
                               
                                value={selectedConstraint.group}
                                onChange={(e) => updateConstraint(selectedConstraint.id, { group: e.target.value })}
                                fill
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 600 }}>DSL 表达式</span>
                              <Button
                               
                                minimal
                                active={dslMode}
                                onClick={() => setDslMode(!dslMode)}
                              >
                                {dslMode ? '专家模式' : '低代码'}
                              </Button>
                            </div>

                            {dslMode ? (
                              <textarea
                                value={selectedConstraint.expression}
                                onChange={(e) => updateConstraint(selectedConstraint.id, { expression: e.target.value })}
                                style={{
                                  width: '100%',
                                  minHeight: 80,
                                  padding: 8,
                                  border: '1px solid var(--palantir-border-dark)',
                                  borderRadius: 2,
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  resize: 'vertical',
                                }}
                                placeholder="例如: SUM(order.quantity) <= line.capacity"
                              />
                            ) : (
                              <div style={{
                                padding: 12,
                                background: '#fff',
                                border: '1px solid var(--palantir-border)',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8
                              }}>
                                <HTMLSelect
                                 
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      updateConstraint(selectedConstraint.id, {
                                        expression: selectedConstraint.expression + e.target.value
                                      });
                                    }
                                  }}
                                >
                                  <option value="">选择函数...</option>
                                  <option value="SUM(">SUM(</option>
                                  <option value="MAX(">MAX(</option>
                                  <option value="MIN(">MIN(</option>
                                  <option value="AVG(">AVG(</option>
                                  <option value="COUNT(">COUNT(</option>
                                  <option value="NO_OVERLAP(">NO_OVERLAP(</option>
                                </HTMLSelect>

                                <HTMLSelect
                                 
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      updateConstraint(selectedConstraint.id, {
                                        expression: selectedConstraint.expression + e.target.value
                                      });
                                    }
                                  }}
                                >
                                  <option value="">选择属性...</option>
                                  {selectedEntity.properties.map(prop => (
                                    <option key={prop.key} value={prop.key}>{prop.key}</option>
                                  ))}
                                </HTMLSelect>

                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                  {['<=', '>=', '==', '!=', '<', '>'].map(op => (
                                    <Button
                                      key={op}
                                     
                                      minimal
                                      onClick={() => updateConstraint(selectedConstraint.id, {
                                        expression: selectedConstraint.expression + ' ' + op + ' '
                                      })}
                                    >
                                      {op}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div style={{
                              marginTop: 8,
                              padding: 8,
                              background: '#fff',
                              borderRadius: 2,
                              fontSize: 11,
                              fontFamily: 'monospace',
                              color: 'var(--text-secondary)'
                            }}>
                              当前: {selectedConstraint.expression || '(空)'}
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* 约束模板 */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary)',
                          marginBottom: 8
                        }}>
                          约束模板库
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {constraintTemplates.map(template => (
                            <Button
                              key={template.id}
                             
                              minimal
                              onClick={() => applyTemplate(template)}
                              style={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                padding: '8px 12px',
                                height: 'auto'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 500 }}>{template.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                  {template.expression.slice(0, 30)}...
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* 智能推荐约束模板 */}
                      {showRecommendedTemplates && recommendedTemplates.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: '#10b981',
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}>
                            <Zap size={12} />
                            智能推荐约束
                            <Tag minimal intent="success" style={{ marginLeft: 4 }}>
                              {recommendedTemplates.length}
                            </Tag>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                            {recommendedTemplates.slice(0, 3).map(template => (
                              <Card
                                key={template.templateId}
                                interactive
                                onClick={() => applyRecommendedTemplate(template)}
                                style={{
                                  padding: '10px 12px',
                                  background: '#f0fdf4',
                                  border: '1px solid #86efac'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                                      {template.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#15803d', marginTop: 2 }}>
                                      {template.example}
                                    </div>
                                  </div>
                                  <Button
                                    small
                                    intent="success"
                                    icon={<CheckCircle2 size={14} />}
                                    text="应用"
                                  />
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      <Divider />

                      {/* 计算属性公式 */}
                      <FormGroup
                        label="计算属性公式"
                        labelInfo="(支持 LaTeX)"
                        style={{ marginTop: 16 }}
                      >
                        <textarea
                          style={{
                            width: '100%',
                            minHeight: 80,
                            padding: 8,
                            border: '1px solid var(--palantir-border-dark)',
                            borderRadius: 2,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            resize: 'vertical',
                          }}
                          placeholder="例如: sum(components.carbon) * (1 + manufacturing_loss_rate)"
                          defaultValue={selectedEntity.properties.find(p => p.formula)?.formula || ''}
                        />
                      </FormGroup>

                      <Button fill intent="primary" icon={<Play size={14} />} text="测试公式计算" />
                    </div>
                  </div>
                } />

                <Tab id="data" title="数据源" panel={
                  <div style={{ padding: 16 }}>
                    <FormGroup label="数据源类型">
                      <HTMLSelect fill defaultValue="sql">
                        <option value="sql">SQL数据库</option>
                        <option value="api">REST接口</option>
                        <option value="file">CSV/Excel文件</option>
                        <option value="stream">事件流</option>
                      </HTMLSelect>
                    </FormGroup>

                    <FormGroup label="连接字符串">
                      <InputGroup
                        fill
                        defaultValue="jdbc:postgresql://localhost:5432/lithium_db"
                      />
                    </FormGroup>

                    <FormGroup label="表名">
                      <InputGroup
                        fill
                        defaultValue={`tbl_${selectedEntity.id}`}
                      />
                    </FormGroup>

                    <Divider />

                    <Button fill minimal icon={<Database size={14} />} text="测试连接" />
                  </div>
                } />

                <Tab id="perms" title="权限" panel={
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      访问控制
                    </div>
                    <Checkbox className="bp5-small" label="仅管理员可编辑" defaultChecked />
                    <Checkbox className="bp5-small" label="允许只读访问" defaultChecked />
                    <Checkbox className="bp5-small" label="需要数据脱敏" />
                  </div>
                } />
              </Tabs>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
            }}>
              <Braces size={48} strokeWidth={1} />
              <div style={{ marginTop: 16, fontSize: 12 }}>选择一个实体进行编辑</div>
            </div>
          )}
        </div>
      </div>

      {/* 底部约束校验/推演测试面板 */}
      <div style={{
        height: showValidationPanel ? 200 : 40,
        background: '#fff',
        borderTop: '1px solid var(--palantir-border)',
        transition: 'height 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 面板头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: showValidationPanel ? '1px solid var(--palantir-border)' : 'none',
          background: '#F8F9FA',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
             
              minimal
              icon={<ChevronDown size={16} style={{ transform: showValidationPanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
              onClick={() => setShowValidationPanel(!showValidationPanel)}
            />
            <span style={{ fontSize: 12, fontWeight: 600 }}>约束校验与推演测试</span>
            {validationResults.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {validationResults.some(r => r.severity === 'error') && (
                  <Tag intent="danger" style={{ fontSize: 10 }}>{validationResults.filter(r => r.severity === 'error').length} 错误</Tag>
                )}
                {validationResults.some(r => r.severity === 'warning') && (
                  <Tag intent="warning" style={{ fontSize: 10 }}>{validationResults.filter(r => r.severity === 'warning').length} 警告</Tag>
                )}
                {validationResults.some(r => r.severity === 'info') && (
                  <Tag intent="primary" style={{ fontSize: 10 }}>{validationResults.filter(r => r.severity === 'info').length} 信息</Tag>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              small
              minimal
              active={showASTPanel}
              onClick={() => setShowASTPanel(!showASTPanel)}
              icon={<Braces size={14} />}
              title="显示/隐藏 DSL AST"
            >
              DSL AST
            </Button>
            <Button small minimal onClick={validateConstraints} icon={<CheckCircle2 size={14} />}>重新校验</Button>
            <Button small minimal onClick={runSimulation} loading={isSimulating} icon={<Play size={14} />}>运行推演</Button>
          </div>
        </div>

        {/* 面板内容 */}
        {showValidationPanel && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* 校验结果 */}
            <div style={{ flex: 1, padding: 16, borderRight: '1px solid var(--palantir-border)', overflow: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                校验结果
              </div>
              {validationResults.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>
                  点击"验证"或"重新校验"开始检查约束
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {validationResults.map((result, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 10,
                        borderRadius: 2,
                        border: `1px solid ${
                          result.severity === 'error' ? '#fecaca' :
                          result.severity === 'warning' ? '#fed7aa' : '#bfdbfe'
                        }`,
                        background: result.severity === 'error' ? '#fef2f2' :
                                   result.severity === 'warning' ? '#fff7ed' : '#eff6ff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        {result.severity === 'error' && <XCircle size={14} color="#dc2626" />}
                        {result.severity === 'warning' && <AlertTriangle size={14} color="#ea580c" />}
                        {result.severity === 'info' && <Info size={14} color="#2563eb" />}
                        <div>
                          <div style={{ fontSize: 12, color: '#182026' }}>{result.message}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            类型: {result.type}{result.constraintId && ` | 约束ID: ${result.constraintId}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AST 与求解器映射 */}
            {showASTPanel && generatedAST && (
              <div style={{ flex: 1, padding: 16, borderRight: '1px solid var(--palantir-border)', overflow: 'auto', background: '#fafafa' }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Braces size={14} />
                  DSL AST 语法树
                  <Tag minimal intent="primary" style={{ fontSize: 10 }}>{generatedAST.category}</Tag>
                </div>
                <pre style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  background: '#fff',
                  padding: 12,
                  borderRadius: 4,
                  border: '1px solid var(--palantir-border)',
                  overflow: 'auto',
                  maxHeight: 120
                }}>
                  {JSON.stringify(generatedAST, null, 2)}
                </pre>
                {solverMapping && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, marginTop: 12, marginBottom: 8, color: 'var(--text-secondary)' }}>
                      求解器映射 ({solverMapping.solverType})
                    </div>
                    <div style={{
                      fontSize: 10,
                      fontFamily: 'monospace',
                      background: '#fff',
                      padding: 12,
                      borderRadius: 4,
                      border: '1px solid var(--palantir-border)'
                    }}>
                      <div style={{ color: '#166534' }}>// {solverMapping.originalDsl}</div>
                      <div style={{ marginTop: 4 }}>
                        <span style={{ color: '#7c3aed' }}>type:</span> {solverMapping.constraintMapping.type}
                      </div>
                      <div>
                        <span style={{ color: '#7c3aed' }}>lhs:</span> {solverMapping.constraintMapping.lhs}
                      </div>
                      <div>
                        <span style={{ color: '#7c3aed' }}>rhs:</span> {solverMapping.constraintMapping.rhs}
                      </div>
                      <div>
                        <span style={{ color: '#7c3aed' }}>op:</span> {solverMapping.constraintMapping.operator}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 推演测试 */}
            <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                推演测试结果
              </div>
              {isSimulating ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
                  <div className="bp3-spinner bp3-small">
                    <div className="bp3-spinner-animation" />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>正在推演...</span>
                </div>
              ) : constraints.filter(c => c.status === 'active').length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>
                  暂无激活的约束用于推演
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {constraints.filter(c => c.status === 'active').map(constraint => {
                    // 模拟推演结果
                    const passed = Math.random() > 0.3;
                    return (
                      <div
                        key={constraint.id}
                        style={{
                          padding: 10,
                          borderRadius: 2,
                          border: `1px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
                          background: passed ? '#f0fdf4' : '#fef2f2',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {passed ? <CheckCircle2 size={14} color="#16a34a" /> : <XCircle size={14} color="#dc2626" />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#182026' }}>{constraint.name}</div>
                            <div style={{ fontSize: 11, color: passed ? '#166534' : '#991b1b' }}>
                              {passed ? '检查通过' : '违反约束'}
                            </div>
                          </div>
                          <Tag minimal intent={constraint.type === 'hard' ? 'danger' : constraint.type === 'soft' ? 'warning' : 'success'} style={{ fontSize: 10 }}>
                            {constraint.type === 'hard' ? '硬' : constraint.type === 'soft' ? '软' : '目标'}
                          </Tag>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 添加实体弹窗 */}
      <Dialog
        isOpen={showAddEntityDialog}
        onClose={() => setShowAddEntityDialog(false)}
        title="添加新实体"
        style={{ width: 400 }}
      >
        <div style={{ padding: 20 }}>
          <FormGroup label="添加到目录">
            <div style={{
              padding: '8px 12px',
              background: '#F8F9FA',
              borderRadius: 4,
              fontSize: 13,
              color: '#182026',
            }}>
              {selectedDomain?.displayName || 'Manufacturing'}
            </div>
          </FormGroup>

          <FormGroup label="实体名称">
            <InputGroup
              placeholder="输入实体名称"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              fill
            />
          </FormGroup>

          <FormGroup label="实体类型">
            <HTMLSelect
              fill
              value={newEntityType}
              onChange={(e) => setNewEntityType(e.target.value as any)}
            >
              <option value="Object_Type">对象类型</option>
              <option value="Relation_Type">关系类型</option>
              <option value="Attribute_Type">属性类型</option>
            </HTMLSelect>
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button onClick={() => setShowAddEntityDialog(false)}>
              取消
            </Button>
            <Button
              intent="primary"
              onClick={handleAddEntity}
              disabled={!newEntityName.trim()}
            >
              添加
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
