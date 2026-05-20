<?php declare(strict_types=1); ?>
<style>
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-shadow: 0 12px 30px -10px rgba(217, 79, 134, 0.55), 0 4px 12px -4px rgba(80, 60, 130, 0.4);
        transition: transform 240ms cubic-bezier(.2,.8,.2,1);
        font-family: 'Quicksand', sans-serif;
    }
    .mp-fab:hover { transform: scale(1.05); }
    .mp-fab-viz {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 22px;
    }
    .mp-fab-viz span {
        display: block;
        width: 5px;
        min-height: 9px;
        border-radius: 999px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(80, 60, 130, 0.16);
        transform-origin: center bottom;
    }
    .mp-fab-viz span:nth-child(1) { height: 12px; }
    .mp-fab-viz span:nth-child(2) { height: 18px; }
    .mp-fab-viz span:nth-child(3) { height: 14px; }
    .mp-fab[data-playing="true"] .mp-fab-viz span {
        animation: mp-viz 820ms ease-in-out infinite;
    }
    .mp-fab[data-playing="true"] .mp-fab-viz span:nth-child(2) { animation-delay: 120ms; }
    .mp-fab[data-playing="true"] .mp-fab-viz span:nth-child(3) { animation-delay: 240ms; }
    .mp-fab-ring {
        position: absolute;
        inset: -6px;
        border: 1.5px dashed rgba(255, 126, 176, 0.55);
        border-radius: 50%;
        opacity: 0.7;
        animation: mp-spin 18s linear infinite;
        pointer-events: none;
    }
    .mp-fab[data-playing="true"]::after {
        content: '';
        position: absolute;
        inset: -12px;
        border-radius: 50%;
        border: 2px solid rgba(255, 126, 176, 0.35);
        animation: mp-pulse 2s ease-out infinite;
        pointer-events: none;
    }
    @keyframes mp-pulse {
        0% { transform: scale(0.85); opacity: 0.9; }
        100% { transform: scale(1.4); opacity: 0; }
    }
    @keyframes mp-spin { to { transform: rotate(360deg); } }
    @keyframes mp-viz {
        0%, 100% { transform: scaleY(0.55); }
        50% { transform: scaleY(1.15); }
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
        box-shadow: 0 22px 60px -22px rgba(80, 60, 130, 0.4), 0 6px 20px -8px rgba(217, 79, 134, 0.2);
        padding: 18px;
        transform-origin: bottom right;
        transform: scale(0.9) translateY(12px);
        opacity: 0;
        pointer-events: none;
        transition: transform 280ms cubic-bezier(.2, 1.2, .3, 1), opacity 220ms;
        font-family: 'Inter', sans-serif;
    }
    .mp-card.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }
    .mp-head {
        display: grid;
        grid-template-columns: 56px 1fr auto;
        gap: 12px;
        align-items: center;
        padding-bottom: 12px;
        border-bottom: 1px dashed rgba(122, 104, 184, 0.14);
    }
    .mp-disc {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        animation: mp-spin 12s linear infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ff7eb0, #b3a3e8 50%, #6fc7ff);
        position: relative;
    }
    .mp-disc::before { content: '✿'; color: #fff; font-size: 22px; }
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
    .mp-artist { font-size: 11.5px; color: #6b5688; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mp-x {
        width: 26px;
        height: 26px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 126, 176, 0.12);
        color: #d94f86;
        cursor: pointer;
    }
    .mp-progress { padding: 14px 2px 8px; }
    .mp-seek,
    .mp-volume {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        height: 18px;
        border-radius: 999px;
        background: transparent;
        outline: none;
        cursor: pointer;
        --mp-fill: 0%;
        --mp-fill-color: #3a2a55;
        --mp-empty-color: rgba(179, 163, 232, 0.18);
    }
    .mp-seek::-webkit-slider-runnable-track,
    .mp-volume::-webkit-slider-runnable-track {
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(
            to right,
            var(--mp-fill-color) 0%,
            var(--mp-fill-color) var(--mp-fill),
            var(--mp-empty-color) var(--mp-fill),
            var(--mp-empty-color) 100%
        );
    }
    .mp-seek::-moz-range-track,
    .mp-volume::-moz-range-track {
        height: 4px;
        border-radius: 999px;
        background: var(--mp-empty-color);
    }
    .mp-seek::-moz-range-progress,
    .mp-volume::-moz-range-progress {
        height: 4px;
        border-radius: 999px;
        background: var(--mp-fill-color);
    }
    .mp-seek::-webkit-slider-thumb,
    .mp-volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        margin-top: -5px;
        border-radius: 50%;
        border: 3px solid #fff;
        background: linear-gradient(135deg, #ff7eb0, #6fc7ff);
        box-shadow: 0 3px 9px rgba(122, 104, 184, 0.28);
    }
    .mp-seek::-moz-range-thumb,
    .mp-volume::-moz-range-thumb {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 3px solid #fff;
        background: linear-gradient(135deg, #ff7eb0, #6fc7ff);
        box-shadow: 0 3px 9px rgba(122, 104, 184, 0.28);
    }
    .mp-time {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: #9e8ec0;
    }
    .mp-controls { display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 4px; }
    .mp-btn {
        width: 32px;
        height: 32px;
        border: 1px solid rgba(122, 104, 184, 0.14);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        color: #7a68b8;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        line-height: 1;
        transition: background 180ms, color 180ms, border-color 180ms;
    }
    .mp-btn.active {
        background: linear-gradient(135deg, rgba(255, 126, 176, 0.22), rgba(111, 199, 255, 0.22));
        border-color: rgba(255, 126, 176, 0.5);
        color: #d94f86;
        box-shadow: 0 2px 8px -2px rgba(217, 79, 134, 0.35);
    }
    .mp-btn svg { width: 14px; height: 14px; display: block; }
    .mp-btn[data-mode="one"]::after {
        content: '1';
        position: absolute;
        top: 2px;
        right: 3px;
        font-size: 8px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        line-height: 1;
        color: #d94f86;
    }
    .mp-btn { position: relative; }
    .mp-play {
        width: 42px;
        height: 42px;
        background: linear-gradient(135deg, #ff7eb0 0%, #b3a3e8 60%, #6fc7ff 100%);
        color: #fff;
        border: 0;
    }
    .mp-volume-row { display: flex; align-items: center; gap: 8px; padding-top: 8px; }
    .mp-playlist { margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(122, 104, 184, 0.14); }
    .mp-playlist-head { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .mp-playlist-title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.16em;
        color: #d94f86;
        text-transform: uppercase;
    }
    .mp-playlist-count { font-size: 11px; color: #9e8ec0; }
    .mp-playlist-list { display: grid; gap: 6px; max-height: 180px; overflow-y: auto; padding-right: 2px; }
    .mp-playlist-item {
        width: 100%;
        border: 1px solid rgba(122, 104, 184, 0.12);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.48);
        color: #3a2a55;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 4px;
        min-height: 36px;
        padding: 4px 4px 4px 0;
        overflow: hidden;
    }
    .mp-playlist-item.active {
        background: linear-gradient(135deg, rgba(255, 126, 176, 0.18), rgba(111, 199, 255, 0.16));
        border-color: rgba(255, 126, 176, 0.4);
        color: #d94f86;
    }
    .mp-track-select {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        width: 100%;
        min-width: 0;
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        text-align: left;
        padding: 4px 4px 4px 10px;
        font: inherit;
    }
    .mp-track-delete {
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        border: 1px solid rgba(122, 104, 184, 0.14);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        color: #9e8ec0;
        cursor: pointer;
        font-size: 15px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 160ms, color 160ms, border-color 160ms;
    }
    .mp-track-delete:hover {
        background: rgba(217, 79, 134, 0.12);
        border-color: rgba(217, 79, 134, 0.4);
        color: #d94f86;
    }
    .mp-track-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 600; }
    .mp-track-action { color: #9e8ec0; font-family: 'JetBrains Mono', monospace; font-size: 11px; white-space: nowrap; }
    .mp-empty { color: #9e8ec0; font-size: 12px; text-align: center; padding: 12px; }
    .mp-upload {
        display: grid;
        gap: 6px;
        margin-top: 10px;
    }
    .mp-upload-btn {
        width: 100%;
        min-height: 38px;
        border: 1px dashed rgba(255, 126, 176, 0.42);
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 126, 176, 0.12), rgba(111, 199, 255, 0.12));
        color: #d94f86;
        cursor: pointer;
        font-family: 'Quicksand', sans-serif;
        font-weight: 700;
    }
    .mp-upload-btn:hover {
        border-color: rgba(255, 126, 176, 0.72);
        background: linear-gradient(135deg, rgba(255, 126, 176, 0.18), rgba(111, 199, 255, 0.18));
    }
    .mp-upload-btn:disabled {
        cursor: wait;
        opacity: 0.62;
    }
    .mp-upload-status {
        min-height: 15px;
        color: #9e8ec0;
        font-size: 11px;
        text-align: center;
    }
    .mp-upload-status[data-tone="error"] { color: #d94f86; }
    .mp-upload-status[data-tone="success"] { color: #3a8f76; }
    @media (max-width: 480px) {
        .mp-card { right: 12px; left: 12px; width: auto; bottom: 88px; }
        .mp-fab { right: 16px; bottom: 16px; }
    }
</style>

<div class="mp-card" id="mp-card" role="dialog" aria-label="Trình phát nhạc">
    <div class="mp-head">
        <div class="mp-disc paused" id="mp-disc"></div>
        <div class="mp-meta">
            <div class="mp-eyebrow">NOW PLAYING · COSMODYSSEY</div>
            <div class="mp-title" id="mp-title">Đang tải thư viện...</div>
            <div class="mp-artist" id="mp-artist">Supabase Storage · audio</div>
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
        <button type="button" class="mp-btn" id="mp-shuffle" title="Bật shuffle" aria-label="Shuffle" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/>
                <line x1="15" y1="15" x2="21" y2="21"/>
                <line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
        </button>
        <button type="button" class="mp-btn" id="mp-prev" title="Bài trước" aria-label="Bài trước">⏮</button>
        <button type="button" class="mp-btn mp-play" id="mp-play" title="Phát / Tạm dừng" aria-label="Phát hoặc tạm dừng">▶</button>
        <button type="button" class="mp-btn" id="mp-next" title="Bài sau" aria-label="Bài sau">⏭</button>
        <button type="button" class="mp-btn" id="mp-loop" data-mode="off" title="Loop tắt" aria-label="Loop">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
        </button>
    </div>
    <div class="mp-volume-row">
        <span class="mp-volume-ic" aria-hidden="true">🔉</span>
        <input type="range" class="mp-volume" id="mp-volume" min="0" max="1" step="0.05" value="0.5" title="Âm lượng" aria-label="Âm lượng">
    </div>
    <div class="mp-playlist">
        <div class="mp-playlist-head">
            <span class="mp-playlist-title">Audio bucket</span>
            <span class="mp-playlist-count" id="mp-playlist-count">0 bài</span>
        </div>
        <div class="mp-playlist-list" id="mp-playlist-list">
            <div class="mp-empty">Đang tải danh sách nhạc...</div>
        </div>
        <div class="mp-upload">
            <button type="button" class="mp-upload-btn" id="mp-upload-btn">+ Thêm nhạc</button>
            <div class="mp-upload-status" id="mp-upload-status" aria-live="polite"></div>
            <input type="file" id="mp-upload-input" accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.wav" hidden>
        </div>
    </div>
</div>

<button type="button" class="mp-fab" id="mp-fab" data-playing="false" aria-label="Music player">
    <span class="mp-fab-ring"></span>
    <span class="mp-fab-viz" id="mp-fab-inner" aria-hidden="true">
        <span></span><span></span><span></span>
    </span>
</button>

<script type="module" src="music_player.js"></script>
