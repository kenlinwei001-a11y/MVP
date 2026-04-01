// ============================================================================
// 大型锂电制造企业本体树 - 完整数字孪生本体体系
// 目标：通过本体理解数据+业务+规则+对象，实现数字模拟推演真实物理世界
// ============================================================================

export interface OntologyNode {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  level: 'domain' | 'subdomain' | 'entity' | 'attribute';
  parentId?: string;
  properties: Array<{
    key: string;
    displayName: string;
    dataType: 'string' | 'number' | 'boolean' | 'datetime' | 'enum' | 'reference';
    unit?: string;
    required?: boolean;
    description?: string;
    referenceTo?: string; // 引用其他本体ID
  }>;
  relations: Array<{
    targetId: string;
    relationType: string;
    cardinality: '1:1' | '1:N' | 'N:1' | 'N:N';
    description: string;
  }>;
  businessRules?: string[]; // 关联的业务规则
  digitalTwinMapping?: { // 数字孪生映射
    physicalEntity: string;
    dataSource: string;
    realTimeAttributes: string[];
  };
  children?: OntologyNode[];
}

// ============================================================================
// 1. 组织资源域 (Organization & Resource)
// 描述：企业组织架构、人员、班组、技能等基础资源
// ============================================================================
const organizationDomain: OntologyNode = {
  id: 'domain-org',
  name: 'Organization',
  displayName: '组织资源域',
  description: '企业组织架构、人员、班组、技能等基础资源管理',
  icon: 'building',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'org-company',
      name: 'Company',
      displayName: '公司',
      description: '集团/公司级组织单元',
      icon: 'building',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'company_code', displayName: '公司编码', dataType: 'string', required: true },
        { key: 'company_name', displayName: '公司名称', dataType: 'string', required: true },
        { key: 'company_type', displayName: '公司类型', dataType: 'enum', description: '集团/子公司/事业部' },
        { key: 'legal_person', displayName: '法人代表', dataType: 'string' },
        { key: 'business_license', displayName: '营业执照', dataType: 'string' },
        { key: 'tax_code', displayName: '统一社会信用代码', dataType: 'string' },
      ],
      relations: [
        { targetId: 'org-base', relationType: 'contains', cardinality: '1:N', description: '公司包含基地' },
      ],
    },
    {
      id: 'org-base',
      name: 'Base',
      displayName: '制造基地',
      description: '制造基地/园区，包含多个工厂',
      icon: 'map-pin',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'base_code', displayName: '基地编码', dataType: 'string', required: true },
        { key: 'base_name', displayName: '基地名称', dataType: 'string', required: true },
        { key: 'location', displayName: '地理位置', dataType: 'string' },
        { key: 'total_area', displayName: '占地面积', dataType: 'number', unit: '㎡' },
        { key: 'total_capacity', displayName: '总产能', dataType: 'number', unit: 'GWh/年' },
        { key: 'employee_count', displayName: '员工数量', dataType: 'number', unit: '人' },
        { key: 'established_date', displayName: '投产日期', dataType: 'datetime' },
      ],
      relations: [
        { targetId: 'org-factory', relationType: 'contains', cardinality: '1:N', description: '基地包含工厂' },
        { targetId: 'org-warehouse', relationType: 'contains', cardinality: '1:N', description: '基地包含仓库' },
      ],
      digitalTwinMapping: {
        physicalEntity: '物理制造基地',
        dataSource: 'EMS/BAS系统',
        realTimeAttributes: ['能耗', '环境温湿度', '安防状态'],
      },
    },
    {
      id: 'org-factory',
      name: 'Factory',
      displayName: '工厂',
      description: '独立核算的制造工厂',
      icon: 'factory',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'factory_code', displayName: '工厂编码', dataType: 'string', required: true },
        { key: 'factory_name', displayName: '工厂名称', dataType: 'string', required: true },
        { key: 'factory_type', displayName: '工厂类型', dataType: 'enum', description: '极片/电芯/模组PACK' },
        { key: 'process_segment', displayName: '工艺段', dataType: 'enum', description: '前段/中段/后段' },
        { key: 'annual_capacity', displayName: '年产能', dataType: 'number', unit: 'GWh' },
        { key: 'workshop_count', displayName: '车间数量', dataType: 'number', unit: '个' },
        { key: 'manager', displayName: '工厂负责人', dataType: 'reference', referenceTo: 'org-employee' },
      ],
      relations: [
        { targetId: 'org-workshop', relationType: 'contains', cardinality: '1:N', description: '工厂包含车间' },
        { targetId: 'res-production-line', relationType: 'operates', cardinality: '1:N', description: '工厂运营产线' },
      ],
    },
    {
      id: 'org-workshop',
      name: 'Workshop',
      displayName: '车间',
      description: '制造车间，包含多条产线',
      icon: 'home',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'workshop_code', displayName: '车间编码', dataType: 'string', required: true },
        { key: 'workshop_name', displayName: '车间名称', dataType: 'string', required: true },
        { key: 'workshop_type', displayName: '车间类型', dataType: 'enum', description: '搅拌/涂布/辊压/卷绕/装配/化成/PACK' },
        { key: 'area', displayName: '面积', dataType: 'number', unit: '㎡' },
        { key: 'cleanliness_level', displayName: '洁净度等级', dataType: 'enum', description: '万级/十万级/三十万级' },
        { key: 'line_count', displayName: '产线数量', dataType: 'number', unit: '条' },
      ],
      relations: [
        { targetId: 'res-production-line', relationType: 'contains', cardinality: '1:N', description: '车间包含产线' },
        { targetId: 'org-workteam', relationType: 'assigns', cardinality: '1:N', description: '车间分配班组' },
      ],
    },
    {
      id: 'org-employee',
      name: 'Employee',
      displayName: '员工',
      description: '企业员工信息',
      icon: 'user',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'employee_code', displayName: '工号', dataType: 'string', required: true },
        { key: 'name', displayName: '姓名', dataType: 'string', required: true },
        { key: 'department', displayName: '部门', dataType: 'reference', referenceTo: 'org-workshop' },
        { key: 'position', displayName: '岗位', dataType: 'string' },
        { key: 'skill_level', displayName: '技能等级', dataType: 'enum', description: '初级/中级/高级/技师' },
        { key: 'certifications', displayName: '持证情况', dataType: 'string' },
        { key: 'entry_date', displayName: '入职日期', dataType: 'datetime' },
      ],
      relations: [
        { targetId: 'org-workteam', relationType: 'belongs_to', cardinality: 'N:1', description: '员工属于班组' },
      ],
    },
    {
      id: 'org-workteam',
      name: 'WorkTeam',
      displayName: '班组',
      description: '生产作业班组',
      icon: 'users',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'team_code', displayName: '班组编码', dataType: 'string', required: true },
        { key: 'team_name', displayName: '班组名称', dataType: 'string', required: true },
        { key: 'shift_type', displayName: '班次类型', dataType: 'reference', referenceTo: 'org-shift' },
        { key: 'leader', displayName: '班组长', dataType: 'reference', referenceTo: 'org-employee' },
        { key: 'member_count', displayName: '人数', dataType: 'number', unit: '人' },
        { key: 'skill_matrix', displayName: '技能矩阵', dataType: 'string' },
      ],
      relations: [
        { targetId: 'org-shift', relationType: 'works_on', cardinality: 'N:1', description: '班组工作于班次' },
        { targetId: 'res-production-line', relationType: 'operates', cardinality: 'N:N', description: '班组操作产线' },
      ],
    },
    {
      id: 'org-shift',
      name: 'Shift',
      displayName: '班次',
      description: '生产班次定义',
      icon: 'clock',
      level: 'entity',
      parentId: 'domain-org',
      properties: [
        { key: 'shift_code', displayName: '班次编码', dataType: 'string', required: true },
        { key: 'shift_name', displayName: '班次名称', dataType: 'string', required: true },
        { key: 'start_time', displayName: '开始时间', dataType: 'string' },
        { key: 'end_time', displayName: '结束时间', dataType: 'string' },
        { key: 'effective_hours', displayName: '有效工时', dataType: 'number', unit: '小时' },
        { key: 'is_workday', displayName: '是否工作日', dataType: 'boolean' },
      ],
      relations: [],
      businessRules: ['班次时间不得重叠', '每个班组必须分配一个班次'],
    },
  ],
};

