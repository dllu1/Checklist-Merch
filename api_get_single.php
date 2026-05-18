<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

try {
    $id = (int) ($_GET['id'] ?? 0);

    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        json_error('Không tìm thấy sản phẩm', 404);
    }

    json_response([
        'status'  => 'success',
        'product' => $product,
    ]);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
