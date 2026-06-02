export const SUPABASE_CONFIGURED = true;
export const CLOUDFLARE_CONFIGURED = true;
export const supabase = null;

const signedUrlCache = new Map();

export function requireSupabaseConfig() {
    return true;
}

async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const hasBody = options.body != null;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (hasBody && !isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(path, {
        credentials: 'include',
        ...options,
        headers,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
    }
    return data;
}

export async function getSession() {
    const data = await api('/api/auth/session');
    return data.user ? { user: data.user } : null;
}

function loginUrl(next = '') {
    const isStatic = !window.location.pathname.endsWith('.php');
    const target = isStatic ? 'login.html' : 'login.php';
    return next ? `${target}?next=${encodeURIComponent(next)}` : target;
}

export async function requireSession() {
    const session = await getSession().catch(() => null);
    if (!session) {
        window.location.href = loginUrl(window.location.pathname + window.location.search);
        return null;
    }
    return session;
}

export async function signOutAndRedirect() {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = loginUrl();
}

export function normalizeProduct(row) {
    return {
        ...row,
        da_mua: Boolean(row.da_mua),
        con_hang: Boolean(row.con_hang),
        ten_danh_muc: row.ten_danh_muc ?? null,
    };
}

export async function fetchProducts() {
    const data = await api('/api/products');
    return (data.products || []).map(normalizeProduct);
}

export async function fetchCategories() {
    const data = await api('/api/categories');
    return data.categories || [];
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
    if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('images/')) {
        return path || '';
    }

    const cacheKey = `${bucket}:${path}`;
    const cached = signedUrlCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 30000) return cached.url;

    const endpoint = bucket === 'audio' ? '/api/audio/access-url' : '/api/images/access-url';
    try {
        const data = await api(`${endpoint}?key=${encodeURIComponent(path)}&expiresIn=${encodeURIComponent(expiresIn)}`);
        signedUrlCache.set(cacheKey, {
            url: data.url,
            expiresAt: data.expiresAt ? Date.parse(data.expiresAt) : Date.now() + expiresIn * 1000,
        });
        return data.url;
    } catch (error) {
        console.warn(`Cannot create access URL for ${cacheKey}`, error);
        return '';
    }
}

export async function createProduct(payload) {
    const data = await api('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.product;
}

export async function updateProduct(id, payload) {
    const data = await api(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return data.product;
}

export async function deleteProductById(id) {
    await api(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createCategory(payload) {
    const data = await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.category;
}

export async function updateCategoryById(id, payload) {
    const data = await api(`/api/categories/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return data.category;
}

export async function deleteCategoryById(id) {
    await api(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function uploadProductImageFile(path, file, metadata = {}) {
    await api(`/api/images/upload-url?key=${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': metadata.contentType || file.type || 'application/octet-stream',
        },
        body: file,
    });
    return { path };
}

export async function fetchAudioTracks() {
    const data = await api('/api/audio');
    return data.tracks || [];
}

export async function uploadAudioFileToStorage(path, file, metadata = {}) {
    await api(`/api/audio?key=${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': metadata.contentType || file.type || 'application/octet-stream',
        },
        body: file,
    });
    return { path };
}

export async function deleteAudioTrack(path) {
    await api(`/api/audio?key=${encodeURIComponent(path)}`, { method: 'DELETE' });
}

export function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
