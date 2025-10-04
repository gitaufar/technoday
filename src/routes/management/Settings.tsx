import { useState } from 'react'

interface Setting {
  id: string
  category: string
  name: string
  description: string
  type: 'toggle' | 'select' | 'input' | 'number'
  value: any
  options?: string[]
}

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: '1',
      category: 'General',
      name: 'Auto-refresh Dashboard',
      description: 'Automatically refresh dashboard data every 15 minutes',
      type: 'toggle',
      value: true
    },
    {
      id: '2',
      category: 'General',
      name: 'Default View',
      description: 'Default dashboard view when logging in',
      type: 'select',
      value: 'kpi',
      options: ['kpi', 'risk-heatmap', 'lifecycle', 'reports']
    },
    {
      id: '3',
      category: 'General',
      name: 'Items per Page',
      description: 'Number of items to display per page in lists',
      type: 'number',
      value: 25
    },
    {
      id: '4',
      category: 'Notifications',
      name: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      type: 'toggle',
      value: true
    },
    {
      id: '5',
      category: 'Notifications',
      name: 'Risk Alert Threshold',
      description: 'Risk level that triggers notifications',
      type: 'select',
      value: 'High',
      options: ['Low', 'Medium', 'High', 'Critical']
    },
    {
      id: '6',
      category: 'Notifications',
      name: 'Notification Email',
      description: 'Email address for receiving notifications',
      type: 'input',
      value: 'admin@company.com'
    },
    {
      id: '7',
      category: 'Reports',
      name: 'Auto-generate Monthly Reports',
      description: 'Automatically generate monthly performance reports',
      type: 'toggle',
      value: false
    },
    {
      id: '8',
      category: 'Reports',
      name: 'Report Format',
      description: 'Default format for generated reports',
      type: 'select',
      value: 'PDF',
      options: ['PDF', 'Excel', 'CSV']
    },
    {
      id: '9',
      category: 'Security',
      name: 'Session Timeout',
      description: 'Automatically logout after inactive minutes',
      type: 'number',
      value: 30
    },
    {
      id: '10',
      category: 'Security',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for sensitive operations',
      type: 'toggle',
      value: false
    }
  ])

  const [activeCategory, setActiveCategory] = useState<string>('General')

  const categories = [...new Set(settings.map(s => s.category))]

  const updateSetting = (id: string, newValue: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ))
  }

  const filteredSettings = settings.filter(s => s.category === activeCategory)

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-block w-12 h-6 transition-colors duration-200 ease-in-out rounded-full ${
              setting.value ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute left-1 top-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                setting.value ? 'transform translate-x-6' : ''
              }`} />
            </div>
          </label>
        )
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'input':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-24"
          />
        )
      
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General':
        return '⚙️'
      case 'Notifications':
        return '🔔'
      case 'Reports':
        return '📄'
      case 'Security':
        return '🔒'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Configure system preferences and options</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            💾 Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Categories</h2>
          </div>
          <nav className="p-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <div className="flex-1">
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-gray-500">
                    {settings.filter(s => s.category === category).length} settings
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getCategoryIcon(activeCategory)}</span>
                <h2 className="text-xl font-semibold text-gray-900">{activeCategory} Settings</h2>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredSettings.map((setting) => (
                <div key={setting.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {setting.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {setting.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Information */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Application</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="text-gray-900">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Build:</span>
                      <span className="text-gray-900">20250926</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Environment:</span>
                      <span className="text-gray-900">Production</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Usage</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users:</span>
                      <span className="text-gray-900">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Contracts:</span>
                      <span className="text-gray-900">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Used:</span>
                      <span className="text-gray-900">2.3 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Export */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Backup & Export</h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  💾 Export Settings
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  📥 Import Settings
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  🔄 Reset to Defaults
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  📋 Generate System Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}