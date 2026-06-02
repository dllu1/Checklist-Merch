import { parseCookies, SESSION_COOKIE } from './cookies.js';
import { errorJson } from './json.js';

export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function nowIso() {
    return new Date().toISOString();
}

export function sessionExpiryIso() {
    return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
}

export function publicUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
    };
}

export async function getSessionUser(request, env) {
    const sessionId = parseCookies(request)[SESSION_COOKIE];
    if (!sessionId) return null;

    const row = await env.DB.prepare(`
        SELECT users.id, users.email, sessions.id AS session_id, sessions.expires_at
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = ? AND sessions.expires_at > ?
        LIMIT 1
    `).bind(sessionId, nowIso()).first();

    return row || null;
}

export async function requireUser(request, env) {
    const user = await getSessionUser(request, env);
    if (!user) {
        return {
            user: null,
            response: errorJson('Authentication required.', 401),
        };
    }
    return { user, response: null };
}
