import React from 'react';
import { ChevronLeft, User, Database, Bell, Shield, ChevronRight } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

// Palantir Industrial Theme - 高对比度
const theme = {
  bg: { primary: '#1e293b', secondary: '#334155', tertiary: '#475569' },
  accent: '#3b82f6',
  text: { primary: '#ffffff', secondary: '#f1f5f9', tertiary: '#cbd5e1' },
  border: '#3d5166'
};

const settingsGroups = [
  {
    title: '账户',
    items: [
      { icon: User, label: '个人信息', value: '管理员' },
      { icon: Shield, label: '安全设置', value: '已启用' },
    ]
  },
  {
    title: '系统',
    items: [
      { icon: Database, label: '数据源管理', value: '12个已连接' },
      { icon: Bell, label: '通知设置', value: '' },
    ]
  }
];

export default function Settings({ onNavigate }: SettingsProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg.primary }}>
      {/* Header */}
      <header style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 12px',
        backgroundColor: theme.bg.secondary,
        borderBottom: `1px solid ${theme.border}`
      }}>
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
        <span style={{ fontSize: '14px', fontWeight: 600, color: theme.text.primary }}>
          设置
        </span>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
        {settingsGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: theme.text.tertiary,
              textTransform: 'uppercase',
              marginBottom: '6px',
              paddingLeft: '8px',
              letterSpacing: '0.5px'
            }}>
              {group.title}
            </div>

            <div style={{
              backgroundColor: theme.bg.secondary,
              borderRadius: '4px',
              border: `1px solid ${theme.border}`,
              overflow: 'hidden'
            }}>
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderBottom: index < group.items.length - 1 ? `1px solid ${theme.border}` : 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <item.icon size={18} color={theme.accent} style={{ marginRight: '10px' }} />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    color: theme.text.primary
                  }}>
                    {item.label}
                  </span>
                  {item.value && (
                    <span style={{
                      fontSize: '12px',
                      color: theme.text.tertiary,
                      marginRight: '8px'
                    }}>
                      {item.value}
                    </span>
                  )}
                  <ChevronRight size={16} color={theme.text.tertiary} />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          color: theme.text.tertiary,
          fontSize: '11px'
        }}>
          <div>Decision Copilot v2.1.0</div>
          <div style={{ marginTop: '4px' }}>© 2026 All rights reserved</div>
        </div>
      </main>
    </div>
  );
}
