import { useState, useRef, useEffect } from 'react'

const BACKEND = 'http://localhost:3001'

export default function Interview({ product, onClose, onVerdict }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: product.opening }])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [verdict, setVerdict] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(true)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const logRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    playVoice(product.opening)
  }, [])

  async function playVoice(text) {
    try {
      const res = await fetch(`${BACKEND}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, productName: product.name })
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
      } else {
        browserVoice(text)
      }
    } catch(e) {
      browserVoice(text)
    }
  }

  function browserVoice(text) {
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1
    synth.speak(utterance)
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Use Chrome for mic support.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
      if (e.results[e.results.length-1].isFinal) {
        setListening(false)
        setTranscript('')
        send(t)
      }
    }
    recognition.onerror = () => { setListening(false); setTranscript('') }
    recognition.onend = () => { setListening(false) }
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  function stopListening() {
    if (recognitionRef.current) recognitionRef.current.stop()
    setListening(false)
    setTranscript('')
  }

  async function send(val) {
    if (!val?.trim() || loading || done) return
    const newMessages = [...messages, { role: 'user', text: val.trim() }]
    setMessages(newMessages)
    setLoading(true)

    const apiMessages = []
    for (let i = 0; i < newMessages.length; i++) {
      const role = newMessages[i].role === 'assistant' ? 'assistant' : 'user'
      const content = newMessages[i].text
      if (apiMessages.length === 0 && role === 'assistant') continue
      if (apiMessages.length > 0 && apiMessages[apiMessages.length-1].role === role) continue
      apiMessages.push({ role, content })
    }

    try {
      const res = await fetch(`${BACKEND}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: product.sys,
          messages: apiMessages
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || '...'
      const clean = reply
        .replace(/VERDICT:(PASS|FAIL)/g, '')
        .replace(/\*[^*]*\*/g, '')
        .trim()
      setLoading(false)
      if (clean) {
        setMessages(prev => [...prev, { role: 'assistant', text: clean }])
        playVoice(clean)
      }
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
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection failed.' }])
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
            border:'none'
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
                fontWeight:'200',
                lineHeight:'1.8',
                color: m.role === 'assistant' ? '#777' : '#bbb',
                borderLeft: m.role === 'assistant' ? '1px solid #1e1e1e' : 'none',
                borderRight: m.role === 'user' ? '1px solid #2a2a2a' : 'none',
                paddingLeft: m.role === 'assistant' ? '16px' : '0',
                paddingRight: m.role === 'user' ? '16px' : '0',
                maxWidth:'88%',
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

          {/* Live transcript */}
          {transcript && (
            <div style={{
              textAlign:'right',
              fontFamily:'DM Mono, monospace',
              fontSize:'12px',
              color:'#444',
              fontStyle:'italic',
              paddingRight:'16px',
              borderRight:'1px solid #1a1a1a'
            }}>{transcript}</div>
          )}
        </div>

        {loading && (
          <div style={{display:'flex',gap:'4px',alignItems:'center',marginBottom:'16px'}}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:'6px',height:'6px',
                background:'#333',
                borderRadius:'50%',
                animation:'dotbounce 1s infinite',
                animationDelay:`${i*0.2}s`
              }}/>
            ))}
          </div>
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

        {/* BIG MIC BUTTON ONLY */}
        {!done && (
          <div style={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            gap:'12px',
            paddingTop:'20px',
            borderTop:'1px solid #141414'
          }}>
            <button
              onClick={listening ? stopListening : startListening}
              disabled={loading}
              style={{
                width:'80px',
                height:'80px',
                borderRadius:'50%',
                border:`2px solid ${listening ? '#c8b87a' : '#222'}`,
                background: listening ? 'rgba(200,184,122,0.1)' : 'rgba(255,255,255,0.02)',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                transition:'all 0.3s',
                boxShadow: listening ? '0 0 30px rgba(200,184,122,0.3), 0 0 60px rgba(200,184,122,0.1)' : 'none',
                animation: listening ? 'pulse-mic 1.5s infinite' : 'none',
                opacity: loading ? 0.3 : 1
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={listening ? '#c8b87a' : '#555'} strokeWidth="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <div style={{
              fontFamily:'DM Mono, monospace',
              fontSize:'8px',
              letterSpacing:'0.3em',
              color: listening ? '#c8b87a' : '#1a1a1a',
              textTransform:'uppercase',
              transition:'color 0.3s'
            }}>
              {loading ? 'thinking...' : listening ? 'listening...' : 'tap to speak'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}