import React from 'react';
import { ChevronLeft, User, Database, Bell, Shield, ChevronRight } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

// Apple 3-Color Palette
const colors = {
  bg: { primary: '#FFFFFF', secondary: '#F5F5F7', tertiary: '#E8E8ED' },
  accent: '#007AFF',
  text: { primary: '#1D1D1F', secondary: '#6E6E73', tertiary: '#86868B' }
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
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg.secondary }}>
      {/* Header */}
      <header style={{
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.bg.tertiary}`
      }}>
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
          设置
        </span>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        {settingsGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '12px'
            }}>
              {group.title}
            </div>

            <div style={{
              backgroundColor: colors.bg.primary,
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: index < group.items.length - 1 ? `1px solid ${colors.bg.secondary}` : 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <item.icon size={20} color={colors.accent} style={{ marginRight: '12px' }} />
                  <span style={{
                    flex: 1,
                    fontSize: '14px',
                    color: colors.text.primary
                  }}>
                    {item.label}
                  </span>
                  {item.value && (
                    <span style={{
                      fontSize: '13px',
                      color: colors.text.secondary,
                      marginRight: '8px'
                    }}>
                      {item.value}
                    </span>
                  )}
                  <ChevronRight size={18} color={colors.text.tertiary} />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div style={{
          textAlign: 'center',
          padding: '32px',
          color: colors.text.tertiary,
          fontSize: '12px'
        }}>
          <div>Decision Copilot v2.1.0</div>
          <div style={{ marginTop: '4px' }}>© 2026 All rights reserved</div>
        </div>
      </main>
    </div>
  );
}
