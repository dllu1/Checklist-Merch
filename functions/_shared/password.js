const PBKDF2_ITERATIONS = 100000;
const PBKDF2_HASH_BYTES = 32;

function textBytes(value) {
    return new TextEncoder().encode(String(value));
}

function bytesToBase64(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(String(value || ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength) return false;
    let diff = 0;
    for (let i = 0; i < a.byteLength; i += 1) diff |= a[i] ^ b[i];
    return diff === 0;
}

async function derivePassword(password, saltBase64, pepper) {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        textBytes(`${password}${pepper || ''}`),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt: base64ToBytes(saltBase64),
            iterations: PBKDF2_ITERATIONS,
        },
        keyMaterial,
        PBKDF2_HASH_BYTES * 8
    );

    return new Uint8Array(bits);
}

export function createPasswordSalt() {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return bytesToBase64(salt);
}

export async function hashPassword(password, pepper) {
    const salt = createPasswordSalt();
    const hash = await derivePassword(password, salt, pepper);
    return {
        password_hash: bytesToBase64(hash),
        password_salt: salt,
        iterations: PBKDF2_ITERATIONS,
    };
}

export async function verifyPassword(password, saltBase64, expectedHashBase64, pepper) {
    const actual = await derivePassword(password, saltBase64, pepper);
    const expected = base64ToBytes(expectedHashBase64);
    return timingSafeEqual(actual, expected);
}

export { PBKDF2_ITERATIONS };
