// ============================================================================
// 大型锂电制造企业本体配置器 - Palantir风格工业本体体系
// ============================================================================

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
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ChevronLeft,
  Search,
  Plus,
  Database,
  Battery,
  Factory,
  Truck,
  Activity,
  Save,
  Play,
  GitBranch,
  Layers,
  Box,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Shield,
  Cpu,
  FileCode,
  Filter,
  Maximize2,
  Minimize2,
  Link2,
} from 'lucide-react';

import type { ConstraintAST } from '../types/constraint-ast';

// --- Types ---

interface OntologyEntity {
  id: string;
  displayName: string;
  type: 'Object_Type' | 'Relation_Type' | 'Attribute_Type';
  status: 'active' | 'draft' | 'deprecated';
  icon?: string;
  properties: Array<{
    key: string;
    value?: string | number | boolean;
    unit?: string;
    type?: string;
  }>;
  description?: string;
  x?: number;
  y?: number;
  domain: string; // 所属域ID
  domainName: string; // 所属域名称
  // 扩展配置信息
  version?: string;
  namespace?: string;
  tags?: string[];
  dependencies?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  parent_id?: string;
  base_id?: string;  // 所属基地ID
  metadata?: Record<string, any>;
}

interface OntologyDomain {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  description?: string;
  entities: OntologyEntity[];
}

interface OntologyLink {
  id: string;
  source: string;
  target: string;
  relation: string;
  // Palantir本体论 - 关系类型系统
  relationType: 'structural' | 'flow' | 'control' | 'temporal' | 'causal' | 'reference';
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:N';
  description?: string;
  // 关系属性
  properties?: {
    weight?: number;           // 关系权重（用于图算法）
    strength?: 'strong' | 'weak' | 'conditional';  // 关系强制程度
    direction: 'directed' | 'bidirectional';       // 方向性
    temporality: 'persistent' | 'transient';       // 时间持续性
    validFrom?: string;        // 关系生效时间
    validTo?: string;          // 关系失效时间
  };
  // 业务语义标签
  semantics?: string[];
}

// 约束库定义 - 全局可复用的约束模板
interface ConstraintLibraryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  category: 'hard' | 'soft' | 'business';
  expression: string;
  applicableDomains: string[]; // 适用于哪些领域
  parameters?: string[]; // 参数列表
}

// 实体已应用的约束实例
interface Constraint {
  id: string;
  entityId: string;
  libraryItemId: string; // 关联到约束库
  type: string;
  category: string;
  expression: string;
  description: string;
  ast?: ConstraintAST;
}

interface ValidationResult {
  entityId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
}

// ============================================================================
// 全局约束库 - 可复用的约束定义
// ============================================================================
const constraintLibrary: ConstraintLibraryItem[] = [
  {
    id: 'lib-capacity-utilization',
    name: '产能利用率上限',
    description: '确保产能利用率不超过95%，避免过度加班和设备损耗',
    type: 'capacity_check',
    category: 'hard',
    expression: 'utilization_rate <= 95',
    applicableDomains: ['org', 'cap', 'mfg'],
    parameters: ['utilization_rate']
  },
  {
    id: 'lib-quality-yield',
    name: '质量合格率下限',
    description: '确保产品一次通过率不低于98%',
    type: 'quality_check',
    category: 'hard',
    expression: 'yield_rate >= 98',
    applicableDomains: ['quality', 'mfg', 'prod'],
    parameters: ['yield_rate']
  },
  {
    id: 'lib-equipment-availability',
    name: '设备可用率下限',
    description: '关键设备可用率需保持在90%以上',
    type: 'maintenance',
    category: 'soft',
    expression: 'availability >= 90',
    applicableDomains: ['cap'],
    parameters: ['availability']
  },
  {
    id: 'lib-inventory-turnover',
    name: '库存周转天数',
    description: '原材料库存周转天数不超过30天',
    type: 'inventory_check',
    category: 'business',
    expression: 'inventory_days <= 30',
    applicableDomains: ['supply'],
    parameters: ['inventory_days']
  },
  {
    id: 'lib-delivery-otd',
    name: '订单准时交付率',
    description: '订单准时交付率需达到95%以上',
    type: 'delivery_check',
    category: 'hard',
    expression: 'otd_rate >= 95',
    applicableDomains: ['sales', 'mfg'],
    parameters: ['otd_rate']
  },
  {
    id: 'lib-defect-rate',
    name: '缺陷率上限',
    description: '过程缺陷率不超过0.5%',
    type: 'quality_check',
    category: 'hard',
    expression: 'defect_rate <= 0.5',
    applicableDomains: ['quality', 'mfg'],
    parameters: ['defect_rate']
  },
  {
    id: 'lib-oee-target',
    name: 'OEE目标值',
    description: '设备综合效率OEE目标值85%',
    type: 'efficiency',
    category: 'soft',
    expression: 'oee >= 85',
    applicableDomains: ['cap', 'mfg'],
    parameters: ['oee']
  },
  {
    id: 'lib-mtbf-target',
    name: '平均故障间隔时间',
    description: '关键设备MTBF不低于720小时',
    type: 'maintenance',
    category: 'hard',
    expression: 'mtbf >= 720',
    applicableDomains: ['cap'],
    parameters: ['mtbf']
  },
  {
    id: 'lib-cycle-time',
    name: '节拍时间上限',
    description: '工序节拍时间不超过标准值',
    type: 'efficiency',
    category: 'soft',
    expression: 'cycle_time <= standard_time',
    applicableDomains: ['cap', 'mfg', 'prod'],
    parameters: ['cycle_time', 'standard_time']
  },
  {
    id: 'lab-production-batch-size',
    name: '生产批次大小',
    description: '生产批次大小需符合经济批量要求',
    type: 'batch_control',
    category: 'business',
    expression: 'batch_size >= min_batch AND batch_size <= max_batch',
    applicableDomains: ['mfg', 'prod'],
    parameters: ['batch_size', 'min_batch', 'max_batch']
  }
];

// ============================================================================
// 本体节点类型库 - 用于创建新节点时选择
// ============================================================================
interface NodeTypeLibraryItem {
  id: string;
  name: string;
  domain: string;
  domainName: string;
  icon: string;
  description: string;
  defaultProperties: Array<{ key: string; value: any; unit?: string; type?: string }>;
}

// 节点类型库
const nodeTypeLibrary: NodeTypeLibraryItem[] = [
  // 组织资源域
  { id: 'type-company', name: '公司', domain: 'org', domainName: '组织资源域', icon: 'building', description: '集团/公司实体', defaultProperties: [{ key: 'code', value: '', type: 'string' }, { key: 'name', value: '', type: 'string' }] },
  { id: 'type-base', name: '制造基地', domain: 'org', domainName: '组织资源域', icon: 'building', description: '生产制造基地', defaultProperties: [{ key: 'base_code', value: '', type: 'string' }, { key: 'location', value: '', type: 'string' }] },
  { id: 'type-factory', name: '工厂', domain: 'org', domainName: '组织资源域', icon: 'factory', description: '生产工厂', defaultProperties: [{ key: 'factory_code', value: '', type: 'string' }, { key: 'capacity', value: 0, unit: 'GWh', type: 'number' }] },
  { id: 'type-workshop', name: '车间', domain: 'org', domainName: '组织资源域', icon: 'layers', description: '生产车间', defaultProperties: [{ key: 'workshop_code', value: '', type: 'string' }, { key: 'area', value: 0, unit: '㎡', type: 'number' }] },
  { id: 'type-employee', name: '员工', domain: 'org', domainName: '组织资源域', icon: 'activity', description: '企业员工', defaultProperties: [{ key: 'employee_code', value: '', type: 'string' }, { key: 'name', value: '', type: 'string' }] },

  // 产能设备域
  { id: 'type-line', name: '产线', domain: 'cap', domainName: '产能设备域', icon: 'activity', description: '生产线', defaultProperties: [{ key: 'line_code', value: '', type: 'string' }, { key: 'oee_target', value: 85, unit: '%', type: 'number' }] },
  { id: 'type-station', name: '工位', domain: 'cap', domainName: '产能设备域', icon: 'activity', description: '生产工位', defaultProperties: [{ key: 'station_code', value: '', type: 'string' }, { key: 'cycle_time', value: 0, unit: '秒', type: 'number' }] },
  { id: 'type-equipment', name: '设备', domain: 'cap', domainName: '产能设备域', icon: 'cpu', description: '生产设备', defaultProperties: [{ key: 'equipment_code', value: '', type: 'string' }, { key: 'model', value: '', type: 'string' }] },

  // 产品工艺域
  { id: 'type-product', name: '产品型号', domain: 'prod', domainName: '产品工艺域', icon: 'battery', description: '产品型号', defaultProperties: [{ key: 'model_code', value: '', type: 'string' }, { key: 'capacity', value: 0, unit: 'Ah', type: 'number' }] },
  { id: 'type-process', name: '工序', domain: 'prod', domainName: '产品工艺域', icon: 'layers', description: '工艺工序', defaultProperties: [{ key: 'process_code', value: '', type: 'string' }, { key: 'std_time', value: 0, unit: '秒', type: 'number' }] },

  // 供应链域
  { id: 'type-supplier', name: '供应商', domain: 'supply', domainName: '供应链域', icon: 'truck', description: '供应商', defaultProperties: [{ key: 'supplier_code', value: '', type: 'string' }, { key: 'name', value: '', type: 'string' }] },
  { id: 'type-material', name: '物料', domain: 'supply', domainName: '供应链域', icon: 'box', description: '原材料/物料', defaultProperties: [{ key: 'material_code', value: '', type: 'string' }, { key: 'name', value: '', type: 'string' }] },
  { id: 'type-warehouse', name: '仓库', domain: 'supply', domainName: '供应链域', icon: 'building', description: '仓库', defaultProperties: [{ key: 'warehouse_code', value: '', type: 'string' }, { key: 'type', value: '原材料仓', type: 'string' }] },

  // 生产执行域
  { id: 'type-order', name: '生产工单', domain: 'mfg', domainName: '生产执行域', icon: 'file-code', description: '生产工单', defaultProperties: [{ key: 'order_no', value: '', type: 'string' }, { key: 'qty', value: 0, unit: '件', type: 'number' }] },
  { id: 'type-wip', name: '在制品', domain: 'mfg', domainName: '生产执行域', icon: 'box', description: '在制品', defaultProperties: [{ key: 'wip_no', value: '', type: 'string' }, { key: 'status', value: '加工中', type: 'string' }] },

  // 质量管理域
  { id: 'type-inspection', name: '检验项', domain: 'quality', domainName: '质量管理域', icon: 'shield', description: '质量检验项', defaultProperties: [{ key: 'item_code', value: '', type: 'string' }, { key: 'std_value', value: '', type: 'string' }] },
  { id: 'type-defect', name: '缺陷类型', domain: 'quality', domainName: '质量管理域', icon: 'x', description: '缺陷类型', defaultProperties: [{ key: 'defect_code', value: '', type: 'string' }, { key: 'severity', value: '一般', type: 'string' }] },

  // 销售客户域
  { id: 'type-customer', name: '客户', domain: 'sales', domainName: '销售客户域', icon: 'activity', description: '客户', defaultProperties: [{ key: 'customer_code', value: '', type: 'string' }, { key: 'name', value: '', type: 'string' }] },
  { id: 'type-sales-order', name: '销售订单', domain: 'sales', domainName: '销售客户域', icon: 'file-code', description: '销售订单', defaultProperties: [{ key: 'so_no', value: '', type: 'string' }, { key: 'qty', value: 0, unit: '件', type: 'number' }] },

  // 项目管理域
  { id: 'type-project', name: '研发项目', domain: 'project', domainName: '项目管理域', icon: 'git-branch', description: '研发项目', defaultProperties: [{ key: 'project_code', value: '', type: 'string' }, { key: 'phase', value: '开发中', type: 'string' }] },

  // 成本财务域
  { id: 'type-cost-center', name: '成本中心', domain: 'cost', domainName: '成本财务域', icon: 'activity', description: '成本中心', defaultProperties: [{ key: 'cc_code', value: '', type: 'string' }, { key: 'budget', value: 0, unit: '元', type: 'number' }] },
];

// ============================================================================
// 9大域本体实体定义 - 60+核心实体
// ============================================================================

const createEntity = (
  id: string,
  displayName: string,
  domain: string,
  domainName: string,
  icon: string,
  description: string,
  properties: Array<{ key: string; value: any; unit?: string; type?: string }>,
  extra: Partial<OntologyEntity> = {}
): OntologyEntity => ({
  id,
  displayName,
  type: 'Object_Type',
  status: 'active',
  icon,
  description,
  properties,
  domain,
  domainName,
  version: '1.0.0',
  namespace: `${domain}.${id}`,
  tags: [domainName],
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-03-20T14:30:00Z',
  created_by: '系统管理员',
  metadata: {},
  ...extra,
});

