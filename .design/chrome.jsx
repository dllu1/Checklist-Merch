// chrome.jsx — StickyNav + MusicPlayer for Checklist Merch
const { useState, useEffect, useRef } = React;

// ─────────────────────────── Sticky Nav ───────────────────────────
function MiniCrest({ size = 28 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <linearGradient id="mc-petal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff8cb8" /><stop offset="100%" stopColor="#ffc3dc" />
        </linearGradient>
        <linearGradient id="mc-ice" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#7fcfff" /><stop offset="100%" stopColor="#c5e8ff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#mc-petal)" />
      <path d="M50 4 A46 46 0 0 1 50 96 Z" fill="url(#mc-ice)" />
      <g transform="translate(50 50) scale(0.7)">
        {[0, 72, 144, 216, 288].map(r => (
          <path key={r} d="M0 -18 C 4 -10 9 -10 9 -4 C 9 4 4 8 0 8 C -4 8 -9 4 -9 -4 C -9 -10 -4 -10 0 -18 Z"
            fill="#fff" opacity="0.95" transform={`rotate(${r})`} />
        ))}
        <circle r="3" fill="#ffd97a" />
      </g>
    </svg>
  );
}

function StickyNav({ tab, setTab }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { id: "all", label: "Tất cả" },
    { id: "march", label: "March 7th" },
    { id: "dash", label: "Dashboard" },
  ];

  return (
    <div className="snav-wrap" data-visible={visible} aria-hidden={!visible}>
      <div className="snav">
        <div className="snav-brand">
          <div className="snav-crest"><MiniCrest size={32} /></div>
          <div className="snav-titlewrap">
            <div className="snav-eyebrow">FROST · PETAL</div>
            <div className="snav-title">Checklist Merch</div>
          </div>
        </div>
        <div className="snav-tabs">
          {items.map(it => (
            <button key={it.id} className="snav-tab" data-active={tab === it.id} onClick={() => setTab(it.id)}>
              {it.label}
            </button>
          ))}
        </div>
        <button className="snav-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Lên đầu trang">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 14 12 8 18 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── Music Player ───────────────────────────
const TRACKS = [
  { title: "Cosmodyssey · Frost Theme", artist: "OST · Honkai Theme Fan-Mix", duration: 234 },
  { title: "Sakura Snowfall", artist: "Trailblaze Lullaby", duration: 198 },
  { title: "Astral Express, 3 AM", artist: "Lo-fi Edition", duration: 252 },
  { title: "Pink Star Memory", artist: "City-Pop Cover", duration: 215 },
];

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [progress, setProgress] = useState(28); // seconds
  const track = TRACKS[trackIdx];

  // simulate progress
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p + 1 >= track.duration) {
          setTrackIdx(i => (i + 1) % TRACKS.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, track.duration]);

  const pct = (progress / track.duration) * 100;

  const onSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setProgress(Math.max(0, Math.min(1, x)) * track.duration);
  };

  const prev = () => { setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length); setProgress(0); };
  const next = () => { setTrackIdx(i => (i + 1) % TRACKS.length); setProgress(0); };

  // 12-bar visualizer (CSS animation, paused when not playing)
  const bars = Array.from({ length: 14 });

  return (
    <>
      {/* Expanded card */}
      <div className={`mp-card ${open ? 'open' : ''}`} role="dialog" aria-label="Trình phát nhạc">
        <div className="mp-head">
          <div className="mp-disc">
            <div className="mp-disc-ring" style={{ animationPlayState: playing ? 'running' : 'paused' }}>
              <svg viewBox="0 0 60 60" width="56" height="56">
                <defs>
                  <linearGradient id="mp-g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff7eb0" />
                    <stop offset="50%" stopColor="#b3a3e8" />
                    <stop offset="100%" stopColor="#6fc7ff" />
                  </linearGradient>
                </defs>
                <circle cx="30" cy="30" r="28" fill="url(#mp-g)" />
                <circle cx="30" cy="30" r="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                <circle cx="30" cy="30" r="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
                <g transform="translate(30 30) scale(0.45)">
                  {[0, 72, 144, 216, 288].map(r => (
                    <path key={r} d="M0 -18 C 4 -10 9 -10 9 -4 C 9 4 4 8 0 8 C -4 8 -9 4 -9 -4 C -9 -10 -4 -10 0 -18 Z"
                      fill="#fff" opacity="0.95" transform={`rotate(${r})`} />
                  ))}
                </g>
                <circle cx="30" cy="30" r="3" fill="#fff" />
              </svg>
            </div>
            <div className="mp-vis" aria-hidden="true">
              {bars.map((_, i) => (
                <span key={i} className="mp-vis-bar"
                  style={{
                    animationDelay: `${(i * 0.08).toFixed(2)}s`,
                    animationPlayState: playing ? 'running' : 'paused',
                    height: playing ? '60%' : '20%',
                  }} />
              ))}
            </div>
          </div>
          <div className="mp-meta">
            <div className="mp-eyebrow">NOW PLAYING · 2.4 EVENT</div>
            <div className="mp-title">{track.title}</div>
            <div className="mp-artist">{track.artist}</div>
          </div>
          <button className="mp-x" onClick={() => setOpen(false)} aria-label="Đóng">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mp-progress" onClick={onSeek}>
          <div className="mp-progress-track">
            <div className="mp-progress-fill" style={{ width: `${pct}%` }}></div>
            <div className="mp-progress-thumb" style={{ left: `${pct}%` }}></div>
          </div>
          <div className="mp-time"><span>{fmtTime(progress)}</span><span>{fmtTime(track.duration)}</span></div>
        </div>

        <div className="mp-controls">
          <button className="mp-btn" onClick={prev} aria-label="Bài trước">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5 H8 V19 H6 Z M9 12 L20 5 V19 Z" />
            </svg>
          </button>
          <button className="mp-btn mp-play" onClick={() => setPlaying(p => !p)} aria-label={playing ? "Tạm dừng" : "Phát"}>
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5 L20 12 L7 19 Z" />
              </svg>
            )}
          </button>
          <button className="mp-btn" onClick={next} aria-label="Bài tiếp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5 L15 12 L4 19 Z M16 5 H18 V19 H16 Z" />
            </svg>
          </button>
          <div className="mp-sep"></div>
          <div className="mp-queue" aria-label="Hàng chờ">
            <span className="mp-queue-lbl">UP NEXT</span>
            <span className="mp-queue-track">{TRACKS[(trackIdx + 1) % TRACKS.length].title}</span>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="mp-fab" onClick={() => setOpen(o => !o)} data-playing={playing} aria-label="Trình phát nhạc">
        <span className="mp-fab-ring"></span>
        {playing ? (
          <div className="mp-fab-eq" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M9 4 V18.5 A3 3 0 1 1 7 16 V7 L19 4 V14.5 A3 3 0 1 1 17 12 V6 Z" />
          </svg>
        )}
      </button>
    </>
  );
}

// Export to window so app.jsx can use them
Object.assign(window, { StickyNav, MusicPlayer });
