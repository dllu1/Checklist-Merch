<?php declare(strict_types=1); ?>
<style>
    /* ===== Background picker — Frost & Petal ===== */
    .bg-fab {
        position: fixed;
        left: 22px;
        bottom: 22px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 0;
        background: linear-gradient(135deg, #b3a3e8 0%, #6fc7ff 60%, #7fcfff 100%);
        color: #fff;
        cursor: pointer;
        z-index: 80;
        display: inline-flex; align-items: center; justify-content: center;
        box-shadow:
            0 10px 26px -10px rgba(80, 60, 130, 0.5),
            0 4px 12px -4px rgba(58, 143, 212, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        transition: transform 240ms cubic-bezier(.2,.8,.2,1);
        font-size: 18px;
    }
    .bg-fab:hover { transform: scale(1.06); }
    .bg-fab:active { transform: scale(0.95); }
    .bg-fab-ring {
        position: absolute; inset: -5px;
        border: 1.5px dashed rgba(111, 199, 255, 0.55);
        border-radius: 50%;
        opacity: 0.7;
        animation: bg-fab-spin 22s linear infinite;
        pointer-events: none;
    }
    @keyframes bg-fab-spin { to { transform: rotate(360deg); } }

    .bg-card {
        position: fixed;
        left: 22px;
        bottom: 84px;
        width: 320px;
        max-height: 70vh;
        z-index: 81;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(122, 104, 184, 0.14);
        border-radius: 22px;
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        box-shadow:
            0 22px 60px -22px rgba(80, 60, 130, 0.4),
            0 6px 20px -8px rgba(58, 143, 212, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        padding: 16px;
        transform-origin: bottom left;
        transform: scale(0.9) translateY(12px);
        opacity: 0;
        pointer-events: none;
        transition: transform 280ms cubic-bezier(.2, 1.2, .3, 1), opacity 220ms;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-family: 'Inter', sans-serif;
    }
    .bg-card.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
    }
    .bg-card::before {
        content: '';
        position: absolute; inset: 0;
        border-radius: 22px;
        padding: 1px;
        background: linear-gradient(135deg, rgba(111, 199, 255, 0.55), rgba(179, 163, 232, 0.3) 50%, rgba(255, 126, 176, 0.55));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
                mask-composite: exclude;
        pointer-events: none;
    }

    .bg-head {
        display: flex; align-items: center; justify-content: space-between;
        padding-bottom: 8px;
        border-bottom: 1px dashed rgba(122, 104, 184, 0.14);
    }
    .bg-head h4 {
        font-family: 'Quicksand', sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: #3a2a55;
        margin: 0;
        display: flex; align-items: center; gap: 8px;
    }
    .bg-head h4::before {
        content: '🎬';
        font-size: 13px;
    }
    .bg-close {
        appearance: none;
        width: 24px; height: 24px;
        border: 0;
        border-radius: 50%;
        background: rgba(111, 199, 255, 0.15);
        color: #3a8fd4;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
        display: inline-flex; align-items: center; justify-content: center;
    }
    .bg-close:hover { background: rgba(111, 199, 255, 0.28); }

    .bg-list {
        display: flex; flex-direction: column;
        gap: 8px;
        overflow-y: auto;
        max-height: 360px;
        scrollbar-width: thin;
        scrollbar-color: rgba(179, 163, 232, 0.4) transparent;
        padding-right: 2px;
    }
    .bg-list::-webkit-scrollbar { width: 6px; }
    .bg-list::-webkit-scrollbar-thumb { background: rgba(179, 163, 232, 0.4); border-radius: 4px; }

    .bg-item {
        display: grid;
        grid-template-columns: 64px 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 8px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.55);
        border: 1px solid rgba(122, 104, 184, 0.14);
        transition: background 180ms, border-color 180ms;
    }
    .bg-item[data-active="true"] {
        background: linear-gradient(135deg, rgba(111, 199, 255, 0.18), rgba(255, 126, 176, 0.18));
        border-color: rgba(111, 199, 255, 0.4);
    }
    .bg-preview {
        width: 64px; height: 40px;
        border-radius: 10px;
        overflow: hidden;
        background: linear-gradient(135deg, #ffd0e0, #cfe9ff);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        position: relative;
    }
    .bg-preview video,
    .bg-preview img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
    }
    .bg-preview-default {
        font-size: 14px;
        letter-spacing: 0.04em;
        color: #7a68b8;
        text-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
    }
    .bg-info { min-width: 0; }
    .bg-name {
        font-family: 'Quicksand', sans-serif;
        font-weight: 600;
        font-size: 12.5px;
        color: #3a2a55;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .bg-sub {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        color: #9e8ec0;
        letter-spacing: 0.04em;
        margin-top: 2px;
        text-transform: uppercase;
    }
    .bg-actions { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .bg-select {
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 5px 11px;
        font-family: 'Quicksand', sans-serif;
        font-weight: 700;
        font-size: 11px;
        cursor: pointer;
        background: linear-gradient(135deg, #b3a3e8, #6fc7ff);
        color: #fff;
        box-shadow: 0 3px 8px -3px rgba(58, 143, 212, 0.4);
        white-space: nowrap;
    }
    .bg-item[data-active="true"] .bg-select {
        background: rgba(255, 255, 255, 0.6);
        color: #3a8fd4;
        cursor: default;
        box-shadow: none;
    }
    .bg-delete {
        appearance: none;
        border: 0;
        background: transparent;
        color: #d94f86;
        cursor: pointer;
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        opacity: 0.6;
        padding: 2px 6px;
        transition: opacity 160ms;
    }
    .bg-delete:hover { opacity: 1; text-decoration: underline; }

    .bg-upload {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .bg-upload-btn {
        appearance: none;
        width: 100%;
        border: 1.5px dashed rgba(111, 199, 255, 0.45);
        background: linear-gradient(135deg, rgba(220, 240, 255, 0.4), rgba(232, 244, 255, 0.4));
        color: #3a8fd4;
        font-family: 'Quicksand', sans-serif;
        font-weight: 600;
        font-size: 12.5px;
        padding: 10px 14px;
        border-radius: 14px;
        cursor: pointer;
        transition: all 200ms;
    }
    .bg-upload-btn:hover {
        border-color: #6fc7ff;
        background: linear-gradient(135deg, rgba(200, 230, 255, 0.7), rgba(220, 240, 255, 0.7));
    }
    .bg-upload-hint {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        color: #9e8ec0;
        letter-spacing: 0.04em;
        text-align: center;
    }
    .bg-empty {
        text-align: center;
        padding: 12px 8px;
        color: #9e8ec0;
        font-family: 'Quicksand', sans-serif;
        font-size: 12px;
    }

    /* ===== Custom background media (video/gif applied to .bg-wrap) ===== */
    .bg-media {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 0;
    }
    .bg-media video,
    .bg-media img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
    }
    .bg-media::after {
        content: '';
        position: absolute; inset: 0;
        background:
            radial-gradient(ellipse 70% 60% at 20% 10%, rgba(255, 224, 235, 0.45) 0%, transparent 60%),
            radial-gradient(ellipse 60% 55% at 85% 15%, rgba(217, 232, 255, 0.45) 0%, transparent 60%),
            rgba(255, 247, 250, 0.4);
        pointer-events: none;
    }
    /* When a custom bg is active, fade sparkles to keep things readable */
    .bg-wrap.has-media .bg-grid,
    .bg-wrap.has-media .bg-stars { opacity: 0.35; }

    @media (max-width: 480px) {
        .bg-card { left: 12px; right: 12px; width: auto; }
        .bg-fab  { left: 16px; bottom: 16px; }
    }
</style>

<div class="bg-card" id="bg-card" role="dialog" aria-label="Chọn hình nền động">
    <header class="bg-head">
        <h4>Hình nền động</h4>
        <button type="button" class="bg-close" id="bg-close" aria-label="Đóng">✕</button>
    </header>
    <div class="bg-list" id="bg-list">
        <div class="bg-empty">Đang tải…</div>
    </div>
    <div class="bg-upload">
        <button type="button" class="bg-upload-btn" id="bg-upload-btn">+ Thêm hình nền (MP4 · WebM · GIF)</button>
        <div class="bg-upload-hint">Tối đa 50 MB · File được lưu vào <code>video/</code></div>
        <input type="file" id="bg-file-input" accept="video/mp4,video/webm,image/gif" hidden>
    </div>
</div>

<button type="button" class="bg-fab" id="bg-fab" aria-label="Chọn hình nền động">
    <span class="bg-fab-ring"></span>
    🎬
</button>

<script>
(() => {
    const STORAGE_KEY = 'merchBackground'; // value: 'default' or filename like 'foo.mp4'

    const fab        = document.getElementById('bg-fab');
    const card       = document.getElementById('bg-card');
    const closeBtn   = document.getElementById('bg-close');
    const list       = document.getElementById('bg-list');
    const uploadBtn  = document.getElementById('bg-upload-btn');
    const fileInput  = document.getElementById('bg-file-input');

    let backgrounds = [];

    const getSelected = () => localStorage.getItem(STORAGE_KEY) || 'default';
    const setSelected = (v) => localStorage.setItem(STORAGE_KEY, v);

    // Infer type from file extension (so we can apply bg before the list API resolves)
    const inferType = (filename) => {
        const ext = (filename.split('.').pop() || '').toLowerCase();
        return ext === 'gif' ? 'image' : 'video';
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };

    fab.addEventListener('click', () => card.classList.toggle('open'));
    closeBtn.addEventListener('click', () => card.classList.remove('open'));

    function renderList() {
        const selected = getSelected();
        const items = [
            { name: 'default', label: 'Mặc định · Sparkle', sub: 'SVG ANIMATION', isDefault: true },
            ...backgrounds.map(b => ({
                name: b.name,
                url: b.url,
                type: b.type,
                size: b.size,
                label: b.name,
                sub: b.type.toUpperCase() + ' · ' + formatSize(b.size),
                isDefault: false,
            })),
        ];

        list.innerHTML = items.map(item => {
            const isActive = item.name === selected;
            let preview;
            if (item.isDefault) {
                preview = '<div class="bg-preview-default">✦ ❄ ✿</div>';
            } else if (item.type === 'video') {
                preview = `<video src="${item.url}" muted playsinline preload="metadata"></video>`;
            } else {
                preview = `<img src="${item.url}" alt="">`;
            }
            const deleteBtn = item.isDefault ? '' : `<button class="bg-delete" data-action="delete" data-name="${item.name}">Xoá</button>`;
            return `
                <div class="bg-item" data-name="${item.name}" data-active="${isActive ? 'true' : 'false'}">
                    <div class="bg-preview">${preview}</div>
                    <div class="bg-info">
                        <div class="bg-name">${item.label}</div>
                        <div class="bg-sub">${item.sub}</div>
                    </div>
                    <div class="bg-actions">
                        <button class="bg-select" data-action="select" data-name="${item.name}" ${isActive ? 'disabled' : ''}>
                            ${isActive ? '✓ Đang dùng' : 'Chọn'}
                        </button>
                        ${deleteBtn}
                    </div>
                </div>
            `;
        }).join('');
    }

    list.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const name = btn.dataset.name;
        const action = btn.dataset.action;

        if (action === 'select') {
            setSelected(name);
            applyBackground();
            renderList();
        } else if (action === 'delete') {
            if (!confirm(`Xoá file "${name}"? File sẽ bị xoá khỏi thư mục video/.`)) return;
            try {
                const r = await fetch('api_delete_background.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                });
                const d = await r.json();
                if (d.status === 'success') {
                    backgrounds = backgrounds.filter(b => b.name !== name);
                    // If the deleted one was active, fall back to default
                    if (getSelected() === name) {
                        setSelected('default');
                        applyBackground();
                    }
                    renderList();
                } else {
                    alert('Lỗi: ' + (d.message || 'không xoá được'));
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi khi xoá file.');
            }
        }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const data = new FormData();
        data.append('bg', f);

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Đang tải lên…';
        try {
            const r = await fetch('api_upload_background.php', { method: 'POST', body: data });
            const d = await r.json();
            if (d.status === 'success') {
                backgrounds.push(d.bg);
                setSelected(d.bg.name);
                applyBackground();
                renderList();
            } else {
                alert('Lỗi: ' + (d.message || 'không upload được'));
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi khi upload file.');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '+ Thêm hình nền (MP4 · WebM · GIF)';
            fileInput.value = '';
        }
    });

    function applyBackground() {
        const selected = getSelected();
        const wrap = document.querySelector('.bg-wrap');
        if (!wrap) return;

        // Remove existing custom media
        wrap.querySelectorAll('.bg-media').forEach(el => el.remove());

        if (selected === 'default') {
            wrap.classList.remove('has-media');
            return;
        }

        const type = inferType(selected);
        const url  = 'video/' + encodeURIComponent(selected);

        const media = document.createElement('div');
        media.className = 'bg-media';
        media.innerHTML = type === 'video'
            ? `<video src="${url}" autoplay muted loop playsinline></video>`
            : `<img src="${url}" alt="">`;
        wrap.prepend(media);
        wrap.classList.add('has-media');
    }

    async function loadList() {
        try {
            const r = await fetch('api_list_backgrounds.php');
            const d = await r.json();
            if (d.status === 'success') {
                backgrounds = d.backgrounds;
                renderList();
            } else {
                list.innerHTML = '<div class="bg-empty">Lỗi khi tải danh sách.</div>';
            }
        } catch (e) {
            console.error(e);
            list.innerHTML = '<div class="bg-empty">Lỗi mạng.</div>';
        }
    }

    // Apply chosen bg immediately (before list resolves, to minimize flash)
    applyBackground();
    loadList();
})();
</script>
