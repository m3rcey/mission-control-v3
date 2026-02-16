import type { Agent, Workflow, AgentMessage } from '../types'

interface CronJob {
  id: string
  name: string
  enabled: boolean
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastStatus?: string
    consecutiveErrors?: number
  }
}

interface CronRun {
  ts: number
  jobId: string
  status: string
  error?: string
  summary?: string
  durationMs: number
}

interface DashboardProps {
  agents: Agent[]
  workflows: Workflow[]
  messages: AgentMessage[]
  cronJobs: CronJob[]
  cronRuns: CronRun[]
  onMarkMessageRead: (id: string) => void
}

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export function Dashboard({
  agents,
  workflows,
  messages,
  cronJobs,
  cronRuns,
  onMarkMessageRead
}: DashboardProps) {
  const activeAgents = agents.filter(a => a.status === 'active').length
  const activeWorkflows = workflows.filter(w => w.status === 'active').length
  const unreadMessages = messages.filter(m => !m.read).length

  // Calculate error rate from cron runs
  const recentErrors = cronRuns.filter(r => r.status !== 'ok').length
  const errorRate = cronRuns.length > 0 ? Math.round((recentErrors / cronRuns.length) * 100) : 0

  const stats = [
    { label: 'Active Agents', value: activeAgents, total: agents.length, change: '+0' },
    { label: 'Active Workflows', value: activeWorkflows, total: workflows.length, change: '+0' },
    { label: 'Cron Jobs', value: cronJobs.filter(j => j.enabled).length, total: cronJobs.length, change: '' },
    { label: 'Recent Errors', value: errorRate + '%', change: recentErrors > 0 ? '!' : '', alert: recentErrors > 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold ${stat.alert ? 'text-red-400' : ''}`}>{stat.value}</span>
              {stat.total !== undefined && (
                <span className="text-sm text-gray-500">/ {stat.total}</span>
              )}
              {stat.change && (
                <span className={`text-sm ${stat.alert ? 'text-red-400' : 'text-green-400'}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cron Jobs Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">OpenClaw Cron Jobs</h2>
            <span className="text-xs text-gray-500">{cronJobs.length} total</span>
          </div>
          <div className="divide-y divide-gray-700 max-h-64 overflow-y-auto">
            {cronJobs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <ClockIcon />
                <p className="mt-2">No cron jobs found</p>
                <p className="text-xs">Click Sync to fetch from OpenClaw</p>
              </div>
            ) : (
              cronJobs.map((job) => (
                <div key={job.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      job.enabled 
                        ? job.state?.lastStatus === 'error' ? 'bg-red-500' : 'bg-green-500'
                        : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-sm text-gray-400">
                        {job.state?.lastStatus === 'error' 
                          ? `Error: ${job.state.consecutiveErrors} consecutive failures`
                          : job.enabled ? 'Active' : 'Paused'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    {job.state?.nextRunAtMs && (
                      <p>Next: {new Date(job.state.nextRunAtMs).toLocaleTimeString()}</p>
                    )}
                    {job.state?.lastRunAtMs && (
                      <p className="text-xs">Last: {new Date(job.state.lastRunAtMs).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            {unreadMessages > 0 && (
              <button 
                onClick={() => messages.filter(m => !m.read).forEach(m => onMarkMessageRead(m.id))}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-700 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <MessageIcon />
                <p className="mt-2">No messages yet</p>
              </div>
            ) : (
              messages.slice(-5).reverse().map((message) => {
                const fromAgent = agents.find(a => a.id === message.fromAgentId)
                const toAgent = agents.find(a => a.id === message.toAgentId)
                return (
                  <div 
                    key={message.id} 
                    className={`px-6 py-4 flex items-start gap-3 ${!message.read ? 'bg-gray-700/50' : ''}`}
                    onClick={() => onMarkMessageRead(message.id)}
                  >
                    <div className={`mt-0.5 ${!message.read ? 'text-blue-400' : 'text-gray-400'}`}>
                      <MessageIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{fromAgent?.name || 'Unknown'}</span>
                        {' → '}
                        <span className="font-medium">{toAgent?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-sm text-gray-300 mt-1 truncate">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Real Execution History */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Executions</h2>
          <span className="text-xs text-gray-500">Last {cronRuns.length} runs</span>
        </div>
        <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
          {cronRuns.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <ClockIcon />
              <p className="mt-2">No execution history</p>
              <p className="text-xs">Run a workflow or click Sync to fetch from OpenClaw</p>
            </div>
          ) : (
            cronRuns.map((run) => (
              <div key={run.ts} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${run.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                    {run.status === 'ok' ? <CheckIcon /> : <AlertIcon />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">
                        {cronJobs.find(j => j.id === run.jobId)?.name || run.jobId}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(run.ts).toLocaleString()}
                      </span>
                    </div>
                    {run.error && (
                      <p className="text-sm text-red-400 mt-1">{run.error}</p>
                    )}
                    {run.summary && (
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{run.summary}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {(run.durationMs / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Status */}
      {agents.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Agent Status</h2>
            <span className="text-xs text-gray-500">{agents.length} total</span>
          </div>
          <div className="divide-y divide-gray-700">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'busy' ? 'bg-yellow-500' : 
                    agent.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-400">{agent.model}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{agent.tasksCompleted} tasks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
