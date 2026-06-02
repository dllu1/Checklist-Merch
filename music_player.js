import {
    SUPABASE_CONFIGURED,
    getSignedUrl,
    escapeHtml,
    fetchAudioTracks,
    uploadAudioFileToStorage,
    deleteAudioTrack,
} from './supabase_client.js';
import {
    AUDIO_FILE_RULES,
    validateFile,
    buildStoragePath,
} from './storage_files.js';

const AUDIO_BUCKET = 'audio';
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'mp4', 'aac', 'ogg', 'oga', 'opus', 'wav', 'webm', 'flac'];
const AUDIO_UPLOAD_FOLDER = 'tracks';
const RESUMABLE_UPLOAD_HINT_SIZE = 6 * 1024 * 1024;

const audio = new Audio();
audio.preload = 'metadata';

const fab = document.getElementById('mp-fab');
const card = document.getElementById('mp-card');
const closeBtn = document.getElementById('mp-close');
const playBtn = document.getElementById('mp-play');
const prevBtn = document.getElementById('mp-prev');
const nextBtn = document.getElementById('mp-next');
const shuffleBtn = document.getElementById('mp-shuffle');
const loopBtn = document.getElementById('mp-loop');
const volume = document.getElementById('mp-volume');
const seek = document.getElementById('mp-seek');
const titleEl = document.getElementById('mp-title');
const artistEl = document.getElementById('mp-artist');
const timeCur = document.getElementById('mp-time-cur');
const timeDur = document.getElementById('mp-time-dur');
const disc = document.getElementById('mp-disc');
const playlistList = document.getElementById('mp-playlist-list');
const playlistCount = document.getElementById('mp-playlist-count');
const uploadBtn = document.getElementById('mp-upload-btn');
const uploadInput = document.getElementById('mp-upload-input');
const uploadStatus = document.getElementById('mp-upload-status');

const LOOP_MODES = ['off', 'all', 'one'];
const LOOP_LABELS = { off: 'Loop tắt', all: 'Loop danh sách', one: 'Loop bài này' };
const STATE_KEY = 'mp_state_v1';
const SAVE_DEBOUNCE_MS = 1500;
const STATE_TTL_MS = 24 * 60 * 60 * 1000;

let tracks = [];
let index = 0;
let playing = false;
let isSeeking = false;
let shuffle = false;
let loopMode = 'off';
let initialState = null;
let saveTimer = null;

function loadState() {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || (parsed.ts && Date.now() - parsed.ts > STATE_TTL_MS)) return null;
        return parsed;
    } catch {
        return null;
    }
}

function saveStateNow() {
    try {
        const state = {
            path: tracks[index]?.path || null,
            time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
            volume: audio.volume,
            playing,
            shuffle,
            loopMode,
            ts: Date.now(),
        };
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
        /* localStorage may be full or disabled */
    }
}

function saveStateDebounced() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveStateNow, SAVE_DEBOUNCE_MS);
}

initialState = loadState();
if (initialState) {
    if (typeof initialState.volume === 'number') volume.value = String(initialState.volume);
    if (typeof initialState.shuffle === 'boolean') shuffle = initialState.shuffle;
    if (typeof initialState.loopMode === 'string' && LOOP_MODES.includes(initialState.loopMode)) {
        loopMode = initialState.loopMode;
    }
}

audio.volume = Number(volume.value || 0.5);
updateRangeFill(volume);
updateRangeFill(seek);

function fmt(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function trackTitle(name) {
    return name
        .replace(/\.[^.]+$/, '')
        .replace(/^[a-f0-9]{6,}__/i, '')
        .replace(/\s*\[[A-Za-z0-9_-]+\]\s*$/, '')
        .trim();
}

function setPlaying(next) {
    playing = next;
    playBtn.textContent = playing ? 'II' : '▶';
    fab.setAttribute('data-playing', playing ? 'true' : 'false');
    disc.classList.toggle('paused', !playing);
}

function updateRangeFill(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || 0);
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    input.style.setProperty('--mp-fill', `${Math.max(0, Math.min(100, pct))}%`);
}

