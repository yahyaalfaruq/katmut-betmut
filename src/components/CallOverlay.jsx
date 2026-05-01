import React, { useEffect, useRef } from 'react'
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, PhoneCall, 
  ChevronDown, Maximize, RefreshCw, Monitor
} from 'lucide-react'
import { motion } from 'framer-motion'

const CallOverlay = ({ 
  type, user, localStream, remoteStream, callStatus, timer, 
  incomingCall, isCaller, onAccept, onHangUp,
  isMuted, isVideoOff, isScreenSharing, isMinimized,
  toggleMic, toggleVideo, toggleScreenShare, toggleFullscreen, onRefresh, onMinimize
}) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
      localVideoRef.current.play().catch(e => console.log('Local auto-play blocked:', e))
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
      remoteVideoRef.current.play().catch(e => console.log('Auto-play blocked or failed:', e))
    }
  }, [remoteStream])

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600)
    const mins = Math.floor((s % 3600) / 60)
    const secs = s % 60
    const parts = []
    if (hrs > 0) parts.push(hrs.toString().padStart(2, '0'))
    parts.push(mins.toString().padStart(2, '0'))
    parts.push(secs.toString().padStart(2, '0'))
    return parts.join(':')
  }

  // A call is considered "accepted" if we are the caller OR if the incoming call has been confirmed
  const isAccepted = isCaller || (incomingCall && callStatus !== 'Panggilan Masuk...')

  if (isMinimized) {
    return (
      <motion.div 
        layoutId="call-mini"
        onClick={onMinimize}
        className="mini-call-window"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="mini-video-container">
          <video ref={remoteVideoRef} autoPlay playsInline muted />
          <div className="mini-overlay">
             <span>{formatTime(timer)}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Determine who the opponent is
  const opponentName = isCaller ? (user.id === 'katmut' ? 'Betmut' : 'Katmut') : (incomingCall?.from === 'katmut' ? 'Katmut' : 'Betmut')
  const opponentAvatar = opponentName === 'Katmut' ? '🐸' : '🐤'
  const opponentColor = opponentName === 'Katmut' ? '#26de81' : '#fed330'

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="call-overlay"
    >
      {/* Top Bar Section */}
      <div className="call-top-bar">
        <div className="top-bar-left">
          <button className="top-icon-btn" onClick={onMinimize} title="Minimize">
            <ChevronDown size={20} />
            <span style={{ fontSize: '10px', fontWeight: 'bold', marginLeft: '2px' }}>MIN</span>
          </button>
        </div>
        
        <div className="top-bar-center">
          <div className="secure-badge">
            <div className="green-dot"></div>
            <span>SECURE HANDSHAKE</span>
          </div>
        </div>

        <div className="top-bar-right">
          <button className="top-icon-btn" onClick={toggleFullscreen} title="Fullscreen">
            <Maximize size={18} />
          </button>
          <button className="top-icon-btn" onClick={onRefresh} title="Reconnect">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className={(type === 'video' && isAccepted) ? 'video-container' : 'hidden-media'}>
         <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
         <div className="local-video-wrapper">
           <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
           {isScreenSharing && <div className="screen-share-badge"><Monitor size={12} /> Sharing</div>}
         </div>
      </div>
      
      <div className="call-content">
        {(type === 'voice' || !isAccepted || (type === 'video' && callStatus !== 'Terhubung')) && (
          <div className="central-avatar-area">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="call-avatar-container">
              <div 
                className="call-avatar" 
                style={{ background: opponentColor }}
              >
                {opponentAvatar}
              </div>
              <div className="pulse-ring" style={{ borderColor: opponentColor }} />
            </motion.div>
            <h2 className="call-name">{opponentName}</h2>
            <p className="contacting-text">{callStatus === 'Terhubung' ? 'CONNECTED' : (isCaller ? 'CONTACTING SERVER...' : 'INCOMING CALL...')}</p>
          </div>
        )}
        
        {callStatus === 'Terhubung' && type === 'video' && (
          <div className="timer-badge">
            {formatTime(timer)}
          </div>
        )}
      </div>

      <div className="call-footer-actions">
        {incomingCall && !isAccepted && !isCaller ? (
          <div className="incoming-actions">
            <button className="call-btn accept" onClick={onAccept}><PhoneCall /></button>
            <button className="call-btn end" onClick={onHangUp}><PhoneOff /></button>
          </div>
        ) : (
          <div className="active-call-bar">
            <div className="controls-group">
              <button className={`control-btn ${isMuted ? 'off' : ''}`} onClick={toggleMic}>
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button className={`control-btn ${isVideoOff ? 'off' : ''}`} onClick={toggleVideo}>
                {isVideoOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
              </button>
              <button className={`control-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare}>
                <Monitor size={22} />
              </button>
            </div>
            <div className="divider"></div>
            <button className="call-btn end" onClick={onHangUp}><PhoneOff /></button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CallOverlay
