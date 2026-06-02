import { requireUser } from '../../_shared/auth.js';
import { errorJson, json, readJson } from '../../_shared/json.js';

export async function onRequestPatch({ request, env, params }) {
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

    await env.DB.prepare('UPDATE categories SET ten_danh_muc = ? WHERE id = ?')
        .bind(ten_danh_muc, String(params.id))
        .run();

    return json({ category: { id: String(params.id), ten_danh_muc } });
}

export async function onRequestDelete({ request, env, params }) {
    const auth = await requireUser(request, env);
    if (auth.response) return auth.response;

    await env.DB.batch([
        env.DB.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').bind(String(params.id)),
        env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(String(params.id)),
    ]);

    return json({ ok: true });
}
