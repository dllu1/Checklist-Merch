<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

try {
    $data = json_decode(file_get_contents('php://input') ?: '', true, flags: JSON_THROW_ON_ERROR);
    $id = (int) ($data['id'] ?? 0);

    if ($id <= 0) {
        json_error('Thiếu ID hợp lệ');
    }

    $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);

    json_response(['status' => 'success']);
} catch (Throwable $e) {
    json_error($e->getMessage(), 500);
}
