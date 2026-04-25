import { useState, useRef, useEffect } from 'react'

export default function Interview({ product, onClose, onVerdict }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: product.opening }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [verdict, setVerdict] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(true)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages])

  async function send() {
    if (!input.trim() || loading || done) return
    const val = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user', text: val }]
    setMessages(newMessages)
    setLoading(true)

    const apiMessages = newMessages.map((m, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: m.text
    }))

    try {
      const res = await fetch('http://localhost:3001/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: product.sys,
          messages: apiMessages
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || '...'
      const clean = reply.replace(/VERDICT:(PASS|FAIL)/g, '').trim()
      setLoading(false)
      if (clean) setMessages(prev => [...prev, { role: 'assistant', text: clean }])

      if (reply.includes('VERDICT:PASS')) {
        setVerdict('pass')
        setDone(true)
        setTimeout(() => onVerdict('pass', product.id), 2500)
      } else if (reply.includes('VERDICT:FAIL')) {
        setVerdict('fail')
        setDone(true)
        setTimeout(() => onVerdict('fail', product.id), 2500)
      }
    } catch(e) {
      setLoading(false)
      setMessages(prev => [...prev, { role: 'assistant', text: 'Backend not connected yet. Your friend needs to run the server.' }])
    }
  }

  return (
    <div style={{
      position:'fixed',inset:0,background:'#0a0a0a',zIndex:500,
      display:'grid',gridTemplateColumns:'1fr 1fr'
    }}>
      {/* LEFT */}
      <div style={{
        borderRight:'1px solid #1e1e1e',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        position:'relative',
        overflow:'hidden',
        background:'#080808',
        padding:'40px'
      }}>
        <div style={{
          position:'absolute',
          fontFamily:'Anton, sans-serif',
          fontSize:'220px',
          color:'transparent',
          WebkitTextStroke:'1px #111',
          top:'50%',
          transform:'translateY(-50%)',
          left:'-10px',
          whiteSpace:'nowrap',
          letterSpacing:'-0.04em',
          pointerEvents:'none',
          userSelect:'none'
        }}>{product.bg}</div>

        {imgLoaded && (
          <img
            src={product.img}
            alt={product.name}
            onError={() => setImgLoaded(false)}
            style={{
              position:'relative',
              zIndex:2,
              width:'85%',
              height:'70%',
              objectFit:'contain',
              filter:'drop-shadow(0 0 60px rgba(232,228,220,0.15))',
              animation:'float 4s ease-in-out infinite'
            }}
          />
        )}

        <div style={{
          position:'absolute',
          bottom:0,left:0,right:0,
          padding:'32px 40px',
          background:'linear-gradient(transparent, rgba(8,8,8,0.98))',
          zIndex:3
        }}>
          <div style={{
            fontFamily:'Anton, sans-serif',
            fontSize:'42px',
            lineHeight:'0.88',
            color:'#e8e4dc',
            textTransform:'uppercase',
            letterSpacing:'-0.01em'
          }}>{product.name}</div>
          <div style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'9px',
            letterSpacing:'0.2em',
            color:'#333',
            textTransform:'uppercase',
            marginTop:'8px'
          }}>{product.cat.toUpperCase()} — ${product.price}</div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        display:'flex',
        flexDirection:'column',
        padding:'48px',
        background:'#0a0a0a',
        height:'100vh'
      }}>
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          marginBottom:'32px',
          paddingBottom:'16px',
          borderBottom:'1px solid #141414'
        }}>
          <div style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'8px',
            letterSpacing:'0.4em',
            color:'#1a1a1a',
            textTransform:'uppercase'
          }}>Interview in progress</div>
          <button onClick={onClose} style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'9px',
            letterSpacing:'0.15em',
            color:'#333',
            cursor:'pointer',
            textTransform:'uppercase',
            background:'none',
            border:'none',
            transition:'color 0.2s'
          }}>✕ CLOSE</button>
        </div>

        <div ref={logRef} style={{
          flex:1,
          overflowY:'auto',
          display:'flex',
          flexDirection:'column',
          gap:'28px',
          marginBottom:'24px',
          paddingRight:'4px'
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display:'flex',
              flexDirection:'column',
              alignItems: m.role === 'assistant' ? 'flex-start' : 'flex-end'
            }}>
              <div style={{
                fontFamily: m.role === 'assistant' ? 'DM Sans, sans-serif' : 'DM Mono, monospace',
                fontSize: m.role === 'assistant' ? '15px' : '12px',
                fontStyle: m.role === 'assistant' ? 'italic' : 'normal',
                fontWeight: '200',
                lineHeight:'1.8',
                color: m.role === 'assistant' ? '#777' : '#bbb',
                borderLeft: m.role === 'assistant' ? '1px solid #1e1e1e' : 'none',
                borderRight: m.role === 'user' ? '1px solid #2a2a2a' : 'none',
                paddingLeft: m.role === 'assistant' ? '16px' : '0',
                paddingRight: m.role === 'user' ? '16px' : '0',
                maxWidth:'88%',
                letterSpacing: m.role === 'user' ? '0.04em' : '0'
              }}>{m.text}</div>
              <div style={{
                fontFamily:'DM Mono, monospace',
                fontSize:'7px',
                letterSpacing:'0.2em',
                color:'#1a1a1a',
                marginTop:'6px',
                textTransform:'uppercase'
              }}>{m.role === 'assistant' ? product.name.toUpperCase() : 'YOU'}</div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'8px',
            letterSpacing:'0.3em',
            color:'#222',
            textTransform:'uppercase',
            marginBottom:'16px',
            animation:'pulse 1.5s infinite'
          }}>thinking...</div>
        )}

        {verdict === 'pass' && (
          <div style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'9px',
            letterSpacing:'0.3em',
            textTransform:'uppercase',
            color:'#c8b87a',
            textAlign:'center',
            border:'1px solid rgba(200,184,122,0.2)',
            padding:'18px',
            marginBottom:'16px'
          }}>Approved — added to your cart</div>
        )}

        {verdict === 'fail' && (
          <div style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'9px',
            letterSpacing:'0.3em',
            textTransform:'uppercase',
            color:'#4a1a1a',
            textAlign:'center',
            border:'1px solid #2a0e0e',
            padding:'18px',
            marginBottom:'16px'
          }}>Denied — you did not qualify</div>
        )}

        {!done && (
          <div style={{
            display:'flex',
            borderTop:'1px solid #141414',
            paddingTop:'20px',
            gap:'0'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="say something..."
              autoFocus
              style={{
                flex:1,
                background:'transparent',
                border:'none',
                borderBottom:'1px solid #141414',
                color:'#e8e4dc',
                fontSize:'13px',
                padding:'14px 0',
                fontFamily:'DM Sans, sans-serif',
                fontWeight:'200',
                outline:'none',
                letterSpacing:'0.05em'
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                padding:'14px 28px',
                background:'#e8e4dc',
                color:'#0a0a0a',
                border:'none',
                fontSize:'8px',
                letterSpacing:'0.3em',
                textTransform:'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily:'DM Mono, monospace',
                opacity: loading ? 0.2 : 1,
                transition:'opacity 0.2s'
              }}
            >SEND</button>
          </div>
        )}
      </div>
    </div>
  )
}