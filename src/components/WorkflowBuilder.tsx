import { useState } from 'react'
import type { Workflow, Agent } from '../types'

interface WorkflowBuilderProps {
  workflows: Workflow[]
  agents: Agent[]
  onCreateWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt'>) => void
  onUpdateWorkflow: (id: string, updates: Partial<Workflow>) => void
  onDeleteWorkflow: (id: string) => void
  onRunNow: (workflowId: string) => void
}

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const schedulePresets = [
  { label: 'Every minute (testing)', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Daily at 7 AM', value: '0 7 * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Daily at 6 PM', value: '0 18 * * *' },
  { label: 'Weekly (Monday 9 AM)', value: '0 9 * * 1' },
  { label: 'Custom', value: 'custom' },
]

export function WorkflowBuilder({
  workflows,
  agents,
  onCreateWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onRunNow,
}: WorkflowBuilderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agentId: '',
    prompt: '',
    scheduleType: 'cron',
    schedulePreset: '0 7 * * *',
    customCron: '',
    timezone: 'America/Chicago',
  })

  const handleCreate = () => {
    const cronExpression = formData.schedulePreset === 'custom' 
      ? formData.customCron 
      : formData.schedulePreset

    onCreateWorkflow({
      name: formData.name,
      description: formData.description,
      agentId: formData.agentId,
      prompt: formData.prompt,
      schedule: {
        type: 'cron',
        expression: cronExpression,
        timezone: formData.timezone,
      },
      status: 'active',
    })
    resetForm()
    setShowCreateModal(false)
  }

  const handleUpdate = () => {
    if (selectedWorkflow) {
      const cronExpression = formData.schedulePreset === 'custom' 
        ? formData.customCron 
        : formData.schedulePreset

      onUpdateWorkflow(selectedWorkflow.id, {
        name: formData.name,
        description: formData.description,
        agentId: formData.agentId,
        prompt: formData.prompt,
        schedule: {
          type: 'cron',
          expression: cronExpression,
          timezone: formData.timezone,
        },
      })
      setShowEditModal(false)
      setSelectedWorkflow(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      onDeleteWorkflow(id)
    }
  }

  const toggleWorkflowStatus = (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active'
    onUpdateWorkflow(workflow.id, { status: newStatus })
  }

  const openEditModal = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setFormData({
      name: workflow.name,
      description: workflow.description,
      agentId: workflow.agentId,
      prompt: workflow.prompt || '',
      scheduleType: workflow.schedule.type,
      schedulePreset: schedulePresets.find(p => p.value === workflow.schedule.expression)?.value || 'custom',
      customCron: workflow.schedule.expression,
      timezone: workflow.schedule.timezone || 'America/Chicago',
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      agentId: '',
      prompt: '',
      scheduleType: 'cron',
      schedulePreset: '0 7 * * *',
      customCron: '',
      timezone: 'America/Chicago',
    })
  }

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.name || 'Unknown Agent'
  }

  const formatSchedule = (workflow: Workflow) => {
    const preset = schedulePresets.find(p => p.value === workflow.schedule.expression)
    if (preset && preset.value !== 'custom') {
      return preset.label
    }
    return `Cron: ${workflow.schedule.expression}`
  }

  const getNextRunText = (workflow: Workflow) => {
    if (workflow.status !== 'active') return 'Paused'
    if (workflow.nextRun) {
      const next = new Date(workflow.nextRun)
      const now = new Date()
      const diff = next.getTime() - now.getTime()
      if (diff < 0) return 'Overdue'
      if (diff < 60000) return 'In < 1 min'
      if (diff < 3600000) return `In ${Math.floor(diff / 60000)} min`
      return next.toLocaleString()
    }
    return 'Calculating...'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Builder</h2>
          <p className="text-gray-400">Create automated agent workflows with scheduling</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        >
          <PlusIcon />
          Create Workflow
        </button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{workflow.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    workflow.status === 'active' ? 'bg-green-900 text-green-400' :
                    workflow.status === 'paused' ? 'bg-yellow-900 text-yellow-400' :
                    workflow.status === 'running' ? 'bg-blue-900 text-blue-400' :
                    'bg-red-900 text-red-400'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{workflow.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Agent:</span>
                    <span className="text-blue-400">{getAgentName(workflow.agentId)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Schedule:</span>
                    {formatSchedule(workflow)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Next run:</span>
                    <span className={workflow.status === 'active' ? 'text-green-400' : ''}>
                      {getNextRunText(workflow)}
                    </span>
                  </span>
                  {workflow.lastRun && (
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">Last run:</span>
                      {new Date(workflow.lastRun).toLocaleString()}
                    </span>
                  )}
                </div>

                {workflow.prompt && (
                  <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Prompt:</p>
                    <p className="text-sm text-gray-300 line-clamp-2">{workflow.prompt}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onRunNow(workflow.id)}
                  disabled={workflow.status === 'running'}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Run now"
                >
                  <PlayIcon />
                </button>
                <button
                  onClick={() => toggleWorkflowStatus(workflow)}
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title={workflow.status === 'active' ? 'Pause' : 'Resume'}
                >
                  <PauseIcon />
                </button>
                <button
                  onClick={() => openEditModal(workflow)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon />
            </div>
            <h3 className="text-lg font-semibold">No workflows yet</h3>
            <p className="text-gray-400 mt-2">Create your first automated workflow</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Morning Market Brief"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={2}
                  placeholder="What does this workflow do?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Assign to Agent</label>
                <select
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select an agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  rows={4}
                  placeholder="Instructions for the agent when this workflow runs..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Schedule</label>
                  <select
                    value={formData.schedulePreset}
                    onChange={(e) => setFormData({ ...formData, schedulePreset: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {schedulePresets.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="America/Chicago">America/Chicago (CT)</option>
                    <option value="America/New_York">America/New_York (ET)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              {formData.schedulePreset === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Custom Cron Expression</label>
                  <input
                    type="text"
                    value={formData.customCron}
                    onChange={(e) => setFormData({ ...formData, customCron: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="0 7 * * *"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: minute hour day month weekday</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name || !formData.description || !formData.agentId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Assign to Agent</label>
                <select
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select an agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Schedule</label>
                  <select
                    value={formData.schedulePreset}
                    onChange={(e) => setFormData({ ...formData, schedulePreset: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {schedulePresets.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="America/Chicago">America/Chicago (CT)</option>
                    <option value="America/New_York">America/New_York (ET)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              {formData.schedulePreset === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Custom Cron Expression</label>
                  <input
                    type="text"
                    value={formData.customCron}
                    onChange={(e) => setFormData({ ...formData, customCron: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setSelectedWorkflow(null); }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
