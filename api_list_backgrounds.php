<?php
declare(strict_types=1);

// Prevent PHP notices/warnings from corrupting the JSON response.
ini_set('display_errors', '0');
error_reporting(E_ERROR | E_PARSE);

require __DIR__ . '/db.php';

$videoDir = __DIR__ . '/video';
$files = is_dir($videoDir)
    ? (glob($videoDir . '/*.{mp4,webm,gif}', GLOB_BRACE) ?: [])
    : [];

$bgs = array_map(static function (string $path): array {
    $file = basename($path);
    $ext  = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    return [
        'name' => $file,
        'url'  => 'video/' . rawurlencode($file),
        'type' => in_array($ext, ['mp4', 'webm'], true) ? 'video' : 'image',
        'size' => filesize($path),
    ];
}, $files);

usort($bgs, static fn($a, $b) => strnatcasecmp($a['name'], $b['name']));

json_response([
    'status'      => 'success',
    'backgrounds' => array_values($bgs),
]);
