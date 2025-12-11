import { useState } from 'react'
import ReactionTracker from './ReactionTracker'
import MentionsTracker from './MentionsTracker'
import ActivityPanel from './ActivityPanel'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('reactions')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {[
              { id: 'reactions', label: '👍 Reactions', icon: '🔔' },
              { id: 'mentions', label: '💬 Mentions', icon: '💭' },
              { id: 'activity', label: '📈 Activity', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-semibold border-b-2 transition \${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'reactions' && <ReactionTracker />}
            {activeTab === 'mentions' && <MentionsTracker />}
            {activeTab === 'activity' && <ActivityPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}
