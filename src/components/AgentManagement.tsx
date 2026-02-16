import { useState } from 'react'
import type { Agent, Workflow, AgentMessage } from '../types'

interface AgentManagementProps {
  agents: Agent[]
  workflows: Workflow[]
  messages: AgentMessage[]
  onCreateAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => void
  onUpdateAgent: (id: string, updates: Partial<Agent>) => void
  onDeleteAgent: (id: string) => void
  onSendMessage: (fromAgentId: string, toAgentId: string, content: string) => void
  onMarkMessageRead: (id: string) => void
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

const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const models = [
  { value: 'kimi-k2.5', label: 'Kimi K2.5 (Fast/Cheap)' },
  { value: 'anthropic/claude-opus-4-6', label: 'Claude Opus 4.6 (Deep Analysis)' },
  { value: 'openrouter/minimax/minimax-m2.5', label: 'MiniMax M2.5 (Balanced)' },
]

export function AgentManagement({ 
  agents, 
  workflows, 
  messages,
  onCreateAgent, 
  onUpdateAgent, 
  onDeleteAgent,
  onSendMessage,
  onMarkMessageRead
}: AgentManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showConversation, setShowConversation] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'kimi-k2.5',
    canCommunicate: true,
    systemPrompt: '',
  })

  const [messageForm, setMessageForm] = useState({
    toAgentId: '',
    content: '',
  })

  const handleCreate = () => {
    onCreateAgent({
      name: formData.name,
      description: formData.description,
      model: formData.model,
      status: 'idle',
      tasksCompleted: 0,
      lastActive: new Date().toISOString(),
      canCommunicate: formData.canCommunicate,
      systemPrompt: formData.systemPrompt,
    })
    setFormData({ name: '', description: '', model: 'kimi-k2.5', canCommunicate: true, systemPrompt: '' })
    setShowCreateModal(false)
  }

  const handleUpdate = () => {
    if (selectedAgent) {
      onUpdateAgent(selectedAgent.id, {
        name: formData.name,
        description: formData.description,
        model: formData.model,
        canCommunicate: formData.canCommunicate,
        systemPrompt: formData.systemPrompt,
      })
      setShowEditModal(false)
      setSelectedAgent(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure? This will also delete all associated workflows.')) {
      onDeleteAgent(id)
    }
  }

  const handleSendMessage = () => {
    if (selectedAgent && messageForm.toAgentId && messageForm.content) {
      onSendMessage(selectedAgent.id, messageForm.toAgentId, messageForm.content)
      setMessageForm({ toAgentId: '', content: '' })
      setShowMessageModal(false)
    }
  }

  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent)
    setFormData({
      name: agent.name,
      description: agent.description,
      model: agent.model,
      canCommunicate: agent.canCommunicate,
      systemPrompt: agent.systemPrompt || '',
    })
    setShowEditModal(true)
  }

  const openMessageModal = (agent: Agent) => {
    setSelectedAgent(agent)
    setMessageForm({ toAgentId: '', content: '' })
    setShowMessageModal(true)
  }

  const getAgentWorkflows = (agentId: string) => {
    return workflows.filter(w => w.agentId === agentId)
  }

  const getAgentMessages = (agentId: string) => {
    return messages.filter(m => m.fromAgentId === agentId || m.toAgentId === agentId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Agent Management</h2>
          <p className="text-gray-400">Create and configure AI agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        >
          <PlusIcon />
          Create Agent
        </button>
      </div>

      {/* Agents List */}
      <div className="grid gap-4">
        {agents.map((agent) => {
          const agentWorkflows = getAgentWorkflows(agent.id)
          const agentMessages = getAgentMessages(agent.id)
          const unreadCount = agentMessages.filter(m => !m.read && m.toAgentId === agent.id).length
          
          return (
            <div key={agent.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'busy' ? 'bg-yellow-500' : 
                    agent.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <p className="text-gray-400 text-sm">{agent.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Model: {agent.model}</span>
                      <span>Tasks: {agent.tasksCompleted}</span>
                      {agent.canCommunicate && (
                        <span className="text-blue-400 flex items-center gap-1">
                          <MessageIcon />
                          Can communicate
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <span className="text-yellow-400">{unreadCount} unread</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agent.canCommunicate && agents.length > 1 && (
                    <button
                      onClick={() => openMessageModal(agent)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Send message"
                    >
                      <MessageIcon />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(agent)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              {/* Associated Workflows */}
              {agentWorkflows.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Active Workflows ({agentWorkflows.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {agentWorkflows.map(wf => (
                      <span key={wf.id} className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {wf.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Messages Toggle */}
              {agentMessages.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowConversation(showConversation === agent.id ? null : agent.id)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showConversation === agent.id ? 'Hide' : 'Show'} conversation ({agentMessages.length} messages)
                  </button>
                  
                  {showConversation === agent.id && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {agentMessages.map(msg => {
                        const isIncoming = msg.toAgentId === agent.id
                        const otherAgent = agents.find(a => a.id === (isIncoming ? msg.fromAgentId : msg.toAgentId))
                        return (
                          <div 
                            key={msg.id} 
                            className={`p-3 rounded-lg text-sm ${
                              isIncoming ? 'bg-gray-700' : 'bg-blue-900/30'
                            } ${!msg.read ? 'border-l-2 border-blue-500' : ''}`}
                            onClick={() => !msg.read && onMarkMessageRead(msg.id)}
                          >
                            <p className="text-xs text-gray-500 mb-1">
                              {isIncoming ? 'From' : 'To'}: {otherAgent?.name}
                            </p>
                            <p>{msg.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(msg.timestamp).toLocaleString()}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Research Agent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={2}
                  placeholder="What does this agent do?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {models.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canCommunicate}
                    onChange={(e) => setFormData({ ...formData, canCommunicate: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                  <span className="text-sm">Can communicate with other agents</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">System Prompt (optional)</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Custom instructions for this agent..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name || !formData.description}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Agent</h3>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {models.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canCommunicate}
                    onChange={(e) => setFormData({ ...formData, canCommunicate: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                  <span className="text-sm">Can communicate with other agents</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">System Prompt</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
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

      {/* Message Modal */}
      {showMessageModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Send Message from {selectedAgent.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">To Agent</label>
                <select
                  value={messageForm.toAgentId}
                  onChange={(e) => setMessageForm({ ...messageForm, toAgentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select agent...</option>
                  {agents
                    .filter(a => a.id !== selectedAgent.id && a.canCommunicate)
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Enter your message..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageForm.toAgentId || !messageForm.content}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
