import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import io from 'socket.io-client'
import { Video, Phone, Send, LogOut, Download } from 'lucide-react'

// Components
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Home from './components/Home'
import Chat from './components/Chat'
import Photobooth from './components/Photobooth'
import Games from './components/Games'
import Gallery from './components/Gallery'
import Articles from './components/Articles'
import CallOverlay from './components/CallOverlay'

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin)

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  })
  const [activeTab, setActiveTab] = useState('home')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [selectedChar, setSelectedChar] = useState(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // UI States
  const [activeMessageMenu, setActiveMessageMenu] = useState(null)
  const [isCalling, setIsCalling] = useState(null) // null, 'voice', 'video'
  const [incomingCall, setIncomingCall] = useState(null)
  const [isCaller, setIsCaller] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [callStatus, setCallStatus] = useState('Menghubungkan...')
  const [timer, setTimer] = useState(0)
  const [iceCandidates, setIceCandidates] = useState([])
  const [notifications, setNotifications] = useState([]) // { id, type, content, from }
  const [showNav, setShowNav] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)

  // Call features state
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const processedCandidatesCount = useRef(0)
  const remoteDescSet = useRef(false)
  const screenStreamRef = useRef(null)
  
  // Audio refs
  const chatSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'))
  const callSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3'))

  useEffect(() => {
    callSound.current.loop = true;
  }, [])

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)

  // Missions
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Minum air putih 8 gelas', done: true },
    { id: 2, text: 'Kasih kabar Katmut', done: false },
    { id: 3, text: 'Tersenyum hari ini', done: false },
    { id: 4, text: 'Makan buah-buahan', done: false },
    { id: 5, text: 'Istirahat cukup', done: true }
  ])

  // Photobooth state
  const [pbState, setPbState] = useState('idle')
  const [pbPhotos, setPbPhotos] = useState([])
  const [pbCount, setPbCount] = useState(null)
  const [pbFrame, setPbFrame] = useState('#26de81')
  const [pbStickers, setPbStickers] = useState([])
  const [pbSelectedColor, setPbSelectedColor] = useState('Katmut')
  const [facingMode, setFacingMode] = useState('user')

  const scrollRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const frameColors = [
    { name: 'Katmut', color: '#26de81', icon: '🐸' },
    { name: 'Betmut', color: '#fed330', icon: '🐤' },
    { name: 'Pink', color: '#ff9ff3', icon: '🌸' },
    { name: 'Blue', color: '#48dbfb', icon: '🌊' },
    { name: 'Dark', color: '#2f3640', icon: '🖤' },
    { name: 'Light', color: '#f5f6fa', icon: '🤍' }
  ]

  const stickers = ['🍀', '✨', '🐸', '🐤', '🌸', '🌊', '🖤', '🤍', '🎀', '💋', '❤️', '🍓', '🍑', '🐶', '🐱', '🐰', '🐻']

  const [galleryItems, setGalleryItems] = useState([])
  const [articleItems, setArticleItems] = useState([])

  useEffect(() => {
    socket.on('connect', () => console.log('Socket connected:', socket.id))
    socket.on('connect_error', (err) => console.error('Socket connection error:', err))
    
    setTimeout(() => setIsLoading(false), 2000)

    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg])
      
      // Play chat sound
      chatSound.current.currentTime = 0;
      chatSound.current.play().catch(e => console.log('Audio play failed:', e));

      const isNotActiveTab = activeTab !== 'chat' || document.hidden;
      
      if (isNotActiveTab) {
        const id = Date.now()
        const content = msg.type === 'photostrip' ? 'Mengirim photostrip baru! 📸' : msg.text;
        setNotifications(prev => [...prev, { id, type: 'message', content, from: msg.sender }])
        
        // Show system notification
        if (Notification.permission === 'granted') {
          new Notification(`Pesan dari ${msg.sender}`, {
            body: content,
            icon: '/app-icon.png',
            tag: `chat-${msg.id}`
          });
        }

        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000)
      }
    })

    socket.on('message-history', (history) => {
      console.log('Chat history loaded:', history.length, 'messages')
      setMessages(history)
    })

    socket.on('gallery-history', (history) => {
      console.log('Gallery history loaded:', history.length, 'items')
      setGalleryItems(history)
    })

    socket.on('gallery-item-added', (item) => {
      setGalleryItems(prev => [item, ...prev])
    })

    socket.on('gallery-item-updated', (id, data) => {
      setGalleryItems(prev => prev.map(img => {
        if (img.id === id) {
          if (data.type === 'sync') return data.item;
          if (data.type === 'like') return { ...img, likes: img.likes + 1 };
          if (data.type === 'comment') {
            const comments = img.comments || [];
            if (comments.some(c => c.id === data.comment.id)) return img;
            return { ...img, comments: [...comments, data.comment] };
          }
        }
        return img;
      }))
    })

    socket.on('article-history', (history) => {
      console.log('Article history loaded:', history.length, 'items')
      setArticleItems(history)
    })

    socket.on('article-added', (article) => {
      setArticleItems(prev => [article, ...prev])
    })
    
    socket.on('message-edited', ({ id, text }) => setMessages(prev => prev.map(m => m.id === id ? { ...m, text, edited: true } : m)))
    socket.on('message-deleted', (id) => setMessages(prev => prev.filter(m => m.id !== id)))
    socket.on('game-update', ({ board, isXNext }) => { setBoard(board); setIsXNext(isXNext); })
    
    socket.on('call-made', async (data) => {
      if (data.from === user.id) return;
      
      setIncomingCall(data)
      setIsCaller(false)
      
      // Play call sound
      callSound.current.currentTime = 0;
      callSound.current.play().catch(e => console.log('Audio play failed:', e));

      const id = Date.now()
      setNotifications(prev => {
        if (prev.find(n => n.type === 'call')) return prev;
        return [...prev, { id, type: 'call', callData: data }];
      })

      // Show system notification
      if (Notification.permission === 'granted') {
        new Notification('Panggilan Masuk', {
          body: `${data.from} ingin ${data.type === 'video' ? 'VC' : 'Telpon'}`,
          icon: '/app-icon.png',
          tag: 'call-notification',
          requireInteraction: true
        });
      }
    })

    socket.on('answer-made', async (data) => {
      console.log('Answer received')
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
        remoteDescSet.current = true
        processQueuedCandidates()
      }
    })

    socket.on('ice-candidate', (data) => {
      if (remoteDescSet.current && peerRef.current) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.log(e))
      } else {
        setIceCandidates(prev => [...prev, data])
      }
    })

    socket.on('call-ended', () => handleEndCall(false))

    const handleBeforeInstallPrompt = (e) => {
      // Only show install prompt on mobile
      if (isMobile) {
        e.preventDefault();
        setDeferredPrompt(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (user) socket.emit('register', user.id)
    return () => { 
      socket.off('receive-message'); 
      socket.off('message-edited'); 
      socket.off('game-update');
      socket.off('call-made');
      socket.off('answer-made');
      socket.off('ice-candidate');
      socket.off('call-ended');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, [user, activeTab])

  // Scroll detection for auto-hide nav
  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollY = e.target.scrollTop;
      
      // Check if at the very top
      setIsAtTop(currentScrollY <= 10);

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollY.current = currentScrollY;
    };

    // We need to listen to all possible scroll areas
    const scrollAreas = document.querySelectorAll('.scroll-area, .chat-messages, .gallery-modal-comments');
    scrollAreas.forEach(el => el.addEventListener('scroll', handleScroll));
    
    const handleTouch = () => setShowNav(true);
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('mousedown', handleTouch);

    return () => {
      scrollAreas.forEach(el => el.removeEventListener('scroll', handleScroll));
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('mousedown', handleTouch);
    }
  }, [activeTab, isLoading]); // Re-run when tab changes or loading finishes
  
  useEffect(() => {
    if (user) {
      document.body.dataset.theme = user.id;
    } else {
      delete document.body.dataset.theme;
    }
  }, [user])

  const processQueuedCandidates = () => {
    if (peerRef.current && remoteDescSet.current) {
      setIceCandidates(prev => {
        prev.forEach(data => {
          peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.log(e))
        })
        return []
      })
    }
  }

  const initPeerConnection = async (type) => {
    try {
      peerRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      })

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            to: getTargetUser(),
            candidate: event.candidate,
            from: user.id
          })
        }
      }

      peerRef.current.oniceconnectionstatechange = () => {
        console.log('ICE State:', peerRef.current.iceConnectionState)
        if (peerRef.current.iceConnectionState === 'connected' || peerRef.current.iceConnectionState === 'completed') {
          setCallStatus('Terhubung')
        } else if (peerRef.current.iceConnectionState === 'failed' || peerRef.current.iceConnectionState === 'closed') {
          setCallStatus('Koneksi Terputus')
        }
      }

      // Modern API
      peerRef.current.ontrack = (event) => {
        console.log('Track received:', event.track.kind)
        const stream = event.streams[0] || new MediaStream([event.track])
        setRemoteStream(stream)
        setCallStatus('Terhubung')
      }

      // Legacy fallback
      peerRef.current.onaddstream = (event) => {
        console.log('Stream added (legacy):', event.stream)
        setRemoteStream(event.stream)
        setCallStatus('Terhubung')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream))
    } catch (err) {
      console.error('Media Error:', err)
      setCallStatus(`Error: ${err.message || 'Gagal akses kamera/mic'}`)
      throw err
    }
  }

  const startCall = async (type) => {
    try {
      setIsCaller(true)
      setIsCalling(type)
      setCallStatus('Menghubungkan...')
      await initPeerConnection(type)
      const offer = await peerRef.current.createOffer()
      await peerRef.current.setLocalDescription(offer)
      socket.emit('call-user', { userToCall: getTargetUser(), offer, from: user.id, type })
    } catch (e) {
      console.error('Start call error:', e)
    }
  }

  const acceptCall = async (callData) => {
    try {
      // Stop call sound
      callSound.current.pause();
      callSound.current.currentTime = 0;

      setIsCaller(false)
      setIncomingCall(callData)
      setIsCalling(callData.type)
      setCallStatus('Panggilan Masuk...')
      await initPeerConnection(callData.type)
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(callData.offer))
      remoteDescSet.current = true
      processQueuedCandidates()
    } catch (e) {
      console.error('Accept call error:', e)
    }
  }

  const confirmAccept = async () => {
    setCallStatus('Menghubungkan...')
    const answer = await peerRef.current.createAnswer()
    await peerRef.current.setLocalDescription(answer)
    socket.emit('make-answer', { to: getTargetUser(), answer, from: user.id })
  }

  const handleEndCall = (emit = true) => {
    // Stop call sound
    callSound.current.pause();
    callSound.current.currentTime = 0;

    if (emit) socket.emit('end-call', { to: getTargetUser() })
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop())
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop())
    if (peerRef.current) peerRef.current.close()
    peerRef.current = null
    localStreamRef.current = null
    screenStreamRef.current = null
    remoteDescSet.current = false
    setIsCalling(null)
    setIncomingCall(null)
    setIsCaller(false)
    setLocalStream(null)
    setRemoteStream(null)
    setCallStatus('Menghubungkan...')
    setTimer(0)
    setIceCandidates([])
    setNotifications(prev => prev.filter(n => n.type !== 'call'))
    setIsMuted(false)
    setIsVideoOff(false)
    setIsScreenSharing(false)
    setIsMinimized(false)
  }

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        const screenTrack = stream.getVideoTracks()[0]
        
        if (peerRef.current) {
          const sender = peerRef.current.getSenders().find(s => s.track.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack)
        }
        
        setLocalStream(stream)
        setIsScreenSharing(true)
        
        screenTrack.onended = () => stopScreenShare()
      } else {
        stopScreenShare()
      }
    } catch (err) {
      console.error('Screen share error:', err)
    }
  }

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
    }
    
    if (peerRef.current && localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      const sender = peerRef.current.getSenders().find(s => s.track.kind === 'video')
      if (sender) sender.replaceTrack(videoTrack)
    }
    
    setLocalStream(localStreamRef.current)
    setIsScreenSharing(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const refreshCall = async () => {
    const currentType = isCalling
    handleEndCall(true)
    setTimeout(() => startCall(currentType), 500)
  }

  useEffect(() => {
    let interval;
    if (callStatus === 'Terhubung') {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  const getTargetUser = () => user?.id === 'katmut' ? 'betmut' : 'katmut'

  const installApp = async () => {
    if (isIOS) {
      alert("Khusus iPhone ✨:\n\n1. Klik tombol 'Share' (kotak panah ke atas) di bagian bawah browser.\n2. Scroll ke bawah dan pilih 'Add to Home Screen' (Tambah ke Layar Utama).\n3. Selesai! Aplikasi akan muncul di menu HP-mu.");
      return;
    }
    if (!deferredPrompt) {
      alert("Cara Install di Android ✨:\n\n1. Klik titik tiga (⋮) di pojok kanan atas browser Chrome.\n2. Pilih menu 'Install App' atau 'Tambahkan ke Layar Utama'.\n3. Selesai! Aplikasi akan muncul di menu HP-mu.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };


  const handleLogin = () => {
    const correctPassword = selectedChar === 'katmut' ? 'katak' : 'bebek'
    if (password.toLowerCase().trim() === correctPassword) {
      const newUser = { id: selectedChar, name: selectedChar === 'katmut' ? 'Katmut' : 'Betmut' }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      socket.emit('login', selectedChar)
      setPbFrame(selectedChar === 'katmut' ? '#26de81' : '#fed330')
      setPbSelectedColor(selectedChar === 'katmut' ? 'Katmut' : 'Betmut')
      
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    } else {
      setLoginError(`Salah nih, sandi ${selectedChar} bukan itu! ✨`)
    }
  }

  const sendMessage = (msg) => {
    const fullMsg = { ...msg, id: Date.now(), time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, fullMsg])
    socket.emit('send-message', { to: getTargetUser(), message: fullMsg })
  }

  const deleteMessage = (id, mode) => {
    if (mode === 'everyone') {
      setMessages(prev => prev.filter(m => m.id !== id))
      socket.emit('delete-message', { to: getTargetUser(), id })
    } else {
      setMessages(prev => prev.filter(m => m.id !== id))
    }
    setActiveMessageMenu(null)
  }

  const editMessage = (id, newText) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText, edited: true } : m))
    socket.emit('edit-message', { to: getTargetUser(), id, text: newText })
  }

  const handleGameClick = (i) => {
    if (board[i] || calculateWinner(board)) return
    const newBoard = board.slice(); newBoard[i] = isXNext ? '🐸' : '🐤'; setBoard(newBoard); setIsXNext(!isXNext);
    socket.emit('game-move', { to: getTargetUser(), board: newBoard, isXNext: !isXNext })
  }

  const calculateWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a]
    }
    return null
  }

  const startPhotobooth = async () => {
    setPbPhotos([]); setPbStickers([]); setPbState('capturing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      let captured = [];
      for (let i = 0; i < 4; i++) {
        for (let c = 3; c >= 1; c--) { setPbCount(c); await new Promise(r => setTimeout(r, 1000)); }
        setPbCount('📸');
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        captured.push(canvas.toDataURL('image/jpeg', 0.8)); setPbPhotos([...captured]);
        await new Promise(r => setTimeout(r, 500));
      }
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      setPbState('customize'); setPbCount(null);
    } catch (e) { alert('Gagal akses kamera!'); setPbState('idle'); }
  };

  return (
    <div className="app-shell">
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '80px' }}>🐸🐤</motion.div>
            <h2 style={{ fontWeight: '800', color: '#26de81', marginTop: '20px' }}>Katmut <span style={{ color: '#fed330' }}>& Betmut</span></h2>
          </motion.div>
        )}
      </AnimatePresence>

      {!user ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', width: '100%', maxWidth: '400px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '1.5rem' }}>
              <img src="/images/katmut.png" style={{ width: '120px', height: '120px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
              <img src="/images/betmut.png" style={{ width: '120px', height: '120px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</h1>
            <h2 style={{ color: '#1e293b', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: '800' }}>Siapa kamu? ✨</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {[{ id: 'katmut', name: 'Katmut', icon: '🐸', color: '#26de81' }, { id: 'betmut', name: 'Betmut', icon: '🐤', color: '#fed330' }].map(char => (
                <div 
                  key={char.id} 
                  onClick={() => setSelectedChar(char.id)} 
                  style={{ 
                    padding: '20px', 
                    background: selectedChar === char.id ? char.color : '#fff', 
                    color: selectedChar === char.id ? '#fff' : '#1e293b', 
                    borderRadius: '25px', 
                    cursor: 'pointer', 
                    transition: '0.3s', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                    border: `3px solid ${selectedChar === char.id ? char.color : 'transparent'}` 
                  }}
                >
                  <div style={{ width: '100px', height: '100px', margin: '0 auto', marginBottom: '15px' }}>
                    <img 
                      src={char.id === 'katmut' ? '/images/katmut.png' : '/images/betmut.png'} 
                      alt={char.id}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <div style={{ fontSize: '60px', display: 'none' }}>{char.icon}</div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{char.name}</div>
                </div>
              ))}
            </div>
            {selectedChar && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '2rem' }}>
                <input type="password" placeholder="Sandi Rahasia..." style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', outline: 'none', textAlign: 'center', fontSize: '16px' }} value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
                {loginError && <p style={{ color: '#ff7675', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' }}>{loginError}</p>}
                <button onClick={handleLogin} style={{ width: '100%', marginTop: '10px', padding: '15px', borderRadius: '15px', border: 'none', background: selectedChar === 'katmut' ? '#26de81' : '#fed330', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '16px' }}>Masuk</button>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} visible={showNav} />
          <main className="main-content">
            <Header user={user} setUser={setUser} onCall={startCall} />
            <div className="scroll-area" ref={scrollRef}>
              {activeTab === 'home' && <Home user={user} messagesCount={messages.length} tasks={tasks} setActiveTab={setActiveTab} onCall={startCall} galleryItems={galleryItems} />}
              {activeTab === 'chat' && <Chat messages={messages} user={user} activeMessageMenu={activeMessageMenu} setActiveMessageMenu={setActiveMessageMenu} inputText={inputText} setInputText={setInputText} sendMessage={sendMessage} deleteMessage={deleteMessage} editMessage={editMessage} scrollRef={scrollRef} navVisible={showNav} />}
              {activeTab === 'photobooth' && <Photobooth pbState={pbState} pbPhotos={pbPhotos} pbCount={pbCount} pbFrame={pbFrame} pbStickers={pbStickers} pbSelectedColor={pbSelectedColor} videoRef={videoRef} startPhotobooth={startPhotobooth} handleRetake={() => { setPbPhotos([]); setPbState('idle'); setTimeout(startPhotobooth, 100); }} toggleCamera={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} addSticker={(s) => setPbStickers([...pbStickers, { id: Date.now(), emoji: s, x: Math.random()*80, y: Math.random()*80 }])} frameColors={frameColors} stickers={stickers} user={user} getTargetUser={getTargetUser} sendMessage={sendMessage} setActiveTab={setActiveTab} facingMode={facingMode} pbFrameSet={{ set: (c, n) => { setPbFrame(c); setPbSelectedColor(n); } }} />}
              {activeTab === 'games' && <Games board={board} handleGameClick={handleGameClick} setBoard={setBoard} isXNext={isXNext} winner={calculateWinner(board)} />}
              {activeTab === 'gallery' && <Gallery galleryItems={galleryItems} user={user} socket={socket} sendMessage={sendMessage} />}
              {activeTab === 'articles' && <Articles articles={articleItems} user={user} socket={socket} />}
              {activeTab === 'history' && <div style={{ textAlign: 'center', opacity: 0.5, padding: '50px' }}>Belum ada riwayat panggilan.</div>}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </main>
        </>
      )}

      <AnimatePresence>
        {isCalling && (
          <CallOverlay 
            type={isCalling} 
            user={user} 
            localStream={localStream}
            remoteStream={remoteStream}
            callStatus={callStatus}
            timer={timer}
            incomingCall={incomingCall}
            isCaller={isCaller}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            isMinimized={isMinimized}
            onAccept={confirmAccept}
            onHangUp={() => handleEndCall(true)}
            toggleMic={toggleMic}
            toggleVideo={toggleVideo}
            toggleScreenShare={toggleScreenShare}
            toggleFullscreen={toggleFullscreen}
            onRefresh={refreshCall}
            onMinimize={() => setIsMinimized(!isMinimized)}
          />
        )}
      </AnimatePresence>

      <div className="notifications-container">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={`notif-toast ${n.type}`}
              style={{ borderLeftColor: (n.type === 'call' ? n.callData.from : n.from) === 'katmut' ? '#26de81' : '#fed330' }}
              onClick={() => n.type === 'message' && setActiveTab('chat')}
            >
              <div className="notif-icon">
                {n.type === 'call' ? (n.callData.type === 'video' ? <Video size={20} /> : <Phone size={20} />) : <Send size={20} />}
              </div>
              <div className="notif-body">
                <h4>{n.type === 'call' ? 'Panggilan Masuk' : `Pesan dari ${n.from}`}</h4>
                <p>{n.type === 'call' ? `${n.callData.from} ingin ${n.callData.type === 'video' ? 'VC' : 'Telpon'}` : n.content}</p>
                {n.type === 'call' && (
                  <div className="notif-actions">
                    <button className="notif-accept" onClick={(e) => { e.stopPropagation(); acceptCall(n.callData); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}>Terima</button>
                    <button className="notif-decline" onClick={(e) => { e.stopPropagation(); socket.emit('end-call', { to: n.callData.from }); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}>Tolak</button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(isMobile && isAtTop && !window.matchMedia('(display-mode: standalone)').matches) && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fab-install"
          style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 99999 }}
          onClick={installApp}
        >
          <Download size={24} />
          <span>Pasang App</span>
        </motion.button>
      )}
    </div>
  )
}

export default App
