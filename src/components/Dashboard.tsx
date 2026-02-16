import type { Agent, Workflow, AgentMessage, Activity } from '../types'

interface DashboardProps {
  agents: Agent[]
  workflows: Workflow[]
  messages: AgentMessage[]
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

export function Dashboard({ agents, workflows, messages, onMarkMessageRead }: DashboardProps) {
  const activeAgents = agents.filter(a => a.status === 'active').length
  const activeWorkflows = workflows.filter(w => w.status === 'active').length
  const unreadMessages = messages.filter(m => !m.read).length
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0)

  const stats = [
    { label: 'Active Agents', value: activeAgents, total: agents.length, change: '+1' },
    { label: 'Active Workflows', value: activeWorkflows, total: workflows.length, change: '0' },
    { label: 'Unread Messages', value: unreadMessages, total: messages.length, change: unreadMessages > 0 ? '!' : '' },
    { label: 'Tasks Completed', value: totalTasks, change: '+12' },
  ]

  const recentActivities: Activity[] = [
    { id: '1', message: 'Trading Agent executed buy order', time: '2 min ago', type: 'success' },
    { id: '2', message: 'Research Agent completed web search', time: '5 min ago', type: 'success' },
    { id: '3', message: 'Morning Brief workflow scheduled', time: '1 hour ago', type: 'info' },
    { id: '4', message: 'CRM Agent sync failed', time: '2 hours ago', type: 'error' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{stat.value}</span>
              {stat.total !== undefined && (
                <span className="text-sm text-gray-500">/ {stat.total}</span>
              )}
              {stat.change && (
                <span className={`text-sm ${stat.change === '!' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agents Status */}
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
          <div className="divide-y divide-gray-700">
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
                        <span className="font-medium">{fromAgent?.name}</span>
                        {' → '}
                        <span className="font-medium">{toAgent?.name}</span>
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

      {/* Activity Feed */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-start gap-3">
              <div className={`mt-0.5 ${
                activity.type === 'success' ? 'text-green-400' : 
                activity.type === 'error' ? 'text-red-400' : 
                activity.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {activity.type === 'success' ? <CheckIcon /> : <AlertIcon />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