// ============================================================================
// 2. 产能设备域 (Capacity & Equipment)
// 描述：产线、工位、设备、模具等产能资源
// ============================================================================
const capacityDomain: OntologyNode = {
  id: 'domain-cap',
  name: 'Capacity',
  displayName: '产能设备域',
  description: '产线、工位、设备、模具等产能资源管理',
  icon: 'cpu',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'res-production-line',
      name: 'ProductionLine',
      displayName: '生产线',
      description: '制造产线，产能计算的基本单元',
      icon: 'zap',
      level: 'entity',
      parentId: 'domain-cap',
      properties: [
        { key: 'line_code', displayName: '产线编码', dataType: 'string', required: true },
        { key: 'line_name', displayName: '产线名称', dataType: 'string', required: true },
        { key: 'line_type', displayName: '产线类型', dataType: 'enum', description: '涂布线/卷绕线/装配线/化成线/PACK线' },
        { key: 'workshop', displayName: '所属车间', dataType: 'reference', referenceTo: 'org-workshop' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '运行/停机/维护/调试' },
        { key: 'max_capacity_daily', displayName: '日最大产能', dataType: 'number', unit: '件/天' },
        { key: 'rated_speed', displayName: '额定速度', dataType: 'number', unit: 'm/min或ppm' },
        { key: 'oee_target', displayName: 'OEE目标', dataType: 'number', unit: '%' },
        { key: 'current_oee', displayName: '当前OEE', dataType: 'number', unit: '%' },
      ],
      relations: [
        { targetId: 'res-workstation', relationType: 'contains', cardinality: '1:N', description: '产线包含工位' },
        { targetId: 'prod-process-route', relationType: 'executes', cardinality: 'N:1', description: '产线执行工艺路线' },
      ],
      digitalTwinMapping: {
        physicalEntity: '物理产线',
        dataSource: 'MES/SCADA',
        realTimeAttributes: ['运行状态', '当前产量', 'OEE', '能耗'],
      },
    },
    {
      id: 'res-workstation',
      name: 'WorkStation',
      displayName: '工位',
      description: '产线上的具体作业工位',
      icon: 'activity',
      level: 'entity',
      parentId: 'domain-cap',
      properties: [
        { key: 'station_code', displayName: '工位编码', dataType: 'string', required: true },
        { key: 'station_name', displayName: '工位名称', dataType: 'string', required: true },
        { key: 'sequence', displayName: '工序序号', dataType: 'number' },
        { key: 'cycle_time', displayName: '节拍时间', dataType: 'number', unit: '秒' },
        { key: 'takt_time', displayName: '节拍(Takt Time)', dataType: 'number', unit: '秒' },
        { key: 'automation_level', displayName: '自动化等级', dataType: 'enum', description: '全自动/半自动/手工' },
        { key: 'operator_count', displayName: '操作人数', dataType: 'number', unit: '人' },
      ],
      relations: [
        { targetId: 'res-equipment', relationType: 'utilizes', cardinality: '1:N', description: '工位使用设备' },
        { targetId: 'prod-process-step', relationType: 'executes', cardinality: '1:1', description: '工位执行工序' },
      ],
    },
    {
      id: 'res-equipment',
      name: 'Equipment',
      displayName: '设备',
      description: '生产设备和关键设备',
      icon: 'settings',
      level: 'entity',
      parentId: 'domain-cap',
      properties: [
        { key: 'equipment_code', displayName: '设备编码', dataType: 'string', required: true },
        { key: 'equipment_name', displayName: '设备名称', dataType: 'string', required: true },
        { key: 'equipment_type', displayName: '设备类型', dataType: 'enum', description: '涂布机/卷绕机/叠片机/注液机/化成柜' },
        { key: 'model', displayName: '设备型号', dataType: 'string' },
        { key: 'manufacturer', displayName: '制造商', dataType: 'string' },
        { key: 'serial_number', displayName: '序列号', dataType: 'string' },
        { key: 'purchase_date', displayName: '购置日期', dataType: 'datetime' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '运行/待机/维护/故障' },
        { key: 'availability', displayName: '可用率', dataType: 'number', unit: '%' },
        { key: 'mtbf', displayName: 'MTBF', dataType: 'number', unit: '小时' },
        { key: 'mttr', displayName: 'MTTR', dataType: 'number', unit: '小时' },
      ],
      relations: [
        { targetId: 'res-mold', relationType: 'uses', cardinality: '1:N', description: '设备使用模具' },
      ],
      digitalTwinMapping: {
        physicalEntity: '物理设备',
        dataSource: 'PLC/SCADA',
        realTimeAttributes: ['运行状态', '速度', '温度', '压力', '电流', '产量计数'],
      },
    },
    {
      id: 'res-mold',
      name: 'Mold',
      displayName: '模具',
      description: '生产用模具、夹具',
      icon: 'box',
      level: 'entity',
      parentId: 'domain-cap',
      properties: [
        { key: 'mold_code', displayName: '模具编码', dataType: 'string', required: true },
        { key: 'mold_name', displayName: '模具名称', dataType: 'string', required: true },
        { key: 'mold_type', displayName: '模具类型', dataType: 'enum', description: '极片模切模/卷针/壳体模具' },
        { key: 'cavities', displayName: '模腔数', dataType: 'number', unit: '腔' },
        { key: 'max_shots', displayName: '最大寿命', dataType: 'number', unit: '次' },
        { key: 'current_shots', displayName: '当前次数', dataType: 'number', unit: '次' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '在用/保养/维修/报废' },
      ],
      relations: [
        { targetId: 'prod-product-model', relationType: 'produces', cardinality: 'N:N', description: '模具生产产品' },
      ],
    },
  ],
};

