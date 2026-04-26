import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { ALL_PRODUCTS } from './data/products'
import Topbar from './components/Topbar'
import LeftCol from './components/LeftCol'
import CenterCol from './components/CenterCol'
import RightCol from './components/RightCol'
import Interview from './components/Interview'
import Cart from './components/Cart'

function DeniedScreen({ product, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:600,
      background:'#0a0000',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:'24px',
      animation:'denied-in 0.3s ease forwards'
    }}>
      <div style={{
        fontFamily:'Anton, sans-serif',
        fontSize:'clamp(80px,14vw,160px)',
        color:'#1a0000',
        letterSpacing:'-0.02em',
        lineHeight:'0.88',
        textAlign:'center',
        WebkitTextStroke:'1px #3a0000',
        position:'absolute',
        userSelect:'none'
      }}>DENIED.</div>

      <div style={{
        fontFamily:'Anton, sans-serif',
        fontSize:'clamp(60px,10vw,120px)',
        color:'#cc2200',
        letterSpacing:'-0.02em',
        lineHeight:'0.88',
        textAlign:'center',
        position:'relative',
        zIndex:2,
        textShadow:'0 0 60px rgba(200,30,0,0.4)'
      }}>NOT FOR<br/>YOU.</div>

      <div style={{
        fontFamily:'DM Mono, monospace',
        fontSize:'11px',
        letterSpacing:'0.35em',
        color:'#441010',
        textTransform:'uppercase',
        position:'relative', zIndex:2
      }}>Better luck next drop.</div>

      <div style={{
        fontFamily:'DM Mono, monospace',
        fontSize:'8px',
        letterSpacing:'0.2em',
        color:'#2a0808',
        textTransform:'uppercase',
        position:'relative', zIndex:2,
        marginTop:'8px'
      }}>{product?.name || ''} has spoken.</div>
    </div>
  )
}

function ApprovedScreen({ onDismiss }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 3 + Math.random() * 5,
    color: Math.random() > 0.5 ? '#c8b87a' : '#e8e4dc'
  }))

  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:600,
      background:'#0a0a0a',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:'24px',
      animation:'approved-in 0.3s ease forwards'
    }}>
      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute',
          left:`${p.left}%`,
          top:'-10px',
          width:`${p.size}px`,
          height:`${p.size}px`,
          background: p.color,
          borderRadius:'50%',
          animation:`fall ${p.duration}s ease-in ${p.delay}s forwards`,
          opacity:0
        }}/>
      ))}

      <div style={{
        fontFamily:'Anton, sans-serif',
        fontSize:'clamp(80px,14vw,160px)',
        color:'#0a0a0a',
        letterSpacing:'-0.02em',
        lineHeight:'0.88',
        textAlign:'center',
        WebkitTextStroke:'1px #1a1a10',
        position:'absolute',
        userSelect:'none'
      }}>EARNED.</div>

      <div style={{
        fontFamily:'Anton, sans-serif',
        fontSize:'clamp(60px,10vw,120px)',
        color:'#c8b87a',
        letterSpacing:'-0.02em',
        lineHeight:'0.88',
        textAlign:'center',
        position:'relative', zIndex:2,
        textShadow:'0 0 60px rgba(200,184,122,0.4)'
      }}>YOU<br/>EARNED IT.</div>

      <div style={{
        fontFamily:'DM Mono, monospace',
        fontSize:'11px',
        letterSpacing:'0.35em',
        color:'#554a20',
        textTransform:'uppercase',
        position:'relative', zIndex:2
      }}>Added to your cart.</div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, loginWithRedirect, isLoading, user, logout } = useAuth0()
  const [products, setProducts] = useState(ALL_PRODUCTS.map(p => ({ ...p, status: 'available' })))
  const [cart, setCart] = useState([])
  const [active, setActive] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cat, setCat] = useState('all')
  const [activeIdx, setActiveIdx] = useState(0)
  const [deniedProduct, setDeniedProduct] = useState(null)
  const [showApproved, setShowApproved] = useState(false)
  const cursorRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const move = e => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
      if (ringRef.current) {
        ringRef.current.style.left = e.clientX + 'px'
        ringRef.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const filtered = cat === 'all' ? products : products.filter(p => p.cat === cat)

  function openInterview(id) {
    const p = products.find(x => x.id === id)
    if (!p || p.status === 'denied') return
    if (p.status === 'earned') { setCartOpen(true); return }
    setActive(p)
  }

  function handleVerdict(verdict, productId) {
    const product = products.find(p => p.id === productId)
    if (verdict === 'pass') {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'earned' } : p))
      setCart(prev => prev.find(c => c.id === productId) ? prev : [...prev, product])
      setActive(null)
      setShowApproved(true)
    } else {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'denied' } : p))
      setActive(null)
      setDeniedProduct(product)
    }
  }

  if (isLoading) return (
    <div style={{
      position:'fixed', inset:0, background:'#0a0a0a',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'DM Mono, monospace', fontSize:'9px',
      letterSpacing:'0.3em', color:'#333', textTransform:'uppercase'
    }}>Loading...</div>
  )

  if (!isAuthenticated) return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
      <div style={{
        position:'fixed', inset:0, background:'#0a0a0a',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:'24px'
      }}>
        <div style={{
          fontFamily:'Anton, sans-serif',
          fontSize:'clamp(80px,15vw,160px)',
          color:'#e8e4dc',
          letterSpacing:'-0.02em',
          lineHeight:'0.88',
          textAlign:'center'
        }}>EARN<br/>IT</div>
        <div style={{
          fontFamily:'DM Mono, monospace',
          fontSize:'11px',
          letterSpacing:'0.25em',
          color:'#888',
          textTransform:'uppercase'
        }}>Don't shop. Qualify.</div>
        <div style={{
          fontFamily:'DM Mono, monospace',
          fontSize:'9px',
          letterSpacing:'0.2em',
          color:'#444',
          textTransform:'uppercase'
        }}>BearHacks 2026 — Break the Norm</div>
        <button
          onClick={() => loginWithRedirect()}
          style={{
            fontFamily:'DM Mono, monospace',
            fontSize:'10px',
            letterSpacing:'0.35em',
            textTransform:'uppercase',
            color:'#e8e4dc',
            background:'none',
            border:'1px solid rgba(232,228,220,0.25)',
            padding:'18px 56px',
            cursor:'none',
            marginTop:'16px',
            transition:'border-color 0.3s'
          }}
        >Enter the Store</button>
      </div>
    </>
  )

  return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
      <Topbar
        cartCount={cart.length}
        onCartOpen={() => setCartOpen(true)}
        user={user}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />
      <div className="layout">
        <LeftCol cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />
        <CenterCol
          products={filtered}
          onCardClick={openInterview}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
        />
        <RightCol
          filtered={filtered}
          activeIdx={activeIdx}
          cat={cat}
          setCat={setCat}
        />
      </div>
      {active && (
        <Interview
          product={active}
          onClose={() => setActive(null)}
          onVerdict={handleVerdict}
        />
      )}
      {cartOpen && (
        <Cart cart={cart} onClose={() => setCartOpen(false)} />
      )}
      {deniedProduct && (
        <DeniedScreen
          product={deniedProduct}
          onDismiss={() => setDeniedProduct(null)}
        />
      )}
      {showApproved && (
        <ApprovedScreen
          onDismiss={() => { setShowApproved(false); setCartOpen(true) }}
        />
      )}
    </>
  )
}