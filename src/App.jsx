import { useState, useEffect, useRef } from 'react'
import { ALL_PRODUCTS } from './data/products'
import Topbar from './components/Topbar'
import LeftCol from './components/LeftCol'
import CenterCol from './components/CenterCol'
import RightCol from './components/RightCol'
import Interview from './components/Interview'
import Cart from './components/Cart'

export default function App() {
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
      if (cursorRef.current) { cursorRef.current.style.left = e.clientX + 'px'; cursorRef.current.style.top = e.clientY + 'px' }
      if (ringRef.current) { ringRef.current.style.left = e.clientX + 'px'; ringRef.current.style.top = e.clientY + 'px' }
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
      setCart(prev => prev.find(c => c.id === productId) ? prev : [...prev, products.find(p => p.id === productId)])
    } else {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'denied' } : p))
    }
    setActive(null)
  }

  return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
      <Topbar cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />
      <div className="layout">
        <LeftCol cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />
        <CenterCol products={filtered} onCardClick={openInterview} activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
        <RightCol filtered={filtered} activeIdx={activeIdx} cat={cat} setCat={setCat} />
      </div>
      {active && <Interview product={active} onClose={() => setActive(null)} onVerdict={handleVerdict} />}
      {cartOpen && <Cart cart={cart} onClose={() => setCartOpen(false)} />}
    </>
  )
}