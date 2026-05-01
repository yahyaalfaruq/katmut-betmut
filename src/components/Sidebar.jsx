import { Home, MessageCircle, History, Camera, Newspaper, Image, Gamepad2 } from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab, visible }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'history', icon: History, label: 'Riwayat' },
    { id: 'photobooth', icon: Camera, label: 'Kamera' },
    { id: 'articles', icon: Newspaper, label: 'Artikel' },
    { id: 'gallery', icon: Image, label: 'Galeri' },
    { id: 'games', icon: Gamepad2, label: 'Game' }
  ]

  return (
    <aside className={`sidebar ${visible ? 'visible' : 'hidden'}`}>
      <div className="sidebar-inner">
        {tabs.map(t => (
          <div 
            key={t.id} 
            className={`sidebar-btn ${activeTab === t.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(t.id)}
          >
            <div className="icon-wrapper">
              <t.icon size={24} strokeWidth={2.2} />
            </div>
            <div className="active-dot" />
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