// ===== 1. 组织资源域 (Organization) =====
const orgEntities: OntologyEntity[] = [
  createEntity('company', '集团公司', 'org', '组织资源域', 'building', '集团总部', [
    { key: 'company_code', value: 'CALB', type: 'string' },
    { key: 'company_name', value: '中创新航', type: 'string' },
    { key: 'established', value: '2007', type: 'string' },
  ], { metadata: { employees: 15000, bases: 6 } }),

  // 中创新航六大基地
  createEntity('base_cz', '常州基地', 'org', '组织资源域', 'building', '总部制造基地', [
    { key: 'base_code', value: 'BASE-CZ', type: 'string' },
    { key: 'location', value: '江苏常州', type: 'string' },
    { key: 'total_area', value: 1200000, unit: '㎡', type: 'number' },
    { key: 'total_capacity', value: 70, unit: 'GWh/年', type: 'number' },
    { key: 'employee_count', value: 5000, unit: '人', type: 'number' },
    { key: 'utilization_rate', value: 88, unit: '%', type: 'number' },
  ], {
    metadata: { base_type: '总部基地', planning_capacity_2025: '100GWh', products: 'LFP, NCM' }
  }),

  createEntity('base_xm', '厦门基地', 'org', '组织资源域', 'building', '厦门制造基地', [
    { key: 'base_code', value: 'BASE-XM', type: 'string' },
    { key: 'location', value: '福建厦门', type: 'string' },
    { key: 'total_area', value: 800000, unit: '㎡', type: 'number' },
    { key: 'total_capacity', value: 50, unit: 'GWh/年', type: 'number' },
    { key: 'employee_count', value: 3000, unit: '人', type: 'number' },
    { key: 'utilization_rate', value: 82, unit: '%', type: 'number' },
  ], {
    metadata: { base_type: '区域基地', planning_capacity_2025: '80GWh', products: 'LFP' }
  }),

  createEntity('base_lz', '柳州基地', 'org', '组织资源域', 'building', '柳州制造基地', [
    { key: 'base_code', value: 'BASE-LZ', type: 'string' },
    { key: 'location', value: '广西柳州', type: 'string' },
    { key: 'total_area', value: 600000, unit: '㎡', type: 'number' },
    { key: 'total_capacity', value: 35, unit: 'GWh/年', type: 'number' },
    { key: 'employee_count', value: 2000, unit: '人', type: 'number' },
    { key: 'utilization_rate', value: 75, unit: '%', type: 'number' },
  ], {
    metadata: { base_type: '区域基地', planning_capacity_2025: '50GWh', products: 'LFP' }
  }),

  createEntity('base_yc', '盐城基地', 'org', '组织资源域', 'building', '盐城制造基地', [
    { key: 'base_code', value: 'BASE-YC', type: 'string' },
    { key: 'location', value: '江苏盐城', type: 'string' },
    { key: 'total_area', value: 1000000, unit: '㎡', type: 'number' },
    { key: 'total_capacity', value: 60, unit: 'GWh/年', type: 'number' },
    { key: 'employee_count', value: 3500, unit: '人', type: 'number' },
    { key: 'utilization_rate', value: 80, unit: '%', type: 'number' },
  ], {
    metadata: { base_type: '区域基地', planning_capacity_2025: '90GWh', products: 'LFP, NCM' }
  }),

  createEntity('base_cd', '成都基地', 'org', '组织资源域', 'building', '成都制造基地', [
    { key: 'base_code', value: 'BASE-CD', type: 'string' },
    { key: 'location', value: '四川成都', type: 'string' },
    { key: 'total_area', value: 700000, unit: '㎡', type: 'number' },
    { key: 'total_capacity', value: 40, unit: 'GWh/年', type: 'number' },
    { key: 'employee_count', value: 2500, unit: '人', type: 'number' },
    { key: 'utilization_rate', value: 78, unit: '%', type: 'number' },
  ], {
    metadata: { base_type: '区域基地', planning_capacity_2025: '60GWh', products: 'LFP' }
  }),

  createEntity('base_wh', '武汉基地', 'org', '组织资源域', 'building', '武汉制造基地', [
    { key: 'base_code', value: 'BASE-WH', type: 'string' },
    { key: 'location', value: '湖北武汉', type: 'string' },
    { key: 'total_area', value: 900000, unit: '㎡', type: 'number' },
    { key: 'total_capacity', value: 55, unit: 'GWh/年', type: 'number' },
    { key: 'employee_count', value: 3200, unit: '人', type: 'number' },
    { key: 'utilization_rate', value: 85, unit: '%', type: 'number' },
  ], {
    metadata: { base_type: '区域基地', planning_capacity_2025: '80GWh', products: 'LFP, NCM' }
  }),

  createEntity('factory_a', '极片工厂', 'org', '组织资源域', 'factory', '前段极片制造工厂', [
    { key: 'factory_code', value: 'FAC-A', type: 'string' },
    { key: 'factory_type', value: '极片工厂', type: 'string' },
    { key: 'process_segment', value: '前段', type: 'string' },
    { key: 'annual_capacity', value: 120, unit: 'GWh', type: 'number' },
    { key: 'workshop_count', value: 4, unit: '个', type: 'number' },
    { key: 'line_count', value: 32, unit: '条', type: 'number' },
  ], { parent_id: 'base_cz', dependencies: ['base_cz'], base_id: 'base_cz' }),

  createEntity('factory_b', '电芯工厂', 'org', '组织资源域', 'factory', '中段电芯组装工厂', [
    { key: 'factory_code', value: 'FAC-B', type: 'string' },
    { key: 'factory_type', value: '电芯工厂', type: 'string' },
    { key: 'process_segment', value: '中段', type: 'string' },
    { key: 'annual_capacity', value: 150, unit: 'GWh', type: 'number' },
    { key: 'workshop_count', value: 6, unit: '个', type: 'number' },
    { key: 'line_count', value: 48, unit: '条', type: 'number' },
  ], { parent_id: 'base_cz', dependencies: ['base_cz', 'factory_a'], base_id: 'base_cz' }),

  createEntity('factory_c', '模组PACK工厂', 'org', '组织资源域', 'factory', '后段模组PACK工厂', [
    { key: 'factory_code', value: 'FAC-C', type: 'string' },
    { key: 'factory_type', value: '模组PACK工厂', type: 'string' },
    { key: 'process_segment', value: '后段', type: 'string' },
    { key: 'annual_capacity', value: 100, unit: 'GWh', type: 'number' },
    { key: 'workshop_count', value: 3, unit: '个', type: 'number' },
    { key: 'line_count', value: 24, unit: '条', type: 'number' },
  ], { parent_id: 'base_cz', dependencies: ['base_cz', 'factory_b'], base_id: 'base_cz' }),

  createEntity('workshop_front', '前段车间', 'org', '组织资源域', 'layers', '极片制造车间', [
    { key: 'workshop_code', value: 'WS-FRONT-01', type: 'string' },
    { key: 'workshop_type', value: '前段车间', type: 'string' },
    { key: 'area', value: 25000, unit: '㎡', type: 'number' },
    { key: 'cleanliness', value: '十万级', type: 'string' },
    { key: 'line_count', value: 8, unit: '条', type: 'number' },
  ], { parent_id: 'factory_a', base_id: 'base_cz' }),

  createEntity('workshop_middle', '中段车间', 'org', '组织资源域', 'layers', '电芯组装车间', [
    { key: 'workshop_code', value: 'WS-MID-01', type: 'string' },
    { key: 'workshop_type', value: '中段车间', type: 'string' },
    { key: 'area', value: 35000, unit: '㎡', type: 'number' },
    { key: 'cleanliness', value: '万级', type: 'string' },
    { key: 'line_count', value: 8, unit: '条', type: 'number' },
  ], { parent_id: 'factory_b', base_id: 'base_cz' }),

  createEntity('workshop_back', '后段车间', 'org', '组织资源域', 'layers', '化成PACK车间', [
    { key: 'workshop_code', value: 'WS-BACK-01', type: 'string' },
    { key: 'workshop_type', value: '后段车间', type: 'string' },
    { key: 'area', value: 20000, unit: '㎡', type: 'number' },
    { key: 'line_count', value: 8, unit: '条', type: 'number' },
  ], { parent_id: 'factory_c', base_id: 'base_cz' }),

  createEntity('employee', '员工', 'org', '组织资源域', 'activity', '企业员工', [
    { key: 'employee_code', value: 'EMP001', type: 'string' },
    { key: 'name', value: '张三', type: 'string' },
    { key: 'department', value: '前段车间', type: 'string' },
    { key: 'skill_level', value: '高级', type: 'string' },
  ]),

  createEntity('work_team', '生产班组', 'org', '组织资源域', 'activity', '生产作业班组', [
    { key: 'team_code', value: 'TEAM-A01', type: 'string' },
    { key: 'team_name', value: '前段一班组', type: 'string' },
    { key: 'member_count', value: 12, unit: '人', type: 'number' },
    { key: 'shift', value: '白班', type: 'string' },
  ]),

  createEntity('shift', '班次', 'org', '组织资源域', 'activity', '生产班次定义', [
    { key: 'shift_code', value: 'DAY', type: 'string' },
    { key: 'shift_name', value: '白班', type: 'string' },
    { key: 'start_time', value: '08:00', type: 'string' },
    { key: 'end_time', value: '20:00', type: 'string' },
    { key: 'effective_hours', value: 11, unit: '小时', type: 'number' },
  ]),
];

// ===== 2. 产能设备域 (Capacity) =====
const capEntities: OntologyEntity[] = [
  createEntity('production_line', '生产线', 'cap', '产能设备域', 'cpu', '制造产线', [
    { key: 'line_code', value: 'L-A01-001', type: 'string' },
    { key: 'line_type', value: '涂布线', type: 'string' },
    { key: 'status', value: '运行中', type: 'string' },
    { key: 'max_capacity', value: 102, unit: 'k片/天', type: 'number' },
    { key: 'rated_speed', value: 60, unit: 'm/min', type: 'number' },
    { key: 'oee_target', value: 85, unit: '%', type: 'number' },
    { key: 'current_oee', value: 82, unit: '%', type: 'number' },
  ], { parent_id: 'workshop_front' }),

  createEntity('workstation', '工位', 'cap', '产能设备域', 'activity', '具体作业工位', [
    { key: 'station_code', value: 'WS-001', type: 'string' },
    { key: 'station_name', value: '涂布工位', type: 'string' },
    { key: 'cycle_time', value: 45, unit: '秒', type: 'number' },
    { key: 'automation_level', value: '全自动', type: 'string' },
    { key: 'operator_count', value: 2, unit: '人', type: 'number' },
  ], { parent_id: 'production_line' }),

  createEntity('equipment', '关键设备', 'cap', '产能设备域', 'cpu', '生产设备', [
    { key: 'equipment_code', value: 'EQ-TB-001', type: 'string' },
    { key: 'equipment_name', value: '涂布机-001', type: 'string' },
    { key: 'equipment_type', value: '涂布机', type: 'string' },
    { key: 'manufacturer', value: '先导智能', type: 'string' },
    { key: 'max_speed', value: 80, unit: 'm/min', type: 'number' },
    { key: 'availability', value: 95, unit: '%', type: 'number' },
    { key: 'mtbf', value: 720, unit: '小时', type: 'number' },
  ], { parent_id: 'workstation' }),

  createEntity('mold', '模具', 'cap', '产能设备域', 'box', '生产模具', [
    { key: 'mold_code', value: 'MOLD-001', type: 'string' },
    { key: 'mold_type', value: '极片模', type: 'string' },
    { key: 'max_shots', value: 1000000, unit: '次', type: 'number' },
    { key: 'current_shots', value: 500000, unit: '次', type: 'number' },
    { key: 'status', value: '在用', type: 'string' },
  ]),
];

