import React from 'react'
import { Home, MessageCircle, History, Camera, Newspaper, Image, Gamepad2 } from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home },
    { id: 'chat', icon: MessageCircle },
    { id: 'history', icon: History },
    { id: 'photobooth', icon: Camera },
    { id: 'articles', icon: Newspaper },
    { id: 'gallery', icon: Image },
    { id: 'games', icon: Gamepad2 }
  ]

  return (
    <aside className="sidebar">
      {tabs.map(t => (
        <div 
          key={t.id} 
          className={`sidebar-btn ${activeTab === t.id ? 'active' : ''}`} 
          onClick={() => setActiveTab(t.id)}
        >
          <t.icon size={24} />
        </div>
      ))}
    </aside>
  )
}

export default Sidebar
