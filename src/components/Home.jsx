import React from 'react'
import { MessageCircle, Image, Trophy, Video, Camera, Heart, Gamepad2 } from 'lucide-react'

const Home = ({ user, messagesCount, tasks, setActiveTab, onCall, galleryItems }) => {
  const moods = [
    { emoji: '😊', label: 'Senang' },
    { emoji: '😴', label: 'Ngantuk' },
    { emoji: '😋', label: 'Lapar' },
    { emoji: '✨', label: 'Semangat' }
  ]

  const displayMoments = galleryItems?.slice(0, 4) || []

  return (
    <>
      <div className="greeting-card">
        <div className="greeting-content">
          <p style={{ fontSize: '15px', opacity: 0.9, fontWeight: '500' }}>Selamat datang kembali,</p>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginTop: '5px', letterSpacing: '-1px' }}>
            {user.name}! {user.id === 'katmut' ? '🐸' : '🐤'}
          </h1>
          <div className="greeting-tag">
             Hari yang cerah untuk berpetualang ☀️
          </div>
        </div>
        <div className="greeting-mascot" style={{ right: '20px', bottom: '-20px' }}>
          <img 
            src={user.id === 'katmut' ? '/images/katmut.png' : '/images/betmut.png'} 
            alt={user.id}
            style={{ width: '150px', height: '150px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <span style={{ fontSize: '100px', display: 'none' }}>{user.id === 'katmut' ? '🐸' : '🐤'}</span>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Pesan', value: messagesCount, icon: MessageCircle, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Foto', value: '4', icon: Image, color: '#ec4899', bg: '#fdf2f8' },
          { label: 'Misi', value: `${tasks.filter(t=>t.done).length}/${tasks.length}`, icon: Trophy, color: '#f59e0b', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <div style={{ color: s.color, marginBottom: '10px' }}><s.icon size={26} style={{ margin: '0 auto' }} /></div>
            <h4 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b' }}>{s.value}</h4>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Bagaimana perasaanmu? ✨</h3>
        </div>
        <div className="mood-container">
          {moods.map(m => (
            <div key={m.label} className="mood-btn">
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Akses Cepat ⚡</h3>
        </div>
        <div className="actions-grid">
          {[
            { label: 'Telepon', icon: Video, color: '#10b981', action: () => onCall('video') },
            { label: 'Kamera', icon: Camera, color: '#8b5cf6', tab: 'photobooth' },
            { label: 'Galeri', icon: Heart, color: '#f43f5e', tab: 'gallery' },
            { label: 'Main', icon: Gamepad2, color: '#f59e0b', tab: 'games' },
          ].map(a => (
            <div key={a.label} className="action-btn" onClick={() => {
              if (a.action) a.action();
              else if (a.tab) setActiveTab(a.tab);
            }}>
              <div className="action-icon" style={{ background: a.color }}><a.icon size={24} /></div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Misi Hari Ini 🎯</h3>
          <span className="view-all">Lihat Semua</span>
        </div>
        <div className="mission-list">
          {tasks.slice(0, 3).map(t => (
            <div key={t.id} className="mission-item">
              <div className={`mission-check ${t.done ? 'done' : ''}`}>
                {t.done && <Trophy size={14} />}
              </div>
              <span className={`mission-text ${t.done ? 'done' : ''}`}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Momen Terkini 📸</h3>
          <span className="view-all" onClick={() => setActiveTab('gallery')}>Buka Galeri</span>
        </div>
        <div className="moments-scroll">
          {displayMoments.length > 0 ? displayMoments.map(m => (
            <div key={m.id} className="moment-card" onClick={() => setActiveTab('gallery')}>
              <img src={m.url} alt={m.title} />
              <div className="moment-overlay">{m.title}</div>
            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', width: '100%', opacity: 0.5, fontSize: '13px' }}>
              Belum ada momen yang dibagikan. ✨
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-section" style={{ marginBottom: '40px' }}>
        <div className="quote-card">
          <p className="quote-text">"Hari yang indah dimulai dengan senyuman dan hati yang penuh syukur. Semangat ya!"</p>
          <span className="quote-author">— Katmut & Betmut</span>
        </div>
      </div>
    </>
  )
}

export default Home
