import { useState, useEffect } from 'react'

export default function Topbar({ cartCount, onCartOpen, user, onLogout }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      let h = n.getHours(), m = n.getMinutes(), s = n.getSeconds(), ap = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ap}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-item"><span className="topbar-dot" />MISSISSAUGA, CA</div>
        <div className="topbar-item">{time}</div>
        <div className="topbar-item">43.5890° N, 79.6441°</div>
      </div>
      <div className="topbar-right">
        <button className="topbar-nav on">STORE</button>
        <button className="topbar-nav" onClick={onCartOpen}>CART</button>
        {user && (
          <button className="topbar-nav" onClick={onLogout}>
            {user.name || user.email} — LOGOUT
          </button>
        )}
      </div>
    </div>
  )
}