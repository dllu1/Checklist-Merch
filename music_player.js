import {
    SUPABASE_CONFIGURED,
    supabase,
    getSignedUrl,
    escapeHtml,
} from './supabase_client.js';
import {
    AUDIO_FILE_RULES,
    validateFile,
    buildStoragePath,
    uploadBlob,
} from './storage_files.js';

const AUDIO_BUCKET = 'audio';
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'ogg', 'wav'];
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

let tracks = [];
let index = 0;
let playing = false;
let isSeeking = false;
let shuffle = false;
let loopMode = 'off';

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
        artistEl.textContent = 'Thêm file nhạc vào Supabase Storage bucket audio';
        [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = true; });
        return;
    }

    [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = false; });
    playlistList.innerHTML = tracks.map((track, i) => `
        <button type="button" class="mp-playlist-item${i === index ? ' active' : ''}" data-index="${i}">
            <span class="mp-track-name">${escapeHtml(track.title)}</span>
            <span class="mp-track-action">${i === index ? 'Đang chọn' : 'Phát'}</span>
        </button>
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
    artistEl.textContent = 'Frost & Petal · Supabase audio';
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
    } catch (error) {
        setPlaying(false);
    }
}

function pause() {
    audio.pause();
    setPlaying(false);
}

async function listAudio(prefix = '') {
    const { data, error } = await supabase.storage.from(AUDIO_BUCKET).list(prefix, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;

    const files = [];
    for (const item of data || []) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
            files.push(...await listAudio(path));
            continue;
        }
        const ext = (item.name.split('.').pop() || '').toLowerCase();
        if (AUDIO_EXTENSIONS.includes(ext)) {
            files.push({ path, title: trackTitle(item.name) });
        }
    }
    return files;
}

async function refreshAudioLibrary(selectedPath = '') {
    tracks = await listAudio();
    if (selectedPath) {
        const nextIndex = tracks.findIndex(track => track.path === selectedPath);
        index = nextIndex >= 0 ? nextIndex : 0;
    } else {
        index = Math.min(index, Math.max(tracks.length - 1, 0));
    }

    renderPlaylist();
    if (tracks.length > 0) await loadTrack();
}

async function uploadAudioFile(file) {
    const validated = await validateFile(file, AUDIO_FILE_RULES);
    const path = buildStoragePath(file, AUDIO_UPLOAD_FOLDER, validated.extension, { preserveName: true });

    if (file.size > RESUMABLE_UPLOAD_HINT_SIZE) {
        setUploadStatus('Large file, upload may take a bit...', '');
    } else {
        setUploadStatus('Uploading audio...', '');
    }

    await uploadBlob(supabase.storage, AUDIO_BUCKET, path, file, {
        contentType: validated.contentType,
        metadata: validated.metadata,
    });

    await refreshAudioLibrary(path);
    setUploadStatus('Audio added.', 'success');
}

async function bootstrapMusic() {
    if (!SUPABASE_CONFIGURED || !supabase) {
        playlistList.innerHTML = '<div class="mp-empty">Chưa cấu hình Supabase.</div>';
        [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = true; });
        if (uploadBtn) uploadBtn.disabled = true;
        return;
    }

    await refreshAudioLibrary();
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
});
loopBtn?.addEventListener('click', () => {
    const i = LOOP_MODES.indexOf(loopMode);
    loopMode = LOOP_MODES[(i + 1) % LOOP_MODES.length];
    updateLoopUI();
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
});
seek.addEventListener('input', () => {
    isSeeking = true;
    updateRangeFill(seek);
});
seek.addEventListener('change', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    isSeeking = false;
    updateRangeFill(seek);
});
playlistList.addEventListener('click', async (event) => {
    const item = event.target.closest('.mp-playlist-item');
    if (!item) return;
    index = Number(item.dataset.index || 0);
    await loadTrack();
    play();
});
audio.addEventListener('timeupdate', () => {
    timeCur.textContent = fmt(audio.currentTime);
    timeDur.textContent = fmt(audio.duration);
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

bootstrapMusic().catch(error => {
    console.error('Lỗi tải nhạc:', error);
    playlistList.innerHTML = `<div class="mp-empty">${escapeHtml(error.message)}</div>`;
});
