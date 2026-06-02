export function json(data, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json; charset=utf-8');

    return new Response(JSON.stringify(data), {
        ...init,
        headers,
    });
}

export function errorJson(message, status = 400, extra = {}) {
    return json({ error: true, message, ...extra }, { status });
}

export async function readJson(request) {
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
        throw new Error('Expected application/json request body.');
    }
    return request.json();
}