// ============================================================================
// 3. 产品工艺域 (Product & Process)
// 描述：产品型号、BOM、工艺路线、工序、质量标准
// ============================================================================
const productDomain: OntologyNode = {
  id: 'domain-prod',
  name: 'Product',
  displayName: '产品工艺域',
  description: '产品型号、BOM、工艺路线、工序、质量标准定义',
  icon: 'battery',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'prod-product-family',
      name: 'ProductFamily',
      displayName: '产品系列',
      description: '产品系列/族',
      icon: 'layers',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'family_code', displayName: '系列编码', dataType: 'string', required: true },
        { key: 'family_name', displayName: '系列名称', dataType: 'string', required: true },
        { key: 'application', displayName: '应用场景', dataType: 'enum', description: '动力/储能/消费' },
        { key: 'cell_type', displayName: '电芯类型', dataType: 'enum', description: '方形/圆柱/软包' },
        { key: 'cathode_system', displayName: '正极体系', dataType: 'enum', description: 'LFP/NCM/LMO' },
      ],
      relations: [
        { targetId: 'prod-product-model', relationType: 'contains', cardinality: '1:N', description: '系列包含型号' },
      ],
    },
    {
      id: 'prod-product-model',
      name: 'ProductModel',
      displayName: '产品型号',
      description: '具体产品型号定义',
      icon: 'battery',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'model_code', displayName: '型号编码', dataType: 'string', required: true },
        { key: 'model_name', displayName: '型号名称', dataType: 'string', required: true },
        { key: 'nominal_capacity', displayName: '额定容量', dataType: 'number', unit: 'Ah' },
        { key: 'nominal_voltage', displayName: '额定电压', dataType: 'number', unit: 'V' },
        { key: 'energy_density', displayName: '能量密度', dataType: 'number', unit: 'Wh/kg' },
        { key: 'cycle_life', displayName: '循环寿命', dataType: 'number', unit: '次' },
        { key: 'dimensions', displayName: '外形尺寸', dataType: 'string', unit: 'mm' },
        { key: 'weight', displayName: '重量', dataType: 'number', unit: 'g' },
        { key: 'production_lead_time', displayName: '生产周期', dataType: 'number', unit: '天' },
      ],
      relations: [
        { targetId: 'prod-bom', relationType: 'has_bom', cardinality: '1:1', description: '型号有BOM' },
        { targetId: 'prod-process-route', relationType: 'has_route', cardinality: '1:N', description: '型号有工艺路线' },
        { targetId: 'quality-standard', relationType: 'governed_by', cardinality: '1:N', description: '型号受质量标准管控' },
      ],
    },
    {
      id: 'prod-bom',
      name: 'BOM',
      displayName: '物料清单',
      description: '产品BOM定义',
      icon: 'list',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'bom_code', displayName: 'BOM编码', dataType: 'string', required: true },
        { key: 'version', displayName: '版本', dataType: 'string', required: true },
        { key: 'effective_date', displayName: '生效日期', dataType: 'datetime' },
        { key: 'expire_date', displayName: '失效日期', dataType: 'datetime' },
        { key: 'component_count', displayName: '组件数量', dataType: 'number', unit: '种' },
        { key: 'material_cost', displayName: '材料成本', dataType: 'number', unit: '元' },
      ],
      relations: [
        { targetId: 'prod-bom-line', relationType: 'consists_of', cardinality: '1:N', description: 'BOM包含行项' },
      ],
    },
    {
      id: 'prod-bom-line',
      name: 'BOMLine',
      displayName: 'BOM行项',
      description: 'BOM组件明细',
      icon: 'list',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'line_no', displayName: '行号', dataType: 'number' },
        { key: 'material', displayName: '物料', dataType: 'reference', referenceTo: 'supply-material' },
        { key: 'quantity', displayName: '用量', dataType: 'number' },
        { key: 'unit', displayName: '单位', dataType: 'string' },
        { key: 'is_key_component', displayName: '是否关键件', dataType: 'boolean' },
      ],
      relations: [
        { targetId: 'supply-material', relationType: 'references', cardinality: 'N:1', description: '引用物料' },
      ],
    },
    {
      id: 'prod-process-route',
      name: 'ProcessRoute',
      displayName: '工艺路线',
      description: '制造工艺路线',
      icon: 'git-branch',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'route_code', displayName: '路线编码', dataType: 'string', required: true },
        { key: 'route_name', displayName: '路线名称', dataType: 'string', required: true },
        { key: 'version', displayName: '版本', dataType: 'string' },
        { key: 'process_count', displayName: '工序数', dataType: 'number', unit: '道' },
        { key: 'total_ct', displayName: '总CT', dataType: 'number', unit: '秒' },
        { key: 'yield_target', displayName: '良率目标', dataType: 'number', unit: '%' },
      ],
      relations: [
        { targetId: 'prod-process-step', relationType: 'consists_of', cardinality: '1:N', description: '路线包含工序' },
      ],
    },
    {
      id: 'prod-process-step',
      name: 'ProcessStep',
      displayName: '工序',
      description: '工艺工序定义',
      icon: 'arrow-right',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'step_code', displayName: '工序编码', dataType: 'string', required: true },
        { key: 'step_name', displayName: '工序名称', dataType: 'string', required: true },
        { key: 'sequence', displayName: '序号', dataType: 'number' },
        { key: 'standard_time', displayName: '标准工时', dataType: 'number', unit: '分钟' },
        { key: 'work_center', displayName: '工作中心', dataType: 'reference', referenceTo: 'org-workshop' },
        { key: 'is_quality_gate', displayName: '是否质检点', dataType: 'boolean' },
        { key: 'is_key_process', displayName: '是否关键工序', dataType: 'boolean' },
      ],
      relations: [
        { targetId: 'res-workstation', relationType: 'executed_at', cardinality: 'N:1', description: '工序执行于工位' },
        { targetId: 'prod-work-instruction', relationType: 'has_instruction', cardinality: '1:1', description: '工序有作业指导书' },
      ],
    },
    {
      id: 'prod-work-instruction',
      name: 'WorkInstruction',
      displayName: '作业指导书',
      description: 'SOP作业指导书',
      icon: 'file-text',
      level: 'entity',
      parentId: 'domain-prod',
      properties: [
        { key: 'wi_code', displayName: 'WI编码', dataType: 'string', required: true },
        { key: 'version', displayName: '版本', dataType: 'string' },
        { key: 'content', displayName: '内容', dataType: 'string' },
        { key: 'attachment', displayName: '附件', dataType: 'string' },
      ],
      relations: [],
    },
  ],
};

