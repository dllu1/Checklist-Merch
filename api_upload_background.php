<?php
declare(strict_types=1);

// Make sure any stray PHP notice/warning never corrupts our JSON response.
ini_set('display_errors', '0');
error_reporting(E_ERROR | E_PARSE);
if (!ob_get_level()) ob_start();

require __DIR__ . '/db.php';

const ALLOWED_EXT = ['mp4', 'webm', 'gif'];
const MAX_SIZE    = 50 * 1024 * 1024; // 50 MB

/**
 * MIME types accepted from finfo per extension.
 *
 * Some MP4s detect as `application/octet-stream`, `video/quicktime`, or
 * `video/x-m4v` depending on the container/codec. We trust the extension when
 * the detected MIME shares the same major type (e.g. video/*) or is the
 * generic `application/octet-stream`.
 */
const ALLOWED_MIME_PER_EXT = [
    'mp4'  => ['video/mp4', 'application/mp4', 'video/quicktime', 'video/x-m4v'],
    'webm' => ['video/webm'],
    'gif'  => ['image/gif'],
];

function send_json(array $payload, int $status = 200): never
{
    if (ob_get_level() > 0) ob_end_clean();
    json_response($payload, $status);
}
function send_error(string $msg, int $status = 400): never
{
    send_json(['status' => 'error', 'message' => $msg], $status);
}

try {
    if (!isset($_FILES['bg']) || ($_FILES['bg']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $code = $_FILES['bg']['error'] ?? UPLOAD_ERR_NO_FILE;
        $messages = [
            UPLOAD_ERR_INI_SIZE   => 'File quá lớn so với upload_max_filesize của server.',
            UPLOAD_ERR_FORM_SIZE  => 'File quá lớn so với form limit.',
            UPLOAD_ERR_PARTIAL    => 'Upload không hoàn tất (mất kết nối giữa chừng).',
            UPLOAD_ERR_NO_FILE    => 'Không có file nào được gửi.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server không có thư mục tạm.',
            UPLOAD_ERR_CANT_WRITE => 'Server không thể ghi file.',
            UPLOAD_ERR_EXTENSION  => 'Một PHP extension đã chặn upload.',
        ];
        send_error($messages[$code] ?? ('Upload thất bại (code ' . $code . ').'), 400);
    }

    $file = $_FILES['bg'];
    $ext  = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, ALLOWED_EXT, true)) {
        send_error('Chỉ chấp nhận MP4, WebM hoặc GIF.', 400);
    }
    if ($file['size'] <= 0 || $file['size'] > MAX_SIZE) {
        send_error('File rỗng hoặc vượt quá 50 MB.', 400);
    }

    // Lenient MIME check: extension wins, but flag obviously-wrong content
    // (e.g. .mp4 that's actually text/html).
    if (function_exists('finfo_open')) {
        $finfo    = @finfo_open(FILEINFO_MIME_TYPE);
        $realMime = $finfo ? @finfo_file($finfo, (string)$file['tmp_name']) : null;
        // finfo resource is auto-cleaned by GC; finfo_close() is deprecated in PHP 8.4+

        if (is_string($realMime) && $realMime !== '') {
            $whitelist      = ALLOWED_MIME_PER_EXT[$ext] ?? [];
            $expectedPrefix = $ext === 'gif' ? 'image' : 'video';
            $actualPrefix   = explode('/', $realMime, 2)[0] ?? '';
            $isWhitelisted  = in_array($realMime, $whitelist, true);
            $isGenericBin   = $realMime === 'application/octet-stream';
            $isCorrectKind  = $actualPrefix === $expectedPrefix;

            if (!$isWhitelisted && !$isGenericBin && !$isCorrectKind) {
                send_error('Nội dung file không khớp đuôi mở rộng (' . $realMime . ').', 400);
            }
        }
    }

    $videoDir = __DIR__ . '/video';
    if (!is_dir($videoDir) && !@mkdir($videoDir, 0755, true)) {
        send_error('Không thể tạo thư mục video/.', 500);
    }

    $base = pathinfo((string)$file['name'], PATHINFO_FILENAME);
    $base = preg_replace('/[^A-Za-z0-9._-]+/u', '_', $base) ?: 'bg';
    $base = trim($base, '._-') ?: 'bg';

    $filename = $base . '.' . $ext;
    $counter  = 1;
    while (file_exists($videoDir . '/' . $filename)) {
        $filename = $base . '_' . $counter . '.' . $ext;
        $counter++;
    }

    $target = $videoDir . '/' . $filename;
    if (!@move_uploaded_file((string)$file['tmp_name'], $target)) {
        send_error('Không thể lưu file vào server.', 500);
    }

    send_json([
        'status' => 'success',
        'bg'     => [
            'name' => $filename,
            'url'  => 'video/' . rawurlencode($filename),
            'type' => in_array($ext, ['mp4', 'webm'], true) ? 'video' : 'image',
            'size' => (int)@filesize($target),
        ],
    ]);
} catch (Throwable $e) {
    send_error('Lỗi server: ' . $e->getMessage(), 500);
}