function renderPlaylist() {
    playlistCount.textContent = `${tracks.length} bài`;
    if (tracks.length === 0) {
        playlistList.innerHTML = '<div class="mp-empty">Chưa có file nhạc trong bucket audio.</div>';
        titleEl.textContent = 'Chưa có nhạc';
        artistEl.textContent = 'Thêm file nhạc vào Cloudflare R2 audio';
        [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = true; });
        return;
    }

    [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = false; });
    playlistList.innerHTML = tracks.map((track, i) => `
        <div class="mp-playlist-item${i === index ? ' active' : ''}">
            <button type="button" class="mp-track-select" data-index="${i}" title="Phát">
                <span class="mp-track-name">${escapeHtml(track.title)}</span>
                <span class="mp-track-action">${i === index ? 'Đang chọn' : 'Phát'}</span>
            </button>
            <button type="button" class="mp-track-delete" data-index="${i}" title="Xóa khỏi storage" aria-label="Xóa ${escapeHtml(track.title)}">×</button>
        </div>
    `).join('');
}

function setUploadStatus(message = '', tone = '') {
    if (!uploadStatus) return;
    uploadStatus.textContent = message;
    uploadStatus.dataset.tone = tone;
}

async function loadTrack(resumeAt = 0) {
    const track = tracks[index];
    if (!track) return;

    audio.src = await getSignedUrl(AUDIO_BUCKET, track.path, 3600);
    titleEl.textContent = track.title;
    artistEl.textContent = 'Frost & Petal · Cloudflare R2 audio';
    seek.value = 0;
    updateRangeFill(seek);
    timeCur.textContent = '0:00';
    timeDur.textContent = '0:00';
    audio.addEventListener('loadedmetadata', () => {
        if (resumeAt > 0 && resumeAt < audio.duration) audio.currentTime = resumeAt;
        timeDur.textContent = fmt(audio.duration);
    }, { once: true });
    renderPlaylist();
}

async function play() {
    if (tracks.length === 0) return;
    try {
        await audio.play();
        setPlaying(true);
        saveStateNow();
    } catch (error) {
        setPlaying(false);
    }
}

function pause() {
    audio.pause();
    setPlaying(false);
    saveStateNow();
}

async function listAudio(prefix = '') {
    const files = await fetchAudioTracks();
    return files.filter(file => AUDIO_EXTENSIONS.includes((file.path.split('.').pop() || '').toLowerCase()));
}

async function refreshAudioLibrary(selectedPath = '') {
    tracks = await listAudio();
    let resumeAt = 0;
    if (selectedPath) {
        const nextIndex = tracks.findIndex(track => track.path === selectedPath);
        index = nextIndex >= 0 ? nextIndex : 0;
    } else if (initialState?.path) {
        const savedIndex = tracks.findIndex(track => track.path === initialState.path);
        if (savedIndex >= 0) {
            index = savedIndex;
            resumeAt = Number(initialState.time) || 0;
        } else {
            index = Math.min(index, Math.max(tracks.length - 1, 0));
        }
    } else {
        index = Math.min(index, Math.max(tracks.length - 1, 0));
    }

    renderPlaylist();
    if (tracks.length > 0) await loadTrack(resumeAt);
}

async function uploadAudioFile(file) {
    const validated = await validateFile(file, AUDIO_FILE_RULES);
    const path = buildStoragePath(file, AUDIO_UPLOAD_FOLDER, validated.extension, { preserveName: true });

    if (file.size > RESUMABLE_UPLOAD_HINT_SIZE) {
        setUploadStatus('Large file, upload may take a bit...', '');
    } else {
        setUploadStatus('Uploading audio...', '');
    }

    await uploadAudioFileToStorage(path, file, validated.metadata);

    await refreshAudioLibrary(path);
    setUploadStatus('Audio added.', 'success');
}

async function bootstrapMusic() {
    if (!SUPABASE_CONFIGURED) {
        playlistList.innerHTML = '<div class="mp-empty">Chưa cấu hình Cloudflare API.</div>';
        [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = true; });
        if (uploadBtn) uploadBtn.disabled = true;
        return;
    }

    await refreshAudioLibrary();

    if (initialState?.playing && tracks.length > 0 && initialState.path === tracks[index]?.path) {
        try {
            await audio.play();
            setPlaying(true);
        } catch {
            setPlaying(false);
        }
    }
}

function pickNextIndex(direction = 1) {
    if (tracks.length === 0) return 0;
    if (tracks.length === 1) return 0;
    if (shuffle) {
        let next = index;
        while (next === index) {
            next = Math.floor(Math.random() * tracks.length);
        }
        return next;
    }
    return (index + direction + tracks.length) % tracks.length;
}

function updateShuffleUI() {
    if (!shuffleBtn) return;
    shuffleBtn.classList.toggle('active', shuffle);
    shuffleBtn.setAttribute('aria-pressed', shuffle ? 'true' : 'false');
    shuffleBtn.title = shuffle ? 'Tắt shuffle' : 'Bật shuffle';
}

