import React from 'react'

const Games = ({ board, handleGameClick, setBoard, isXNext, winner }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ fontWeight: '800' }}>Tic-Tac-Toe Imut</h3>
      <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '20px' }}>{winner ? `Pemenang: ${winner}` : `Giliran: ${isXNext ? '🐸' : '🐤'}`}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        {board.map((v, i) => (
          <div 
            key={i} 
            onClick={() => handleGameClick(i)} 
            style={{ 
              height: '80px', background: '#fff', borderRadius: '20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '30px', border: '1px solid #f1f5f9', cursor: 'pointer', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.03)' 
            }}
          >
            {v}
          </div>
        ))}
      </div>
      <button 
        onClick={() => setBoard(Array(9).fill(null))} 
        style={{ 
          marginTop: '20px', padding: '10px 25px', borderRadius: '15px', 
          background: 'var(--primary)', color: '#fff', border: 'none', 
          fontWeight: '800', cursor: 'pointer' 
        }}
      >
        Reset Game
      </button>
    </div>
  )
}

export default Games
