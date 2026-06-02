import { requireUser } from '../../_shared/auth.js';
import { errorJson, json } from '../../_shared/json.js';

export async function onRequest({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const url = new URL(request.url);
    const key = url.searchParams.get('key') || '';
    if (!key) return errorJson('Missing image key.', 400);

    if (request.method !== 'GET') return errorJson('Method not allowed.', 405);

    if (url.searchParams.get('raw') !== '1') {
        const head = await env.PRODUCT_IMAGES.head(key);
        if (!head) return errorJson('Image not found.', 404);

        const expiresIn = Math.max(60, Math.min(3600, Number(url.searchParams.get('expiresIn') || 3600)));
        return json({
            url: `/api/images/access-url?key=${encodeURIComponent(key)}&raw=1`,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        });
    }

    const object = await env.PRODUCT_IMAGES.get(key);
    if (!object) return errorJson('Image not found.', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    return new Response(object.body, { headers });
}
