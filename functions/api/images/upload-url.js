import { requireUser } from '../../_shared/auth.js';
import { errorJson, json } from '../../_shared/json.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const form = await request.formData();
    const path = String(form.get('path') || '').trim();
    const file = form.get('file');

    if (!path || !path.startsWith('products/')) return errorJson('Invalid image path.', 400);
    if (!file || typeof file !== 'object' || typeof file.size !== 'number' || typeof file.stream !== 'function') {
        return errorJson('Image file is required.', 400);
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return errorJson('Image must be between 1 byte and 5MB.', 400);
    if (file.type && !IMAGE_TYPES.has(file.type)) return errorJson('Unsupported image type.', 400);

    await env.PRODUCT_IMAGES.put(path, file.stream(), {
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

    if (!path || !path.startsWith('products/')) return errorJson('Invalid image path.', 400);
    if (!request.body) return errorJson('Image file is required.', 400);
    if (contentLength > MAX_IMAGE_BYTES) return errorJson('Image must be 5MB or smaller.', 400);
    if (contentType && !IMAGE_TYPES.has(contentType)) return errorJson('Unsupported image type.', 400);

    await env.PRODUCT_IMAGES.put(path, request.body, {
        httpMetadata: {
            contentType,
            cacheControl: 'public, max-age=3600',
        },
    });

    return json({ path });
}
