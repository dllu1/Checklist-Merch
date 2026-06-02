export const SESSION_COOKIE = 'merch_session';

export function parseCookies(request) {
    const header = request.headers.get('Cookie') || '';
    const cookies = {};

    for (const part of header.split(';')) {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (!rawName) continue;
        cookies[rawName] = decodeURIComponent(rawValue.join('=') || '');
    }

    return cookies;
}

export function sessionCookie(value, maxAgeSeconds) {
    const parts = [
        `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        `Max-Age=${Math.max(0, Number(maxAgeSeconds) || 0)}`,
    ];
    return parts.join('; ');
}

export function clearSessionCookie() {
    return sessionCookie('', 0);
}
