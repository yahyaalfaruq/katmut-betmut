import React, { useState, useRef } from 'react'
import { Heart, MessageCircle, X, Send, Plus, Camera, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Gallery = ({ galleryItems, user, socket }) => {
  const [selectedImg, setSelectedImg] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newImgData, setNewImgData] = useState({ title: '', image: null })
  const [commentText, setCommentText] = useState('')
  const fileInputRef = useRef(null)

  const handleLike = (e, id) => {
    e.stopPropagation()
    socket.emit('like-gallery-item', { id })
  }

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedImg) return
    const comment = {
      id: Date.now(),
      sender: user.name,
      text: commentText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    socket.emit('comment-gallery-item', { id: selectedImg.id, comment })
    setCommentText('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImgData(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = () => {
    if (!newImgData.image || !newImgData.title.trim()) return
    const newItem = {
      id: Date.now(),
      url: newImgData.image,
      title: newImgData.title,
      likes: 0,
      comments: [],
      author: user.name,
      time: new Date().toLocaleDateString()
    }
    socket.emit('add-gallery-item', newItem)
    setIsCreating(false)
    setNewImgData({ title: '', image: null })
  }

  return (
    <div className="gallery-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {/* Create Button Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(true)}
          className="gallery-card create-card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0', background: '#f8fafc' }}
        >
          <div className="create-icon-wrapper">
            <Plus size={32} />
          </div>
          <p style={{ fontWeight: '800', marginTop: '10px', color: '#64748b' }}>Post Moment</p>
        </motion.div>

        {galleryItems.map(img => (
          <motion.div 
            key={img.id} 
            layoutId={`img-${img.id}`}
            onClick={() => setSelectedImg(img)}
            className="gallery-card"
          >
            <img src={img.url} className="gallery-thumbnail" alt={img.title} />
            <div className="gallery-card-info">
              <p className="gallery-card-title">{img.title}</p>
              <div className="gallery-card-stats">
                <span onClick={(e) => handleLike(e, img.id)} className="stat-item">
                  <Heart size={16} fill={img.isLiked ? '#ff7675' : 'none'} color={img.isLiked ? '#ff7675' : '#94a3b8'} /> {img.likes}
                </span>
                <span className="stat-item">
                  <MessageCircle size={16} /> {img.comments?.length || 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {/* Detail Modal */}
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="gallery-modal-overlay" onClick={() => setSelectedImg(null)}
          >
            <motion.div 
              layoutId={`img-${selectedImg.id}`} className="gallery-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedImg(null)}><X size={24} /></button>
              <div className="modal-body">
                <div className="modal-image-container"><img src={selectedImg.url} alt={selectedImg.title} /></div>
                <div className="modal-side">
                  <div className="modal-header">
                    <h3>{selectedImg.title}</h3>
                    <p className="modal-author">Posted by {selectedImg.author || 'Admin'}</p>
                  </div>
                  <div className="modal-comments">
                    {selectedImg.comments?.length > 0 ? (
                      selectedImg.comments.map(c => (
                        <div key={c.id} className="comment-item">
                          <span className="comment-sender">{c.sender}</span>
                          <p className="comment-text">{c.text}</p>
                          <span className="comment-time">{c.time}</span>
                        </div>
                      ))
                    ) : <p className="no-comments">Belum ada komentar. Jadi yang pertama! ✨</p>}
                  </div>
                  <div className="modal-footer">
                    <div className="footer-actions">
                      <Heart size={24} onClick={(e) => handleLike(e, selectedImg.id)} />
                      <MessageCircle size={24} />
                    </div>
                    <p className="likes-count">{selectedImg.likes} likes</p>
                    <div className="comment-input-area">
                      <input 
                        placeholder="Tulis komentar..." value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <button onClick={handleAddComment}><Send size={18} /></button>
                    </div>
                  </div>
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
                <h2>Post Moment Baru ✨</h2>
                <button className="modal-close-inline" onClick={() => setIsCreating(false)}><X size={20} /></button>
              </div>
              
              <div className="create-modal-body">
                <div className="image-upload-area" onClick={() => fileInputRef.current.click()}>
                  {newImgData.image ? (
                    <img src={newImgData.image} alt="preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <div className="icon-circle"><ImageIcon size={40} /></div>
                      <p>Klik untuk pilih foto</p>
                      <span>Supports: JPG, PNG, GIF</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                </div>
                
                <div className="create-form">
                  <label>Keterangan Moment</label>
                  <textarea 
                    placeholder="Tulis cerita di balik foto ini..." 
                    value={newImgData.title}
                    onChange={(e) => setNewImgData(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <button 
                    className={`post-submit-btn ${(!newImgData.image || !newImgData.title.trim()) ? 'disabled' : ''}`}
                    onClick={handleCreatePost}
                    disabled={!newImgData.image || !newImgData.title.trim()}
                  >
                    Bagikan Moment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Gallery


