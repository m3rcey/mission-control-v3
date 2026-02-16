import { useState } from 'react'
import './index.css'

// Simple icon components
const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const AgentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const ToolsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const WorkflowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

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

// Mock data
const stats = [
  { label: 'Active Agents', value: 4, change: '+1' },
  { label: 'Tasks Today', value: 23, change: '+5' },
  { label: 'Success Rate', value: '94%', change: '+2%' },
  { label: 'Pending Approval', value: 3, change: '-1' },
]

const agents = [
  { id: 1, name: 'Research Agent', status: 'active', tasks: 12, lastActive: '2 min ago' },
  { id: 2, name: 'Trading Agent', status: 'active', tasks: 8, lastActive: '5 min ago' },
  { id: 3, name: 'CRM Agent', status: 'idle', tasks: 0, lastActive: '1 hour ago' },
  { id: 4, name: 'Deploy Agent', status: 'busy', tasks: 3, lastActive: 'Just now' },
]

const activities = [
  { id: 1, message: 'Trading Agent executed NVDA position', time: '2 min ago', type: 'success' },
  { id: 2, message: 'Research Agent completed market analysis', time: '15 min ago', type: 'success' },
  { id: 3, message: 'CRM Agent updated 3 prospect records', time: '32 min ago', type: 'success' },
  { id: 4, message: 'Deploy Agent failed: auth timeout', time: '1 hour ago', type: 'alert' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

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
              <span className="text-sm text-gray-400">v3.0</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
              {[
                { id: 'dashboard', label: 'Dashboard', icon: ActivityIcon },
                { id: 'agents', label: 'Agents', icon: AgentsIcon },
                { id: 'tools', label: 'Tools', icon: ToolsIcon },
                { id: 'workflows', label: 'Workflows', icon: WorkflowIcon },
              ].map((item) => (
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
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <span className="text-sm text-green-400">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Agents Status */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                      <h2 className="text-lg font-semibold">Agent Status</h2>
                    </div>
                    <div className="divide-y divide-gray-700">
                      {agents.map((agent) => (
                        <div key={agent.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              agent.status === 'active' ? 'bg-green-500' :
                              agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}></div>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-gray-400">{agent.lastActive}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">{agent.tasks} tasks</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                      <h2 className="text-lg font-semibold">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-700">
                      {activities.map((activity) => (
                        <div key={activity.id} className="px-6 py-4 flex items-start gap-3">
                          <div className={`mt-0.5 ${activity.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
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
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                <AgentsIcon />
                <h2 className="text-xl font-semibold mt-4">Agent Management</h2>
                <p className="text-gray-400 mt-2">Configure and monitor agent behavior</p>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                <ToolsIcon />
                <h2 className="text-xl font-semibold mt-4">Tool Management</h2>
                <p className="text-gray-400 mt-2">Manage available tools and permissions</p>
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                <WorkflowIcon />
                <h2 className="text-xl font-semibold mt-4">Workflow Automation</h2>
                <p className="text-gray-400 mt-2">Create and manage automated workflows</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
