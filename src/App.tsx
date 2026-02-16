import { useState, useEffect } from 'react'
import './index.css'
import { Dashboard } from './components/Dashboard'
import { AgentManagement } from './components/AgentManagement'
import { WorkflowBuilder } from './components/WorkflowBuilder'
import { SkillCreator } from './components/SkillCreator'
import type { Agent, Workflow, Skill, AgentMessage } from './types'

// Icon components
export const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

export const AgentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

export const WorkflowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

export const SkillIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

export const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

// Initial mock data
const initialAgents: Agent[] = [
  { id: '1', name: 'Research Agent', description: 'Web search and data gathering', status: 'active', model: 'kimi-k2.5', tasksCompleted: 45, lastActive: new Date().toISOString(), canCommunicate: true },
  { id: '2', name: 'Trading Agent', description: 'Market analysis and trade execution', status: 'active', model: 'anthropic/claude-opus-4-6', tasksCompleted: 23, lastActive: new Date().toISOString(), canCommunicate: true },
  { id: '3', name: 'CRM Agent', description: 'Notion CRM management', status: 'idle', model: 'kimi-k2.5', tasksCompleted: 128, lastActive: new Date(Date.now() - 3600000).toISOString(), canCommunicate: false },
]

const initialWorkflows: Workflow[] = [
  { 
    id: '1', 
    name: 'Morning Brief', 
    description: 'Daily 7 AM market and task briefing',
    agentId: '1',
    schedule: { type: 'cron', expression: '0 7 * * *', timezone: 'America/Chicago' },
    status: 'active',
    prompt: 'Generate morning brief with market updates and tasks',
    lastRun: new Date(Date.now() - 86400000).toISOString(),
    nextRun: new Date(Date.now() + 3600000).toISOString()
  },
]

const initialSkills: Skill[] = [
  { id: '1', name: 'web-search', description: 'Search the web for information', version: '1.0.0', enabled: true },
  { id: '2', name: 'notion-api', description: 'Interact with Notion databases', version: '1.0.0', enabled: true },
]

const initialMessages: AgentMessage[] = []

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages)

  // Load from localStorage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('mc_agents')
    const savedWorkflows = localStorage.getItem('mc_workflows')
    const savedSkills = localStorage.getItem('mc_skills')
    const savedMessages = localStorage.getItem('mc_messages')
    
    if (savedAgents) setAgents(JSON.parse(savedAgents))
    if (savedWorkflows) setWorkflows(JSON.parse(savedWorkflows))
    if (savedSkills) setSkills(JSON.parse(savedSkills))
    if (savedMessages) setMessages(JSON.parse(savedMessages))
  }, [])

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('mc_agents', JSON.stringify(agents))
  }, [agents])

  useEffect(() => {
    localStorage.setItem('mc_workflows', JSON.stringify(workflows))
  }, [workflows])

  useEffect(() => {
    localStorage.setItem('mc_skills', JSON.stringify(skills))
  }, [skills])

  useEffect(() => {
    localStorage.setItem('mc_messages', JSON.stringify(messages))
  }, [messages])

  // Agent actions
  const createAgent = (agent: Omit<Agent, 'id' | 'createdAt'>) => {
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setAgents([...agents, newAgent])
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(agents.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
    setWorkflows(workflows.filter(w => w.agentId !== id))
  }

  // Workflow actions
  const createWorkflow = (workflow: Omit<Workflow, 'id' | 'createdAt'>) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setWorkflows([...workflows, newWorkflow])
  }

  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(workflows.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id))
  }

  const runWorkflowNow = async (workflowId: string) => {
    // In a real implementation, this would call the OpenClaw API
    console.log(`Running workflow ${workflowId}`)
    updateWorkflow(workflowId, { 
      lastRun: new Date().toISOString(),
      status: 'running'
    })
    setTimeout(() => {
      updateWorkflow(workflowId, { status: 'active' })
    }, 2000)
  }

  // Skill actions
  const createSkill = (skill: Omit<Skill, 'id' | 'createdAt'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setSkills([...skills, newSkill])
  }

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setSkills(skills.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id))
  }

  // Agent messaging
  const sendAgentMessage = (fromAgentId: string, toAgentId: string, content: string) => {
    const message: AgentMessage = {
      id: Date.now().toString(),
      fromAgentId,
      toAgentId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setMessages([...messages, message])
  }

  const markMessageRead = (messageId: string) => {
    setMessages(messages.map(m => m.id === messageId ? { ...m, read: true } : m))
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ActivityIcon },
    { id: 'agents', label: 'Agents', icon: AgentsIcon },
    { id: 'workflows', label: 'Workflows', icon: WorkflowIcon },
    { id: 'skills', label: 'Skills', icon: SkillIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ActivityIcon />
              </div>
              <h1 className="text-xl font-bold">Mission Control</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">v3.1</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">System Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Agents</span>
                  <span className="font-medium">{agents.filter(a => a.status === 'active').length}/{agents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Workflows</span>
                  <span className="font-medium">{workflows.filter(w => w.status === 'active').length}/{workflows.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Messages</span>
                  <span className="font-medium">{messages.filter(m => !m.read).length} unread</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <Dashboard 
                agents={agents} 
                workflows={workflows} 
                messages={messages}
                onMarkMessageRead={markMessageRead}
              />
            )}

            {activeTab === 'agents' && (
              <AgentManagement
                agents={agents}
                workflows={workflows}
                messages={messages}
                onCreateAgent={createAgent}
                onUpdateAgent={updateAgent}
                onDeleteAgent={deleteAgent}
                onSendMessage={sendAgentMessage}
                onMarkMessageRead={markMessageRead}
              />
            )}

            {activeTab === 'workflows' && (
              <WorkflowBuilder
                workflows={workflows}
                agents={agents}
                onCreateWorkflow={createWorkflow}
                onUpdateWorkflow={updateWorkflow}
                onDeleteWorkflow={deleteWorkflow}
                onRunNow={runWorkflowNow}
              />
            )}

            {activeTab === 'skills' && (
              <SkillCreator
                skills={skills}
                onCreateSkill={createSkill}
                onUpdateSkill={updateSkill}
                onDeleteSkill={deleteSkill}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
