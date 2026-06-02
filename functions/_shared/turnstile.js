export async function verifyTurnstile(token, env, request) {
    const host = new URL(request.url).hostname;
    const isLocalDev = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    if (!token && isLocalDev) return true;

    const secret = String(env.TURNSTILE_SECRET_KEY || '').trim();
    if (!secret) {
        throw new Error('TURNSTILE_SECRET_KEY is not configured.');
    }
    if (!token) return { success: false, codes: ['missing-input-response'] };

    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token);

    const remoteIp = request.headers.get('CF-Connecting-IP');
    if (remoteIp) form.set('remoteip', remoteIp);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        return {
            success: false,
            codes: data['error-codes'] || [`siteverify-http-${response.status}`],
            hostname: data.hostname || '',
            action: data.action || '',
        };
    }
    return {
        success: Boolean(data.success),
        codes: data['error-codes'] || [],
        hostname: data.hostname || '',
        action: data.action || '',
    };
}
