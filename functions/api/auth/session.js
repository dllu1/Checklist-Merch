import { getSessionUser, publicUser } from '../../_shared/auth.js';
import { errorJson, json } from '../../_shared/json.js';

export async function onRequestGet({ request, env }) {
    const user = await getSessionUser(request, env);
    if (!user) {
        return errorJson('Authentication required.', 401);
    }

    return json({ user: publicUser(user) });
}
