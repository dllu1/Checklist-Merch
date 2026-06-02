import { requireUser } from '../../_shared/auth.js';
import { errorJson, json, readJson } from '../../_shared/json.js';

export async function onRequestGet({ request, env }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    const { results } = await env.DB.prepare(`
        SELECT *
        FROM categories
        ORDER BY ten_danh_muc ASC
    `).all();

    return json({ categories: results || [] });
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

    const ten_danh_muc = String(body.ten_danh_muc || '').trim();
    if (!ten_danh_muc) return errorJson('Category name is required.', 400);

    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO categories (id, ten_danh_muc) VALUES (?, ?)')
        .bind(id, ten_danh_muc)
        .run();

    return json({ category: { id, ten_danh_muc } }, { status: 201 });
}
