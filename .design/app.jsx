// app.jsx — Checklist Merch · Frost & Sakura theme
const { useState, useMemo, useEffect } = React;

// ─────────────────────────── Sample data ───────────────────────────
const PRODUCTS = [
  { id: 1, name: "Standee March 7th Mùa Hè", price: 150000, qty: 1, cat: "Standee/Poster", catKey: "standee", shop: "Shop Mihoyo", char: "March 7th", buyer: "Khoa", bought: true, glyph: "🌸", date: "2026-05-12" },
  { id: 2, name: "Sticker March 7th (Gói 10c)", price: 30000, qty: 10, cat: "Sticker/Khác", catKey: "sticker", shop: "Shop Anime VN", char: "March 7th", buyer: "Shino", bought: false, glyph: "✿", date: "2026-05-10" },
  { id: 3, name: "Acrylic Stand March 7th Snow", price: 320000, qty: 1, cat: "Acrylic", catKey: "acrylic", shop: "Taobao", char: "March 7th", buyer: "Khoa", bought: true, glyph: "❄", date: "2026-05-08" },
  { id: 4, name: "Móc khóa Cosmodyssey March 7th", price: 85000, qty: 2, cat: "Móc khóa", catKey: "keychain", shop: "Shop Mihoyo", char: "March 7th", buyer: "Baja Bella", bought: false, glyph: "✦", date: "2026-05-06" },
  { id: 5, name: "Áo thun Kafka", price: 250000, qty: 2, cat: "Áo/Trang phục", catKey: "apparel", shop: "Shop Anime VN", char: "Kafka", buyer: "Shino", bought: false, glyph: "✧", date: "2026-05-04" },
  { id: 6, name: "Gối ôm Yaoguang", price: 3900000, qty: 1, cat: "Gối ôm/Plushie", catKey: "plush", shop: "Taobao", char: "Yaoguang", buyer: "Baja Bella", bought: true, glyph: "❀", date: "2026-04-28" },
  { id: 7, name: "Artbook Trailblaze Vol.2", price: 580000, qty: 1, cat: "Artbook", catKey: "artbook", shop: "Bookstore", char: "Khác", buyer: "Khoa", bought: false, glyph: "✦", date: "2026-04-25" },
  { id: 8, name: "Nendoroid March 7th — Limited", price: 1850000, qty: 1, cat: "Figure", catKey: "figure", shop: "Shop Mihoyo", char: "March 7th", buyer: "Khoa", bought: true, glyph: "❄", date: "2026-04-20" },
  { id: 9, name: "Pin set Astral Express", price: 120000, qty: 3, cat: "Pin/Badge", catKey: "pin", shop: "Taobao", char: "Khác", buyer: "Shino", bought: false, glyph: "★", date: "2026-04-15" },
];

const CATS = [
  { key: "all", label: "Tất cả" },
  { key: "standee", label: "Standee" },
  { key: "sticker", label: "Sticker" },
  { key: "acrylic", label: "Acrylic" },
  { key: "keychain", label: "Móc khóa" },
  { key: "apparel", label: "Áo" },
  { key: "plush", label: "Gối ôm" },
  { key: "figure", label: "Figure" },
  { key: "pin", label: "Pin" },
  { key: "artbook", label: "Artbook" },
];

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

