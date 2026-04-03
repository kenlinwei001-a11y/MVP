/**
 * 对话相关类型定义
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  reasoning?: ReasoningTrace;
}

export interface Attachment {
  id: string;
  name: string;
  rowCount: number;
  columns: string[];
  data?: any[];
}

export interface ReasoningTrace {
  intent: string;
  entities: string[];
  skills: string[];
  constraints: string[];
  steps: ReasoningStep[];
  result: {
    summary: string;
    confidence: number;
    recommendations: string[];
  };
}

export interface ReasoningStep {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  duration: number;
  output?: string;
}

// 可@提及项类型
export interface MentionableAgent {
  type: 'agent';
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface MentionableFile {
  type: 'file';
  id: string;
  name: string;
  description: string;
  rowCount: number;
}

export type MentionableItem = MentionableAgent | MentionableFile;

export interface DiscoveredPattern {
  id: string;
  type: 'skill' | 'constraint' | 'entity';
  name: string;
  description: string;
  confidence: number;
}

// 智能体定义
export interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

// 对话历史类型
export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
