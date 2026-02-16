export interface Agent {
  id: string
  name: string
  description: string
  status: 'active' | 'idle' | 'busy' | 'error'
  model: string
  tasksCompleted: number
  lastActive: string
  createdAt?: string
  canCommunicate: boolean
  systemPrompt?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  agentId: string
  schedule: {
    type: 'cron' | 'interval' | 'once'
    expression: string
    timezone?: string
  }
  status: 'active' | 'paused' | 'running' | 'error'
  prompt: string
  lastRun?: string
  nextRun?: string
  createdAt?: string
}

export interface Skill {
  id: string
  name: string
  description: string
  version: string
  enabled: boolean
  config?: Record<string, unknown>
  createdAt?: string
}

export interface AgentMessage {
  id: string
  fromAgentId: string
  toAgentId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Activity {
  id: string
  message: string
  time: string
  type: 'success' | 'error' | 'info' | 'warning'
}
