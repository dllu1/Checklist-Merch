export const PRODUCT_IMAGE_RULES = {
    label: 'product image',
    maxSize: 5 * 1024 * 1024,
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    requireMagicBytes: true,
};

export const AUDIO_FILE_RULES = {
    label: 'audio file',
    maxSize: 25 * 1024 * 1024,
    extensions: ['mp3', 'm4a', 'ogg', 'wav'],
    mimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/x-wav'],
    requireMagicBytes: false,
};

const IMAGE_SIGNATURES = [
    {
        extension: 'jpg',
        mimeType: 'image/jpeg',
        matches: bytes => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    },
    {
        extension: 'png',
        mimeType: 'image/png',
        matches: bytes =>
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47 &&
            bytes[4] === 0x0d &&
            bytes[5] === 0x0a &&
            bytes[6] === 0x1a &&
            bytes[7] === 0x0a,
    },
    {
        extension: 'gif',
        mimeType: 'image/gif',
        matches: bytes => ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a',
    },
    {
        extension: 'webp',
        mimeType: 'image/webp',
        matches: bytes => ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP',
    },
];

function ascii(bytes, offset, length) {
    return String.fromCharCode(...bytes.slice(offset, offset + length));
}

export function getFileExtension(filename) {
    return String(filename || '')
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || '';
}

export async function sniffBlob(blob) {
    if (!(blob instanceof Blob)) {
        throw new Error('Upload data must be a valid Blob.');
    }

    const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
    const match = IMAGE_SIGNATURES.find(signature => signature.matches(bytes));

    return match
        ? { extension: match.extension, mimeType: match.mimeType }
        : { extension: '', mimeType: '' };
}

export async function validateFile(file, rules) {
    if (!(file instanceof File)) {
        throw new Error('Please choose a valid file.');
    }

    const extension = getFileExtension(file.name);
    if (!extension || !rules.extensions.includes(extension)) {
        throw new Error(`Only ${rules.extensions.join(', ')} files are accepted for ${rules.label}.`);
    }

    if (file.size <= 0) {
        throw new Error('The selected file is empty.');
    }
    if (file.size > rules.maxSize) {
        throw new Error(`${rules.label} exceeds the ${(rules.maxSize / 1024 / 1024).toFixed(0)}MB limit.`);
    }

    if (file.type && !rules.mimeTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}.`);
    }

    let sniffed = { extension: '', mimeType: file.type || '' };
    if (rules.requireMagicBytes) {
        sniffed = await sniffBlob(file);
        if (!sniffed.mimeType || !rules.mimeTypes.includes(sniffed.mimeType)) {
            throw new Error('File contents do not match a supported image format.');
        }

        const compatible = sniffed.extension === extension || (sniffed.extension === 'jpg' && extension === 'jpeg');
        if (!compatible) {
            throw new Error(`The .${extension} extension does not match ${sniffed.mimeType} content.`);
        }
    }

    return {
        file,
        extension: sniffed.extension || extension,
        contentType: sniffed.mimeType || file.type || 'application/octet-stream',
        metadata: {
            originalName: file.name,
            size: String(file.size),
            lastModified: String(file.lastModified || ''),
        },
    };
}

export function makeObjectUrl(file) {
    if (!(file instanceof Blob)) {
        throw new Error('Cannot preview data that is not a Blob.');
    }
    return URL.createObjectURL(file);
}

export function revokeObjectUrl(url) {
    if (url) URL.revokeObjectURL(url);
}

export function sanitizeBaseName(name, fallback = 'file') {
    const base = String(name || '')
        .replace(/\.[^.]+$/, '')
        .normalize('NFKD')
        .replace(/[^\w\s.()\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80);
    return base || fallback;
}

export function buildStoragePath(file, folder, extension, options = {}) {
    const safeExt = (extension || getFileExtension(file?.name) || 'bin').replace(/[^a-z0-9]/g, '') || 'bin';
    const fullId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    if (options.preserveName) {
        const shortId = fullId.replace(/-/g, '').slice(0, 8);
        const base = sanitizeBaseName(file?.name, 'audio');
        return `${folder}/${shortId}__${base}.${safeExt}`;
    }

    return `${folder}/${fullId}.${safeExt}`;
}

export async function uploadBlob(storageClient, bucket, path, blobOrFile, options = {}) {
    if (!(blobOrFile instanceof Blob)) {
        throw new Error('Upload data must be a File or Blob.');
    }

    const { data, error } = await storageClient
        .from(bucket)
        .upload(path, blobOrFile, {
            cacheControl: '3600',
            upsert: false,
            ...options,
        });

    if (error) throw error;
    return data;
}