// ===== 3. 产品工艺域 (Product) =====
const prodEntities: OntologyEntity[] = [
  createEntity('product_family', '产品系列', 'prod', '产品工艺域', 'layers', '产品族', [
    { key: 'family_code', value: 'LFP-ESS', type: 'string' },
    { key: 'family_name', value: '磷酸铁锂储能系列', type: 'string' },
    { key: 'application', value: '储能', type: 'string' },
    { key: 'cell_type', value: '方形铝壳', type: 'string' },
  ]),

  createEntity('product_model_lfp', 'LFP-280Ah', 'prod', '产品工艺域', 'battery', '储能电芯型号', [
    { key: 'model_code', value: 'LFP-280Ah', type: 'string' },
    { key: 'nominal_capacity', value: 280, unit: 'Ah', type: 'number' },
    { key: 'nominal_voltage', value: 3.2, unit: 'V', type: 'number' },
    { key: 'energy_density', value: 170, unit: 'Wh/kg', type: 'number' },
    { key: 'cycle_life', value: 8000, unit: '次', type: 'number' },
    { key: 'production_lead_time', value: 14, unit: '天', type: 'number' },
  ], { metadata: { application: '储能系统', certifications: 'UN38.3,IEC62619' } }),

  createEntity('product_model_ncm', 'NCM-150Ah', 'prod', '产品工艺域', 'battery', '动力电芯型号', [
    { key: 'model_code', value: 'NCM-150Ah', type: 'string' },
    { key: 'nominal_capacity', value: 150, unit: 'Ah', type: 'number' },
    { key: 'nominal_voltage', value: 3.7, unit: 'V', type: 'number' },
    { key: 'energy_density', value: 250, unit: 'Wh/kg', type: 'number' },
    { key: 'cycle_life', value: 2000, unit: '次', type: 'number' },
    { key: 'production_lead_time', value: 12, unit: '天', type: 'number' },
  ], { metadata: { application: '电动汽车', certifications: 'UN38.3,GB38031' } }),

  createEntity('process_route', '工艺路线', 'prod', '产品工艺域', 'git-branch', '制造工艺路线', [
    { key: 'route_code', value: 'ROUTE-LFP-001', type: 'string' },
    { key: 'version', value: 'V3.2', type: 'string' },
    { key: 'process_count', value: 15, unit: '道', type: 'number' },
    { key: 'total_ct', value: 480, unit: '秒', type: 'number' },
    { key: 'yield_target', value: 98.5, unit: '%', type: 'number' },
  ]),

  createEntity('process_step', '工序', 'prod', '产品工艺域', 'activity', '工艺工序', [
    { key: 'step_code', value: 'STEP-001', type: 'string' },
    { key: 'step_name', value: '正极搅拌', type: 'string' },
    { key: 'sequence', value: 1, unit: '序', type: 'number' },
    { key: 'standard_time', value: 240, unit: '分钟', type: 'number' },
    { key: 'is_quality_gate', value: true, type: 'boolean' },
  ]),

  createEntity('bom', '物料清单', 'prod', '产品工艺域', 'box', '产品BOM', [
    { key: 'bom_code', value: 'BOM-LFP-280', type: 'string' },
    { key: 'version', value: 'V2.1', type: 'string' },
    { key: 'component_count', value: 28, unit: '种', type: 'number' },
    { key: 'material_cost', value: 680, unit: '元/只', type: 'number' },
  ]),
];

// ===== 4. 供应链域 (Supply) =====
const supplyEntities: OntologyEntity[] = [
  createEntity('supplier', '供应商', 'supply', '供应链域', 'truck', '物料供应商', [
    { key: 'supplier_code', value: 'SUP-001', type: 'string' },
    { key: 'supplier_name', value: '材料科技集团', type: 'string' },
    { key: 'supplier_type', value: '战略', type: 'string' },
    { key: 'supply_category', value: '正极材料', type: 'string' },
    { key: 'monthly_capacity', value: 5000, unit: '吨', type: 'number' },
    { key: 'lead_time', value: 15, unit: '天', type: 'number' },
    { key: 'quality_rating', value: 'A', type: 'string' },
  ]),

  createEntity('material_category', '物料分类', 'supply', '供应链域', 'layers', '物料分类', [
    { key: 'category_code', value: 'CAT-01', type: 'string' },
    { key: 'category_name', value: '正极材料', type: 'string' },
    { key: 'category_level', value: 1, unit: '级', type: 'number' },
  ]),

  createEntity('material', '物料', 'supply', '供应链域', 'box', '物料主数据', [
    { key: 'material_code', value: 'RM-CATH-001', type: 'string' },
    { key: 'material_name', value: '磷酸铁锂正极材料', type: 'string' },
    { key: 'specification', value: 'LFP-STD', type: 'string' },
    { key: 'unit', value: '吨', type: 'string' },
    { key: 'safety_stock', value: 500, unit: '吨', type: 'number' },
    { key: 'shelf_life', value: 365, unit: '天', type: 'number' },
  ]),

  createEntity('warehouse', '仓库', 'supply', '供应链域', 'box', '仓储设施', [
    { key: 'warehouse_code', value: 'WH-001', type: 'string' },
    { key: 'warehouse_name', value: '原材料仓A', type: 'string' },
    { key: 'warehouse_type', value: '原材料仓', type: 'string' },
    { key: 'capacity', value: 10000, unit: '托', type: 'number' },
    { key: 'utilization', value: 75, unit: '%', type: 'number' },
    { key: 'temperature_zone', value: '常温', type: 'string' },
  ], { parent_id: 'base_cz', base_id: 'base_cz' }),

  createEntity('location', '库位', 'supply', '供应链域', 'activity', '仓库库位', [
    { key: 'location_code', value: 'LOC-A-01-01', type: 'string' },
    { key: 'zone', value: 'A区', type: 'string' },
    { key: 'aisle', value: '01', type: 'string' },
    { key: 'shelf', value: '01', type: 'string' },
    { key: 'layer', value: '01', type: 'string' },
    { key: 'location_type', value: '存储', type: 'string' },
  ], { parent_id: 'warehouse', base_id: 'base_cz' }),

  createEntity('inventory', '库存', 'supply', '供应链域', 'database', '库存记录', [
    { key: 'inventory_id', value: 'INV-001', type: 'string' },
    { key: 'batch_no', value: 'LOT-20240320', type: 'string' },
    { key: 'quantity', value: 800, unit: '吨', type: 'number' },
    { key: 'status', value: '合格', type: 'string' },
    { key: 'receipt_date', value: '2024-03-20', type: 'string' },
  ], { parent_id: 'location' }),

  createEntity('purchase_order', '采购订单', 'supply', '供应链域', 'file-code', '采购订单', [
    { key: 'po_no', value: 'PO-2024-001', type: 'string' },
    { key: 'order_date', value: '2024-03-01', type: 'string' },
    { key: 'delivery_date', value: '2024-03-20', type: 'string' },
    { key: 'total_amount', value: 5000000, unit: '元', type: 'number' },
    { key: 'status', value: '已收货', type: 'string' },
  ]),
];

// ===== 5. 生产执行域 (Mfg) =====
const mfgEntities: OntologyEntity[] = [
  createEntity('production_plan', '生产计划', 'mfg', '生产执行域', 'file-code', '主生产计划MPS', [
    { key: 'plan_no', value: 'MPS-2024-04', type: 'string' },
    { key: 'plan_period', value: '2024年4月', type: 'string' },
    { key: 'planned_quantity', value: 150000, unit: '只', type: 'number' },
    { key: 'capacity_allocation', value: 85, unit: '%', type: 'number' },
  ]),

  createEntity('work_order', '生产工单', 'mfg', '生产执行域', 'file-code', '生产执行工单', [
    { key: 'wo_no', value: 'WO-2024-0001', type: 'string' },
    { key: 'planned_quantity', value: 52000, unit: '只', type: 'number' },
    { key: 'actual_quantity', value: 48000, unit: '只', type: 'number' },
    { key: 'planned_start', value: '2024-04-01', type: 'string' },
    { key: 'planned_end', value: '2024-04-30', type: 'string' },
    { key: 'status', value: '生产中', type: 'string' },
  ]),

  createEntity('wip', '在制品', 'mfg', '生产执行域', 'activity', '在制品跟踪', [
    { key: 'wip_id', value: 'WIP-001', type: 'string' },
    { key: 'quantity', value: 1000, unit: '只', type: 'number' },
    { key: 'wip_status', value: '加工中', type: 'string' },
    { key: 'enter_time', value: '2024-04-01T08:00:00Z', type: 'string' },
  ]),

  createEntity('production_record', '生产记录', 'mfg', '生产执行域', 'check-circle', '生产报工记录', [
    { key: 'record_id', value: 'REC-001', type: 'string' },
    { key: 'good_quantity', value: 950, unit: '只', type: 'number' },
    { key: 'defect_quantity', value: 50, unit: '只', type: 'number' },
    { key: 'record_time', value: '2024-04-01T16:00:00Z', type: 'string' },
  ]),

  createEntity('capacity_requirement', '产能需求', 'mfg', '生产执行域', 'activity', 'CRP产能需求', [
    { key: 'crp_no', value: 'CRP-2024-04-001', type: 'string' },
    { key: 'required_capacity', value: 720, unit: '小时', type: 'number' },
    { key: 'available_capacity', value: 800, unit: '小时', type: 'number' },
    { key: 'load_rate', value: 90, unit: '%', type: 'number' },
  ]),
];

// ===== 6. 质量管理域 (Quality) =====
const qualityEntities: OntologyEntity[] = [
  createEntity('quality_standard', '质量标准', 'quality', '质量管理域', 'shield', '产品质量标准', [
    { key: 'standard_code', value: 'QS-LFP-001', type: 'string' },
    { key: 'standard_name', value: '储能电芯质量标准V3.0', type: 'string' },
    { key: 'check_item_count', value: 56, unit: '项', type: 'number' },
    { key: 'aql_level', value: 0.4, unit: '%', type: 'number' },
    { key: 'cpk_target', value: 1.67, type: 'number' },
  ]),

  createEntity('check_item', '检查项', 'quality', '质量管理域', 'check-circle', '质量检查项', [
    { key: 'item_code', value: 'CI-001', type: 'string' },
    { key: 'item_name', value: '容量测试', type: 'string' },
    { key: 'check_type', value: '计量', type: 'string' },
    { key: 'standard_value', value: 280, type: 'number' },
    { key: 'upper_limit', value: 285, type: 'number' },
    { key: 'lower_limit', value: 275, type: 'number' },
    { key: 'unit', value: 'Ah', type: 'string' },
  ]),

  createEntity('iqc_record', '来料检验', 'quality', '质量管理域', 'check-circle', '来料检验记录', [
    { key: 'iqc_no', value: 'IQC-2024-001', type: 'string' },
    { key: 'batch_no', value: 'LOT-20240320', type: 'string' },
    { key: 'sample_size', value: 32, unit: '件', type: 'number' },
    { key: 'accept_count', value: 32, unit: '件', type: 'number' },
    { key: 'result', value: '合格', type: 'string' },
  ]),

  createEntity('ipqc_record', '过程检验', 'quality', '质量管理域', 'check-circle', '过程检验记录', [
    { key: 'ipqc_no', value: 'IPQC-2024-001', type: 'string' },
    { key: 'check_value', value: 278.5, type: 'number' },
    { key: 'result', value: '合格', type: 'string' },
  ]),

  createEntity('defect', '缺陷记录', 'quality', '质量管理域', 'alert-triangle', '质量缺陷', [
    { key: 'defect_id', value: 'DEF-001', type: 'string' },
    { key: 'defect_type', value: '外观不良', type: 'string' },
    { key: 'severity', value: '轻微', type: 'string' },
    { key: 'quantity', value: 50, unit: '只', type: 'number' },
    { key: 'disposition', value: '返工', type: 'string' },
  ]),
];

// ===== 7. 销售客户域 (Sales) =====
const salesEntities: OntologyEntity[] = [
  createEntity('customer', '客户', 'sales', '销售客户域', 'activity', '客户主数据', [
    { key: 'customer_code', value: 'CUST-001', type: 'string' },
    { key: 'customer_name', value: '储能科技A公司', type: 'string' },
    { key: 'customer_type', value: '战略', type: 'string' },
    { key: 'industry', value: '储能', type: 'string' },
    { key: 'credit_limit', value: 100000000, unit: '元', type: 'number' },
  ]),

  createEntity('sales_order', '销售订单', 'sales', '销售客户域', 'file-code', '客户订单', [
    { key: 'so_no', value: 'SO-2024-0001', type: 'string' },
    { key: 'order_date', value: '2024-03-01', type: 'string' },
    { key: 'delivery_date', value: '2024-05-15', type: 'string' },
    { key: 'total_amount', value: 45000000, unit: '元', type: 'number' },
    { key: 'priority', value: '高', type: 'string' },
    { key: 'status', value: '生产中', type: 'string' },
  ]),

  createEntity('delivery', '发货单', 'sales', '销售客户域', 'truck', '销售发货', [
    { key: 'delivery_no', value: 'DN-2024-001', type: 'string' },
    { key: 'delivery_date', value: '2024-05-10', type: 'string' },
    { key: 'carrier', value: '顺丰物流', type: 'string' },
    { key: 'tracking_no', value: 'SF123456789', type: 'string' },
    { key: 'status', value: '已发货', type: 'string' },
  ]),
];

