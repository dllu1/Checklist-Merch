import { sessionCookie } from '../../_shared/cookies.js';
import { SESSION_MAX_AGE_SECONDS, nowIso, publicUser, sessionExpiryIso } from '../../_shared/auth.js';
import { errorJson, json, readJson } from '../../_shared/json.js';
import { verifyPassword } from '../../_shared/password.js';
import { verifyTurnstile } from '../../_shared/turnstile.js';

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

export async function onRequestPost({ request, env }) {
    let body;
    try {
        body = await readJson(request);
    } catch (error) {
        return errorJson(error.message, 400);
    }

    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const turnstileToken = body.turnstileToken || body.cfTurnstileResponse || body.token || '';

    if (!email || !password) {
        return errorJson('Email and password are required.', 400);
    }

    let turnstileResult = { success: false, codes: [] };
    try {
        turnstileResult = await verifyTurnstile(turnstileToken, env, request);
    } catch (error) {
        return errorJson(error.message, 500);
    }
    if (!turnstileResult.success) {
        console.warn('Turnstile verification failed', {
            codes: turnstileResult.codes,
            hostname: turnstileResult.hostname,
            hasToken: Boolean(turnstileToken),
        });
        return errorJson('Turnstile verification failed.', 403, {
            turnstileCodes: turnstileResult.codes,
        });
    }

    const user = await env.DB.prepare(`
        SELECT id, email, password_hash, password_salt
        FROM users
        WHERE email = ?
        LIMIT 1
    `).bind(email).first();

    if (!user) {
        return errorJson('Email or password is incorrect.', 401);
    }

    const passwordOk = await verifyPassword(
        password,
        user.password_salt,
        user.password_hash,
        env.PASSWORD_PEPPER || ''
    );

    if (!passwordOk) {
        return errorJson('Email or password is incorrect.', 401, {
            authCode: 'invalid_password',
        });
    }

    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at <= ?')
        .bind(user.id, nowIso())
        .run();

    const sessionId = crypto.randomUUID();
    await env.DB.prepare(`
        INSERT INTO sessions (id, user_id, expires_at, created_at)
        VALUES (?, ?, ?, ?)
    `).bind(sessionId, user.id, sessionExpiryIso(), nowIso()).run();

    return json(
        { user: publicUser(user) },
        {
            headers: {
                'Set-Cookie': sessionCookie(sessionId, SESSION_MAX_AGE_SECONDS),
            },
        }
    );
}
