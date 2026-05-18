<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

try {
    $categories = db()
        ->query('SELECT * FROM categories ORDER BY ten_danh_muc ASC')
        ->fetchAll();

    json_response([
        'status'     => 'success',
        'categories' => $categories,
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
