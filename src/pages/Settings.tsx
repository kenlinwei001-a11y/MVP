import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Tabs, Tab, FormGroup, InputGroup, HTMLSelect, Tag, Card, Button, Divider
} from '@blueprintjs/core';
import {
  ChevronLeft, Settings, Database, GitBranch, Sparkles,
  Plus, Trash2, Edit3, Save, X, Check, ChevronRight,
  Wrench, Brain, Workflow, BarChart3,
  AlertCircle, Clock, Zap, Target, MessageSquare,
  Search, Filter, Copy, MoreHorizontal, Eye, Download,
  ZoomIn, ZoomOut, Move, Maximize2,
  Factory, Truck, Package, Boxes, ClipboardList, TrendingUp, AlertTriangle, CalendarDays,
  Cpu, TrendingUp as Trending, ShieldCheck, BarChart2, CheckCircle, Shield,
  Users, ArrowLeftRight, Warehouse, Star, Layers, Ban, Calendar, PackageCheck, Leaf, ExternalLink,
  Battery, Box, Truck as TruckIcon
} from 'lucide-react';
import AgentEditor from './AgentEditor';

type SettingsTab = 'overview' | 'mcp' | 'ontology' | 'skills' | 'agent';
type OntologyView = 'list' | 'template' | 'detail' | 'studio';

interface MCPTool {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  icon: React.ElementType;
}

interface OntologyNode {
  id: string;
  name: string;
  type: 'entity' | 'attribute' | 'relation';
  x: number;
  y: number;
  color?: string;
}

interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface OntologyChain {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeCount: number;
  edgeCount: number;
  status: 'active' | 'inactive';
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  createdAt: string;
  updatedAt: string;
}

interface OntologyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  chain: Omit<OntologyChain, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
}

