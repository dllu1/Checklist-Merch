import { requireUser } from '../../_shared/auth.js';
import { errorJson, json } from '../../_shared/json.js';

function parseRange(header, size) {
    if (!header) return null;
    const match = header.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) return null;

    const startRaw = match[1];
    const endRaw = match[2];
    if (!startRaw && !endRaw) return null;

    if (!startRaw) {
        const suffix = Number(endRaw);
        if (!Number.isFinite(suffix) || suffix <= 0) return null;
        const offset = Math.max(0, size - suffix);
        return { offset, length: size - offset };
    }

    const start = Number(startRaw);
    const end = endRaw ? Number(endRaw) : size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
    return {
        offset: start,
        length: Math.min(end, size - 1) - start + 1,
    };
}

export async function onRequest({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const key = url.searchParams.get('key') || '';
    if (!key) return errorJson('Missing audio key.', 400);

    if (request.method !== 'GET') return errorJson('Method not allowed.', 405);

    if (url.searchParams.get('raw') !== '1') {
        const expiresIn = Math.max(60, Math.min(3600, Number(url.searchParams.get('expiresIn') || 3600)));
        return json({
            url: `/api/audio/access-url?key=${encodeURIComponent(key)}&raw=1`,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        });
    }

    const head = await env.AUDIO.head(key);
    if (!head) return errorJson('Audio not found.', 404);

    const range = parseRange(request.headers.get('Range'), head.size);
    const object = await env.AUDIO.get(key, range ? { range } : undefined);
    if (!object) return errorJson('Audio not found.', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    headers.set('Accept-Ranges', 'bytes');

    if (range) {
        const end = range.offset + range.length - 1;
        headers.set('Content-Range', `bytes ${range.offset}-${end}/${head.size}`);
        headers.set('Content-Length', String(range.length));
        return new Response(object.body, { status: 206, headers });
    }

    headers.set('Content-Length', String(head.size));
    return new Response(object.body, { headers });
}
