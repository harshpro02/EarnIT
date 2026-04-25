export default function RightCol({ filtered, activeIdx, cat, setCat }) {
    const prev = filtered[activeIdx - 1]
    const curr = filtered[activeIdx]
    const next = filtered[activeIdx + 1]
    const pages = []
    for (let i = activeIdx - 2; i <= activeIdx + 2; i++) {
      if (i >= 0 && i < filtered.length) pages.push({ n: i + 1, curr: i === activeIdx })
    }
    const cats = ['all', 'tops', 'bottoms', 'shoes', 'accessories']
  
    return (
      <div className="right">
        <div className="right-top">
          <div className="right-cats">
            {cats.map(c => (
              <button key={c} className={`right-cat${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="right-mid">
          <div className="right-names">
            {prev && <div className="right-item-name prev">{prev.name.toUpperCase()}</div>}
            {curr && <div className="right-item-name curr">{curr.name.toUpperCase()}</div>}
            {next && <div className="right-item-name next">{next.name.toUpperCase()}</div>}
          </div>
          <div className="right-pagination">
            {pages.map(p => (
              <div key={p.n} className={`right-pg${p.curr ? ' curr' : ''}`}>{p.n}</div>
            ))}
          </div>
        </div>
        <div className="right-bottom">SS 2026</div>
      </div>
    )
  }