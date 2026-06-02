import { requireUser } from '../../_shared/auth.js';
import { errorJson, json } from '../../_shared/json.js';

const AUDIO_TYPES = new Set([
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',
    'audio/aac',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/flac',
    'audio/x-flac',
    '',
]);
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function titleFromPath(path) {
    return String(path).split('/').pop().replace(/\.[^.]+$/, '').replace(/^[a-f0-9]{6,}__/i, '').trim();
}

function isUploadedFile(value) {
    return value && typeof value === 'object' && typeof value.size === 'number' && typeof value.stream === 'function';
}

export async function onRequestGet({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const listed = await env.AUDIO.list({ prefix: 'tracks/' });
    const tracks = listed.objects.map(object => ({
        path: object.key,
        title: titleFromPath(object.key),
    }));

    return json({ tracks });
}

export async function onRequestPost({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const form = await request.formData();
    const path = String(form.get('path') || '').trim();
    const file = form.get('file');

    if (!path || !path.startsWith('tracks/')) return errorJson('Invalid audio path.', 400);
    if (!isUploadedFile(file)) return errorJson('Audio file is required.', 400);
    if (file.size <= 0 || file.size > MAX_AUDIO_BYTES) return errorJson('Audio must be between 1 byte and 25MB.', 400);
    if (file.type && !AUDIO_TYPES.has(file.type)) return errorJson('Unsupported audio type.', 400);

    await env.AUDIO.put(path, file.stream(), {
        httpMetadata: {
            contentType: file.type || 'application/octet-stream',
            cacheControl: 'public, max-age=3600',
        },
        customMetadata: {
            originalName: file.name || '',
        },
    });

    return json({ path });
}

export async function onRequestPut({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const path = String(url.searchParams.get('key') || '').trim();
    const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
    const contentLength = Number(request.headers.get('Content-Length') || 0);

    if (!path || !path.startsWith('tracks/')) return errorJson('Invalid audio path.', 400);
    if (!request.body) return errorJson('Audio file is required.', 400);
    if (contentLength > MAX_AUDIO_BYTES) return errorJson('Audio must be 25MB or smaller.', 400);
    if (contentType && !AUDIO_TYPES.has(contentType)) return errorJson('Unsupported audio type.', 400);

    await env.AUDIO.put(path, request.body, {
        httpMetadata: {
            contentType,
            cacheControl: 'public, max-age=3600',
        },
    });

    return json({ path });
}

export async function onRequestDelete({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const key = url.searchParams.get('key') || '';
    if (!key) return errorJson('Missing audio key.', 400);

    await env.AUDIO.delete(key);
    return json({ ok: true });
}