// ============================================================================
// 4. 供应链域 (Supply Chain)
// 描述：供应商、物料、仓库、库位、库存
// ============================================================================
const supplyDomain: OntologyNode = {
  id: 'domain-supply',
  name: 'SupplyChain',
  displayName: '供应链域',
  description: '供应商、物料、仓库、库位、库存管理',
  icon: 'truck',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'supply-supplier',
      name: 'Supplier',
      displayName: '供应商',
      description: '物料供应商',
      icon: 'truck',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'supplier_code', displayName: '供应商编码', dataType: 'string', required: true },
        { key: 'supplier_name', displayName: '供应商名称', dataType: 'string', required: true },
        { key: 'supplier_type', displayName: '供应商类型', dataType: 'enum', description: '战略/优选/合格/临时' },
        { key: 'supply_category', displayName: '供货品类', dataType: 'string' },
        { key: 'cooperation_level', displayName: '合作等级', dataType: 'enum', description: '战略/核心/一般' },
        { key: 'monthly_capacity', displayName: '月产能', dataType: 'number' },
        { key: 'lead_time', displayName: '提前期', dataType: 'number', unit: '天' },
        { key: 'quality_rating', displayName: '质量评级', dataType: 'enum', description: 'A/B/C/D' },
      ],
      relations: [
        { targetId: 'supply-material', relationType: 'supplies', cardinality: '1:N', description: '供应商供货' },
        { targetId: 'supply-po', relationType: 'receives', cardinality: '1:N', description: '供应商接收订单' },
      ],
    },
    {
      id: 'supply-material-category',
      name: 'MaterialCategory',
      displayName: '物料分类',
      description: '物料分类体系',
      icon: 'folder',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'category_code', displayName: '分类编码', dataType: 'string', required: true },
        { key: 'category_name', displayName: '分类名称', dataType: 'string', required: true },
        { key: 'category_level', displayName: '分类层级', dataType: 'number' },
        { key: 'parent_category', displayName: '父分类', dataType: 'reference', referenceTo: 'supply-material-category' },
      ],
      relations: [
        { targetId: 'supply-material', relationType: 'classifies', cardinality: '1:N', description: '分类包含物料' },
      ],
    },
    {
      id: 'supply-material',
      name: 'Material',
      displayName: '物料',
      description: '物料主数据',
      icon: 'box',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'material_code', displayName: '物料编码', dataType: 'string', required: true },
        { key: 'material_name', displayName: '物料名称', dataType: 'string', required: true },
        { key: 'specification', displayName: '规格型号', dataType: 'string' },
        { key: 'category', displayName: '分类', dataType: 'reference', referenceTo: 'supply-material-category' },
        { key: 'unit', displayName: '单位', dataType: 'string' },
        { key: 'safety_stock', displayName: '安全库存', dataType: 'number' },
        { key: 'max_stock', displayName: '最大库存', dataType: 'number' },
        { key: 'reorder_point', displayName: '再订货点', dataType: 'number' },
        { key: 'shelf_life', displayName: '保质期', dataType: 'number', unit: '天' },
        { key: 'abc_class', displayName: 'ABC分类', dataType: 'enum', description: 'A/B/C' },
      ],
      relations: [
        { targetId: 'supply-supplier', relationType: 'supplied_by', cardinality: 'N:1', description: '物料由供应商供货' },
        { targetId: 'supply-inventory', relationType: 'stored_as', cardinality: '1:N', description: '物料存储为库存' },
        { targetId: 'quality-iqc-record', relationType: 'inspected_via', cardinality: '1:N', description: '物料被检验' },
      ],
    },
    {
      id: 'org-warehouse',
      name: 'Warehouse',
      displayName: '仓库',
      description: '仓库定义',
      icon: 'home',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'warehouse_code', displayName: '仓库编码', dataType: 'string', required: true },
        { key: 'warehouse_name', displayName: '仓库名称', dataType: 'string', required: true },
        { key: 'warehouse_type', displayName: '仓库类型', dataType: 'enum', description: '原材料仓/半成品仓/成品仓/辅料仓' },
        { key: 'base', displayName: '所属基地', dataType: 'reference', referenceTo: 'org-base' },
        { key: 'area', displayName: '面积', dataType: 'number', unit: '㎡' },
        { key: 'capacity', displayName: '容量', dataType: 'number', unit: '托' },
        { key: 'temperature_zone', displayName: '温区', dataType: 'enum', description: '常温/恒温/冷藏/冷冻' },
      ],
      relations: [
        { targetId: 'supply-location', relationType: 'contains', cardinality: '1:N', description: '仓库包含库位' },
        { targetId: 'supply-inventory', relationType: 'stores', cardinality: '1:N', description: '仓库存储库存' },
      ],
    },
    {
      id: 'supply-location',
      name: 'Location',
      displayName: '库位',
      description: '仓库库位定义',
      icon: 'map-pin',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'location_code', displayName: '库位编码', dataType: 'string', required: true },
        { key: 'zone', displayName: '区域', dataType: 'string' },
        { key: 'aisle', displayName: '巷道', dataType: 'string' },
        { key: 'shelf', displayName: '货架', dataType: 'string' },
        { key: 'layer', displayName: '层', dataType: 'string' },
        { key: 'location_type', displayName: '库位类型', dataType: 'enum', description: '收货/存储/拣货/发货/不良' },
        { key: 'max_weight', displayName: '最大承重', dataType: 'number', unit: 'kg' },
        { key: 'is_occupied', displayName: '是否占用', dataType: 'boolean' },
      ],
      relations: [
        { targetId: 'supply-inventory', relationType: 'holds', cardinality: '1:N', description: '库位存放库存' },
      ],
    },
    {
      id: 'supply-inventory',
      name: 'Inventory',
      displayName: '库存',
      description: '库存记录',
      icon: 'database',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'inventory_id', displayName: '库存ID', dataType: 'string', required: true },
        { key: 'material', displayName: '物料', dataType: 'reference', referenceTo: 'supply-material' },
        { key: 'batch_no', displayName: '批次号', dataType: 'string' },
        { key: 'quantity', displayName: '数量', dataType: 'number' },
        { key: 'unit', displayName: '单位', dataType: 'string' },
        { key: 'warehouse', displayName: '仓库', dataType: 'reference', referenceTo: 'org-warehouse' },
        { key: 'location', displayName: '库位', dataType: 'reference', referenceTo: 'supply-location' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '合格/待检/冻结/不良' },
        { key: 'receipt_date', displayName: '入库日期', dataType: 'datetime' },
        { key: 'expiry_date', displayName: '有效期至', dataType: 'datetime' },
      ],
      relations: [
        { targetId: 'supply-material', relationType: 'is', cardinality: 'N:1', description: '库存是物料' },
        { targetId: 'mfg-wip', relationType: 'becomes', cardinality: '1:1', description: '库存可转化为在制品' },
      ],
      digitalTwinMapping: {
        physicalEntity: '物理库存',
        dataSource: 'WMS',
        realTimeAttributes: ['实时数量', '位置', '状态'],
      },
    },
    {
      id: 'supply-po',
      name: 'PurchaseOrder',
      displayName: '采购订单',
      description: '采购订单',
      icon: 'file-text',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'po_no', displayName: '采购订单号', dataType: 'string', required: true },
        { key: 'supplier', displayName: '供应商', dataType: 'reference', referenceTo: 'supply-supplier' },
        { key: 'order_date', displayName: '订单日期', dataType: 'datetime' },
        { key: 'delivery_date', displayName: '交货日期', dataType: 'datetime' },
        { key: 'total_amount', displayName: '订单金额', dataType: 'number', unit: '元' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '新建/已确认/已发货/已收货/已关闭' },
      ],
      relations: [
        { targetId: 'supply-po-line', relationType: 'contains', cardinality: '1:N', description: '订单包含行项' },
      ],
    },
    {
      id: 'supply-po-line',
      name: 'POLine',
      displayName: '采购订单行项',
      description: '采购订单明细',
      icon: 'list',
      level: 'entity',
      parentId: 'domain-supply',
      properties: [
        { key: 'line_no', displayName: '行号', dataType: 'number' },
        { key: 'material', displayName: '物料', dataType: 'reference', referenceTo: 'supply-material' },
        { key: 'quantity', displayName: '数量', dataType: 'number' },
        { key: 'unit_price', displayName: '单价', dataType: 'number', unit: '元' },
        { key: 'amount', displayName: '金额', dataType: 'number', unit: '元' },
      ],
      relations: [],
    },
  ],
};

