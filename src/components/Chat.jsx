import React, { useState, useEffect } from 'react'
import { Trash2, Paperclip, Send, Edit2, X, Check } from 'lucide-react'

const Chat = ({ 
  messages, user, activeMessageMenu, setActiveMessageMenu, 
  inputText, setInputText, sendMessage, deleteMessage, editMessage, scrollRef, navVisible 
}) => {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const handleStartEdit = (m) => {
    setEditingId(m.id)
    setEditText(m.text)
    setActiveMessageMenu(null)
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      editMessage(editingId, editText)
      setEditingId(null)
      setEditText('')
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollRef]);

  return (
    <div className="chat-wrapper">
      <div className="chat-messages" ref={scrollRef}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {messages.map(m => {
            const isMe = m.sender === user.id;
            const isEditing = editingId === m.id;

            return (
              <div key={m.id} className={`message-row ${isMe ? 'row-me' : 'row-them'}`}>
                <div className={`bubble ${isMe ? 'me' : 'them'}`} onClick={() => isMe && !isEditing && setActiveMessageMenu(m.id === activeMessageMenu ? null : m.id)}>
                  <div className="message-text">
                    {m.type === 'photostrip' ? (
                      <div className="chat-photostrip" style={{ '--pb-frame': m.frame }}>
                        <div className="chat-photostrip-inner">
                          <div className="chat-ps-icon top-left">{m.themeIcon}</div>
                          <div className="chat-ps-icon bottom-right">{m.themeIcon}</div>
                          <div className="chat-ps-photos">
                            {m.photos.map((p, i) => (
                              <img key={i} src={p} className="chat-ps-img" alt={`photo-${i}`} />
                            ))}
                          </div>
                          {m.stickers?.map(s => (
                            <div key={s.id} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: '18px', zIndex: 10, pointerEvents: 'none' }}>{s.emoji}</div>
                          ))}
                        </div>
                      </div>
                    ) : isEditing ? (
                      <div className="edit-box">
                         <input 
                           autoFocus
                           value={editText} 
                           onChange={(e) => setEditText(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                         />
                         <div className="edit-actions">
                           <X size={14} onClick={(e) => { e.stopPropagation(); setEditingId(null); }} />
                           <Check size={14} onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} />
                         </div>
                      </div>
                    ) : (
                      <>
                        {m.text}
                        {m.edited && <span className="edited-tag">(diedit)</span>}
                      </>
                    )}
                  </div>
                  <div className="message-footer">
                    <span className="message-time">{m.time || '08:00'}</span>
                  </div>
                  
                  {isMe && activeMessageMenu === m.id && (
                    <div className="side-menu">
                       <div className="menu-item" onClick={() => handleStartEdit(m)}>
                         <Edit2 size={14} /> Edit
                       </div>
                       <div className="menu-divider" />
                       <div className="menu-item delete" onClick={() => deleteMessage(m.id, 'me')}>
                         <Trash2 size={14} /> Hapus untuk saya
                       </div>
                       <div className="menu-item delete" onClick={() => deleteMessage(m.id, 'everyone')}>
                         <Trash2 size={14} /> Hapus untuk semua
                       </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className={`chat-input-bar ${!navVisible ? 'nav-hidden' : ''}`}>
        <div className="input-group">
          <Paperclip size={20} className="attach-icon" />
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Tulis pesan..." 
            onKeyPress={(e) => e.key === 'Enter' && inputText.trim() && (sendMessage({ type: 'text', text: inputText, sender: user.id }), setInputText(''))} 
          />
          <button 
            className="chat-send-btn"
            onClick={() => inputText.trim() && (sendMessage({ type: 'text', text: inputText, sender: user.id }), setInputText(''))} 
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
