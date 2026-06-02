import { requireUser, nowIso } from '../../_shared/auth.js';
import { errorJson, json, readJson } from '../../_shared/json.js';

function normalizeProductInput(input) {
    return {
        category_id: input.category_id ? String(input.category_id) : null,
        ten_san_pham: String(input.ten_san_pham || '').trim(),
        gia: Number(input.gia || 0),
        so_luong: Math.max(1, Number(input.so_luong || 1)),
        con_hang: input.con_hang == null ? 1 : Number(Boolean(input.con_hang)),
        da_mua: input.da_mua == null ? 0 : Number(Boolean(input.da_mua)),
        hinh_san_pham: input.hinh_san_pham ? String(input.hinh_san_pham) : null,
        ten_nhan_vat: input.ten_nhan_vat ? String(input.ten_nhan_vat).trim() : null,
        shop_ban: String(input.shop_ban || '').trim(),
        nguoi_mua: input.nguoi_mua ? String(input.nguoi_mua).trim() : null,
        ngay_mua: input.ngay_mua ? String(input.ngay_mua) : null,
    };
}

export async function onRequestGet({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const { results } = await env.DB.prepare(`
        SELECT products.*, categories.ten_danh_muc
        FROM products
        LEFT JOIN categories ON categories.id = products.category_id
        ORDER BY products.ngay_them DESC, products.id DESC
    `).all();

    return json({ products: results || [] });
}

export async function onRequestPost({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    let body;
    try {
        body = await readJson(request);
    } catch (error) {
        return errorJson(error.message, 400);
    }

    const product = normalizeProductInput(body);
    if (!product.ten_san_pham) return errorJson('Product name is required.', 400);

    const id = crypto.randomUUID();
    const ngay_them = nowIso();
    await env.DB.prepare(`
        INSERT INTO products (
            id, category_id, ten_san_pham, gia, so_luong, con_hang, da_mua,
            hinh_san_pham, ten_nhan_vat, shop_ban, nguoi_mua, ngay_mua, ngay_them
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        product.category_id,
        product.ten_san_pham,
        product.gia,
        product.so_luong,
        product.con_hang,
        product.da_mua,
        product.hinh_san_pham,
        product.ten_nhan_vat,
        product.shop_ban,
        product.nguoi_mua,
        product.ngay_mua,
        ngay_them
    ).run();

    return json({ product: { id, ...product, ngay_them } }, { status: 201 });
}
