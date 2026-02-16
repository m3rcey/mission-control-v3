import { useState } from 'react'
import type { Skill } from '../types'

interface SkillCreatorProps {
  skills: Skill[]
  onCreateSkill: (skill: Omit<Skill, 'id' | 'createdAt'>) => void
  onUpdateSkill: (id: string, updates: Partial<Skill>) => void
  onDeleteSkill: (id: string) => void
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

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const templateSkills = [
  {
    name: 'web-search',
    description: 'Search the web for current information and news',
    config: { provider: 'brave', max_results: 10 }
  },
  {
    name: 'notion-api',
    description: 'Read and write to Notion databases and pages',
    config: { databases: [] }
  },
  {
    name: 'slack-messaging',
    description: 'Send messages and read channels in Slack',
    config: { channels: [] }
  },
  {
    name: 'file-operations',
    description: 'Read, write, and manipulate files',
    config: { allowed_extensions: ['.txt', '.md', '.json'] }
  },
  {
    name: 'cron-scheduler',
    description: 'Schedule and manage recurring tasks',
    config: { timezone: 'America/Chicago' }
  },
]

export function SkillCreator({
  skills,
  onCreateSkill,
  onUpdateSkill,
  onDeleteSkill,
}: SkillCreatorProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    config: '{}',
  })

  const handleCreate = () => {
    let parsedConfig = {}
    try {
      parsedConfig = JSON.parse(formData.config)
    } catch {
      // Invalid JSON, use empty object
    }

    onCreateSkill({
      name: formData.name,
      description: formData.description,
      version: formData.version,
      enabled: true,
      config: parsedConfig,
    })
    resetForm()
    setShowCreateModal(false)
  }

  const handleUpdate = () => {
    if (selectedSkill) {
      let parsedConfig = selectedSkill.config || {}
      try {
        parsedConfig = JSON.parse(formData.config)
      } catch {
        // Keep existing config
      }

      onUpdateSkill(selectedSkill.id, {
        name: formData.name,
        description: formData.description,
        version: formData.version,
        config: parsedConfig,
      })
      setShowEditModal(false)
      setSelectedSkill(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      onDeleteSkill(id)
    }
  }

  const toggleSkill = (skill: Skill) => {
    onUpdateSkill(skill.id, { enabled: !skill.enabled })
  }

  const openEditModal = (skill: Skill) => {
    setSelectedSkill(skill)
    setFormData({
      name: skill.name,
      description: skill.description,
      version: skill.version,
      config: JSON.stringify(skill.config || {}, null, 2),
    })
    setShowEditModal(true)
  }

  const useTemplate = (template: typeof templateSkills[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      version: '1.0.0',
      config: JSON.stringify(template.config, null, 2),
    })
    setShowTemplates(false)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', version: '1.0.0', config: '{}' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Skill Creator</h2>
          <p className="text-gray-400">Create and manage agent skills</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowTemplates(true); setShowCreateModal(true); }}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Templates
          </button>
          <button
            onClick={() => { setShowTemplates(false); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            <PlusIcon />
            Create Skill
          </button>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div 
            key={skill.id} 
            className={`bg-gray-800 rounded-xl border p-5 transition-all ${
              skill.enabled ? 'border-gray-700' : 'border-gray-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                skill.enabled ? 'bg-blue-600' : 'bg-gray-700'
              }`}>
                <span className="text-lg font-bold">{skill.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleSkill(skill)}
                  className={`p-1.5 rounded transition-colors ${
                    skill.enabled 
                      ? 'text-green-400 hover:bg-green-900/30' 
                      : 'text-gray-500 hover:bg-gray-700'
                  }`}
                  title={skill.enabled ? 'Disable' : 'Enable'}
                >
                  {skill.enabled ? <CheckIcon /> : <XIcon />}
                </button>
                <button
                  onClick={() => openEditModal(skill)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Edit"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg">{skill.name}</h3>
            <p className="text-gray-400 text-sm mt-1">{skill.description}</p>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-700 rounded">v{skill.version}</span>
              <span className={skill.enabled ? 'text-green-400' : 'text-gray-500'}>
                {skill.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {skill.config && Object.keys(skill.config).length > 0 && (
              <div className="mt-3 p-2 bg-gray-900 rounded text-xs text-gray-400 font-mono overflow-hidden">
                <code>{JSON.stringify(skill.config).slice(0, 60)}...</code>
              </div>
            )}
          </div>
        ))}

        {skills.length === 0 && (
          <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon />
            </div>
            <h3 className="text-lg font-semibold">No skills yet</h3>
            <p className="text-gray-400 mt-2">Create your first agent skill</p>
          </div>
        )}
      </div>

      {/* Templates Section (inline) */}
      {showTemplates && !showCreateModal && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Skill Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateSkills.map((template) => (
              <button
                key={template.name}
                onClick={() => { useTemplate(template); setShowCreateModal(true); }}
                className="text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Skill</h3>
            
            {/* Templates in modal */}
            {showTemplates && (
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-3">Start from a template:</p>
                <div className="grid grid-cols-2 gap-2">
                  {templateSkills.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => useTemplate(template)}
                      className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., web-search"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={2}
                  placeholder="What does this skill do?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Configuration (JSON)</label>
                <textarea
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  rows={5}
                  placeholder={'{\n  "key": "value"\n}'}
                />
                <p className="text-xs text-gray-500 mt-1">JSON configuration for this skill</p>
              </div>
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
                disabled={!formData.name || !formData.description}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Create Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Skill</h3>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Configuration (JSON)</label>
                <textarea
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  rows={5}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setSelectedSkill(null); }}
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
