import {
    SUPABASE_CONFIGURED,
    supabase,
    getSignedUrl,
    escapeHtml,
} from './supabase_client.js';

const AUDIO_BUCKET = 'audio';
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'ogg', 'wav'];

const audio = new Audio();
audio.preload = 'metadata';

const fab = document.getElementById('mp-fab');
const fabInner = document.getElementById('mp-fab-inner');
const card = document.getElementById('mp-card');
const closeBtn = document.getElementById('mp-close');
const playBtn = document.getElementById('mp-play');
const prevBtn = document.getElementById('mp-prev');
const nextBtn = document.getElementById('mp-next');
const volume = document.getElementById('mp-volume');
const seek = document.getElementById('mp-seek');
const titleEl = document.getElementById('mp-title');
const artistEl = document.getElementById('mp-artist');
const timeCur = document.getElementById('mp-time-cur');
const timeDur = document.getElementById('mp-time-dur');
const disc = document.getElementById('mp-disc');
const playlistList = document.getElementById('mp-playlist-list');
const playlistCount = document.getElementById('mp-playlist-count');

let tracks = [];
let index = 0;
let playing = false;
let isSeeking = false;

audio.volume = Number(volume.value || 0.5);

function fmt(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function trackTitle(name) {
    return name
        .replace(/\.[^.]+$/, '')
        .replace(/\s*\[[A-Za-z0-9_-]+\]\s*$/, '')
        .trim();
}

function setPlaying(next) {
    playing = next;
    playBtn.textContent = playing ? '⏸' : '▶';
    fab.setAttribute('data-playing', playing ? 'true' : 'false');
    fabInner.textContent = playing ? '▮▮' : '🎵';
    disc.classList.toggle('paused', !playing);
}

function renderPlaylist() {
    playlistCount.textContent = `${tracks.length} bài`;
    if (tracks.length === 0) {
        playlistList.innerHTML = '<div class="mp-empty">Chưa có file nhạc trong bucket audio.</div>';
        titleEl.textContent = 'Chưa có nhạc';
        artistEl.textContent = 'Upload file vào Supabase Storage bucket audio';
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

async function loadTrack(resumeAt = 0) {
    const track = tracks[index];
    if (!track) return;

    audio.src = await getSignedUrl(AUDIO_BUCKET, track.path, 3600);
    titleEl.textContent = track.title;
    artistEl.textContent = 'Frost & Petal · Supabase audio';
    seek.value = 0;
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

async function bootstrapMusic() {
    if (!SUPABASE_CONFIGURED || !supabase) {
        playlistList.innerHTML = '<div class="mp-empty">Chưa cấu hình Supabase.</div>';
        [playBtn, prevBtn, nextBtn, seek].forEach(el => { el.disabled = true; });
        return;
    }

    tracks = await listAudio();
    index = 0;
    renderPlaylist();
    if (tracks.length > 0) await loadTrack();
}

fab.addEventListener('click', () => card.classList.toggle('open'));
closeBtn.addEventListener('click', () => card.classList.remove('open'));
playBtn.addEventListener('click', () => (playing ? pause() : play()));
prevBtn.addEventListener('click', async () => {
    if (tracks.length === 0) return;
    index = (index - 1 + tracks.length) % tracks.length;
    await loadTrack();
    if (playing) play();
});
nextBtn.addEventListener('click', async () => {
    if (tracks.length === 0) return;
    index = (index + 1) % tracks.length;
    await loadTrack();
    if (playing) play();
});
volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
});
seek.addEventListener('input', () => {
    isSeeking = true;
});
seek.addEventListener('change', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    isSeeking = false;
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
    }
});
audio.addEventListener('ended', async () => {
    if (tracks.length === 0) return;
    index = (index + 1) % tracks.length;
    await loadTrack();
    play();
});

bootstrapMusic().catch(error => {
    console.error('Lỗi tải nhạc:', error);
    playlistList.innerHTML = `<div class="mp-empty">${escapeHtml(error.message)}</div>`;
});
