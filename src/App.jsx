import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Image, History, Phone, Video, Heart, Settings, Home, Send, Sparkles, X, Mic, MicOff, Camera, Paperclip, CheckCircle2, Trophy, Gamepad2, BookOpen, Trash2, Plus, LogOut, Newspaper, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [user, setUser] = useState(null)
  const [selectedChar, setSelectedChar] = useState(null)
  const [password, setPassword] = useState('')
  
  const [activeTab, setActiveTab] = useState('home')
  const [isCalling, setIsCalling] = useState(false)
  const [isVideoCalling, setIsVideoCalling] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callHistory, setCallHistory] = useState(() => {
    const saved = localStorage.getItem('katmut_call_history');
    return saved ? JSON.parse(saved) : [];
  })
  
  const [micActive, setMicActive] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  
  const vcVideoRef = useRef(null)
  const vcStreamRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnection = useRef(null)
  
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [pbState, setPbState] = useState('idle')
  const [pbTheme, setPbTheme] = useState('katmut')
  const [pbSticker, setPbSticker] = useState('🍀')
  const [pbPhotos, setPbPhotos] = useState([])
  
  const pbThemesList = [
    { id: 'katmut', bg: '#e8f5e9', border: '#26de81', name: 'Katmut', icon: '🐸' },
    { id: 'betmut', bg: '#fff9c4', border: '#fed330', name: 'Betmut', icon: '🐤' },
    { id: 'pink', bg: '#ffeaa7', border: '#ff7675', name: 'Pink', icon: '🌸' },
    { id: 'blue', bg: '#e0f7fa', border: '#00bcd4', name: 'Blue', icon: '🌊' },
    { id: 'dark', bg: '#2d3436', border: '#636e72', name: 'Dark', icon: '🖤' },
    { id: 'light', bg: '#ffffff', border: '#dfe6e9', name: 'Light', icon: '🤍' }
  ];
  
  const pbStickersList = ['🍀', '✨', '🐸', '🐤', '🌸', '🌊', '🖤', '🤍', '🎀', '💋', '❤️', '🍓', '🍑', '🐶', '🐱', '🐰', '🐻'];
  const [pbCount, setPbCount] = useState(null)
  const pbStripRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [inputText, setInputText] = useState('')
  const [editingMessage, setEditingMessage] = useState(null)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('katmut_messages');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'text', text: "Halo Betmut! Lihat deh foto-foto petualangan kita kemarin, bagus banget! 🐸", sender: 'katmut', timestamp: Date.now() },
    ];
  })

  const [tasks, setTasks] = useState([
    { id: 1, text: "Update Gallery dengan foto baru", done: true },
    { id: 2, text: "Main Tic-Tac-Toe bareng", done: false },
    { id: 3, text: "Baca artikel hari ini", done: false }
  ])
  
  const [badges, setBadges] = useState([
    { id: 'first_msg', name: 'First Hello', icon: '👋', earned: true },
    { id: 'adventurer', name: 'Explorer', icon: '🏔️', earned: true },
    { id: 'photographer', name: 'Shutterbug', icon: '📸', earned: true }
  ])

  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  
  const [articles, setArticles] = useState([
    { id: 1, title: 'Tips Bahagia Ala Katmut', excerpt: 'Ternyata rahasia Katmut selalu ceria adalah...', category: 'Tips', date: '28 Apr' },
    { id: 2, title: 'Kolam Renang Tersembunyi', excerpt: 'Betmut menemukan kolam air hangat di balik bukit...', category: 'Adventure', date: '27 Apr' },
    { id: 3, title: 'Resep Roti Jagung Enak', excerpt: 'Camilan favorit kita berdua ternyata mudah dibuat...', category: 'Food', date: '26 Apr' }
  ])

  const [galleryImages, setGalleryImages] = useState([
    { id: 1, url: '/images/gallery/gallery1.png', title: 'Cupid Katmut & Betmut 💖', likes: 88 },
    { id: 2, url: '/images/gallery/gallery2.png', title: 'Nyantai di Bawah Sakura 🌸', likes: 92 },
    { id: 3, url: '/images/gallery/gallery3.png', title: 'Selfie Bulan Purnama 🌙', likes: 120 },
    { id: 4, url: '/images/gallery/gallery4.png', title: 'Menatap Masa Depan Berdua ✨', likes: 150 }
  ])

  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) document.body.setAttribute('data-theme', user.id)
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    localStorage.setItem('katmut_messages', JSON.stringify(messages));
    localStorage.setItem('katmut_call_history', JSON.stringify(callHistory));
  }, [user, messages, callHistory, activeTab])

  useEffect(() => {
    if (activeTab === 'photobooth') {
      setCameraError(false);
      navigator.mediaDevices.getUserMedia({ video: { facingMode } })
        .then(s => {
          streamRef.current = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.error(err);
          setCameraError(true);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCapturedImage(null);
      setCameraError(false);
      setPbState('idle');
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [activeTab, facingMode]);

  useEffect(() => {
    // Reattach stream if video element is remounted during state change
    if (videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [pbState]);

  // SOCKET.IO & WEBRTC CONNECTION
  useEffect(() => {
    if (user) {
      import('socket.io-client').then(({ io }) => {
        const socketUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
        const newSocket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5
        });

        setSocket(newSocket);

        const onConnect = () => {
          setIsConnected(true);
          console.log('Connected to Signaling Server as:', user.id);
          newSocket.emit('register', user.id);
        };

        if (newSocket.connected) onConnect();
        newSocket.on('connect', onConnect);

        newSocket.on('disconnect', () => {
          setIsConnected(false);
          console.log('Disconnected from server');
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket Connection Error:', err.message);
          setIsConnected(false);
        });

        newSocket.on('receive-message', (msg) => {
          setMessages(prev => [...prev, msg]);
          if (document.hidden) {
            new Notification(`Pesan baru dari ${msg.sender === 'katmut' ? 'Katmut' : 'Betmut'}`, {
              body: msg.text,
              icon: '/vite.svg'
            });
          }
        });

        newSocket.on('call-made', async (data) => {
          setIncomingCall(data);
          if (document.hidden) {
            new Notification(`Panggilan dari ${data.from === 'katmut' ? 'Katmut' : 'Betmut'}`, {
              body: 'Klik untuk menjawab panggilan imut ini! 🐸🐤',
              icon: '/vite.svg'
            });
          }
        });

        newSocket.on('answer-made', async (data) => {
          if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        });

        newSocket.on('ice-candidate', async (data) => {
          if (peerConnection.current) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        });

        newSocket.on('call-ended', () => {
          endCallLocally();
        });

        newSocket.on('game-move', (data) => {
          setBoard(data.board);
          setIsXNext(data.isXNext);
        });

        newSocket.on('game-reset', () => {
          setBoard(Array(9).fill(null));
          setIsXNext(true);
        });

        newSocket.on('message-deleted', (msgId) => {
          setMessages(prev => prev.filter(m => m.id !== msgId));
        });

        newSocket.on('message-edited', (data) => {
          setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, text: data.newText, edited: true } : m));
        });
      });
    }
    return () => {
      if (socket) socket.disconnect();
    }
  }, [user]);

  const getTargetUser = () => user?.id === 'katmut' ? 'betmut' : 'katmut';

  const sendMessage = (msgObj) => {
    if (editingMessage) {
      const updatedMessages = messages.map(m => m.id === editingMessage.id ? { ...m, text: inputText, edited: true } : m);
      setMessages(updatedMessages);
      if (socket) {
        socket.emit('edit-message', { to: getTargetUser(), messageId: editingMessage.id, newText: inputText });
      }
      setEditingMessage(null);
      setInputText('');
      return;
    }

    setMessages(prev => [...prev, msgObj]);
    if (socket) {
      socket.emit('send-message', { to: getTargetUser(), message: msgObj });
    }
  };

  const deleteMessage = (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (socket) {
      socket.emit('delete-message', { to: getTargetUser(), messageId: msgId });
    }
  };

  const startEdit = (msg) => {
    setEditingMessage(msg);
    setInputText(msg.text);
  };

  const initWebRTC = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    vcStreamRef.current = stream;
    if (vcVideoRef.current) vcVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: getTargetUser(),
          candidate: event.candidate,
          from: user.id
        });
      }
    };

    peerConnection.current = pc;
    
    const callLog = {
      id: Date.now(),
      type: 'call-log',
      text: `Panggilan Video (${new Date().toLocaleTimeString()})`,
      sender: user.id,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, callLog]);
    
    // Add to history
    setCallHistory(prev => [{
      id: Date.now(),
      type: 'Video Call',
      with: getTargetUser(),
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      status: 'Ongoing'
    }, ...prev]);

    return pc;
  };

  const toggleMic = () => {
    if (vcStreamRef.current) {
      const audioTrack = vcStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (vcStreamRef.current) {
      const videoTrack = vcStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoActive(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (peerConnection.current) {
          const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }
        
        if (vcVideoRef.current) vcVideoRef.current.srcObject = screenStream;
        
        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const stopScreenShare = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const videoTrack = stream.getVideoTracks()[0];
    
    if (peerConnection.current) {
      const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    }
    
    if (vcVideoRef.current) vcVideoRef.current.srcObject = stream;
    vcStreamRef.current = stream;
    setIsScreenSharing(false);
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    
    if (vcStreamRef.current) {
      vcStreamRef.current.getTracks().forEach(t => t.stop());
    }
    
    const newStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: newMode }, 
      audio: true 
    });
    
    vcStreamRef.current = newStream;
    if (vcVideoRef.current) vcVideoRef.current.srcObject = newStream;
    
    if (peerConnection.current) {
      const videoTrack = newStream.getVideoTracks()[0];
      const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    }
  };

  const startVideoCall = async () => {
    setIsVideoCalling(true);
    const pc = await initWebRTC();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    
    if (socket) {
      socket.emit('call-user', {
        userToCall: getTargetUser(),
        from: user.id,
        offer: offer
      });
    }
  };

  const acceptCall = async () => {
    setIncomingCall(null);
    setIsVideoCalling(true);
    const pc = await initWebRTC();
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(new RTCSessionDescription(answer));
    
    if (socket) {
      socket.emit('make-answer', {
        answer,
        to: incomingCall.from,
        from: user.id
      });
    }
  };

  const endCall = () => {
    if (socket) socket.emit('end-call', { to: getTargetUser() });
    endCallLocally();
  };

  const endCallLocally = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (vcStreamRef.current) {
      vcStreamRef.current.getTracks().forEach(track => track.stop());
      vcStreamRef.current = null;
    }
    setIsVideoCalling(false);
    setIncomingCall(null);
  };

  // Clean up WebRTC streams on unmount or tab change
  useEffect(() => {
    if (!isVideoCalling && vcStreamRef.current) {
      vcStreamRef.current.getTracks().forEach(t => t.stop());
      vcStreamRef.current = null;
    }
  }, [isVideoCalling]);

  const startPhotobooth = () => {
    setPbPhotos([]);
    setPbState('countdown');
    setCapturedImage(null);
    takeSequence(0, []);
  };

  const takeSequence = (index, currentPhotos) => {
    if (index >= 4) {
      setPbState('customize');
      return;
    }
    
    let counter = 3;
    setPbCount(counter);
    
    const interval = setInterval(() => {
      counter--;
      if (counter > 0) {
        setPbCount(counter);
      } else {
        clearInterval(interval);
        setPbCount('📸');
        if (videoRef.current) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = videoRef.current.videoWidth || 400;
          canvas.height = videoRef.current.videoHeight || 300;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const newPhoto = canvas.toDataURL('image/jpeg', 0.8);
          
          const updatedPhotos = [...currentPhotos, newPhoto];
          setPbPhotos(updatedPhotos);
          
          setTimeout(() => {
             takeSequence(index + 1, updatedPhotos);
          }, 800);
        }
      }
    }, 1000);
  };

  const savePhotostrip = async (action = 'download') => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert("Gagal memproses kanvas!");
        return;
      }
      
      const activeTheme = pbThemesList.find(t => t.id === pbTheme) || pbThemesList[0];
      const pWidth = 320;
      const pHeight = 240;
      const padding = 25;
      const gap = 15;
      const topPadding = 40;
      const bottomPadding = 120;
      
      const cWidth = pWidth + (padding * 2);
      const cHeight = topPadding + (pHeight * 4) + (gap * 3) + bottomPadding;
      
      canvas.width = cWidth;
      canvas.height = cHeight;
      
      ctx.fillStyle = activeTheme.bg;
      ctx.fillRect(0, 0, cWidth, cHeight);
      
      // Ensure stickers render fully opaque
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#000000';
      ctx.font = '30px Arial';
      ctx.fillText(pbSticker, 15, 45);
      ctx.fillText(pbSticker, cWidth - 45, topPadding + pHeight - 10);
      ctx.fillText(pbSticker, 20, topPadding + (pHeight * 2) + 20);
      ctx.fillText(pbSticker, cWidth - 50, cHeight - 170);
      
      for (let i = 0; i < pbPhotos.length; i++) {
        if (!pbPhotos[i]) continue;
        await new Promise(resolve => {
          const img = new window.Image();
          img.onload = () => {
            const y = topPadding + (i * (pHeight + gap));
            ctx.drawImage(img, padding, y, pWidth, pHeight);
            ctx.strokeStyle = activeTheme.border;
            ctx.lineWidth = 2;
            ctx.strokeRect(padding, y, pWidth, pHeight);
            resolve();
          };
          img.onerror = resolve;
          img.src = pbPhotos[i];
          setTimeout(resolve, 1000);
        });
      }

      ctx.fillStyle = activeTheme.id === 'dark' ? '#fff' : '#333';
      ctx.font = 'bold 36px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`photobooth`, cWidth / 2, cHeight - 60);
      ctx.font = 'bold 18px "Fredoka", sans-serif';
      ctx.fillText(`EST ${new Date().getFullYear()} ${activeTheme.icon}`, cWidth / 2, cHeight - 35);

      const finalImage = canvas.toDataURL('image/jpeg', 0.9);
      
      if (action === 'download') {
        const link = document.createElement('a');
        link.href = finalImage;
        link.download = `Photostrip_KatmutBetmut_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (action === 'send') {
        sendMessage({ id: Date.now(), type: 'image', url: finalImage, sender: user?.id || 'katmut' });
        setActiveTab('chat');
      }
      
      setPbState('idle');
    } catch (e) {
      alert("Error saat export: " + e.message);
      console.error(e);
      setPbState('idle');
    }
  };

  const handleLogin = () => {
    const creds = { katmut: 'katak', betmut: 'bebek' }
    if (creds[selectedChar] === password) {
      setUser({ id: selectedChar, name: selectedChar === 'katmut' ? 'Katmut' : 'Betmut' })
      setActiveTab('home')
      
      // Request notification permission
      if ("Notification" in window) {
        Notification.requestPermission();
      }
    } else {
      alert("Password salah!")
    }
  }

  const handleGameClick = (i) => {
    if (board[i] || calculateWinner(board)) return
    const newBoard = board.slice()
    newBoard[i] = isXNext ? '🐸' : '🐤'
    const nextIsX = !isXNext
    setBoard(newBoard)
    setIsXNext(nextIsX)
    
    if (socket) {
      socket.emit('game-move', { to: getTargetUser(), board: newBoard, isXNext: nextIsX });
    }
  }

  const calculateWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a]
    }
    return null
  }

  const winner = calculateWinner(board)

  return (
    <div className="app-shell">
      {!user ? (
        <div className="screen" style={{ padding: '2rem', justifyContent: 'center', alignItems: 'center' }}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Katmut & Betmut</h1>
            <p style={{ opacity: 0.4, marginBottom: '2rem' }}>Pilih Akunmu</p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              {['katmut', 'betmut'].map(c => (
                <div key={c} onClick={() => setSelectedChar(c)} style={{ flex: 1, padding: '1.5rem', borderRadius: '25px', cursor: 'pointer', border: `3px solid ${selectedChar === c ? (c === 'katmut' ? '#26de81' : '#fed330') : '#f1f5f9'}` }}>
                  <p style={{ fontSize: '40px' }}>{c === 'katmut' ? '🐸' : '🐤'}</p>
                  <p style={{ fontWeight: '800' }}>{c === 'katmut' ? 'Katmut' : 'Betmut'}</p>
                </div>
              ))}
            </div>
            {selectedChar && (
              <div style={{ width: '100%' }}>
                <input type="password" placeholder="Password..." style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleLogin} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: selectedChar === 'katmut' ? '#26de81' : '#fed330', color: '#fff', border: 'none', fontWeight: '800' }}>Login</button>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <>
          <nav className="main-nav">
            {[
              { id: 'home', icon: Home },
              { id: 'chat', icon: MessageCircle },
              { id: 'history', icon: History },
              { id: 'photobooth', icon: Camera },
              { id: 'articles', icon: Newspaper },
              { id: 'gallery', icon: Image },
              { id: 'games', icon: Gamepad2 },
            ].map(t => (
              <div key={t.id} className={`nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <t.icon size={20} />
              </div>
            ))}
          </nav>
          <div className="screen">
            <header className="glass-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {user.id === 'katmut' ? '🐸' : '🐤'}
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: isConnected ? '#22c55e' : '#ef4444', border: '2px solid #fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }} title={isConnected ? 'Connected' : 'Disconnected'} />
                </div>
                <div><h3 style={{ fontSize: '16px', fontWeight: '800' }}>{user.name}</h3><p style={{ fontSize: '10px', opacity: 0.4 }}>{isConnected ? 'Online' : 'Connecting...'}</p></div>
              </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <button onClick={() => setIsCalling(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Phone size={20} color="#94a3b8" /></button>
               <button onClick={startVideoCall} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Video size={20} color="#94a3b8" /></button>
               <button onClick={() => setUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><LogOut size={20} color="#94a3b8" /></button>
            </div>
          </header>

          <AnimatePresence>
            {isCalling && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ position: 'absolute', inset: 0, background: 'var(--primary)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                 <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>{user.id === 'katmut' ? '🐤' : '🐸'}</div>
                 <h2 style={{ marginTop: '2rem' }}>Menelepon...</h2>
                 <button onClick={() => setIsCalling(false)} style={{ marginTop: '4rem', width: '70px', height: '70px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={32} /></button>
              </motion.div>
            )}
            {incomingCall && !isVideoCalling && (
              <motion.div initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#1e293b', zIndex: 1001, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{incomingCall.from === 'katmut' ? '🐸' : '🐤'}</div>
                    <div>
                       <p style={{ fontWeight: '800' }}>Panggilan Video</p>
                       <p style={{ fontSize: '12px', opacity: 0.7 }}>dari {incomingCall.from === 'katmut' ? 'Katmut' : 'Betmut'}</p>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setIncomingCall(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                    <button onClick={acceptCall} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={20} /></button>
                 </div>
              </motion.div>
            )}
            {isVideoCalling && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
                 <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                       {/* Mock background if video hasn't arrived */}
                       <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '100px', position: 'absolute', opacity: 0.2 }}>
                          {getTargetUser() === 'katmut' ? '🐸' : '🐤'}
                       </motion.div>
                       <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', zIndex: 1 }} />
                    </div>
                    <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.8)', padding: '5px 15px', borderRadius: '20px', zIndex: 2 }}>
                       <span style={{ fontWeight: '900', fontSize: '14px' }}>{getTargetUser() === 'katmut' ? 'Katmut' : 'Betmut'}</span>
                    </div>
                    
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '100px', height: '150px', borderRadius: '15px', overflow: 'hidden', border: '3px solid #fff', background: '#333', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10 }}>
                       <video ref={vcVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    </div>
                 </div>
                 <div style={{ padding: '30px 20px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', background: '#0f172a' }}>
                    <button onClick={toggleMic} style={{ width: '50px', height: '50px', borderRadius: '50%', background: micActive ? 'rgba(255,255,255,0.1)' : '#ef4444', border: 'none', color: '#fff', cursor: 'pointer' }}>{micActive ? <Mic size={24} /> : <MicOff size={24} />}</button>
                    <button onClick={toggleVideo} style={{ width: '50px', height: '50px', borderRadius: '50%', background: videoActive ? 'rgba(255,255,255,0.1)' : '#ef4444', border: 'none', color: '#fff', cursor: 'pointer' }}><Video size={24} /></button>
                    <button onClick={switchCamera} style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}><Camera size={24} /></button>
                    <button onClick={endCall} style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.5)' }}><Phone style={{ transform: 'rotate(135deg)' }} size={32} /></button>
                    <button onClick={toggleScreenShare} style={{ width: '50px', height: '50px', borderRadius: '50%', background: isScreenSharing ? '#3b82f6' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}><Monitor size={24} /></button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="scroll-area" ref={scrollRef}>
            {activeTab === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '20px' }}>
                {/* Greeting Card */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)', borderRadius: '24px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(38, 222, 129, 0.3)' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Selamat datang kembali,</p>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '10px' }}>{user.name}! {user.id === 'katmut' ? '🐸' : '🐤'}</h2>
                    <p style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '5px 12px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>Hari yang cerah untuk berpetualang ☀️</p>
                  </div>
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '100px', opacity: 0.2, transform: 'rotate(-15deg)', zIndex: 1 }}>
                    {user.id === 'katmut' ? '🐸' : '🐤'}
                  </div>
                </motion.div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'Pesan', value: messages.length, icon: MessageCircle, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Foto', value: galleryImages.length, icon: Image, color: '#ec4899', bg: '#fdf2f8' },
                    { label: 'Misi', value: `${tasks.filter(t => t.done).length}/${tasks.length}`, icon: Trophy, color: '#f59e0b', bg: '#fffbeb' },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }} style={{ background: stat.bg, padding: '15px 10px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${stat.color}30` }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${stat.color}20`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <stat.icon size={16} />
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: '900', color: stat.color, marginBottom: '2px' }}>{stat.value}</h4>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px', color: '#334155' }}>Akses Cepat ⚡</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {[
                      { label: 'Telepon', icon: Video, color: '#10b981', action: startVideoCall },
                      { label: 'Kamera', icon: Camera, color: '#8b5cf6', action: () => setActiveTab('photobooth') },
                      { label: 'Galeri', icon: Heart, color: '#f43f5e', action: () => setActiveTab('gallery') },
                      { label: 'Main', icon: Gamepad2, color: '#f59e0b', action: () => setActiveTab('games') },
                    ].map((btn, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={btn.action} style={{ background: '#fff', padding: '12px 5px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: btn.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 8px', boxShadow: `0 4px 10px ${btn.color}40` }}>
                          <btn.icon size={20} />
                        </div>
                        <p style={{ fontSize: '10px', fontWeight: '800', color: '#475569' }}>{btn.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mini Missions */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '16px', color: '#334155' }}>Misi Hari Ini 🎯</h3>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', background: 'rgba(38, 222, 129, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                      {Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)}%
                    </span>
                  </div>
                  <div className="progress-container" style={{ height: '6px', marginBottom: '15px' }}><div className="progress-bar" style={{ width: `${(tasks.filter(t => t.done).length / tasks.length) * 100}%` }} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: t.done ? '#f8fafc' : '#f1f5f9', borderRadius: '12px', cursor: 'pointer', border: '1px solid transparent', borderColor: t.done ? 'transparent' : '#e2e8f0' }} onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, done: !x.done} : x))}>
                         {t.done ? <CheckCircle2 size={18} color="var(--primary)" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />}
                         <span style={{ fontSize: '13px', fontWeight: '600', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : '#334155' }}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontWeight: '800', marginBottom: '10px' }}>Riwayat Panggilan 📞</h3>
                {callHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', opacity: 0.4, marginTop: '20px' }}>Belum ada riwayat.</p>
                ) : (
                  callHistory.map(h => (
                    <div key={h.id} style={{ background: '#fff', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)20', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Video size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '800', fontSize: '14px' }}>{h.with === 'katmut' ? 'Katmut' : 'Betmut'}</p>
                        <p style={{ fontSize: '11px', opacity: 0.5 }}>{h.date} • {h.time}</p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>{h.status}</span>
                    </div>
                  ))
                )}
                <button onClick={() => setCallHistory([])} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Hapus Riwayat</button>
              </div>
            )}

            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ alignSelf: m.sender === user.id ? 'flex-end' : 'flex-start', maxWidth: '80%', position: 'relative' }} className="msg-container">
                      {m.type === 'call-log' ? (
                        <div style={{ background: 'rgba(0,0,0,0.05)', padding: '5px 15px', borderRadius: '15px', fontSize: '11px', margin: '10px 0', textAlign: 'center', alignSelf: 'center', color: '#64748b' }}>
                           📹 {m.text}
                        </div>
                      ) : (
                        <>
                          <div className={`bubble ${m.sender === user.id ? 'me' : 'them'}`} style={{ marginBottom: '2px', cursor: 'pointer' }} onClick={() => m.sender === user.id && startEdit(m)}>
                            {m.type === 'text' && m.text}
                            {m.type === 'image' && <img src={m.url} style={{ maxWidth: '100%', borderRadius: '10px' }} />}
                            {m.edited && <span style={{ fontSize: '9px', opacity: 0.5, marginLeft: '5px', display: 'block', textAlign: 'right' }}>diedit</span>}
                          </div>
                          {m.sender === user.id && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '0 5px', marginBottom: '8px' }}>
                              <button onClick={() => startEdit(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#94a3b8' }}>Edit</button>
                              <button onClick={() => deleteMessage(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#ef4444' }}>Hapus</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <div>
                <h3 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Berita & Tips 📰</h3>
                {articles.map(art => (
                  <div key={art.id} className="journal-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '800' }}>{art.category}</span>
                      <span style={{ fontSize: '10px', opacity: 0.4 }}>{art.date}</span>
                    </div>
                    <h4 style={{ fontWeight: '800', marginBottom: '5px' }}>{art.title}</h4>
                    <p style={{ fontSize: '12px', opacity: 0.6 }}>{art.excerpt}</p>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', marginTop: '10px', cursor: 'pointer' }}>BACA SELENGKAPNYA →</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {galleryImages.map(img => (
                  <div key={img.id} className="glass-card" style={{ padding: '10px', borderRadius: '24px' }}>
                    <img src={img.url} onError={(e) => { e.target.src = `https://picsum.photos/seed/${img.id+100}/600/400`; }} style={{ width: '100%', borderRadius: '20px' }} />
                    <div style={{ padding: '10px' }}><p style={{ fontWeight: '800', fontSize: '14px' }}>{img.title}</p><p style={{ fontSize: '12px', color: '#ff7675' }}>❤️ {img.likes} likes</p></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'games' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: '800' }}>Tic-Tac-Toe Imut</h3>
                <p style={{ opacity: 0.4, fontSize: '12px' }}>{winner ? `Pemenang: ${winner}` : `Giliran: ${isXNext ? '🐸' : '🐤'}`}</p>
                <div className="game-grid">{board.map((v, i) => <div key={i} className="game-cell" onClick={() => handleGameClick(i)}>{v}</div>)}</div>
                <button onClick={() => {
                  const emptyBoard = Array(9).fill(null);
                  setBoard(emptyBoard);
                  setIsXNext(true);
                  if (socket) socket.emit('game-reset', { to: getTargetUser() });
                }} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '800' }}>Mulai Lagi</button>
              </div>
            )}

            {activeTab === 'photobooth' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
                <h3 style={{ fontWeight: '800', textAlign: 'center' }}>Photostrip 📸</h3>
                {cameraError ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', background: '#ffeaa7', borderRadius: '20px', width: '100%', color: '#d35400' }}>
                    <p style={{ marginBottom: '0.5rem', fontWeight: '800', fontSize: '18px' }}>Kamera Diblokir 🚫</p>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '15px' }}>
                      Cara membukanya:<br/>
                      1. Klik ikon <b>Gembok ( 🔒 )</b> atau ikon <b>Settings ( ⚙️ )</b> di kolom URL paling atas browser.<br/>
                      2. Cari menu <b>Kamera / Camera</b>.<br/>
                      3. Ubah jadi <b>Izinkan / Allow</b>.<br/>
                      4. Refresh / Muat ulang halaman ini.
                    </p>
                    <p style={{ fontSize: '12px', marginBottom: '1rem', fontWeight: 'bold' }}>Atau unggah foto manual di bawah ini:</p>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const src = ev.target.result;
                          setPbPhotos([src, src, src, src]);
                          setPbState('customize');
                          setCameraError(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} style={{ fontSize: '12px', width: '100%' }} />
                  </div>
                ) : pbState === 'idle' ? (
                  <>
                    <div style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', background: '#000', position: 'relative', aspectRatio: '3/4' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
                      <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} style={{ position: 'absolute', top: '15px', right: '15px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={20} />
                      </button>
                    </div>
                    <button onClick={startPhotobooth} style={{ width: '100%', padding: '1rem', borderRadius: '15px', background: 'var(--primary)', border: 'none', fontWeight: '800', color: '#fff', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>📷 Mulai Photobooth!</button>
                  </>
                ) : pbState === 'countdown' ? (
                  <div style={{ display: 'flex', gap: '10px', height: '400px' }}>
                    <div style={{ flex: 3, borderRadius: '15px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pbCount === '📸' ? '#fff' : 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '80px', fontWeight: '800', transition: 'background 0.2s' }}>
                        {pbCount}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {pbPhotos[i] ? (
                            <img src={pbPhotos[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ opacity: 0.4, fontWeight: 'bold' }}>{i + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : pbState === 'customize' ? (
                  <div style={{ display: 'flex', gap: '15px', flex: 1, width: '100%' }}>
                    <div style={{ flex: 1, background: pbThemesList.find(t => t.id === pbTheme)?.bg || '#fff', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: `2px solid ${pbThemesList.find(t => t.id === pbTheme)?.border || '#ccc'}`, position: 'relative' }}>
                      {pbPhotos.map((src, i) => (
                        <img key={i} src={src} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '4px', border: `2px solid ${pbThemesList.find(t => t.id === pbTheme)?.border || '#ccc'}` }} />
                      ))}
                      <div style={{ textAlign: 'center', marginTop: 'auto', paddingBottom: '5px' }}>
                        <p style={{ fontWeight: '800', fontSize: '10px', color: pbTheme === 'dark' ? '#fff' : '#333' }}>photobooth</p>
                        <p style={{ fontSize: '8px', color: pbTheme === 'dark' ? '#ccc' : '#666' }}>{new Date().getFullYear()} {pbThemesList.find(t => t.id === pbTheme)?.icon}</p>
                      </div>
                      <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '24px' }}>{pbSticker}</div>
                      <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '24px' }}>{pbThemesList.find(t => t.id === pbTheme)?.icon}</div>
                    </div>
                    <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '5px' }}>
                       <h4 style={{ fontWeight: '800', fontSize: '14px', textAlign: 'center' }}>Customize</h4>
                       <div>
                         <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Frame Color</p>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                           {pbThemesList.map(t => (
                             <div key={t.id} onClick={() => setPbTheme(t.id)} style={{ padding: '8px', background: t.bg, border: `2px solid ${pbTheme === t.id ? t.border : 'transparent'}`, borderRadius: '10px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                               <span>{t.icon}</span>
                               <span style={{ fontSize: '8px', fontWeight: 'bold', color: t.id === 'dark' ? '#fff' : '#333', marginTop: '4px' }}>{t.name}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                       <div>
                         <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Stickers</p>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
                           {pbStickersList.map(s => (
                             <div key={s} onClick={() => setPbSticker(s)} style={{ fontSize: '20px', cursor: 'pointer', padding: '5px', background: pbSticker === s ? '#e2e8f0' : 'transparent', borderRadius: '8px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               {s}
                             </div>
                           ))}
                         </div>
                       </div>
                       <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
                         <button onClick={() => setPbState('idle')} style={{ padding: '10px', borderRadius: '10px', background: '#f1f5f9', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Retake</button>
                         <button onClick={() => savePhotostrip('download')} style={{ padding: '10px', borderRadius: '10px', background: '#ff4757', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Download</button>
                         <button onClick={() => savePhotostrip('send')} style={{ padding: '10px', borderRadius: '10px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Kirim ke {user?.id === 'katmut' ? 'Betmut' : 'Katmut'}</button>
                       </div>
                    </div>
                  </div>
                ) : null}
                <canvas ref={canvasRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
                <canvas ref={pbStripRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
              </div>
            )}
          </div>

          {activeTab === 'chat' && (
            <div className="input-container" style={{ position: 'relative' }}>
              {editingMessage && (
                <div style={{ position: 'absolute', top: '-35px', left: '0', right: '0', background: '#f1f5f9', padding: '8px 15px', fontSize: '11px', borderRadius: '15px 15px 0 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                  <span>✏️ Mengedit pesan...</span>
                  <button onClick={() => { setEditingMessage(null); setInputText(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}
              <button onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Paperclip size={20} color="#94a3b8" /></button>
              <input 
                type="text" 
                placeholder="Ketik sesuatu..." 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputText.trim()) {
                    sendMessage({ id: Date.now(), type: 'text', text: inputText, sender: user.id });
                    setInputText('');
                  }
                }} 
              />
              <button onClick={() => {
                if (inputText.trim()) {
                  sendMessage({ id: Date.now(), type: 'text', text: inputText, sender: user.id });
                  setInputText('');
                }
              }} className="send-btn"><Send size={18} /></button>
              <input type="file" ref={fileInputRef} hidden onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => sendMessage({ id: Date.now(), type: 'image', url: ev.target.result, sender: user.id });
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          )}

        </div>
        </>
      )}
    </div>
  )
}

export default App
