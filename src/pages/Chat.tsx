import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, ChevronLeft, ChevronRight,
  FileText, Settings, Sparkles, Brain,
  Database, Workflow, Folder, FolderOpen,
  MoreVertical, Trash2, Edit3, Upload,
  ChevronDown, ChevronRight as ChevronRightIcon,
  File, FilePlus, GripVertical, X,
  GitBranch, Target, Zap, BarChart3,
  AlertCircle, CheckCircle, Clock, Layers,
  Box, Cpu, Shield, TrendingUp
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  children?: string[];
  expanded?: boolean;
  fileType?: string;
  size?: string;
  uploadedAt?: Date;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface LogicNode {
  id: string;
  name: string;
  type: 'constraint' | 'skill' | 'ontology' | 'action';
  status: 'pending' | 'running' | 'completed' | 'error';
  description: string;
  references: {
    constraints?: string[];
    skills?: string[];
    ontology?: string[];
  };
  inputs?: string[];
  outputs?: string[];
}

interface GeneratedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  createdAt: Date;
  preview?: string;
}

export default function Chat({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('capacity');
  const [showAgentSelect, setShowAgentSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 文件树状态
  const [fileNodes, setFileNodes] = useState<Record<string, FileNode>>({
    'root': { id: 'root', name: '根目录', type: 'folder', parentId: null, children: ['folder1', 'folder2'], expanded: true },
    'folder1': { id: 'folder1', name: '生产数据', type: 'folder', parentId: 'root', children: ['file1', 'file2'], expanded: false },
    'folder2': { id: 'folder2', name: '订单文件', type: 'folder', parentId: 'root', children: ['file3'], expanded: false },
    'file1': { id: 'file1', name: '产线A日志.xlsx', type: 'file', parentId: 'folder1', fileType: 'xlsx', size: '2.3MB', uploadedAt: new Date() },
    'file2': { id: 'file2', name: '设备状态.pdf', type: 'file', parentId: 'folder1', fileType: 'pdf', size: '1.8MB', uploadedAt: new Date() },
    'file3': { id: 'file3', name: 'Q1订单.csv', type: 'file', parentId: 'folder2', fileType: 'csv', size: '856KB', uploadedAt: new Date() },
  });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  // 智能体列表 - 与智能体配置中心保持一致
  const agents: Agent[] = [
    { id: 'agent-001', name: '电池需求预测智能体', description: '基于历史订单数据、市场趋势和季节性因素，智能预测锂电池未来需求', icon: TrendingUp, color: 'blue' },
    { id: 'agent-002', name: '生产排程优化智能体', description: '综合考虑设备产能、物料齐套、换型时间和交期约束，自动生成最优生产排程', icon: Clock, color: 'emerald' },
    { id: 'agent-003', name: '质量检测智能体', description: '基于计算机视觉和机器学习，自动识别锂电池生产过程中的外观缺陷和电化学异常', icon: Shield, color: 'violet' },
    { id: 'agent-004', name: '供应链风险预警智能体', description: '实时监控关键原材料的供应状态、价格波动和地缘政治风险，提前预警供应中断', icon: AlertCircle, color: 'amber' },
    { id: 'agent-005', name: '能耗优化智能体', description: '分析高能耗工序的用电模式，优化峰谷平用电策略，降低单位能耗成本', icon: Zap, color: 'cyan' },
  ];

  // Skills 列表
  const skills = [
    { id: 'skill-001', name: '产能分析', description: '分析产线产能利用率与瓶颈', category: '生产' },
    { id: 'skill-002', name: '需求预测', description: '基于时序模型预测未来需求', category: '计划' },
    { id: 'skill-003', name: '排程优化', description: '生成最优生产排程方案', category: '排程' },
    { id: 'skill-004', name: '质量检测', description: '视觉缺陷检测与质量分析', category: '质量' },
    { id: 'skill-005', name: '异常检测', description: '识别生产数据异常模式', category: '监控' },
    { id: 'skill-006', name: '库存优化', description: '优化安全库存与补货策略', category: '物料' },
    { id: 'skill-007', name: '设备诊断', description: '设备故障预测与健康管理', category: '设备' },
    { id: 'skill-008', name: '能耗分析', description: '分析工序能耗与优化建议', category: '能源' },
    { id: 'skill-009', name: '供应链分析', description: '供应商交付与风险评估', category: '供应链' },
    { id: 'skill-010', name: '成本核算', description: '产品成本分析与控制', category: '成本' },
  ];

  // @ 提及功能状态
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionType, setMentionType] = useState<'all' | 'agent' | 'skill'>('all');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // 推演逻辑节点
  const [logicNodes, setLogicNodes] = useState<LogicNode[]>([
    {
      id: '1',
      name: '数据预处理',
      type: 'action',
      status: 'completed',
      description: '清洗导入的生产数据，去除异常值',
      references: {
        skills: ['数据清洗', '异常检测'],
      },
      inputs: ['产线A日志.xlsx', '设备状态.pdf'],
      outputs: ['cleaned_data.csv'],
    },
    {
      id: '2',
      name: '产能约束检查',
      type: 'constraint',
      status: 'running',
      description: '验证产能约束条件是否满足',
      references: {
        constraints: ['最大产能 ≤ 1000件/天', '设备利用率 ≥ 85%'],
        ontology: ['产能本体', '设备本体'],
      },
    },
    {
      id: '3',
      name: '瓶颈识别',
      type: 'skill',
      status: 'pending',
      description: '使用TOC方法识别系统瓶颈',
      references: {
        skills: ['TOC分析', '瓶颈识别算法'],
        ontology: ['工序本体', '产能本体'],
      },
    },
    {
      id: '4',
      name: '优化建议生成',
      type: 'action',
      status: 'pending',
      description: '基于分析结果生成优化建议',
      references: {
        skills: ['优化算法', '报告生成'],
      },
    },
  ]);

  // 生成的文件
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([
    { id: '1', name: '产能分析报告.pdf', type: 'pdf', size: '3.2MB', createdAt: new Date(), preview: '报告预览内容...' },
    { id: '2', name: '瓶颈分析图表.png', type: 'image', size: '856KB', createdAt: new Date() },
    { id: '3', name: '优化建议清单.xlsx', type: 'xlsx', size: '1.1MB', createdAt: new Date() },
  ]);

  // 展开的节点详情
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      agentId: selectedAgent,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    // 模拟AI响应
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `基于导入的生产数据分析，我发现以下关键信息：

**产能利用率分析**
- 当前产能利用率: 78%
- 与目标差距: -7%
- 主要瓶颈: 3号产线换型时间过长

**发现的问题**
1. 换型时间平均45分钟，超出标准30分钟
2. 设备故障率2.3%，高于行业平均1.5%
3. 夜班产出比白班低15%

**优化建议**
1. 实施SMED快速换型，目标缩短至20分钟
2. 增加设备预防性维护频次
3. 优化夜班人员配置

正在生成详细分析报告...`,
        timestamp: new Date(),
        agentId: selectedAgent,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 2000);
  };

  // 文件树操作
  const toggleFolder = (folderId: string) => {
    setFileNodes(prev => ({
      ...prev,
      [folderId]: { ...prev[folderId], expanded: !prev[folderId].expanded },
    }));
  };

  const addFolder = (parentId: string) => {
    const newId = `folder_${Date.now()}`;
    const newFolder: FileNode = {
      id: newId,
      name: '新建文件夹',
      type: 'folder',
      parentId,
      children: [],
      expanded: false,
    };
    setFileNodes(prev => ({
      ...prev,
      [newId]: newFolder,
      [parentId]: { ...prev[parentId], children: [...(prev[parentId].children || []), newId] },
    }));
    setEditingFolder(newId);
    setEditFolderName('新建文件夹');
  };

  const addFile = (folderId: string) => {
    // 模拟文件上传
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newId = `file_${Date.now()}`;
        const newFile: FileNode = {
          id: newId,
          name: file.name,
          type: 'file',
          parentId: folderId,
          fileType: file.name.split('.').pop() || 'unknown',
          size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
          uploadedAt: new Date(),
        };
        setFileNodes(prev => ({
          ...prev,
          [newId]: newFile,
          [folderId]: { ...prev[folderId], children: [...(prev[folderId].children || []), newId] },
        }));
      }
    };
    input.click();
  };

  const renameFolder = (folderId: string) => {
    if (editFolderName.trim()) {
      setFileNodes(prev => ({
        ...prev,
        [folderId]: { ...prev[folderId], name: editFolderName },
      }));
    }
    setEditingFolder(null);
  };

  const deleteNode = (nodeId: string) => {
    const node = fileNodes[nodeId];
    if (node.parentId) {
      setFileNodes(prev => {
        const newNodes = { ...prev };
        delete newNodes[nodeId];
        if (node.children) {
          node.children.forEach(childId => delete newNodes[childId]);
        }
        newNodes[node.parentId!] = {
          ...newNodes[node.parentId!],
          children: newNodes[node.parentId!].children?.filter(id => id !== nodeId),
        };
        return newNodes;
      });
    }
  };

  // 渲染文件树
  const renderFileTree = (nodeId: string, level: number = 0): React.ReactNode => {
    const node = fileNodes[nodeId];
    if (!node) return null;

    const isFolder = node.type === 'folder';
    const paddingLeft = level * 12 + 8;

    return (
      <div key={nodeId}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${
            selectedFile === nodeId ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-100 border-transparent'
          } border`}
          style={{ paddingLeft }}
          onClick={() => isFolder ? toggleFolder(nodeId) : setSelectedFile(nodeId)}
        >
          {isFolder ? (
            node.expanded ? (
              <ChevronDown size={14} className="text-slate-500" />
            ) : (
              <ChevronRightIcon size={14} className="text-slate-500" />
            )
          ) : (
            <span className="w-3.5" />
          )}

          {isFolder ? (
            node.expanded ? (
              <FolderOpen size={16} className="text-blue-500" />
            ) : (
              <Folder size={16} className="text-blue-500" />
            )
          ) : (
            <FileText size={16} className="text-gray-400" />
          )}

          {editingFolder === nodeId ? (
            <input
              type="text"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              onBlur={() => renameFolder(nodeId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') renameFolder(nodeId);
                if (e.key === 'Escape') setEditingFolder(null);
              }}
              className="flex-1 text-sm px-1 py-0.5 bg-white border border-blue-300 rounded text-gray-800"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm text-gray-700 truncate">{node.name}</span>
          )}

          {isFolder && (
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); addFile(nodeId); }}
                className="p-1 hover:bg-gray-200 rounded"
                title="上传文件"
              >
                <Upload size={12} className="text-gray-400" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); addFolder(nodeId); }}
                className="p-1 hover:bg-gray-200 rounded"
                title="新建文件夹"
              >
                <FolderPlus size={12} className="text-gray-400" />
              </button>
              {node.parentId && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNode(nodeId); }}
                  className="p-1 hover:bg-red-100 rounded"
                  title="删除"
                >
                  <Trash2 size={12} className="text-red-500" />
                </button>
              )}
            </div>
          )}

          {!isFolder && node.size && (
            <span className="text-xs text-gray-400">{node.size}</span>
          )}
        </div>

        {isFolder && node.expanded && node.children?.map(childId => renderFileTree(childId, level + 1))}
      </div>
    );
  };

  // FolderPlus component
  const FolderPlus = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <line x1="12" y1="10" x2="12" y2="16" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );

  const getNodeIcon = (type: LogicNode['type']) => {
    switch (type) {
      case 'constraint': return Shield;
      case 'skill': return Cpu;
      case 'ontology': return Layers;
      case 'action': return Zap;
    }
  };

  const getNodeColor = (type: LogicNode['type']) => {
    switch (type) {
      case 'constraint': return 'text-amber-600 bg-amber-100 border-amber-300';
      case 'skill': return 'text-violet-600 bg-violet-100 border-violet-300';
      case 'ontology': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'action': return 'text-emerald-600 bg-emerald-100 border-emerald-300';
    }
  };

  const getStatusIcon = (status: LogicNode['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'running': return <Clock size={14} className="text-blue-500 animate-pulse" />;
      case 'error': return <AlertCircle size={14} className="text-red-500" />;
      case 'pending': return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />;
    }
  };

  const currentAgent = agents.find(a => a.id === selectedAgent);

  // 处理输入变化，检测 @ 触发
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setInputText(value);
    setCursorPosition(cursorPos);

    // 检测是否在输入 @ 后的内容
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // 如果 @ 后没有空格，显示提及弹窗
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setShowMentionPopup(true);
        setSelectedMentionIndex(0);

        // 检测是否指定了类型 @agent 或 @skill
        if (textAfterAt.toLowerCase().startsWith('agent') || textAfterAt.toLowerCase().startsWith('智能体')) {
          setMentionType('agent');
        } else if (textAfterAt.toLowerCase().startsWith('skill') || textAfterAt.toLowerCase().startsWith('技能')) {
          setMentionType('skill');
        } else {
          setMentionType('all');
        }
      } else {
        setShowMentionPopup(false);
      }
    } else {
      setShowMentionPopup(false);
    }
  };

  // 获取过滤后的提及选项
  const getMentionOptions = () => {
    let options: Array<{ type: 'agent' | 'skill'; id: string; name: string; description: string; icon?: React.ElementType; color?: string }> = [];

    // 添加智能体
    if (mentionType === 'all' || mentionType === 'agent') {
      const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(mentionQuery.replace(/^agent/i, '').replace(/^智能体/i, '')) ||
        a.description.toLowerCase().includes(mentionQuery.replace(/^agent/i, '').replace(/^智能体/i, ''))
      );
      options.push(...filteredAgents.map(a => ({ ...a, type: 'agent' as const })));
    }

    // 添加 skills
    if (mentionType === 'all' || mentionType === 'skill') {
      const filteredSkills = skills.filter(s =>
        s.name.toLowerCase().includes(mentionQuery.replace(/^skill/i, '').replace(/^技能/i, '')) ||
        s.description.toLowerCase().includes(mentionQuery.replace(/^skill/i, '').replace(/^技能/i, ''))
      );
      options.push(...filteredSkills.map(s => ({ ...s, type: 'skill' as const, icon: undefined, color: undefined })));
    }

    return options;
  };

  // 选择提及项
  const selectMention = (item: { type: 'agent' | 'skill'; id: string; name: string }) => {
    const textBeforeCursor = inputText.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeAt = inputText.slice(0, lastAtIndex);
    const textAfterCursor = inputText.slice(cursorPosition);

    const mentionText = item.type === 'agent' ? `@智能体:${item.name} ` : `@技能:${item.name} `;
    const newText = textBeforeAt + mentionText + textAfterCursor;

    setInputText(newText);
    setShowMentionPopup(false);
    setMentionQuery('');

    // 聚焦回 textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastAtIndex + mentionText.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionPopup) {
      const options = getMentionOptions();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => (prev + 1) % options.length);
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => (prev - 1 + options.length) % options.length);
          return;
        case 'Enter':
          e.preventDefault();
          if (options[selectedMentionIndex]) {
            selectMention(options[selectedMentionIndex]);
          }
          return;
        case 'Escape':
          setShowMentionPopup(false);
          return;
      }
    }

    // 原有的发送逻辑
    if (e.key === 'Enter' && !e.shiftKey && !showMentionPopup) {
      e.preventDefault();
      handleSend();
    }
  };

  const mentionOptions = getMentionOptions();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="text-white" size={18} />
          </div>
          <div>
            <span className="text-base font-semibold text-gray-900">Decision Copilot</span>
            <span className="text-xs text-gray-500 ml-2 font-mono">v2.1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">系统配置</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧文件树 - 固定窄侧边栏 */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">文件资源</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => addFile('root')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                  title="上传文件"
                >
                  <Upload size={14} className="text-gray-500" />
                </button>
                <button
                  onClick={() => addFolder('root')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                  title="新建文件夹"
                >
                  <FolderPlus size={14} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {fileNodes['root']?.children?.map(childId => renderFileTree(childId, 0))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              共 {Object.values(fileNodes).filter(n => n.type === 'file').length} 个文件
            </div>
          </div>
        </aside>

        {/* 中间对话区域 - Notebook LM style fixed width */}
        <main className="flex-1 flex flex-col bg-white border-x border-gray-200 max-w-6xl w-full mx-auto">
          {/* 智能体选择器 */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowAgentSelect(!showAgentSelect)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors w-full"
              >
                {currentAgent && (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${currentAgent.color}-100`}>
                      <currentAgent.icon size={18} className={`text-${currentAgent.color}-600`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-800">{currentAgent.name}</div>
                      <div className="text-xs text-gray-500">{currentAgent.description}</div>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </>
                )}
              </button>

              {showAgentSelect && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                  {agents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => { setSelectedAgent(agent.id); setShowAgentSelect(false); }}
                      className={`flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors ${
                        selectedAgent === agent.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${agent.color}-100`}>
                        <agent.icon size={18} className={`text-${agent.color}-600`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-200">
                  <Sparkles className="text-blue-500" size={28} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">开始分析</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  从左侧导入文件，选择智能体，然后开始对话进行数据分析
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  <button
                    onClick={() => setInputText('分析产线A的产能瓶颈')}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-sm text-gray-700 hover:text-blue-600 transition-all"
                  >
                    分析产线A的产能瓶颈
                  </button>
                  <button
                    onClick={() => setInputText('预测下周订单完成率')}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-sm text-gray-700 hover:text-blue-600 transition-all"
                  >
                    预测下周订单完成率
                  </button>
                  <button
                    onClick={() => setInputText('检查约束规则冲突')}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-sm text-gray-700 hover:text-blue-600 transition-all"
                  >
                    检查约束规则冲突
                  </button>
                  <button
                    onClick={() => setInputText('生成优化建议报告')}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-sm text-gray-700 hover:text-blue-600 transition-all"
                  >
                    生成优化建议报告
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl px-4 py-3`}>
                      {message.role === 'assistant' && message.agentId && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-300">
                          {(() => {
                            const agent = agents.find(a => a.id === message.agentId);
                            return agent ? (
                              <>
                                <agent.icon size={14} className={`text-${agent.color}-600`} />
                                <span className="text-xs font-medium text-gray-600">{agent.name}</span>
                              </>
                            ) : null;
                          })()}
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-gray-500 ml-1">思考中...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-4 border-t border-gray-200 relative">
            {/* @ 提及弹窗 */}
            {showMentionPopup && mentionOptions.length > 0 && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">提及</span>
                    <span className="text-gray-300">|</span>
                    <span>输入 @智能体 或 @技能 筛选</span>
                  </div>
                </div>
                {mentionOptions.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => selectMention(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left ${
                      index === selectedMentionIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.type === 'agent' ? `bg-${item.color}-100` : 'bg-gray-100'
                    }`}>
                      {item.type === 'agent' && item.icon ? (
                        <item.icon size={16} className={`text-${item.color}-600`} />
                      ) : (
                        <span className="text-xs font-bold text-gray-600">SK</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.type === 'agent' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.type === 'agent' ? '智能体' : '技能'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none px-2 py-2 max-h-32"
                placeholder="输入您的问题，使用 @ 提及智能体或技能..."
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isThinking}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
              >
                <Send className="text-white" size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
              <span className="text-xs text-gray-400">按 Enter 发送，Shift + Enter 换行，@ 提及智能体/技能</span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                  <FileText size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                  <Database size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* 右侧推演逻辑和生成文件 - 固定窄侧边栏 */}
        <aside className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* 生成文件区域 */}
          <div className="border-b border-gray-200">
            <div className="px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  生成文件
                </h3>
                <span className="text-xs text-gray-500">{generatedFiles.length} 个</span>
              </div>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {generatedFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <FileText size={20} className="text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.type} · {file.size}</p>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical size={14} className="text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 推演逻辑节点 */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Workflow size={16} className="text-violet-500" />
                  推演逻辑
                </h3>
                <span className="text-xs text-gray-500">{logicNodes.length} 个节点</span>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {logicNodes.map((node, index) => {
                const NodeIcon = getNodeIcon(node.type);
                const isExpanded = expandedNode === node.id;

                return (
                  <div
                    key={node.id}
                    className={`bg-gray-50 rounded-lg border transition-all ${
                      isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 节点头部 */}
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                    >
                      {/* 序号和连接线 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getNodeColor(node.type)}`}>
                          {index + 1}
                        </div>
                        {index < logicNodes.length - 1 && (
                          <div className="w-0.5 h-4 bg-gray-300 mt-1"></div>
                        )}
                      </div>

                      {/* 节点图标 */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getNodeColor(node.type)}`}>
                        <NodeIcon size={16} />
                      </div>

                      {/* 节点信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{node.name}</span>
                          {getStatusIcon(node.status)}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{node.description}</p>
                      </div>

                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* 展开的详情 */}
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-gray-200">
                        {/* 引用的约束 */}
                        {node.references.constraints && node.references.constraints.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                              <Target size={12} />
                              约束规则
                            </h4>
                            <div className="space-y-1">
                              {node.references.constraints.map((constraint, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  {constraint}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 引用的Skills */}
                        {node.references.skills && node.references.skills.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                              <Cpu size={12} />
                              Skills
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {node.references.skills.map((skill, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-200">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 引用的本体 */}
                        {node.references.ontology && node.references.ontology.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                              <Layers size={12} />
                              本体信息
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {node.references.ontology.map((onto, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                                  {onto}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 输入输出 */}
                        {(node.inputs || node.outputs) && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {node.inputs && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-1">输入</h4>
                                <div className="space-y-1">
                                  {node.inputs.map((input, i) => (
                                    <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                      <ChevronRightIcon size={10} className="text-gray-400" />
                                      {input}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {node.outputs && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-1">输出</h4>
                                <div className="space-y-1">
                                  {node.outputs.map((output, i) => (
                                    <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                      <CheckCircle size={10} className="text-emerald-500" />
                                      {output}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