// 10个产销场景模板
const ontologyTemplates: OntologyTemplate[] = [
  {
    id: 'tmpl-1',
    name: '产能分析本体链',
    description: '分析生产线产能利用率、瓶颈识别与产能优化',
    category: '生产管理',
    icon: Factory,
    chain: {
      name: '产能分析本体链',
      description: '分析生产线产能利用率、瓶颈识别与产能优化',
      category: '生产管理',
      nodeCount: 6,
      edgeCount: 7,
      nodes: [
        { id: 'n1', name: '生产线', type: 'entity', x: 100, y: 100, color: '#3b82f6' },
        { id: 'n2', name: '设备', type: 'entity', x: 250, y: 80, color: '#3b82f6' },
        { id: 'n3', name: '产能利用率', type: 'attribute', x: 175, y: 200, color: '#10b981' },
        { id: 'n4', name: '瓶颈工序', type: 'entity', x: 400, y: 150, color: '#ef4444' },
        { id: 'n5', name: 'OEE', type: 'attribute', x: 325, y: 250, color: '#10b981' },
        { id: 'n6', name: '排产计划', type: 'entity', x: 550, y: 200, color: '#8b5cf6' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '包含' },
        { id: 'e2', source: 'n1', target: 'n3', label: '具有' },
        { id: 'e3', source: 'n2', target: 'n4', label: '存在' },
        { id: 'e4', source: 'n2', target: 'n5', label: '计算' },
        { id: 'e5', source: 'n4', target: 'n3', label: '影响' },
        { id: 'e6', source: 'n6', target: 'n1', label: '分配至' },
        { id: 'e7', source: 'n6', target: 'n4', label: '规避' },
      ]
    }
  },
  {
    id: 'tmpl-2',
    name: '排产推演本体链',
    description: '基于约束条件的生产排程可行性分析与优化',
    category: '排产调度',
    icon: CalendarDays,
    chain: {
      name: '排产推演本体链',
      description: '基于约束条件的生产排程可行性分析与优化',
      category: '排产调度',
      nodeCount: 7,
      edgeCount: 8,
      nodes: [
        { id: 'n1', name: '订单', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '工序', type: 'entity', x: 250, y: 100, color: '#3b82f6' },
        { id: 'n3', name: '设备', type: 'entity', x: 250, y: 200, color: '#3b82f6' },
        { id: 'n4', name: '交期', type: 'attribute', x: 100, y: 250, color: '#f59e0b' },
        { id: 'n5', name: '约束条件', type: 'entity', x: 400, y: 150, color: '#ef4444' },
        { id: 'n6', name: '排程结果', type: 'entity', x: 550, y: 150, color: '#10b981' },
        { id: 'n7', name: '可行性评分', type: 'attribute', x: 550, y: 250, color: '#8b5cf6' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '分解为' },
        { id: 'e2', source: 'n2', target: 'n3', label: '占用' },
        { id: 'e3', source: 'n1', target: 'n4', label: '要求' },
        { id: 'e4', source: 'n5', target: 'n2', label: '限制' },
        { id: 'e5', source: 'n5', target: 'n3', label: '限制' },
        { id: 'e6', source: 'n2', target: 'n6', label: '生成' },
        { id: 'e7', source: 'n3', target: 'n6', label: '生成' },
        { id: 'e8', source: 'n6', target: 'n7', label: '评估' },
      ]
    }
  },
  {
    id: 'tmpl-3',
    name: '物料需求计划本体链',
    description: 'MRP运算与物料需求分析',
    category: '物料管理',
    icon: Boxes,
    chain: {
      name: '物料需求计划本体链',
      description: 'MRP运算与物料需求分析',
      category: '物料管理',
      nodeCount: 6,
      edgeCount: 7,
      nodes: [
        { id: 'n1', name: '产品BOM', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '原材料', type: 'entity', x: 250, y: 100, color: '#8b5cf6' },
        { id: 'n3', name: '半成品', type: 'entity', x: 250, y: 200, color: '#8b5cf6' },
        { id: 'n4', name: '需求量', type: 'attribute', x: 400, y: 80, color: '#10b981' },
        { id: 'n5', name: '库存量', type: 'attribute', x: 400, y: 150, color: '#f59e0b' },
        { id: 'n6', name: '采购建议', type: 'entity', x: 550, y: 150, color: '#ef4444' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '包含' },
        { id: 'e2', source: 'n1', target: 'n3', label: '包含' },
        { id: 'e3', source: 'n2', target: 'n4', label: '计算' },
        { id: 'e4', source: 'n3', target: 'n4', label: '计算' },
        { id: 'e5', source: 'n2', target: 'n5', label: '扣除' },
        { id: 'e6', source: 'n3', target: 'n5', label: '扣除' },
        { id: 'e7', source: 'n4', target: 'n6', label: '生成' },
      ]
    }
  },
  {
    id: 'tmpl-4',
    name: '质量追溯本体链',
    description: '产品质量问题追溯与根因分析',
    category: '质量管理',
    icon: ClipboardList,
    chain: {
      name: '质量追溯本体链',
      description: '产品质量问题追溯与根因分析',
      category: '质量管理',
      nodeCount: 7,
      edgeCount: 8,
      nodes: [
        { id: 'n1', name: '质量问题', type: 'entity', x: 100, y: 150, color: '#ef4444' },
        { id: 'n2', name: '批次', type: 'entity', x: 250, y: 100, color: '#3b82f6' },
        { id: 'n3', name: '工序', type: 'entity', x: 250, y: 200, color: '#3b82f6' },
        { id: 'n4', name: '设备', type: 'entity', x: 400, y: 80, color: '#3b82f6' },
        { id: 'n5', name: '人员', type: 'entity', x: 400, y: 200, color: '#3b82f6' },
        { id: 'n6', name: '原材料', type: 'entity', x: 550, y: 100, color: '#8b5cf6' },
        { id: 'n7', name: '根因', type: 'attribute', x: 550, y: 220, color: '#10b981' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '发生在' },
        { id: 'e2', source: 'n2', target: 'n3', label: '经过' },
        { id: 'e3', source: 'n3', target: 'n4', label: '使用' },
        { id: 'e4', source: 'n3', target: 'n5', label: '操作' },
        { id: 'e5', source: 'n2', target: 'n6', label: '消耗' },
        { id: 'e6', source: 'n4', target: 'n7', label: '导致' },
        { id: 'e7', source: 'n5', target: 'n7', label: '导致' },
        { id: 'e8', source: 'n6', target: 'n7', label: '导致' },
      ]
    }
  },
  {
    id: 'tmpl-5',
    name: '供应链协同本体链',
    description: '供应商协同与交付风险分析',
    category: '供应链',
    icon: Truck,
    chain: {
      name: '供应链协同本体链',
      description: '供应商协同与交付风险分析',
      category: '供应链',
      nodeCount: 6,
      edgeCount: 7,
      nodes: [
        { id: 'n1', name: '供应商', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '采购订单', type: 'entity', x: 250, y: 100, color: '#8b5cf6' },
        { id: 'n3', name: '交货计划', type: 'entity', x: 250, y: 200, color: '#f59e0b' },
        { id: 'n4', name: '库存水位', type: 'attribute', x: 400, y: 80, color: '#10b981' },
        { id: 'n5', name: '风险等级', type: 'attribute', x: 400, y: 200, color: '#ef4444' },
        { id: 'n6', name: '协同建议', type: 'entity', x: 550, y: 150, color: '#10b981' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '接收' },
        { id: 'e2', source: 'n2', target: 'n3', label: '确认' },
        { id: 'e3', source: 'n3', target: 'n4', label: '影响' },
        { id: 'e4', source: 'n1', target: 'n5', label: '评估' },
        { id: 'e5', source: 'n3', target: 'n5', label: '评估' },
        { id: 'e6', source: 'n4', target: 'n6', label: '触发' },
        { id: 'e7', source: 'n5', target: 'n6', label: '触发' },
      ]
    }
  },
  {
    id: 'tmpl-6',
    name: '设备维护本体链',
    description: '设备预防性维护与故障预测',
    category: '设备管理',
    icon: Wrench,
    chain: {
      name: '设备维护本体链',
      description: '设备预防性维护与故障预测',
      category: '设备管理',
      nodeCount: 6,
      edgeCount: 7,
      nodes: [
        { id: 'n1', name: '设备', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '运行数据', type: 'attribute', x: 250, y: 100, color: '#10b981' },
        { id: 'n3', name: '故障历史', type: 'attribute', x: 250, y: 200, color: '#ef4444' },
        { id: 'n4', name: 'MTBF', type: 'attribute', x: 400, y: 80, color: '#f59e0b' },
        { id: 'n5', name: '健康评分', type: 'attribute', x: 400, y: 200, color: '#8b5cf6' },
        { id: 'n6', name: '维护计划', type: 'entity', x: 550, y: 150, color: '#10b981' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '产生' },
        { id: 'e2', source: 'n1', target: 'n3', label: '记录' },
        { id: 'e3', source: 'n3', target: 'n4', label: '计算' },
        { id: 'e4', source: 'n2', target: 'n5', label: '评估' },
        { id: 'e5', source: 'n4', target: 'n5', label: '影响' },
        { id: 'e6', source: 'n5', target: 'n6', label: '生成' },
        { id: 'e7', source: 'n6', target: 'n1', label: '执行于' },
      ]
    }
  },
  {
    id: 'tmpl-7',
    name: '成本控制本体链',
    description: '生产成本分析与成本控制策略',
    category: '成本管理',
    icon: TrendingUp,
    chain: {
      name: '成本控制本体链',
      description: '生产成本分析与成本控制策略',
      category: '成本管理',
      nodeCount: 7,
      edgeCount: 8,
      nodes: [
        { id: 'n1', name: '产品', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '物料成本', type: 'attribute', x: 250, y: 80, color: '#10b981' },
        { id: 'n3', name: '人工成本', type: 'attribute', x: 250, y: 160, color: '#10b981' },
        { id: 'n4', name: '制造费用', type: 'attribute', x: 250, y: 240, color: '#10b981' },
        { id: 'n5', name: '标准成本', type: 'attribute', x: 400, y: 120, color: '#f59e0b' },
        { id: 'n6', name: '实际成本', type: 'attribute', x: 400, y: 200, color: '#ef4444' },
        { id: 'n7', name: '差异分析', type: 'entity', x: 550, y: 160, color: '#8b5cf6' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '包含' },
        { id: 'e2', source: 'n1', target: 'n3', label: '包含' },
        { id: 'e3', source: 'n1', target: 'n4', label: '包含' },
        { id: 'e4', source: 'n2', target: 'n5', label: '构成' },
        { id: 'e5', source: 'n3', target: 'n5', label: '构成' },
        { id: 'e6', source: 'n2', target: 'n6', label: '实际' },
        { id: 'e7', source: 'n3', target: 'n6', label: '实际' },
        { id: 'e8', source: 'n5', target: 'n7', label: '对比' },
      ]
    }
  },
  {
    id: 'tmpl-8',
    name: '异常检测本体链',
    description: '生产异常实时检测与预警',
    category: '异常管理',
    icon: AlertTriangle,
    chain: {
      name: '异常检测本体链',
      description: '生产异常实时检测与预警',
      category: '异常管理',
      nodeCount: 6,
      edgeCount: 7,
      nodes: [
        { id: 'n1', name: '传感器', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '实时数据', type: 'attribute', x: 250, y: 100, color: '#10b981' },
        { id: 'n3', name: '阈值规则', type: 'entity', x: 250, y: 200, color: '#f59e0b' },
        { id: 'n4', name: '异常事件', type: 'entity', x: 400, y: 150, color: '#ef4444' },
        { id: 'n5', name: '严重等级', type: 'attribute', x: 550, y: 100, color: '#ef4444' },
        { id: 'n6', name: '处理建议', type: 'entity', x: 550, y: 220, color: '#10b981' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '采集' },
        { id: 'e2', source: 'n2', target: 'n3', label: '匹配' },
        { id: 'e3', source: 'n3', target: 'n4', label: '触发' },
        { id: 'e4', source: 'n2', target: 'n4', label: '异常' },
        { id: 'e5', source: 'n4', target: 'n5', label: '评估' },
        { id: 'e6', source: 'n5', target: 'n6', label: '生成' },
        { id: 'e7', source: 'n4', target: 'n6', label: '推荐' },
      ]
    }
  },
  {
    id: 'tmpl-9',
    name: '订单交付本体链',
    description: '订单全流程跟踪与交付风险预警',
    category: '订单管理',
    icon: Package,
    chain: {
      name: '订单交付本体链',
      description: '订单全流程跟踪与交付风险预警',
      category: '订单管理',
      nodeCount: 7,
      edgeCount: 8,
      nodes: [
        { id: 'n1', name: '客户订单', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '交期', type: 'attribute', x: 100, y: 250, color: '#f59e0b' },
        { id: 'n3', name: '生产进度', type: 'attribute', x: 250, y: 100, color: '#10b981' },
        { id: 'n4', name: '物料齐套', type: 'attribute', x: 250, y: 200, color: '#8b5cf6' },
        { id: 'n5', name: '质量检验', type: 'entity', x: 400, y: 150, color: '#3b82f6' },
        { id: 'n6', name: '发货计划', type: 'entity', x: 550, y: 120, color: '#10b981' },
        { id: 'n7', name: 'OTIF', type: 'attribute', x: 550, y: 220, color: '#10b981' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '要求' },
        { id: 'e2', source: 'n1', target: 'n3', label: '跟踪' },
        { id: 'e3', source: 'n1', target: 'n4', label: '检查' },
        { id: 'e4', source: 'n3', target: 'n5', label: '待检' },
        { id: 'e5', source: 'n4', target: 'n5', label: '影响' },
        { id: 'e6', source: 'n5', target: 'n6', label: '触发' },
        { id: 'e7', source: 'n6', target: 'n7', label: '计算' },
        { id: 'e8', source: 'n2', target: 'n7', label: '对比' },
      ]
    }
  },
  {
    id: 'tmpl-10',
    name: '能源管理本体链',
    description: '能耗监测与节能优化分析',
    category: '能源管理',
    icon: Zap,
    chain: {
      name: '能源管理本体链',
      description: '能耗监测与节能优化分析',
      category: '能源管理',
      nodeCount: 6,
      edgeCount: 7,
      nodes: [
        { id: 'n1', name: '设备', type: 'entity', x: 100, y: 150, color: '#3b82f6' },
        { id: 'n2', name: '能耗数据', type: 'attribute', x: 250, y: 100, color: '#10b981' },
        { id: 'n3', name: '峰谷平', type: 'attribute', x: 250, y: 200, color: '#f59e0b' },
        { id: 'n4', name: '单耗指标', type: 'attribute', x: 400, y: 80, color: '#8b5cf6' },
        { id: 'n5', name: '异常消耗', type: 'entity', x: 400, y: 200, color: '#ef4444' },
        { id: 'n6', name: '节能建议', type: 'entity', x: 550, y: 150, color: '#10b981' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '产生' },
        { id: 'e2', source: 'n2', target: 'n3', label: '分类' },
        { id: 'e3', source: 'n2', target: 'n4', label: '计算' },
        { id: 'e4', source: 'n2', target: 'n5', label: '异常' },
        { id: 'e5', source: 'n4', target: 'n5', label: '超出' },
        { id: 'e6', source: 'n5', target: 'n6', label: '触发' },
        { id: 'e7', source: 'n3', target: 'n6', label: '优化' },
      ]
    }
  },
];

