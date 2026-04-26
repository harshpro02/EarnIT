import { useState } from 'react'

export default function Cart({ cart, onClose }) {
  const [sizes, setSizes] = useState({})
  const [payStatus, setPayStatus] = useState('idle')
  const total = cart.reduce((s, i) => s + i.price, 0)
  const solAmount = (total * 0.0052).toFixed(4)
  const allSizesSelected = cart.every(p => sizes[p.id])

  async function payWithSolana() {
    if (!allSizesSelected) {
      alert('Please select a size for all items first.')
      return
    }
    setPayStatus('connecting')
    await new Promise(r => setTimeout(r, 900))
    setPayStatus('confirm')
    await new Promise(r => setTimeout(r, 1200))
    setPayStatus('success')
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'#0a0a0a', zIndex:500,
      display:'flex', flexDirection:'column', overflow:'hidden'
    }}>
      {/* TOP BAR */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'24px 52px', borderBottom:'1px solid #141414', flexShrink:0
      }}>
        <div style={{
          fontFamily:'Anton, sans-serif', fontSize:'48px',
          color:'#e8e4dc', letterSpacing:'-0.02em', lineHeight:1
        }}>EARNED.</div>
        <button onClick={onClose} style={{
          fontFamily:'DM Mono, monospace', fontSize:'9px',
          letterSpacing:'0.15em', color:'#333', cursor:'pointer',
          textTransform:'uppercase', background:'none', border:'none'
        }}>✕ CLOSE</button>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'1fr 400px',
        flex:1, overflow:'hidden'
      }}>
        {/* LEFT — Items */}
        <div style={{
          overflowY:'auto', padding:'40px 52px',
          borderRight:'1px solid #141414'
        }}>
          <div style={{
            fontFamily:'DM Mono, monospace', fontSize:'8px',
            letterSpacing:'0.35em', color:'#1a1a1a',
            textTransform:'uppercase', marginBottom:'32px'
          }}>Only the approved make it here</div>

          {cart.length === 0 ? (
            <div style={{
              fontFamily:'DM Mono, monospace', fontSize:'14px',
              color:'#141414', letterSpacing:'0.1em',
              textTransform:'uppercase', marginTop:'100px', textAlign:'center'
            }}>Nothing earned yet. Go qualify.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'#141414' }}>
              {cart.map(p => (
                <div key={p.id} style={{ background:'#0a0a0a', padding:'28px 32px' }}>
                  <div style={{
                    display:'flex', alignItems:'center',
                    justifyContent:'space-between', marginBottom:'16px'
                  }}>
                    <div>
                      <div style={{
                        fontFamily:'Anton, sans-serif', fontSize:'22px',
                        color:'#e8e4dc', textTransform:'uppercase',
                        letterSpacing:'-0.01em', marginBottom:'4px'
                      }}>{p.name}</div>
                      <div style={{
                        fontFamily:'DM Mono, monospace', fontSize:'8px',
                        letterSpacing:'0.2em', color:'#c8b87a', textTransform:'uppercase'
                      }}>Earned</div>
                    </div>
                    <div style={{
                      fontFamily:'Anton, sans-serif', fontSize:'26px', color:'#e8e4dc'
                    }}>${p.price}</div>
                  </div>

                  {/* SIZE SELECTION */}
                  <div>
                    <div style={{
                      fontFamily:'DM Mono, monospace', fontSize:'7px',
                      letterSpacing:'0.3em', color:'#2a2a2a',
                      textTransform:'uppercase', marginBottom:'10px'
                    }}>Select Size</div>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      {(p.sizes || ['XS','S','M','L','XL','XXL']).map(size => (
                        <button
                          key={size}
                          onClick={() => setSizes(prev => ({ ...prev, [p.id]: size }))}
                          style={{
                            padding:'8px 14px',
                            fontFamily:'DM Mono, monospace', fontSize:'9px',
                            letterSpacing:'0.1em', textTransform:'uppercase',
                            cursor:'pointer',
                            background: sizes[p.id] === size ? '#e8e4dc' : 'none',
                            color: sizes[p.id] === size ? '#0a0a0a' : '#333',
                            border: sizes[p.id] === size ? '1px solid #e8e4dc' : '1px solid #222',
                            transition:'all 0.2s'
                          }}
                        >{size}</button>
                      ))}
                    </div>
                    {!sizes[p.id] && (
                      <div style={{
                        fontFamily:'DM Mono, monospace', fontSize:'7px',
                        letterSpacing:'0.15em', color:'#3a1a1a',
                        textTransform:'uppercase', marginTop:'8px'
                      }}>Please select a size</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Checkout */}
        <div style={{
          padding:'40px 36px', display:'flex',
          flexDirection:'column', justifyContent:'space-between',
          background:'#080808', overflowY:'auto'
        }}>
          <div>
            <div style={{
              fontFamily:'DM Mono, monospace', fontSize:'8px',
              letterSpacing:'0.35em', color:'#1a1a1a',
              textTransform:'uppercase', marginBottom:'28px',
              paddingBottom:'16px', borderBottom:'1px solid #141414'
            }}>Order Summary</div>

            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:'9px', letterSpacing:'0.1em', color:'#2a2a2a', textTransform:'uppercase' }}>Items</div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:'9px', color:'#333' }}>{cart.length}</div>
            </div>

            {cart.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:'8px', color:'#2a2a2a', textTransform:'uppercase' }}>
                  {p.name} {sizes[p.id] ? `(${sizes[p.id]})` : ''}
                </div>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:'8px', color:'#333' }}>${p.price}</div>
              </div>
            ))}

            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              marginTop:'24px', marginBottom:'32px',
              paddingTop:'16px', borderTop:'1px solid #141414'
            }}>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:'8px', letterSpacing:'0.2em', color:'#1a1a1a', textTransform:'uppercase' }}>Total</div>
              <div style={{ fontFamily:'Anton, sans-serif', fontSize:'48px', color:'#e8e4dc', letterSpacing:'-0.02em', lineHeight:1 }}>${total.toLocaleString()}</div>
            </div>

            {/* SOLANA BOX */}
            <div style={{
              border:'1px solid rgba(153,69,255,0.2)',
              padding:'20px', marginBottom:'12px',
              background:'rgba(153,69,255,0.03)'
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{
                  width:'28px', height:'28px',
                  background:'linear-gradient(135deg,#9945FF,#14F195)',
                  borderRadius:'50%', flexShrink:0
                }}/>
                <div>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:'9px', letterSpacing:'0.15em', color:'#e8e4dc', textTransform:'uppercase' }}>Pay with Solana</div>
                  <div style={{ fontFamily:'DM Mono, monospace', fontSize:'7px', color:'#2a2a2a', textTransform:'uppercase', marginTop:'2px' }}>Fast. Decentralized. Earned.</div>
                </div>
              </div>
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'20px',
                color:'#14F195', background:'#0a0a0a',
                padding:'12px 14px', border:'1px solid rgba(20,241,149,0.1)'
              }}>{solAmount} SOL</div>
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'7px',
                color:'#1a1a1a', textTransform:'uppercase', marginTop:'6px'
              }}>≈ ${total} USD at current rate</div>
            </div>

            {/* Status messages */}
            {payStatus === 'connecting' && (
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'9px',
                letterSpacing:'0.2em', color:'#9945FF',
                textTransform:'uppercase', textAlign:'center',
                border:'1px solid rgba(153,69,255,0.2)',
                padding:'14px', marginBottom:'12px',
                animation:'pulse 1s infinite'
              }}>Connecting to Phantom Wallet...</div>
            )}

            {payStatus === 'confirm' && (
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'9px',
                letterSpacing:'0.2em', color:'#14F195',
                textTransform:'uppercase', textAlign:'center',
                border:'1px solid rgba(20,241,149,0.2)',
                padding:'14px', marginBottom:'12px',
                animation:'pulse 1s infinite'
              }}>Confirming on Solana Network...</div>
            )}

            {payStatus === 'success' && (
              <div style={{
                fontFamily:'DM Mono, monospace', fontSize:'9px',
                letterSpacing:'0.2em', color:'#14F195',
                textTransform:'uppercase', textAlign:'center',
                border:'1px solid rgba(20,241,149,0.3)',
                padding:'14px', marginBottom:'12px',
                background:'rgba(20,241,149,0.05)'
              }}>✓ Order Accepted — Payment Confirmed on Solana</div>
            )}
          </div>

          {/* Buttons */}
          {cart.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'24px' }}>
              {!allSizesSelected && payStatus === 'idle' && (
                <div style={{
                  fontFamily:'DM Mono, monospace', fontSize:'7px',
                  letterSpacing:'0.2em', color:'#3a1a1a',
                  textTransform:'uppercase', textAlign:'center', marginBottom:'4px'
                }}>Select sizes for all items first</div>
              )}

              {payStatus !== 'success' && (
                <button
                  onClick={payWithSolana}
                  disabled={payStatus !== 'idle' || !allSizesSelected}
                  style={{
                    width:'100%', padding:'16px',
                    background: allSizesSelected && payStatus === 'idle'
                      ? 'linear-gradient(135deg,#9945FF,#14F195)'
                      : 'rgba(153,69,255,0.1)',
                    border:'none',
                    fontFamily:'DM Mono, monospace', fontSize:'9px',
                    letterSpacing:'0.35em', textTransform:'uppercase',
                    color: allSizesSelected && payStatus === 'idle' ? '#000' : '#444',
                    cursor: allSizesSelected && payStatus === 'idle' ? 'pointer' : 'not-allowed',
                    fontWeight:'700', transition:'all 0.2s'
                  }}
                >
                  {payStatus === 'idle' && 'Pay with Solana'}
                  {payStatus === 'connecting' && 'Connecting...'}
                  {payStatus === 'confirm' && 'Confirming...'}
                </button>
              )}

              {payStatus === 'success' && (
                <button
                  onClick={onClose}
                  style={{
                    width:'100%', padding:'16px',
                    background:'none',
                    border:'1px solid rgba(20,241,149,0.3)',
                    fontFamily:'DM Mono, monospace', fontSize:'9px',
                    letterSpacing:'0.35em', textTransform:'uppercase',
                    color:'#14F195', cursor:'pointer'
                  }}
                >Done — Back to Store</button>
              )}

              {payStatus === 'idle' && (
                <button style={{
                  width:'100%', padding:'16px',
                  background:'none',
                  border:'1px solid rgba(232,228,220,0.08)',
                  fontFamily:'DM Mono, monospace', fontSize:'9px',
                  letterSpacing:'0.35em', textTransform:'uppercase',
                  color:'#333', cursor:'pointer'
                }}>
                  Standard Checkout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}