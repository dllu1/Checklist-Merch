<?php
declare(strict_types=1);

// Prevent PHP notices/warnings from corrupting the JSON response.
ini_set('display_errors', '0');
error_reporting(E_ERROR | E_PARSE);

require __DIR__ . '/db.php';

$payload = json_decode(file_get_contents('php://input') ?: '[]', true);
$name    = isset($payload['name']) ? (string)$payload['name'] : '';

if ($name === '') {
    json_error('Thiếu tên file.', 400);
}

// Defence-in-depth: prevent traversal / path injection.
$safeName = basename($name);
if ($safeName !== $name || str_contains($safeName, '/') || str_contains($safeName, '\\')) {
    json_error('Tên file không hợp lệ.', 400);
}

$ext = strtolower(pathinfo($safeName, PATHINFO_EXTENSION));
if (!in_array($ext, ['mp4', 'webm', 'gif'], true)) {
    json_error('Chỉ xoá được file MP4, WebM hoặc GIF.', 400);
}

$path = __DIR__ . '/video/' . $safeName;
if (!is_file($path)) {
    json_error('File không tồn tại.', 404);
}

if (!unlink($path)) {
    json_error('Không thể xoá file.', 500);
}

json_response(['status' => 'success', 'name' => $safeName]);
