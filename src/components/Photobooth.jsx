import React, { useRef } from 'react'
import { RotateCw } from 'lucide-react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'

const Photobooth = ({ 
  pbState, pbPhotos, pbCount, pbFrame, pbStickers, pbSelectedColor,
  videoRef, startPhotobooth, handleRetake, toggleCamera, addSticker,
  frameColors, stickers, user, getTargetUser, sendMessage, setActiveTab, pbFrameSet, facingMode
}) => {
  const currentTheme = frameColors.find(c => c.name === pbSelectedColor) || frameColors[0]
  const stripRef = useRef(null)

  const handleDownload = async () => {
    if (!stripRef.current) return
    try {
      const canvas = await html2canvas(stripRef.current, {
        backgroundColor: null,
        scale: 3, // High quality
        logging: false,
        useCORS: true
      })
      const link = document.createElement('a')
      link.download = `photostrip-${user.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download error:', err)
      alert('Gagal mendownload foto! 😢')
    }
  }

  return (
    <div className="pb-layout">
      {pbState === 'idle' ? (
        <>
          <div className="pb-main">
            <div className="pb-preview-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
              <div style={{ fontSize: '80px', animation: 'pulse 2s infinite' }}>📸</div>
              <button onClick={toggleCamera} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                <RotateCw size={20} />
              </button>
              <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
                Mode: {facingMode === 'user' ? 'Kamera Depan 🤳' : 'Kamera Belakang 📷'}
              </div>
            </div>
            <button onClick={startPhotobooth} className="pb-btn pb-btn-send" style={{ marginTop: '20px', fontSize: '18px', padding: '20px' }}>✨ Mulai Photobooth ✨</button>
          </div>
          <div className="pb-side">
            <h3 className="panel-title">Siap untuk bergaya?</h3>
            <div className="pb-slots">
              {[1,2,3,4].map(i => (
                <div key={i} className="pb-slot">{i}</div>
              ))}
            </div>
            <p style={{ fontSize: '11px', opacity: 0.6, textAlign: 'center', marginTop: '10px' }}>Ambil 4 foto seru bareng kesayangan! 🐸🐤</p>
          </div>
        </>
      ) : pbState === 'capturing' ? (
        <>
          <div className="pb-main">
            <div className="pb-preview-box">
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {pbCount && <div style={{ position: 'absolute', inset: 0, background: pbCount === '📸' ? '#fff' : 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '100px', fontWeight: '900', color: '#fff' }}>{pbCount}</div>}
              <button onClick={toggleCamera} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                <RotateCw size={20} />
              </button>
            </div>
          </div>
          <div className="pb-side">
            <h3 className="panel-title">Captured Photos</h3>
            <div className="pb-slots">
              {[1,2,3,4].map(i => (
                <div key={i} className="pb-slot">
                  {pbPhotos[i-1] ? <img src={pbPhotos[i-1]} alt={`slot-${i}`} /> : i}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pb-main">
            <div className="photostrip-container">
              <div className="photostrip" ref={stripRef} style={{ '--pb-frame': pbFrame }}>
                {/* Theme Icons in Corners */}
                <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontSize: '24px', zIndex: 5 }}>{currentTheme.icon}</div>
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontSize: '24px', zIndex: 5 }}>{currentTheme.icon}</div>

                {pbPhotos.map((p, i) => (
                  <img key={i} src={p} className="photostrip-img" alt={`photo-${i}`} />
                ))}
                
                {pbStickers.map(s => (
                  <motion.div 
                    key={s.id} 
                    drag 
                    dragConstraints={{ left: 0, right: 250, top: 0, bottom: 600 }}
                    style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: '40px', cursor: 'grab', zIndex: 10 }}
                  >
                    {s.emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="pb-side" style={{ minWidth: '320px' }}> 
            <div className="customize-panel">
              <span className="panel-title">Frame Color</span>
              <div className="color-grid">
                {frameColors.map(c => (
                  <div key={c.name} className={`color-opt ${pbSelectedColor === c.name ? 'active' : ''}`} onClick={() => pbFrameSet.set(c.color, c.name)}>
                    <span style={{ fontSize: '20px' }}>{c.icon}</span>
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
              <span className="panel-title">Stickers</span>
              <div className="sticker-grid">
                {stickers.map(s => (
                  <div key={s} className="sticker-opt" onClick={() => addSticker(s)}>{s}</div>
                ))}
              </div>
              <p style={{ fontSize: '10px', opacity: 0.5, marginTop: '10px' }}>*Sticker bisa digeser-geser ya! ✨</p>
              <div className="pb-actions" style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                   <button onClick={handleRetake} className="pb-btn pb-btn-retake">Retake</button>
                   <button onClick={() => setActiveTab('home')} className="pb-btn" style={{ background: '#94a3b8', color: '#fff' }}>Kembali</button>
                </div>
                <button className="pb-btn pb-btn-download" onClick={handleDownload}>Download</button>
                <button className="pb-btn pb-btn-send" onClick={() => { 
                  sendMessage({ 
                    type: 'photostrip', 
                    photos: pbPhotos, 
                    frame: pbFrame, 
                    stickers: pbStickers, 
                    themeIcon: currentTheme.icon,
                    sender: user.id 
                  }); 
                  setActiveTab('chat'); 
                }}>Kirim ke {getTargetUser()}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Photobooth
