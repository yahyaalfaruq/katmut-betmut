import React from 'react'
import { Phone, Video, LogOut } from 'lucide-react'

const Header = ({ user, setUser, onCall }) => {
  return (
    <header className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', overflow: 'hidden' }}>
           <img 
             src={user.id === 'katmut' ? '/images/katmut.png' : '/images/betmut.png'} 
             alt={user.id}
             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
           />
           <span style={{ display: 'none' }}>{user.id === 'katmut' ? '🐸' : '🐤'}</span>
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800' }}>{user.name}</h3>
          <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>• ONLINE</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px', color: '#94a3b8' }}>
        <Phone size={22} style={{ cursor: 'pointer' }} onClick={() => onCall('voice')} />
        <Video size={22} style={{ cursor: 'pointer' }} onClick={() => onCall('video')} />
        <LogOut size={22} onClick={() => { localStorage.removeItem('user'); setUser(null); }} style={{ cursor: 'pointer' }} />
      </div>
    </header>
  )
}

export default Header
