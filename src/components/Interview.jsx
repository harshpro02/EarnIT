import { useState, useRef, useEffect, useCallback } from 'react'

const BACKEND = 'http://localhost:3001'

export default function Interview({ product, onClose, onVerdict }) {
  const [messages,  setMessages]  = useState([{ role:'assistant', text:product.opening }])
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [verdict,   setVerdict]   = useState(null)
  const [speaking,  setSpeaking]  = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript,setTranscript]= useState('')
  const [imgLoaded, setImgLoaded] = useState(true)
  const [glowing,   setGlowing]   = useState(false)

  const logRef     = useRef(null)
  const audioRef   = useRef(null)
  const recRef     = useRef(null)
  const silRef     = useRef(null)
  const doneRef    = useRef(false)
  const loadRef    = useRef(false)
  const openRef    = useRef(false)
  const mountRef   = useRef(true)
  const exchRef    = useRef(0)
  const apiMsgsRef = useRef([])

  const ac = product.accentColor || '#e8e4dc'

  useEffect(() => {
    mountRef.current = true
    return () => {
      mountRef.current = false
      audioRef.current?.pause()
      try { recRef.current?.stop() } catch {}
      window.speechSynthesis?.cancel()
      clearTimeout(silRef.current)
    }
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, loading, transcript])

  const playVoice = useCallback(async (text, cb) => {
    const clean = text.replace(/VERDICT:(PASS|FAIL)/g, '').trim()
    if (!clean) { cb?.(); return }

    clearTimeout(silRef.current)
    try { recRef.current?.stop() } catch {}
    recRef.current = null
    if (mountRef.current) { setListening(false); setTranscript(''); setGlowing(false) }
    audioRef.current?.pause()
    window.speechSynthesis?.cancel()

    try {
      const res = await fetch(`${BACKEND}/api/speak`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: clean, productName: product.name })
      })
      if (!res.ok || res.status === 204) throw new Error('no-voice')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      if (mountRef.current) setSpeaking(true)
      audio.onended = () => {
        if (mountRef.current) setSpeaking(false)
        URL.revokeObjectURL(url)
        cb?.()
      }
      audio.onerror = () => { if (mountRef.current) setSpeaking(false); cb?.() }
      audio.play().catch(() => { if (mountRef.current) setSpeaking(false); cb?.() })
    } catch {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(clean)
        u.rate = 0.95; u.pitch = 1; u.volume = 1
        u.onstart = () => { if (mountRef.current) setSpeaking(true) }
        u.onend   = () => { if (mountRef.current) setSpeaking(false); cb?.() }
        u.onerror = () => { if (mountRef.current) setSpeaking(false); cb?.() }
        window.speechSynthesis.speak(u)
      } else cb?.()
    }
  }, [product.name])

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR || doneRef.current || loadRef.current || !mountRef.current) return
    if (recRef.current) return

    if (mountRef.current) { setListening(true); setTranscript(''); setGlowing(false) }

    const r = new SR()
    recRef.current = r
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'

    let finalText = ''

    r.onresult = e => {
      let interim = '', final = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      const combined = (final + interim).trim()
      if (combined && mountRef.current) { setGlowing(true); setTranscript(combined) }
      finalText = final.trim() || combined
      if (final.trim()) {
        clearTimeout(silRef.current)
        silRef.current = setTimeout(() => {
          silRef.current = null
          try { recRef.current?.stop() } catch {}
          recRef.current = null
          if (!mountRef.current || doneRef.current) return
          setListening(false); setGlowing(false); setTranscript('')
          if (finalText.trim()) send(finalText.trim())
        }, 1200)
      }
    }

    r.onspeechstart = () => { if (mountRef.current) setGlowing(true) }
    r.onspeechend   = () => { if (mountRef.current) setGlowing(false) }

    r.onerror = e => {
      recRef.current = null
      if (e.error === 'no-speech') {
        if (!mountRef.current || doneRef.current || loadRef.current) return
        setTimeout(() => startListening(), 300)
        return
      }
      if (mountRef.current) { setListening(false); setGlowing(false); setTranscript('') }
    }

    r.onend = () => {
      recRef.current = null
      if (!silRef.current && !doneRef.current && !loadRef.current && mountRef.current) {
        setTimeout(() => startListening(), 200)
      }
    }

    try { r.start() } catch { recRef.current = null }
  }, []) // eslint-disable-line

  const send = useCallback(async (text) => {
    if (!text?.trim() || loadRef.current || doneRef.current) return
    setTranscript('')

    const history = [...apiMsgsRef.current, { role:'user', content: text.trim() }]
    apiMsgsRef.current = history
    setMessages(p => [...p, { role:'user', text: text.trim() }])
    loadRef.current = true; setLoading(true)

    try {
      const res = await fetch(`${BACKEND}/api/interview`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 120,
          system: product.sys,
          messages: history,
          productName: product.name,
          exchangeNum: exchRef.current
        })
      })
      const data  = await res.json()
      const reply = data.content?.[0]?.text || '...'
      const pass  = reply.includes('VERDICT:PASS')
      const fail  = reply.includes('VERDICT:FAIL')
      const clean = reply.replace(/VERDICT:(PASS|FAIL)/g, '').replace(/\*[^*]*\*/g, '').trim()

      loadRef.current = false
      if (!mountRef.current) return
      setLoading(false)

      if (clean) {
        apiMsgsRef.current = [...apiMsgsRef.current, { role:'assistant', content: clean }]
        setMessages(p => [...p, { role:'assistant', text: clean }])
      }

      if (pass || fail) {
        const v = pass ? 'pass' : 'fail'
        doneRef.current = true; setVerdict(v); setDone(true)
        // Play the mockingly delivered verdict then kick out
        playVoice(clean, () => {
          setTimeout(() => onVerdict(v, product.id), 1500)
        })
      } else if (clean) {
        exchRef.current += 1
        playVoice(clean, () => {
          if (!mountRef.current || doneRef.current) return
          setSpeaking(false)
          setTimeout(() => startListening(), 400)
        })
      }
    } catch {
      loadRef.current = false
      if (!mountRef.current) return
      setLoading(false)
      const fb = "Something went wrong — try again."
      setMessages(p => [...p, { role:'assistant', text: fb }])
      playVoice(fb, () => { if (mountRef.current) setTimeout(() => startListening(), 400) })
    }
  }, [product, onVerdict, playVoice, startListening])

  // Speak INSTANTLY on click — zero delay
  useEffect(() => {
    if (openRef.current) return
    openRef.current = true
    playVoice(product.opening, () => {
      if (!mountRef.current || doneRef.current) return
      setSpeaking(false)
      setTimeout(() => startListening(), 400)
    })
  }, [product.id]) // eslint-disable-line

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      display:'grid', gridTemplateColumns:'40% 60%',
      background:'#0a0a0a',
      boxShadow: glowing ? `inset 0 0 120px ${ac}25` : 'none',
      transition:'box-shadow 0.3s'
    }}>
      {/* LEFT */}
      <div style={{
        borderRight:'1px solid #1e1e1e',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
        background: glowing ? `rgba(20,20,20,0.98)` : '#080808',
        padding:'40px', transition:'background 0.3s'
      }}>
        <div style={{
          position:'absolute', fontFamily:'Anton, sans-serif',
          fontSize:'220px', color:'transparent',
          WebkitTextStroke:'1px #111', top:'50%',
          transform:'translateY(-50%)', left:'-10px',
          whiteSpace:'nowrap', letterSpacing:'-0.04em',
          pointerEvents:'none', userSelect:'none'
        }}>{product.bg}</div>

        {imgLoaded && (
          <img
            src={product.img} alt={product.name}
            onError={() => setImgLoaded(false)}
            style={{
              position:'relative', zIndex:2,
              width:'85%', height:'65%', objectFit:'contain',
              filter: glowing
                ? `drop-shadow(0 0 80px ${ac}60)`
                : speaking
                ? `drop-shadow(0 0 50px ${ac}35)`
                : `drop-shadow(0 0 20px ${ac}15)`,
              animation:'float 4s ease-in-out infinite',
              transition:'filter 0.4s'
            }}
          />
        )}

        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          padding:'28px 40px',
          background:'linear-gradient(transparent, rgba(8,8,8,0.98))',
          zIndex:3
        }}>
          <div style={{
            display:'inline-block',
            fontFamily:'DM Mono, monospace', fontSize:'7px',
            letterSpacing:'0.2em', textTransform:'uppercase',
            color: ac, border:`1px solid ${ac}35`,
            padding:'3px 8px', marginBottom:'8px'
          }}>{product.accent} ACCENT</div>
          <div style={{
            fontFamily:'Anton, sans-serif', fontSize:'38px',
            lineHeight:'0.88', color:'#e8e4dc',
            textTransform:'uppercase', letterSpacing:'-0.01em'
          }}>{product.name}</div>
          <div style={{
            fontFamily:'DM Mono, monospace', fontSize:'8px',
            letterSpacing:'0.2em', color:'#333',
            textTransform:'uppercase', marginTop:'6px'
          }}>{product.cat.toUpperCase()} — ${product.price}</div>
        </div>

        <div style={{
          position:'absolute', top:'20px', left:'20px', zIndex:10,
          display:'flex', alignItems:'center', gap:'6px',
          fontFamily:'DM Mono, monospace', fontSize:'7px',
          letterSpacing:'0.2em', textTransform:'uppercase',
          color: verdict ? (verdict==='pass' ? ac : '#ff4444')
            : glowing ? ac : speaking ? '#88ccff' : '#282828',
          transition:'color 0.3s'
        }}>
          <div style={{
            width:'5px', height:'5px', borderRadius:'50%',
            background:'currentColor', flexShrink:0,
            animation: done ? 'none' : 'dotblink 1.5s infinite'
          }}/>
          {verdict ? (verdict==='pass' ? '✓ APPROVED' : '✗ DENIED')
            : loading ? 'THINKING...'
            : speaking ? 'SPEAKING...'
            : glowing ? 'HEARING YOU...'
            : listening ? 'LISTENING...'
            : 'READY'}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        display:'flex', flexDirection:'column',
        padding:'48px 56px', background:'#0a0a0a', height:'100vh'
      }}>
        <div style={{
          display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:'32px',
          paddingBottom:'16px', borderBottom:'1px solid #141414'
        }}>
          <div>
            <div style={{
              fontFamily:'DM Mono, monospace', fontSize:'8px',
              letterSpacing:'0.4em', color:'#1a1a1a', textTransform:'uppercase'
            }}>Interview in progress</div>
            <div style={{
              fontFamily:'DM Mono, monospace', fontSize:'7px',
              letterSpacing:'0.15em', color:`${ac}60`,
              textTransform:'uppercase', marginTop:'4px'
            }}>{product.tagline}</div>
          </div>
          <button onClick={onClose} style={{
            fontFamily:'DM Mono, monospace', fontSize:'9px',
            letterSpacing:'0.15em', color:'#333', cursor:'pointer',
            textTransform:'uppercase', background:'none', border:'none'
          }}>✕ CLOSE</button>
        </div>

        <div ref={logRef} style={{
          flex:1, overflowY:'auto', display:'flex',
          flexDirection:'column', gap:'24px',
          marginBottom:'20px', paddingRight:'4px'
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display:'flex', flexDirection:'column',
              alignItems: m.role === 'assistant' ? 'flex-start' : 'flex-end'
            }}>
              <div style={{
                fontFamily: m.role === 'assistant' ? 'DM Sans, sans-serif' : 'DM Mono, monospace',
                fontSize: m.role === 'assistant' ? '16px' : '12px',
                fontStyle: m.role === 'assistant' ? 'italic' : 'normal',
                fontWeight:'200', lineHeight:'1.9',
                color: m.role === 'assistant' ? '#888' : '#ccc',
                borderLeft: m.role === 'assistant' ? `2px solid ${ac}40` : 'none',
                borderRight: m.role === 'user' ? '2px solid #2a2a2a' : 'none',
                paddingLeft: m.role === 'assistant' ? '16px' : '0',
                paddingRight: m.role === 'user' ? '16px' : '0',
                maxWidth:'90%'
              }}>{m.text}</div>
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'7px',
                letterSpacing:'0.2em', color:'#1a1a1a',
                marginTop:'6px', textTransform:'uppercase'
              }}>{m.role === 'assistant' ? product.name.toUpperCase() : 'YOU'}</div>
            </div>
          ))}

          {transcript && (
            <div style={{
              textAlign:'right', fontFamily:'DM Mono, monospace',
              fontSize:'12px', color:`${ac}80`, fontStyle:'italic',
              paddingRight:'16px', borderRight:`2px solid ${ac}40`
            }}>{transcript}</div>
          )}

          {loading && (
            <div style={{ display:'flex', gap:'6px', alignItems:'center', paddingLeft:'16px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:'6px', height:'6px', background:'#2a2a2a',
                  borderRadius:'50%', animation:'dotbounce 1s infinite',
                  animationDelay:`${i*0.2}s`
                }}/>
              ))}
            </div>
          )}
        </div>

        {verdict === 'pass' && (
          <div style={{
            fontFamily:'DM Mono, monospace', fontSize:'9px',
            letterSpacing:'0.3em', textTransform:'uppercase',
            color: ac, textAlign:'center',
            border:`1px solid ${ac}40`, padding:'16px',
            marginBottom:'16px', background:`${ac}08`
          }}>✓ Approved — congratulations, you earned it</div>
        )}
        {verdict === 'fail' && (
          <div style={{
            fontFamily:'DM Mono, monospace', fontSize:'9px',
            letterSpacing:'0.3em', textTransform:'uppercase',
            color:'#4a1a1a', textAlign:'center',
            border:'1px solid #2a0e0e', padding:'16px', marginBottom:'16px'
          }}>✗ Denied — better luck next drop</div>
        )}

        {!done && (
          <div style={{
            paddingTop:'16px', borderTop:'1px solid #141414',
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'12px'
          }}>
            <div style={{
              width:'80px', height:'80px', borderRadius:'50%',
              border:`2px solid ${glowing ? ac : speaking ? '#88ccff' : listening ? ac+'55' : '#1a1a1a'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.3s',
              boxShadow: glowing
                ? `0 0 60px ${ac}50, 0 0 120px ${ac}20`
                : speaking ? `0 0 30px #88ccff30`
                : listening ? `0 0 20px ${ac}20` : 'none',
              animation: glowing ? 'pulse-mic 0.8s infinite' : listening ? 'pulse-mic 2s infinite' : 'none',
              background: glowing ? `${ac}10` : 'transparent'
            }}>
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'22px',
                color: glowing ? ac : speaking ? '#88ccff' : listening ? `${ac}80` : '#1a1a1a',
                transition:'color 0.3s'
              }}>
                {loading ? '💭' : speaking ? '🔊' : glowing ? '🎤' : listening ? '👂' : '○'}
              </div>
            </div>

            <div style={{
              fontFamily:'DM Mono, monospace', fontSize:'8px',
              letterSpacing:'0.3em', textTransform:'uppercase',
              color: glowing ? ac : speaking ? '#88ccff' : listening ? `${ac}60` : '#1a1a1a',
              transition:'color 0.3s'
            }}>
              {loading ? 'thinking...'
                : speaking ? 'speaking...'
                : glowing ? 'hearing you...'
                : listening ? 'say something...'
                : 'waiting...'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}