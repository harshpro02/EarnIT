import { useRef } from 'react'

export default function Card({ product, isActive, onClick, height }) {
  const imgRef = useRef(null)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!imgRef.current || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    imgRef.current.style.transform = `
      perspective(600px)
      rotateY(${x * 25}deg)
      rotateX(${-y * 15}deg)
      scale(1.08)
    `
  }

  const handleMouseLeave = () => {
    if (!imgRef.current) return
    imgRef.current.style.transform = `
      perspective(600px)
      rotateY(0deg)
      rotateX(0deg)
      scale(1)
    `
  }

  return (
    <div
      ref={cardRef}
      className={`card${isActive ? ' active' : ''}`}
      style={{ height }}
      onClick={() => onClick(product.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-frame" />
      <div className="card-img-inner">
        <img
          ref={imgRef}
          src={product.img}
          alt={product.name}
          style={{
            width:'75%',
            height:'75%',
            objectFit:'contain',
            transition:'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
            transformStyle:'preserve-3d',
            willChange:'transform',
          }}
        />
      </div>
      <div className="card-label">
        <span className="card-label-name">{product.name}</span>
        <span className="card-label-price">${product.price}</span>
      </div>
      <div className={`card-badge badge-${product.status}`}>
        {product.status === 'available' ? 'LOCKED' : product.status === 'earned' ? 'EARNED' : 'DENIED'}
      </div>
    </div>
  )
}