// ============================================================================
// 5. 生产执行域 (Manufacturing Execution)
// 描述：生产计划、工单、在制品、完工入库
// ============================================================================
const manufacturingDomain: OntologyNode = {
  id: 'domain-mfg',
  name: 'Manufacturing',
  displayName: '生产执行域',
  description: '生产计划、工单、在制品、完工入库管理',
  icon: 'settings',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'mfg-production-plan',
      name: 'ProductionPlan',
      displayName: '生产计划',
      description: '主生产计划MPS',
      icon: 'calendar',
      level: 'entity',
      parentId: 'domain-mfg',
      properties: [
        { key: 'plan_no', displayName: '计划编号', dataType: 'string', required: true },
        { key: 'plan_period', displayName: '计划周期', dataType: 'string' },
        { key: 'product_model', displayName: '产品型号', dataType: 'reference', referenceTo: 'prod-product-model' },
        { key: 'planned_quantity', displayName: '计划数量', dataType: 'number' },
        { key: 'planned_start', displayName: '计划开工', dataType: 'datetime' },
        { key: 'planned_end', displayName: '计划完工', dataType: 'datetime' },
        { key: 'capacity_allocation', displayName: '产能分配', dataType: 'number', unit: '%' },
      ],
      relations: [
        { targetId: 'mfg-work-order', relationType: 'decomposes_into', cardinality: '1:N', description: '计划分解为工单' },
        { targetId: 'cap-capacity-requirement', relationType: 'drives', cardinality: '1:N', description: '计划驱生产能需求' },
      ],
    },
    {
      id: 'mfg-work-order',
      name: 'WorkOrder',
      displayName: '生产工单',
      description: '生产执行工单',
      icon: 'file-text',
      level: 'entity',
      parentId: 'domain-mfg',
      properties: [
        { key: 'wo_no', displayName: '工单号', dataType: 'string', required: true },
        { key: 'source_so', displayName: '来源订单', dataType: 'reference', referenceTo: 'sale-sales-order' },
        { key: 'product_model', displayName: '产品型号', dataType: 'reference', referenceTo: 'prod-product-model' },
        { key: 'planned_quantity', displayName: '计划数量', dataType: 'number' },
        { key: 'actual_quantity', displayName: '实际数量', dataType: 'number' },
        { key: 'planned_start', displayName: '计划开工', dataType: 'datetime' },
        { key: 'planned_end', displayName: '计划完工', dataType: 'datetime' },
        { key: 'actual_start', displayName: '实际开工', dataType: 'datetime' },
        { key: 'actual_end', displayName: '实际完工', dataType: 'datetime' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '新建/已下达/生产中/已完工/已关闭' },
      ],
      relations: [
        { targetId: 'res-production-line', relationType: 'assigned_to', cardinality: 'N:1', description: '工单分配产线' },
        { targetId: 'mfg-wip', relationType: 'produces', cardinality: '1:N', description: '工单产生在制品' },
        { targetId: 'supply-inventory', relationType: 'consumes', cardinality: 'N:N', description: '工单消耗物料' },
      ],
    },
    {
      id: 'mfg-wip',
      name: 'WIP',
      displayName: '在制品',
      description: '在制品跟踪',
      icon: 'loader',
      level: 'entity',
      parentId: 'domain-mfg',
      properties: [
        { key: 'wip_id', displayName: 'WIP ID', dataType: 'string', required: true },
        { key: 'work_order', displayName: '所属工单', dataType: 'reference', referenceTo: 'mfg-work-order' },
        { key: 'current_process', displayName: '当前工序', dataType: 'reference', referenceTo: 'prod-process-step' },
        { key: 'current_workstation', displayName: '当前工位', dataType: 'reference', referenceTo: 'res-workstation' },
        { key: 'quantity', displayName: '数量', dataType: 'number' },
        { key: 'wip_status', displayName: '在制状态', dataType: 'enum', description: '加工中/待转移/质检中/返工' },
        { key: 'enter_time', displayName: '进入时间', dataType: 'datetime' },
      ],
      relations: [
        { targetId: 'prod-process-step', relationType: 'at', cardinality: 'N:1', description: 'WIP在某工序' },
        { targetId: 'quality-qc-record', relationType: 'inspected_by', cardinality: '1:N', description: 'WIP被检验' },
      ],
      digitalTwinMapping: {
        physicalEntity: '物理在制品',
        dataSource: 'MES/RFID',
        realTimeAttributes: ['实时位置', '当前工序', '加工状态'],
      },
    },
    {
      id: 'mfg-production-record',
      name: 'ProductionRecord',
      displayName: '生产记录',
      description: '生产报工记录',
      icon: 'check-circle',
      level: 'entity',
      parentId: 'domain-mfg',
      properties: [
        { key: 'record_id', displayName: '记录ID', dataType: 'string', required: true },
        { key: 'work_order', displayName: '工单', dataType: 'reference', referenceTo: 'mfg-work-order' },
        { key: 'process_step', displayName: '工序', dataType: 'reference', referenceTo: 'prod-process-step' },
        { key: 'workstation', displayName: '工位', dataType: 'reference', referenceTo: 'res-workstation' },
        { key: 'operator', displayName: '操作人', dataType: 'reference', referenceTo: 'org-employee' },
        { key: 'good_quantity', displayName: '良品数', dataType: 'number' },
        { key: 'defect_quantity', displayName: '不良数', dataType: 'number' },
        { key: 'record_time', displayName: '记录时间', dataType: 'datetime' },
      ],
      relations: [],
    },
    {
      id: 'cap-capacity-requirement',
      name: 'CapacityRequirement',
      displayName: '产能需求',
      description: '细能力需求计划CRP',
      icon: 'bar-chart',
      level: 'entity',
      parentId: 'domain-mfg',
      properties: [
        { key: 'crp_no', displayName: 'CRP编号', dataType: 'string', required: true },
        { key: 'workshop', displayName: '车间', dataType: 'reference', referenceTo: 'org-workshop' },
        { key: 'required_capacity', displayName: '需求产能', dataType: 'number', unit: '小时' },
        { key: 'available_capacity', displayName: '可用产能', dataType: 'number', unit: '小时' },
        { key: 'load_rate', displayName: '负荷率', dataType: 'number', unit: '%' },
      ],
      relations: [],
      businessRules: ['负荷率不得超过100%', '关键设备负荷率不得超过95%'],
    },
  ],
};

