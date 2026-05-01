import React, { useState } from 'react'
import { Plus, X, BookOpen, Clock, User, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Articles = ({ articles, user, socket }) => {
  const [selectedArt, setSelectedArt] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newArt, setNewArt] = useState({ title: '', category: 'Health', content: '' })

  const handleCreate = () => {
    if (!newArt.title || !newArt.content) return
    const article = {
      id: Date.now(),
      ...newArt,
      excerpt: newArt.content.substring(0, 100) + '...',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      author: user.name
    }
    socket.emit('add-article', article)
    setIsCreating(false)
    setNewArt({ title: '', category: 'Health', content: '' })
  }

  return (
    <div className="articles-container">
      {/* Create Button */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsCreating(true)}
        className="create-article-btn"
      >
        <Plus size={20} /> Tulis Artikel Baru
      </motion.button>

      <div className="articles-grid">
        {articles.map(art => (
          <motion.div 
            key={art.id} 
            layoutId={`art-${art.id}`}
            onClick={() => setSelectedArt(art)}
            className="article-card"
          >
            <div className="article-card-header">
              <span className={`category-badge ${art.category.toLowerCase()}`}>{art.category}</span>
              <span className="article-date">{art.date}</span>
            </div>
            <h3 className="article-title">{art.title}</h3>
            <p className="article-excerpt">{art.excerpt}</p>
            <div className="article-footer">
              <div className="article-meta">
                <User size={14} /> {art.author || 'Admin'}
              </div>
              <ChevronRight size={18} className="read-more-icon" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {/* Detail Modal */}
        {selectedArt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="gallery-modal-overlay" onClick={() => setSelectedArt(null)}
          >
            <motion.div 
              layoutId={`art-${selectedArt.id}`} 
              className="article-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-inline" onClick={() => setSelectedArt(null)} style={{ position: 'absolute', top: '20px', right: '20px' }}><X size={24} /></button>
              
              <div className="article-full-content">
                <div className="article-full-header">
                  <span className={`category-badge ${selectedArt.category.toLowerCase()}`}>{selectedArt.category}</span>
                  <div className="article-full-meta">
                    <span><Clock size={14} /> {selectedArt.date}</span>
                    <span><User size={14} /> {selectedArt.author || 'Admin'}</span>
                  </div>
                </div>
                <h2 className="article-full-title">{selectedArt.title}</h2>
                <div className="article-divider"></div>
                <div className="article-text-body">
                  {selectedArt.content || selectedArt.excerpt}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create Modal */}
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="gallery-modal-overlay" onClick={() => setIsCreating(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="create-modal-content" onClick={(e) => e.stopPropagation()}
            >
              <div className="create-modal-header">
                <h2>Tulis Artikel ✨</h2>
                <button className="modal-close-inline" onClick={() => setIsCreating(false)}><X size={20} /></button>
              </div>

              <div className="create-form">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label>Judul Artikel</label>
                    <input 
                      className="form-input" 
                      placeholder="Masukkan judul..." 
                      value={newArt.title}
                      onChange={(e) => setNewArt(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>Kategori</label>
                    <select 
                      className="form-input"
                      value={newArt.category}
                      onChange={(e) => setNewArt(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option>Health</option>
                      <option>Story</option>
                      <option>Tips</option>
                      <option>Diary</option>
                    </select>
                  </div>
                </div>

                <label>Isi Artikel</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Tulis isi artikel lengkap di sini..." 
                  value={newArt.content}
                  onChange={(e) => setNewArt(prev => ({ ...prev, content: e.target.value }))}
                />

                <button 
                  className={`post-submit-btn ${(!newArt.title || !newArt.content) ? 'disabled' : ''}`}
                  onClick={handleCreate}
                  disabled={!newArt.title || !newArt.content}
                >
                  Publikasikan Artikel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Articles

