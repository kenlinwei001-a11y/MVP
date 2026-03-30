import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Sparkles, Brain, MoreVertical } from 'lucide-react';

interface ChatProps {
  onNavigate: (page: string) => void;
}

// Apple 3-Color Palette
const colors = {
  bg: { primary: '#FFFFFF', secondary: '#F5F5F7', tertiary: '#E8E8ED' },
  accent: '#007AFF',
  text: { primary: '#1D1D1F', secondary: '#6E6E73', tertiary: '#86868B' }
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat({ onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是 Decision Copilot，您的智能制造决策助手。我可以帮您分析产能、优化排程、预测需求等。请告诉我您想了解什么？',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '我已经分析了您的问题。基于当前数据和约束条件，建议您考虑优化产线A的换型时间，这可以提升整体OEE约8%。需要我生成详细的分析报告吗？',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.bg.secondary }}>
      {/* Header */}
      <header style={{
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.bg.tertiary}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: colors.text.secondary
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
            智能对话
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: colors.bg.secondary,
            borderRadius: '6px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }} />
            <span style={{ fontSize: '12px', color: colors.text.secondary }}>在线</span>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: colors.text.secondary
          }}>
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: colors.accent,
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
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                backgroundColor: msg.role === 'user' ? colors.accent : colors.bg.primary,
                color: msg.role === 'user' ? 'white' : colors.text.primary,
                fontSize: '14px',
                lineHeight: 1.5,
                boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.06)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={16} color="white" />
              </div>
              <div style={{
                padding: '12px 16px',
                backgroundColor: colors.bg.primary,
                borderRadius: '12px 12px 12px 4px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.text.tertiary, animation: 'pulse 1.4s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.text.tertiary, animation: 'pulse 1.4s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.text.tertiary, animation: 'pulse 1.4s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: colors.bg.primary,
        borderTop: `1px solid ${colors.bg.tertiary}`
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的问题..."
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1px solid ${colors.bg.tertiary}`,
              backgroundColor: colors.bg.secondary,
              fontSize: '14px',
              outline: 'none',
              color: colors.text.primary
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: inputText.trim() ? colors.accent : colors.bg.tertiary,
              color: inputText.trim() ? 'white' : colors.text.tertiary,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
