function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

function textBytes(value) {
    return new TextEncoder().encode(String(value));
}

function encodePath(value) {
    return String(value)
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/');
}

function amzDates(now = new Date()) {
    const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    return {
        amzDate: iso,
        dateStamp: iso.slice(0, 8),
    };
}

async function hmac(key, value) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        typeof key === 'string' ? textBytes(key) : key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    return crypto.subtle.sign('HMAC', cryptoKey, textBytes(value));
}

async function sha256Hex(value) {
    return bytesToHex(await crypto.subtle.digest('SHA-256', textBytes(value)));
}

async function signingKey(secretAccessKey, dateStamp) {
    const dateKey = await hmac(`AWS4${secretAccessKey}`, dateStamp);
    const regionKey = await hmac(dateKey, 'auto');
    const serviceKey = await hmac(regionKey, 's3');
    return hmac(serviceKey, 'aws4_request');
}

function credentialEnv(env) {
    return {
        accountId: env.R2_ACCOUNT_ID || '',
        accessKeyId: env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: env.R2_SECRET_ACCESS_KEY || '',
    };
}

export function canPresignR2(env) {
    const credentials = credentialEnv(env);
    return Boolean(credentials.accountId && credentials.accessKeyId && credentials.secretAccessKey);
}

export async function createR2PresignedGetUrl(env, bucketName, key, expiresIn = 3600) {
    const credentials = credentialEnv(env);
    if (!canPresignR2(env)) {
        throw new Error('R2 presign credentials are not configured.');
    }

    const expires = Math.max(60, Math.min(3600, Number(expiresIn) || 3600));
    const host = `${credentials.accountId}.r2.cloudflarestorage.com`;
    const { amzDate, dateStamp } = amzDates();
    const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
    const credential = `${credentials.accessKeyId}/${credentialScope}`;
    const canonicalUri = `/${encodePath(bucketName)}/${encodePath(key)}`;

    const query = new URLSearchParams({
        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
        'X-Amz-Credential': credential,
        'X-Amz-Date': amzDate,
        'X-Amz-Expires': String(expires),
        'X-Amz-SignedHeaders': 'host',
    });
    query.sort();

    const canonicalRequest = [
        'GET',
        canonicalUri,
        query.toString(),
        `host:${host}\n`,
        'host',
        'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        await sha256Hex(canonicalRequest),
    ].join('\n');

    const keyBytes = await signingKey(credentials.secretAccessKey, dateStamp);
    const signature = bytesToHex(await hmac(keyBytes, stringToSign));
    query.set('X-Amz-Signature', signature);

    return {
        url: `https://${host}${canonicalUri}?${query.toString()}`,
        expiresAt: new Date(Date.now() + expires * 1000).toISOString(),
    };
}
