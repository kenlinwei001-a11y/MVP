import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Brain, MoreVertical, History, Plus, Trash2, X, MessageSquare, Bot, ChevronDown } from 'lucide-react';

interface ChatProps {
  onNavigate: (page: string) => void;
}

// Palantir Industrial Theme - 高对比度
const theme = {
  bg: { primary: '#1e293b', secondary: '#334155', tertiary: '#253449' },
  accent: '#3b82f6',
  text: { primary: '#ffffff', secondary: '#f1f5f9', tertiary: '#cbd5e1' },
  border: '#3d5166'
};

// 智能体列表
const agents = [
  { id: 'agent_001', name: '电池需求预测智能体', icon: Bot, status: 'active', description: '需求预测' },
  { id: 'agent_002', name: '产能排程优化智能体', icon: Bot, status: 'active', description: '排程优化' },
  { id: 'agent_003', name: '异常检测与告警智能体', icon: Bot, status: 'draft', description: '异常检测' },
  { id: 'default', name: '默认助手', icon: Brain, status: 'active', description: '通用对话' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const STORAGE_KEY = 'decision_copilot_chat_history';

// 加载历史对话
const loadChatHistory = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
  return [];
};

// 保存历史对话
const saveChatHistory = (sessions: ChatSession[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

// 生成对话标题
const generateTitle = (messages: Message[]): string => {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    return firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
  }
  return '新对话';
};

export default function Chat({ onNavigate }: ChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentSelectorRef = useRef<HTMLDivElement>(null);

  // 初始化加载
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setSessions(history);
      setCurrentSessionId(history[0].id);
      setMessages(history[0].messages);
    } else {
      // 创建默认对话
      const defaultSession: ChatSession = {
        id: Date.now().toString(),
        title: '新对话',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: `您好！我是 ${selectedAgent.name}。我可以帮您${selectedAgent.description}。请告诉我您想了解什么？`,
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      setSessions([defaultSession]);
      setCurrentSessionId(defaultSession.id);
      setMessages(defaultSession.messages);
    }
  }, [selectedAgent]);

  // 保存到 localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      saveChatHistory(sessions);
    }
  }, [sessions]);

  // 更新当前会话的消息
  const updateCurrentSession = (newMessages: Message[]) => {
    setMessages(newMessages);
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: newMessages,
          title: session.title === '新对话' ? generateTitle(newMessages) : session.title,
          updatedAt: new Date().toISOString()
        };
      }
      return session;
    }));
  };

  // 创建新对话
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: '您好！我是 Decision Copilot，您的智能制造决策助手。我可以帮您分析产能、优化排程、预测需求等。请告诉我您想了解什么？',
          timestamp: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
    setShowHistory(false);
  };

  // 切换对话
  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowHistory(false);
    }
  };

  // 删除对话
  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== sessionId);
    if (newSessions.length === 0) {
      // 如果删完了，创建一个新的
      const defaultSession: ChatSession = {
        id: Date.now().toString(),
        title: '新对话',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: `您好！我是 ${selectedAgent.name}。我可以帮您${selectedAgent.description}。请告诉我您想了解什么？`,
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      setSessions([defaultSession]);
      setCurrentSessionId(defaultSession.id);
      setMessages(defaultSession.messages);
    } else {
      setSessions(newSessions);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(newSessions[0].id);
        setMessages(newSessions[0].messages);
      }
    }
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 点击外部关闭智能体选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentSelectorRef.current && !agentSelectorRef.current.contains(event.target as Node)) {
        setShowAgentSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    updateCurrentSession(newMessages);
    setInputText('');
    setIsTyping(true);

    // Simulate response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '我已经分析了您的问题。基于当前数据和约束条件，建议您考虑优化产线A的换型时间，这可以提升整体OEE约8%。需要我生成详细的分析报告吗？',
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...newMessages, assistantMsg];
      updateCurrentSession(finalMessages);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: theme.bg.primary }}>
      {/* Header */}
      <header style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        backgroundColor: theme.bg.secondary,
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: theme.text.tertiary
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Agent Selector */}
          <div ref={agentSelectorRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: showAgentSelector ? `${theme.accent}20` : 'transparent',
                borderRadius: '4px',
                border: `1px solid ${showAgentSelector ? theme.accent : theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <selectedAgent.icon size={14} style={{ color: selectedAgent.status === 'active' ? '#10b981' : '#f59e0b' }} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: theme.text.primary }}>
                {selectedAgent.name}
              </span>
              <ChevronDown size={12} style={{ color: theme.text.tertiary, transform: showAgentSelector ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s ease' }} />
            </button>

            {/* Agent Dropdown */}
            {showAgentSelector && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '240px',
                backgroundColor: theme.bg.secondary,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 200,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderBottom: `1px solid ${theme.border}`,
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: theme.text.tertiary
                }}>
                  选择智能体
                </div>
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowAgentSelector(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      backgroundColor: selectedAgent.id === agent.id ? `${theme.accent}20` : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      backgroundColor: agent.status === 'active' ? '#10b98120' : '#f59e0b20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <agent.icon size={14} style={{ color: agent.status === 'active' ? '#10b981' : '#f59e0b' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: selectedAgent.id === agent.id ? 600 : 400,
                        color: selectedAgent.id === agent.id ? theme.accent : theme.text.primary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '10px', color: theme.text.tertiary, marginTop: '2px' }}>
                        {agent.description}
                      </div>
                    </div>
                    {selectedAgent.id === agent.id && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: theme.accent
                      }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              backgroundColor: showHistory ? theme.accent : 'transparent',
              borderRadius: '4px',
              border: `1px solid ${showHistory ? theme.accent : theme.border}`,
              cursor: 'pointer',
              color: showHistory ? 'white' : theme.text.secondary,
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            <History size={14} />
            <span>历史</span>
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: theme.bg.tertiary,
            borderRadius: '4px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: '11px', color: theme.text.tertiary }}>在线</span>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: 0,
          width: '260px',
          height: 'calc(100vh - 40px)',
          backgroundColor: theme.bg.secondary,
          borderLeft: `1px solid ${theme.border}`,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '12px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text.primary }}>
              历史对话 ({sessions.length})
            </span>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: theme.text.tertiary
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* New Chat Button */}
          <div style={{ padding: '10px 12px' }}>
            <button
              onClick={createNewSession}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                backgroundColor: theme.accent,
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              <Plus size={14} />
              <span>新建对话</span>
            </button>
          </div>

          {/* Sessions List */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '0 10px 10px'
          }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => switchSession(session.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: session.id === currentSessionId ? `${theme.accent}20` : 'transparent',
                  border: `1px solid ${session.id === currentSessionId ? theme.accent : 'transparent'}`
                }}
              >
                <MessageSquare
                  size={16}
                  color={session.id === currentSessionId ? theme.accent : theme.text.tertiary}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: session.id === currentSessionId ? 600 : 400,
                      color: session.id === currentSessionId ? theme.text.primary : theme.text.secondary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {session.title}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: theme.text.tertiary,
                    marginTop: '2px'
                  }}>
                    {formatDate(session.updatedAt)} · {session.messages.length} 条消息
                  </div>
                </div>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: theme.text.tertiary,
                    opacity: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        marginRight: showHistory ? '260px' : '0',
        transition: 'margin-right 0.3s ease'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: theme.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Brain size={16} color="white" />
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '10px 10px 4px 10px' : '10px 10px 10px 4px',
                  backgroundColor: msg.role === 'user' ? theme.accent : theme.bg.secondary,
                  color: msg.role === 'user' ? 'white' : theme.text.primary,
                  fontSize: '14px',
                  lineHeight: 1.5,
                  border: msg.role === 'user' ? 'none' : `1px solid ${theme.border}`
                }}>
                  {msg.content}
                </div>
                <span style={{
                  fontSize: '10px',
                  color: theme.text.tertiary,
                  marginTop: '4px',
                  marginLeft: msg.role === 'user' ? '0' : '4px',
                  marginRight: msg.role === 'user' ? '4px' : '0'
                }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: theme.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={16} color="white" />
              </div>
              <div style={{
                padding: '10px 14px',
                backgroundColor: theme.bg.secondary,
                borderRadius: '10px 10px 10px 4px',
                border: `1px solid ${theme.border}`,
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: theme.text.tertiary, animation: 'pulse 1.4s infinite' }} />
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: theme.text.tertiary, animation: 'pulse 1.4s infinite 0.2s' }} />
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: theme.text.tertiary, animation: 'pulse 1.4s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: theme.bg.secondary,
        borderTop: `1px solid ${theme.border}`,
        marginRight: showHistory ? '260px' : '0',
        transition: 'margin-right 0.3s ease'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的问题..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg.primary,
              fontSize: '14px',
              outline: 'none',
              color: theme.text.primary
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              backgroundColor: inputText.trim() ? theme.accent : theme.bg.tertiary,
              border: 'none',
              borderRadius: '6px',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