function updateLoopUI() {
    if (!loopBtn) return;
    loopBtn.dataset.mode = loopMode;
    loopBtn.classList.toggle('active', loopMode !== 'off');
    loopBtn.title = LOOP_LABELS[loopMode] || 'Loop';
    loopBtn.setAttribute('aria-label', LOOP_LABELS[loopMode] || 'Loop');
}

fab.addEventListener('click', () => card.classList.toggle('open'));
closeBtn.addEventListener('click', () => card.classList.remove('open'));
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !card.classList.contains('open')) return;
    const productModal = document.getElementById('product-modal');
    if (productModal && productModal.classList.contains('active')) return;
    card.classList.remove('open');
});
playBtn.addEventListener('click', () => (playing ? pause() : play()));
prevBtn.addEventListener('click', async () => {
    if (tracks.length === 0) return;
    index = pickNextIndex(-1);
    await loadTrack();
    if (playing) play();
});
nextBtn.addEventListener('click', async () => {
    if (tracks.length === 0) return;
    index = pickNextIndex(1);
    await loadTrack();
    if (playing) play();
});
shuffleBtn?.addEventListener('click', () => {
    shuffle = !shuffle;
    updateShuffleUI();
    saveStateNow();
});
loopBtn?.addEventListener('click', () => {
    const i = LOOP_MODES.indexOf(loopMode);
    loopMode = LOOP_MODES[(i + 1) % LOOP_MODES.length];
    updateLoopUI();
    saveStateNow();
});
uploadBtn?.addEventListener('click', () => uploadInput?.click());
uploadInput?.addEventListener('change', async () => {
    const file = uploadInput.files?.[0];
    if (!file) return;

    uploadBtn.disabled = true;
    try {
        await uploadAudioFile(file);
    } catch (error) {
        console.error('Audio upload failed:', error);
        setUploadStatus(error.message || 'Upload failed.', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadInput.value = '';
    }
});
volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    updateRangeFill(volume);
    saveStateDebounced();
});
seek.addEventListener('input', () => {
    isSeeking = true;
    updateRangeFill(seek);
});
seek.addEventListener('change', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    isSeeking = false;
    updateRangeFill(seek);
    saveStateNow();
});
async function deleteTrackAt(targetIndex) {
    const track = tracks[targetIndex];
    if (!track) return;
    if (!confirm(`Xóa "${track.title}" khỏi storage? Hành động này không thể hoàn tác.`)) return;

    setUploadStatus(`Đang xóa "${track.title}"...`, '');
    try {
        await deleteAudioTrack(track.path);

        const wasCurrent = targetIndex === index;
        if (wasCurrent) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            setPlaying(false);
        }
        if (targetIndex < index) index -= 1;

        await refreshAudioLibrary();
        setUploadStatus(`Đã xóa "${track.title}".`, 'success');
    } catch (error) {
        console.error('Delete failed:', error);
        setUploadStatus(error.message || 'Xóa thất bại.', 'error');
    }
}

playlistList.addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('.mp-track-delete');
    if (deleteBtn) {
        event.stopPropagation();
        await deleteTrackAt(Number(deleteBtn.dataset.index || 0));
        return;
    }
    const selectBtn = event.target.closest('.mp-track-select');
    if (!selectBtn) return;
    index = Number(selectBtn.dataset.index || 0);
    await loadTrack();
    play();
    saveStateNow();
});
audio.addEventListener('timeupdate', () => {
    timeCur.textContent = fmt(audio.currentTime);
    timeDur.textContent = fmt(audio.duration);
    saveStateDebounced();
    if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
        seek.value = String((audio.currentTime / audio.duration) * 1000);
        updateRangeFill(seek);
    }
});
audio.addEventListener('ended', async () => {
    if (tracks.length === 0) return;
    if (loopMode === 'one') {
        audio.currentTime = 0;
        play();
        return;
    }
    const nextIdx = pickNextIndex(1);
    const wrappedToStart = !shuffle && nextIdx === 0 && index === tracks.length - 1;
    if (wrappedToStart && loopMode === 'off') {
        index = nextIdx;
        await loadTrack();
        setPlaying(false);
        return;
    }
    index = nextIdx;
    await loadTrack();
    play();
});

updateShuffleUI();
updateLoopUI();

window.addEventListener('pagehide', saveStateNow);
window.addEventListener('beforeunload', saveStateNow);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveStateNow();
});

bootstrapMusic().catch(error => {
    console.error('Lỗi tải nhạc:', error);
    playlistList.innerHTML = `<div class="mp-empty">${escapeHtml(error.message)}</div>`;
});
