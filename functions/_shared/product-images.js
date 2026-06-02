export function isProductImageObjectKey(value) {
    const key = String(value || '').trim();
    return Boolean(
        key &&
        key.startsWith('products/') &&
        !key.startsWith('http://') &&
        !key.startsWith('https://')
    );
}

export async function deleteProductImageIfUnused(env, key, excludingProductId = '') {
    if (!isProductImageObjectKey(key)) return false;

    const query = excludingProductId
        ? 'SELECT id FROM products WHERE hinh_san_pham = ? AND id <> ? LIMIT 1'
        : 'SELECT id FROM products WHERE hinh_san_pham = ? LIMIT 1';
    const bound = excludingProductId
        ? env.DB.prepare(query).bind(key, String(excludingProductId))
        : env.DB.prepare(query).bind(key);
    const stillUsed = await bound.first();

    if (stillUsed) return false;
    await env.PRODUCT_IMAGES.delete(key);
    return true;
}