// ============================================================================
// 6. 质量管理域 (Quality Management)
// 描述：质量标准、检验计划、检验记录、不合格品
// ============================================================================
const qualityDomain: OntologyNode = {
  id: 'domain-quality',
  name: 'Quality',
  displayName: '质量管理域',
  description: '质量标准、检验计划、检验记录、不合格品管理',
  icon: 'shield',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'quality-standard',
      name: 'QualityStandard',
      displayName: '质量标准',
      description: '产品质量标准',
      icon: 'award',
      level: 'entity',
      parentId: 'domain-quality',
      properties: [
        { key: 'standard_code', displayName: '标准编码', dataType: 'string', required: true },
        { key: 'standard_name', displayName: '标准名称', dataType: 'string', required: true },
        { key: 'product_model', displayName: '适用产品', dataType: 'reference', referenceTo: 'prod-product-model' },
        { key: 'version', displayName: '版本', dataType: 'string' },
        { key: 'check_item_count', displayName: '检查项数', dataType: 'number' },
        { key: 'aql_level', displayName: 'AQL等级', dataType: 'number' },
        { key: 'cpk_target', displayName: 'CPK目标', dataType: 'number' },
      ],
      relations: [
        { targetId: 'quality-check-item', relationType: 'consists_of', cardinality: '1:N', description: '标准包含检查项' },
      ],
    },
    {
      id: 'quality-check-item',
      name: 'CheckItem',
      displayName: '检查项',
      description: '质量检查项目',
      icon: 'check-square',
      level: 'entity',
      parentId: 'domain-quality',
      properties: [
        { key: 'item_code', displayName: '检查项编码', dataType: 'string', required: true },
        { key: 'item_name', displayName: '检查项名称', dataType: 'string', required: true },
        { key: 'check_type', displayName: '检查类型', dataType: 'enum', description: '计量/计数' },
        { key: 'standard_value', displayName: '标准值', dataType: 'number' },
        { key: 'upper_limit', displayName: '上限', dataType: 'number' },
        { key: 'lower_limit', displayName: '下限', dataType: 'number' },
        { key: 'unit', displayName: '单位', dataType: 'string' },
      ],
      relations: [],
    },
    {
      id: 'quality-iqc-record',
      name: 'IQCRecord',
      displayName: '来料检验记录',
      description: '来料检验记录',
      icon: 'check-circle',
      level: 'entity',
      parentId: 'domain-quality',
      properties: [
        { key: 'iqc_no', displayName: '检验单号', dataType: 'string', required: true },
        { key: 'material', displayName: '物料', dataType: 'reference', referenceTo: 'supply-material' },
        { key: 'batch_no', displayName: '批次号', dataType: 'string' },
        { key: 'supplier', displayName: '供应商', dataType: 'reference', referenceTo: 'supply-supplier' },
        { key: 'sample_size', displayName: '抽样数', dataType: 'number' },
        { key: 'accept_count', displayName: '合格数', dataType: 'number' },
        { key: 'reject_count', displayName: '不良数', dataType: 'number' },
        { key: 'result', displayName: '检验结果', dataType: 'enum', description: '合格/特采/退货' },
        { key: 'inspector', displayName: '检验员', dataType: 'reference', referenceTo: 'org-employee' },
      ],
      relations: [
        { targetId: 'supply-inventory', relationType: 'releases', cardinality: '1:1', description: '检验放行库存' },
      ],
    },
    {
      id: 'quality-qc-record',
      name: 'QCRecord',
      displayName: '过程检验记录',
      description: '过程检验记录',
      icon: 'check-circle',
      level: 'entity',
      parentId: 'domain-quality',
      properties: [
        { key: 'qc_no', displayName: '检验单号', dataType: 'string', required: true },
        { key: 'wip', displayName: '在制品', dataType: 'reference', referenceTo: 'mfg-wip' },
        { key: 'process_step', displayName: '工序', dataType: 'reference', referenceTo: 'prod-process-step' },
        { key: 'check_value', displayName: '检验值', dataType: 'number' },
        { key: 'result', displayName: '结果', dataType: 'enum', description: '合格/不良' },
        { key: 'inspector', displayName: '检验员', dataType: 'reference', referenceTo: 'org-employee' },
      ],
      relations: [],
    },
    {
      id: 'quality-defect',
      name: 'Defect',
      displayName: '缺陷记录',
      description: '质量缺陷记录',
      icon: 'alert-triangle',
      level: 'entity',
      parentId: 'domain-quality',
      properties: [
        { key: 'defect_id', displayName: '缺陷ID', dataType: 'string', required: true },
        { key: 'defect_type', displayName: '缺陷类型', dataType: 'enum', description: '外观/尺寸/性能/安全' },
        { key: 'defect_code', displayName: '缺陷代码', dataType: 'string' },
        { key: 'severity', displayName: '严重程度', dataType: 'enum', description: '致命/严重/轻微' },
        { key: 'source_process', displayName: '来源工序', dataType: 'reference', referenceTo: 'prod-process-step' },
        { key: 'quantity', displayName: '数量', dataType: 'number' },
        { key: 'disposition', displayName: '处置方式', dataType: 'enum', description: '返工/报废/特采' },
      ],
      relations: [],
    },
  ],
};

