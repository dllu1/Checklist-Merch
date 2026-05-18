<?php
declare(strict_types=1);

$audioDir   = __DIR__ . '/audio';
$audioFiles = is_dir($audioDir) ? (glob($audioDir . '/*.{m4a,mp3,ogg,wav}', GLOB_BRACE) ?: []) : [];

$tracks = array_map(static function (string $path): array {
    $file = basename($path);
    $name = pathinfo($file, PATHINFO_FILENAME);
    $name = preg_replace('/\s*\[[A-Za-z0-9_\-]+\]\s*$/', '', $name) ?? $name;
    return [
        'src'   => 'audio/' . rawurlencode($file),
        'title' => trim($name),
    ];
}, $audioFiles);
?>
<style>
    /* ===== Music Player (Frost & Petal) ===== */
    .mp-fab {
        position: fixed;
        right: 22px;
        bottom: 22px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 0;
        background: linear-gradient(135deg, #ff7eb0 0%, #b3a3e8 50%, #6fc7ff 100%);
        color: #fff;
        cursor: pointer;
        z-index: 80;
        display: inline-flex; align-items: center; justify-content: center;
        box-shadow:
            0 12px 30px -10px rgba(217, 79, 134, 0.55),
            0 4px 12px -4px rgba(80, 60, 130, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        transition: transform 240ms cubic-bezier(.2,.8,.2,1);
        font-family: 'Quicksand', sans-serif;
    }
    .mp-fab:hover { transform: scale(1.05); }
    .mp-fab:active { transform: scale(0.96); }
    .mp-fab-ring {
        position: absolute; inset: -6px;
        border: 1.5px dashed rgba(255, 126, 176, 0.55);
        border-radius: 50%;
        opacity: 0.7;
        animation: mp-spin 18s linear infinite;
        pointer-events: none;
    }
    .mp-fab[data-playing="true"]::after {
        content: '';
        position: absolute; inset: -12px;
        border-radius: 50%;
        border: 2px solid rgba(255, 126, 176, 0.35);
        animation: mp-pulse 2s ease-out infinite;
        pointer-events: none;
    }
    @keyframes mp-pulse {
        0%   { transform: scale(0.85); opacity: 0.9; }
        100% { transform: scale(1.4);  opacity: 0;   }
    }
    @keyframes mp-spin { to { transform: rotate(360deg); } }
    .mp-fab-eq {
        display: inline-flex; align-items: flex-end; gap: 3px;
        height: 18px;
    }
    .mp-fab-eq span {
        display: block;
        width: 3px;
        background: #fff;
        border-radius: 2px;
        animation: mp-eq 1.1s ease-in-out infinite;
    }
    .mp-fab-eq span:nth-child(1) { animation-delay: 0s;    height: 50%; }
    .mp-fab-eq span:nth-child(2) { animation-delay: 0.18s; height: 80%; }
    .mp-fab-eq span:nth-child(3) { animation-delay: 0.36s; height: 60%; }
    @keyframes mp-eq {
        0%, 100% { transform: scaleY(0.5); }
        50%      { transform: scaleY(1);   }
    }

    .mp-card {
        position: fixed;
        right: 22px;
        bottom: 92px;
        width: 340px;
        z-index: 81;
        background: rgba(255, 255, 255, 0.78);
        border: 1px solid rgba(122, 104, 184, 0.14);
        border-radius: 22px;
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        box-shadow:
            0 22px 60px -22px rgba(80, 60, 130, 0.4),
            0 6px 20px -8px rgba(217, 79, 134, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        padding: 18px;
        transform-origin: bottom right;
        transform: scale(0.9) translateY(12px);
        opacity: 0;
        pointer-events: none;
        transition: transform 280ms cubic-bezier(.2, 1.2, .3, 1), opacity 220ms;
        font-family: 'Inter', sans-serif;
    }
    .mp-card.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
    }
    .mp-card::before {
        content: '';
        position: absolute; inset: 0;
        border-radius: 22px;
        padding: 1px;
        background: linear-gradient(135deg, rgba(255, 126, 176, 0.55), rgba(179, 163, 232, 0.3) 50%, rgba(111, 199, 255, 0.55));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
                mask-composite: exclude;
        pointer-events: none;
    }

    .mp-head {
        display: grid;
        grid-template-columns: 56px 1fr auto;
        gap: 12px;
        align-items: center;
        padding-bottom: 12px;
        border-bottom: 1px dashed rgba(122, 104, 184, 0.14);
    }
    .mp-disc {
        width: 56px; height: 56px;
        border-radius: 50%;
        animation: mp-spin 12s linear infinite;
        box-shadow: 0 4px 12px -4px rgba(217, 79, 134, 0.4);
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #ff7eb0, #b3a3e8 50%, #6fc7ff);
        position: relative;
    }
    .mp-disc::before {
        content: '✿';
        color: #fff;
        font-size: 22px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .mp-disc::after {
        content: '';
        position: absolute; left: 50%; top: 50%;
        width: 8px; height: 8px;
        background: #fff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
    .mp-disc.paused { animation-play-state: paused; }

    .mp-meta { min-width: 0; }
    .mp-eyebrow {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        letter-spacing: 0.2em;
        color: #d94f86;
        margin-bottom: 4px;
        text-transform: uppercase;
    }
    .mp-title {
        font-family: 'Quicksand', sans-serif;
        font-weight: 600;
        font-size: 14px;
        color: #3a2a55;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
    }
    .mp-artist {
        font-size: 11.5px;
        color: #6b5688;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .mp-x {
        appearance: none;
        width: 26px; height: 26px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 126, 176, 0.12);
        color: #d94f86;
        cursor: pointer;
        align-self: flex-start;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 14px; line-height: 1;
        padding: 0;
    }
    .mp-x:hover { background: rgba(255, 126, 176, 0.22); }

    .mp-progress {
        padding: 14px 2px 8px;
    }
    .mp-seek {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(
            to right,
            #ff7eb0 0%,
            #b3a3e8 var(--mp-progress, 0%),
            rgba(179, 163, 232, 0.18) var(--mp-progress, 0%),
            rgba(179, 163, 232, 0.18) 100%
        );
        outline: none;
        cursor: pointer;
        transition: height 0.15s ease;
    }
    .mp-seek:hover { height: 6px; }
    .mp-seek::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px; height: 14px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #ff7eb0;
        box-shadow: 0 2px 6px rgba(217, 79, 134, 0.35);
        cursor: pointer;
    }
    .mp-seek::-moz-range-thumb {
        width: 14px; height: 14px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #ff7eb0;
        box-shadow: 0 2px 6px rgba(217, 79, 134, 0.35);
        cursor: pointer;
    }
    .mp-time {
        margin-top: 8px;
        display: flex; justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: #9e8ec0;
        letter-spacing: 0.04em;
    }

    .mp-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-top: 4px;
    }
    .mp-btn {
        appearance: none;
        width: 36px; height: 36px;
        border: 1px solid rgba(122, 104, 184, 0.14);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        color: #7a68b8;
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        transition: transform 160ms, background 160ms;
        font-size: 14px;
        padding: 0;
    }
    .mp-btn:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.9); }
    .mp-btn:active { transform: translateY(0); }
    .mp-play {
        width: 44px; height: 44px;
        background: linear-gradient(135deg, #ff7eb0 0%, #b3a3e8 60%, #6fc7ff 100%);
        color: #fff;
        border: 0;
        box-shadow: 0 6px 16px -4px rgba(217, 79, 134, 0.5), inset 0 1px 0 rgba(255,255,255,0.4);
        font-size: 15px;
    }
    .mp-play:hover { transform: translateY(-2px) scale(1.05); }

    .mp-volume {
        flex: 1;
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        border-radius: 999px;
        background: rgba(179, 163, 232, 0.18);
        outline: none;
        cursor: pointer;
        max-width: 100px;
        margin-left: 4px;
    }
    .mp-volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px; height: 12px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #b3a3e8;
        cursor: pointer;
    }
    .mp-volume::-moz-range-thumb {
        width: 12px; height: 12px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #b3a3e8;
        cursor: pointer;
    }

    .mp-empty {
        font-family: 'Quicksand', sans-serif;
        font-size: 0.85rem;
        color: #9e8ec0;
        text-align: center;
        padding: 8px 0 2px;
    }

    @media (max-width: 480px) {
        .mp-card { right: 12px; left: 12px; width: auto; bottom: 88px; }
        .mp-fab  { right: 16px; bottom: 16px; }
    }