// 状态指示器组件
const StatusDot = ({ status }: { status: string }) => {
  const getColor = () => {
    switch (status) {
      case 'verified': return 'var(--palantir-success)';
      case 'draft': return 'var(--palantir-warning)';
      case 'conflict': return 'var(--palantir-danger)';
      default: return '#ccc';
    }
  };
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: getColor(),
        display: 'inline-block',
      }}
    />
  );
};

// 与 OntologyStudio 100% 一致的节点组件
const OntologyNodeCard = ({ data }: { data: any }) => {
  return (
    <div className="ontology-node" style={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 10,
          height: 10,
          background: '#106BA3',
          border: '2px solid #fff',
        }}
      />
      <div className="ontology-node-header">
        <StatusDot status={data.status || 'verified'} />
        {data.iconType === 'battery' && <Battery size={14} />}
        {data.iconType === 'layers' && <Layers size={14} />}
        {data.iconType === 'box' && <Box size={14} />}
        {data.iconType === 'truck' && <TruckIcon size={14} />}
        <span style={{ fontWeight: 600, fontSize: 12 }}>{data.label}</span>
      </div>
      <div className="ontology-node-content">
        {data.properties?.slice(0, 3).map((prop: any, idx: number) => (
          <div key={idx} className="property-row">
            <span className="property-key">{prop.key}</span>
            <span className="property-value">
              {prop.value !== undefined ? prop.value : '—'}
              {prop.unit && <span style={{ marginLeft: 2, color: 'var(--palantir-text-muted)' }}>{prop.unit}</span>}
            </span>
          </div>
        ))}
        {data.properties?.length > 3 && (
          <div style={{ fontSize: 10, color: 'var(--palantir-text-muted)', textAlign: 'center', paddingTop: 4 }}>
            +{data.properties.length - 3} 更多
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 10,
          height: 10,
          background: '#106BA3',
          border: '2px solid #fff',
        }}
      />
    </div>
  );
};

const nodeTypes = {
  ontology: OntologyNodeCard,
};