// ============================================================================
// 7. 销售客户域 (Sales & Customer)
// 描述：客户、销售订单、发货、售后
// ============================================================================
const salesDomain: OntologyNode = {
  id: 'domain-sale',
  name: 'Sales',
  displayName: '销售客户域',
  description: '客户、销售订单、发货、售后管理',
  icon: 'shopping-cart',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'sale-customer',
      name: 'Customer',
      displayName: '客户',
      description: '客户主数据',
      icon: 'users',
      level: 'entity',
      parentId: 'domain-sale',
      properties: [
        { key: 'customer_code', displayName: '客户编码', dataType: 'string', required: true },
        { key: 'customer_name', displayName: '客户名称', dataType: 'string', required: true },
        { key: 'customer_type', displayName: '客户类型', dataType: 'enum', description: '战略/重要/一般' },
        { key: 'industry', displayName: '所属行业', dataType: 'enum', description: '汽车/储能/消费电子' },
        { key: 'credit_limit', displayName: '信用额度', dataType: 'number', unit: '元' },
        { key: 'payment_terms', displayName: '付款条件', dataType: 'string' },
      ],
      relations: [
        { targetId: 'sale-sales-order', relationType: 'places', cardinality: '1:N', description: '客户下订单' },
      ],
    },
    {
      id: 'sale-sales-order',
      name: 'SalesOrder',
      displayName: '销售订单',
      description: '客户销售订单',
      icon: 'file-text',
      level: 'entity',
      parentId: 'domain-sale',
      properties: [
        { key: 'so_no', displayName: '订单号', dataType: 'string', required: true },
        { key: 'customer', displayName: '客户', dataType: 'reference', referenceTo: 'sale-customer' },
        { key: 'order_date', displayName: '订单日期', dataType: 'datetime' },
        { key: 'delivery_date', displayName: '交货日期', dataType: 'datetime' },
        { key: 'total_amount', displayName: '订单金额', dataType: 'number', unit: '元' },
        { key: 'currency', displayName: '币种', dataType: 'string' },
        { key: 'priority', displayName: '优先级', dataType: 'enum', description: '高/中/低' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '草稿/已确认/生产中/已发货/已关闭' },
      ],
      relations: [
        { targetId: 'sale-so-line', relationType: 'contains', cardinality: '1:N', description: '订单包含行项' },
        { targetId: 'mfg-work-order', relationType: 'drives', cardinality: '1:N', description: '订单驱生工单' },
      ],
    },
    {
      id: 'sale-so-line',
      name: 'SOLine',
      displayName: '销售订单行项',
      description: '销售订单明细',
      icon: 'list',
      level: 'entity',
      parentId: 'domain-sale',
      properties: [
        { key: 'line_no', displayName: '行号', dataType: 'number' },
        { key: 'product_model', displayName: '产品型号', dataType: 'reference', referenceTo: 'prod-product-model' },
        { key: 'quantity', displayName: '数量', dataType: 'number' },
        { key: 'unit_price', displayName: '单价', dataType: 'number', unit: '元' },
        { key: 'line_amount', displayName: '行金额', dataType: 'number', unit: '元' },
      ],
      relations: [],
    },
    {
      id: 'sale-delivery',
      name: 'Delivery',
      displayName: '发货单',
      description: '销售发货单',
      icon: 'truck',
      level: 'entity',
      parentId: 'domain-sale',
      properties: [
        { key: 'delivery_no', displayName: '发货单号', dataType: 'string', required: true },
        { key: 'sales_order', displayName: '销售订单', dataType: 'reference', referenceTo: 'sale-sales-order' },
        { key: 'delivery_date', displayName: '发货日期', dataType: 'datetime' },
        { key: 'carrier', displayName: '承运商', dataType: 'string' },
        { key: 'tracking_no', displayName: ' tracking号', dataType: 'string' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '待发货/已发货/已签收' },
      ],
      relations: [],
    },
  ],
};

