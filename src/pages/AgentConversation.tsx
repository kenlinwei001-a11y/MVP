/**
 * AgentConversation - 智能体对话与推演分析页面（MVP版）
 *
 * 核心设计原则：
 * 1. 单一页面，三层布局
 * 2. 对话即分析，无复杂配置
 * 3. 推演可视化是核心差异化
 * 4. 知识沉淀轻量一键化
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Upload, Bot, Brain, X, FileSpreadsheet, Database,
  GitBranch, Target, Cpu, Shield, CheckCircle, AlertCircle,
  Clock, Play, RotateCcw, Sparkles, Plus, ChevronRight,
  ChevronDown, BarChart3, Layers, Zap, Lightbulb, Save,
  MoreHorizontal, TrendingUp, Activity, Settings, ChevronLeft
} from 'lucide-react';
import type {
  Message,
  Attachment,
  ReasoningTrace,
  ReasoningStep,
  MentionableAgent,
  MentionableFile,
  MentionableItem,
  DiscoveredPattern,
  Agent,
  ChatHistory
} from '../types/conversation';

// ============================================================================
// 类型再导出（保持文件内兼容性）
// ============================================================================

export type {
  Message,
  Attachment,
  ReasoningTrace,
  ReasoningStep,
  MentionableAgent,
  MentionableFile,
  MentionableItem,
  DiscoveredPattern,
  Agent,
  ChatHistory
};

// ============================================================================
// 样式常量
// ============================================================================

const STYLES = {
  newChatButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
  },
  buttonContainer: {
    position: 'relative' as const,
    zIndex: 10
  }
};

const COLORS = {
  // 主色
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryLight: 'rgba(59, 130, 246, 0.1)',
  primaryBorder: 'rgba(59, 130, 246, 0.2)',

  // 背景色
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  bgHover: 'rgba(241, 245, 249, 0.5)',

  // 文字色
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  // 边框色
  borderDefault: '#e2e8f0',
  borderHover: '#cbd5e1',

  // 功能色
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
} as const;

// 可用智能体列表
const AVAILABLE_AGENTS: Agent[] = [
  { id: 'capacity', name: '产线产能预测助手', icon: 'Brain', description: '基于历史数据预测产能', color: '#3b82f6' },
  { id: 'schedule', name: '产能排程优化智能体', icon: 'Clock', description: '智能排程与资源优化', color: '#10b981' },
  { id: 'anomaly', name: '异常检测与告警智能体', icon: 'AlertCircle', description: '检测生产异常', color: '#ef4444' },
  { id: 'demand', name: '电池需求预测智能体', icon: 'TrendingUp', description: '预测市场需求', color: '#f59e0b' },
  { id: 'general', name: '通用助手', icon: 'Bot', description: '通用对话与帮助', color: '#8b5cf6' }
];

// ============================================================================
// 演示数据生成器
// ============================================================================

const generateDemoData = (): Attachment[] => {
  const productionLines = ['L-001', 'L-002', 'L-003'];
  const equipment = ['EQ-001', 'EQ-002', 'EQ-003', 'EQ-004', 'EQ-005'];

  // 生成30天的生产记录数据
  const generateProductionRecords = () => {
    const records: Record<string, any>[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isMonday = date.getDay() === 1;

      productionLines.forEach(line => {
        const baseCapacity = line === 'L-001' ? 2000 : line === 'L-002' ? 1800 : 1500;
        const mondayFactor = isMonday ? 0.85 : 1.0;
        const randomFactor = 0.9 + Math.random() * 0.2;
        const actual = Math.round(baseCapacity * mondayFactor * randomFactor);

        records.push({
          日期: dateStr,
          产线ID: line,
          计划产量: baseCapacity,
          实际产量: actual,
          OEE: (0.75 + Math.random() * 0.2).toFixed(2),
          设备状态: Math.random() > 0.9 ? '维护中' : '正常运行'
        });
      });
    }
    return records;
  };

  // 生成设备信息数据
  const generateEquipmentInfo = () => {
    return equipment.map(eq => ({
      设备ID: eq,
      设备名称: `生产设备-${eq.split('-')[1]}`,
      所属产线: productionLines[Math.floor(Math.random() * productionLines.length)],
      额定产能: 500 + Math.floor(Math.random() * 300),
      稼动率目标: '85%',
      下次维护日期: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  };

  // 生成订单数据
  const generateOrders = () => {
    const priorities = ['高', '中', '低'];
    return Array.from({ length: 20 }, (_, i) => ({
      订单号: `SO-2024-${String(i + 1).padStart(3, '0')}`,
      产品型号: `PRD-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
      订单数量: 500 + Math.floor(Math.random() * 2000),
      交期: new Date(Date.now() + (3 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      优先级: priorities[Math.floor(Math.random() * priorities.length)],
      状态: Math.random() > 0.3 ? '待排程' : '生产中'
    }));
  };

  const records = generateProductionRecords();
  const equipmentInfo = generateEquipmentInfo();
  const orders = generateOrders();

  return [
    {
      id: `demo_production_records_${Date.now()}`,
      name: '生产记录数据.csv',
      rowCount: records.length,
      columns: Object.keys(records[0]),
      data: records
    },
    {
      id: `demo_equipment_${Date.now()}`,
      name: '设备信息表.csv',
      rowCount: equipmentInfo.length,
      columns: Object.keys(equipmentInfo[0]),
      data: equipmentInfo
    },
    {
      id: `demo_orders_${Date.now()}`,
      name: '订单数据.csv',
      rowCount: orders.length,
      columns: Object.keys(orders[0]),
      data: orders
    }
  ];
};

// ============================================================================
// 模拟数据
// ============================================================================

const MOCK_REASONING: ReasoningTrace = {
  intent: '产能预测',
  entities: ['production_line', 'production_record', 'equipment'],
  skills: ['calculate_baseline', 'forecast_capacity'],
  constraints: ['max_capacity_limit', 'oee_target'],
  steps: [
    { id: '1', name: '意图解析', status: 'completed', duration: 120, output: '识别为产能预测问题' },
    { id: '2', name: '数据理解', status: 'completed', duration: 350, output: '发现产线L-001过去30天数据' },
    { id: '3', name: '基线计算', status: 'completed', duration: 280, output: '平均日产能 1,850件' },
    { id: '4', name: '趋势预测', status: 'completed', duration: 420, output: '未来7天预测 1,920±120件/天' },
    { id: '5', name: '约束检查', status: 'completed', duration: 180, output: '通过2项硬约束，1项软约束警告' }
  ],
  result: {
    summary: '预测未来7天日均产能1,920件，置信区间85%',
    confidence: 0.85,
    recommendations: ['建议关注周一产能波动', '设备EQ-001维护可能影响周三产出']
  }
};

// ============================================================================
// 主组件
// ============================================================================

interface AgentConversationProps {
  onNavigate: (page: string) => void;
}

// 初始欢迎消息
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `欢迎使用智能推演助手！我可以帮您分析产能、优化排程、检测异常等。

**我可以做什么：**
• 产能预测 - 基于历史数据预测未来产能
• 排程优化 - 智能安排生产计划
• 异常检测 - 发现生产中的异常情况
• 需求预测 - 预测市场需求趋势

**开始使用：**
1. 上传您的生产数据文件（CSV/Excel）
2. 或直接输入您的问题
3. 我会展示完整的推演逻辑路径

点击下方"查看推演"可以看到我的分析逻辑路径示例 👉`,
  timestamp: new Date().toISOString(),
  reasoning: MOCK_REASONING
};

export default function AgentConversation({ onNavigate }: AgentConversationProps) {
  // 状态
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(WELCOME_MESSAGE);
  const [showReasoning, setShowReasoning] = useState(true);
  const [patterns, setPatterns] = useState<DiscoveredPattern[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [showPatterns, setShowPatterns] = useState(false);

  // @提及智能体相关状态
  const [currentAgent, setCurrentAgent] = useState<Agent>(AVAILABLE_AGENTS[0]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // 已选择的智能体列表（多选）
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  // 对话历史
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputText || `分析 ${uploadedFiles.length} 个文件`,
      timestamp: new Date().toISOString(),
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAnalyzing(true);

    // 模拟分析
    await delay(2000);

    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: `分析完成。基于您提供的${uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join('、') : '数据'}，我完成了产能预测分析：

**预测结果**
• 未来7天日均产能：**1,920件**（置信度85%）
• 基线产能：1,850件/天
• 趋势：上升3.8%

**关键发现**
• 周一产能通常比平均值低15%（历史规律）
• 设备EQ-001计划维护将影响周三产出约10%

**建议行动**
1. 提前安排周一的加班计划补足缺口
2. 将高优先级订单安排在周二、周四执行
3. 关注EQ-001维护进度，准备备用产能方案`,
      timestamp: new Date().toISOString(),
      reasoning: MOCK_REASONING
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsAnalyzing(false);

    // 模拟发现新模式
    if (patterns.length === 0) {
      setPatterns([
        {
          id: 'p1',
          type: 'constraint',
          name: '周一产能下降规律',
          description: '检测到周一产能系统性低于其他工作日15%，可作为默认约束',
          confidence: 0.92
        },
        {
          id: 'p2',
          type: 'skill',
          name: '设备维护影响评估',
          description: '根据维护计划自动调整产能预测',
          confidence: 0.78
        }
      ]);
    }
  }, [inputText, uploadedFiles, patterns.length]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 文件上传（支持多文件）
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 模拟解析每个文件
    files.forEach((file, index) => {
      setTimeout(() => {
        setUploadedFiles(prev => [...prev, {
          id: `file_${Date.now()}_${index}`,
          name: file.name,
          rowCount: Math.floor(Math.random() * 200) + 50,
          columns: ['日期', '产线ID', '实际产量', '计划产量', 'OEE', '设备状态']
        }]);
      }, 300 * (index + 1));
    });
  };

  // 加载演示数据
  const loadDemoData = () => {
    const demoData = generateDemoData();
    setUploadedFiles(demoData);
  };

  // 移除已上传文件
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 保存模式
  const savePattern = (patternId: string) => {
    setPatterns(prev => prev.filter(p => p.id !== patternId));
    // 实际应保存到用户知识库
  };

  // 处理@提及（智能体或文件）
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setInputText(value);
    setCursorPosition(cursor);

    // 检测是否正在输入@
    const beforeCursor = value.slice(0, cursor);
    const afterAt = beforeCursor.split('@').pop() || '';
    const isMentioning = beforeCursor.includes('@') && !afterAt.includes(' ');

    if (isMentioning) {
      setMentionQuery(afterAt.toLowerCase());
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  // 选择智能体（顶部栏）
  const selectAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setShowAgentSelector(false);
  };

  // 切换智能体选择状态（多选）
  const toggleAgent = (agent: Agent) => {
    setSelectedAgents(prev => {
      const isSelected = prev.some(a => a.id === agent.id);
      if (isSelected) {
        return prev.filter(a => a.id !== agent.id);
      }
      return [...prev, agent];
    });
  };

  // 移除已选择的智能体
  const removeAgent = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(a => a.id !== agentId));
  };

  // 创建新对话
  const createNewChat = useCallback(() => {
    // 使用函数式更新保存当前对话到历史
    setChatHistory(prevHistory => {
      if (messages.length > 1) {
        const title = messages[1]?.content?.slice(0, 20) || '新对话';
        const now = new Date().toISOString();

        if (currentChatId) {
          // 更新现有对话
          return prevHistory.map(c =>
            c.id === currentChatId
              ? { ...c, messages: [...messages], updatedAt: now }
              : c
          );
        } else {
          // 创建新的历史记录
          const newChat: ChatHistory = {
            id: `chat_${Date.now()}`,
            title,
            messages: [...messages],
            createdAt: now,
            updatedAt: now
          };
          return [newChat, ...prevHistory];
        }
      }
      return prevHistory;
    });

    // 创建新的欢迎消息
    const welcomeMsg: Message = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: `欢迎使用智能推演助手！我可以帮您分析产能、优化排程、检测异常等。\n\n**我可以做什么：**\n• 产能预测 - 基于历史数据预测未来产能\n• 排程优化 - 智能安排生产计划\n• 异常检测 - 发现生产中的异常情况\n• 需求预测 - 预测市场需求趋势\n\n**开始使用：**\n1. 上传您的生产数据文件（CSV/Excel）\n2. 或直接输入您的问题\n3. 我会展示完整的推演逻辑路径`,
      timestamp: new Date().toISOString(),
      reasoning: MOCK_REASONING
    };

    // 清空当前对话状态
    setMessages([welcomeMsg]);
    setCurrentChatId(null);
    setInputText('');
    setUploadedFiles([]);
    setSelectedAgents([]);
    setSelectedMessage(null);
    setShowReasoning(false);
  }, [messages, currentChatId]);

  // 加载历史对话
  const loadChat = useCallback((chatId: string) => {
    setChatHistory(prevHistory => {
      const chat = prevHistory.find(c => c.id === chatId);
      if (chat) {
        setMessages(chat.messages);
        setCurrentChatId(chatId);
        return prevHistory.map(c =>
          c.id === chatId ? { ...c, updatedAt: new Date().toISOString() } : c
        );
      }
      return prevHistory;
    });
  }, []);

  // 删除历史对话
  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      // 创建新的欢迎消息
      const welcomeMsg: Message = {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: `欢迎使用智能推演助手！我可以帮您分析产能、优化排程、检测异常等。\n\n**我可以做什么：**\n• 产能预测 - 基于历史数据预测未来产能\n• 排程优化 - 智能安排生产计划\n• 异常检测 - 发现生产中的异常情况\n• 需求预测 - 预测市场需求趋势\n\n**开始使用：**\n1. 上传您的生产数据文件（CSV/Excel）\n2. 或直接输入您的问题\n3. 我会展示完整的推演逻辑路径`,
        timestamp: new Date().toISOString(),
        reasoning: MOCK_REASONING
      };
      setMessages([welcomeMsg]);
    }
  };

  // 保存当前对话到历史
  const saveCurrentChat = () => {
    if (messages.length <= 1) return; // 只有欢迎消息不保存

    const title = messages[1]?.content.slice(0, 20) || '新对话';
    const now = new Date().toISOString();

    if (currentChatId) {
      // 更新现有对话
      setChatHistory(prev => prev.map(c =>
        c.id === currentChatId
          ? { ...c, messages: [...messages], updatedAt: now }
          : c
      ));
    } else {
      // 创建新对话
      const newChat: ChatHistory = {
        id: `chat_${Date.now()}`,
        title,
        messages: [...messages],
        createdAt: now,
        updatedAt: now
      };
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    }
  };

  // 从@下拉菜单选择项（智能体或文件）
  const selectMentionItem = (item: MentionableItem) => {
    const beforeCursor = inputText.slice(0, cursorPosition);
    const afterCursor = inputText.slice(cursorPosition);
    const beforeAt = beforeCursor.slice(0, beforeCursor.lastIndexOf('@'));
    const newText = `${beforeAt}@${item.name} ${afterCursor}`;
    setInputText(newText);
    setShowMentionDropdown(false);

    // 如果选择的是智能体，同时切换当前智能体
    if (item.type === 'agent') {
      const agent = AVAILABLE_AGENTS.find(a => a.id === item.id);
      if (agent) setCurrentAgent(agent);
    }

    textareaRef.current?.focus();
  };

  // 获取所有可@提及的项（智能体 + 文件）
  const getMentionableItems = (): MentionableItem[] => {
    const agents: MentionableItem[] = AVAILABLE_AGENTS.map(agent => ({
      type: 'agent' as const,
      id: agent.id,
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      color: agent.color
    }));

    const files: MentionableItem[] = uploadedFiles.map(file => ({
      type: 'file' as const,
      id: file.id,
      name: file.name,
      description: `${file.rowCount} 行 · ${file.columns.join(', ').slice(0, 30)}...`,
      rowCount: file.rowCount
    }));

    return [...agents, ...files];
  };

  // 过滤可@提及的项
  const filteredItems = mentionQuery
    ? getMentionableItems().filter(item =>
        item.name.toLowerCase().includes(mentionQuery) ||
        item.description.toLowerCase().includes(mentionQuery)
      )
    : getMentionableItems();

  // 按类型分组
  const agentItems = filteredItems.filter(item => item.type === 'agent');
  const fileItems = filteredItems.filter(item => item.type === 'file');

  // 查看推演详情
  const viewReasoning = (message: Message) => {
    setSelectedMessage(message);
    setShowReasoning(true);
  };

  return (
    <div className="h-screen bg-[#f8fafc] text-[#1e293b] flex text-sm overflow-hidden">
      {/* 左侧：对话管理侧边栏 */}
      <div className="w-64 border-r border-[#e2e8f0] bg-white flex flex-col">
        {/* 侧边栏标题 */}
        <div className="h-12 px-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <span className="font-medium text-[#1e293b]">对话</span>
        </div>

        {/* +新对话按钮 */}
        <div className="p-3" style={STYLES.buttonContainer}>
          <button
            onClick={() => createNewChat()}
            style={STYLES.newChatButton}
          >
            <Plus size={16} />
            <span>新对话</span>
          </button>
        </div>

        {/* 历史对话列表 */}
        <div className="flex-1 overflow-auto px-3 pb-3">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8 text-[#94a3b8] text-xs">
              暂无历史对话
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-[#f1f5f9]'
                      : 'hover:bg-[#f8fafc]'
                  }`}
                >
                  <Bot size={16} className="text-[#64748b] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#1e293b] truncate">
                      {chat.title}
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ef4444]/10 rounded text-[#64748b] hover:text-[#ef4444] transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 中间：对话区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <div className="h-12 px-4 border-b border-[#e2e8f0] flex items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-[#f1f5f9] rounded-lg text-[#64748b] transition-colors"
              title="返回控制面板"
            >
              <ChevronLeft size={18} />
            </button>

            {/* 当前智能体选择器 */}
            <div className="relative">
              <button
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#e2e8f0] rounded-lg border border-[#e2e8f0] transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentAgent.color }}
                />
                <span className="text-sm text-[#1e293b]">{currentAgent.name}</span>
                <ChevronDown size={14} className="text-[#64748b]" />
              </button>

              {/* 智能体下拉菜单 */}
              {showAgentSelector && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#e2e8f0] rounded-lg shadow-xl z-50">
                  <div className="p-2 text-[10px] text-[#64748b] uppercase bg-[#f8fafc] rounded-t-lg">选择智能体 (输入 @ 快速切换)</div>
                  {AVAILABLE_AGENTS.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => selectAgent(agent)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8fafc] transition-colors ${
                        currentAgent.id === agent.id ? 'bg-[#f8fafc]' : ''
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${agent.color}20` }}
                      >
                        <Bot size={16} style={{ color: agent.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm text-[#1e293b]">{agent.name}</div>
                        <div className="text-[10px] text-[#64748b]">{agent.description}</div>
                      </div>
                      {currentAgent.id === agent.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patterns.length > 0 && (
              <button
                onClick={() => setShowPatterns(!showPatterns)}
                className="px-3 py-1.5 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#d97706] rounded-md text-xs flex items-center gap-1.5 transition-colors border border-[#f59e0b]/30"
              >
                <Lightbulb size={14} />
                发现 {patterns.length} 个模式
              </button>
            )}
            <button className="p-2 hover:bg-[#f1f5f9] rounded-md text-[#64748b]">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyState onUpload={() => fileInputRef.current?.click()} onDemo={loadDemoData} />
          ) : (
            messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                isSelected={selectedMessage?.id === message.id}
                onViewReasoning={() => viewReasoning(message)}
              />
            ))
          )}
          {isAnalyzing && <AnalyzingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="p-4 border-t border-[#e2e8f0] bg-white">
          {/* 已上传文件 */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <FileSpreadsheet size={16} className="text-[#10b981]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#1e293b]">{file.name}</div>
                    <div className="text-[10px] text-[#64748b]">
                      {file.rowCount} 行 · {file.columns.length} 列
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-[#ef4444]/10 rounded text-[#64748b] hover:text-[#ef4444]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 已选择智能体 */}
          {selectedAgents.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedAgents.map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e2e8f0]"
                  style={{ backgroundColor: `${agent.color}15` }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${agent.color}30` }}
                  >
                    <Bot size={12} style={{ color: agent.color }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: agent.color }}>
                    {agent.name}
                  </span>
                  <button
                    onClick={() => removeAgent(agent.id)}
                    className="p-0.5 hover:bg-white/50 rounded transition-colors"
                    style={{ color: agent.color }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 输入框 */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-[#f1f5f9] rounded-xl text-[#64748b] transition-colors"
            >
              <Upload size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !showMentionDropdown) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入 @ 提及智能体或文件..."
                rows={1}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none resize-none min-h-[46px] max-h-[120px]"
                style={{ height: 'auto' }}
              />

              {/* @提及下拉菜单 */}
              {showMentionDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-[#e2e8f0] rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
                  {filteredItems.length === 0 ? (
                    <div className="p-3 text-[#64748b] text-xs">未找到匹配项</div>
                  ) : (
                    <>
                      {/* 智能体分组 */}
                      {agentItems.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-[10px] text-[#64748b] uppercase font-medium bg-[#f8fafc]">
                            智能体
                          </div>
                          {agentItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => selectMentionItem(item)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8fafc] transition-colors text-left"
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${(item as MentionableAgent).color}20` }}
                              >
                                <Bot size={16} style={{ color: (item as MentionableAgent).color }} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm text-[#1e293b] truncate">{item.name}</div>
                                <div className="text-[10px] text-[#64748b] truncate">{item.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 文件分组 */}
                      {fileItems.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-[10px] text-[#64748b] uppercase font-medium bg-[#f8fafc] border-t border-[#e2e8f0]">
                            已上传文件
                          </div>
                          {fileItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => selectMentionItem(item)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8fafc] transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center shrink-0">
                                <FileSpreadsheet size={16} className="text-[#10b981]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm text-[#1e293b] truncate">{item.name}</div>
                                <div className="text-[10px] text-[#64748b]">
                                  {(item as MentionableFile).rowCount} 行
                                </div>
                              </div>
                              <div className="text-[10px] px-1.5 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded shrink-0">
                                文件
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={isAnalyzing || (!inputText.trim() && uploadedFiles.length === 0)}
              className="p-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {isAnalyzing ? (
                <Activity size={18} className="animate-pulse" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          {/* 智能体选择器 */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e2e8f0]">
            <span className="text-[10px] text-[#64748b] uppercase font-medium">选择智能体:</span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_AGENTS.map(agent => {
                const isSelected = selectedAgents.some(a => a.id === agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                      isSelected
                        ? 'ring-1 ring-offset-0'
                        : 'hover:bg-[#f1f5f9] opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${agent.color}20` : 'transparent',
                      color: isSelected ? agent.color : '#64748b',
                      boxShadow: isSelected ? `0 0 0 1px ${agent.color}` : 'none'
                    }}
                  >
                    <Bot size={12} />
                    <span className="text-[10px]">{agent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：推演详情面板（30%，可折叠） */}
      {showReasoning && selectedMessage?.reasoning && (
        <ReasoningPanel
          reasoning={selectedMessage.reasoning}
          onClose={() => setShowReasoning(false)}
        />
      )}

      {/* 右侧面板：知识发现（可切换） */}
      {showPatterns && patterns.length > 0 && (
        <PatternPanel
          patterns={patterns}
          onSave={savePattern}
          onClose={() => setShowPatterns(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// 子组件
// ============================================================================

// 空状态
function EmptyState({ onUpload, onDemo }: { onUpload: () => void; onDemo?: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-[#64748b] px-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 flex items-center justify-center mb-4">
        <Brain size={32} className="text-[#3b82f6]" />
      </div>
      <h3 className="text-lg font-medium text-[#1e293b] mb-2">开始您的产能分析</h3>
      <p className="text-sm text-center mb-6 max-w-md">
        上传包含生产记录的Excel文件，使用演示数据体验功能，或输入您的问题。
      </p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        <button
          onClick={onUpload}
          className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#3b82f6] rounded-xl transition-colors group"
        >
          <Upload size={24} className="text-[#3b82f6] group-hover:scale-110 transition-transform" />
          <span className="text-xs text-[#1e293b]">上传数据文件</span>
        </button>
        <button
          onClick={onDemo}
          className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#3b82f6] rounded-xl transition-colors group"
        >
          <Sparkles size={24} className="text-[#f59e0b] group-hover:scale-110 transition-transform" />
          <span className="text-xs text-[#1e293b]">加载演示数据</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#3b82f6] rounded-xl transition-colors group">
          <BarChart3 size={24} className="text-[#10b981] group-hover:scale-110 transition-transform" />
          <span className="text-xs text-[#1e293b]">查看示例分析</span>
        </button>
      </div>
      <div className="mt-6 text-[10px] text-[#64748b] text-center">
        <p>演示数据包含：90条生产记录 + 5条设备信息 + 20条订单数据</p>
      </div>
    </div>
  );
}

// 消息气泡
function MessageBubble({
  message,
  isSelected,
  onViewReasoning
}: {
  message: Message;
  isSelected: boolean;
  onViewReasoning: () => void;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isSelected ? 'opacity-100' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-[#3b82f6]' : 'bg-gradient-to-br from-[#10b981] to-[#059669]'
      }`}>
        {isUser ? <span className="text-xs font-bold text-white">我</span> : <Bot size={16} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">{isUser ? '我' : '产能助手'}</span>
          <span className="text-[10px] text-[#64748b]">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.reasoning && (
            <button
              onClick={onViewReasoning}
              className="text-[10px] px-2 py-0.5 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-full flex items-center gap-1 transition-colors"
            >
              <Zap size={10} />
              查看推演
            </button>
          )}
        </div>
        <div className="text-sm text-[#1e293b] whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map(att => (
              <span
                key={att.id}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#f1f5f9] rounded text-[10px] text-[#64748b]"
              >
                <FileSpreadsheet size={12} className="text-[#10b981]" />
                {att.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 分析中指示器
function AnalyzingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium">产能助手</span>
          <span className="text-[10px] text-[#64748b]">分析中...</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-[#e2e8f0] rounded-full" />
            <div className="absolute inset-0 border-2 border-[#3b82f6] rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#1e293b]">正在推演分析...</div>
            <div className="text-[10px] text-[#64748b] mt-0.5">
              意图识别 → 数据理解 → 模型推演 → 约束检查
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 推演逻辑图组件
function ReasoningLogicGraph({ reasoning }: { reasoning: ReasoningTrace }) {
  // 7步推演流程节点
  const flowNodes = [
    { id: 'intent', label: '意图解析', icon: Target, color: '#3b82f6', desc: reasoning.intent },
    { id: 'ontology', label: '本体解析', icon: Database, color: '#8b5cf6', desc: `${reasoning.entities.length}个实体` },
    { id: 'binding', label: '数据绑定', icon: GitBranch, color: '#06b6d4', desc: '映射数据源' },
    { id: 'skill', label: '技能选择', icon: Cpu, color: '#10b981', desc: `${reasoning.skills.length}个技能` },
    { id: 'constraint', label: '约束注入', icon: Shield, color: '#ef4444', desc: `${reasoning.constraints.length}个约束` },
    { id: 'simulation', label: '仿真推演', icon: Layers, color: '#f59e0b', desc: '多策略推演' },
    { id: 'result', label: '结果结构化', icon: CheckCircle, color: '#10b981', desc: '置信度85%' },
  ];

  return (
    <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg p-4 border border-[#e2e8f0]">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={14} className="text-[#3b82f6]" />
        <span className="text-[10px] text-[#64748b] uppercase font-medium">推演逻辑路径</span>
      </div>

      {/* 垂直流程图 */}
      <div className="relative">
        {/* 连接线 */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#3b82f6] via-[#8b5cf6] to-[#10b981]" />

        <div className="space-y-3">
          {flowNodes.map((node, idx) => {
            const Icon = node.icon;
            const isActive = idx <= flowNodes.findIndex(n => n.id === 'result');

            return (
              <div key={node.id} className="flex items-start gap-3 relative">
                {/* 节点圆圈 */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                    isActive ? 'shadow-md' : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: `${node.color}20`,
                    border: `2px solid ${isActive ? node.color : '#e2e8f0'}`,
                  }}
                >
                  <Icon size={16} style={{ color: node.color }} />
                </div>

                {/* 节点内容 */}
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#1e293b]">{node.label}</span>
                    {idx === flowNodes.length - 1 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#10b981]/20 text-[#10b981] rounded">完成</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">{node.desc}</div>

                  {/* 展开详情 */}
                  {node.id === 'intent' && (
                    <div className="mt-2 text-[10px] bg-white/50 rounded p-2 text-[#475569]">
                      识别分析意图：{reasoning.intent}
                    </div>
                  )}
                  {node.id === 'ontology' && reasoning.entities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reasoning.entities.map(entity => (
                        <span key={entity} className="text-[9px] px-1.5 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded">
                          {entity}
                        </span>
                      ))}
                    </div>
                  )}
                  {node.id === 'skill' && reasoning.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reasoning.skills.map(skill => (
                        <span key={skill} className="text-[9px] px-1.5 py-0.5 bg-[#10b981]/10 text-[#10b981] rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {node.id === 'constraint' && reasoning.constraints.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reasoning.constraints.map(constraint => (
                        <span key={constraint} className="text-[9px] px-1.5 py-0.5 bg-[#ef4444]/10 text-[#ef4444] rounded">
                          {constraint}
                        </span>
                      ))}
                    </div>
                  )}
                  {node.id === 'simulation' && (
                    <div className="mt-2 space-y-1">
                      {reasoning.steps.slice(2, 5).map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          <span className="text-[#64748b]">{step.name}</span>
                          <span className="text-[#94a3b8]">({step.duration}ms)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 溯源路径总结 */}
      <div className="mt-4 pt-3 border-t border-[#e2e8f0]">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#64748b]">推演路径</span>
          <span className="text-[#3b82f6] font-mono">
            {flowNodes.filter(n => n.id !== 'result').map(n => n.label.slice(0, 2)).join(' → ')} → 结果
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-1">
          <span className="text-[#64748b]">总耗时</span>
          <span className="text-[#1e293b] font-mono">{reasoning.steps.reduce((sum, s) => sum + s.duration, 0)}ms</span>
        </div>
      </div>
    </div>
  );
}

// 推演详情面板
function ReasoningPanel({
  reasoning,
  onClose
}: {
  reasoning: ReasoningTrace;
  onClose: () => void;
}) {
  return (
    <div className="w-[480px] bg-white border-l border-[#e2e8f0] flex flex-col animate-in slide-in-from-right">
      {/* 头部 */}
      <div className="h-12 px-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#3b82f6]" />
          <span className="font-medium text-[#1e293b]">推演过程</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#e2e8f0] rounded text-[#64748b]"
        >
          <X size={16} />
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 推演逻辑图 */}
        <ReasoningLogicGraph reasoning={reasoning} />

        {/* 执行步骤详情 */}
        <div className="space-y-2">
          <div className="text-[10px] text-[#64748b] uppercase font-medium">执行步骤详情</div>
          {reasoning.steps.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-start gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] hover:border-[#3b82f6]/30 transition-colors"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                step.status === 'completed'
                  ? 'bg-[#10b981]/20 text-[#10b981]'
                  : 'bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#1e293b]">{step.name}</span>
                  <span className="text-[10px] text-[#64748b] font-mono">{step.duration}ms</span>
                </div>
                {step.output && (
                  <div className="text-[10px] text-[#64748b] mt-1 bg-white/50 rounded p-1.5">{step.output}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 结果摘要 */}
        <div className="bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/10 rounded-lg p-4 border border-[#3b82f6]/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-[#10b981]" />
            <span className="text-xs font-medium text-[#1e293b]">分析完成</span>
            <span className="text-[10px] text-[#64748b] ml-auto">
              置信度 {(reasoning.result.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-[#64748b]">{reasoning.result.summary}</p>
        </div>
      </div>
    </div>
  );
}

// 知识发现面板
function PatternPanel({
  patterns,
  onSave,
  onClose
}: {
  patterns: DiscoveredPattern[];
  onSave: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="w-80 bg-white border-l border-[#e2e8f0] flex flex-col animate-in slide-in-from-right">
      <div className="h-12 px-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#f59e0b]" />
          <span className="font-medium text-[#1e293b]">发现模式</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#f1f5f9] rounded text-[#64748b]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        <p className="text-xs text-[#64748b]">
          系统从您的分析中发现了可复用的模式，保存后可提升未来分析效率。
        </p>

        {patterns.map(pattern => (
          <div
            key={pattern.id}
            className="bg-[#f8fafc] rounded-lg p-3 space-y-2 border border-[#e2e8f0]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <PatternIcon type={pattern.type} />
                <span className="text-xs font-medium text-[#1e293b]">
                  {pattern.name}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] rounded">
                {(pattern.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-[#64748b]">{pattern.description}</p>
            <button
              onClick={() => onSave(pattern.id)}
              className="w-full py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] rounded text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Save size={12} />
              保存到知识库
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 模式类型图标
function PatternIcon({ type }: { type: string }) {
  const icons = {
    skill: <Zap size={14} className="text-[#f59e0b]" />,
    constraint: <Shield size={14} className="text-[#ef4444]" />,
    entity: <Database size={14} className="text-[#3b82f6]" />
  };
  return icons[type as keyof typeof icons] || <Sparkles size={14} />;
}
