// modal.jsx — Add / Edit product modal (March 7th theme)
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

// Local copies (Babel scripts have isolated scopes)
const M_CATS = [
  { key: "standee", label: "Standee/Poster" },
  { key: "sticker", label: "Sticker/Khác" },
  { key: "acrylic", label: "Acrylic" },
  { key: "keychain", label: "Móc khóa/Huy hiệu" },
  { key: "apparel", label: "Áo/Trang phục" },
  { key: "plush", label: "Gối ôm/Plushie" },
  { key: "figure", label: "Figure" },
  { key: "pin", label: "Pin/Badge" },
  { key: "artbook", label: "Artbook" },
];

const M_Sakura = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <g fill={color}>
      {[0, 72, 144, 216, 288].map(r => (
        <path key={r} d="M12 4 C13.5 7 16 7 16 9 C16 11 14 12 12 12 C10 12 8 11 8 9 C8 7 10.5 7 12 4 Z" transform={`rotate(${r} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.6" fill="#fff" opacity="0.7" />
    </g>
  </svg>
);
const M_Sparkle = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
  </svg>
);

const CHARS = ["March 7th", "Kafka", "Yaoguang", "Himeko", "Welt", "Bronya", "Trailblazer", "Khác"];

function ProductModal({ open, mode, initial, onClose, onSave }) {
  const empty = {
    name: "", price: "", qty: 1, catKey: "sticker",
    char: "March 7th", shop: "", buyer: "", glyph: "✿",
  };
  const [form, setForm] = useStateM(empty);
  const [filePreview, setFilePreview] = useStateM(null);
  const [errors, setErrors] = useStateM({});
  const fileRef = useRefM(null);

  useEffectM(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name, price: String(initial.price), qty: initial.qty,
        catKey: initial.catKey, char: initial.char, shop: initial.shop,
        buyer: initial.buyer, glyph: initial.glyph,
      } : empty);
      setFilePreview(null);
      setErrors({});
    }
  }, [open, initial]);

  // ESC to close
  useEffectM(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFilePreview({ url, name: f.name, size: f.size });
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Vui lòng nhập tên sản phẩm";
    if (!form.price || parseInt(form.price, 10) <= 0) er.price = "Giá phải lớn hơn 0";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const catLabelMap = {
      sticker: "Sticker/Khác", standee: "Standee/Poster", acrylic: "Acrylic",
      keychain: "Móc khóa", apparel: "Áo/Trang phục", plush: "Gối ôm/Plushie",
      figure: "Figure", pin: "Pin/Badge", artbook: "Artbook",
    };
    onSave({
      ...(initial || {}),
      name: form.name.trim(),
      price: parseInt(form.price, 10),
      qty: Math.max(1, parseInt(form.qty, 10) || 1),
      catKey: form.catKey,
      cat: catLabelMap[form.catKey] || "Khác",
      char: form.char,
      shop: form.shop || "Chưa rõ",
      buyer: form.buyer || "Khoa",
      glyph: form.glyph,
      date: initial?.date || new Date().toISOString().slice(0, 10),
      bought: initial?.bought ?? false,
    });
  };

  const isEdit = mode === "edit";

  return (
    <div className="pm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pm-petals" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="pm-petal" style={{
            left: `${(i * 7) % 100}%`,
            animationDelay: `${-i * 0.7}s`,
            animationDuration: `${7 + (i % 5)}s`,
          }} />
        ))}
      </div>
      <div className="pm-card" role="dialog" aria-modal="true" aria-labelledby="pm-title">
        {/* corner ornaments */}
        <svg className="pm-corner pm-corner-tl" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
          <defs>
            <linearGradient id="pmc1" x1="0" x2="1"><stop offset="0%" stopColor="#ff7eb0" /><stop offset="100%" stopColor="#b3a3e8" /></linearGradient>
          </defs>
          <path d="M2 30 Q 2 2 30 2" stroke="url(#pmc1)" strokeWidth="1.2" fill="none" opacity="0.7" />
          <circle cx="2" cy="2" r="2" fill="#ff7eb0" opacity="0.6" />
        </svg>
        <svg className="pm-corner pm-corner-br" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
          <defs>
            <linearGradient id="pmc2" x1="0" x2="1"><stop offset="0%" stopColor="#6fc7ff" /><stop offset="100%" stopColor="#b3a3e8" /></linearGradient>
          </defs>
          <path d="M78 50 Q 78 78 50 78" stroke="url(#pmc2)" strokeWidth="1.2" fill="none" opacity="0.7" />
          <circle cx="78" cy="78" r="2" fill="#6fc7ff" opacity="0.6" />
        </svg>

        <header className="pm-head">
          <div className="pm-head-left">
            <div className="pm-head-icon">
              <M_Sakura size={18} color="#fff" />
            </div>
            <div>
              <div className="pm-eyebrow">{isEdit ? "EDIT · MERCH" : "NEW · MERCH"}</div>
              <h2 id="pm-title" className="pm-title">{isEdit ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}</h2>
            </div>
          </div>
          <button className="pm-x" onClick={onClose} aria-label="Đóng">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </header>

        <div className="pm-body">
          {/* Name */}
          <div className="pm-field pm-col-2">
            <label className="pm-lbl">
              Tên sản phẩm <span className="pm-req">*</span>
            </label>
            <input
              className={`pm-input ${errors.name ? 'err' : ''}`}
              placeholder="VD: Standee March 7th Mùa Hè"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
            {errors.name && <div className="pm-err">{errors.name}</div>}
          </div>

          {/* Price + Qty */}
          <div className="pm-field">
            <label className="pm-lbl">Giá (VNĐ) <span className="pm-req">*</span></label>
            <div className="pm-input-wrap">
              <input
                className={`pm-input ${errors.price ? 'err' : ''}`}
                placeholder="150 000"
                value={form.price ? Number(form.price).toLocaleString("vi-VN") : ""}
                onChange={e => set('price', e.target.value.replace(/[^\d]/g, ""))}
              />
              <span className="pm-suffix">₫</span>
            </div>
            {errors.price && <div className="pm-err">{errors.price}</div>}
          </div>
          <div className="pm-field">
            <label className="pm-lbl">Số lượng</label>
            <div className="pm-stepper">
              <button className="pm-step" onClick={() => set('qty', Math.max(1, form.qty - 1))}>−</button>
              <input
                className="pm-input pm-input-center"
                value={form.qty}
                onChange={e => set('qty', parseInt(e.target.value || "1", 10) || 1)}
              />
              <button className="pm-step" onClick={() => set('qty', form.qty + 1)}>+</button>
            </div>
          </div>

          {/* Category + Character */}
          <div className="pm-field">
            <label className="pm-lbl">Danh mục</label>
            <select className="pm-input pm-select" value={form.catKey} onChange={e => set('catKey', e.target.value)}>
              {M_CATS.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-lbl">Nhân vật</label>
            <div className="pm-chips">
              {CHARS.map(c => (
                <button key={c} type="button"
                  className="pm-chip"
                  data-active={form.char === c}
                  onClick={() => set('char', c)}>
                  {c === "March 7th" && <M_Sakura size={10} color={form.char === c ? "#fff" : "#ff7eb0"} />}
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="pm-field">
            <label className="pm-lbl">Tên shop bán</label>
            <input
              className="pm-input"
              placeholder="VD: Shop Mihoyo, Taobao..."
              value={form.shop}
              onChange={e => set('shop', e.target.value)}
            />
          </div>
          {/* Buyer */}
          <div className="pm-field">
            <label className="pm-lbl">Người mua</label>
            <input
              className="pm-input"
              placeholder="Nhập tên người mua…"
              value={form.buyer}
              onChange={e => set('buyer', e.target.value)}
            />
          </div>

          {/* Glyph picker */}
          <div className="pm-field pm-col-2">
            <label className="pm-lbl">Biểu tượng</label>
            <div className="pm-glyphs">
              {["✿", "❀", "🌸", "❄", "✦", "✧", "★", "♡"].map(g => (
                <button key={g} type="button"
                  className="pm-glyph"
                  data-active={form.glyph === g}
                  onClick={() => set('glyph', g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div className="pm-field pm-col-2">
            <label className="pm-lbl">Hình ảnh</label>
            <div
              className="pm-drop"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.dataset.over = "true"; }}
              onDragLeave={(e) => { e.currentTarget.dataset.over = "false"; }}
              onDrop={(e) => {
                e.preventDefault(); e.currentTarget.dataset.over = "false";
                const f = e.dataTransfer.files?.[0];
                if (f) {
                  const url = URL.createObjectURL(f);
                  setFilePreview({ url, name: f.name, size: f.size });
                }
              }}
            >
              {filePreview ? (
                <div className="pm-drop-prev">
                  <img src={filePreview.url} alt="" />
                  <div className="pm-drop-meta">
                    <div className="pm-drop-name">{filePreview.name}</div>
                    <div className="pm-drop-size">{(filePreview.size / 1024).toFixed(1)} KB · Click hoặc kéo file khác để thay</div>
                  </div>
                  <button className="pm-drop-x" onClick={(e) => { e.stopPropagation(); setFilePreview(null); }}>×</button>
                </div>
              ) : (
                <>
                  <div className="pm-drop-ico">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                      <defs>
                        <linearGradient id="pm-up" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="#ff7eb0" /><stop offset="100%" stopColor="#6fc7ff" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="11" fill="rgba(255,126,176,0.08)" stroke="url(#pm-up)" strokeWidth="1.4" strokeDasharray="2 3" />
                      <path d="M12 7 V16 M8 11 L12 7 L16 11" stroke="url(#pm-up)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <div className="pm-drop-text">
                    <b>Click hoặc kéo ảnh vào đây</b>
                    <span>PNG · JPG · WebP — tối đa 5MB</span>
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} hidden />
            </div>
          </div>
        </div>

        <footer className="pm-foot">
          <button className="pm-btn pm-cancel" onClick={onClose}>Hủy</button>
          <button className="pm-btn pm-save" onClick={save}>
            <M_Sparkle size={12} color="#fff" />
            <span>{isEdit ? "Cập nhật" : "Lưu Dữ Liệu"}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { ProductModal });
