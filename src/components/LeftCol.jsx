export default function LeftCol({ cartCount, onCartOpen }) {
    return (
      <div className="left">
        <div className="left-bg">E</div>
        <div className="left-word">
          DON'T<br />SHOP.<br />
          <span className="outline">QUALIFY.</span>
        </div>
        <div className="left-meta">
          <div className="left-meta-label">BearHacks 2026 — Break the Norm</div>
          <button className="left-cart" onClick={onCartOpen}>
            CART <span className="cart-pill">{cartCount}</span>
          </button>
        </div>
      </div>
    )
  }