// ===== 8. 项目管理域 (Project) =====
const projectEntities: OntologyEntity[] = [
  createEntity('rd_project', '研发项目', 'project', '项目管理域', 'activity', '产品研发项目', [
    { key: 'project_code', value: 'RD-2024-001', type: 'string' },
    { key: 'project_name', value: '新一代储能电芯研发', type: 'string' },
    { key: 'project_type', value: '新产品', type: 'string' },
    { key: 'start_date', value: '2024-01-01', type: 'string' },
    { key: 'end_date', value: '2024-12-31', type: 'string' },
    { key: 'budget', value: 50000000, unit: '元', type: 'number' },
    { key: 'status', value: '进行中', type: 'string' },
  ]),

  createEntity('trial_production', '试产记录', 'project', '项目管理域', 'activity', '新产品试产', [
    { key: 'trial_no', value: 'TR-2024-001', type: 'string' },
    { key: 'trial_phase', value: '中试', type: 'string' },
    { key: 'trial_date', value: '2024-06-01', type: 'string' },
    { key: 'trial_quantity', value: 1000, unit: '只', type: 'number' },
    { key: 'yield_rate', value: 92, unit: '%', type: 'number' },
    { key: 'result', value: '通过', type: 'string' },
  ]),
];

// ===== 9. 成本财务域 (Cost) =====
const costEntities: OntologyEntity[] = [
  createEntity('cost_center', '成本中心', 'cost', '成本财务域', 'activity', '成本中心', [
    { key: 'cc_code', value: 'CC-001', type: 'string' },
    { key: 'cc_name', value: '前段车间成本中心', type: 'string' },
    { key: 'cc_type', value: '生产', type: 'string' },
    { key: 'budget', value: 100000000, unit: '元', type: 'number' },
  ]),

  createEntity('product_cost', '产品成本', 'cost', '成本财务域', 'activity', '产品成本核算', [
    { key: 'cost_id', value: 'COST-001', type: 'string' },
    { key: 'cost_period', value: '2024年4月', type: 'string' },
    { key: 'material_cost', value: 680, unit: '元/只', type: 'number' },
    { key: 'labor_cost', value: 50, unit: '元/只', type: 'number' },
    { key: 'overhead_cost', value: 120, unit: '元/只', type: 'number' },
    { key: 'total_cost', value: 850, unit: '元/只', type: 'number' },
  ]),
];

// 合并所有域
const allEntities: OntologyEntity[] = [
  ...orgEntities,
  ...capEntities,
  ...prodEntities,
  ...supplyEntities,
  ...mfgEntities,
  ...qualityEntities,
  ...salesEntities,
  ...projectEntities,
  ...costEntities,
];

// 构建域结构
const initialDomains: OntologyDomain[] = [
  { id: 'dom-org', name: 'Organization', displayName: '组织资源域', icon: 'building', description: '企业组织架构、人员、班组、技能', entities: orgEntities },
  { id: 'dom-cap', name: 'Capacity', displayName: '产能设备域', icon: 'cpu', description: '产线、工位、设备、模具', entities: capEntities },
  { id: 'dom-prod', name: 'Product', displayName: '产品工艺域', icon: 'battery', description: '产品型号、BOM、工艺路线、工序', entities: prodEntities },
  { id: 'dom-supply', name: 'SupplyChain', displayName: '供应链域', icon: 'truck', description: '供应商、物料、仓库、库位、库存', entities: supplyEntities },
  { id: 'dom-mfg', name: 'Manufacturing', displayName: '生产执行域', icon: 'activity', description: '生产计划、工单、在制品', entities: mfgEntities },
  { id: 'dom-quality', name: 'Quality', displayName: '质量管理域', icon: 'shield', description: '质量标准、检验记录、缺陷', entities: qualityEntities },
  { id: 'dom-sales', name: 'Sales', displayName: '销售客户域', icon: 'file-code', description: '客户、销售订单、发货', entities: salesEntities },
  { id: 'dom-project', name: 'Project', displayName: '项目管理域', icon: 'git-branch', description: '研发项目、试产、技改', entities: projectEntities },
  { id: 'dom-cost', name: 'Cost', displayName: '成本财务域', icon: 'database', description: '成本中心、成本核算', entities: costEntities },
];

// ============================================================================
// Palantir本体论 - 完整关系类型系统
//
// 关系类型分类：
// - structural: 结构关系（包含、组成、分类）
// - flow: 流程关系（转化、消耗、产生、流动）
// - control: 控制关系（管控、分配、执行、操作）
// - temporal: 时间关系（先于、后于、并发）
// - causal: 因果关系（导致、源于、影响）
// - reference: 引用关系（参考、映射、关联）
// ============================================================================

