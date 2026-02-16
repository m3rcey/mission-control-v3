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

// Sync icon
export const SyncIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

// API types from OpenClaw
interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: {
    kind: string
    expr?: string
    tz?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastStatus?: string
    consecutiveErrors?: number
    lastError?: string
  }
  payload?: {
    model?: string
    message?: string
  }
}

interface CronRun {
  ts: number
  jobId: string
  status: string
  error?: string
  summary?: string
  runAtMs: number
  durationMs: number
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [agents, setAgents] = useState<Agent[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [cronRuns, setCronRuns] = useState<CronRun[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('mc_agents')
    const savedSkills = localStorage.getItem('mc_skills')
    const savedMessages = localStorage.getItem('mc_messages')
    
    if (savedAgents) setAgents(JSON.parse(savedAgents))
    if (savedSkills) setSkills(JSON.parse(savedSkills))
    if (savedMessages) setMessages(JSON.parse(savedMessages))
    
    // Initial sync from OpenClaw
    syncWithOpenClaw()
  }, [])

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('mc_agents', JSON.stringify(agents))
  }, [agents])

  useEffect(() => {
    localStorage.setItem('mc_skills', JSON.stringify(skills))
  }, [skills])

  useEffect(() => {
    localStorage.setItem('mc_messages', JSON.stringify(messages))
  }, [messages])

  // Sync with OpenClaw API
  const syncWithOpenClaw = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch cron jobs from OpenClaw
      const response = await fetch('/api/cron/list')
      if (response.ok) {
        const data = await response.json()
        if (data.jobs) {
          setCronJobs(data.jobs)
          
          // Convert cron jobs to workflows
          const convertedWorkflows: Workflow[] = data.jobs.map((job: CronJob) => ({
            id: job.id,
            name: job.name,
            description: job.payload?.message?.substring(0, 100) + '...' || 'No description',
            agentId: '1', // Default agent
            schedule: {
              type: job.schedule.kind === 'cron' ? 'cron' : 'interval',
              expression: job.schedule.expr || '',
              timezone: job.schedule.tz || 'America/Chicago',
            },
            status: job.enabled ? (job.state?.lastStatus === 'error' ? 'error' : 'active') : 'paused',
            prompt: job.payload?.message || '',
            lastRun: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toISOString() : undefined,
            nextRun: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : undefined,
          }))
          
          setWorkflows(convertedWorkflows)
        }
      }

      // Fetch recent runs for all jobs
      const runs: CronRun[] = []
      for (const job of cronJobs) {
        try {
          const runsResponse = await fetch(`/api/cron/runs?jobId=${job.id}`)
          if (runsResponse.ok) {
            const runsData = await runsResponse.json()
            if (runsData.entries) {
              runs.push(...runsData.entries)
            }
          }
        } catch (e) {
          // Individual job runs may fail, continue
        }
      }
      
      // Sort by timestamp desc
      runs.sort((a, b) => b.ts - a.ts)
      setCronRuns(runs.slice(0, 50)) // Keep last 50
      
      setLastSync(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync with OpenClaw')
    } finally {
      setIsLoading(false)
    }
  }

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
  }

  // Workflow actions - connect to real OpenClaw API
  const createWorkflow = async (workflow: Omit<Workflow, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/cron/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflow.name,
          schedule: {
            kind: 'cron',
            expr: workflow.schedule.expression,
            tz: workflow.schedule.timezone,
          },
          payload: {
            kind: 'agentTurn',
            message: workflow.prompt,
            model: 'fast',
            thinking: 'off',
          },
          sessionTarget: 'isolated',
          enabled: workflow.status === 'active',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newWorkflow: Workflow = {
          ...workflow,
          id: result.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        setWorkflows([...workflows, newWorkflow])
        await syncWithOpenClaw() // Refresh from server
      } else {
        throw new Error('Failed to create cron job')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
      // Fallback to local
      const newWorkflow: Workflow = {
        ...workflow,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      setWorkflows([...workflows, newWorkflow])
    }
  }

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    // Update local state
    setWorkflows(workflows.map(w => w.id === id ? { ...w, ...updates } : w))
    
    // Try to update on server if it's a real cron job
    try {
      await fetch('/api/cron/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: id,
          patch: {
            enabled: updates.status === 'active',
          },
        }),
      })
    } catch {
      // Ignore errors for local workflows
    }
  }

  const deleteWorkflow = async (id: string) => {
    try {
      await fetch('/api/cron/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id }),
      })
    } catch {
      // Ignore errors
    }
    setWorkflows(workflows.filter(w => w.id !== id))
  }

  const runWorkflowNow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/cron/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: workflowId }),
      })
      
      if (response.ok) {
        updateWorkflow(workflowId, { status: 'running' })
        // Refresh after a delay
        setTimeout(syncWithOpenClaw, 5000)
      }
    } catch (err) {
      setError('Failed to run workflow')
    }
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
              <button
                onClick={syncWithOpenClaw}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <span className={isLoading ? 'animate-spin' : ''}><SyncIcon /></span>
                {isLoading ? 'Syncing...' : 'Sync'}
              </button>
              <span className="text-sm text-gray-400">v3.1</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${isLoading ? 'animate-pulse' : ''}`}></div>
                <span className="text-xs text-gray-400">{error ? 'Error' : 'Online'}</span>
              </div>
            </div>
          </div>
          {error && (
            <div className="px-4 py-2 bg-red-900/50 text-red-400 text-sm">
              Error: {error}
            </div>
          )}
          {lastSync && (
            <div className="px-4 py-1 text-xs text-gray-500">
              Last synced: {lastSync.toLocaleString()}
            </div>
          )}
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
                  <span className="text-gray-500">Cron Jobs</span>
                  <span className="font-medium">{cronJobs.length}</span>
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
                cronJobs={cronJobs}
                cronRuns={cronRuns}
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
