import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { ALL_PRODUCTS } from './data/products'
import Topbar from './components/Topbar'
import LeftCol from './components/LeftCol'
import CenterCol from './components/CenterCol'
import RightCol from './components/RightCol'
import Interview from './components/Interview'
import Cart from './components/Cart'

export default function App() {
  const { isAuthenticated, loginWithRedirect, isLoading, user, logout } = useAuth0()
  const [products, setProducts] = useState(ALL_PRODUCTS.map(p => ({ ...p, status: 'available' })))
  const [cart, setCart] = useState([])
  const [active, setActive] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cat, setCat] = useState('all')
  const [activeIdx, setActiveIdx] = useState(0)
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
    if (verdict === 'pass') {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'earned' } : p))
      const product = products.find(p => p.id === productId)
      setCart(prev => prev.find(c => c.id === productId) ? prev : [...prev, product])
    } else {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'denied' } : p))
    }
    setActive(null)
  }

  // Loading
  if (isLoading) return (
    <div style={{
      position:'fixed', inset:0, background:'#0a0a0a',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'DM Mono, monospace', fontSize:'9px',
      letterSpacing:'0.3em', color:'#333', textTransform:'uppercase'
    }}>Loading...</div>
  )

  // Login screen
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
        }}>
          EARN<br/>IT
        </div>
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

  // Main app
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
    </>
  )
}