const initialLinks: OntologyLink[] = [
  // ==================== 组织层级关系 (structural) ====================
  { id: 'l001', source: 'company', target: 'base_cz', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '公司包含基地', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '组织'] },
  { id: 'l002', source: 'base_cz', target: 'factory_a', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '基地包含工厂', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '组织'] },
  { id: 'l003', source: 'base_cz', target: 'factory_b', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '基地包含工厂', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '组织'] },
  { id: 'l004', source: 'base_cz', target: 'factory_c', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '基地包含工厂', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '组织'] },
  { id: 'l005', source: 'base_cz', target: 'warehouse', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '基地包含仓库', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '设施'] },
  { id: 'l006', source: 'factory_a', target: 'workshop_front', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '工厂包含车间', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '设施'] },
  { id: 'l007', source: 'factory_b', target: 'workshop_middle', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '工厂包含车间', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '设施'] },
  { id: 'l008', source: 'factory_c', target: 'workshop_back', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '工厂包含车间', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '设施'] },
  { id: 'l009', source: 'work_team', target: 'employee', relation: 'includes', relationType: 'structural', cardinality: '1:N', description: '班组包含员工', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['成员', '组织'] },

  // ==================== 资源分配关系 (control) ====================
  { id: 'l010', source: 'workshop_front', target: 'work_team', relation: 'assigns', relationType: 'control', cardinality: '1:N', description: '车间分配班组', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['调度', '人力'] },
  { id: 'l011', source: 'shift', target: 'work_team', relation: 'scheduled_as', relationType: 'temporal', cardinality: '1:N', description: '班次排程班组', properties: { strength: 'conditional', direction: 'directed', temporality: 'transient' }, semantics: ['排程', '时间'] },

  // ==================== 产能资源关系 (structural + control) ====================
  { id: 'l101', source: 'workshop_front', target: 'production_line', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '车间包含产线', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '产能'] },
  { id: 'l102', source: 'production_line', target: 'workstation', relation: 'composed_of', relationType: 'structural', cardinality: '1:N', description: '产线由工位组成', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['组成', '产能'] },
  { id: 'l103', source: 'workstation', target: 'equipment', relation: 'equipped_with', relationType: 'structural', cardinality: '1:N', description: '工位配备设备', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['配备', '资源'] },
  { id: 'l104', source: 'equipment', target: 'mold', relation: 'requires', relationType: 'control', cardinality: '1:N', description: '设备需要模具', properties: { strength: 'conditional', direction: 'directed', temporality: 'transient' }, semantics: ['依赖', '资源'] },
  { id: 'l105', source: 'work_team', target: 'production_line', relation: 'operates', relationType: 'control', cardinality: 'N:N', description: '班组操作产线', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['操作', '执行'] },
  { id: 'l106', source: 'employee', target: 'skill', relation: 'possesses', relationType: 'structural', cardinality: 'N:N', description: '员工拥有技能', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['能力', '资质'] },
  { id: 'l107', source: 'workstation', target: 'skill', relation: 'requires', relationType: 'control', cardinality: 'N:N', description: '工位需要技能', properties: { strength: 'conditional', direction: 'directed', temporality: 'persistent' }, semantics: ['能力', '要求'] },

  // ==================== 产品工艺关系 (structural + flow) ====================
  { id: 'l201', source: 'product_family', target: 'product_model_lfp', relation: 'classifies', relationType: 'structural', cardinality: '1:N', description: '系列分类型号', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['分类', '产品'] },
  { id: 'l202', source: 'product_family', target: 'product_model_ncm', relation: 'classifies', relationType: 'structural', cardinality: '1:N', description: '系列分类型号', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['分类', '产品'] },
  { id: 'l203', source: 'product_model_lfp', target: 'process_route', relation: 'defined_by', relationType: 'reference', cardinality: '1:1', description: '型号由工艺路线定义', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['定义', '工艺'] },
  { id: 'l204', source: 'product_model_lfp', target: 'bom', relation: 'structured_by', relationType: 'structural', cardinality: '1:1', description: '型号由BOM结构化', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['结构', '物料'] },
  { id: 'l205', source: 'process_route', target: 'process_step', relation: 'sequenced_as', relationType: 'temporal', cardinality: '1:N', description: '工艺路线排序为工序', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['序列', '工艺'] },
  { id: 'l206', source: 'process_step', target: 'workstation', relation: 'executed_at', relationType: 'control', cardinality: 'N:1', description: '工序执行于工位', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['执行', '位置'] },
  { id: 'l207', source: 'process_step', target: 'process_step', relation: 'precedes', relationType: 'temporal', cardinality: '1:1', description: '工序先后顺序', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['先后', '流程'] },
  { id: 'l208', source: 'product_model_lfp', target: 'quality_standard', relation: 'governed_by', relationType: 'control', cardinality: '1:N', description: '型号受质量标准管控', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['管控', '质量'] },
  { id: 'l209', source: 'bom', target: 'material', relation: 'comprises', relationType: 'structural', cardinality: '1:N', description: 'BOM由物料组成', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['组成', '物料'] },

  // ==================== 供应链关系 (structural + flow) ====================
  { id: 'l301', source: 'supplier', target: 'material', relation: 'supplies', relationType: 'flow', cardinality: '1:N', description: '供应商供货', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['供应', '物流'] },
  { id: 'l302', source: 'material_category', target: 'material', relation: 'categorizes', relationType: 'structural', cardinality: '1:N', description: '分类归类物料', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['分类', '物料'] },
  { id: 'l303', source: 'material', target: 'inventory', relation: 'stored_as', relationType: 'structural', cardinality: '1:N', description: '物料存储为库存', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['存储', '库存'] },
  { id: 'l304', source: 'warehouse', target: 'location', relation: 'contains', relationType: 'structural', cardinality: '1:N', description: '仓库包含库位', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['层级', '存储'] },
  { id: 'l305', source: 'location', target: 'inventory', relation: 'holds', relationType: 'structural', cardinality: '1:N', description: '库位存放库存', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['存放', '库存'] },
  { id: 'l306', source: 'purchase_order', target: 'material', relation: 'requests', relationType: 'flow', cardinality: 'N:N', description: '订单采购物料', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['请求', '采购'] },
  { id: 'l307', source: 'purchase_order', target: 'supplier', relation: 'placed_to', relationType: 'control', cardinality: 'N:1', description: '订单下达给供应商', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['下达', '采购'] },
  { id: 'l308', source: 'inventory', target: 'work_order', relation: 'issued_to', relationType: 'flow', cardinality: 'N:N', description: '库存发放给工单', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['发放', '物料'] },

  // ==================== 生产执行关系 (flow + temporal + causal) ====================
  // 需求驱动关系
  { id: 'l401', source: 'customer', target: 'sales_order', relation: 'generates', relationType: 'causal', cardinality: '1:N', description: '客户产生需求', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['需求', '源头'] },
  { id: 'l402', source: 'sales_order', target: 'production_plan', relation: 'drives', relationType: 'causal', cardinality: '1:N', description: '订单驱生计划', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['驱动', '计划'] },
  { id: 'l403', source: 'production_plan', target: 'work_order', relation: 'decomposes_into', relationType: 'structural', cardinality: '1:N', description: '计划分解为工单', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['分解', '计划'] },
  { id: 'l404', source: 'production_plan', target: 'capacity_requirement', relation: 'generates', relationType: 'causal', cardinality: '1:N', description: '计划产生产能需求', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['需求', '产能'] },
  { id: 'l405', source: 'capacity_requirement', target: 'workshop_front', relation: 'allocated_to', relationType: 'control', cardinality: 'N:1', description: '产能需求分配给车间', properties: { strength: 'conditional', direction: 'directed', temporality: 'transient' }, semantics: ['分配', '产能'] },

  // 工单执行关系
  { id: 'l406', source: 'work_order', target: 'production_line', relation: 'routed_to', relationType: 'control', cardinality: 'N:1', description: '工单路由到产线', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['路由', '排产'] },
  { id: 'l407', source: 'work_order', target: 'wip', relation: 'creates', relationType: 'causal', cardinality: '1:N', description: '工单创建在制品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['创建', '在制'] },
  { id: 'l408', source: 'wip', target: 'material', relation: 'consumes', relationType: 'flow', cardinality: 'N:N', description: '在制品消耗物料', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['消耗', '物料'] },
  { id: 'l409', source: 'wip', target: 'process_step', relation: 'progresses_through', relationType: 'temporal', cardinality: 'N:1', description: '在制品流转工序', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['流转', '工艺'] },
  { id: 'l410', source: 'wip', target: 'workstation', relation: 'located_at', relationType: 'reference', cardinality: 'N:1', description: '在制品位于工位', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['位置', '追踪'] },
  { id: 'l411', source: 'wip', target: 'semi_finished', relation: 'transforms_into', relationType: 'flow', cardinality: '1:1', description: '在制品转化为半成品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['转化', '形态'] },
  { id: 'l412', source: 'semi_finished', target: 'finished_goods', relation: 'assembles_into', relationType: 'flow', cardinality: 'N:1', description: '半成品组装为成品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['组装', '成品'] },
  { id: 'l413', source: 'production_record', target: 'wip', relation: 'documents', relationType: 'reference', cardinality: 'N:1', description: '生产记录文档化在制品', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['记录', '追溯'] },
  { id: 'l414', source: 'production_record', target: 'work_order', relation: 'fulfills', relationType: 'flow', cardinality: 'N:1', description: '生产记录履行工单', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['履行', '报工'] },

  // ==================== 质量关系 (control + causal) ====================
  { id: 'l501', source: 'quality_standard', target: 'check_item', relation: 'specifies', relationType: 'control', cardinality: '1:N', description: '标准指定检查项', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['规范', '标准'] },
  { id: 'l502', source: 'iqc_record', target: 'material', relation: 'evaluates', relationType: 'control', cardinality: 'N:1', description: '来料检验物料', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['评估', '来料'] },
  { id: 'l503', source: 'iqc_record', target: 'inventory', relation: 'determines_status', relationType: 'control', cardinality: '1:1', description: '检验决定库存状态', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['判定', '状态'] },
  { id: 'l504', source: 'ipqc_record', target: 'wip', relation: 'monitors', relationType: 'control', cardinality: 'N:1', description: '过程检验监控在制品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['监控', '过程'] },
  { id: 'l505', source: 'oqc_record', target: 'finished_goods', relation: 'certifies', relationType: 'control', cardinality: '1:1', description: '出货检验认证成品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['认证', '出货'] },
  { id: 'l506', source: 'defect', target: 'wip', relation: 'originates_from', relationType: 'causal', cardinality: 'N:1', description: '缺陷源于在制品', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['来源', '缺陷'] },
  { id: 'l507', source: 'defect', target: 'process_step', relation: 'discovered_at', relationType: 'reference', cardinality: 'N:1', description: '缺陷发现于工序', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['发现', '位置'] },
  { id: 'l508', source: 'defect', target: 'equipment', relation: 'caused_by', relationType: 'causal', cardinality: 'N:1', description: '缺陷由设备导致', properties: { strength: 'conditional', direction: 'directed', temporality: 'persistent' }, semantics: ['原因', '设备'] },
  { id: 'l509', source: 'quality_alert', target: 'defect', relation: 'triggered_by', relationType: 'causal', cardinality: '1:N', description: '预警由缺陷触发', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['触发', '预警'] },
  { id: 'l510', source: 'corrective_action', target: 'defect', relation: 'addresses', relationType: 'control', cardinality: '1:1', description: '纠正措施处理缺陷', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['处理', '纠正'] },

  // ==================== 销售关系 (flow + causal) ====================
  { id: 'l601', source: 'customer', target: 'sales_order', relation: 'places', relationType: 'flow', cardinality: '1:N', description: '客户下订单', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['下单', '销售'] },
  { id: 'l602', source: 'sales_order', target: 'product_model_lfp', relation: 'requests', relationType: 'flow', cardinality: 'N:1', description: '订单请求型号', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['请求', '产品'] },
  { id: 'l603', source: 'sales_order', target: 'delivery', relation: 'fulfilled_by', relationType: 'flow', cardinality: '1:N', description: '订单由发货单履行', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['履行', '物流'] },
  { id: 'l604', source: 'delivery', target: 'finished_goods', relation: 'ships', relationType: 'flow', cardinality: '1:N', description: '发货单发运成品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['发运', '物流'] },
  { id: 'l605', source: 'customer', target: 'customer_complaint', relation: 'files', relationType: 'causal', cardinality: '1:N', description: '客户提交投诉', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['投诉', '服务'] },

  // ==================== 项目关系 (temporal + control) ====================
  { id: 'l701', source: 'rd_project', target: 'product_model_lfp', relation: 'develops', relationType: 'control', cardinality: '1:1', description: '项目开发产品', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['开发', '研发'] },
  { id: 'l702', source: 'rd_project', target: 'trial_production', relation: 'includes', relationType: 'structural', cardinality: '1:N', description: '项目包含试产', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['包含', '试产'] },
  { id: 'l703', source: 'trial_production', target: 'work_order', relation: 'consumes', relationType: 'flow', cardinality: '1:N', description: '试产使用工单', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['使用', '试产'] },
  { id: 'l704', source: 'trial_production', target: 'ipqc_record', relation: 'generates', relationType: 'causal', cardinality: '1:N', description: '试产产生检验记录', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['产生', '验证'] },
  { id: 'l705', source: 'process_step', target: 'trial_production', relation: 'validated_by', relationType: 'control', cardinality: 'N:N', description: '工序由试产验证', properties: { strength: 'conditional', direction: 'directed', temporality: 'transient' }, semantics: ['验证', '工艺'] },

  // ==================== 成本关系 (flow + reference) ====================
  { id: 'l801', source: 'cost_center', target: 'workshop_front', relation: 'maps_to', relationType: 'reference', cardinality: '1:1', description: '成本中心映射到车间', properties: { strength: 'strong', direction: 'bidirectional', temporality: 'persistent' }, semantics: ['映射', '成本'] },
  { id: 'l802', source: 'product_cost', target: 'product_model_lfp', relation: 'calculated_for', relationType: 'reference', cardinality: 'N:1', description: '成本为型号计算', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['计算', '成本'] },
  { id: 'l803', source: 'work_order', target: 'product_cost', relation: 'accumulates_to', relationType: 'flow', cardinality: 'N:1', description: '工单归集成本', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['归集', '成本'] },
  { id: 'l804', source: 'material', target: 'product_cost', relation: 'contributes_to', relationType: 'flow', cardinality: 'N:N', description: '物料贡献成本', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['贡献', '材料成本'] },
  { id: 'l805', source: 'equipment', target: 'product_cost', relation: 'depreciates_to', relationType: 'flow', cardinality: 'N:N', description: '设备折旧计入成本', properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }, semantics: ['折旧', '制费'] },
  { id: 'l806', source: 'employee', target: 'product_cost', relation: 'labor_allocated_to', relationType: 'flow', cardinality: 'N:N', description: '人工成本分摊', properties: { strength: 'strong', direction: 'directed', temporality: 'transient' }, semantics: ['人工', '成本'] },
];

// ============================================================================
// 约束规则定义
// ============================================================================

const initialConstraints: Constraint[] = [
  { id: 'c001', entityId: 'factory_a', libraryItemId: 'lib-capacity-utilization', type: 'capacity_limit', category: 'capacity', expression: 'utilization_rate <= 95', description: '工厂产能利用率不得超过95%' },
  { id: 'c002', entityId: 'production_line', libraryItemId: 'lib-oee-target', type: 'oee_target', category: 'efficiency', expression: 'current_oee >= 80', description: '产线OEE不得低于80%' },
  { id: 'c003', entityId: 'equipment', libraryItemId: 'lib-equipment-availability', type: 'availability', category: 'maintenance', expression: 'availability >= 90', description: '设备可用率不得低于90%' },
  { id: 'c004', entityId: 'work_order', libraryItemId: '', type: 'lead_time', category: 'delivery', expression: 'planned_end - planned_start <= 14', description: '工单周期不得超过14天' },
  { id: 'c005', entityId: 'capacity_requirement', libraryItemId: 'lib-capacity-utilization', type: 'load_balance', category: 'capacity', expression: 'load_rate <= 95', description: '产能负荷率不得超过95%' },
  { id: 'c006', entityId: 'process_route', libraryItemId: 'lib-quality-yield', type: 'yield_target', category: 'quality', expression: 'yield_target >= 98', description: '工艺良率目标不得低于98%' },
  { id: 'c007', entityId: 'inventory', libraryItemId: 'lib-inventory-turnover', type: 'safety_stock', category: 'inventory', expression: 'quantity >= safety_stock', description: '库存不得低于安全库存' },
  { id: 'c008', entityId: 'iqc_record', libraryItemId: 'lib-quality-yield', type: 'inspection', category: 'quality', expression: 'result == "合格" OR result == "特采"', description: '来料检验必须通过' },
];

// ============================================================================
// 节点卡片组件
// ============================================================================

const OntologyNodeCard: React.FC<{ data: OntologyEntity }> = ({ data }) => {
  return (
    <div className="ontology-node-palantir">
      <Handle type="target" position={Position.Left} style={{ left: -5, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, background: '#3b82f6', border: '1.5px solid #ffffff' }} />
      <div className="ontology-node-header-palantir">
        <div className={`status-indicator ${data.status}`} />
        {data.icon === 'battery' && <Battery size={12} />}
        {data.icon === 'layers' && <Layers size={12} />}
        {data.icon === 'box' && <Box size={12} />}
        {data.icon === 'truck' && <Truck size={12} />}
        {data.icon === 'factory' && <Factory size={12} />}
        {data.icon === 'cpu' && <Cpu size={12} />}
        {data.icon === 'shield' && <Shield size={12} />}
        {data.icon === 'file-code' && <FileCode size={12} />}
        {data.icon === 'alert-triangle' && <AlertTriangle size={12} />}
        {data.icon === 'activity' && <Activity size={12} />}
        {data.icon === 'database' && <Database size={12} />}
        {data.icon === 'git-branch' && <GitBranch size={12} />}
        {data.icon === 'check-circle' && <div className="w-3 h-3 rounded-full bg-green-500" />}
        <span className="node-title">{data.displayName}</span>
      </div>
      <div className="ontology-node-content-palantir">
        <div className="domain-tag">{data.domainName}</div>
        {data.properties.slice(0, 2).map((prop) => (
          <div key={prop.key} className="property-row-palantir">
            <span className="property-key-palantir">{prop.key}</span>
            <span className="property-value-palantir">
              {prop.value !== undefined ? String(prop.value) : '—'}
              {prop.unit && <span className="property-unit">{prop.unit}</span>}
            </span>
          </div>
        ))}
        {data.properties.length > 2 && (
          <div className="more-properties">+{data.properties.length - 2}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={{ right: -5, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, background: '#3b82f6', border: '1.5px solid #ffffff' }} />
    </div>
  );
};

const nodeTypes = { ontologyNode: OntologyNodeCard };

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => (
  <div
    className="status-indicator"
    style={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: status === 'active' ? '#10b981' : status === 'draft' ? '#f59e0b' : '#64748b',
      flexShrink: 0,
    }}
  />
);

// ============================================================================
// 主组件
// ============================================================================

export default function OntologyStudio({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [domains] = useState<OntologyDomain[]>(initialDomains);
  const [links] = useState<OntologyLink[]>(initialLinks);
  const [selectedEntity, setSelectedEntity] = useState<OntologyEntity | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'relations' | 'constraints'>('general');

  // 约束管理状态
  const [constraints, setConstraints] = useState<Constraint[]>(initialConstraints);
  const [selectedConstraint, setSelectedConstraint] = useState<Constraint | null>(null);
  const [showAddConstraintDialog, setShowAddConstraintDialog] = useState(false);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<ConstraintLibraryItem | null>(null);

  // DSL模式
  const [dslMode, setDslMode] = useState(false);

  // 节点管理状态 - 用于动态添加新实体
  const [customEntities, setCustomEntities] = useState<OntologyEntity[]>([]);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeTypeLibraryItem | null>(null);
  const [newNodeConfig, setNewNodeConfig] = useState<{
    id: string;
    displayName: string;
    properties: Array<{ key: string; value: any; unit?: string; type?: string }>;
    parentId: string;
    status: 'active' | 'draft' | 'deprecated';
    tags: string[];
  }>({ id: '', displayName: '', properties: [], parentId: '', status: 'active', tags: [] });

  // 新节点关系配置 - 创建节点时同时建立关系
  const [newNodeRelations, setNewNodeRelations] = useState<Array<{
    targetId: string;
    relation: string;
    relationType: 'structural' | 'flow' | 'control' | 'temporal' | 'causal' | 'reference';
    description: string;
  }>>([]);

  // 新节点约束配置 - 创建节点时同时应用约束
  const [newNodeConstraints, setNewNodeConstraints] = useState<string[]>([]);

  // 关系管理状态 - 用于添加实体间关联
  const [customLinks, setCustomLinks] = useState<OntologyLink[]>([]);
  const [showAddRelationDialog, setShowAddRelationDialog] = useState(false);
  const [relationConfig, setRelationConfig] = useState<{
    source: string;
    target: string;
    relation: string;
    relationType: 'structural' | 'flow' | 'control' | 'temporal' | 'causal' | 'reference';
    description: string;
  }>({
    source: '',
    target: '',
    relation: '',
    relationType: 'structural',
    description: ''
  });

  // 合并基础实体和自定义实体
  const allEntities = useMemo(() => {
    return [...initialDomains.flatMap(d => d.entities), ...customEntities];
  }, [customEntities]);

  // 合并基础关系和自定义关系
  const allLinks = useMemo(() => {
    return [...links, ...customLinks];
  }, [customLinks]);

  // 从节点类型库创建新实体
  const createNewEntity = () => {
    if (!selectedNodeType || !newNodeConfig.id || !newNodeConfig.displayName) return;

    const newEntity: OntologyEntity = {
      id: newNodeConfig.id,
      displayName: newNodeConfig.displayName,
      type: 'Object_Type',
      status: newNodeConfig.status,
      icon: selectedNodeType.icon,
      description: selectedNodeType.description,
      properties: newNodeConfig.properties,
      domain: selectedNodeType.domain,
      domainName: selectedNodeType.domainName,
      version: '1.0.0',
      namespace: `${selectedNodeType.domain}.${newNodeConfig.id}`,
      tags: [selectedNodeType.domainName, ...newNodeConfig.tags],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '当前用户',
      parent_id: newNodeConfig.parentId || undefined,
      metadata: {}
    };

    // 1. 添加实体
    setCustomEntities([...customEntities, newEntity]);

    // 2. 创建配置的关系
    if (newNodeRelations.length > 0) {
      const newLinks: OntologyLink[] = newNodeRelations.map(rel => ({
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: newEntity.id,
        target: rel.targetId,
        relation: rel.relation,
        relationType: rel.relationType,
        cardinality: '1:N',
        description: rel.description,
        properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }
      }));
      setCustomLinks([...customLinks, ...newLinks]);
    }

    // 3. 创建父节点关系（如果配置了父节点）
    if (newNodeConfig.parentId) {
      const parentLink: OntologyLink = {
        id: `link-parent-${Date.now()}`,
        source: newNodeConfig.parentId,
        target: newEntity.id,
        relation: 'contains',
        relationType: 'structural',
        cardinality: '1:N',
        description: `${allEntities.find(e => e.id === newNodeConfig.parentId)?.displayName || '父节点'} 包含 ${newEntity.displayName}`,
        properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }
      };
      setCustomLinks(prev => [...prev, parentLink]);
    }

    // 4. 应用配置的约束
    if (newNodeConstraints.length > 0) {
      const newConstraints: Constraint[] = newNodeConstraints.map(constraintId => {
        const libItem = constraintLibrary.find(c => c.id === constraintId)!;
        return {
          id: `cons-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          entityId: newEntity.id,
          libraryItemId: constraintId,
          type: libItem.type,
          category: libItem.category,
          expression: libItem.expression,
          description: libItem.description
        };
      });
      setConstraints([...constraints, ...newConstraints]);
    }

    // 5. 重置状态
    setShowAddNodeDialog(false);
    setSelectedNodeType(null);
    setNewNodeConfig({ id: '', displayName: '', properties: [], parentId: '', status: 'active', tags: [] });
    setNewNodeRelations([]);
    setNewNodeConstraints([]);
  };

  // 删除自定义实体
  const deleteCustomEntity = (entityId: string) => {
    setCustomEntities(customEntities.filter(e => e.id !== entityId));
    // 同时删除相关的约束和关系
    setConstraints(constraints.filter(c => c.entityId !== entityId));
    setCustomLinks(customLinks.filter(l => l.source !== entityId && l.target !== entityId));
    if (selectedEntity?.id === entityId) {
      setSelectedEntity(null);
      setSelectedNodeId(null);
    }
  };

  // 创建新关系
  const createNewRelation = () => {
    if (!relationConfig.source || !relationConfig.target || !relationConfig.relation) return;

    const newLink: OntologyLink = {
      id: `link-${Date.now()}`,
      source: relationConfig.source,
      target: relationConfig.target,
      relation: relationConfig.relation,
      relationType: relationConfig.relationType,
      cardinality: '1:N',
      description: relationConfig.description,
      properties: { strength: 'strong', direction: 'directed', temporality: 'persistent' }
    };

    setCustomLinks([...customLinks, newLink]);
    setShowAddRelationDialog(false);
    setRelationConfig({
      source: '',
      target: '',
      relation: '',
      relationType: 'structural',
      description: ''
    });
  };

  // 删除自定义关系
  const deleteCustomLink = (linkId: string) => {
    setCustomLinks(customLinks.filter(l => l.id !== linkId));
  };

  // 从约束库添加约束到当前实体
  const addConstraintFromLibrary = (libraryItem: ConstraintLibraryItem) => {
    if (!selectedEntity) return;
    const newConstraint: Constraint = {
      id: `cons-${Date.now()}`,
      entityId: selectedEntity.id,
      libraryItemId: libraryItem.id,
      type: libraryItem.type,
      category: libraryItem.category,
      expression: libraryItem.expression,
      description: libraryItem.description,
    };
    setConstraints([...constraints, newConstraint]);
    setShowAddConstraintDialog(false);
    setSelectedLibraryItem(null);
  };

  // 删除约束
  const deleteConstraint = (constraintId: string) => {
    setConstraints(constraints.filter(c => c.id !== constraintId));
    if (selectedConstraint?.id === constraintId) {
      setSelectedConstraint(null);
    }
  };

  // 更新约束
  const updateConstraint = (constraintId: string, updates: Partial<Constraint>) => {
    setConstraints(constraints.map(c => c.id === constraintId ? { ...c, ...updates } : c));
    if (selectedConstraint?.id === constraintId) {
      setSelectedConstraint({ ...selectedConstraint, ...updates });
    }
  };

  // 获取适用于当前实体的约束库项
  const getApplicableConstraints = useCallback(() => {
    if (!selectedEntity) return [];
    return constraintLibrary.filter(item =>
      item.applicableDomains.includes(selectedEntity.domain)
    );
  }, [selectedEntity]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['dom-org']));
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedBase, setSelectedBase] = useState<string>('all');

  // 基地列表
  const bases = [
    { id: 'all', name: '全部基地', code: 'ALL' },
    { id: 'base_cz', name: '常州基地', code: 'CZ' },
    { id: 'base_xm', name: '厦门基地', code: 'XM' },
    { id: 'base_lz', name: '柳州基地', code: 'LZ' },
    { id: 'base_yc', name: '盐城基地', code: 'YC' },
    { id: 'base_cd', name: '成都基地', code: 'CD' },
    { id: 'base_wh', name: '武汉基地', code: 'WH' },
  ];

  // React Flow States
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // 获取相关节点（上下各一层）
  const getRelatedNodes = useCallback((centerNodeId: string, depth: number = 1) => {
    const relatedNodeIds = new Set<string>([centerNodeId]);
    const relatedLinkIds = new Set<string>();
    let currentLevel = new Set<string>([centerNodeId]);

    for (let i = 0; i < depth; i++) {
      const nextLevel = new Set<string>();
      allLinks.forEach((link) => {
        // 上游：link.target是center，则source是上游
        if (currentLevel.has(link.target) && !relatedNodeIds.has(link.source)) {
          relatedNodeIds.add(link.source);
          relatedLinkIds.add(link.id);
          nextLevel.add(link.source);
        }
        // 下游：link.source是center，则target是下游
        if (currentLevel.has(link.source) && !relatedNodeIds.has(link.target)) {
          relatedNodeIds.add(link.target);
          relatedLinkIds.add(link.id);
          nextLevel.add(link.target);
        }
      });
      currentLevel = nextLevel;
    }
    return { nodeIds: relatedNodeIds, linkIds: relatedLinkIds };
  }, [allLinks]);

  // 初始化画布
  useEffect(() => {
    let displayEntities = allEntities;
    let displayLinks = allLinks;

    // 先按基地筛选
    if (selectedBase !== 'all') {
      displayEntities = displayEntities.filter(e => {
        // 直接属于该基地的实体
        if (e.base_id === selectedBase) return true;
        // 集团公司显示在所有基地
        if (e.id === 'company') return true;
        // 基地本身
        if (e.id === selectedBase) return true;
        return false;
      });
    }

    if (focusMode && focusedNodeId) {
      const { nodeIds, linkIds } = getRelatedNodes(focusedNodeId, 1);
      displayEntities = displayEntities.filter(e => nodeIds.has(e.id));
      displayLinks = allLinks.filter(l => linkIds.has(l.id));

      if (displayEntities.length === 0) {
        const centerEntity = allEntities.find(e => e.id === focusedNodeId);
        if (centerEntity) displayEntities = [centerEntity];
      }
    } else if (selectedDomain) {
      // 显示选中域的所有实体
      const domainEntityIds = new Set(allEntities.filter(e => e.domain === selectedDomain).map(e => e.id));
      displayEntities = displayEntities.filter(e => domainEntityIds.has(e.id));
    }

    // 过滤链接：只保留两端都在显示实体中的链接
    const displayEntityIds = new Set(displayEntities.map(e => e.id));
    displayLinks = allLinks.filter(l => displayEntityIds.has(l.source) && displayEntityIds.has(l.target));

    const flowNodes: Node[] = displayEntities.map((entity, idx) => ({
      id: entity.id,
      type: 'ontologyNode',
      position: { x: 100 + (idx % 5) * 220, y: 100 + Math.floor(idx / 5) * 160 },
      data: entity,
      style: focusMode && entity.id === focusedNodeId ? { boxShadow: '0 0 0 3px #3b82f6', zIndex: 100 } : {}
    }));

    const flowEdges: Edge[] = displayLinks.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      label: link.relation,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#64748b' },
      style: { stroke: '#64748b', strokeWidth: 1.5 },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#f1f5f9', stroke: '#475569', strokeWidth: 1 },
      labelBgPadding: [4, 8],
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [allEntities, allLinks, selectedDomain, selectedBase, focusMode, focusedNodeId, getRelatedNodes, setNodes, setEdges]);

  // 聚焦时适应视图
  useEffect(() => {
    if ((focusMode && focusedNodeId) || selectedDomain) {
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.15, includeHiddenNodes: false });
      }, 150);
    }
  }, [focusMode, focusedNodeId, selectedDomain, reactFlowInstance]);

  // 处理节点选择
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEntity(node.data as OntologyEntity);
    setFocusedNodeId(node.id);
    setFocusMode(true);
  }, []);

  // 处理边选择
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const link = allLinks.find(l => l.id === edge.id);
    if (link) {
      // 可以在这里显示边的详情
    }
  }, [allLinks]);

  // 切换节点展开
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId);
    else newExpanded.add(nodeId);
    setExpandedNodes(newExpanded);
  };

  // 渲染导航树
  const renderNavTree = () => {
    return domains.map((domain) => (
      <div key={domain.id} className="domain-group">
        <div
          className={`domain-header ${selectedDomain === domain.name.toLowerCase() ? 'active' : ''}`}
          onClick={() => {
            toggleNode(domain.id);
            setSelectedDomain(domain.name.toLowerCase());
            setFocusMode(false);
            setFocusedNodeId(null);
          }}
        >
          {expandedNodes.has(domain.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="domain-name">{domain.displayName}</span>
          <span className="entity-count">{domain.entities.length}</span>
        </div>
        {expandedNodes.has(domain.id) && (
          <div className="entity-list">
            {domain.entities.map((entity) => (
              <div
                key={entity.id}
                className={`entity-item ${selectedNodeId === entity.id ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(entity.id);
                  setSelectedEntity(entity);
                  setFocusedNodeId(entity.id);
                  setFocusMode(true);
                }}
              >
                <StatusIndicator status={entity.status} />
                <span className="entity-name">{entity.displayName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  // 获取当前选中实体的上下游关系
  const getEntityRelations = useCallback(() => {
    if (!selectedEntity) return { upstream: [], downstream: [] };
    const upstream = allLinks.filter(l => l.target === selectedEntity.id);
    const downstream = allLinks.filter(l => l.source === selectedEntity.id);
    return { upstream, downstream };
  }, [selectedEntity, allLinks]);

  const { upstream, downstream } = getEntityRelations();

  return (
    <div className="ontology-studio-palantir" style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 左侧面板 */}
      <div className="left-panel-palantir" style={{ width: '200px', minWidth: '200px', maxWidth: '200px', flexShrink: 0 }}>
        <div className="panel-header-palantir">
          <div className="header-title">
            <Database size={16} />
            <span>本体导航</span>
            <span className="entity-total">({allEntities.length}实体)</span>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="搜索"><Search size={14} /></button>
            <button className="icon-btn" title="展开全部" onClick={() => setExpandedNodes(new Set(domains.map(d => d.id)))}>
              <Maximize2 size={14} />
            </button>
            <button className="icon-btn" title="收起全部" onClick={() => setExpandedNodes(new Set())}>
              <Minimize2 size={14} />
            </button>
          </div>
        </div>
        <div className="panel-search">
          <Search size={14} className="search-icon" />
          <input type="text" placeholder="搜索本体..." className="search-input" />
        </div>

        {/* 基地筛选器 */}
        <div className="base-filter" style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <label style={{
            fontSize: '10px',
            color: '#64748b',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '6px',
            display: 'block',
            letterSpacing: '0.5px'
          }}>
            所属基地
          </label>
          <select
            value={selectedBase}
            onChange={(e) => {
              setSelectedBase(e.target.value);
              setFocusMode(false);
              setFocusedNodeId(null);
              setSelectedNodeId(null);
              setSelectedEntity(null);
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: '#ffffff',
              color: '#1e293b',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {bases.map(base => (
              <option key={base.id} value={base.id}>
                {base.code} - {base.name}
              </option>
            ))}
          </select>
          {selectedBase !== 'all' && (
            <div style={{
              marginTop: '6px',
              fontSize: '10px',
              color: '#64748b'
            }}>
              显示 {allEntities.filter(e => e.base_id === selectedBase || e.id === 'company' || e.id === selectedBase).length} 个实体
            </div>
          )}
        </div>

        <div className="nav-tree-palantir">
          {renderNavTree()}
        </div>
      </div>

      {/* 中间图谱区域 */}
      <div className="center-panel-palantir" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div className="graph-toolbar-palantir">
          <div className="toolbar-left">
            {focusMode && (
              <button
                className="toolbar-btn primary"
                onClick={() => {
                  setFocusMode(false);
                  setFocusedNodeId(null);
                  setSelectedNodeId(null);
                  setSelectedEntity(null);
                }}
              >
                <X size={14} />
                退出聚焦
              </button>
            )}
            {selectedDomain && !focusMode && (
              <button
                className="toolbar-btn primary"
                onClick={() => setSelectedDomain(null)}
              >
                <X size={14} />
                显示全部
              </button>
            )}
          </div>
          <div className="toolbar-center">
            <span className="view-title">
              {focusMode && selectedEntity ? `聚焦: ${selectedEntity.displayName}` :
               selectedDomain ? `${domains.find(d => d.name.toLowerCase() === selectedDomain)?.displayName}` :
               '全部本体图谱'}
            </span>
          </div>
          <div className="toolbar-right">
            <button className="toolbar-btn" title="筛选"><Filter size={14} /></button>
            <button className="toolbar-btn" title="保存布局"><Save size={14} /></button>
            <button className="toolbar-btn" title="运行验证"><Play size={14} /></button>
          </div>
        </div>
        <div className="graph-container-palantir">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#475569" gap={20} size={1} />
            <Controls className="react-flow-controls" />
            <MiniMap
              className="react-flow-minimap"
              nodeColor={(node) => {
                const entity = node.data as OntologyEntity;
                const colors: Record<string, string> = {
                  'org': '#3b82f6', 'cap': '#10b981', 'prod': '#f59e0b',
                  'supply': '#8b5cf6', 'mfg': '#ec4899', 'quality': '#ef4444',
                  'sales': '#06b6d4', 'project': '#84cc16', 'cost': '#f97316'
                };
                return colors[entity?.domain] || '#64748b';
              }}
              maskColor="rgba(30, 41, 59, 0.8)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* 右侧面板 - 浮动抽屉式 */}
      <div className="right-panel-palantir" style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '450px',
        minWidth: '450px',
        maxWidth: '450px',
        zIndex: 100,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedEntity ? (
          <>
            <div className="panel-header-palantir">
              <div className="header-title">
                {selectedEntity.icon === 'battery' && <Battery size={16} />}
                {selectedEntity.icon === 'factory' && <Factory size={16} />}
                {selectedEntity.icon === 'cpu' && <Cpu size={16} />}
                {selectedEntity.icon === 'shield' && <Shield size={16} />}
                {selectedEntity.icon === 'truck' && <Truck size={16} />}
                {selectedEntity.icon === 'box' && <Box size={16} />}
                <span>{selectedEntity.displayName}</span>
              </div>
              <div className="header-actions">
                <button className="icon-btn" onClick={() => {
                  setSelectedEntity(null);
                  setSelectedNodeId(null);
                  setFocusMode(false);
                }}><X size={14} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', width: '100%', height: '40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {['general', 'relations', 'constraints'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    flex: '1 1 33.33%',
                    width: '33.33%',
                    height: '40px',
                    lineHeight: '40px',
                    fontSize: '13px',
                    padding: '0 8px',
                    margin: 0,
                    background: activeTab === tab ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab ? '#3b82f6' : '#64748b',
                    cursor: 'pointer',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    boxSizing: 'border-box',
                  }}
                >
                  {tab === 'general' && '基础'}
                  {tab === 'relations' && '关系'}
                  {tab === 'constraints' && '约束'}
                </button>
              ))}
            </div>

            <div className="panel-content-palantir">
              {activeTab === 'general' && (
                <div className="entity-details">
                  {/* 全局操作按钮 */}
                  <div className="detail-section">
                    <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>本体操作</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="toolbar-btn primary" onClick={() => setShowAddNodeDialog(true)} style={{ flex: 1 }}>
                        <Plus size={12} />
                        添加新节点
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                      从节点类型库创建新本体实体
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="section-title">基础属性</div>
                    <div className="detail-row"><span className="detail-label">ID</span><span className="detail-value">{selectedEntity.id}</span></div>
                    <div className="detail-row"><span className="detail-label">所属域</span><span className="detail-value">{selectedEntity.domainName}</span></div>
                    <div className="detail-row"><span className="detail-label">命名空间</span><span className="detail-value">{selectedEntity.namespace}</span></div>
                    <div className="detail-row"><span className="detail-label">版本</span><span className="detail-value">{selectedEntity.version}</span></div>
                    <div className="detail-row"><span className="detail-label">状态</span><span className="detail-value"><span className={`status-badge ${selectedEntity.status}`}>{selectedEntity.status}</span></span></div>
                    <div className="detail-row"><span className="detail-label">创建人</span><span className="detail-value">{selectedEntity.created_by}</span></div>
                    <div className="detail-row"><span className="detail-label">更新时间</span><span className="detail-value">{selectedEntity.updated_at}</span></div>
                  </div>

                  <div className="detail-section">
                    <div className="section-title">业务属性</div>
                    {selectedEntity.properties.map((prop) => (
                      <div key={prop.key} className="detail-row">
                        <span className="detail-label">{prop.key}</span>
                        <span className="detail-value">{prop.value !== undefined ? String(prop.value) : '—'}{prop.unit && <span className="unit"> {prop.unit}</span>}</span>
                      </div>
                    ))}
                  </div>

                  {selectedEntity.metadata && Object.keys(selectedEntity.metadata).length > 0 && (
                    <div className="detail-section">
                      <div className="section-title">扩展元数据</div>
                      {Object.entries(selectedEntity.metadata).map(([key, value]) => (
                        <div key={key} className="detail-row">
                          <span className="detail-label">{key}</span>
                          <span className="detail-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedEntity.tags && selectedEntity.tags.length > 0 && (
                    <div className="detail-section">
                      <div className="section-title">标签</div>
                      <div className="tag-list">
                        {selectedEntity.tags.map((tag, idx) => <span key={idx} className="tag">{tag}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'relations' && (
                <div className="entity-relations">
                  {/* 关系操作按钮 */}
                  <div className="detail-section">
                    <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>关联关系管理</span>
                      <button className="toolbar-btn primary" onClick={() => {
                        setRelationConfig({ ...relationConfig, source: selectedEntity?.id || '' });
                        setShowAddRelationDialog(true);
                      }}>
                        <Plus size={12} />
                        添加关联
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      从节点库选择节点建立关联关系
                    </div>
                  </div>

                  {/* 关系类型图例 */}
                  <div className="detail-section">
                    <div className="section-title">关系类型图例</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ padding: '2px 8px', background: '#3b82f6', color: '#fff', fontSize: '11px', borderRadius: '4px' }}>结构</span>
                      <span style={{ padding: '2px 8px', background: '#10b981', color: '#fff', fontSize: '11px', borderRadius: '4px' }}>流程</span>
                      <span style={{ padding: '2px 8px', background: '#f59e0b', color: '#fff', fontSize: '11px', borderRadius: '4px' }}>控制</span>
                      <span style={{ padding: '2px 8px', background: '#8b5cf6', color: '#fff', fontSize: '11px', borderRadius: '4px' }}>时间</span>
                      <span style={{ padding: '2px 8px', background: '#ef4444', color: '#fff', fontSize: '11px', borderRadius: '4px' }}>因果</span>
                      <span style={{ padding: '2px 8px', background: '#64748b', color: '#fff', fontSize: '11px', borderRadius: '4px' }}>引用</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="section-title">上游关系 (输入) · {upstream.length}</div>
                    {upstream.length > 0 ? upstream.map(link => {
                      const sourceEntity = allEntities.find(e => e.id === link.source);
                      const typeColors: Record<string, string> = {
                        structural: '#3b82f6', flow: '#10b981', control: '#f59e0b',
                        temporal: '#8b5cf6', causal: '#ef4444', reference: '#64748b'
                      };
                      const typeNames: Record<string, string> = {
                        structural: '结构', flow: '流程', control: '控制',
                        temporal: '时间', causal: '因果', reference: '引用'
                      };
                      return (
                        <div key={link.id} className="relation-row" style={{
                          display: 'flex', alignItems: 'center', padding: '10px', background: '#f8fafc',
                          borderRadius: '6px', marginBottom: '6px', borderLeft: `3px solid ${typeColors[link.relationType]}`,
                          maxWidth: '100%', boxSizing: 'border-box'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <Link2 size={12} color={typeColors[link.relationType]} />
                              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>
                                {sourceEntity?.displayName || link.source}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>→</span>
                              <span style={{ fontSize: '12px', color: '#3b82f6' }}>{link.relation}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{
                                padding: '1px 6px', background: typeColors[link.relationType] + '20',
                                color: typeColors[link.relationType], fontSize: '10px', borderRadius: '3px'
                              }}>{typeNames[link.relationType]}</span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{link.cardinality}</span>
                              {link.properties?.strength === 'weak' && <span style={{ fontSize: '10px', color: '#f59e0b' }}>弱关联</span>}
                              {link.properties?.temporality === 'transient' && <span style={{ fontSize: '10px', color: '#8b5cf6' }}>临时</span>}
                              {link.semantics?.map((s, i) => (
                                <span key={i} style={{ fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '1px 4px', borderRadius: '2px' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }) : <div className="empty-text">无上游关系</div>}
                  </div>

                  <div className="detail-section">
                    <div className="section-title">下游关系 (输出) · {downstream.length}</div>
                    {downstream.length > 0 ? downstream.map(link => {
                      const targetEntity = allEntities.find(e => e.id === link.target);
                      const typeColors: Record<string, string> = {
                        structural: '#3b82f6', flow: '#10b981', control: '#f59e0b',
                        temporal: '#8b5cf6', causal: '#ef4444', reference: '#64748b'
                      };
                      const typeNames: Record<string, string> = {
                        structural: '结构', flow: '流程', control: '控制',
                        temporal: '时间', causal: '因果', reference: '引用'
                      };
                      return (
                        <div key={link.id} className="relation-row" style={{
                          display: 'flex', alignItems: 'center', padding: '10px', background: '#f8fafc',
                          borderRadius: '6px', marginBottom: '6px', borderLeft: `3px solid ${typeColors[link.relationType]}`,
                          maxWidth: '100%', boxSizing: 'border-box'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#3b82f6' }}>{link.relation}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>→</span>
                              <Link2 size={12} color={typeColors[link.relationType]} />
                              <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>
                                {targetEntity?.displayName || link.target}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{
                                padding: '1px 6px', background: typeColors[link.relationType] + '20',
                                color: typeColors[link.relationType], fontSize: '10px', borderRadius: '3px'
                              }}>{typeNames[link.relationType]}</span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{link.cardinality}</span>
                              {link.properties?.strength === 'weak' && <span style={{ fontSize: '10px', color: '#f59e0b' }}>弱关联</span>}
                              {link.properties?.temporality === 'transient' && <span style={{ fontSize: '10px', color: '#8b5cf6' }}>临时</span>}
                              {link.semantics?.map((s, i) => (
                                <span key={i} style={{ fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '1px 4px', borderRadius: '2px' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }) : <div className="empty-text">无下游关系</div>}
                  </div>

                </div>
              )}

              {activeTab === 'constraints' && (
                <div className="entity-constraints">
                  <div className="detail-section">
                    <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>已应用约束</span>
                      <button className="toolbar-btn primary" onClick={() => setShowAddConstraintDialog(true)}>
                        <Plus size={12} />
                        从库添加
                      </button>
                    </div>

                    {/* 实体相关约束列表 */}
                    {constraints.filter(c => c.entityId === selectedEntity.id).length === 0 ? (
                      <div className="empty-text">暂无约束规则，请从约束库添加</div>
                    ) : (
                      constraints.filter(c => c.entityId === selectedEntity.id).map(c => {
                        const libraryItem = constraintLibrary.find(lib => lib.id === c.libraryItemId);
                        return (
                          <div key={c.id} className="constraint-item" style={{
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: selectedConstraint?.id === c.id ? '1px solid #3b82f6' : '1px solid transparent'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`constraint-badge ${c.category}`}>{c.category}</span>
                                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>{libraryItem?.name || c.type}</span>
                              </div>
                              <button className="icon-btn" onClick={() => deleteConstraint(c.id)}>
                                <X size={12} />
                              </button>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{c.description}</div>
                            <code style={{ fontSize: '11px', color: '#60a5fa', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
                              {c.expression}
                            </code>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* 从约束库选择对话框 */}
              {showAddConstraintDialog && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '500px',
                    maxWidth: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
                      从约束库添加
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                        适用于当前实体的约束
                      </span>
                    </h3>

                    {/* 适用约束列表 */}
                    <div style={{ marginBottom: '16px' }}>
                      {getApplicableConstraints().length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                          当前领域暂无适用约束，请在约束库中添加
                        </div>
                      ) : (
                        getApplicableConstraints().map(item => {
                          const isAlreadyAdded = constraints.some(c => c.entityId === selectedEntity?.id && c.libraryItemId === item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => !isAlreadyAdded && setSelectedLibraryItem(item)}
                              style={{
                                padding: '12px',
                                background: isAlreadyAdded ? '#f8fafc' : (selectedLibraryItem?.id === item.id ? 'rgba(59, 130, 246, 0.2)' : '#f8fafc'),
                                borderRadius: '8px',
                                marginBottom: '8px',
                                border: selectedLibraryItem?.id === item.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                                opacity: isAlreadyAdded ? 0.5 : 1
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{item.name}</span>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  background: item.category === 'hard' ? '#ef4444' : item.category === 'soft' ? '#f59e0b' : '#3b82f6',
                                  color: '#fff'
                                }}>
                                  {item.category}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{item.description}</div>
                              <code style={{ fontSize: '10px', color: '#60a5fa', background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px' }}>
                                {item.expression}
                              </code>
                              {isAlreadyAdded && (
                                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>✓ 已添加</div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        className="toolbar-btn"
                        onClick={() => {
                          setShowAddConstraintDialog(false);
                          setSelectedLibraryItem(null);
                        }}
                      >
                        取消
                      </button>
                      <button
                        className="toolbar-btn primary"
                        onClick={() => selectedLibraryItem && addConstraintFromLibrary(selectedLibraryItem)}
                        disabled={!selectedLibraryItem}
                      >
                        添加选中约束
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 添加新节点对话框 */}
              {showAddNodeDialog && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '600px',
                    maxWidth: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
                      添加新节点
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px', fontWeight: 'normal' }}>
                        从节点类型库选择
                      </span>
                    </h3>

                    {!selectedNodeType ? (
                      /* 第一步：选择节点类型 */
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                          请选择要创建的节点类型：
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {nodeTypeLibrary.map(item => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedNodeType(item);
                                setNewNodeConfig({
                                  id: '',
                                  displayName: '',
                                  properties: [...item.defaultProperties],
                                  parentId: '',
                                  status: 'active',
                                  tags: []
                                });
                              }}
                              style={{
                                padding: '12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', marginBottom: '4px' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                {item.domainName}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                {item.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* 第二步：配置节点详情 */
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          padding: '12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                            已选择：{selectedNodeType.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {selectedNodeType.domainName} · {selectedNodeType.description}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            节点ID <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={newNodeConfig.id}
                            onChange={(e) => setNewNodeConfig({ ...newNodeConfig, id: e.target.value })}
                            placeholder="例如：workshop-new-01"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              color: '#1e293b',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            显示名称 <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={newNodeConfig.displayName}
                            onChange={(e) => setNewNodeConfig({ ...newNodeConfig, displayName: e.target.value })}
                            placeholder="例如：新车间01"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              color: '#1e293b',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            属性值
                          </label>
                          {newNodeConfig.properties.map((prop, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <input
                                type="text"
                                value={prop.key}
                                readOnly
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  color: '#64748b',
                                  fontSize: '12px'
                                }}
                              />
                              <input
                                type="text"
                                value={prop.value}
                                onChange={(e) => {
                                  const newProps = [...newNodeConfig.properties];
                                  newProps[idx] = { ...prop, value: e.target.value };
                                  setNewNodeConfig({ ...newNodeConfig, properties: newProps });
                                }}
                                placeholder="值"
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  color: '#1e293b',
                                  fontSize: '12px'
                                }}
                              />
                              {prop.unit && (
                                <span style={{ padding: '8px 12px', color: '#64748b', fontSize: '12px' }}>
                                  {prop.unit}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* 父节点选择 */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            父节点（层级关系）
                          </label>
                          <select
                            value={newNodeConfig.parentId}
                            onChange={(e) => setNewNodeConfig({ ...newNodeConfig, parentId: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              color: '#1e293b',
                              fontSize: '13px'
                            }}
                          >
                            <option value="">无父节点</option>
                            {allEntities
                              .filter(e => e.domain === selectedNodeType.domain)
                              .map(entity => (
                                <option key={entity.id} value={entity.id}>
                                  {entity.displayName} ({entity.domainName})
                                </option>
                              ))}
                          </select>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                            选择父节点将自动建立"contains"结构关系
                          </div>
                        </div>

                        {/* 节点状态 */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            节点状态
                          </label>
                          <select
                            value={newNodeConfig.status}
                            onChange={(e) => setNewNodeConfig({ ...newNodeConfig, status: e.target.value as any })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              color: '#1e293b',
                              fontSize: '13px'
                            }}
                          >
                            <option value="active">活跃 (Active)</option>
                            <option value="draft">草稿 (Draft)</option>
                            <option value="deprecated">废弃 (Deprecated)</option>
                          </select>
                        </div>

                        {/* 关联关系配置 */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            关联关系配置
                          </label>
                          {newNodeRelations.map((rel, idx) => (
                            <div key={idx} style={{
                              padding: '10px',
                              background: '#f8fafc',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#1e293b' }}>
                                  → {allEntities.find(e => e.id === rel.targetId)?.displayName || rel.targetId}
                                </span>
                                <button
                                  className="icon-btn"
                                  onClick={() => setNewNodeRelations(newNodeRelations.filter((_, i) => i !== idx))}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                {rel.relation} ({rel.relationType})
                              </div>
                            </div>
                          ))}
                          <button
                            className="toolbar-btn"
                            onClick={() => {
                              const targetId = prompt('请输入目标节点ID:');
                              if (targetId && allEntities.find(e => e.id === targetId)) {
                                const relation = prompt('请输入关系名称:', 'relates_to');
                                if (relation) {
                                  setNewNodeRelations([...newNodeRelations, {
                                    targetId,
                                    relation,
                                    relationType: 'structural',
                                    description: ''
                                  }]);
                                }
                              } else if (targetId) {
                                alert('未找到该节点ID');
                              }
                            }}
                            style={{ width: '100%', marginTop: '4px' }}
                          >
                            <Plus size={12} />
                            添加关联关系
                          </button>
                        </div>

                        {/* 约束配置 */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            约束规则
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {constraintLibrary
                              .filter(c => c.applicableDomains.includes(selectedNodeType.domain))
                              .map(libItem => {
                                const isSelected = newNodeConstraints.includes(libItem.id);
                                return (
                                  <button
                                    key={libItem.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        setNewNodeConstraints(newNodeConstraints.filter(id => id !== libItem.id));
                                      } else {
                                        setNewNodeConstraints([...newNodeConstraints, libItem.id]);
                                      }
                                    }}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                      background: isSelected ? 'rgba(59, 130, 246, 0.2)' : '#f8fafc',
                                      color: isSelected ? '#3b82f6' : '#94a3b8',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{libItem.name}
                                  </button>
                                );
                              })}
                          </div>
                          {newNodeConstraints.length === 0 && (
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                              点击上方按钮选择要应用的约束规则
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        className="toolbar-btn"
                        onClick={() => {
                          setShowAddNodeDialog(false);
                          setSelectedNodeType(null);
                          setNewNodeConfig({ id: '', displayName: '', properties: [], parentId: '', status: 'active', tags: [] });
                          setNewNodeRelations([]);
                          setNewNodeConstraints([]);
                        }}
                      >
                        取消
                      </button>
                      {selectedNodeType && (
                        <button
                          className="toolbar-btn"
                          onClick={() => setSelectedNodeType(null)}
                        >
                          返回选择
                        </button>
                      )}
                      {selectedNodeType && (
                        <button
                          className="toolbar-btn primary"
                          onClick={createNewEntity}
                          disabled={!newNodeConfig.id || !newNodeConfig.displayName}
                        >
                          创建节点
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 添加关联关系对话框 */}
              {showAddRelationDialog && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '500px',
                    maxWidth: '90%',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
                      添加关联关系
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        源节点（当前实体）
                      </label>
                      <input
                        type="text"
                        value={selectedEntity?.displayName || ''}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#64748b',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        目标节点 <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={relationConfig.target}
                        onChange={(e) => setRelationConfig({ ...relationConfig, target: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#1e293b',
                          fontSize: '13px'
                        }}
                      >
                        <option value="">选择目标节点...</option>
                        {allEntities.filter(e => e.id !== selectedEntity?.id).map(entity => (
                          <option key={entity.id} value={entity.id}>
                            {entity.displayName} ({entity.domainName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        关系类型 <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={relationConfig.relationType}
                        onChange={(e) => setRelationConfig({ ...relationConfig, relationType: e.target.value as any })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#1e293b',
                          fontSize: '13px',
                          marginBottom: '8px'
                        }}
                      >
                        <option value="structural">结构关系</option>
                        <option value="flow">流程关系</option>
                        <option value="control">控制关系</option>
                        <option value="temporal">时间关系</option>
                        <option value="causal">因果关系</option>
                        <option value="reference">引用关系</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        关系名称 <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={relationConfig.relation}
                        onChange={(e) => setRelationConfig({ ...relationConfig, relation: e.target.value })}
                        placeholder="例如：contains、produces、controls"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#1e293b',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                        关系描述
                      </label>
                      <input
                        type="text"
                        value={relationConfig.description}
                        onChange={(e) => setRelationConfig({ ...relationConfig, description: e.target.value })}
                        placeholder="描述此关系的含义..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#1e293b',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        className="toolbar-btn"
                        onClick={() => {
                          setShowAddRelationDialog(false);
                          setRelationConfig({
                            source: '',
                            target: '',
                            relation: '',
                            relationType: 'structural',
                            description: ''
                          });
                        }}
                      >
                        取消
                      </button>
                      <button
                        className="toolbar-btn primary"
                        onClick={createNewRelation}
                        disabled={!relationConfig.target || !relationConfig.relation}
                      >
                        创建关联
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="empty-state">
            <Database size={48} className="empty-icon" />
            <p>选择左侧实体查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
}
