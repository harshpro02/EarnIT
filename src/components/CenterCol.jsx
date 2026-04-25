import { useRef, useEffect, useState } from 'react'
import Card from './Card'

export default function CenterCol({ products, onCardClick, activeIdx, setActiveIdx }) {
  const colRef = useRef(null)
  const wrapRef = useRef(null)
  const syRef = useRef(0)
  const tyRef = useRef(0)
  const mouseYRef = useRef(0.5)
  const rafRef = useRef(null)

  const cardH = Math.floor((window.innerHeight - 49) / 2.8)

  useEffect(() => {
    const onMove = e => {
      if (!colRef.current) return
      const r = colRef.current.getBoundingClientRect()
      mouseYRef.current = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const loop = () => {
      const maxSY = Math.max(0, products.length * cardH - (window.innerHeight - 49))
      tyRef.current += (mouseYRef.current - 0.5) * 10
      tyRef.current = Math.max(0, Math.min(maxSY, tyRef.current))
      syRef.current += (tyRef.current - syRef.current) * 0.07
      if (wrapRef.current) wrapRef.current.style.transform = `translateY(${-syRef.current}px)`
      const idx = Math.max(0, Math.min(products.length - 1, Math.round((syRef.current + (window.innerHeight - 49) / 2) / cardH)))
      if (idx !== activeIdx) setActiveIdx(idx)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [products, activeIdx])

  return (
    <div className="center" ref={colRef}>
      <div className="cards-wrap" ref={wrapRef}>
        {products.map((p, i) => (
          <Card key={p.id} product={p} isActive={i === activeIdx} onClick={onCardClick} height={cardH} />
        ))}
      </div>
    </div>
  )
}