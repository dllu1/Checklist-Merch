import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const config = window.MERCH_SUPABASE || {};

export const SUPABASE_CONFIGURED = Boolean(
    config.url &&
    config.publishableKey &&
    !config.url.includes('YOUR_PROJECT_REF') &&
    !config.publishableKey.includes('YOUR_SUPABASE')
);

export const supabase = SUPABASE_CONFIGURED
    ? createClient(config.url, config.publishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    })
    : null;

const signedUrlCache = new Map();

export function requireSupabaseConfig() {
    if (!SUPABASE_CONFIGURED || !supabase) {
        throw new Error('Chưa cấu hình Supabase. Hãy cập nhật supabase-config.js.');
    }
}

export async function getSession() {
    requireSupabaseConfig();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

function loginUrl(next = '') {
    const isStatic = !window.location.pathname.endsWith('.php');
    const target = isStatic ? 'login.html' : 'login.php';
    return next ? `${target}?next=${encodeURIComponent(next)}` : target;
}

export async function requireSession() {
    const session = await getSession();
    if (!session) {
        window.location.href = loginUrl(window.location.pathname + window.location.search);
        return null;
    }
    return session;
}

export async function signOutAndRedirect() {
    requireSupabaseConfig();
    await supabase.auth.signOut();
    window.location.href = loginUrl();
}

export function normalizeProduct(row) {
    const category = row.categories || null;
    return {
        ...row,
        ten_danh_muc: category?.ten_danh_muc ?? row.ten_danh_muc ?? null,
    };
}

export async function fetchProducts() {
    requireSupabaseConfig();
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(ten_danh_muc)');
    if (error) throw error;
    return (data || []).map(normalizeProduct);
}

export async function fetchCategories() {
    requireSupabaseConfig();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('ten_danh_muc', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
    requireSupabaseConfig();
    if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('images/')) {
        return path || '';
    }

    const cacheKey = `${bucket}:${path}`;
    const cached = signedUrlCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 30000) return cached.url;

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
        console.warn(`Không tạo được signed URL cho ${cacheKey}`, error);
        return '';
    }

    signedUrlCache.set(cacheKey, {
        url: data.signedUrl,
        expiresAt: Date.now() + expiresIn * 1000,
    });
    return data.signedUrl;
}

export function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