</style>

<div class="mp-card" id="mp-card" role="dialog" aria-label="Trình phát nhạc">
    <?php if ($tracks === []): ?>
        <div class="mp-empty">🎵 Chưa có file nhạc nào trong thư mục <code>audio/</code></div>
    <?php else: ?>
        <div class="mp-head">
            <div class="mp-disc" id="mp-disc"></div>
            <div class="mp-meta">
                <div class="mp-eyebrow">NOW PLAYING · COSMODYSSEY</div>
                <div class="mp-title" id="mp-title">—</div>
                <div class="mp-artist" id="mp-artist">Frost &amp; Petal · OST</div>
            </div>
            <button type="button" class="mp-x" id="mp-close" aria-label="Đóng">×</button>
        </div>

        <div class="mp-progress">
            <input type="range" class="mp-seek" id="mp-seek" min="0" max="1000" step="1" value="0" title="Tua nhạc">
            <div class="mp-time">
                <span id="mp-time-cur">0:00</span>
                <span id="mp-time-dur">0:00</span>
            </div>
        </div>

        <div class="mp-controls">
            <button type="button" class="mp-btn" id="mp-prev" title="Bài trước" aria-label="Bài trước">⏮</button>
            <button type="button" class="mp-btn mp-play" id="mp-play" title="Phát / Tạm dừng" aria-label="Phát hoặc tạm dừng">▶</button>
            <button type="button" class="mp-btn" id="mp-next" title="Bài sau" aria-label="Bài sau">⏭</button>
            <input type="range" class="mp-volume" id="mp-volume" min="0" max="1" step="0.05" value="0.5" title="Âm lượng" aria-label="Âm lượng">
        </div>
    <?php endif; ?>
