import { clearSessionCookie, parseCookies, SESSION_COOKIE } from '../../_shared/cookies.js';
import { json } from '../../_shared/json.js';

export async function onRequestPost({ request, env }) {
    const sessionId = parseCookies(request)[SESSION_COOKIE];
    if (sessionId) {
        await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    }

    return json(
        { ok: true },
        {
            headers: {
                'Set-Cookie': clearSessionCookie(),
            },
        }
    );
}
