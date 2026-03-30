import React, { useState } from 'react';
import {
  Home, MessageSquare, Database, Settings,
  Sparkles, AlertCircle, Calendar, Zap, Target,
  ChevronRight, Brain, GitBranch, BarChart3, Clock,
  Search, Plus
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

// Apple 3-Color Palette
const colors = {
  bg: { primary: '#FFFFFF', secondary: '#F5F5F7', tertiary: '#E8E8ED' },
  accent: '#007AFF',
  text: { primary: '#1D1D1F', secondary: '#6E6E73', tertiary: '#86868B' }
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [inputText, setInputText] = useState('');

  const navItems = [
    { id: 'dashboard', icon: Home, label: '首页', active: true },
    { id: 'chat', icon: MessageSquare, label: '对话分析' },
    { id: 'ontology-studio', icon: Database, label: '本体配置' },
    { id: 'settings', icon: Settings, label: '设置' },
  ];

  const quickQuestions = [
    '为什么产线A产能下降？',
    '当前订单能否按期完成？',
    '如果减少换型时间会怎样？',
    '如何提升OTIF？',
  ];

  const stats = [
    { label: '数据源', value: '12', change: '+2' },
    { label: '本体链', value: '8', change: '+1' },
    { label: '分析任务', value: '156', change: '+23' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: colors.bg.secondary }}>
      {/* Sidebar - Apple Style */}
      <aside style={{
        width: '220px',
        backgroundColor: colors.bg.secondary,
        borderRight: `1px solid ${colors.bg.tertiary}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '0 8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
            Decision Copilot
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: item.active ? 'rgba(0, 122, 255, 0.12)' : 'transparent',
                color: item.active ? colors.accent : colors.text.secondary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div style={{ marginTop: 'auto', padding: '16px 8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.text.tertiary, marginBottom: '12px', textTransform: 'uppercase' }}>
            系统状态
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: colors.text.secondary }}>{stat.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>{stat.value}</span>
                  <span style={{ fontSize: '11px', color: colors.accent }}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px 32px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.text.primary, marginBottom: '6px' }}>
            决策指挥中心
          </h1>
          <p style={{ fontSize: '14px', color: colors.text.secondary }}>
            连接数据与决策，AI驱动的智能制造分析平台
          </p>
        </div>

        {/* Search Input - Apple Style */}
        <div style={{
          backgroundColor: colors.bg.primary,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: colors.bg.secondary,
            borderRadius: '10px',
            border: `1px solid ${colors.bg.tertiary}`
          }}>
            <Search size={20} color={colors.text.tertiary} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="询问任何关于生产、排产、异常的问题..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                color: colors.text.primary,
                outline: 'none'
              }}
            />
            <button
              onClick={() => onNavigate('chat')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={16} />
              分析
            </button>
          </div>

          {/* Quick Questions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => { setInputText(q); onNavigate('chat'); }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: colors.bg.secondary,
                  border: `1px solid ${colors.bg.tertiary}`,
                  borderRadius: '100px',
                  fontSize: '12px',
                  color: colors.text.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('chat')}
            style={{
              backgroundColor: colors.bg.primary,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 122, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <MessageSquare size={18} color={colors.accent} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary, marginBottom: '4px' }}>
              智能对话
            </h3>
            <p style={{ fontSize: '12px', color: colors.text.secondary }}>
              自然语言交互，智能分析与建议
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('ontology-studio')}
            style={{
              backgroundColor: colors.bg.primary,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 122, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Database size={18} color={colors.accent} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary, marginBottom: '4px' }}>
              本体配置
            </h3>
            <p style={{ fontSize: '12px', color: colors.text.secondary }}>
              可视化建模，约束与关系管理
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: colors.bg.primary,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 122, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <BarChart3 size={18} color={colors.accent} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary, marginBottom: '4px' }}>
              分析报表
            </h3>
            <p style={{ fontSize: '12px', color: colors.text.secondary }}>
              产能、质量、交付可视化分析
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