</div>

<button type="button" class="mp-fab" id="mp-fab" data-playing="false" aria-label="Trình phát nhạc">
    <span class="mp-fab-ring"></span>
    <span id="mp-fab-inner">🎵</span>
</button>

<?php if ($tracks !== []): ?>
<script>
(() => {
    const tracks = <?= json_encode($tracks, JSON_UNESCAPED_UNICODE) ?>;
    const STORAGE_KEY = 'merchMusicState';

    const audio   = new Audio();
    audio.preload = 'metadata';

    const fab      = document.getElementById('mp-fab');
    const fabInner = document.getElementById('mp-fab-inner');
    const card     = document.getElementById('mp-card');
    const closeBtn = document.getElementById('mp-close');
    const playBtn  = document.getElementById('mp-play');
    const prevBtn  = document.getElementById('mp-prev');
    const nextBtn  = document.getElementById('mp-next');
    const volume   = document.getElementById('mp-volume');
    const seek     = document.getElementById('mp-seek');
    const titleEl  = document.getElementById('mp-title');
    const timeCur  = document.getElementById('mp-time-cur');
    const timeDur  = document.getElementById('mp-time-dur');
    const disc     = document.getElementById('mp-disc');

    const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
    let index     = Math.min(state.index ?? 0, tracks.length - 1);
    let playing   = state.playing ?? true;
    let isSeeking = false;

    audio.volume = state.volume ?? 0.5;
    volume.value = audio.volume;

    const persist = () => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            index,
            playing,
            volume:      audio.volume,
            currentTime: audio.currentTime,
        }));
    };

    const fmt = (s) => {
        if (!Number.isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const loadTrack = (resumeAt = 0) => {
        const track = tracks[index];
        audio.src = track.src;
        titleEl.textContent = track.title;
        audio.addEventListener('loadedmetadata', () => {
            if (resumeAt > 0 && resumeAt < audio.duration) audio.currentTime = resumeAt;
            timeDur.textContent = fmt(audio.duration);
        }, { once: true });
    };

    const FAB_ICON_PLAY = '🎵';
    const FAB_ICON_EQ   = `<span class="mp-fab-eq" aria-hidden="true"><span></span><span></span><span></span></span>`;

    const renderState = () => {
        playBtn.textContent = playing ? '⏸' : '▶';
        fab.setAttribute('data-playing', playing ? 'true' : 'false');
        fabInner.innerHTML = playing ? FAB_ICON_EQ : FAB_ICON_PLAY;
        disc.classList.toggle('paused', !playing);
    };

    const play = async () => {
        try { await audio.play(); playing = true; }
        catch { playing = false; }
        renderState();
        persist();
    };
    const pause = () => {
        audio.pause();
        playing = false;
        renderState();
        persist();
    };

    playBtn.addEventListener('click', () => (playing ? pause() : play()));
    prevBtn.addEventListener('click', () => {
        index = (index - 1 + tracks.length) % tracks.length;
        loadTrack();
        if (playing) play(); else persist();
    });
    nextBtn.addEventListener('click', () => {
        index = (index + 1) % tracks.length;
        loadTrack();
        if (playing) play(); else persist();
    });
    volume.addEventListener('input', () => {
        audio.volume = Number(volume.value);
        persist();
    });

    seek.addEventListener('input', () => {
        isSeeking = true;
        seek.style.setProperty('--mp-progress', `${(seek.value / 1000) * 100}%`);
    });
    seek.addEventListener('change', () => {
        if (Number.isFinite(audio.duration)) {
            audio.currentTime = (seek.value / 1000) * audio.duration;
        }
        isSeeking = false;
        persist();
    });

    audio.addEventListener('ended', () => {
        index = (index + 1) % tracks.length;
        loadTrack();
        play();
    });
    audio.addEventListener('timeupdate', () => {
        timeCur.textContent = fmt(audio.currentTime);
        timeDur.textContent = fmt(audio.duration);
        if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
            const pct = (audio.currentTime / audio.duration) * 1000;
            seek.value = pct;
            seek.style.setProperty('--mp-progress', `${pct / 10}%`);
        }
        if (Math.floor(audio.currentTime) % 5 === 0) persist();
    });

    fab.addEventListener('click', () => card.classList.toggle('open'));
    closeBtn.addEventListener('click', () => card.classList.remove('open'));

    loadTrack(state.currentTime ?? 0);
    renderState();

    // Auto-play on page load. Browsers may block until first user interaction —
    // in that case, attach one-shot listeners that try again on first input.
    const tryAutoplay = () => {
        audio.play().then(() => {
            playing = true;
            renderState();
            persist();
        }).catch(() => {
            const events = ['click', 'keydown', 'touchstart', 'scroll'];
            const resume = () => {
                events.forEach(e => document.removeEventListener(e, resume));
                play();
            };
            events.forEach(e => document.addEventListener(e, resume, { once: true, passive: true }));
        });
    };
    tryAutoplay();
})();
</script>
<?php endif; ?>