// ─────────────────────────── Icons ───────────────────────────
const Ic = {
  Sakura: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g fill={color}>
        {[0, 72, 144, 216, 288].map(r => (
          <path key={r} d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform={`rotate(${r} 12 12)`} />
        ))}
        <circle cx="12" cy="12" r="1.6" fill="#fff" opacity="0.7" />
      </g>
    </svg>
  ),
  Snow: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="3.3" y1="7" x2="20.7" y2="17" />
      <line x1="3.3" y1="17" x2="20.7" y2="7" />
      <polyline points="9.5,4 12,2 14.5,4" />
      <polyline points="9.5,20 12,22 14.5,20" />
    </svg>
  ),
  Sparkle: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
    </svg>
  ),
  Dashboard: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="10" rx="2" />
      <rect x="13" y="3" width="8" height="6" rx="2" />
      <rect x="13" y="11" width="8" height="10" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </svg>
  ),
  Plus: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Cart: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4 H6 L7.5 14.5 H19 L21 7 H7" />
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
    </svg>
  ),
  Edit: ({ size = 13, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4 L20 10 L9 21 H3 V15 Z" /><line x1="13" y1="5" x2="19" y2="11" />
    </svg>
  ),
  Trash: ({ size = 13, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 21 H17 L18 7" />
    </svg>
  ),
  Check: ({ size = 13, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 10 18 20 6" />
    </svg>
  ),
  Clock: ({ size = 13, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" />
    </svg>
  ),
};

// ─────────────────────────── Crest ───────────────────────────
function Crest() {
  return (
    <div className="crest">
      <svg className="ring" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="cg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff7eb0" />
            <stop offset="50%" stopColor="#b3a3e8" />
            <stop offset="100%" stopColor="#6fc7ff" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#cg)" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.65" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="url(#cg)" strokeWidth="0.8" opacity="0.45" />
      </svg>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="petal" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff8cb8" />
            <stop offset="100%" stopColor="#ffc3dc" />
          </linearGradient>
          <linearGradient id="ice" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7fcfff" />
            <stop offset="100%" stopColor="#c5e8ff" />
          </linearGradient>
        </defs>
        {/* center circle with split */}
        <circle cx="50" cy="50" r="22" fill="url(#petal)" />
        <path d="M50 28 A22 22 0 0 1 50 72 Z" fill="url(#ice)" />
        {/* sakura on top */}
        <g transform="translate(50 50) scale(0.9)">
          {[0, 72, 144, 216, 288].map(r => (
            <path key={r} d="M0 -18 C 4 -10 9 -10 9 -4 C 9 4 4 8 0 8 C -4 8 -9 4 -9 -4 C -9 -10 -4 -10 0 -18 Z"
              fill="#fff" opacity="0.92" transform={`rotate(${r})`} />
          ))}
          <circle r="3" fill="#ffd97a" />
        </g>
        {/* outer accents */}
        <circle cx="50" cy="6" r="2.5" fill="#fff" />
        <circle cx="94" cy="50" r="2" fill="#fff" />
        <circle cx="50" cy="94" r="2" fill="#fff" />
        <circle cx="6" cy="50" r="2.5" fill="#fff" />
      </svg>
    </div>
  );
}

// ─────────────────────────── Tabs ───────────────────────────
function Tabs({ value, onChange }) {
  const items = [
    { id: "all", label: "Tất cả sản phẩm", ico: <Ic.Sparkle size={14} color={value === "all" ? "#fff" : "#b3a3e8"} /> },
    { id: "march", label: "Chỉ March 7th", ico: <Ic.Sakura size={14} color={value === "march" ? "#fff" : "#ff7eb0"} /> },
    { id: "dash", label: "Dashboard", ico: <Ic.Dashboard size={14} color={value === "dash" ? "#fff" : "#6fc7ff"} /> },
  ];
  return (
    <div className="tabs" role="tablist">
      {items.map(it => (
        <button key={it.id} className="tab" data-active={value === it.id} onClick={() => onChange(it.id)} role="tab" aria-selected={value === it.id}>
          {it.ico}{it.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────── Header ───────────────────────────
function Header({ tab, setTab }) {
  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <header className="hero">
      <Crest />
      <div className="eyebrow">FROST<span className="dot"></span>PETAL<span className="dot"></span>COSMODYSSEY</div>
      <h1 className="title">Checklist Merch</h1>
      <p className="subtitle">
        Bộ sưu tập merch chủ đề tinh thể băng & cánh hoa anh đào.
        Theo dõi từng món của <em>March 7th</em> và các nhân vật yêu thích khác.
      </p>
      <Tabs value={tab} onChange={setTab} />
      <div style={{ marginTop: 14, fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Astral Express · {today}
      </div>
    </header>
  );
}

// ─────────────────────────── Toolbar ───────────────────────────
function Toolbar({ category, setCategory, status, setStatus, sort, setSort, priceMin, priceMax, setPriceMin, setPriceMax, onAdd, products }) {
  // category counts
  const counts = useMemo(() => {
    const c = {};
    products.forEach(p => { c[p.catKey] = (c[p.catKey] || 0) + 1; });
    c.all = products.length;
    return c;
  }, [products]);

  const [stuck, setStuck] = useState(false);
  const sentinelRef = React.useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      setStuck(r.top < 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="toolbar-sentinel" aria-hidden="true"></div>
      <section className={`panel toolbar-panel ${stuck ? "stuck" : ""}`}>
        <div className="toolbar">
          <button className="add-btn" onClick={onAdd}>
            <span className="glow"></span>
            <Ic.Sparkle size={13} color="#fff" />
            <span>{stuck ? "Thêm mới" : "Thêm Sản Phẩm Mới"}</span>
          </button>
          <div className="filters">
            <select className="field" value={category} onChange={e => setCategory(e.target.value)}>
              {CATS.map(c => <option key={c.key} value={c.key}>-- {c.label} --</option>)}
            </select>
            <input className="field field--input" placeholder="Giá từ…" value={priceMin} onChange={e => setPriceMin(e.target.value.replace(/[^\d]/g, ""))} />
            <input className="field field--input" placeholder="Đến giá…" value={priceMax} onChange={e => setPriceMax(e.target.value.replace(/[^\d]/g, ""))} />
            <select className="field" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">-- Trạng thái --</option>
              <option value="bought">Đã mua</option>
              <option value="pending">Chưa mua</option>
            </select>
            <select className="field" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="name">Tên A–Z</option>
            </select>
          </div>
        </div>
        <div className="cat-bar">
          {CATS.map(c => (
            <button key={c.key} className="cat-chip" data-active={category === c.key} onClick={() => setCategory(c.key)}>
              {c.key === "all" && <Ic.Sparkle size={11} color="currentColor" />}
              {c.label}
              <span className="num">{counts[c.key] || 0}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ─────────────────────────── Product card ───────────────────────────
function Thumb({ p }) {
  const isMarch = p.char === "March 7th";
  const tint = isMarch ? "pink" : (p.char === "Kafka" ? "lav" : "ice");
  const bg = {
    pink: "linear-gradient(135deg, #ffd9e6 0%, #ffe9f1 100%)",
    ice:  "linear-gradient(135deg, #d9eaff 0%, #ecf4ff 100%)",
    lav:  "linear-gradient(135deg, #ddd3f5 0%, #ebe3ff 100%)",
  }[tint];
  const labelText = {
    standee: "STANDEE", sticker: "STICKER", acrylic: "ACRYLIC", keychain: "KEYCHAIN",
    apparel: "APPAREL", plush: "PLUSH", figure: "FIGURE", pin: "PIN", artbook: "ARTBOOK",
  }[p.catKey] || "ITEM";
  return (
    <div className="thumb" style={{ background: bg }}>
      <div className="pattern"></div>
      <div className="glyph">{p.glyph}</div>
      <div className="label">{labelText}</div>
    </div>
  );
}

function ProductCard({ p, onToggle, onEdit, onDelete }) {
  const isMarch = p.char === "March 7th";
  return (
    <article className="product" data-bought={p.bought} data-march={isMarch}>
      <span className="accent"></span>
      <Thumb p={p} />
      <div className="info">
        <h3 className="name">
          {p.name}
          {isMarch && <span className="march-tag"><Ic.Sakura size={9} color="#d94f86" /> March 7th</span>}
        </h3>
        <div className="price">{fmt(p.price)} ₫</div>
        <div className="meta">
          <span><span className="k">Số lượng</span><b>{p.qty}</b></span>
          <span><span className="k">Tổng</span><b>{fmt(p.price * p.qty)} ₫</b></span>
          <span><span className="k">Loại</span><b>{p.cat}</b></span>
          <span><span className="k">Shop</span><b>{p.shop}</b></span>
          <span><span className="k">Nhân vật</span><b>{p.char}</b></span>
          <span><span className="k">Người mua</span><b>{p.buyer}</b></span>
        </div>
        <div className={`status ${p.bought ? "bought" : "pending"}`}>
          {p.bought
            ? <><Ic.Check size={11} color="#2f8568" /> Đã mua</>
            : <><Ic.Clock size={11} color="#b07a20" /> Chưa mua</>}
        </div>
      </div>
      <div className="actions">
        <button className="btn btn--toggle" onClick={() => onToggle(p.id)}>
          <Ic.Check size={12} color="#7a68b8" />
          {p.bought ? "Bỏ đánh dấu" : "Đánh dấu mua"}
        </button>
        <button className="btn btn--edit" onClick={() => onEdit(p.id)}>
          <Ic.Edit size={12} color="#3a8fd4" /> Sửa
        </button>
        <button className="btn btn--del" onClick={() => onDelete(p.id)}>
          <Ic.Trash size={12} color="#d94f86" /> Xóa
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────── Stat card ───────────────────────────
function StatCard({ variant, kind, label, amount, meta, progress, icon }) {
  const cls = ["stat"];
  if (kind === "total") cls.push("stat-total", variant);
  if (kind === "bought") cls.push("stat-bought", variant);
  if (kind === "pending") cls.push("stat-pending");
  return (
    <div className={cls.join(" ")}>
      <div className="stat-bg" aria-hidden="true">
        <svg width="140" height="140" viewBox="0 0 100 100" style={{ right: -30, bottom: -30, opacity: 0.18 }}>
          <circle cx="50" cy="50" r="48" fill="#fff" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#fff" strokeWidth="1.2" />
        </svg>
        <svg width="56" height="56" viewBox="0 0 24 24" style={{ left: 20, bottom: 14, opacity: 0.22 }} fill="#fff">
          <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
        </svg>
      </div>
      <div className="stat-head">
        <span className="ic">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-amount">{fmt(amount)}<span className="cur"> ₫</span></div>
      <div className="stat-meta">{meta}</div>
      {progress !== undefined && (
        <div className="progress"><div className="fill" style={{ width: `${progress}%` }}></div></div>
      )}
    </div>
  );
}

// ─────────────────────────── Dashboard ───────────────────────────
function Dashboard({ products }) {
  const march = products.filter(p => p.char === "March 7th");
  const others = products.filter(p => p.char !== "March 7th");

  const calc = (list) => {
    const total = list.reduce((s, p) => s + p.price * p.qty, 0);
    const bought = list.filter(p => p.bought).reduce((s, p) => s + p.price * p.qty, 0);
    const pending = total - bought;
    return { total, bought, pending, count: list.length, doneCount: list.filter(p => p.bought).length };
  };
  const m = calc(march), o = calc(others);

  const recent = [...products].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <>
      <div className="dash">
        {/* March 7th column */}
        <div className="dash-col march">
          <h3><span className="badge"><Ic.Sakura size={18} color="#fff" /></span> March 7th</h3>
          <div className="stat-grid">
            <StatCard variant="pink" kind="total" label="Tổng cộng"
              amount={m.total} meta={`${m.count} món · ${march.reduce((s,p)=>s+p.qty,0)} đơn vị`}
              icon={<Ic.Sparkle size={14} color="#fff" />} />
            <StatCard variant="pink" kind="bought" label="Đã mua"
              amount={m.bought} meta={`${m.doneCount}/${m.count} đã hoàn thành`}
              progress={m.total ? (m.bought / m.total) * 100 : 0}
              icon={<Ic.Check size={14} color="#fff" />} />
            <StatCard kind="pending" label="Chưa mua"
              amount={m.pending} meta={`${m.count - m.doneCount} món còn lại`}
              icon={<Ic.Cart size={14} color="#d94f86" />} />
          </div>
        </div>
        {/* Others column */}
        <div className="dash-col other">
          <h3><span className="badge"><Ic.Sparkle size={18} color="#fff" /></span> Sản phẩm khác</h3>
          <div className="stat-grid">
            <StatCard variant="ice" kind="total" label="Tổng cộng"
              amount={o.total} meta={`${o.count} món · ${others.reduce((s,p)=>s+p.qty,0)} đơn vị`}
              icon={<Ic.Snow size={14} color="#fff" />} />
            <StatCard variant="ice" kind="bought" label="Đã mua"
              amount={o.bought} meta={`${o.doneCount}/${o.count} đã hoàn thành`}
              progress={o.total ? (o.bought / o.total) * 100 : 0}
              icon={<Ic.Check size={14} color="#fff" />} />
            <StatCard kind="pending" label="Chưa mua"
              amount={o.pending} meta={`${o.count - o.doneCount} món còn lại`}
              icon={<Ic.Cart size={14} color="#d94f86" />} />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <section className="recent">
        <h4>
          <span>Hoạt động gần đây</span>
          <span>5 mục mới nhất</span>
        </h4>
        <div className="recent-list">
          {recent.map(p => (
            <div className="recent-item" key={p.id}>
              <div className="ri-ic">{p.glyph}</div>
              <div>
                <div className="ri-name">{p.name}</div>
                <div className="ri-meta">{p.cat} · {p.shop} · {p.date}</div>
              </div>
              <div className="ri-price">{fmt(p.price * p.qty)} ₫</div>
              <div className={`ri-dot ${p.bought ? "b" : "p"}`} title={p.bought ? "Đã mua" : "Chưa mua"}></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ─────────────────────────── Empty state ───────────────────────────
function Empty() {
  return (
    <div className="panel" style={{ textAlign: "center", padding: 60, marginTop: 14 }}>
      <Ic.Snow size={42} color="#b3a3e8" />
      <div style={{ marginTop: 14, fontFamily: "Quicksand", fontWeight: 600, fontSize: 18, color: "var(--ink-1)" }}>Không tìm thấy món nào</div>
      <div style={{ marginTop: 6, color: "var(--ink-2)", fontSize: 13 }}>Thử bỏ bớt bộ lọc hoặc thêm một sản phẩm mới.</div>
    </div>
  );
}

// ─────────────────────────── App ───────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#ff7eb0", "#6fc7ff", "#b3a3e8"],
  "showLegend": true,
  "density": "regular",
  "sparkles": true
}/*EDITMODE-END*/;

function App() {
  const [tab, setTab] = useState("all");
  const [products, setProducts] = useState(PRODUCTS);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "add", editing: null });
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply palette via CSS variables
  useEffect(() => {
    const r = document.documentElement;
    if (Array.isArray(t.palette)) {
      r.style.setProperty('--pink', t.palette[0]);
      r.style.setProperty('--ice', t.palette[1]);
      r.style.setProperty('--lav', t.palette[2]);
    }
  }, [t.palette]);

  useEffect(() => {
    const wrap = document.getElementById('bg-stars');
    if (wrap) wrap.style.display = t.sparkles ? '' : 'none';
  }, [t.sparkles]);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (tab === "march") list = list.filter(p => p.char === "March 7th");
    if (category !== "all") list = list.filter(p => p.catKey === category);
    if (status === "bought") list = list.filter(p => p.bought);
    if (status === "pending") list = list.filter(p => !p.bought);
    const minN = parseInt(priceMin || "0", 10);
    const maxN = parseInt(priceMax || "0", 10);
    if (minN) list = list.filter(p => p.price >= minN);
    if (maxN) list = list.filter(p => p.price <= maxN);
    list.sort((a, b) => {
      if (sort === "newest") return b.date.localeCompare(a.date);
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [products, tab, category, status, sort, priceMin, priceMax]);

  const toggle = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, bought: !p.bought } : p));
  const remove = (id) => setProducts(prev => prev.filter(p => p.id !== id));
  const edit = (id) => {
    const p = products.find(x => x.id === id);
    if (p) setModal({ open: true, mode: "edit", editing: p });
  };
  const add = () => {
    setModal({ open: true, mode: "add", editing: null });
  };
  const handleSave = (data) => {
    if (modal.mode === "edit" && data.id) {
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
    } else {
      const id = Math.max(0, ...products.map(p => p.id)) + 1;
      setProducts(prev => [{ ...data, id }, ...prev]);
    }
    setModal({ open: false, mode: "add", editing: null });
  };

  const densityPad = { compact: 12, regular: 18, comfy: 26 }[t.density] || 18;

  return (
    <div className="app" style={{ "--prod-pad": densityPad + 'px' }}>
      <style>{`.product { padding: var(--prod-pad); }`}</style>
      <Header tab={tab} setTab={setTab} />

      {tab === "dash" ? (
        <Dashboard products={products} />
      ) : (
        <>
          <Toolbar
            category={category} setCategory={setCategory}
            status={status} setStatus={setStatus}
            sort={sort} setSort={setSort}
            priceMin={priceMin} priceMax={priceMax} setPriceMin={setPriceMin} setPriceMax={setPriceMax}
            onAdd={add} products={tab === "march" ? products.filter(p => p.char === "March 7th") : products}
          />

          <div className="sec-head">
            <h2>
              <Ic.Sakura size={20} color="#ff7eb0" />
              {tab === "march" ? "Bộ sưu tập March 7th" : "Tất cả sản phẩm"}
              <span className="count">{filtered.length} MÓN</span>
            </h2>
            {t.showLegend && (
              <div className="legend">
                <span><span className="swatch" style={{ background: "var(--pink)" }}></span> March 7th</span>
                <span><span className="swatch" style={{ background: "var(--ice)" }}></span> Khác</span>
                <span><span className="swatch" style={{ background: "var(--mint)" }}></span> Đã mua</span>
              </div>
            )}
          </div>

          {filtered.length === 0 ? <Empty /> : (
            <div className="product-list">
              {filtered.map(p => (
                <ProductCard key={p.id} p={p} onToggle={toggle} onEdit={edit} onDelete={remove} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="divider">✦ ✦ ✦ End of Trailblaze Log ✦ ✦ ✦</div>
      <div className="footer">
        <span>FROST · PETAL · v2.4 · CHECKLIST MERCH</span>
        <span>Made with ❄ & ✿ for March 7th fans</span>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakColor label="Palette" value={t.palette}
          options={[
            ["#ff7eb0", "#6fc7ff", "#b3a3e8"], // sakura + ice + lavender (default)
            ["#ff5b95", "#5ec1ff", "#9b87e0"], // saturated
            ["#ffa8c8", "#a3dbff", "#d0c4f0"], // pastel
            ["#e8709a", "#6fb3d4", "#8a7ab5"], // muted/dusk
            ["#ff8fa3", "#7fd0e0", "#c4a3e0"], // candy
          ]}
          onChange={v => setTweak('palette', v)} />
        <TweakToggle label="Sparkle background" value={t.sparkles}
          onChange={v => setTweak('sparkles', v)} />
        <TweakToggle label="Show legend chip" value={t.showLegend}
          onChange={v => setTweak('showLegend', v)} />
        <TweakRadio label="Card density" value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={v => setTweak('density', v)} />
        <TweakSection label="Demo" />
        <TweakButton onClick={() => setProducts(PRODUCTS)}>Reset dữ liệu mẫu</TweakButton>
      </TweaksPanel>

      <MusicPlayer />
      <ProductModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.editing}
        onClose={() => setModal({ open: false, mode: "add", editing: null })}
        onSave={handleSave}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