// ============================================================================
// 8. 项目管理域 (Project Management)
// 描述：研发项目、试产项目、技改项目
// ============================================================================
const projectDomain: OntologyNode = {
  id: 'domain-project',
  name: 'Project',
  displayName: '项目管理域',
  description: '研发项目、试产项目、技改项目管理',
  icon: 'target',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'project-rd',
      name: 'RDProject',
      displayName: '研发项目',
      description: '产品研发项目',
      icon: 'lightbulb',
      level: 'entity',
      parentId: 'domain-project',
      properties: [
        { key: 'project_code', displayName: '项目编码', dataType: 'string', required: true },
        { key: 'project_name', displayName: '项目名称', dataType: 'string', required: true },
        { key: 'project_type', displayName: '项目类型', dataType: 'enum', description: '新产品/新材料/新工艺' },
        { key: 'project_manager', displayName: '项目经理', dataType: 'reference', referenceTo: 'org-employee' },
        { key: 'start_date', displayName: '开始日期', dataType: 'datetime' },
        { key: 'end_date', displayName: '结束日期', dataType: 'datetime' },
        { key: 'budget', displayName: '预算', dataType: 'number', unit: '元' },
        { key: 'status', displayName: '状态', dataType: 'enum', description: '立项/进行中/试产/量产/结项' },
      ],
      relations: [
        { targetId: 'prod-product-model', relationType: 'develops', cardinality: '1:1', description: '项目开发产品' },
      ],
    },
    {
      id: 'project-trial',
      name: 'TrialProduction',
      displayName: '试产记录',
      description: '新产品试产记录',
      icon: 'flask',
      level: 'entity',
      parentId: 'domain-project',
      properties: [
        { key: 'trial_no', displayName: '试产编号', dataType: 'string', required: true },
        { key: 'project', displayName: '所属项目', dataType: 'reference', referenceTo: 'project-rd' },
        { key: 'trial_phase', displayName: '试产阶段', dataType: 'enum', description: '小试/中试/量产验证' },
        { key: 'trial_date', displayName: '试产日期', dataType: 'datetime' },
        { key: 'trial_quantity', displayName: '试产数量', dataType: 'number' },
        { key: 'yield_rate', displayName: '良率', dataType: 'number', unit: '%' },
        { key: 'result', displayName: '试产结论', dataType: 'enum', description: '通过/不通过/需改进' },
      ],
      relations: [],
    },
  ],
};

// ============================================================================
// 9. 成本财务域 (Cost & Finance)
// 描述：成本中心、成本核算、财务科目
// ============================================================================
const costDomain: OntologyNode = {
  id: 'domain-cost',
  name: 'Cost',
  displayName: '成本财务域',
  description: '成本中心、成本核算、财务科目管理',
  icon: 'dollar-sign',
  level: 'domain',
  properties: [],
  relations: [],
  children: [
    {
      id: 'cost-center',
      name: 'CostCenter',
      displayName: '成本中心',
      description: '成本中心定义',
      icon: 'pie-chart',
      level: 'entity',
      parentId: 'domain-cost',
      properties: [
        { key: 'cc_code', displayName: '成本中心编码', dataType: 'string', required: true },
        { key: 'cc_name', displayName: '成本中心名称', dataType: 'string', required: true },
        { key: 'cc_type', displayName: '成本中心类型', dataType: 'enum', description: '生产/辅助/管理' },
        { key: 'responsible', displayName: '负责人', dataType: 'reference', referenceTo: 'org-employee' },
        { key: 'budget', displayName: '年度预算', dataType: 'number', unit: '元' },
      ],
      relations: [
        { targetId: 'org-workshop', relationType: 'maps_to', cardinality: '1:1', description: '映射到车间' },
      ],
    },
    {
      id: 'cost-product-cost',
      name: 'ProductCost',
      displayName: '产品成本',
      description: '产品成本核算',
      icon: 'calculator',
      level: 'entity',
      parentId: 'domain-cost',
      properties: [
        { key: 'cost_id', displayName: '成本ID', dataType: 'string', required: true },
        { key: 'product_model', displayName: '产品型号', dataType: 'reference', referenceTo: 'prod-product-model' },
        { key: 'cost_period', displayName: '成本期间', dataType: 'string' },
        { key: 'material_cost', displayName: '材料成本', dataType: 'number', unit: '元' },
        { key: 'labor_cost', displayName: '人工成本', dataType: 'number', unit: '元' },
        { key: 'overhead_cost', displayName: '制造费用', dataType: 'number', unit: '元' },
        { key: 'total_cost', displayName: '总成本', dataType: 'number', unit: '元' },
        { key: 'unit_cost', displayName: '单位成本', dataType: 'number', unit: '元/只' },
      ],
      relations: [],
    },
  ],
};

// ============================================================================
// 导出完整本体树
// ============================================================================
export const ontologyTree: OntologyNode[] = [
  organizationDomain,
  capacityDomain,
  productDomain,
  supplyDomain,
  manufacturingDomain,
  qualityDomain,
  salesDomain,
  projectDomain,
  costDomain,
];

// 本体统计信息
export const ontologyStats = {
  totalDomains: 9,
  totalEntities: ontologyTree.reduce((acc, domain) => acc + (domain.children?.length || 0), 0),
  domains: ontologyTree.map(d => ({ id: d.id, name: d.displayName, entityCount: d.children?.length || 0 })),
};

// 获取所有实体扁平列表
export function getAllEntities(): OntologyNode[] {
  const entities: OntologyNode[] = [];
  function traverse(node: OntologyNode) {
    if (node.level === 'entity') {
      entities.push(node);
    }
    node.children?.forEach(traverse);
  }
  ontologyTree.forEach(traverse);
  return entities;
}

// 根据ID查找实体
export function findEntityById(id: string): OntologyNode | undefined {
  function traverse(node: OntologyNode): OntologyNode | undefined {
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const found = traverse(child);
      if (found) return found;
    }
    return undefined;
  }
  for (const domain of ontologyTree) {
    const found = traverse(domain);
    if (found) return found;
  }
  return undefined;
}

// 获取实体的上下游关系
export function getEntityRelations(entityId: string): {
  upstream: Array<{ targetId: string; relationType: string; description: string }>;
  downstream: Array<{ targetId: string; relationType: string; description: string }>;
} {
  const entity = findEntityById(entityId);
  const upstream: Array<{ targetId: string; relationType: string; description: string }> = [];
  const downstream: Array<{ targetId: string; relationType: string; description: string }> = [];

  if (!entity) return { upstream, downstream };

  // 查找该实体作为source的关系（下游）
  entity.relations?.forEach(rel => {
    downstream.push({
      targetId: rel.targetId,
      relationType: rel.relationType,
      description: rel.description,
    });
  });

  // 查找该实体作为target的关系（上游）- 需要遍历所有实体
  const allEntities = getAllEntities();
  allEntities.forEach(otherEntity => {
    otherEntity.relations?.forEach(rel => {
      if (rel.targetId === entityId) {
        upstream.push({
          targetId: otherEntity.id,
          relationType: rel.relationType,
          description: rel.description,
        });
      }
    });
  });

  return { upstream, downstream };
}

export default ontologyTree;
