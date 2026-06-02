import { requireUser } from '../../_shared/auth.js';
import { errorJson, json, readJson } from '../../_shared/json.js';
import { deleteProductImageIfUnused } from '../../_shared/product-images.js';

const ALLOWED_FIELDS = [
    'category_id',
    'ten_san_pham',
    'gia',
    'so_luong',
    'con_hang',
    'da_mua',
    'hinh_san_pham',
    'ten_nhan_vat',
    'shop_ban',
    'nguoi_mua',
    'ngay_mua',
];

function normalizePatch(input) {
    const out = {};
    for (const field of ALLOWED_FIELDS) {
        if (!(field in input)) continue;
        if (['con_hang', 'da_mua'].includes(field)) out[field] = Number(Boolean(input[field]));
        else if (field === 'gia') out[field] = Number(input[field] || 0);
        else if (field === 'so_luong') out[field] = Math.max(1, Number(input[field] || 1));
        else if (field === 'category_id') out[field] = input[field] ? String(input[field]) : null;
        else out[field] = input[field] == null || input[field] === '' ? null : String(input[field]).trim();
    }
    return out;
}

export async function onRequestPatch({ request, env, params }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    let body;
    try {
        body = await readJson(request);
    } catch (error) {
        return errorJson(error.message, 400);
    }

    const patch = normalizePatch(body);
    const fields = Object.keys(patch);
    if (fields.length === 0) return errorJson('No fields to update.', 400);

    const oldProduct = await env.DB.prepare('SELECT id, hinh_san_pham FROM products WHERE id = ?')
        .bind(String(params.id))
        .first();
    if (!oldProduct) return errorJson('Product not found.', 404);

    const assignments = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => patch[field]);
    await env.DB.prepare(`UPDATE products SET ${assignments} WHERE id = ?`)
        .bind(...values, String(params.id))
        .run();

    const product = await env.DB.prepare(`
        SELECT products.*, categories.ten_danh_muc
        FROM products
        LEFT JOIN categories ON categories.id = products.category_id
        WHERE products.id = ?
    `).bind(String(params.id)).first();

    if (!product) return errorJson('Product not found.', 404);

    if (
        Object.prototype.hasOwnProperty.call(patch, 'hinh_san_pham') &&
        oldProduct.hinh_san_pham &&
        oldProduct.hinh_san_pham !== patch.hinh_san_pham
    ) {
        await deleteProductImageIfUnused(env, oldProduct.hinh_san_pham, String(params.id));
    }

    return json({ product });
}

export async function onRequestDelete({ request, env, params }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const product = await env.DB.prepare('SELECT id, hinh_san_pham FROM products WHERE id = ?')
        .bind(String(params.id))
        .first();
    if (!product) return errorJson('Product not found.', 404);

    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(String(params.id)).run();
    const imageDeleted = await deleteProductImageIfUnused(env, product.hinh_san_pham, String(params.id));

    return json({ ok: true, imageDeleted });
}