// ReactFlow 本体图谱组件 - 与 OntologyStudio 100% 一致
function OntologyGraph({ nodes, edges, onNodeClick }: {
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  onNodeClick?: (node: OntologyNode) => void;
}) {
  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // 转换节点为 ReactFlow 格式
    const rNodes: Node[] = nodes.map(node => ({
      id: node.id,
      type: 'ontology',
      position: { x: node.x, y: node.y },
      data: {
        label: node.name,
        iconType: node.type === 'entity' ? 'box' : node.type === 'attribute' ? 'layers' : 'battery',
        status: 'verified',
        properties: [
          { key: '类型', value: node.type === 'entity' ? '实体' : node.type === 'attribute' ? '属性' : '关系' },
          { key: 'ID', value: node.id },
        ],
        originalNode: node,
      },
    }));

    // 转换边为 ReactFlow 格式
    const rEdges: Edge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: ConnectionLineType.SmoothStep,
      style: { stroke: '#64748b', strokeWidth: 1.5 },
      labelStyle: { fill: '#374151', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#fff', stroke: '#e5e7eb', strokeWidth: 1, rx: 4 },
      labelBgPadding: [4, 8],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.Arrow,
        color: '#64748b',
      },
    }));

    setNodes(rNodes);
    setEdges(rEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeClickHandler = useCallback((_: React.MouseEvent, node: Node) => {
    if (onNodeClick && node.data?.originalNode) {
      onNodeClick(node.data.originalNode);
    }
  }, [onNodeClick]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 1.5 },
        }}
      >
        <Background color="#e1e8ed" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeColor="#106BA3"
          nodeColor="#fff"
          nodeBorderRadius={2}
        />
      </ReactFlow>
    </div>
  );
}

