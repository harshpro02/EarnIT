export default function Cart({ cart, onClose }) {
    const total = cart.reduce((s, i) => s + i.price, 0)
    return (
      <div className="cart-page on">
        <button className="cart-close" onClick={onClose}>✕ CLOSE</button>
        <div className="cart-h">EARNED.</div>
        <div className="cart-sub">Only the approved make it here</div>
        {cart.length === 0 ? (
          <div className="cart-empty">Nothing earned yet. Go qualify.</div>
        ) : (
          <>
            <div className="cart-grid">
              {cart.map(p => (
                <div key={p.id} className="cart-item">
                  <div className="cart-item-name">{p.name}</div>
                  <div className="cart-item-price">${p.price}</div>
                  <div className="cart-item-tag">Earned</div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div>
                <div className="cart-tl">Total earned</div>
                <div className="cart-tn">${total.toLocaleString()}</div>
              </div>
              <button className="cart-co">Checkout</button>
            </div>
          </>
        )}
      </div>
    )
  }