export default function SettingsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview');
  const [ontologyView, setOntologyView] = useState<OntologyView>('list');
  const [selectedChain, setSelectedChain] = useState<OntologyChain | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<OntologyTemplate | null>(null);
  const [selectedTemplateNode, setSelectedTemplateNode] = useState<OntologyNode | null>(null);
  const [graphScale, setGraphScale] = useState(1);
  const [editingNode, setEditingNode] = useState<OntologyNode | null>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddEdgeModal, setShowAddEdgeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 智能体编辑状态
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  const [chains, setChains] = useState<OntologyChain[]>([
    {
      id: '1',
      name: '产能分析本体链',
      description: '分析产能瓶颈与利用率',
      category: '生产管理',
      nodeCount: 6,
      edgeCount: 7,
      status: 'active',
      nodes: ontologyTemplates[0].chain.nodes,
      edges: ontologyTemplates[0].chain.edges,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
    },
    {
      id: '2',
      name: '排产推演本体链',
      description: '推演排产可行性',
      category: '排产调度',
      nodeCount: 7,
      edgeCount: 8,
      status: 'active',
      nodes: ontologyTemplates[1].chain.nodes,
      edges: ontologyTemplates[1].chain.edges,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
    },
  ]);

  const mcpTools: MCPTool[] = [
    // ========== 20个APS求解器 ==========
    // 数学规划求解器
    { id: 'solver-001', name: '线性规划求解器(LP)', description: '求解产能分配、资源优化等线性问题，最小化成本或最大化产出', status: 'active', icon: BarChart3 },
    { id: 'solver-002', name: '混合整数规划求解器(MIP)', description: '处理设备启停、订单选择等离散决策问题，支持0-1变量', status: 'active', icon: BarChart3 },
    { id: 'solver-003', name: '约束满足求解器(CSP)', description: '求解复杂约束条件下的可行解，用于排程可行性验证', status: 'active', icon: Wrench },
    { id: 'solver-004', name: '动态规划求解器(DP)', description: '求解多阶段决策问题，如库存优化、产能规划', status: 'active', icon: BarChart3 },
    { id: 'solver-005', name: '分支定界求解器(B&B)', description: '精确求解组合优化问题，如作业车间调度(JSP)', status: 'active', icon: GitBranch },
    // 启发式/元启发式求解器
    { id: 'solver-006', name: '遗传算法求解器(GA)', description: '模拟自然进化过程，求解大规模排程优化问题', status: 'active', icon: Cpu },
    { id: 'solver-007', name: '模拟退火求解器(SA)', description: '基于物理退火原理，求解车间布局、工序排序', status: 'active', icon: Zap },
    { id: 'solver-008', name: '禁忌搜索求解器(TS)', description: '避免重复搜索，求解复杂排程和路径规划', status: 'active', icon: Target },
    { id: 'solver-009', name: '蚁群算法求解器(ACO)', description: '模拟蚂蚁觅食行为，求解工序路由和物流路径', status: 'active', icon: Boxes },
    { id: 'solver-010', name: '粒子群优化求解器(PSO)', description: '模拟鸟群觅食，求解多目标排程和资源分配', status: 'active', icon: Sparkles },
    { id: 'solver-011', name: '变邻域搜索求解器(VNS)', description: '动态调整邻域结构，求解混合流水车间调度', status: 'active', icon: Search },
    { id: 'solver-012', name: '自适应大邻域搜索(ALNS)', description: '自适应选择破坏和修复算子，求解大规模VRP和排程', status: 'active', icon: Maximize2 },
    // 专用求解器
    { id: 'solver-013', name: '规则引擎求解器', description: '基于业务规则的快速排程，如先到先服务、最短加工时间', status: 'active', icon: ClipboardList },
    { id: 'solver-014', name: '多目标优化求解器', description: '同时优化交期、成本、能耗等多个冲突目标', status: 'active', icon: BarChart2 },
    { id: 'solver-015', name: '鲁棒优化求解器', description: '考虑不确定性，生成抗干扰的鲁棒排程方案', status: 'active', icon: ShieldCheck },
    { id: 'solver-016', name: '实时调度求解器', description: '响应紧急插单、设备故障等实时事件，动态重排程', status: 'active', icon: Clock },
    { id: 'solver-017', name: '拉格朗日松弛求解器', description: '分解复杂问题，求解带耦合约束的产能规划', status: 'active', icon: GitBranch },
    { id: 'solver-018', name: '列生成求解器(CG)', description: '处理变量规模爆炸问题，求解大规模切割库存问题', status: 'active', icon: Plus },
    { id: 'solver-019', name: '分解协调求解器', description: '将大规模问题分解为子问题，协调求解供应链排程', status: 'active', icon: Workflow },
    { id: 'solver-020', name: '神经网络求解器(NN)', description: '基于深度学习的快速排程决策，用于实时响应', status: 'active', icon: Brain },

    // ========== 20个APS约束规则 ==========
    { id: 'constraint-001', name: '产能约束规则', description: '设备/产线最大产能限制，包括额定产能、OEE折算、班次产能', status: 'active', icon: Factory },
    { id: 'constraint-002', name: '物料齐套约束', description: '工单开工前物料可用性检查，BOM展开与物料需求计算', status: 'active', icon: Package },
    { id: 'constraint-003', name: '交期约束规则', description: '客户订单交付日期约束，优先级排序与交期延迟惩罚', status: 'active', icon: CalendarDays },
    { id: 'constraint-004', name: '设备能力约束', description: '设备加工精度、尺寸限制、工艺参数范围约束', status: 'active', icon: Cpu },
    { id: 'constraint-005', name: '人员技能约束', description: '工序所需技能等级与人员资质匹配，多能工配置', status: 'active', icon: Users },
    { id: 'constraint-006', name: '工艺路线约束', description: '工序先后顺序、串并行关系、可选工艺路径选择', status: 'active', icon: GitBranch },
    { id: 'constraint-007', name: '换型时间约束', description: '不同产品间切换所需准备时间，SMED优化约束', status: 'active', icon: ArrowLeftRight },
    { id: 'constraint-008', name: '预防维护约束', description: '设备保养计划、点检时间窗、故障率预测维护', status: 'active', icon: Wrench },
    { id: 'constraint-009', name: '物料可用约束', description: '原材料到货计划、在途库存、供应商交付周期', status: 'active', icon: Truck },
    { id: 'constraint-010', name: '库存容量约束', description: '仓库库位限制、WIP上限、成品库存容量', status: 'active', icon: Warehouse },
    { id: 'constraint-011', name: '订单优先级约束', description: 'VIP客户、加急订单、战略客户优先排产规则', status: 'active', icon: Star },
    { id: 'constraint-012', name: '批次大小约束', description: '最小经济批量、最大批次限制、整批转移要求', status: 'active', icon: Layers },
    { id: 'constraint-013', name: '质量检验约束', description: '首件检验、巡检时间、质检站产能与等待时间', status: 'active', icon: ShieldCheck },
    { id: 'constraint-014', name: '安全库存约束', description: '关键物料安全库存、成品安全库存预警与补货', status: 'active', icon: Shield },
    { id: 'constraint-015', name: '提前期约束', description: '采购提前期、制造提前期、运输提前期计算', status: 'active', icon: Clock },
    { id: 'constraint-016', name: '资源互斥约束', description: '关键资源独占使用、模具治具冲突、人员互斥', status: 'active', icon: Ban },
    { id: 'constraint-017', name: '日历约束规则', description: '工作日历、节假日、设备停机计划、班次设置', status: 'active', icon: Calendar },
    { id: 'constraint-018', name: '配套出货约束', description: '订单配套完整性、齐套发货、分批交付限制', status: 'active', icon: PackageCheck },
    { id: 'constraint-019', name: '环保能耗约束', description: '峰谷平用电限制、碳排放配额、环保停产要求', status: 'active', icon: Leaf },
    { id: 'constraint-020', name: '外协加工约束', description: '外协产能限制、外协交期、回厂检验时间', status: 'active', icon: ExternalLink },
  ];

  const categories = ['全部', '生产管理', '排产调度', '物料管理', '质量管理', '供应链', '设备管理', '成本管理', '异常管理', '订单管理', '能源管理'];

  const filteredTemplates = ontologyTemplates.filter(t =>
    (filterCategory === 'all' || filterCategory === '全部' || t.category === filterCategory) &&
    (t.name.includes(searchQuery) || t.description.includes(searchQuery))
  );

  const createChainFromTemplate = (template: OntologyTemplate) => {
    const newChain: OntologyChain = {
      id: Date.now().toString(),
      name: template.chain.name,
      description: template.chain.description,
      category: template.chain.category,
      nodeCount: template.chain.nodeCount,
      edgeCount: template.chain.edgeCount,
      status: 'active',
      nodes: JSON.parse(JSON.stringify(template.chain.nodes)),
      edges: JSON.parse(JSON.stringify(template.chain.edges)),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setChains(prev => [...prev, newChain]);
    setOntologyView('list');
  };

  const updateChain = (chainId: string, updates: Partial<OntologyChain>) => {
    setChains(prev => prev.map(c => c.id === chainId ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c));
  };

  const deleteChain = (chainId: string) => {
    setChains(prev => prev.filter(c => c.id !== chainId));
    if (selectedChain?.id === chainId) {
      setSelectedChain(null);
      setOntologyView('list');
    }
  };

  const addNode = (chainId: string, node: Omit<OntologyNode, 'id'>) => {
    const newNode: OntologyNode = { ...node, id: `n${Date.now()}` };
    setChains(prev => prev.map(c => {
      if (c.id !== chainId) return c;
      return { ...c, nodes: [...c.nodes, newNode], nodeCount: c.nodeCount + 1 };
    }));
  };

  const deleteNode = (chainId: string, nodeId: string) => {
    setChains(prev => prev.map(c => {
      if (c.id !== chainId) return c;
      return {
        ...c,
        nodes: c.nodes.filter(n => n.id !== nodeId),
        edges: c.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
        nodeCount: c.nodeCount - 1,
        edgeCount: c.edges.filter(e => e.source !== nodeId && e.target !== nodeId).length
      };
    }));
  };

  const addEdge = (chainId: string, edge: Omit<OntologyEdge, 'id'>) => {
    const newEdge: OntologyEdge = { ...edge, id: `e${Date.now()}` };
    setChains(prev => prev.map(c => {
      if (c.id !== chainId) return c;
      return { ...c, edges: [...c.edges, newEdge], edgeCount: c.edgeCount + 1 };
    }));
  };

  const deleteEdge = (chainId: string, edgeId: string) => {
    setChains(prev => prev.map(c => {
      if (c.id !== chainId) return c;
      return { ...c, edges: c.edges.filter(e => e.id !== edgeId), edgeCount: c.edgeCount - 1 };
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'MCP工具', value: '40', active: '40运行中', icon: Wrench, color: 'blue' },
          { label: '本体链', value: chains.length.toString(), active: `${chains.filter(c => c.status === 'active').length}活跃`, icon: GitBranch, color: 'green' },
          { label: '数据源', value: '12', active: '已连接', icon: Database, color: 'purple' },
          { label: 'Skills', value: '8', active: '已配置', icon: Sparkles, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => {
                 if (stat.label === 'MCP工具') setActiveTab('mcp');
                 if (stat.label === '本体链') setActiveTab('ontology');
               }}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={20} className={`text-${stat.color}-500`} />
              <span className="text-xs text-gray-500">{stat.active}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('mcp')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">添加MCP工具</p>
              <p className="text-xs text-gray-500">配置新的工具接入</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ontology')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-lg transition-all text-left"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <GitBranch className="text-green-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">管理本体链</p>
              <p className="text-xs text-gray-500">编辑本体链结构</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-lg transition-all text-left"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">配置Skills</p>
              <p className="text-xs text-gray-500">定义业务技能</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMCPTools = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">MCP工具配置</h3>
          <p className="text-sm text-gray-500">管理和配置系统接入的MCP工具</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          <Plus size={18} />
          <span>添加工具</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mcpTools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <tool.icon className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                tool.status === 'active'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {tool.status === 'active' ? '运行中' : '已停用'}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
                <Edit3 size={16} />
              </button>
              <button className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOntologyList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">本体链管理</h3>
          <p className="text-sm text-gray-500">配置业务场景的本体链结构</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('ontology-studio')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <GitBranch size={18} />
            <span>本体配置器</span>
          </button>
          <button
            onClick={() => setOntologyView('template')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>从模板创建</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {chains.map((chain) => (
          <div key={chain.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                  <Workflow className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{chain.name}</h4>
                  <p className="text-sm text-gray-500">{chain.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-400">{chain.nodeCount} 个节点 · {chain.edgeCount} 条关系</span>
                    <span className="text-xs text-gray-400">{chain.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      chain.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {chain.status === 'active' ? '运行中' : '已停用'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedChain(chain); setOntologyView('detail'); }}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => { setSelectedChain(chain); setOntologyView('detail'); }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  查看
                </button>
                <button
                  onClick={() => deleteChain(chain.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOntologyTemplate = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">选择模板</h3>
          <p className="text-sm text-gray-500">从预置模板快速创建本体链（共10个产销场景）</p>
        </div>
        <button
          onClick={() => setOntologyView('list')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} />
          <span>取消</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(c => (
            <option key={c} value={c === '全部' ? 'all' : c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <template.icon className="text-blue-600" size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{template.category}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{template.chain.nodeCount} 个节点</span>
                  <span>{template.chain.edgeCount} 条关系</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 模板详情弹窗 */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[1000px] max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <selectedTemplate.icon className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-500">{selectedTemplate.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedTemplate(null); setSelectedTemplateNode(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* 左侧图谱区域 */}
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>

                <div className="bg-gray-50 rounded-xl border border-gray-200 h-[400px] relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                      {selectedTemplate.chain.nodeCount} 节点 · {selectedTemplate.chain.edgeCount} 关系
                    </span>
                  </div>
                  <OntologyGraph
                    nodes={selectedTemplate.chain.nodes}
                    edges={selectedTemplate.chain.edges}
                    onNodeClick={setSelectedTemplateNode}
                  />
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">节点列表</h4>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {selectedTemplate.chain.nodes.map(node => (
                      <div
                        key={node.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedTemplateNode?.id === node.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTemplateNode(node)}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: node.color }}
                        />
                        <span className="text-sm text-gray-700">{node.name}</span>
                        <span className="text-xs text-gray-400 px-2 py-0.5 bg-white rounded">
                          {node.type === 'entity' ? '实体' : node.type === 'attribute' ? '属性' : '关系'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧节点信息面板 - 与 OntologyStudio 100% 一致 */}
              <div style={{ width: 320, borderLeft: '1px solid var(--palantir-border)', background: 'var(--palantir-bg-page)', display: 'flex', flexDirection: 'column' }}>
                {selectedTemplateNode ? (
                  <>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--palantir-border)',
                      background: '#F8F9FA',
                    }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--palantir-text-muted)', marginBottom: 4 }}>
                        {selectedTemplateNode.type === 'entity' ? '实体类型' :
                         selectedTemplateNode.type === 'attribute' ? '属性类型' : '关系类型'}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {selectedTemplateNode.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--palantir-text-secondary)', fontFamily: 'monospace' }}>
                        ID: {selectedTemplateNode.id}
                      </div>
                    </div>

                    <Tabs
                      defaultSelectedTabId="general"
                      className="flex flex-col flex-1"
                    >
                      <Tab id="general" title="通用" panel={
                        <div style={{ padding: 16 }}>
                          <FormGroup label="显示名称">
                            <InputGroup
                              value={selectedTemplateNode.name}
                              readOnly
                              fill
                            />
                          </FormGroup>

                          <FormGroup label="实体类型">
                            <HTMLSelect
                              fill
                              value={selectedTemplateNode.type}
                              disabled
                              options={[
                                { label: '实体', value: 'entity' },
                                { label: '属性', value: 'attribute' },
                                { label: '关系', value: 'relation' },
                              ]}
                            />
                            <div style={{ marginTop: 4, fontSize: 10, color: 'var(--palantir-text-muted)' }}>
                              {selectedTemplateNode.type === 'entity' ? '具体对象：设备、订单' :
                               selectedTemplateNode.type === 'attribute' ? '对象的特征或属性' : '实体之间的关联'}
                            </div>
                          </FormGroup>

                          <FormGroup label="状态">
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Tag intent="success" minimal={false}>已验证</Tag>
                            </div>
                          </FormGroup>

                          <Divider />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--palantir-text-secondary)' }}>
                              属性 (2)
                            </span>
                          </div>

                          <Card style={{ padding: 10, marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 500 }}>类型</span>
                              <Tag minimal className="bp5-small">String</Tag>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--palantir-text-secondary)' }}>
                              {selectedTemplateNode.type}
                            </div>
                          </Card>

                          <Card style={{ padding: 10, marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 500 }}>位置坐标</span>
                              <Tag minimal className="bp5-small">Point</Tag>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--palantir-text-secondary)' }}>
                              X: {selectedTemplateNode.x}, Y: {selectedTemplateNode.y}
                            </div>
                          </Card>
                        </div>
                      } />

                      <Tab id="relations" title="关系" panel={
                        <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
                          <div style={{
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: 'var(--palantir-text-secondary)',
                            marginBottom: 12,
                          }}>
                            关联关系
                          </div>

                          {selectedTemplate.chain.edges
                            .filter(edge => edge.source === selectedTemplateNode.id || edge.target === selectedTemplateNode.id)
                            .length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--palantir-text-muted)', fontSize: 12 }}>
                              暂无关联关系
                            </div>
                          )}

                          {selectedTemplate.chain.edges
                            .filter(edge => edge.source === selectedTemplateNode.id || edge.target === selectedTemplateNode.id)
                            .map(edge => {
                              const isSource = edge.source === selectedTemplateNode.id;
                              const otherNode = isSource
                                ? selectedTemplate.chain.nodes.find(n => n.id === edge.target)
                                : selectedTemplate.chain.nodes.find(n => n.id === edge.source);
                              return (
                                <Card key={edge.id} style={{ padding: 12, marginBottom: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 10, color: 'var(--palantir-text-muted)' }}>
                                      {isSource ? '→ 指向' : '← 来自'}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 500 }}>{otherNode?.name}</span>
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--palantir-text-secondary)' }}>
                                    关系: {edge.label}
                                  </div>
                                </Card>
                              );
                            })}
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
                    color: 'var(--palantir-text-muted)',
                    padding: 20,
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#e1e8ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                      <GitBranch size={20} />
                    </div>
                    <div style={{ fontSize: 12 }}>点击节点查看详情</div>
                    <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>选择节点后配置属性与约束</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => { setSelectedTemplate(null); setSelectedTemplateNode(null); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => createChainFromTemplate(selectedTemplate)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                使用此模板创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOntologyDetail = () => {
    if (!selectedChain) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setOntologyView('list'); setSelectedChain(null); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedChain.name}</h3>
              <p className="text-sm text-gray-500">{selectedChain.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGraphScale(s => Math.min(s + 0.1, 2))}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="放大"
            >
              <ZoomIn size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => setGraphScale(s => Math.max(s - 0.1, 0.5))}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="缩小"
            >
              <ZoomOut size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => setGraphScale(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="重置"
            >
              <Maximize2 size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => setShowAddNodeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              <Plus size={18} />
              添加节点
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左侧：图谱 */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 h-[500px] relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500">
                缩放: {Math.round(graphScale * 100)}% · 拖动节点可调整位置
              </span>
            </div>
            <OntologyGraph
              nodes={selectedChain.nodes}
              edges={selectedChain.edges}
              onNodeClick={setEditingNode}
            />
          </div>

          {/* 右侧：节点/关系管理 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">节点 ({selectedChain.nodeCount})</h4>
                <button
                  onClick={() => setShowAddNodeModal(true)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus size={16} className="text-blue-500" />
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedChain.nodes.map(node => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setEditingNode(node)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: node.color }}
                      />
                      <span className="text-sm text-gray-700">{node.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNode(selectedChain.id, node.id); }}
                      className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">关系 ({selectedChain.edgeCount})</h4>
                <button
                  onClick={() => setShowAddEdgeModal(true)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus size={16} className="text-blue-500" />
                </button>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {selectedChain.edges.map(edge => {
                  const source = selectedChain.nodes.find(n => n.id === edge.source);
                  const target = selectedChain.nodes.find(n => n.id === edge.target);
                  return (
                    <div key={edge.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-gray-700 truncate">{source?.name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-blue-600">{edge.label}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-700 truncate">{target?.name}</span>
                      </div>
                      <button
                        onClick={() => deleteEdge(selectedChain.id, edge.id)}
                        className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 添加节点弹窗 */}
        {showAddNodeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">添加节点</h4>
              <AddNodeForm
                onSubmit={(node) => {
                  addNode(selectedChain.id, node);
                  setShowAddNodeModal(false);
                }}
                onCancel={() => setShowAddNodeModal(false)}
              />
            </div>
          </div>
        )}

        {/* 添加关系弹窗 */}
        {showAddEdgeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">添加关系</h4>
              <AddEdgeForm
                nodes={selectedChain.nodes}
                onSubmit={(edge) => {
                  addEdge(selectedChain.id, edge);
                  setShowAddEdgeModal(false);
                }}
                onCancel={() => setShowAddEdgeModal(false)}
              />
            </div>
          </div>
        )}

        {/* 编辑节点弹窗 */}
        {editingNode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">编辑节点</h4>
              <EditNodeForm
                node={editingNode}
                onSubmit={(updated) => {
                  setChains(prev => prev.map(c => {
                    if (c.id !== selectedChain.id) return c;
                    return {
                      ...c,
                      nodes: c.nodes.map(n => n.id === updated.id ? updated : n)
                    };
                  }));
                  setEditingNode(null);
                }}
                onCancel={() => setEditingNode(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOntology = () => {
    switch (ontologyView) {
      case 'template':
        return renderOntologyTemplate();
      case 'detail':
        return renderOntologyDetail();
      default:
        return renderOntologyList();
    }
  };

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">业务技能配置</h3>
          <p className="text-sm text-gray-500">定义系统可执行的业务技能</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          <Plus size={18} />
          <span>添加技能</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { name: '产能分析', desc: '分析产能瓶颈与利用率', icon: BarChart3 },
          { name: '排产推演', desc: '推演排产可行性', icon: Clock },
          { name: '异常检测', desc: '识别生产异常', icon: AlertCircle },
          { name: 'What-if模拟', desc: '模拟参数调整影响', icon: Zap },
          { name: 'OTIF优化', desc: '优化准时交付率', icon: Target },
          { name: '智能问答', desc: '回答生产相关问题', icon: MessageSquare },
        ].map((skill, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <skill.icon className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{skill.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                <Edit3 size={16} />
              </button>
              <button className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 5个锂电行业产销场景智能体
  const lithiumAgents = [
    {
      id: 'agent-001',
      name: '电池需求预测智能体',
      code: 'DemandForecastingAgent',
      description: '基于历史订单数据、市场趋势和季节性因素，智能预测锂电池未来需求，辅助制定生产计划和库存策略。',
      icon: Trending,
      status: 'active',
      lastRun: '10分钟前',
      accuracy: '94.2%',
      capabilities: [
        '时序数据分析（ARIMA/LSTM）',
        '多维度需求分解（车型/区域/季节）',
        '需求波动异常检测',
        '滚动预测更新（周/月/季度）'
      ],
      dataSources: ['ERP订单系统', 'CRM客户数据', '市场调研报告'],
      triggerConditions: ['每周一早8点自动执行', '订单量偏差>15%时触发'],
      color: 'blue'
    },
    {
      id: 'agent-002',
      name: '生产排程优化智能体',
      code: 'ProductionSchedulingAgent',
      description: '综合考虑设备产能、物料齐套、换型时间和交期约束，自动生成最优生产排程，减少换型损失和交期延误。',
      icon: CalendarDays,
      status: 'active',
      lastRun: '2小时前',
      efficiency: '+12.5%',
      capabilities: [
        '约束满足问题求解（CSP）',
        '遗传算法优化排程',
        '实时产能平衡调整',
        '紧急插单自动重排'
      ],
      dataSources: ['MES系统', '设备状态监控', '物料库存数据'],
      triggerConditions: ['每日凌晨执行', '紧急订单到达时', '设备故障时'],
      color: 'green'
    },
    {
      id: 'agent-003',
      name: '质量检测智能体',
      code: 'QualityInspectionAgent',
      description: '基于计算机视觉和机器学习，自动识别锂电池生产过程中的外观缺陷、尺寸偏差和电化学异常。',
      icon: ShieldCheck,
      status: 'active',
      lastRun: '实时运行',
      accuracy: '98.7%',
      capabilities: [
        '视觉缺陷检测（划痕/凹坑/污染）',
        '极片对齐度测量',
        '电解液注液量监控',
        '化成曲线异常识别'
      ],
      dataSources: ['工业相机', '光谱仪', '电化学测试设备'],
      triggerConditions: ['产线实时检测', '批量抽检时', '客诉反馈时'],
      color: 'purple'
    },
    {
      id: 'agent-004',
      name: '供应链风险预警智能体',
      code: 'SupplyChainRiskAgent',
      description: '实时监控锂盐、正极材料、电解液等关键原材料的供应状态、价格波动和地缘政治风险，提前预警供应中断。',
      icon: AlertTriangle,
      status: 'warning',
      lastRun: '30分钟前',
      riskLevel: '中等',
      capabilities: [
        '供应商交付监控（LT/OTD）',
        '原材料价格波动预警',
        '地缘政治风险评估',
        '替代供应商推荐'
      ],
      dataSources: ['SRM系统', '大宗商品价格API', '新闻舆情监控'],
      triggerConditions: ['每4小时扫描', '供应商延迟报警', '价格波动>5%'],
      color: 'orange'
    },
    {
      id: 'agent-005',
      name: '能耗优化智能体',
      code: 'EnergyOptimizationAgent',
      description: '分析涂布、辊压、分切、化成等高能耗工序的用电模式，优化峰谷平用电策略，降低单位能耗成本。',
      icon: Zap,
      status: 'active',
      lastRun: '1小时前',
      savings: '-8.3%',
      capabilities: [
        '工序能耗实时监控',
        '峰谷平用电优化',
        '设备待机功耗管理',
        '余热回收策略建议'
      ],
      dataSources: ['智能电表', '设备运行日志', '环境监测系统'],
      triggerConditions: ['每小时分析', '电费账单生成时', '能耗超标时'],
      color: 'cyan'
    }
  ];

  const renderAgent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">智能体配置中心</h3>
          <p className="text-sm text-gray-500">锂电行业产销场景专用AI智能体管理与监控</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Cpu size={18} />
            <span>智能体市场</span>
          </button>
          <button
            onClick={() => { setIsCreatingAgent(true); setEditingAgentId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>创建智能体</span>
          </button>
        </div>
      </div>

      {/* 智能体统计概览 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '运行中', value: '4', color: 'green', icon: CheckCircle },
          { label: '待处理告警', value: '1', color: 'orange', icon: AlertTriangle },
          { label: '今日执行', value: '156', color: 'blue', icon: BarChart2 },
          { label: '平均准确率', value: '96.4%', color: 'purple', icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={18} className={`text-${stat.color}-500`} />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 智能体列表 */}
      <div className="space-y-4">
        {lithiumAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden"
          >
            {/* 智能体头部 */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-${agent.color}-50 rounded-xl flex items-center justify-center`}>
                    <agent.icon className={`text-${agent.color}-600`} size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        agent.status === 'active'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-orange-100 text-orange-700 border border-orange-200'
                      }`}>
                        {agent.status === 'active' ? '运行中' : '告警'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{agent.code}</p>
                    <p className="text-sm text-gray-600 mt-2 max-w-2xl">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 关键指标 */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">最后执行:</span>
                  <span className="text-gray-700">{agent.lastRun}</span>
                </div>
                {agent.accuracy && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">准确率:</span>
                    <span className="text-green-600 font-medium">{agent.accuracy}</span>
                  </div>
                )}
                {agent.efficiency && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">效率提升:</span>
                    <span className="text-green-600 font-medium">{agent.efficiency}</span>
                  </div>
                )}
                {agent.savings && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">能耗节省:</span>
                    <span className="text-green-600 font-medium">{agent.savings}</span>
                  </div>
                )}
                {agent.riskLevel && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">风险等级:</span>
                    <span className="text-orange-600 font-medium">{agent.riskLevel}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 能力详情折叠区 */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    核心能力
                  </h5>
                  <ul className="space-y-1">
                    {agent.capabilities.map((cap, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    数据源
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.dataSources.map((source, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    触发条件
                  </h5>
                  <ul className="space-y-1">
                    {agent.triggerConditions.map((condition, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <Cpu size={12} />
                  查看日志
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <BarChart2 size={12} />
                  性能报表
                </button>
                <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors">
                  立即执行
                </button>
                <button
                  onClick={() => { setEditingAgentId(agent.id); setIsCreatingAgent(false); }}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs rounded-lg transition-colors"
                >
                  配置参数
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 如果正在编辑或创建智能体，显示编辑器
  if (editingAgentId || isCreatingAgent) {
    return (
      <AgentEditor
        agentId={editingAgentId || undefined}
        isCreating={isCreatingAgent}
        onNavigate={(page) => {
          if (page === 'settings') {
            setEditingAgentId(null);
            setIsCreatingAgent(false);
          } else {
            onNavigate(page);
          }
        }}
        onSave={(agent) => {
          console.log('保存智能体:', agent);
          setEditingAgentId(null);
          setIsCreatingAgent(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Settings className="text-white" size={18} />
          </div>
          <div>
            <span className="text-base font-semibold text-gray-900">系统配置</span>
            <span className="text-xs text-gray-500 ml-2 font-mono">v2.1.0</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: '概览', icon: BarChart3 },
              { id: 'mcp', label: 'MCP工具', icon: Wrench },
              { id: 'ontology', label: '本体链', icon: GitBranch },
              { id: 'skills', label: '业务技能', icon: Sparkles },
              { id: 'agent', label: '智能体', icon: Brain },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-blue-600 border border-gray-200 shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:border hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'mcp' && renderMCPTools()}
            {activeTab === 'ontology' && renderOntology()}
            {activeTab === 'skills' && renderSkills()}
            {activeTab === 'agent' && renderAgent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// 表单组件
function AddNodeForm({ onSubmit, onCancel }: { onSubmit: (node: any) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('entity');
  const [color, setColor] = useState('#3b82f6');

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入节点名称"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">节点类型</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="entity">实体</option>
          <option value="attribute">属性</option>
          <option value="relation">关系</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
        <div className="flex gap-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit({ name, type, x: 300, y: 200, color })}
          disabled={!name}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          添加
        </button>
      </div>
    </div>
  );
}

function AddEdgeForm({ nodes, onSubmit, onCancel }: { nodes: OntologyNode[]; onSubmit: (edge: any) => void; onCancel: () => void }) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">源节点</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">选择源节点</option>
          {nodes.map(n => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">目标节点</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">选择目标节点</option>
          {nodes.map(n => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">关系名称</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="如：包含、影响、导致"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit({ source, target, label })}
          disabled={!source || !target || !label}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          添加
        </button>
      </div>
    </div>
  );
}

function EditNodeForm({ node, onSubmit, onCancel }: { node: OntologyNode; onSubmit: (node: OntologyNode) => void; onCancel: () => void }) {
  const [name, setName] = useState(node.name);
  const [color, setColor] = useState(node.color || '#3b82f6');

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
        <div className="flex gap-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit({ ...node, name, color })}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          保存
        </button>
      </div>
    </div>
  );
}
